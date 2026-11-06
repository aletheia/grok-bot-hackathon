# ADR-0004 — Account globale e membership

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-ORG-01](../features.md#feat-org-01), [FEAT-ORG-02](../features.md#feat-org-02), [FEAT-F0](../features.md#feat-f0)

## Contesto

La PRD raccomanda un account globale per email e ruoli come membership di organizzazione, evento e team. È one-way door. La conferma del 6 nov copre il magic link, non questo modello. L'email su `user` è già unica. Il ruolo è un enum globale, che include anche `moderator` e `reviewer` oltre ai quattro valori citati dalla PRD.

L'assunto dice che Better Auth avrebbe un plugin per organizzazioni, membri e inviti, e che non è stato verificato sulla versione in uso (`better-auth` `^1.2.0`). Questa lettura non lo ha verificato.

## Opzioni

1. Account unico e tabelle di membership. Raccomandazione. La stessa persona può essere admin di un'organizzazione e partecipante di un'altra.
2. Account separati per evento. La fonte la scarta: niente SSO, utenti duplicati.
3. Plugin organizzazioni di Better Auth, oppure membership scritte nell'applicazione. Scelta esplicitamente rinviata dalla fonte finché il plugin non è controllato sulla versione installata. Non scegliere in questa ADR.

## Decisione

Nessuna sul modello di membership e nessuna sul plugin. Proposed. Non marcare il plugin come adatto.

Chi può creare un'organizzazione (self-service, approvazione, invito) è una domanda aperta. ORG-07 copre solo la prima pubblicazione, non la nascita dell'organizzazione.

## Conseguenze

Se confermato: `user.role` non è più la fonte dei permessi di prodotto; la migrazione deve dire dove finiscono `moderator` e `reviewer`; l'ultimo owner non si rimuove (ORG-04); un platform admin approva la prima pubblicazione e può sospendere un evento.

Accesso: un org admin vede tutti gli eventi della propria organizzazione (assunto, coerente con ORG-04). L'admin limitato a un evento è fuori v1, ma la domanda 8 lo riapre. Vedi [tensione](../gaps-and-questions.md#conflitti).

## Verifica

Prima di implementare: esito del controllo sul plugin Better Auth, scritto in un aggiornamento di questa ADR. Poi test di membership incrociata fra due organizzazioni. Oggi non eseguibile.

## Fonti

- [Tabella decisioni, riga Identità](../hackathon-platform-prd-v0.1.md#tabella-decisioni)
- [Ruoli](../hackathon-platform-prd-v0.1.md#ruoli)
- [Assunto sul plugin](../hackathon-platform-prd-v0.1.md#assumptions)
- Schema: `db/schema/auth.ts` (`userRoleEnum`)
