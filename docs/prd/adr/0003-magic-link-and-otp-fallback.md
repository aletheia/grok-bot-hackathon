# ADR-0003 — Magic link con codice a 6 cifre

- Stato: **Confirmed in PRD** (6 nov 2026). Non implementato.
- Data: 2026-11-06
- Feature: [FEAT-AUTH-01](../features.md#feat-auth-01)

## Contesto

La frase di conferma dice: login sempre con magic link e codice a 6 cifre di ripiego. Oggi i partecipanti ricevono solo il codice (Better Auth `emailOTP`, invio con Resend) e gli admin entrano con email, password e 2FA (`lib/auth.ts`). La PRD vuole il link anche per admin, partecipanti e giudici, e la 2FA di owner e admin dopo il link.

I rischi citati: gli scanner di posta consumano i token; il link aperto sul telefono autentica il telefono.

## Opzioni

1. Magic link più codice nella stessa email, scadenza 15 minuti, consumo del link solo dopo conferma esplicita, uso dell'uno invalida l'altro. È il requisito confermato.
2. Solo codice a 6 cifre, come oggi per i partecipanti. Non soddisfa la conferma.
3. Email e password per gli admin, come oggi. La PRD lo sostituisce con il link, e tiene la 2FA.

Il trasporto email resta Resend nell'assunto di stack. Non è una scelta di fornitore nuova.

## Decisione

Il meccanismo (link, codice, scadenza, conferma, invalidazione incrociata) è confermato nella fonte. Non risulta implementato: non c'è codice che lo faccia. Le soglie di rate limit non sono parte della conferma.

## Conseguenze

`emailAndPassword` degli admin va rivisto quando si implementa, non prima. La 2FA esistente si aggancia dopo il link, ed è obbligatoria prima di salvare un segreto o pubblicare (ORG-01). Un link senza conferma non deve creare sessione: è il punto che rende innocuo lo scanner.

Privacy: il codice e il link sono segreti di autenticazione. I log non devono contenerli. Il rate limit attuale (`email_throttle`) copre l'OTP, non questo flusso.

## Verifica

Test: link scaduto rifiutato; seconda apertura dopo la conferma rifiutata; GET del link senza conferma non crea sessione; codice usato invalida il link e viceversa; owner senza 2FA non pubblica. Nessuno di questi test esiste.

## Fonti

- [Conferma del 6 nov 2026](../hackathon-platform-prd-v0.1.md#conferma-6-nov)
- [Login](../hackathon-platform-prd-v0.1.md#login)
- [ORG-01](../hackathon-platform-prd-v0.1.md#org-01)
- Codice: `lib/auth.ts`, `lib/auth/email-throttle.ts`
