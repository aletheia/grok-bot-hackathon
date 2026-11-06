# ADR-0007 — Modular monolith e outbox

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-F0](../features.md#feat-f0), [FEAT-ORG-06](../features.md#feat-org-06)

## Contesto

Il repository è già un'applicazione Next.js unica, con domini in `lib/` e route in `app/api`. La PRD raccomanda di restare in quel monolith, con domain event in-process scritti in una outbox nella stessa transazione, e consumer idempotenti (email, sync Luma, leaderboard). I microservizi sono scartati perché i confini non sono provati. Nessun contesto si estrae finché non c'è un trigger misurato.

L'audit delle azioni admin (ORG-08, P1) è un registro consultabile dagli owner. Non è automaticamente la stessa tabella dell'outbox: la fonte li descrive separatamente.

## Opzioni

1. Monolith più outbox transazionale. Raccomandazione. Two-way door.
2. Microservizi o riscrittura. Scartati nella fonte, per ora.
3. Eventi in-process senza outbox. Non è la raccomandazione: un consumer che fallisce dopo il commit perderebbe l'evento. La fonte vuole la scrittura nella stessa transazione.

I cinque bounded context e i nomi degli eventi sono nella [tabella](../hackathon-platform-prd-v0.1.md#contesti). Sono un vocabolario Proposed, non uno schema già accettato.

## Decisione

Nessuna. Proposed. Non aggiungere la tabella outbox in questa PR.

## Conseguenze

I consumer devono poter ripartire due volte senza doppio invio di email o doppio sync. L'audit risponde a «chi ha fatto cosa», l'outbox a «cosa deve ancora succedere». Tenerli distinti evita di usare il registro legale come coda.

Deployment: un solo processo applicativo resta coerente con Vercel o con un container, finché un trigger misurato non dice altrimenti.

## Verifica

Un test di transazione: rollback del cambio di stato non lascia righe in outbox. Un test di consumer: la seconda esecuzione non manda una seconda email. Non esistono.

## Fonti

- [Tabella decisioni, riga Architettura](../hackathon-platform-prd-v0.1.md#tabella-decisioni)
- [Contesti e domain events](../hackathon-platform-prd-v0.1.md#contesti)
- [ORG-08](../hackathon-platform-prd-v0.1.md#org-08)
