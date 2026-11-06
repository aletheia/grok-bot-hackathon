# ADR-0011 — Esclusioni della v1

- Stato: **Confirmed in PRD** (6 nov 2026) per le cinque funzioni. Le altre esclusioni sono nel testo della PRD-01 e nell'assunto «nessun billing», non ripetute nella frase di conferma.
- Data: 2026-11-06
- Feature: nessuna in v1

## Contesto

La conferma dice che admission, screening, credits, richieste ai mentor e pagina partnership restano fuori dalla v1. Il codice resta nel repository e si porterà a per-evento quando un organizzatore lo chiede. Nel prodotto multi-tenant pagine e API di quelle funzioni non sono raggiungibili.

La PRD-01 esclude anche billing e piani, custom domain, admin limitati a un singolo evento, dominio email dell'organizzatore, SSO enterprise. L'assunto ripete l'assenza di billing. La domanda aperta sugli admin di singolo evento è in tensione con quell'esclusione.

Il codice di tutte e cinque le funzioni è su main (route admin e API di screening, admission, credits, mentor, partnership).

## Opzioni

1. Lasciare il codice, toglierlo dal prodotto multi-tenant. È il testo della fonte.
2. Cancellare il codice in v1. La fonte non lo chiede.
3. Portarle a per-evento subito. Contraddice la conferma.

## Decisione

Le cinque esclusioni sono confermate nella fonte come perimetro di prodotto. Non è un'istruzione a cancellare o a spegnere il sito attuale in questa PR. L'admin di singolo evento resta escluso dal testo, con la domanda 8 ancora aperta: non implementarlo, e non chiudere la domanda.

## Conseguenze

La Console (EVT-11) elenca partecipanti, team, submission, giudici, mentor e punteggi. Non elenca admission, screening, credits, partnership. I mentor come ruolo di evento («seguirli») restano nel tabella ruoli; le richieste ai mentor no. Non unificare le due cose.

TEAM-12 parla di ammissione di un team sotto il minimo. Non riattiva la coda admission.

## Verifica

Quando esisterà il prodotto multi-tenant, un test di routing deve ricevere 404 sulle cinque aree. Sul sito single-event attuale quelle route restano. Questa PR non le tocca.

## Fonti

- [Conferma del 6 nov 2026](../hackathon-platform-prd-v0.1.md#conferma-6-nov)
- [Funzioni attuali](../hackathon-platform-prd-v0.1.md#funzioni-attuali)
- [Fuori dalla v1](../hackathon-platform-prd-v0.1.md#fuori-v1-organizzatore)
