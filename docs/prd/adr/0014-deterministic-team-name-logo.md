# ADR-0014 — Nome e logo del team deterministici

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-TEAM-01](../features.md#feat-team-01), [FEAT-TEAM-02](../features.md#feat-team-02)

## Contesto

TEAM-03 chiede un nome precompilato, già libero, rigenerabile, 3–40 caratteri, unico nell'evento senza distinzione di maiuscole. TEAM-04 chiede un logo di default generato dal team, con i colori dell'evento, rigenerabile, oppure un upload PNG, JPEG o WebP entro 2 MB, ritaglio quadrato. Il logo è obbligatorio ma non blocca la creazione.

La fonte raccomanda un generatore deterministico: liste di parole per il nome, forma geometrica con iniziali calcolata dall'id del team sulla palette. Un modello di immagini è un'aggiunta successiva, con un budget per evento. Non è in v1.

## Opzioni

1. Generatore deterministico, senza rete e senza modello. Raccomandazione. Costo zero, risposta immediata, niente moderazione del generato.
2. Modello generativo di immagini. La fonte lo rimanda, con budget.
3. Nessun default: l'owner deve caricare un logo prima di creare il team. Contraddice «mai bloccante».

Le liste di parole non sono nella PRD. Sceglierle è lavoro di implementazione, con il vincolo che non introducano marchi o nomi di persone reali. Non compilare la lista in questa ADR.

## Decisione

Nessuna. Proposed. Lo storage del file caricato è a parte: la figura cita object storage, la prosa no. Vedi [domande](../gaps-and-questions.md#domande).

## Conseguenze

Lo stesso id di team sulla stessa palette produce lo stesso logo, finché non si rigenera. «Rigenerabile» implica un seme che l'owner può cambiare, altrimenti il determinismo impedisce la rigenerazione. La fonte non dice dove vive quel seme. Va esplicitato in implementazione, non deciso qui con un campo a caso.

Upload: SVG rifiutati o sanitizzati (NFR). TEAM-04 non elenca SVG fra i formati accettati, quindi il rifiuto è la lettura coerente. Moderazione admin del logo: TEAM-13, P1.

Accesso: il logo pubblico compare sulla scheda deliverable (APP-07). Un upload è contenuto dell'utente.

## Verifica

Test: due letture dello stesso seme danno la stessa immagine; un PNG da 2 MB passa; 2 MB più un byte no; un SVG no; la creazione senza upload ha già un logo. Non scritti.

## Fonti

- [Nome e logo generati](../hackathon-platform-prd-v0.1.md#nome-e-logo)
- [TEAM-03](../hackathon-platform-prd-v0.1.md#team-03), [TEAM-04](../hackathon-platform-prd-v0.1.md#team-04)
- [NFR Sicurezza](../hackathon-platform-prd-v0.1.md#nfr)
