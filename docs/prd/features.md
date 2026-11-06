# Feature — Hackathon Platform PRD v0.1

<a id="features"></a>

Documento di planning. Nessuna feature di questa pagina è implementata da questa pull request.

Fonte: [trascrizione](hackathon-platform-prd-v0.1.md). Decisioni: [indice ADR](adr/README.md). Copertura: [matrice](traceability.md). Domande: [gap e domande](gaps-and-questions.md). Bozze issue: [backlog](backlog.md).

Le priorità P0 e P1 sono quelle scritte nella PRD. Qui sono **priorità suggerite**, non una ri-pianificazione. Dove la PRD non assegna una priorità, il campo lo dice.

## Stato rispetto al codice

Verifica sul commit `db33ac9` (main al momento della lettura) e sulla [PR #22](https://github.com/aletheia/grok-bot-hackathon/pull/22), aperta, non unita, non considerata in produzione.

| Etichetta | Significato |
| --- | --- |
| Gap | Non c'è su main e non c'è nella PR #22 |
| Parziale su main | Il sito single-event copre una parte del comportamento, senza tenancy |
| In attesa nella PR #22 | Presente solo in quella PR. Non è il comportamento della PRD e non è deployato come decisione di prodotto |

## Fuori scope

Confermato nella fonte il 6 nov 2026, e quindi fuori dalla v1: admission, screening, credits, richieste ai mentor, pagina partnership. Pagine e API di queste cinque funzioni non sono raggiungibili nel prodotto multi-tenant; il codice può restare nel repository. Dettaglio in [ADR-0011](adr/0011-v1-exclusions.md).

Fuori dalla v1 anche, dalla sezione Organizzatore: billing e piani, custom domain per evento, admin limitati a un singolo evento, dominio email dell'organizzatore, SSO enterprise.

Non sono requisiti: più calendari Luma per organizzazione (la PRD li indica P1, oltre la key unica di v1), logo da modello generativo, subdomain come URL primario, microservizi, MESA come prodotto. «MESA Group» in [ORG-02](hackathon-platform-prd-v0.1.md#org-02) è solo un esempio di normalizzazione del nome.

Questa pull request non implementa le feature, non fa il vendoring di pstack, non modifica PR #22, non fa migrazioni e non tocca produzione.

## Fasi

La sequenza è quella della PRD ([tabella](hackathon-platform-prd-v0.1.md#sequenza)). La fase 0 non autorizza il merge automatico: la fonte chiede che il merge resti a Luca.

| Fase | Feature |
| --- | --- |
| 0. Fondazioni di tenancy | [FEAT-F0](#feat-f0). Dipende dalle ADR ancora Proposed su tenancy e identità |
| 1. Console Organizzatore | [FEAT-AUTH-01](#feat-auth-01), [FEAT-ORG-01](#feat-org-01) … [FEAT-ORG-06](#feat-org-06), [FEAT-EVT-01](#feat-evt-01) … [FEAT-EVT-06](#feat-evt-06), [FEAT-REG-01](#feat-reg-01), [FEAT-NFR-01](#feat-nfr-01), [FEAT-NFR-03](#feat-nfr-03) |
| 2. App evento dai dati | [FEAT-APP-01](#feat-app-01), [FEAT-EVT-03](#feat-evt-03) per il tema |
| 3. Portale Team | [FEAT-TEAM-01](#feat-team-01) … [FEAT-TEAM-06](#feat-team-06) |
| 4. Deliverable e leaderboard | [FEAT-APP-02](#feat-app-02), [FEAT-APP-03](#feat-app-03), [FEAT-APP-04](#feat-app-04) |
| 5. Registrazione nativa | [FEAT-REG-02](#feat-reg-02) |
| P1, senza fase obbligata | [FEAT-ORG-06](#feat-org-06) è P1 ma serve all'audit; [FEAT-EVT-07](#feat-evt-07), [FEAT-EVT-08](#feat-evt-08), [FEAT-APP-05](#feat-app-05), [FEAT-TEAM-07](#feat-team-07), [FEAT-TEAM-08](#feat-team-08), [FEAT-TEAM-09](#feat-team-09) |
| Trasversale, prima del prodotto solo se confermato | [FEAT-DEL-01](#feat-del-01) |
| Trasversale privacy | [FEAT-NFR-02](#feat-nfr-02), da collocare prima della prima organizzazione reale |

[FEAT-REG-01](#feat-reg-01) non è la fase 5. La fase 5 è solo la registrazione nativa. Il sync Luma serve per portare l'evento Grok, che oggi usa Luma, dentro la piattaforma. È un vincolo di cutover, non una nuova fase inventata.

<a id="feat-f0"></a>

## FEAT-F0 — Fondazioni di tenancy

- Priorità suggerita: prerequisito della fase 0, non ha un ID P0 proprio.
- Fase: 0.
- Valore: un organizzatore e l'evento Grok convivono nello stesso database senza un deploy per evento.
- Scope: organizzazione, evento come riga, membership, colonna organizzazione ed evento sulle tabelle di dominio, migrazione dell'evento Grok come primo evento. Lo scoping di ogni query è [FEAT-NFR-01](#feat-nfr-01).
- Criteri verificabili:
  - Esiste una riga evento il cui contenuto di partenza è quello di `lib/event.ts` e `lib/tracks.ts`, senza aggiungere uno slot d'agenda per un talk di Luca (vincolo di contenuto, [gap](gaps-and-questions.md#vincoli-grok)).
  - Un utente di un'altra organizzazione non legge quella riga (il test sta in FEAT-NFR-01).
  - I fatti oggi costanti (`EVENT`, `PORTAL_DEADLINE`) hanno un campo corrispondente, non un secondo file di costanti da committare per cambiarli.
- Dipendenze: [ADR-0001](adr/0001-tenancy-single-deployment.md) e [ADR-0004](adr/0004-global-account-and-memberships.md) sono Proposed. La fase 0 della PRD parte sulle assunzioni, non su un'accettazione successiva.
- Stato: Gap. Oggi `EVENT` è una costante in `lib/event.ts`.
- Fonte: [fase 0](hackathon-platform-prd-v0.1.md#fase-0), [da dove si parte](hackathon-platform-prd-v0.1.md#da-dove-si-parte).

<a id="feat-auth-01"></a>

## FEAT-AUTH-01 — Magic link e codice di ripiego

- Priorità suggerita: P0, perché ORG-01 e l'accesso partecipanti la richiedono.
- Fase: 1, usata anche da App e Portale.
- Valore: admin, partecipanti e giudici entrano con la stessa email, senza restare autenticati sul telefono per errore di uno scanner di posta.
- Scope: magic link più codice a 6 cifre nella stessa email. Owner e admin completano la 2FA dopo il link, prima di salvare un segreto o pubblicare.
- Criteri verificabili:
  - Il link scade dopo 15 minuti, è monouso, e viene consumato solo dopo una conferma esplicita sulla pagina di atterraggio.
  - Il codice a 6 cifre ha la stessa scadenza e si inserisce sul dispositivo da cui è partita la richiesta.
  - Usare il link invalida il codice, e usare il codice invalida il link.
  - Un link aperto da uno scanner, senza la conferma, non crea sessione.
  - Il rate limit sul magic link rifiuta il superamento della soglia (soglia numerica non scritta nella PRD: va fissata in implementazione e registrata, non inventata qui).
- Dipendenze: [ADR-0003](adr/0003-magic-link-and-otp-fallback.md).
- Stato: Parziale su main. I partecipanti hanno un codice a 6 cifre via Better Auth email OTP e Resend (`lib/auth.ts`). Gli admin hanno email, password e 2FA. Il magic link, la conferma esplicita e l'invalidazione incrociata non ci sono.
- Fonte: [Login](hackathon-platform-prd-v0.1.md#login), [ORG-01](hackathon-platform-prd-v0.1.md#org-01), [NFR Sicurezza](hackathon-platform-prd-v0.1.md#nfr).

<a id="feat-org-01"></a>

## FEAT-ORG-01 — Registrazione organizzazione

- Priorità suggerita: P0 (ORG-01, ORG-02).
- Fase: 1.
- Valore: una persona crea la propria organizzazione e ne diventa owner senza un commit.
- Scope: verifica email, nome organizzazione, unicità del nome normalizzato, lista di nomi riservati, slug modificabile finché nessun evento è pubblicato.
- Criteri verificabili:
  - Dopo il magic link, il flusso chiede il nome e assegna il ruolo owner a chi registra.
  - «MESA Group» e «mesa-group» non possono coesistere: il vincolo è sul nome normalizzato (minuscole, senza accenti, spazi e punteggiatura), oltre al controllo mentre si digita.
  - Un nome nella lista riservata è rifiutato. La lista non è specificata nella PRD: il contenuto della lista è una domanda aperta, non una lista inventata.
  - Lo slug cambia finché non esiste un evento pubblicato di quell'organizzazione, e non cambia dopo.
- Dipendenze: FEAT-AUTH-01, ADR-0001, ADR-0004. Chi può registrarsi è [domanda aperta](gaps-and-questions.md#domande).
- Stato: Gap.
- Fonte: [ORG-01](hackathon-platform-prd-v0.1.md#org-01), [ORG-02](hackathon-platform-prd-v0.1.md#org-02).

<a id="feat-org-02"></a>

## FEAT-ORG-02 — Inviti e membri admin

- Priorità suggerita: P0 (ORG-03, ORG-04).
- Fase: 1.
- Valore: l'owner non è l'unica persona che può gestire gli eventi.
- Scope: invito email con token, elenco inviti, ruoli owner e admin, protezione dell'ultimo owner.
- Criteri verificabili:
  - L'invito è un token monouso, legato all'email invitata, valido 7 giorni.
  - L'accettazione autentica la stessa email. Un'altra email non consuma il token.
  - Un invito pendente si vede, si revoca e si reinvia.
  - Un admin vede e gestisce tutti gli eventi dell'organizzazione.
  - L'ultimo owner non può essere rimosso né declassato.
- Dipendenze: FEAT-ORG-01. L'admin limitato a un solo evento è fuori v1.
- Stato: Gap. Esiste l'invito staff del sito attuale, non l'invito admin di organizzazione.
- Fonte: [ORG-03](hackathon-platform-prd-v0.1.md#org-03), [ORG-04](hackathon-platform-prd-v0.1.md#org-04), [ruoli](hackathon-platform-prd-v0.1.md#ruoli).

<a id="feat-org-03"></a>

## FEAT-ORG-03 — Impostazioni organizzazione

- Priorità suggerita: P0 (ORG-05).
- Fase: 1.
- Valore: i nuovi eventi ereditano timezone, dimensione team e palette, e le email escono con il mittente dell'organizzazione.
- Scope: nome visualizzato, logo, timezone di default, nome mittente, reply-to, default per i nuovi eventi (dimensione dei team, palette).
- Criteri verificabili:
  - Salvare ciascuno di quei campi e rileggerlo.
  - Un evento nuovo nasce con i default dell'organizzazione e può poi avere i propri parametri (EVT-09).
  - Il reply-to compare sull'email transazionale.
- Dipendenze: FEAT-ORG-01. Il contatto `hackathon@radixia.ai` non va scritto qui come default di piattaforma: è un vincolo possibile dell'evento Grok, non verificato nel repository ([gap](gaps-and-questions.md#vincoli-grok)).
- Stato: Gap.
- Fonte: [ORG-05](hackathon-platform-prd-v0.1.md#org-05).

<a id="feat-org-04"></a>

## FEAT-ORG-04 — Luma API key dell'organizzazione

- Priorità suggerita: P0 (ORG-06).
- Fase: 1.
- Valore: ogni organizzazione collega il proprio calendario Luma senza una variabile d'ambiente condivisa.
- Scope: campo write-only, verifica contro Luma al salvataggio, ultimi 4 caratteri, data di verifica, sostituzione, revoca. Una key per organizzazione in v1.
- Criteri verificabili:
  - Dopo il salvataggio il client non riceve la key, e i log non la contengono.
  - La risposta di verifica mostra esito, ultimi 4 caratteri e data.
  - La key è rifiutata o marcata non verificata se la chiamata a Luma fallisce, e in quel caso la modalità sync non è selezionabile.
  - Revoca: gli eventi in sync tengono i nominativi già importati, smettono di aggiornarsi, e gli admin vedono un avviso.
  - Una seconda key per un altro calendario della stessa organizzazione non è un requisito v1 (la PRD lo segna P1).
- Dipendenze: [ADR-0006](adr/0006-luma-key-per-organization.md), FEAT-NFR-03, 2FA già richiesta da ORG-01 prima di salvare un segreto.
- Stato: Parziale su main. `LUMA_API_KEY` e `LUMA_EVENT_API_ID` sono variabili d'ambiente di tutta l'applicazione (`.env.example`). Non c'è una key cifrata per organizzazione.
- Fonte: [ORG-06](hackathon-platform-prd-v0.1.md#org-06), [NFR Segreti](hackathon-platform-prd-v0.1.md#nfr), paragrafo dopo ORG-08 sui vincoli Luma.

<a id="feat-org-05"></a>

## FEAT-ORG-05 — Approvazione della prima pubblicazione

- Priorità suggerita: P0 (ORG-07).
- Fase: 1.
- Valore: una organizzazione nuova non pubblica da sola una pagina sul dominio della piattaforma.
- Scope: le bozze sono libere; la prima pubblicazione attende un platform admin.
- Criteri verificabili:
  - Un owner senza approvazione può creare e vedere l'anteprima, e Publish restituisce un rifiuto esplicito.
  - Un platform admin approva, e solo dopo Publish va a buon fine.
  - Un platform admin può sospendere un evento (ruolo in tabella Ruoli).
- Dipendenze: FEAT-EVT-05. Se l'evento Grok già pubblico debba passare di nuovo da questa approvazione è [domanda aperta](gaps-and-questions.md#domande). Proposta non approvata: grandfathering, non una decisione.
- Stato: Gap. Oggi pubblica chi è in `SUPER_ADMIN_EMAILS`, senza un secondo ruolo di piattaforma.
- Fonte: [ORG-07](hackathon-platform-prd-v0.1.md#org-07), [ruoli](hackathon-platform-prd-v0.1.md#ruoli).

<a id="feat-org-06"></a>

## FEAT-ORG-06 — Audit log

- Priorità suggerita: P1 (ORG-08). Il NFR Audit non ha priorità separata ed è lo stesso comportamento.
- Fase: 1, perché le azioni admin nascono con la Console.
- Valore: un owner ricostruisce chi ha cambiato cosa.
- Scope: autore, oggetto, ora, consultazione riservata agli owner.
- Criteri verificabili:
  - Pubblicare un evento, invitare un admin, sostituire la Luma key e cambiare un punteggio producono righe distinte con autore e ora.
  - Un admin che non è owner non legge il registro, se la PRD resta letterale («consultabile dagli owner»).
- Dipendenze: le azioni delle altre feature di Console.
- Stato: Gap per questo registro. I crediti hanno un audit proprio, e i crediti sono fuori v1.
- Fonte: [ORG-08](hackathon-platform-prd-v0.1.md#org-08), [NFR Audit](hackathon-platform-prd-v0.1.md#nfr).

<a id="feat-evt-01"></a>

## FEAT-EVT-01 — Scheda evento: identità, testi, logistica

- Priorità suggerita: P0 (EVT-01, EVT-02, EVT-03).
- Fase: 1.
- Valore: l'organizzatore descrive l'hackathon senza editare `lib/event.ts`.
- Scope: nome, slug unico di piattaforma, timezone, slug immutabile dopo la pubblicazione; titolo, descrizione breve, descrizione lunga in Markdown sanitizzato, copertina; luogo, mappa, come arrivare, inizio e fine con timezone, lista requisiti.
- Criteri verificabili:
  - Due eventi non ottengono lo stesso slug.
  - Dopo Publish lo slug non cambia più.
  - Il Markdown della descrizione lunga non esegue HTML attivo: un payload di script non viene renderizzato.
  - Inizio e fine si salvano come istanti con timezone e coprono più giorni.
- Dipendenze: FEAT-F0, FEAT-ORG-01.
- Stato: Parziale su main come dati costanti, non come editor. Gap sulla Console.
- Fonte: [EVT-01](hackathon-platform-prd-v0.1.md#evt-01), [EVT-02](hackathon-platform-prd-v0.1.md#evt-02), [EVT-03](hackathon-platform-prd-v0.1.md#evt-03).

<a id="feat-evt-02"></a>

## FEAT-EVT-02 — Programma: tracce, premi, giuria, agenda

- Priorità suggerita: P0 (EVT-04, EVT-05, EVT-06, EVT-07).
- Fase: 1.
- Valore: il programma pubblico si modifica dalla Console.
- Scope: tracce ordinate; premi di podio o speciali, con traccia opzionale; giurati con foto, bio, link ed email di accesso; slot di agenda dentro la finestra dell'evento.
- Criteri verificabili:
  - Riordinare tracce e slot persiste l'ordine.
  - Uno slot fuori dalla finestra inizio-fine è rifiutato.
  - Un giurato salvato con email riceve l'accesso al voto (l'accesso effettivo è FEAT-APP-04).
  - Un premio speciale senza posizione di podio si salva, e un premio di podio salva la posizione.
- Dipendenze: FEAT-EVT-01. Nella migrazione Grok non si aggiunge un talk di Luca. I criteri di valutazione non diventano una sezione pubblica per questo solo fatto ([gap](gaps-and-questions.md#vincoli-grok)).
- Stato: Parziale su main come contenuto statico (`lib/tracks.ts`, agenda, giuria con soli nomi per diversi giurati). Premi: array vuoto e sezione landing rimossa. Gap sull'editor.
- Fonte: [EVT-04](hackathon-platform-prd-v0.1.md#evt-04) … [EVT-07](hackathon-platform-prd-v0.1.md#evt-07).

<a id="feat-evt-03"></a>

## FEAT-EVT-03 — Logo, palette e tema

- Priorità suggerita: P0 (EVT-08, APP-03, NFR Accessibilità).
- Fase: 1 per l'editor, 2 per l'applicazione all'app pubblica.
- Valore: ogni evento ha un aspetto proprio, senza un tema illeggibile.
- Scope: logo, colore primario, colore d'accento, modalità chiara o scura. Il sistema deriva gli altri token. Il contrasto WCAG AA blocca il salvataggio. Anteprima immediata. Il tema copre le pagine evento, il Portale Team e le email.
- Criteri verificabili:
  - Una coppia di colori sotto AA non si salva, e l'anteprima lo mostra prima dell'errore.
  - Una coppia AA si salva e le pagine `/h/:event-slug` e `/h/:event-slug/team` usano quei token.
  - Un'email dell'evento usa logo e palette.
- Dipendenze: quanto controllo colore serva oltre primario, accento e modalità è [domanda aperta](gaps-and-questions.md#domande). Fino ad allora il requisito resta quello scritto.
- Stato: Parziale su main. Tema scuro unico in `app/globals.css`. Nessuna palette per evento.
- Fonte: [EVT-08](hackathon-platform-prd-v0.1.md#evt-08), [APP-03](hackathon-platform-prd-v0.1.md#app-03), [NFR Accessibilità](hackathon-platform-prd-v0.1.md#nfr).

<a id="feat-evt-04"></a>

## FEAT-EVT-04 — Parametri dell'evento

- Priorità suggerita: P0 (EVT-09).
- Fase: 1.
- Valore: capienza, team, deadline, iscrizione, criteri e leaderboard sono dati dell'evento.
- Scope: capienza, min e max membri, team lock, submission deadline, modalità di registrazione, Luma event id verificato contro la key, criteri (nome, peso, scala), visibilità della leaderboard.
- Criteri verificabili:
  - Senza key verificata, sync non è selezionabile.
  - Con key verificata, un Luma event id illeggibile da quella key è rifiutato.
  - I criteri salvati sono quelli letti da FEAT-APP-04, non le colonne fisse `judge_score` / `jury_vote`.
  - La visibilità della leaderboard assume uno dei quattro stati di APP-08.
- Dipendenze: FEAT-ORG-04, [ADR-0005](adr/0005-registration-native-or-luma.md), [ADR-0009](adr/0009-configurable-criteria-authenticated-jury.md).
- Stato: Parziale su main come costanti (`PORTAL_DEADLINE`, min 4, max 6, capienza 100, un solo Luma event id). Criteri di landing volutamente vuoti. Rubriche di voto fisse nel database.
- Fonte: [EVT-09](hackathon-platform-prd-v0.1.md#evt-09).

<a id="feat-evt-05"></a>

## FEAT-EVT-05 — Anteprima, checklist, publish

- Priorità suggerita: P0 (EVT-10, passaggi 2, 7 e 8 del ciclo di vita).
- Fase: 1.
- Valore: si pubblica solo un evento completo, e si può ritirare.
- Scope: anteprima solo admin, checklist dei campi obbligatori, Publish, Unpublish. Published, Results published e Archived sono azioni esplicite. Unpublish verso Draft solo senza partecipanti.
- Criteri verificabili:
  - Un non-admin che apre l'anteprima di una bozza riceve 404 (insieme ad APP-01).
  - Publish con un campo obbligatorio mancante è rifiutato e la checklist indica il campo.
  - Unpublish con almeno un partecipante è rifiutato.
  - I passaggi Registration open, Running e Submissions closed scattano dai timestamp, senza un bottone.
- Dipendenze: FEAT-EVT-01, FEAT-ORG-05 per la prima pubblicazione. Lo stato in cui mappare l'evento Grok oggi è [domanda aperta](gaps-and-questions.md#domande).
- Stato: Gap.
- Fonte: [EVT-10](hackathon-platform-prd-v0.1.md#evt-10), [ciclo di vita](hackathon-platform-prd-v0.1.md#ciclo-di-vita).

<a id="feat-evt-06"></a>

## FEAT-EVT-06 — Operazioni sull'evento

- Priorità suggerita: P0 (EVT-11).
- Fase: 1, con i dati di team e submission che maturano nelle fasi 3 e 4.
- Valore: l'admin di organizzazione gestisce partecipanti, team, submission, giudici, mentor e punteggi di quell'evento.
- Scope: guest list, team, export CSV delle submission, giudici e mentor, punteggi. Non include le cinque funzioni fuori v1.
- Criteri verificabili:
  - L'export CSV di un evento non contiene righe di un altro evento.
  - Un org admin dell'organizzazione vede queste schermate; un org admin di un'altra organizzazione no.
  - Giudici e mentor sono membership di evento, non un enum globale.
- Dipendenze: FEAT-F0, FEAT-REG-01 oppure FEAT-REG-02 per la guest list, FEAT-TEAM-01, FEAT-APP-04.
- Stato: Parziale su main. `/admin/dashboard` fa queste operazioni per l'unico evento, riservato a `SUPER_ADMIN_EMAILS`.
- Fonte: [EVT-11](hackathon-platform-prd-v0.1.md#evt-11), [ruoli](hackathon-platform-prd-v0.1.md#ruoli).

<a id="feat-evt-07"></a>

## FEAT-EVT-07 — Duplica evento

- Priorità suggerita: P1 (EVT-12).
- Fase: dopo la 1, non è nella sequenza obbligatoria.
- Valore: un'edizione successiva non si ricopia a mano.
- Scope: nuova bozza senza partecipanti e senza team.
- Criteri verificabili:
  - La bozza copia contenuti e parametri, ha slug nuovo, zero registrazioni e zero team.
- Dipendenze: FEAT-EVT-01, FEAT-EVT-04.
- Stato: Gap.
- Fonte: [EVT-12](hackathon-platform-prd-v0.1.md#evt-12).

<a id="feat-evt-08"></a>

## FEAT-EVT-08 — Sponsor e host

- Priorità suggerita: P1 (EVT-13).
- Fase: non è nella sequenza obbligatoria.
- Valore: l'evento Grok, che ha sponsor e host, non li perde quando i contenuti diventano dati. La PRD segna la voce come assente dalla lista requisiti originale e la aggiunge a P1.
- Scope: sponsor e host come dati dell'evento, mostrati dall'app se presenti (APP-02 dice di non mostrare una sezione vuota; non elenca sponsor e host fra le sezioni). Il trattamento pubblico va tenuto coerente con i dati Grok attuali, senza inventare un layout nuovo in questa scheda.
- Criteri verificabili:
  - Un evento senza sponsor non mostra una sezione sponsor.
  - L'evento Grok migrato conserva gli sponsor e gli host già presenti in `lib/event.ts`.
- Dipendenze: FEAT-F0, FEAT-APP-01.
- Stato: Parziale su main per il solo evento Grok (dati e landing). Gap come modello multi-evento.
- Fonte: [EVT-13](hackathon-platform-prd-v0.1.md#evt-13).

<a id="feat-reg-01"></a>

## FEAT-REG-01 — Iscrizione in sync da Luma

- Priorità suggerita: P0 per gli eventi che scelgono sync. La fase esplicita della PRD per «registrazione» è la fase 5, limitata al nativo. Il sync è descritto in PRD-01 ed è necessario all'evento Grok.
- Fase: 1, prima del cutover dell'evento Grok.
- Valore: chi è approvato su Luma entra, chi perde l'approvazione perde l'accesso, senza CSV come unica via.
- Scope: import di nome ed email, sync periodico e su richiesta, controllo live al login se l'email non è ancora importata, account creato al primo login.
- Criteri verificabili:
  - Una persona approved su Luma, dopo il sync, riceve il magic link e entra.
  - Una persona che passa da approved a non approved perde l'accesso al successivo controllo.
  - Un'email assente in locale e approved su Luma entra al login; un errore Luma non apre l'accesso da solo (comportamento già vero oggi sul sito singolo: va conservato, è più stretto della frase PRD e va confermato se il prodotto deve restare fail-closed).
  - La frequenza proposta di 15 minuti non è confermata ([domanda](gaps-and-questions.md#domande)). Il pulsante manuale è nel testo («su richiesta») ed è verificabile subito.
- Dipendenze: FEAT-ORG-04, FEAT-AUTH-01, [ADR-0005](adr/0005-registration-native-or-luma.md).
- Stato: Parziale su main. Sync e lookup live esistono per un evento e una key di ambiente. Non sono per organizzazione né per evento come dato.
- Fonte: [modalità sync](hackathon-platform-prd-v0.1.md#reg-sync), [funzioni attuali](hackathon-platform-prd-v0.1.md#funzioni-attuali).

<a id="feat-reg-02"></a>

## FEAT-REG-02 — Iscrizione nativa

- Priorità suggerita: P0 nel testo della modalità, fase 5 nella sequenza.
- Fase: 5.
- Valore: un organizzatore senza Luma Plus iscrive i partecipanti sulla piattaforma.
- Scope: nome, email, pochi campi personalizzati, approvazione automatica o manuale, capienza, waitlist.
- Criteri verificabili:
  - Con approvazione manuale, un iscritto non entra nel Portale finché non è approvato.
  - Raggiunta la capienza, l'iscrizione successiva va in waitlist e non risulta ammessa.
  - I campi personalizzati si definiscono per evento e compaiono nel modulo. Quanti e quali tipi non è scritto: non aggiungere tipi oltre «pochi campi» senza una decisione.
- Dipendenze: FEAT-AUTH-01, FEAT-EVT-04. È la feature che rende la piattaforma indipendente da Luma Plus.
- Stato: Gap. Oggi l'iscrizione pubblica è su Luma.
- Fonte: [modalità native](hackathon-platform-prd-v0.1.md#reg-native), [fase 5](hackathon-platform-prd-v0.1.md#fase-5).

<a id="feat-app-01"></a>

## FEAT-APP-01 — App pubblica dall'evento

- Priorità suggerita: P0 (APP-01, APP-02, APP-04, APP-05, APP-06).
- Fase: 2.
- Valore: l'evento pubblicato ha una pagina propria, generata dai dati, senza un deploy.
- Scope: risoluzione slug, sezioni pubbliche, SEO, call to action secondo lo stato, ingresso al Portale.
- Criteri verificabili:
  - Slug inesistente o Draft: 404. Un admin dell'organizzazione apre l'anteprima.
  - Le sezioni di APP-02 compaiono solo se hanno contenuto.
  - Metadata, Open Graph generata, JSON-LD `Event`, sitemap limitata agli eventi pubblicati.
  - La call to action segue lo stato: registrati, accedi al Portale, submission chiuse, guarda i risultati.
  - Il link al Portale è `/h/:event-slug/team`. Sessione presente: ingresso diretto. Sessione assente: magic link e ritorno a quel portale.
- Dipendenze: FEAT-EVT-05, FEAT-EVT-03, FEAT-AUTH-01. Parità visiva con il sito Grok attuale è il de-risk della fase 2, non un pixel-perfect non scritto.
- Stato: Parziale su main. Landing, agenda, tracce, regole e SEO esistono per un solo sito, letti dalle costanti, senza `/h/:event-slug`.
- Fonte: [APP-01](hackathon-platform-prd-v0.1.md#app-01) … [APP-06](hackathon-platform-prd-v0.1.md#app-06), [fase 2](hackathon-platform-prd-v0.1.md#fase-2).

<a id="feat-app-02"></a>

## FEAT-APP-02 — Pubblicazione dei deliverable

- Priorità suggerita: P0 (APP-07).
- Fase: 4.
- Valore: dopo la deadline, l'admin pubblica i progetti e può nasconderne uno.
- Scope: pagina pubblica con nome, logo, traccia, descrizione, repository, video. Azione esplicita, solo dopo la submission deadline. Anteprima visibile al team. Nomi membri solo con FEAT-APP-05.
- Criteri verificabili:
  - Prima della deadline, e prima dell'azione admin, la pagina pubblica non elenca il progetto.
  - Dopo l'azione, i campi sopra sono visibili. Nascondere un progetto lo toglie senza cancellare la submission.
  - Il team vede l'anteprima della propria scheda anche prima della pubblicazione.
- Dipendenze: FEAT-TEAM-06, [ADR-0010](adr/0010-deliverable-and-leaderboard-publication.md).
- Stato: Gap su main. La [PR #22](https://github.com/aletheia/grok-bot-hackathon/pull/22) aggiunge una vetrina in homepage letta dal database di produzione, senza pubblicazione esplicita e senza traccia né logo. È in attesa di approvazione. Non implementa APP-07 e non va contata come fatta.
- Fonte: [APP-07](hackathon-platform-prd-v0.1.md#app-07).

<a id="feat-app-03"></a>

## FEAT-APP-03 — Leaderboard pubblicabile

- Priorità suggerita: P0 (APP-08).
- Fase: 4.
- Valore: la classifica si mostra solo nello stato scelto dall'admin.
- Scope: nascosta, live, congelata, finale. Classifica generale e per traccia. Penalità e override manuali restano.
- Criteri verificabili:
  - In stato nascosta la pagina pubblica non mostra punteggi.
  - In stato live i punteggi si aggiornano quando arriva un voto.
  - In stato congelata un voto nuovo non cambia la classifica pubblicata.
  - In stato finale la classifica resta quella pubblicata con i risultati.
  - Penalità di ritardo e override modificano il punteggio pubblicato, come oggi sul ranking singolo.
  - Esiste una classifica filtrata per traccia.
- Dipendenze: FEAT-APP-04, FEAT-EVT-04.
- Stato: Parziale su main. `/ranking` è pubblico, con penalità e `finalScoreOverride`. Non ci sono i quattro stati né la classifica per traccia.
- Fonte: [APP-08](hackathon-platform-prd-v0.1.md#app-08).

<a id="feat-app-04"></a>

## FEAT-APP-04 — Giuria autenticata e criteri dell'evento

- Priorità suggerita: P0 (APP-09, APP-10, parte di EVT-06 e EVT-09).
- Fase: 4.
- Valore: vota solo il giurato invitato, sui criteri di quell'evento.
- Scope: login con email del giurato, un voto per giurato-team-criterio, modificabile fino alla chiusura del judging. Punteggi e classifica leggono i criteri della Console.
- Criteri verificabili:
  - Un visitatore senza login non invia un voto.
  - Un nome digitato a mano non sostituisce l'identità.
  - Il secondo invio dello stesso giurato, team e criterio aggiorna il voto invece di duplicarlo.
  - Dopo la chiusura del judging l'aggiornamento è rifiutato.
  - Cambiare nome, peso o scala in EVT-09 cambia il calcolo della classifica, senza una migrazione di colonne fisse.
- Dipendenze: FEAT-AUTH-01, FEAT-EVT-02, FEAT-EVT-04, [ADR-0009](adr/0009-configurable-criteria-authenticated-jury.md).
- Stato: Parziale su main, in senso opposto ad APP-09. `jury_vote` identifica il giurato con un nome libero, senza login (PR #21 unita). `judge_score` ha cinque colonne fisse. I criteri non sono pubblicati in landing: vedi il vincolo in [gap](gaps-and-questions.md#vincoli-grok).
- Fonte: [APP-09](hackathon-platform-prd-v0.1.md#app-09), [APP-10](hackathon-platform-prd-v0.1.md#app-10).

<a id="feat-app-05"></a>

## FEAT-APP-05 — Nomi dei membri in pubblico

- Priorità suggerita: P1 (APP-11).
- Fase: 4, opzionale.
- Valore: l'organizzatore decide se i nomi compaiono sulla scheda progetto.
- Scope: un flag di evento. Default non specificato: non assumere «acceso».
- Criteri verificabili:
  - Con il flag spento, la pagina progetti non contiene i nomi dei membri.
  - Con il flag acceso, li contiene.
- Dipendenze: FEAT-APP-02.
- Stato: Gap. La PR #22, non unita, omette esplicitamente le liste membri.
- Fonte: [APP-11](hackathon-platform-prd-v0.1.md#app-11).

<a id="feat-team-01"></a>

## FEAT-TEAM-01 — Portale nel contesto dell'evento

- Priorità suggerita: P0 (TEAM-01, TEAM-02, TEAM-03, TEAM-09).
- Fase: 3.
- Valore: un partecipante crea un team dentro l'evento giusto, con un nome univoco, e non entra in due team dello stesso evento.
- Scope: URL dell'evento, sessione condivisa, solo ammessi; creazione e ownership; nome 3–40 caratteri, univoco case-insensitive, precompilato e rigenerabile; un team attivo per utente per evento; min e max dai parametri; join concorrenti che non superano il massimo; sola lettura dopo il lock, salvo admin.
- Criteri verificabili:
  - Un utente non ammesso riceve un rifiuto su `/h/:event-slug/team`.
  - Un partecipante senza team crea il team e risulta owner.
  - Un nome di 2 caratteri, un nome duplicato a meno del maiuscolo, e un nome oltre 40 caratteri sono rifiutati.
  - Il nome proposto iniziale risulta libero; rigenerarlo ne propone un altro libero.
  - Due join simultanei sull'ultimo posto: uno solo riesce.
  - Dopo il team lock, create e join restituiscono errore; un admin può ancora correggere.
- Dipendenze: FEAT-F0, FEAT-AUTH-01, FEAT-EVT-04, [ADR-0008](adr/0008-event-scoped-teams.md), [ADR-0014](adr/0014-deterministic-team-name-logo.md) per il nome generato.
- Stato: Parziale su main. Creazione, un team attivo per utente in tutta la piattaforma (non per evento), min 4 e max 6, lock su `PORTAL_DEADLINE`. Il massimo è anche un check di database (`max_members <= 6`), il minimo no. Manca il nome generato e lo scoping per evento.
- Fonte: [TEAM-01](hackathon-platform-prd-v0.1.md#team-01), [TEAM-02](hackathon-platform-prd-v0.1.md#team-02), [TEAM-03](hackathon-platform-prd-v0.1.md#team-03), [TEAM-09](hackathon-platform-prd-v0.1.md#team-09).

<a id="feat-team-02"></a>

## FEAT-TEAM-02 — Logo del team

- Priorità suggerita: P0 (TEAM-04).
- Fase: 3.
- Valore: ogni team ha un logo subito, e l'owner può sostituirlo.
- Scope: logo deterministico di default, rigenerabile, oppure upload PNG, JPEG o WebP, massimo 2 MB, ritaglio quadrato. Mai bloccante.
- Criteri verificabili:
  - Un team appena creato ha un logo senza upload.
  - Un SVG è rifiutato. Un file oltre 2 MB è rifiutato. PNG, JPEG e WebP entro 2 MB sono accettati e mostrati quadrati.
  - La creazione del team non attende il caricamento.
- Dipendenze: FEAT-TEAM-01, FEAT-EVT-03 per i colori, [ADR-0014](adr/0014-deterministic-team-name-logo.md). Lo storage degli upload è [domanda aperta](gaps-and-questions.md#domande): la figura cita object storage, la prosa no.
- Stato: Gap.
- Fonte: [TEAM-04](hackathon-platform-prd-v0.1.md#team-04), [nome e logo](hackathon-platform-prd-v0.1.md#nome-e-logo), [NFR Sicurezza](hackathon-platform-prd-v0.1.md#nfr).

<a id="feat-team-03"></a>

## FEAT-TEAM-03 — Inviti email del team

- Priorità suggerita: P0 (TEAM-05, TEAM-06).
- Fase: 3.
- Valore: l'owner invita per email e l'invitato entra dal link, restando dentro le regole di ammissione.
- Scope: uno o più indirizzi, token monouso legato all'email, validità fino al team lock, elenco, revoca, reinvio, massimo 10 pendenti. Stati pending, accepted, revoked, expired. Il link fa anche da login, con conferma, poi ingresso nel team.
- Criteri verificabili:
  - L'undicesimo invito pendente è rifiutato.
  - Il link consumato da un'altra email non entra nel team.
  - Revoca e reinvio funzionano sullo stato pending.
  - Al team lock l'invito diventa expired e il link non entra.
  - Se il team è pieno o l'invitato ha già un team, l'accettazione fallisce con messaggio esplicito e l'invito resta pending.
  - Opzione A, raccomandata e non confermata: se l'invitato non è ammesso, il link porta alla registrazione e l'invito resta pending. Non implementare l'opzione B finché Luca non sceglie ([ADR-0013](adr/0013-team-invite-does-not-admit.md)).
- Dipendenze: FEAT-AUTH-01, FEAT-TEAM-01, FEAT-REG-01 o FEAT-REG-02.
- Stato: Gap. `team_invite` oggi è il codice di join, non un token email.
- Fonte: [TEAM-05](hackathon-platform-prd-v0.1.md#team-05), [TEAM-06](hackathon-platform-prd-v0.1.md#team-06), [stati](hackathon-platform-prd-v0.1.md#stati-invito), [opzione A](hackathon-platform-prd-v0.1.md#invito-opzione-a).

<a id="feat-team-04"></a>

## FEAT-TEAM-04 — Join con codice

- Priorità suggerita: P0 (TEAM-07).
- Fase: 3.
- Valore: chi ha il codice entra senza un invito email.
- Scope: inserimento del codice, tentativi limitati per utente, rigenerazione che invalida il codice precedente.
- Criteri verificabili:
  - Il codice corretto fa entrare un partecipante ammesso e senza team.
  - Superata la soglia di tentativi, ulteriori tentativi sono rifiutati. La soglia non è numerata nella PRD.
  - Dopo la rigenerazione il codice vecchio fallisce e il nuovo funziona.
- Dipendenze: FEAT-TEAM-01. Il rate limit è anche NFR Sicurezza.
- Stato: Parziale su main. Codice a 8 caratteri, alfabeto senza 0/1/I/O, e rigenerazione (`regenerateInvite` in `lib/teams/service.ts`). Non risulta un limite di tentativi per utente nel servizio team.
- Fonte: [TEAM-07](hackathon-platform-prd-v0.1.md#team-07).

<a id="feat-team-05"></a>

## FEAT-TEAM-05 — Gestione del team

- Priorità suggerita: P0 (TEAM-08).
- Fase: 3.
- Valore: l'owner gestisce le persone e il team non resta senza owner finché ha membri.
- Scope: rimozione, trasferimento ownership, cambio nome e logo, uscita di un membro, passaggio automatico all'entrato per primo se esce l'owner, archivio se esce l'ultimo.
- Criteri verificabili:
  - Un member che non è owner non rimuove gli altri e non trasferisce l'ownership.
  - Uscita dell'owner con altri membri: owner diventa chi ha `joined_at` minore.
  - Uscita dell'ultimo membro: il team risulta archiviato e il codice non funziona più.
- Dipendenze: FEAT-TEAM-01, FEAT-TEAM-02.
- Stato: Parziale su main per leave, remove, passaggio del lead al membro più antico e archivio dell'ultimo. Il cambio logo non esiste.
- Fonte: [TEAM-08](hackathon-platform-prd-v0.1.md#team-08).

<a id="feat-team-06"></a>

## FEAT-TEAM-06 — Submission del deliverable

- Priorità suggerita: P0 (TEAM-10).
- Fase: 3 per la compilazione, 4 per la pubblicazione.
- Valore: ogni membro del team aggiorna il progetto fino alla deadline.
- Scope: nome del progetto, traccia, descrizione, repository, video demo. Dopo la deadline, sola lettura.
- Criteri verificabili:
  - Un member salva e modifica tutti e cinque i campi prima della deadline.
  - Dopo la deadline il salvataggio è rifiutato e i valori restano leggibili.
  - La traccia è una delle tracce dell'evento.
  - Un utente fuori dal team non modifica la submission.
- Dipendenze: FEAT-TEAM-01, FEAT-EVT-02. Il controllo attuale sull'API pubblica di GitHub non è nominato in TEAM-10: tenerlo è una domanda, non un requisito aggiunto ([gap](gaps-and-questions.md#domande)).
- Stato: Parziale su main. `project` ha nome, descrizione, repository obbligatorio, video e demo opzionali, editabile fino a `PORTAL_DEADLINE` da un membro attivo. Manca la traccia.
- Fonte: [TEAM-10](hackathon-platform-prd-v0.1.md#team-10), nota sotto APP-07.

<a id="feat-team-07"></a>

## FEAT-TEAM-07 — Cerco un team

- Priorità suggerita: P1 (TEAM-11).
- Fase: 3, non bloccante.
- Valore: chi è senza team si rende visibile ai team che hanno posto, senza esporre l'email.
- Scope: flag di disponibilità, nota, lista visibile ai team non pieni.
- Criteri verificabili:
  - La lista non contiene indirizzi email in HTML né in JSON.
  - Un team pieno non vede la lista, oppure la vede senza poter invitare oltre il massimo: la PRD dice «i team non pieni vedono la lista». Un team pieno non la riceve.
  - Entrare in un team toglie la disponibilità.
- Dipendenze: FEAT-TEAM-01.
- Stato: Parziale su main. `available_for_team_at` e nota esistono; l'email non è nella lista. Non è scoped per evento.
- Fonte: [TEAM-11](hackathon-platform-prd-v0.1.md#team-11).

<a id="feat-team-08"></a>

## FEAT-TEAM-08 — Team sotto il minimo

- Priorità suggerita: P1 (TEAM-12).
- Fase: 3.
- Valore: il team sa di essere sotto il minimo, e l'evento decide l'ammissione alla deadline.
- Scope: avviso in portale. Parametro di evento sull'ammissione dei team sotto minimo alla deadline. Non reintroduce la coda admission fuori v1: è una regola del singolo evento, ancora senza specifica operativa.
- Criteri verificabili:
  - Con membri sotto il minimo configurato, il portale mostra un avviso.
  - Alla deadline, il flag dell'evento ammette o non ammette quel team. Il comportamento preciso di «non ammesso» (submission bloccata, esclusa dalla leaderboard, altro) non è scritto: non va inventato in implementazione senza una risposta.
- Dipendenze: FEAT-TEAM-01, FEAT-EVT-04.
- Stato: Parziale su main. Il minimo 4 definisce il team «formato» per l'admission, che è fuori v1. Non c'è il parametro «ammesso comunque».
- Fonte: [TEAM-12](hackathon-platform-prd-v0.1.md#team-12).

<a id="feat-team-09"></a>

## FEAT-TEAM-09 — Moderazione di nome e logo

- Priorità suggerita: P1 (TEAM-13).
- Fase: 3.
- Valore: un admin corregge un nome o un logo inadatto.
- Scope: rinomina e sostituzione logo da admin di organizzazione.
- Criteri verificabili:
  - L'admin cambia nome e logo e il team vede i nuovi valori.
  - Il nuovo nome rispetta TEAM-03.
  - L'azione compare nell'audit (FEAT-ORG-06).
- Dipendenze: FEAT-TEAM-01, FEAT-TEAM-02, FEAT-ORG-06.
- Stato: Gap per nome e logo. L'admin attuale può correggere le membership.
- Fonte: [TEAM-13](hackathon-platform-prd-v0.1.md#team-13).

<a id="feat-nfr-01"></a>

## FEAT-NFR-01 — Isolamento tenant

- Priorità suggerita: P0 di fatto, perché la PRD lo mette fra i requisiti non funzionali della tenancy one-way door. Non ha colonna priorità.
- Fase: 0 e poi su ogni endpoint nuovo.
- Valore: un tenant non legge e non scrive i dati di un altro.
- Scope: filtro per organizzazione ed evento su ogni query di dominio, e un test automatico per endpoint.
- Criteri verificabili:
  - Per ogni endpoint che legge o scrive dati di evento, un test con un utente di un altro tenant riceve rifiuto o insieme vuoto, e il dato dell'altro tenant resta invariato.
- Dipendenze: FEAT-F0.
- Stato: Gap. Non esiste un secondo tenant.
- Fonte: [NFR Isolamento](hackathon-platform-prd-v0.1.md#nfr).

<a id="feat-nfr-02"></a>

## FEAT-NFR-02 — Dati personali

- Priorità suggerita: nessuna nella PRD. Va trattato prima che un organizzatore reale carichi persone, non dopo la v1 funzionale.
- Fase: trasversale. L'evento Archived «segue la retention».
- Valore: l'organizzatore è titolare, la piattaforma è responsabile del trattamento, e una persona può esportare o cancellare i propri dati.
- Scope: DPA, informativa per evento, retention configurabile, export, cancellazione. I testi legali non si inventano in questo documento.
- Criteri verificabili:
  - Un partecipante ottiene un export dei propri dati di quell'evento.
  - Una cancellazione rimuove o anonimizza i dati personali secondo la retention configurata, e una seconda lettura non li restituisce.
  - L'informativa dell'evento è raggiungibile prima della registrazione.
  - Lo stato Archived non offre più modifiche, e la retention parte secondo il valore configurato.
- Dipendenze: [ADR-0012](adr/0012-privacy-retention-export.md). Senza un DPA reale questa feature non è «fatta».
- Stato: Gap.
- Fonte: [NFR Dati personali](hackathon-platform-prd-v0.1.md#nfr), stato Archived.

<a id="feat-nfr-03"></a>

## FEAT-NFR-03 — Sicurezza e segreti

- Priorità suggerita: P0 operativo, senza colonna priorità. La 2FA è anche criterio di ORG-01.
- Fase: 1.
- Valore: owner e admin non pubblicano senza secondo fattore, e la Luma key non esce dal server.
- Scope: 2FA obbligatoria per owner e admin; rate limit su magic link, inviti e join code; upload validati, SVG rifiutati o sanitizzati; key cifrata a riposo, mai al client, mai nei log.
- Criteri verificabili:
  - Owner o admin senza 2FA non salva la Luma key e non pubblica.
  - I tre rate limit rispondono con rifiuto oltre soglia. Le soglie non sono nella PRD.
  - Gli upload di logo e copertina rifiutano un SVG e un MIME non ammesso.
  - Una ricerca della key nei payload HTTP di risposta e nei log di test non la trova in chiaro.
- Dipendenze: FEAT-AUTH-01, FEAT-ORG-04, [ADR-0006](adr/0006-luma-key-per-organization.md).
- Stato: Parziale su main. 2FA degli admin super-admin esiste. Rate limit sulle email OTP esiste (`email_throttle`). Non esiste la cifratura di una key per organizzazione, né il rifiuto SVG dei logo evento.
- Fonte: [NFR Sicurezza e Segreti](hackathon-platform-prd-v0.1.md#nfr).

<a id="feat-del-01"></a>

## FEAT-DEL-01 — Vendoring di pstack

- Priorità suggerita: la PRD la mette prima del lavoro di prodotto (setup, punto 4: «solo dopo»). Non è confermata nella frase del 6 nov. Resta Proposed in [ADR-0016](adr/0016-pstack-vendoring.md).
- Fase: prerequisito di processo, separato dalle fasi di prodotto.
- Valore: i Cloud Agent caricano skill e subagent dal repository, se Luca conferma questa strada.
- Scope: la pull request di solo tooling descritta nel punto 2 del setup, più lo smoke test del punto 3. Non è questa pull request.
- Criteri verificabili, citati dalla PRD:
  - `.cursor/skills/` contiene le skill di pstack, `.cursor/agents/` i subagent, più le skill di cursor-team-kit usate dai playbook.
  - Un file registra URL, licenza e commit upstream.
  - Una rule di progetto fissa i modelli, e `AGENTS.md` riporta i comandi di build e test.
  - Lo smoke test passa se `/poteto-help` carica la skill, `/poteto-mode` avvia `poteto-agent`, e i modelli sono quelli della rule.
- Dipendenze: piano Cursor Individuale o Teams, [domanda aperta](gaps-and-questions.md#domande). Con Teams il marketplace può sostituire il vendoring: non decidere al posto di Luca.
- Stato: Gap. Questa documentazione non vendorizzza il plugin.
- Fonte: [Delivery con pstack](hackathon-platform-prd-v0.1.md#delivery-pstack), [setup](hackathon-platform-prd-v0.1.md#pstack-setup).

## Carico

Il carico «50–500 partecipanti, meno di 10 eventi contemporanei nel primo anno» è un assunto, non una feature. Non produce uno SLA. È registrato in [ADR-0001](adr/0001-tenancy-single-deployment.md) come contesto, e nella [matrice](traceability.md).
