/**
 * Copy text to the clipboard. Resolves "copied" or "failed" and never throws, so the caller can show
 * feedback either way. Tries the async Clipboard API first, then the legacy execCommand path (older
 * browsers, non-secure contexts, or a denied permission).
 */
export type ClipboardDeps = {
  writeText?: (text: string) => Promise<void>;
  legacyCopy?: (text: string) => boolean;
};

function defaultWriteText(): ClipboardDeps["writeText"] {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return undefined;
  return (text) => navigator.clipboard.writeText(text);
}

function defaultLegacyCopy(): ClipboardDeps["legacyCopy"] {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") return undefined;
  return (text) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    try {
      area.select();
      return document.execCommand("copy");
    } finally {
      document.body.removeChild(area);
    }
  };
}

export async function copyToClipboard(text: string, deps: ClipboardDeps = {}): Promise<"copied" | "failed"> {
  const writeText = deps.writeText ?? defaultWriteText();
  const legacyCopy = deps.legacyCopy ?? defaultLegacyCopy();
  if (writeText) {
    try {
      await writeText(text);
      return "copied";
    } catch {
      // fall through to the legacy path
    }
  }
  if (legacyCopy) {
    try {
      if (legacyCopy(text)) return "copied";
    } catch {
      // fall through
    }
  }
  return "failed";
}
