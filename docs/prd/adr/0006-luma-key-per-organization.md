# ADR-0006 — Luma API key per organizzazione

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-ORG-04](../features.md#feat-org-04), [FEAT-NFR-03](../features.md#feat-nfr-03)

## Contesto

Oggi `LUMA_API_KEY` è una variabile d'ambiente di tutta l'app e `LUMA_EVENT_API_ID` seleziona un evento. La PRD raccomanda un segreto di organizzazione, cifrato, write-only, solo lato server. È two-way door. Non è nella frase di conferma. L'assunto di lavoro è una key, quindi un calendario Luma, per organizzazione. Più calendari sono P1.

La fonte riporta vincoli letti dalla documentazione Luma il 6 nov 2026: Luma Plus sul calendario, key di calendario, 200 richieste al minuto per calendario. Quei vincoli non sono stati ri-verificati in questa lettura oltre al link già citato dalla PRD.

## Opzioni

1. Segreto per organizzazione, cifrato a riposo, mai in risposta e mai nei log. Verifica al salvataggio, ultimi 4 caratteri, data, sostituzione, revoca. Raccomandazione.
2. Key in variabile d'ambiente, come oggi. La fonte la scarta per il prodotto: sarebbe una sola per tutta la piattaforma.
3. Key per evento. Non è la raccomandazione. La fonte lega la key all'organizzazione e l'event id all'evento.

## Decisione

Nessuna. Proposed. Non cifrare «in qualche modo» senza una scelta esplicita di algoritmo e di gestione della chiave di cifratura: anche quella scelta è aperta, e non va inventata qui.

## Conseguenze

La 2FA è richiesta prima di salvare il segreto (ORG-01). Revocare la key non cancella le registrazioni già importate. Un test deve dimostrare che la key non esce nel JSON e non finisce nei log.

Accesso: la key di un'organizzazione non chiama Luma per gli eventi di un'altra. Deployment: il segreto smette di vivere solo in Vercel env quando questa ADR sarà accettata; fino ad allora l'env attuale resta il meccanismo vero.

## Verifica

Test di round-trip: salvataggio, assenza nel body di lettura, verifica Luma mockata, revoca, tentativo di sync successivo che si ferma e mostra l'avviso. Non implementato.

## Fonti

- [Tabella decisioni, riga Luma API key](../hackathon-platform-prd-v0.1.md#tabella-decisioni)
- [ORG-06](../hackathon-platform-prd-v0.1.md#org-06)
- [NFR Segreti](../hackathon-platform-prd-v0.1.md#nfr)
- [Luma Help, Luma API](https://help.luma.com/p/luma-api) (citata dalla PRD il 6 nov 2026)
- `.env.example`
