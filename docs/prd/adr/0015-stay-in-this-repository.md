# ADR-0015 — Il prodotto resta in questo repository

- Stato: **Confirmed in PRD** (6 nov 2026)
- Data: 2026-11-06
- Feature: tutte, in questo repository

## Contesto

La conferma dice che il prodotto resta nel repository attuale. L'assunto identifica `aletheia/grok-bot-hackathon`, ultimo push il 5 nov 2026. Il commit citato, `db33ac9`, è main al momento di questa lettura. Il setup pstack dice che è un fork pubblico, senza segreti nel codice, e che le pull request vanno verso il fork, non verso l'upstream.

## Opzioni

1. Continuare in questo repository. Confermato.
2. Repository nuovo o riscrittura. La riga Architettura scarta la riscrittura finché i confini non sono provati, ed è Proposed a parte. La conferma sul repository è più stretta: il prodotto sta qui.

## Decisione

Il luogo del codice è confermato. Non implica accettare tenancy, URL o pstack. Questa pull request di documentazione è aperta verso `aletheia/grok-bot-hackathon`.

## Conseguenze

Non si crea un secondo repo di piattaforma. I segreti restano fuori dal git (già vero per `.env`). Le PR di prodotto future, quando autorizzate, nascono da qui.

Lingua dell'interfaccia: il sito è inglese. L'italiano per evento è una domanda aperta, non una conseguenza di questa ADR.

## Verifica

`git remote` e `git rev-parse` su main: `db33ac9`. Fatto in questa lettura. Non è una verifica di prodotto.

## Fonti

- [Conferma del 6 nov 2026](../hackathon-platform-prd-v0.1.md#conferma-6-nov)
- [Assunto sul repository](../hackathon-platform-prd-v0.1.md#assumptions)
- [Setup pstack, punto 1](../hackathon-platform-prd-v0.1.md#pstack-setup)
