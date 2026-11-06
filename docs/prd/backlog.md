# Backlog importabile — Hackathon Platform PRD v0.1

<a id="backlog"></a>

Le issue di `aletheia/grok-bot-hackathon` sono disabilitate. `gh issue list` restituisce che il repository ha le issue disabilitate, e questa sessione non le riattiva. **Nessuna issue è stata creata.** I blocchi sotto sono pronti da incollare se le issue verranno abilitate. Non pubblicare questi testi su Slack, email o altri gruppi.

Ogni issue è una feature di [features.md](features.md). I criteri sono quelli già scritti lì, non una seconda specifica. Le dipendenze sono altre feature, non persone.

Etichette suggerite, da creare solo se si apre il tracker: `prd`, `planning`, più l'id della feature. Nessuna etichetta è stata applicata.

<a id="issue-feat-f0"></a>

## FEAT-F0 — Fondazioni di tenancy

**Titolo issue:** `FEAT-F0: Fondazioni di tenancy`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: prerequisito della fase 0, non ha un ID P0 proprio.
- Fase: 0.
- Stato codice: Gap. Oggi `EVENT` è una costante in `lib/event.ts`.
- Dipendenze: [ADR-0001](adr/0001-tenancy-single-deployment.md) e [ADR-0004](adr/0004-global-account-and-memberships.md) sono Proposed. La fase 0 della PRD parte sulle assunzioni, non su un'accettazione successiva.
- Specifica: [features.md#feat-f0](features.md#feat-f0)

### Corpo

un organizzatore e l'evento Grok convivono nello stesso database senza un deploy per evento.

Scope: organizzazione, evento come riga, membership, colonna organizzazione ed evento sulle tabelle di dominio, migrazione dell'evento Grok come primo evento. Lo scoping di ogni query è [FEAT-NFR-01](features.md#feat-nfr-01).

Criteri di accettazione:

  - Esiste una riga evento il cui contenuto di partenza è quello di `lib/event.ts` e `lib/tracks.ts`, senza aggiungere uno slot d'agenda per un talk di Luca (vincolo di contenuto, [gap](gaps-and-questions.md#vincoli-grok)).
  - Un utente di un'altra organizzazione non legge quella riga (il test sta in FEAT-NFR-01).
  - I fatti oggi costanti (`EVENT`, `PORTAL_DEADLINE`) hanno un campo corrispondente, non un secondo file di costanti da committare per cambiarli.

Fonte PRD: [fase 0](hackathon-platform-prd-v0.1.md#fase-0), [da dove si parte](hackathon-platform-prd-v0.1.md#da-dove-si-parte).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-auth-01"></a>

## FEAT-AUTH-01 — Magic link e codice di ripiego

**Titolo issue:** `FEAT-AUTH-01: Magic link e codice di ripiego`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0, perché ORG-01 e l'accesso partecipanti la richiedono.
- Fase: 1, usata anche da App e Portale.
- Stato codice: Parziale su main. I partecipanti hanno un codice a 6 cifre via Better Auth email OTP e Resend (`lib/auth.ts`). Gli admin hanno email, password e 2FA. Il magic link, la conferma esplicita e l'invalidazione incrociata non ci sono.
- Dipendenze: [ADR-0003](adr/0003-magic-link-and-otp-fallback.md).
- Specifica: [features.md#feat-auth-01](features.md#feat-auth-01)

### Corpo

admin, partecipanti e giudici entrano con la stessa email, senza restare autenticati sul telefono per errore di uno scanner di posta.

Scope: magic link più codice a 6 cifre nella stessa email. Owner e admin completano la 2FA dopo il link, prima di salvare un segreto o pubblicare.

Criteri di accettazione:

  - Il link scade dopo 15 minuti, è monouso, e viene consumato solo dopo una conferma esplicita sulla pagina di atterraggio.
  - Il codice a 6 cifre ha la stessa scadenza e si inserisce sul dispositivo da cui è partita la richiesta.
  - Usare il link invalida il codice, e usare il codice invalida il link.
  - Un link aperto da uno scanner, senza la conferma, non crea sessione.
  - Il rate limit sul magic link rifiuta il superamento della soglia (soglia numerica non scritta nella PRD: va fissata in implementazione e registrata, non inventata qui).

Fonte PRD: [Login](hackathon-platform-prd-v0.1.md#login), [ORG-01](hackathon-platform-prd-v0.1.md#org-01), [NFR Sicurezza](hackathon-platform-prd-v0.1.md#nfr).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-org-01"></a>

## FEAT-ORG-01 — Registrazione organizzazione

**Titolo issue:** `FEAT-ORG-01: Registrazione organizzazione`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (ORG-01, ORG-02).
- Fase: 1.
- Stato codice: Gap.
- Dipendenze: FEAT-AUTH-01, ADR-0001, ADR-0004. Chi può registrarsi è [domanda aperta](gaps-and-questions.md#domande).
- Specifica: [features.md#feat-org-01](features.md#feat-org-01)

### Corpo

una persona crea la propria organizzazione e ne diventa owner senza un commit.

Scope: verifica email, nome organizzazione, unicità del nome normalizzato, lista di nomi riservati, slug modificabile finché nessun evento è pubblicato.

Criteri di accettazione:

  - Dopo il magic link, il flusso chiede il nome e assegna il ruolo owner a chi registra.
  - «MESA Group» e «mesa-group» non possono coesistere: il vincolo è sul nome normalizzato (minuscole, senza accenti, spazi e punteggiatura), oltre al controllo mentre si digita.
  - Un nome nella lista riservata è rifiutato. La lista non è specificata nella PRD: il contenuto della lista è una domanda aperta, non una lista inventata.
  - Lo slug cambia finché non esiste un evento pubblicato di quell'organizzazione, e non cambia dopo.

Fonte PRD: [ORG-01](hackathon-platform-prd-v0.1.md#org-01), [ORG-02](hackathon-platform-prd-v0.1.md#org-02).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-org-02"></a>

## FEAT-ORG-02 — Inviti e membri admin

**Titolo issue:** `FEAT-ORG-02: Inviti e membri admin`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (ORG-03, ORG-04).
- Fase: 1.
- Stato codice: Gap. Esiste l'invito staff del sito attuale, non l'invito admin di organizzazione.
- Dipendenze: FEAT-ORG-01. L'admin limitato a un solo evento è fuori v1.
- Specifica: [features.md#feat-org-02](features.md#feat-org-02)

### Corpo

l'owner non è l'unica persona che può gestire gli eventi.

Scope: invito email con token, elenco inviti, ruoli owner e admin, protezione dell'ultimo owner.

Criteri di accettazione:

  - L'invito è un token monouso, legato all'email invitata, valido 7 giorni.
  - L'accettazione autentica la stessa email. Un'altra email non consuma il token.
  - Un invito pendente si vede, si revoca e si reinvia.
  - Un admin vede e gestisce tutti gli eventi dell'organizzazione.
  - L'ultimo owner non può essere rimosso né declassato.

Fonte PRD: [ORG-03](hackathon-platform-prd-v0.1.md#org-03), [ORG-04](hackathon-platform-prd-v0.1.md#org-04), [ruoli](hackathon-platform-prd-v0.1.md#ruoli).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-org-03"></a>

## FEAT-ORG-03 — Impostazioni organizzazione

**Titolo issue:** `FEAT-ORG-03: Impostazioni organizzazione`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (ORG-05).
- Fase: 1.
- Stato codice: Gap.
- Dipendenze: FEAT-ORG-01. Il contatto `hackathon@radixia.ai` non va scritto qui come default di piattaforma: è un vincolo possibile dell'evento Grok, non verificato nel repository ([gap](gaps-and-questions.md#vincoli-grok)).
- Specifica: [features.md#feat-org-03](features.md#feat-org-03)

### Corpo

i nuovi eventi ereditano timezone, dimensione team e palette, e le email escono con il mittente dell'organizzazione.

Scope: nome visualizzato, logo, timezone di default, nome mittente, reply-to, default per i nuovi eventi (dimensione dei team, palette).

Criteri di accettazione:

  - Salvare ciascuno di quei campi e rileggerlo.
  - Un evento nuovo nasce con i default dell'organizzazione e può poi avere i propri parametri (EVT-09).
  - Il reply-to compare sull'email transazionale.

Fonte PRD: [ORG-05](hackathon-platform-prd-v0.1.md#org-05).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-org-04"></a>

## FEAT-ORG-04 — Luma API key dell'organizzazione

**Titolo issue:** `FEAT-ORG-04: Luma API key dell'organizzazione`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (ORG-06).
- Fase: 1.
- Stato codice: Parziale su main. `LUMA_API_KEY` e `LUMA_EVENT_API_ID` sono variabili d'ambiente di tutta l'applicazione (`.env.example`). Non c'è una key cifrata per organizzazione.
- Dipendenze: [ADR-0006](adr/0006-luma-key-per-organization.md), FEAT-NFR-03, 2FA già richiesta da ORG-01 prima di salvare un segreto.
- Specifica: [features.md#feat-org-04](features.md#feat-org-04)

### Corpo

ogni organizzazione collega il proprio calendario Luma senza una variabile d'ambiente condivisa.

Scope: campo write-only, verifica contro Luma al salvataggio, ultimi 4 caratteri, data di verifica, sostituzione, revoca. Una key per organizzazione in v1.

Criteri di accettazione:

  - Dopo il salvataggio il client non riceve la key, e i log non la contengono.
  - La risposta di verifica mostra esito, ultimi 4 caratteri e data.
  - La key è rifiutata o marcata non verificata se la chiamata a Luma fallisce, e in quel caso la modalità sync non è selezionabile.
  - Revoca: gli eventi in sync tengono i nominativi già importati, smettono di aggiornarsi, e gli admin vedono un avviso.
  - Una seconda key per un altro calendario della stessa organizzazione non è un requisito v1 (la PRD lo segna P1).

Fonte PRD: [ORG-06](hackathon-platform-prd-v0.1.md#org-06), [NFR Segreti](hackathon-platform-prd-v0.1.md#nfr), paragrafo dopo ORG-08 sui vincoli Luma.

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-org-05"></a>

## FEAT-ORG-05 — Approvazione della prima pubblicazione

**Titolo issue:** `FEAT-ORG-05: Approvazione della prima pubblicazione`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (ORG-07).
- Fase: 1.
- Stato codice: Gap. Oggi pubblica chi è in `SUPER_ADMIN_EMAILS`, senza un secondo ruolo di piattaforma.
- Dipendenze: FEAT-EVT-05. Se l'evento Grok già pubblico debba passare di nuovo da questa approvazione è [domanda aperta](gaps-and-questions.md#domande). Proposta non approvata: grandfathering, non una decisione.
- Specifica: [features.md#feat-org-05](features.md#feat-org-05)

### Corpo

una organizzazione nuova non pubblica da sola una pagina sul dominio della piattaforma.

Scope: le bozze sono libere; la prima pubblicazione attende un platform admin.

Criteri di accettazione:

  - Un owner senza approvazione può creare e vedere l'anteprima, e Publish restituisce un rifiuto esplicito.
  - Un platform admin approva, e solo dopo Publish va a buon fine.
  - Un platform admin può sospendere un evento (ruolo in tabella Ruoli).

Fonte PRD: [ORG-07](hackathon-platform-prd-v0.1.md#org-07), [ruoli](hackathon-platform-prd-v0.1.md#ruoli).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-org-06"></a>

## FEAT-ORG-06 — Audit log

**Titolo issue:** `FEAT-ORG-06: Audit log`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (ORG-08). Il NFR Audit non ha priorità separata ed è lo stesso comportamento.
- Fase: 1, perché le azioni admin nascono con la Console.
- Stato codice: Gap per questo registro. I crediti hanno un audit proprio, e i crediti sono fuori v1.
- Dipendenze: le azioni delle altre feature di Console.
- Specifica: [features.md#feat-org-06](features.md#feat-org-06)

### Corpo

un owner ricostruisce chi ha cambiato cosa.

Scope: autore, oggetto, ora, consultazione riservata agli owner.

Criteri di accettazione:

  - Pubblicare un evento, invitare un admin, sostituire la Luma key e cambiare un punteggio producono righe distinte con autore e ora.
  - Un admin che non è owner non legge il registro, se la PRD resta letterale («consultabile dagli owner»).

Fonte PRD: [ORG-08](hackathon-platform-prd-v0.1.md#org-08), [NFR Audit](hackathon-platform-prd-v0.1.md#nfr).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-01"></a>

## FEAT-EVT-01 — Scheda evento: identità, testi, logistica

**Titolo issue:** `FEAT-EVT-01: Scheda evento: identità, testi, logistica`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (EVT-01, EVT-02, EVT-03).
- Fase: 1.
- Stato codice: Parziale su main come dati costanti, non come editor. Gap sulla Console.
- Dipendenze: FEAT-F0, FEAT-ORG-01.
- Specifica: [features.md#feat-evt-01](features.md#feat-evt-01)

### Corpo

l'organizzatore descrive l'hackathon senza editare `lib/event.ts`.

Scope: nome, slug unico di piattaforma, timezone, slug immutabile dopo la pubblicazione; titolo, descrizione breve, descrizione lunga in Markdown sanitizzato, copertina; luogo, mappa, come arrivare, inizio e fine con timezone, lista requisiti.

Criteri di accettazione:

  - Due eventi non ottengono lo stesso slug.
  - Dopo Publish lo slug non cambia più.
  - Il Markdown della descrizione lunga non esegue HTML attivo: un payload di script non viene renderizzato.
  - Inizio e fine si salvano come istanti con timezone e coprono più giorni.

Fonte PRD: [EVT-01](hackathon-platform-prd-v0.1.md#evt-01), [EVT-02](hackathon-platform-prd-v0.1.md#evt-02), [EVT-03](hackathon-platform-prd-v0.1.md#evt-03).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-02"></a>

## FEAT-EVT-02 — Programma: tracce, premi, giuria, agenda

**Titolo issue:** `FEAT-EVT-02: Programma: tracce, premi, giuria, agenda`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (EVT-04, EVT-05, EVT-06, EVT-07).
- Fase: 1.
- Stato codice: Parziale su main come contenuto statico (`lib/tracks.ts`, agenda, giuria con soli nomi per diversi giurati). Premi: array vuoto e sezione landing rimossa. Gap sull'editor.
- Dipendenze: FEAT-EVT-01. Nella migrazione Grok non si aggiunge un talk di Luca. I criteri di valutazione non diventano una sezione pubblica per questo solo fatto ([gap](gaps-and-questions.md#vincoli-grok)).
- Specifica: [features.md#feat-evt-02](features.md#feat-evt-02)

### Corpo

il programma pubblico si modifica dalla Console.

Scope: tracce ordinate; premi di podio o speciali, con traccia opzionale; giurati con foto, bio, link ed email di accesso; slot di agenda dentro la finestra dell'evento.

Criteri di accettazione:

  - Riordinare tracce e slot persiste l'ordine.
  - Uno slot fuori dalla finestra inizio-fine è rifiutato.
  - Un giurato salvato con email riceve l'accesso al voto (l'accesso effettivo è FEAT-APP-04).
  - Un premio speciale senza posizione di podio si salva, e un premio di podio salva la posizione.

Fonte PRD: [EVT-04](hackathon-platform-prd-v0.1.md#evt-04) … [EVT-07](hackathon-platform-prd-v0.1.md#evt-07).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-03"></a>

## FEAT-EVT-03 — Logo, palette e tema

**Titolo issue:** `FEAT-EVT-03: Logo, palette e tema`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (EVT-08, APP-03, NFR Accessibilità).
- Fase: 1 per l'editor, 2 per l'applicazione all'app pubblica.
- Stato codice: Parziale su main. Tema scuro unico in `app/globals.css`. Nessuna palette per evento.
- Dipendenze: quanto controllo colore serva oltre primario, accento e modalità è [domanda aperta](gaps-and-questions.md#domande). Fino ad allora il requisito resta quello scritto.
- Specifica: [features.md#feat-evt-03](features.md#feat-evt-03)

### Corpo

ogni evento ha un aspetto proprio, senza un tema illeggibile.

Scope: logo, colore primario, colore d'accento, modalità chiara o scura. Il sistema deriva gli altri token. Il contrasto WCAG AA blocca il salvataggio. Anteprima immediata. Il tema copre le pagine evento, il Portale Team e le email.

Criteri di accettazione:

  - Una coppia di colori sotto AA non si salva, e l'anteprima lo mostra prima dell'errore.
  - Una coppia AA si salva e le pagine `/h/:event-slug` e `/h/:event-slug/team` usano quei token.
  - Un'email dell'evento usa logo e palette.

Fonte PRD: [EVT-08](hackathon-platform-prd-v0.1.md#evt-08), [APP-03](hackathon-platform-prd-v0.1.md#app-03), [NFR Accessibilità](hackathon-platform-prd-v0.1.md#nfr).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-04"></a>

## FEAT-EVT-04 — Parametri dell'evento

**Titolo issue:** `FEAT-EVT-04: Parametri dell'evento`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (EVT-09).
- Fase: 1.
- Stato codice: Parziale su main come costanti (`PORTAL_DEADLINE`, min 4, max 6, capienza 100, un solo Luma event id). Criteri di landing volutamente vuoti. Rubriche di voto fisse nel database.
- Dipendenze: FEAT-ORG-04, [ADR-0005](adr/0005-registration-native-or-luma.md), [ADR-0009](adr/0009-configurable-criteria-authenticated-jury.md).
- Specifica: [features.md#feat-evt-04](features.md#feat-evt-04)

### Corpo

capienza, team, deadline, iscrizione, criteri e leaderboard sono dati dell'evento.

Scope: capienza, min e max membri, team lock, submission deadline, modalità di registrazione, Luma event id verificato contro la key, criteri (nome, peso, scala), visibilità della leaderboard.

Criteri di accettazione:

  - Senza key verificata, sync non è selezionabile.
  - Con key verificata, un Luma event id illeggibile da quella key è rifiutato.
  - I criteri salvati sono quelli letti da FEAT-APP-04, non le colonne fisse `judge_score` / `jury_vote`.
  - La visibilità della leaderboard assume uno dei quattro stati di APP-08.

Fonte PRD: [EVT-09](hackathon-platform-prd-v0.1.md#evt-09).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-05"></a>

## FEAT-EVT-05 — Anteprima, checklist, publish

**Titolo issue:** `FEAT-EVT-05: Anteprima, checklist, publish`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (EVT-10, passaggi 2, 7 e 8 del ciclo di vita).
- Fase: 1.
- Stato codice: Gap.
- Dipendenze: FEAT-EVT-01, FEAT-ORG-05 per la prima pubblicazione. Lo stato in cui mappare l'evento Grok oggi è [domanda aperta](gaps-and-questions.md#domande).
- Specifica: [features.md#feat-evt-05](features.md#feat-evt-05)

### Corpo

si pubblica solo un evento completo, e si può ritirare.

Scope: anteprima solo admin, checklist dei campi obbligatori, Publish, Unpublish. Published, Results published e Archived sono azioni esplicite. Unpublish verso Draft solo senza partecipanti.

Criteri di accettazione:

  - Un non-admin che apre l'anteprima di una bozza riceve 404 (insieme ad APP-01).
  - Publish con un campo obbligatorio mancante è rifiutato e la checklist indica il campo.
  - Unpublish con almeno un partecipante è rifiutato.
  - I passaggi Registration open, Running e Submissions closed scattano dai timestamp, senza un bottone.

Fonte PRD: [EVT-10](hackathon-platform-prd-v0.1.md#evt-10), [ciclo di vita](hackathon-platform-prd-v0.1.md#ciclo-di-vita).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-06"></a>

## FEAT-EVT-06 — Operazioni sull'evento

**Titolo issue:** `FEAT-EVT-06: Operazioni sull'evento`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (EVT-11).
- Fase: 1, con i dati di team e submission che maturano nelle fasi 3 e 4.
- Stato codice: Parziale su main. `/admin/dashboard` fa queste operazioni per l'unico evento, riservato a `SUPER_ADMIN_EMAILS`.
- Dipendenze: FEAT-F0, FEAT-REG-01 oppure FEAT-REG-02 per la guest list, FEAT-TEAM-01, FEAT-APP-04.
- Specifica: [features.md#feat-evt-06](features.md#feat-evt-06)

### Corpo

l'admin di organizzazione gestisce partecipanti, team, submission, giudici, mentor e punteggi di quell'evento.

Scope: guest list, team, export CSV delle submission, giudici e mentor, punteggi. Non include le cinque funzioni fuori v1.

Criteri di accettazione:

  - L'export CSV di un evento non contiene righe di un altro evento.
  - Un org admin dell'organizzazione vede queste schermate; un org admin di un'altra organizzazione no.
  - Giudici e mentor sono membership di evento, non un enum globale.

Fonte PRD: [EVT-11](hackathon-platform-prd-v0.1.md#evt-11), [ruoli](hackathon-platform-prd-v0.1.md#ruoli).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-07"></a>

## FEAT-EVT-07 — Duplica evento

**Titolo issue:** `FEAT-EVT-07: Duplica evento`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (EVT-12).
- Fase: dopo la 1, non è nella sequenza obbligatoria.
- Stato codice: Gap.
- Dipendenze: FEAT-EVT-01, FEAT-EVT-04.
- Specifica: [features.md#feat-evt-07](features.md#feat-evt-07)

### Corpo

un'edizione successiva non si ricopia a mano.

Scope: nuova bozza senza partecipanti e senza team.

Criteri di accettazione:

  - La bozza copia contenuti e parametri, ha slug nuovo, zero registrazioni e zero team.

Fonte PRD: [EVT-12](hackathon-platform-prd-v0.1.md#evt-12).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-evt-08"></a>

## FEAT-EVT-08 — Sponsor e host

**Titolo issue:** `FEAT-EVT-08: Sponsor e host`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (EVT-13).
- Fase: non è nella sequenza obbligatoria.
- Stato codice: Parziale su main per il solo evento Grok (dati e landing). Gap come modello multi-evento.
- Dipendenze: FEAT-F0, FEAT-APP-01.
- Specifica: [features.md#feat-evt-08](features.md#feat-evt-08)

### Corpo

l'evento Grok, che ha sponsor e host, non li perde quando i contenuti diventano dati. La PRD segna la voce come assente dalla lista requisiti originale e la aggiunge a P1.

Scope: sponsor e host come dati dell'evento, mostrati dall'app se presenti (APP-02 dice di non mostrare una sezione vuota; non elenca sponsor e host fra le sezioni). Il trattamento pubblico va tenuto coerente con i dati Grok attuali, senza inventare un layout nuovo in questa scheda.

Criteri di accettazione:

  - Un evento senza sponsor non mostra una sezione sponsor.
  - L'evento Grok migrato conserva gli sponsor e gli host già presenti in `lib/event.ts`.

Fonte PRD: [EVT-13](hackathon-platform-prd-v0.1.md#evt-13).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-reg-01"></a>

## FEAT-REG-01 — Iscrizione in sync da Luma

**Titolo issue:** `FEAT-REG-01: Iscrizione in sync da Luma`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 per gli eventi che scelgono sync. La fase esplicita della PRD per «registrazione» è la fase 5, limitata al nativo. Il sync è descritto in PRD-01 ed è necessario all'evento Grok.
- Fase: 1, prima del cutover dell'evento Grok.
- Stato codice: Parziale su main. Sync e lookup live esistono per un evento e una key di ambiente. Non sono per organizzazione né per evento come dato.
- Dipendenze: FEAT-ORG-04, FEAT-AUTH-01, [ADR-0005](adr/0005-registration-native-or-luma.md).
- Specifica: [features.md#feat-reg-01](features.md#feat-reg-01)

### Corpo

chi è approvato su Luma entra, chi perde l'approvazione perde l'accesso, senza CSV come unica via.

Scope: import di nome ed email, sync periodico e su richiesta, controllo live al login se l'email non è ancora importata, account creato al primo login.

Criteri di accettazione:

  - Una persona approved su Luma, dopo il sync, riceve il magic link e entra.
  - Una persona che passa da approved a non approved perde l'accesso al successivo controllo.
  - Un'email assente in locale e approved su Luma entra al login; un errore Luma non apre l'accesso da solo (comportamento già vero oggi sul sito singolo: va conservato, è più stretto della frase PRD e va confermato se il prodotto deve restare fail-closed).
  - La frequenza proposta di 15 minuti non è confermata ([domanda](gaps-and-questions.md#domande)). Il pulsante manuale è nel testo («su richiesta») ed è verificabile subito.

Fonte PRD: [modalità sync](hackathon-platform-prd-v0.1.md#reg-sync), [funzioni attuali](hackathon-platform-prd-v0.1.md#funzioni-attuali).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-reg-02"></a>

## FEAT-REG-02 — Iscrizione nativa

**Titolo issue:** `FEAT-REG-02: Iscrizione nativa`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 nel testo della modalità, fase 5 nella sequenza.
- Fase: 5.
- Stato codice: Gap. Oggi l'iscrizione pubblica è su Luma.
- Dipendenze: FEAT-AUTH-01, FEAT-EVT-04. È la feature che rende la piattaforma indipendente da Luma Plus.
- Specifica: [features.md#feat-reg-02](features.md#feat-reg-02)

### Corpo

un organizzatore senza Luma Plus iscrive i partecipanti sulla piattaforma.

Scope: nome, email, pochi campi personalizzati, approvazione automatica o manuale, capienza, waitlist.

Criteri di accettazione:

  - Con approvazione manuale, un iscritto non entra nel Portale finché non è approvato.
  - Raggiunta la capienza, l'iscrizione successiva va in waitlist e non risulta ammessa.
  - I campi personalizzati si definiscono per evento e compaiono nel modulo. Quanti e quali tipi non è scritto: non aggiungere tipi oltre «pochi campi» senza una decisione.

Fonte PRD: [modalità native](hackathon-platform-prd-v0.1.md#reg-native), [fase 5](hackathon-platform-prd-v0.1.md#fase-5).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-app-01"></a>

## FEAT-APP-01 — App pubblica dall'evento

**Titolo issue:** `FEAT-APP-01: App pubblica dall'evento`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (APP-01, APP-02, APP-04, APP-05, APP-06).
- Fase: 2.
- Stato codice: Parziale su main. Landing, agenda, tracce, regole e SEO esistono per un solo sito, letti dalle costanti, senza `/h/:event-slug`.
- Dipendenze: FEAT-EVT-05, FEAT-EVT-03, FEAT-AUTH-01. Parità visiva con il sito Grok attuale è il de-risk della fase 2, non un pixel-perfect non scritto.
- Specifica: [features.md#feat-app-01](features.md#feat-app-01)

### Corpo

l'evento pubblicato ha una pagina propria, generata dai dati, senza un deploy.

Scope: risoluzione slug, sezioni pubbliche, SEO, call to action secondo lo stato, ingresso al Portale.

Criteri di accettazione:

  - Slug inesistente o Draft: 404. Un admin dell'organizzazione apre l'anteprima.
  - Le sezioni di APP-02 compaiono solo se hanno contenuto.
  - Metadata, Open Graph generata, JSON-LD `Event`, sitemap limitata agli eventi pubblicati.
  - La call to action segue lo stato: registrati, accedi al Portale, submission chiuse, guarda i risultati.
  - Il link al Portale è `/h/:event-slug/team`. Sessione presente: ingresso diretto. Sessione assente: magic link e ritorno a quel portale.

Fonte PRD: [APP-01](hackathon-platform-prd-v0.1.md#app-01) … [APP-06](hackathon-platform-prd-v0.1.md#app-06), [fase 2](hackathon-platform-prd-v0.1.md#fase-2).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-app-02"></a>

## FEAT-APP-02 — Pubblicazione dei deliverable

**Titolo issue:** `FEAT-APP-02: Pubblicazione dei deliverable`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (APP-07).
- Fase: 4.
- Stato codice: Gap su main. La [PR #22](https://github.com/aletheia/grok-bot-hackathon/pull/22) aggiunge una vetrina in homepage letta dal database di produzione, senza pubblicazione esplicita e senza traccia né logo. È in attesa di approvazione. Non implementa APP-07 e non va contata come fatta.
- Dipendenze: FEAT-TEAM-06, [ADR-0010](adr/0010-deliverable-and-leaderboard-publication.md).
- Specifica: [features.md#feat-app-02](features.md#feat-app-02)

### Corpo

dopo la deadline, l'admin pubblica i progetti e può nasconderne uno.

Scope: pagina pubblica con nome, logo, traccia, descrizione, repository, video. Azione esplicita, solo dopo la submission deadline. Anteprima visibile al team. Nomi membri solo con FEAT-APP-05.

Criteri di accettazione:

  - Prima della deadline, e prima dell'azione admin, la pagina pubblica non elenca il progetto.
  - Dopo l'azione, i campi sopra sono visibili. Nascondere un progetto lo toglie senza cancellare la submission.
  - Il team vede l'anteprima della propria scheda anche prima della pubblicazione.

Fonte PRD: [APP-07](hackathon-platform-prd-v0.1.md#app-07).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-app-03"></a>

## FEAT-APP-03 — Leaderboard pubblicabile

**Titolo issue:** `FEAT-APP-03: Leaderboard pubblicabile`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (APP-08).
- Fase: 4.
- Stato codice: Parziale su main. `/ranking` è pubblico, con penalità e `finalScoreOverride`. Non ci sono i quattro stati né la classifica per traccia.
- Dipendenze: FEAT-APP-04, FEAT-EVT-04.
- Specifica: [features.md#feat-app-03](features.md#feat-app-03)

### Corpo

la classifica si mostra solo nello stato scelto dall'admin.

Scope: nascosta, live, congelata, finale. Classifica generale e per traccia. Penalità e override manuali restano.

Criteri di accettazione:

  - In stato nascosta la pagina pubblica non mostra punteggi.
  - In stato live i punteggi si aggiornano quando arriva un voto.
  - In stato congelata un voto nuovo non cambia la classifica pubblicata.
  - In stato finale la classifica resta quella pubblicata con i risultati.
  - Penalità di ritardo e override modificano il punteggio pubblicato, come oggi sul ranking singolo.
  - Esiste una classifica filtrata per traccia.

Fonte PRD: [APP-08](hackathon-platform-prd-v0.1.md#app-08).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-app-04"></a>

## FEAT-APP-04 — Giuria autenticata e criteri dell'evento

**Titolo issue:** `FEAT-APP-04: Giuria autenticata e criteri dell'evento`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (APP-09, APP-10, parte di EVT-06 e EVT-09).
- Fase: 4.
- Stato codice: Parziale su main, in senso opposto ad APP-09. `jury_vote` identifica il giurato con un nome libero, senza login (PR #21 unita). `judge_score` ha cinque colonne fisse. I criteri non sono pubblicati in landing: vedi il vincolo in [gap](gaps-and-questions.md#vincoli-grok).
- Dipendenze: FEAT-AUTH-01, FEAT-EVT-02, FEAT-EVT-04, [ADR-0009](adr/0009-configurable-criteria-authenticated-jury.md).
- Specifica: [features.md#feat-app-04](features.md#feat-app-04)

### Corpo

vota solo il giurato invitato, sui criteri di quell'evento.

Scope: login con email del giurato, un voto per giurato-team-criterio, modificabile fino alla chiusura del judging. Punteggi e classifica leggono i criteri della Console.

Criteri di accettazione:

  - Un visitatore senza login non invia un voto.
  - Un nome digitato a mano non sostituisce l'identità.
  - Il secondo invio dello stesso giurato, team e criterio aggiorna il voto invece di duplicarlo.
  - Dopo la chiusura del judging l'aggiornamento è rifiutato.
  - Cambiare nome, peso o scala in EVT-09 cambia il calcolo della classifica, senza una migrazione di colonne fisse.

Fonte PRD: [APP-09](hackathon-platform-prd-v0.1.md#app-09), [APP-10](hackathon-platform-prd-v0.1.md#app-10).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-app-05"></a>

## FEAT-APP-05 — Nomi dei membri in pubblico

**Titolo issue:** `FEAT-APP-05: Nomi dei membri in pubblico`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (APP-11).
- Fase: 4, opzionale.
- Stato codice: Gap. La PR #22, non unita, omette esplicitamente le liste membri.
- Dipendenze: FEAT-APP-02.
- Specifica: [features.md#feat-app-05](features.md#feat-app-05)

### Corpo

l'organizzatore decide se i nomi compaiono sulla scheda progetto.

Scope: un flag di evento. Default non specificato: non assumere «acceso».

Criteri di accettazione:

  - Con il flag spento, la pagina progetti non contiene i nomi dei membri.
  - Con il flag acceso, li contiene.

Fonte PRD: [APP-11](hackathon-platform-prd-v0.1.md#app-11).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-01"></a>

## FEAT-TEAM-01 — Portale nel contesto dell'evento

**Titolo issue:** `FEAT-TEAM-01: Portale nel contesto dell'evento`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (TEAM-01, TEAM-02, TEAM-03, TEAM-09).
- Fase: 3.
- Stato codice: Parziale su main. Creazione, un team attivo per utente in tutta la piattaforma (non per evento), min 4 e max 6, lock su `PORTAL_DEADLINE`. Il massimo è anche un check di database (`max_members <= 6`), il minimo no. Manca il nome generato e lo scoping per evento.
- Dipendenze: FEAT-F0, FEAT-AUTH-01, FEAT-EVT-04, [ADR-0008](adr/0008-event-scoped-teams.md), [ADR-0014](adr/0014-deterministic-team-name-logo.md) per il nome generato.
- Specifica: [features.md#feat-team-01](features.md#feat-team-01)

### Corpo

un partecipante crea un team dentro l'evento giusto, con un nome univoco, e non entra in due team dello stesso evento.

Scope: URL dell'evento, sessione condivisa, solo ammessi; creazione e ownership; nome 3–40 caratteri, univoco case-insensitive, precompilato e rigenerabile; un team attivo per utente per evento; min e max dai parametri; join concorrenti che non superano il massimo; sola lettura dopo il lock, salvo admin.

Criteri di accettazione:

  - Un utente non ammesso riceve un rifiuto su `/h/:event-slug/team`.
  - Un partecipante senza team crea il team e risulta owner.
  - Un nome di 2 caratteri, un nome duplicato a meno del maiuscolo, e un nome oltre 40 caratteri sono rifiutati.
  - Il nome proposto iniziale risulta libero; rigenerarlo ne propone un altro libero.
  - Due join simultanei sull'ultimo posto: uno solo riesce.
  - Dopo il team lock, create e join restituiscono errore; un admin può ancora correggere.

Fonte PRD: [TEAM-01](hackathon-platform-prd-v0.1.md#team-01), [TEAM-02](hackathon-platform-prd-v0.1.md#team-02), [TEAM-03](hackathon-platform-prd-v0.1.md#team-03), [TEAM-09](hackathon-platform-prd-v0.1.md#team-09).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-02"></a>

## FEAT-TEAM-02 — Logo del team

**Titolo issue:** `FEAT-TEAM-02: Logo del team`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (TEAM-04).
- Fase: 3.
- Stato codice: Gap.
- Dipendenze: FEAT-TEAM-01, FEAT-EVT-03 per i colori, [ADR-0014](adr/0014-deterministic-team-name-logo.md). Lo storage degli upload è [domanda aperta](gaps-and-questions.md#domande): la figura cita object storage, la prosa no.
- Specifica: [features.md#feat-team-02](features.md#feat-team-02)

### Corpo

ogni team ha un logo subito, e l'owner può sostituirlo.

Scope: logo deterministico di default, rigenerabile, oppure upload PNG, JPEG o WebP, massimo 2 MB, ritaglio quadrato. Mai bloccante.

Criteri di accettazione:

  - Un team appena creato ha un logo senza upload.
  - Un SVG è rifiutato. Un file oltre 2 MB è rifiutato. PNG, JPEG e WebP entro 2 MB sono accettati e mostrati quadrati.
  - La creazione del team non attende il caricamento.

Fonte PRD: [TEAM-04](hackathon-platform-prd-v0.1.md#team-04), [nome e logo](hackathon-platform-prd-v0.1.md#nome-e-logo), [NFR Sicurezza](hackathon-platform-prd-v0.1.md#nfr).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-03"></a>

## FEAT-TEAM-03 — Inviti email del team

**Titolo issue:** `FEAT-TEAM-03: Inviti email del team`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (TEAM-05, TEAM-06).
- Fase: 3.
- Stato codice: Gap. `team_invite` oggi è il codice di join, non un token email.
- Dipendenze: FEAT-AUTH-01, FEAT-TEAM-01, FEAT-REG-01 o FEAT-REG-02.
- Specifica: [features.md#feat-team-03](features.md#feat-team-03)

### Corpo

l'owner invita per email e l'invitato entra dal link, restando dentro le regole di ammissione.

Scope: uno o più indirizzi, token monouso legato all'email, validità fino al team lock, elenco, revoca, reinvio, massimo 10 pendenti. Stati pending, accepted, revoked, expired. Il link fa anche da login, con conferma, poi ingresso nel team.

Criteri di accettazione:

  - L'undicesimo invito pendente è rifiutato.
  - Il link consumato da un'altra email non entra nel team.
  - Revoca e reinvio funzionano sullo stato pending.
  - Al team lock l'invito diventa expired e il link non entra.
  - Se il team è pieno o l'invitato ha già un team, l'accettazione fallisce con messaggio esplicito e l'invito resta pending.
  - Opzione A, raccomandata e non confermata: se l'invitato non è ammesso, il link porta alla registrazione e l'invito resta pending. Non implementare l'opzione B finché Luca non sceglie ([ADR-0013](adr/0013-team-invite-does-not-admit.md)).

Fonte PRD: [TEAM-05](hackathon-platform-prd-v0.1.md#team-05), [TEAM-06](hackathon-platform-prd-v0.1.md#team-06), [stati](hackathon-platform-prd-v0.1.md#stati-invito), [opzione A](hackathon-platform-prd-v0.1.md#invito-opzione-a).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-04"></a>

## FEAT-TEAM-04 — Join con codice

**Titolo issue:** `FEAT-TEAM-04: Join con codice`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (TEAM-07).
- Fase: 3.
- Stato codice: Parziale su main. Codice a 8 caratteri, alfabeto senza 0/1/I/O, e rigenerazione (`regenerateInvite` in `lib/teams/service.ts`). Non risulta un limite di tentativi per utente nel servizio team.
- Dipendenze: FEAT-TEAM-01. Il rate limit è anche NFR Sicurezza.
- Specifica: [features.md#feat-team-04](features.md#feat-team-04)

### Corpo

chi ha il codice entra senza un invito email.

Scope: inserimento del codice, tentativi limitati per utente, rigenerazione che invalida il codice precedente.

Criteri di accettazione:

  - Il codice corretto fa entrare un partecipante ammesso e senza team.
  - Superata la soglia di tentativi, ulteriori tentativi sono rifiutati. La soglia non è numerata nella PRD.
  - Dopo la rigenerazione il codice vecchio fallisce e il nuovo funziona.

Fonte PRD: [TEAM-07](hackathon-platform-prd-v0.1.md#team-07).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-05"></a>

## FEAT-TEAM-05 — Gestione del team

**Titolo issue:** `FEAT-TEAM-05: Gestione del team`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (TEAM-08).
- Fase: 3.
- Stato codice: Parziale su main per leave, remove, passaggio del lead al membro più antico e archivio dell'ultimo. Il cambio logo non esiste.
- Dipendenze: FEAT-TEAM-01, FEAT-TEAM-02.
- Specifica: [features.md#feat-team-05](features.md#feat-team-05)

### Corpo

l'owner gestisce le persone e il team non resta senza owner finché ha membri.

Scope: rimozione, trasferimento ownership, cambio nome e logo, uscita di un membro, passaggio automatico all'entrato per primo se esce l'owner, archivio se esce l'ultimo.

Criteri di accettazione:

  - Un member che non è owner non rimuove gli altri e non trasferisce l'ownership.
  - Uscita dell'owner con altri membri: owner diventa chi ha `joined_at` minore.
  - Uscita dell'ultimo membro: il team risulta archiviato e il codice non funziona più.

Fonte PRD: [TEAM-08](hackathon-platform-prd-v0.1.md#team-08).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-06"></a>

## FEAT-TEAM-06 — Submission del deliverable

**Titolo issue:** `FEAT-TEAM-06: Submission del deliverable`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 (TEAM-10).
- Fase: 3 per la compilazione, 4 per la pubblicazione.
- Stato codice: Parziale su main. `project` ha nome, descrizione, repository obbligatorio, video e demo opzionali, editabile fino a `PORTAL_DEADLINE` da un membro attivo. Manca la traccia.
- Dipendenze: FEAT-TEAM-01, FEAT-EVT-02. Il controllo attuale sull'API pubblica di GitHub non è nominato in TEAM-10: tenerlo è una domanda, non un requisito aggiunto ([gap](gaps-and-questions.md#domande)).
- Specifica: [features.md#feat-team-06](features.md#feat-team-06)

### Corpo

ogni membro del team aggiorna il progetto fino alla deadline.

Scope: nome del progetto, traccia, descrizione, repository, video demo. Dopo la deadline, sola lettura.

Criteri di accettazione:

  - Un member salva e modifica tutti e cinque i campi prima della deadline.
  - Dopo la deadline il salvataggio è rifiutato e i valori restano leggibili.
  - La traccia è una delle tracce dell'evento.
  - Un utente fuori dal team non modifica la submission.

Fonte PRD: [TEAM-10](hackathon-platform-prd-v0.1.md#team-10), nota sotto APP-07.

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-07"></a>

## FEAT-TEAM-07 — Cerco un team

**Titolo issue:** `FEAT-TEAM-07: Cerco un team`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (TEAM-11).
- Fase: 3, non bloccante.
- Stato codice: Parziale su main. `available_for_team_at` e nota esistono; l'email non è nella lista. Non è scoped per evento.
- Dipendenze: FEAT-TEAM-01.
- Specifica: [features.md#feat-team-07](features.md#feat-team-07)

### Corpo

chi è senza team si rende visibile ai team che hanno posto, senza esporre l'email.

Scope: flag di disponibilità, nota, lista visibile ai team non pieni.

Criteri di accettazione:

  - La lista non contiene indirizzi email in HTML né in JSON.
  - Un team pieno non vede la lista, oppure la vede senza poter invitare oltre il massimo: la PRD dice «i team non pieni vedono la lista». Un team pieno non la riceve.
  - Entrare in un team toglie la disponibilità.

Fonte PRD: [TEAM-11](hackathon-platform-prd-v0.1.md#team-11).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-08"></a>

## FEAT-TEAM-08 — Team sotto il minimo

**Titolo issue:** `FEAT-TEAM-08: Team sotto il minimo`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (TEAM-12).
- Fase: 3.
- Stato codice: Parziale su main. Il minimo 4 definisce il team «formato» per l'admission, che è fuori v1. Non c'è il parametro «ammesso comunque».
- Dipendenze: FEAT-TEAM-01, FEAT-EVT-04.
- Specifica: [features.md#feat-team-08](features.md#feat-team-08)

### Corpo

il team sa di essere sotto il minimo, e l'evento decide l'ammissione alla deadline.

Scope: avviso in portale. Parametro di evento sull'ammissione dei team sotto minimo alla deadline. Non reintroduce la coda admission fuori v1: è una regola del singolo evento, ancora senza specifica operativa.

Criteri di accettazione:

  - Con membri sotto il minimo configurato, il portale mostra un avviso.
  - Alla deadline, il flag dell'evento ammette o non ammette quel team. Il comportamento preciso di «non ammesso» (submission bloccata, esclusa dalla leaderboard, altro) non è scritto: non va inventato in implementazione senza una risposta.

Fonte PRD: [TEAM-12](hackathon-platform-prd-v0.1.md#team-12).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-team-09"></a>

## FEAT-TEAM-09 — Moderazione di nome e logo

**Titolo issue:** `FEAT-TEAM-09: Moderazione di nome e logo`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P1 (TEAM-13).
- Fase: 3.
- Stato codice: Gap per nome e logo. L'admin attuale può correggere le membership.
- Dipendenze: FEAT-TEAM-01, FEAT-TEAM-02, FEAT-ORG-06.
- Specifica: [features.md#feat-team-09](features.md#feat-team-09)

### Corpo

un admin corregge un nome o un logo inadatto.

Scope: rinomina e sostituzione logo da admin di organizzazione.

Criteri di accettazione:

  - L'admin cambia nome e logo e il team vede i nuovi valori.
  - Il nuovo nome rispetta TEAM-03.
  - L'azione compare nell'audit (FEAT-ORG-06).

Fonte PRD: [TEAM-13](hackathon-platform-prd-v0.1.md#team-13).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-nfr-01"></a>

## FEAT-NFR-01 — Isolamento tenant

**Titolo issue:** `FEAT-NFR-01: Isolamento tenant`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 di fatto, perché la PRD lo mette fra i requisiti non funzionali della tenancy one-way door. Non ha colonna priorità.
- Fase: 0 e poi su ogni endpoint nuovo.
- Stato codice: Gap. Non esiste un secondo tenant.
- Dipendenze: FEAT-F0.
- Specifica: [features.md#feat-nfr-01](features.md#feat-nfr-01)

### Corpo

un tenant non legge e non scrive i dati di un altro.

Scope: filtro per organizzazione ed evento su ogni query di dominio, e un test automatico per endpoint.

Criteri di accettazione:

  - Per ogni endpoint che legge o scrive dati di evento, un test con un utente di un altro tenant riceve rifiuto o insieme vuoto, e il dato dell'altro tenant resta invariato.

Fonte PRD: [NFR Isolamento](hackathon-platform-prd-v0.1.md#nfr).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-nfr-02"></a>

## FEAT-NFR-02 — Dati personali

**Titolo issue:** `FEAT-NFR-02: Dati personali`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: nessuna nella PRD. Va trattato prima che un organizzatore reale carichi persone, non dopo la v1 funzionale.
- Fase: trasversale. L'evento Archived «segue la retention».
- Stato codice: Gap.
- Dipendenze: [ADR-0012](adr/0012-privacy-retention-export.md). Senza un DPA reale questa feature non è «fatta».
- Specifica: [features.md#feat-nfr-02](features.md#feat-nfr-02)

### Corpo

l'organizzatore è titolare, la piattaforma è responsabile del trattamento, e una persona può esportare o cancellare i propri dati.

Scope: DPA, informativa per evento, retention configurabile, export, cancellazione. I testi legali non si inventano in questo documento.

Criteri di accettazione:

  - Un partecipante ottiene un export dei propri dati di quell'evento.
  - Una cancellazione rimuove o anonimizza i dati personali secondo la retention configurata, e una seconda lettura non li restituisce.
  - L'informativa dell'evento è raggiungibile prima della registrazione.
  - Lo stato Archived non offre più modifiche, e la retention parte secondo il valore configurato.

Fonte PRD: [NFR Dati personali](hackathon-platform-prd-v0.1.md#nfr), stato Archived.

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-nfr-03"></a>

## FEAT-NFR-03 — Sicurezza e segreti

**Titolo issue:** `FEAT-NFR-03: Sicurezza e segreti`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: P0 operativo, senza colonna priorità. La 2FA è anche criterio di ORG-01.
- Fase: 1.
- Stato codice: Parziale su main. 2FA degli admin super-admin esiste. Rate limit sulle email OTP esiste (`email_throttle`). Non esiste la cifratura di una key per organizzazione, né il rifiuto SVG dei logo evento.
- Dipendenze: FEAT-AUTH-01, FEAT-ORG-04, [ADR-0006](adr/0006-luma-key-per-organization.md).
- Specifica: [features.md#feat-nfr-03](features.md#feat-nfr-03)

### Corpo

owner e admin non pubblicano senza secondo fattore, e la Luma key non esce dal server.

Scope: 2FA obbligatoria per owner e admin; rate limit su magic link, inviti e join code; upload validati, SVG rifiutati o sanitizzati; key cifrata a riposo, mai al client, mai nei log.

Criteri di accettazione:

  - Owner o admin senza 2FA non salva la Luma key e non pubblica.
  - I tre rate limit rispondono con rifiuto oltre soglia. Le soglie non sono nella PRD.
  - Gli upload di logo e copertina rifiutano un SVG e un MIME non ammesso.
  - Una ricerca della key nei payload HTTP di risposta e nei log di test non la trova in chiaro.

Fonte PRD: [NFR Sicurezza e Segreti](hackathon-platform-prd-v0.1.md#nfr).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).

<a id="issue-feat-del-01"></a>

## FEAT-DEL-01 — Vendoring di pstack

**Titolo issue:** `FEAT-DEL-01: Vendoring di pstack`

**Non creata.** Repository con issue disabilitate.

- Priorità suggerita: la PRD la mette prima del lavoro di prodotto (setup, punto 4: «solo dopo»). Non è confermata nella frase del 6 nov. Resta Proposed in [ADR-0016](adr/0016-pstack-vendoring.md).
- Fase: prerequisito di processo, separato dalle fasi di prodotto.
- Stato codice: Gap. Questa documentazione non vendorizzza il plugin.
- Dipendenze: piano Cursor Individuale o Teams, [domanda aperta](gaps-and-questions.md#domande). Con Teams il marketplace può sostituire il vendoring: non decidere al posto di Luca.
- Specifica: [features.md#feat-del-01](features.md#feat-del-01)

### Corpo

i Cloud Agent caricano skill e subagent dal repository, se Luca conferma questa strada.

Scope: la pull request di solo tooling descritta nel punto 2 del setup, più lo smoke test del punto 3. Non è questa pull request.

Criteri di accettazione:

  - (criteri non parsati)

Fonte PRD: [Delivery con pstack](hackathon-platform-prd-v0.1.md#delivery-pstack), [setup](hackathon-platform-prd-v0.1.md#pstack-setup).

Questa issue non autorizza l'implementazione. La PRD ha ancora decisioni Proposed e domande aperte in [gaps-and-questions.md](gaps-and-questions.md).
