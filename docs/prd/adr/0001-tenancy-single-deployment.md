# ADR-0001 — Tenancy su un deployment e un database

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-F0](../features.md#feat-f0), [FEAT-NFR-01](../features.md#feat-nfr-01)

## Contesto

Il sito attuale tiene i fatti dell'evento in `lib/event.ts` e `lib/tracks.ts`. Cambiarli è un commit e un deploy. La PRD raccomanda un solo deployment, un solo database, ogni riga legata a organizzazione ed evento, e lo marca come one-way door. La frase di conferma del 6 nov 2026 non include questa scelta. Il carico assunto è 50–500 partecipanti e meno di 10 eventi contemporanei nel primo anno.

## Opzioni

1. Un deployment, un database, chiave di tenant su ogni riga. È la raccomandazione della fonte. Conseguenza: isolamento da testare su ogni endpoint, migrazione dell'evento Grok come prima riga, un solo ciclo di upgrade.
2. Un deployment generato per evento. La fonte la scarta: N build, N database, niente SSO, upgrade manuali.
3. La fonte non discute database separati a parità di deployment, né schema-per-tenant. Non sono opzioni valutate qui.

## Decisione

Nessuna. La raccomandazione resta Proposed. I requisiti della PRD sono scritti come se fosse già presa. Implementarla prima di una conferma di Luca significa trattare un assunto come una porta one-way già chiusa.

## Conseguenze

Se confermata: le tabelle di dominio guadagnano organizzazione ed evento; `SUPER_ADMIN_EMAILS` non basta più come confine; l'evento Grok diventa un dato migrato, con i vincoli di contenuto in [gaps](../gaps-and-questions.md#vincoli-grok). Se si sceglie l'opzione 2, cambiano URL, sessione e il modo di fare le preview.

Sicurezza: una query senza filtro di tenant è una fuga di dati. Privacy: i dati di organizzazioni diverse convivono nello stesso database e vanno separati logicamente, non solo con la UI.

## Verifica

Un test per endpoint, come chiede il NFR, con due organizzazioni. Non c'è oggi un secondo tenant su cui provarlo. Questa ADR non è verificata da un'implementazione.

## Fonti

- [Tabella decisioni, riga Tenancy](../hackathon-platform-prd-v0.1.md#tabella-decisioni)
- [NFR Isolamento e carico](../hackathon-platform-prd-v0.1.md#nfr)
- [Fase 0](../hackathon-platform-prd-v0.1.md#fase-0)
- Codice: `lib/event.ts`, commit `db33ac9`
