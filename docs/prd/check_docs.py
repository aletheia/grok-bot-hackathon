#!/usr/bin/env python3
"""Check the PRD planning docs: source hash, requirement coverage, internal links."""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
SOURCE = ROOT / "source" / "hackathon-platform-prd-v0.1.docx"
PNG = ROOT / "source" / "media" / "superfici-e-core.png"
DOCX_SHA = "a7ae33ef5d875e60711d4a299e482e697d759d885b4842b29c265a9f55d628f6"
PNG_SHA = "d70d5987e35f29d89d05233aa284832253bd790d0b7b98a8174bf8a44b8b74c6"

REQ_RE = re.compile(r"\b(ORG|EVT|APP|TEAM)-(\d{2})\b")
FEAT_RE = re.compile(r"\bFEAT-[A-Z0-9]+(?:-[A-Z0-9]+)*\b")
ANCHOR_RE = re.compile(r'<a id="([^"]+)"></a>')
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")

REQUIRED = (
    [f"ORG-{i:02d}" for i in range(1, 9)]
    + [f"EVT-{i:02d}" for i in range(1, 14)]
    + [f"APP-{i:02d}" for i in range(1, 12)]
    + [f"TEAM-{i:02d}" for i in range(1, 14)]
)

ADR_FILES = [
    "0001-tenancy-single-deployment.md",
    "0002-event-url-path.md",
    "0003-magic-link-and-otp-fallback.md",
    "0004-global-account-and-memberships.md",
    "0005-registration-native-or-luma.md",
    "0006-luma-key-per-organization.md",
    "0007-modular-monolith-outbox.md",
    "0008-event-scoped-teams.md",
    "0009-configurable-criteria-authenticated-jury.md",
    "0010-deliverable-and-leaderboard-publication.md",
    "0011-v1-exclusions.md",
    "0012-privacy-retention-export.md",
    "0013-team-invite-does-not-admit.md",
    "0014-deterministic-team-name-logo.md",
    "0015-stay-in-this-repository.md",
    "0016-pstack-vendoring.md",
    "0017-hosting-v1.md",
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def anchors(text: str) -> set[str]:
    found = set(ANCHOR_RE.findall(text))
    for line in text.splitlines():
        if line.startswith("#"):
            title = re.sub(r"^#+\s*", "", line).strip().lower()
            slug = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
            slug = re.sub(r"\s+", "-", slug).strip("-")
            if slug:
                found.add(slug)
    return found


def main() -> int:
    errors: list[str] = []

    if sha256(SOURCE) != DOCX_SHA:
        errors.append(f"DOCX hash mismatch: {sha256(SOURCE)}")
    if sha256(PNG) != PNG_SHA:
        errors.append(f"PNG hash mismatch: {sha256(PNG)}")

    sums = (ROOT / "source" / "SHA256SUMS").read_text(encoding="utf-8")
    if DOCX_SHA not in sums or PNG_SHA not in sums:
        errors.append("SHA256SUMS is missing a recorded hash")

    transcription = read(ROOT / "hackathon-platform-prd-v0.1.md")
    features = read(ROOT / "features.md")
    trace = read(ROOT / "traceability.md")
    backlog = read(ROOT / "backlog.md")
    index = read(ROOT / "adr" / "README.md")

    present = set(REQ_RE.findall(transcription))
    # findall with two groups returns tuples
    present_ids = {f"{kind}-{num}" for kind, num in REQ_RE.findall(transcription)}
    for req in REQUIRED:
        if req not in present_ids:
            errors.append(f"{req} missing from transcription")
        if req not in features:
            errors.append(f"{req} missing from features.md")
        if req not in trace:
            errors.append(f"{req} missing from traceability.md")

    feature_ids = []
    for match in re.finditer(r"^## (FEAT-[A-Z0-9-]+) —", features, re.M):
        feature_ids.append(match.group(1))
    if len(feature_ids) != len(set(feature_ids)):
        errors.append("duplicate feature heading")
    for feat in feature_ids:
        if feat not in trace:
            errors.append(f"{feat} missing from traceability.md")
        if feat not in backlog:
            errors.append(f"{feat} missing from backlog.md")

    for name in ADR_FILES:
        path = ROOT / "adr" / name
        if not path.is_file():
            errors.append(f"missing ADR {name}")
            continue
        text = read(path)
        for section in ("## Contesto", "## Opzioni", "## Decisione", "## Conseguenze", "## Verifica", "## Fonti"):
            if section not in text:
                errors.append(f"{name} missing {section}")
        if "Accepted" in text.split("## Decisione", 1)[-1].split("##", 1)[0]:
            errors.append(f"{name} uses Accepted inside Decisione")
        if name not in index:
            errors.append(f"{name} missing from ADR index")

    md_files = list(ROOT.rglob("*.md"))
    cache: dict[Path, set[str]] = {}
    for path in md_files:
        text = read(path)
        cache[path] = anchors(text)
        for raw in LINK_RE.findall(text):
            target = raw.strip()
            if target.startswith(("http://", "https://", "mailto:")):
                continue
            if target.startswith("#"):
                frag = target[1:]
                if frag and frag not in cache[path]:
                    errors.append(f"{path.relative_to(REPO)}: missing local anchor #{frag}")
                continue
            file_part, _, frag = target.partition("#")
            dest = (path.parent / file_part).resolve()
            if not dest.is_file():
                errors.append(f"{path.relative_to(REPO)}: missing file {target}")
                continue
            if frag:
                if dest not in cache:
                    cache[dest] = anchors(read(dest)) if dest.suffix == ".md" else set()
                if dest.suffix == ".md" and frag not in cache[dest]:
                    errors.append(f"{path.relative_to(REPO)}: missing anchor {target}")

    print(f"docx {DOCX_SHA}")
    print(f"png  {PNG_SHA}")
    print(f"requirements {len(REQUIRED)}")
    print(f"features {len(feature_ids)}")
    print(f"adrs {len(ADR_FILES)}")
    if errors:
        print(f"FAILED {len(errors)}")
        for err in errors:
            print(f" - {err}")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
