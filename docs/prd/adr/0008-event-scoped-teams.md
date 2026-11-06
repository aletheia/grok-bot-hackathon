# ADR-0008 — Team scoped per evento

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-TEAM-01](../features.md#feat-team-01), [FEAT-TEAM-05](../features.md#feat-team-05)

## Contesto

Oggi `team` è globale. Un utente ha al più un team attivo (`team_member_user_active_unique` su `user_id` dove `left_at` è null) e anche `user.teamId`. Il massimo è 6 con check di database; il minimo 4 è logica di «team formato». Join code a 8 caratteri, leave, rimozione, passaggio del lead al membro più antico, archivio dell'ultimo membro, lock su `PORTAL_DEADLINE`.

La PRD vuole un team attivo per coppia evento-utente, min e max presi dall'evento, lock dell'evento, e join concorrenti che non superano il massimo.

## Opzioni

1. Team e membership con `event_id`, unicità parziale su `(event_id, user_id)`. Raccomandazione, necessaria alla tenancy.
2. Tenere il team globale e filtrare in applicazione. Non regge due eventi: l'indice attuale vieta il secondo team allo stesso utente.
3. Copiare il database per evento. È l'alternativa di tenancy già scartata in ADR-0001, se quella ADR resterà la raccomandazione.

## Decisione

Nessuna. Proposed. La migrazione di `user.teamId` e dell'indice unico globale è parte del lavoro futuro, non di questa PR. Non c'è uno script di migrazione qui.

## Conseguenze

Il check `max_members <= 6` va sostituito dal massimo dell'evento, altrimenti EVT-09 è finto. Il minimo non diventa un check «la riga deve avere già N membri»: un team appena creato ha un membro. Il minimo è una regola di ammissione e di avviso (TEAM-12), ancora incompleta nel significato di «non ammesso».

Concorrenza: il rifiuto del join oltre il massimo va tenuto sotto lock di riga, come il codice attuale fa per il singolo evento. Dopo il lock il portale è in sola lettura, salvo correzioni admin.

Dati: i team dell'evento Grok vanno rilegati alla riga evento, non lasciati orfani.

## Verifica

Test già utili sul sito singolo (join concorrente, passaggio lead, archivio) vanno rifatti con due eventi e lo stesso utente in entrambi. La suite attuale non ha due eventi.

## Fonti

- [Da dove si parte, riga Team](../hackathon-platform-prd-v0.1.md#da-dove-si-parte)
- [TEAM-09](../hackathon-platform-prd-v0.1.md#team-09), [TEAM-08](../hackathon-platform-prd-v0.1.md#team-08)
- Schema: `db/schema/teams.ts`, `db/schema/auth.ts`
