# ADR-0013 — L'invito al team non concede l'ammissione

- Stato: **Proposed** (opzione A, default proposto dalla fonte). Non confermato.
- Data: 2026-11-06
- Feature: [FEAT-TEAM-03](../features.md#feat-team-03)

## Contesto

TEAM-05 e TEAM-06 descrivono l'invito email e il link che fa anche da login. Poi la PRD pone due opzioni per chi non è ancora registrato all'evento. La domanda aperta chiede A o B. La fonte raccomanda A e propone un parametro per evento con A di default.

## Opzioni

1. Opzione A. L'invitato deve essere registrato e approvato, via Luma o nativa. Il link porta alla registrazione e l'invito resta pending. Rischio citato: un passaggio in più.
2. Opzione B. L'invito concede l'ammissione. Rischio citato: aggira capienza e approvazione.
3. Parametro per evento, default A. È la proposta della fonte, e dipende dall'accettare A come default.

## Decisione

Nessuna. Proposed a favore di A, perché è la raccomandazione scritta, e resta una domanda per Luca. Non implementare B nel frattempo. Non aggiungere il parametro finché il default non è confermato: un parametro senza conferma è una seconda decisione.

## Conseguenze

Con A, capienza e approvazione restano dell'organizzatore. Il link di TEAM-06 («vale anche come login») non basta da solo a entrare nel team. Con B, il sync Luma e la waitlist nativa si possono aggirare con un invito.

Sicurezza: il token è monouso e legato all'email, validità fino al team lock, massimo 10 pendenti. Questi punti sono requisiti P0 indipendenti da A o B.

## Verifica

Test, quando A sarà confermata: invitato non approvato resta pending e vede la registrazione; invitato approvato entra; email diversa non consuma il token. Non scritti.

## Fonti

- [Opzioni A e B](../hackathon-platform-prd-v0.1.md#invitato-non-registrato)
- [Open questions](../hackathon-platform-prd-v0.1.md#open-questions)
- [TEAM-05](../hackathon-platform-prd-v0.1.md#team-05), [TEAM-06](../hackathon-platform-prd-v0.1.md#team-06)
