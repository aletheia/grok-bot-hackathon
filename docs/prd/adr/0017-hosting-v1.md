# ADR-0017 — Hosting della v1

- Stato: **Unresolved**
- Data: 2026-11-06
- Feature: [FEAT-F0](../features.md#feat-f0). Cambia la fase 0 se cambia l'hosting, non i requisiti di prodotto.

## Contesto

L'assunto della PRD: lo stack resta Next.js, Drizzle, PostgreSQL, Better Auth, Resend, Vercel, perché è l'assetto esistente (il DOCX scrive «l'estate esistente»). L'hosting è reversibile. La domanda aperta è: Vercel e PostgreSQL, oppure AWS.

Nel repository il deploy automatizzato è `.github/workflows/vercel.yml`: preview su ogni PR verso main, produzione su push a main con environment `production`. `docs/DOKPLOY.md` descrive un altro percorso, con Postgres raggiungibile dalla rete Docker. La connessione applicativa è `DATABASE_URL` via il driver `postgres`.

Contesto indicato fuori dal repo, non verificato in questa lettura: team Vercel Radixia, Postgres su Neon, sito `pavia.grokbot.it`. Neon non compare come host configurato. Il nome Radixia nel codice è uno sponsor.

La figura nomina object storage per loghi e cover. Non c'è un fornitore.

## Opzioni

1. Restare sul percorso Vercel già nel workflow, con PostgreSQL dietro `DATABASE_URL`. È l'assunto della PRD, non una conferma. Compatibile con Neon se l'URL punta lì, senza che il codice conosca Neon.
2. AWS. La fonte dice che le PRD non cambiano e cambia la fase 0. Nessun disegno AWS in questa documentazione.
3. Dokploy, come il documento già nel repo. Non è nominato dalla PRD. Non va spento né dichiarato morto da qui.

Object storage: Vercel Blob, S3, o i file in `public/` come oggi. Non valutato, perché la prosa non lo richiede ancora come servizio. Gli upload di TEAM-04 e della copertina, quando si implementano, hanno bisogno di una scelta. Non anticiparla.

## Decisione

Nessuna. Unresolved. Non spostare l'ambiente, non creare risorse cloud, non leggere né stampare segreti. L'assunto «resta Vercel in v1» è la proposta della fonte, esplicitamente riaperta dalla domanda.

## Conseguenze

Finché è irrisolto, la fase 0 non sa se la migrazione gira contro il Postgres di produzione. Questa PR non migra nulla. Le preview Vercel delle PR future, incluso il workflow attuale, continueranno a partire da sole: è il comportamento già committato, non una decisione nuova.

Privacy e backup dipendono dal fornitore del database. Senza sapere se è Neon, Dokploy o AWS, la retention (ADR-0012) non ha un posto fisico.

## Verifica

Una conferma di Luca che nomini il fornitore del database di produzione e il dominio. Non sostituibile con un'ispezione del codice, perché quei fatti non ci sono.

## Fonti

- [Assunto sullo stack](../hackathon-platform-prd-v0.1.md#assumptions)
- [Domanda hosting](../hackathon-platform-prd-v0.1.md#open-questions)
- [Contesto non verificato](../gaps-and-questions.md#contesto-non-verificato)
- `.github/workflows/vercel.yml`, `docs/DOKPLOY.md`, `lib/site.ts`
