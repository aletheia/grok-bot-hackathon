# Hackathon Platform — documentazione di planning

<a id="readme"></a>

Questa cartella converte la PRD v0.1 in feature e ADR. Non implementa il prodotto, non vendorizzza pstack, non modifica la [PR #22](https://github.com/aletheia/grok-bot-hackathon/pull/22) e non tocca produzione.

La PRD è in italiano. Questi documenti restano in italiano per tenere gli stessi termini (Console Organizzatore, App evento, Portale Team) e gli stessi ID.

| Documento | Contenuto |
| --- | --- |
| [source/hackathon-platform-prd-v0.1.docx](source/hackathon-platform-prd-v0.1.docx) | Fonte byte-per-byte. SHA-256 `a7ae33ef5d875e60711d4a299e482e697d759d885b4842b29c265a9f55d628f6` |
| [source/SHA256SUMS](source/SHA256SUMS) | Somme del DOCX e della figura estratta |
| [hackathon-platform-prd-v0.1.md](hackathon-platform-prd-v0.1.md) | Trascrizione fedele, tabelle incluse, con provenienza |
| [features.md](features.md) | 36 feature con criteri verificabili, fasi, fuori scope |
| [traceability.md](traceability.md) | Matrice di tutti gli ID ORG, EVT, APP, TEAM e dei requisiti senza ID |
| [adr/README.md](adr/README.md) | 17 ADR. Proposed, Confirmed in PRD, o Unresolved |
| [gaps-and-questions.md](gaps-and-questions.md) | Conflitti, assunti, domande per Luca |
| [backlog.md](backlog.md) | Issue pronte da importare. Nessuna issue GitHub è stata creata: il tracker è disabilitato |

Controllo locale:

```bash
python3 docs/prd/check_docs.py
sha256sum -c docs/prd/source/SHA256SUMS
```

Il secondo comando va lanciato da `docs/prd/source`.
