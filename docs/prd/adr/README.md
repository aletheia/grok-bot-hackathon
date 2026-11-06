# ADR — Hackathon Platform PRD v0.1

<a id="adr-index"></a>

Decisioni lette dalla [PRD](../hackathon-platform-prd-v0.1.md). Nessuna di queste ADR è un'implementazione.

| Stato | Significato |
| --- | --- |
| Confirmed in PRD | La frase del 6 nov 2026, o un'esclusione esplicita della fonte, lo dice. Non vuol dire che il codice c'è |
| Proposed | Raccomandazione della PRD. I requisiti sono scritti come se fosse presa. Non è nella frase di conferma |
| Unresolved | Domanda aperta, oppure la fonte stessa rimanda la scelta |

Non c'è lo stato Accepted. Le scelte future non sono accettate come lavoro avviato. Le decisioni già vere nel codice sono elencate sotto, con il file che le mostra, e non sono ri-accettate come direzione del prodotto nuovo.

| ADR | Titolo | Stato |
| --- | --- | --- |
| [0001](0001-tenancy-single-deployment.md) | Tenancy su un deployment e un database | Proposed |
| [0002](0002-event-url-path.md) | URL degli eventi su path | Proposed |
| [0003](0003-magic-link-and-otp-fallback.md) | Magic link con codice a 6 cifre | Confirmed in PRD, non implementato |
| [0004](0004-global-account-and-memberships.md) | Account globale e membership | Proposed |
| [0005](0005-registration-native-or-luma.md) | Registrazione nativa oppure sync Luma | Confirmed in PRD, non come modalità di evento |
| [0006](0006-luma-key-per-organization.md) | Luma API key per organizzazione | Proposed |
| [0007](0007-modular-monolith-outbox.md) | Modular monolith e outbox | Proposed |
| [0008](0008-event-scoped-teams.md) | Team scoped per evento | Proposed |
| [0009](0009-configurable-criteria-authenticated-jury.md) | Criteri configurabili e giuria autenticata | Proposed |
| [0010](0010-deliverable-and-leaderboard-publication.md) | Pubblicazione esplicita di deliverable e leaderboard | Proposed |
| [0011](0011-v1-exclusions.md) | Esclusioni della v1 | Confirmed in PRD per le cinque funzioni |
| [0012](0012-privacy-retention-export.md) | Ruoli privacy, retention, export, cancellazione | Proposed |
| [0013](0013-team-invite-does-not-admit.md) | L'invito al team non concede l'ammissione | Proposed (opzione A) |
| [0014](0014-deterministic-team-name-logo.md) | Nome e logo del team deterministici | Proposed |
| [0015](0015-stay-in-this-repository.md) | Il prodotto resta in questo repository | Confirmed in PRD |
| [0016](0016-pstack-vendoring.md) | Vendoring di pstack per i Cloud Agent | Proposed |
| [0017](0017-hosting-v1.md) | Hosting della v1 | Unresolved |

## Già nel repository

Evidenza su `db33ac9`. Non sono ADR nuove.

| Fatto | Evidenza |
| --- | --- |
| Evento singolo in costanti, deadline unica | `lib/event.ts` (`EVENT`, `PORTAL_DEADLINE`) |
| Partecipanti con codice a 6 cifre, Resend in produzione | `lib/auth.ts`, `.env.example` |
| Admin con email, password e 2FA, allowlist `SUPER_ADMIN_EMAILS` | `lib/auth.ts`, `docs/TEAM_MANAGEMENT.md` |
| Luma: una key e un event id di ambiente, sync e lookup | `.env.example`, README |
| Team 4–6, un team attivo per utente, codice a 8 caratteri, lock | `db/schema/teams.ts`, `lib/teams/` |
| Voto giuria pubblico con nome libero, tre criteri 1–5 | `db/schema/jury-vote.ts`, PR #21 unita |
| Rubrica giudici a cinque colonne fisse | `db/schema/scoring.ts` |
| Criteri non pubblicati in landing | `lib/event.ts`, `lib/landing-content.test.ts` |
| Agenda senza un talk di Luca | `EVENT.schedule` in `lib/event.ts` |
| Interfaccia inglese | `lib/site.ts` (`locale: en_US`), README |
| Deploy Vercel da GitHub Actions, produzione con environment e reviewer | `.github/workflows/vercel.yml` |
| PostgreSQL via `DATABASE_URL`, Drizzle | `package.json`, `docs/AUTH_AND_SCHEMA.md` |

## Non verificato nel repository

Neon, il team Vercel Radixia, il dominio `pavia.grokbot.it`, l'indirizzo `hackathon@radixia.ai`, il plugin organizzazioni di Better Auth sulla versione installata. Dettaglio in [gaps](../gaps-and-questions.md#contesto-non-verificato).
