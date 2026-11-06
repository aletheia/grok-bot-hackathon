# ADR-0012 — Ruoli privacy, retention, export, cancellazione

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-NFR-02](../features.md#feat-nfr-02)

## Contesto

Il NFR dice che la piattaforma è responsabile del trattamento per conto dell'organizzatore, che è titolare. Servono DPA, informativa per evento, retention configurabile, export e cancellazione. Lo stato Archived è in sola lettura e i dati personali seguono la retention. Non c'è un DPA nel repository e questa PR non ne scrive uno.

ORG-05 ha il reply-to delle email. APP-11 mette i nomi dei membri in pubblico solo se l'evento lo abilita. Il contatto `hackathon@radixia.ai` non è nel codice.

## Opzioni

1. Implementare i cinque obblighi del NFR prima che un organizzatore reale carichi persone, lasciando i testi legali a chi di competenza. È il minimo coerente con la fonte. I testi non si inventano.
2. Rimandare tutto a dopo le feature. La fonte non dà una priorità, ma Archived e la registrazione nativa raccolgono dati personali. Rimandare senza una data è un buco, non una decisione.
3. Scrivere qui una informativa o un DPA. Fuori scope e senza mandato.

## Decisione

Nessuna sul testo legale, sul tempo di retention e sul fornitore che conserva i backup. Proposed come obbligo di prodotto. Unresolved sui numeri e sui documenti.

## Conseguenze

Export e cancellazione vanno progettati insieme al modello (account globale, registrazione, submission, voti). Cancellare un utente che è owner o che ha voti pubblici ha effetti che la PRD non descrive: non scegliere «hard delete ovunque» in implementazione senza una risposta.

La leaderboard e i deliverable pubblici sono dati resi visibili dall'organizzatore. La cancellazione deve definire cosa resta sulla pagina pubblica. Non è specificato.

Accesso: l'informativa sta prima della registrazione. Il reply-to è un dato di organizzazione, non un indirizzo fisso di piattaforma.

## Verifica

Test di export (il JSON contiene i dati di quella persona e non quelli di un'altra) e di cancellazione (una lettura successiva non restituisce l'email). Il DPA si verifica con un documento firmato, non con un test. Nessuno dei due c'è.

## Fonti

- [NFR Dati personali](../hackathon-platform-prd-v0.1.md#nfr)
- [Stato Archived](../hackathon-platform-prd-v0.1.md#ciclo-di-vita)
- [APP-11](../hackathon-platform-prd-v0.1.md#app-11)
