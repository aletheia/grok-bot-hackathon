# ADR-0002 — URL degli eventi su path

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-APP-01](../features.md#feat-app-01)

## Contesto

La PRD raccomanda `app.dominio.com/h/:event-slug` e il Portale su `/h/:event-slug/team`, same-origin, un cookie. È two-way door: un subdomain può arrivare dopo come alias. Il dominio di prodotto non è scelto. `getSiteUrl()` usa `NEXT_PUBLIC_SITE_URL` o `VERCEL_URL`. `pavia.grokbot.it` non è nel repository.

La figura mostra anche la Console su `/o/:org-slug`. Quel path non è nella prosa.

## Opzioni

1. Path `/h/:event-slug`. Raccomandazione. Un record DNS, un certificato, le preview di pull request restano come oggi. Lo slug è leggibile e non è l'id interno.
2. Subdomain per evento da subito. La fonte la scarta per wildcard DNS e TLS, cookie cross-subdomain e callback OAuth per host. La riconoscibilità dell'URL sarebbe maggiore.
3. Path della Console. Non deciso. La figura propone `/o/:org-slug`. La prosa no.

## Decisione

Nessuna. Il path evento è Proposed. Il path Console è Unresolved. Non riservare `/o/` nel codice finché Luca non conferma la figura.

## Conseguenze

Il sito attuale vive sulla radice (`/`, `/tracks`, `/ranking`, `/register`). Passare a `/h/:slug` è un cambio di URL pubblici: servono redirect solo quando il cutover sarà deciso, non in questa PR. Slug immutabile dopo la pubblicazione (EVT-01). Draft e slug inesistente rispondono 404, con anteprima per gli admin (APP-01).

Accesso: la sessione del Portale è la stessa dell'app solo se l'origin coincide. Un subdomain rompe questo assunto.

## Verifica

Quando esisterà un secondo evento, i due slug risolvono dati diversi e uno slug draft non è pubblico. Oggi non c'è slug di evento.

## Fonti

- [Tabella decisioni, riga URL](../hackathon-platform-prd-v0.1.md#tabella-decisioni)
- [Struttura dell'URL](../hackathon-platform-prd-v0.1.md#struttura-url)
- [Testi della figura](../hackathon-platform-prd-v0.1.md#figura-testi)
- [Domanda sul dominio](../gaps-and-questions.md#domande)
