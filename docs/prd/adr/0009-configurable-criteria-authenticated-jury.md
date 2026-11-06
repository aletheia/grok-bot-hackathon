# ADR-0009 — Criteri configurabili e giuria autenticata

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-APP-04](../features.md#feat-app-04), [FEAT-EVT-04](../features.md#feat-evt-04)

## Contesto

`judge_score` ha cinque colonne fisse. `jury_vote` ha tre colonne da 1 a 5 e identifica il giurato con un nome libero, senza login. È il comportamento voluto della PR #21, unita. La PRD dice che per un evento presidiato il rischio è accettabile e per un prodotto no (APP-09). APP-10 vuole i criteri definiti in Console (nome, peso, scala), non colonne fisse.

Sul sito, `EVENT.criteria` è vuoto di proposito e la landing non pubblica la rubrica. Il ranking pubblico però espone le etichette della rubrica fissa. Vedi [vincoli](../gaps-and-questions.md#vincoli-grok).

## Opzioni

1. Criteri come righe dell'evento, voto della giuria autenticato con email, un voto per giurato-team-criterio, modificabile fino alla chiusura del judging. Raccomandazione di APP-09 e APP-10.
2. Tenere le colonne fisse e il nome libero. È lo stato attuale. La fonte lo considera un difetto nel prodotto multi-tenant.
3. Pubblicare i criteri sulla landing. Non è un requisito. È in tensione con la decisione già nel codice di non pubblicarli. Non sceglierla qui.

## Decisione

Nessuna. Proposed. Non cambiare `/vote` in questa PR. La pagina attuale resta com'è su main.

## Conseguenze

Una migrazione futura deve convivere con i voti già raccolti in `jury_vote` e `judge_score`, oppure dichiarare che quei voti restano dell'evento Grok storico e non si ricalcolano. Questa ADR non sceglie quale delle due. I giurati con email (EVT-06) ricevono l'accesso; un nome senza email non vota nel modello nuovo.

Privacy: l'email del giurato è un dato personale. Il voto pubblico, se la leaderboard è live, può rivelare il giudizio senza dover pubblicare l'email. APP-08 non chiede di mostrare chi ha dato quale voto.

## Verifica

Test: richiesta anonima rifiutata; secondo invio aggiorna; dopo la chiusura rifiutato; un criterio aggiunto in Console entra nel calcolo senza una colonna nuova. Non scritti.

## Fonti

- [APP-09](../hackathon-platform-prd-v0.1.md#app-09), [APP-10](../hackathon-platform-prd-v0.1.md#app-10), [EVT-09](../hackathon-platform-prd-v0.1.md#evt-09)
- Schema: `db/schema/jury-vote.ts`, `db/schema/scoring.ts`
- PR #21, unita
