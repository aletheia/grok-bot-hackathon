# ADR-0005 — Registrazione nativa oppure sync Luma

- Stato: **Confirmed in PRD** (6 nov 2026). Il sync single-event esiste; le due modalità per evento no.
- Data: 2026-11-06
- Feature: [FEAT-REG-01](../features.md#feat-reg-01), [FEAT-REG-02](../features.md#feat-reg-02)

## Contesto

Ogni evento sceglie `native` o `sync`. Sync è selezionabile solo con una Luma API key verificata. La conferma del 6 nov 2026 include questa alternativa. «Solo Luma» è scartato perché obbligherebbe ogni organizzatore a Luma Plus.

L'evento Grok oggi iscrive su Luma (`https://luma.com/spacexai-z1ys`, id `evt-IEb2nHBuHyLU7Jz`) e il portale fa sync e lookup. La registrazione nativa è la fase 5. Il sync non ha una fase propria e serve prima del cutover di Grok.

## Opzioni

1. Modalità per evento, native o sync. Confermata nella fonte.
2. Solo Luma. Scartata nella fonte.
3. Solo nativa. Non è la conferma: toglierebbe l'evento Grok dal flusso attuale.

Dettagli non confermati: frequenza di 15 minuti; comportamento se Luma è giù al login; elenco dei «pochi campi» nativi.

## Decisione

La scelta di avere entrambe le modalità è confermata nella fonte. Non è implementata come parametro di evento. I dettagli aperti restano Unresolved e non si riempiono qui. Proposta non approvata, già nel codice attuale: se Luma fallisce, decide la copia locale e l'errore non apre l'accesso.

## Conseguenze

Sync importa nome ed email; l'account nasce al primo login. Chi perde l'approvazione su Luma perde l'accesso. La key revocata ferma gli aggiornamenti e avvisa gli admin, senza cancellare i nominativi. Native ha approvazione automatica o manuale, capienza e waitlist.

Privacy: la guest list è dato personale dell'evento. Sta nel NFR dati personali, non in un'eccezione del sync.

Migrazione: la guest list attuale (`luma_registrant`, una tabella globale) va legata a un evento. Non farla in questa PR.

## Verifica

Un evento in sync e uno native nello stesso database, con una key che non legge l'evento dell'altra organizzazione. La frequenza, quando sarà un numero, va testata con un clock finto. Oggi il sync è uno solo, globale.

## Fonti

- [Conferma del 6 nov 2026](../hackathon-platform-prd-v0.1.md#conferma-6-nov)
- [Registrazione dei partecipanti](../hackathon-platform-prd-v0.1.md#registrazione-partecipanti)
- [Fase 5](../hackathon-platform-prd-v0.1.md#fase-5)
- Codice: `lib/event.ts` (`registration`), `.env.example`
