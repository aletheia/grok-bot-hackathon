# Gap, conflitti e domande

<a id="gap"></a>

Niente in questa pagina è una decisione nuova. Dove c'è una proposta, è marcata come proposta e non sostituisce la PRD.

Baseline di codice: `db33ac9` su main. [PR #22](https://github.com/aletheia/grok-bot-hackathon/pull/22) «Add a public showcase of submitted projects» è aperta, mergeable, con preview Vercel passata e un commento Bugbot. Non è unita, non va chiusa o modificata da questo lavoro, e non va contata come deploy.

Le issue GitHub del repository sono disabilitate (`gh issue list` risponde che il repository ha le issue disabilitate). Il backlog importabile è [backlog.md](backlog.md). Nessuna issue è stata creata.

<a id="vincoli-grok"></a>

## Vincoli dell'evento Grok già nel repository

Questi vincoli non sono scritti nella PRD. Se la migrazione dell'evento li violasse, il conflitto va risolto da Luca, non in silenzio.

| Vincolo | Evidenza | Rapporto con la PRD | Proposta, non approvata |
| --- | --- | --- | --- |
| I criteri di valutazione non si pubblicano sul sito | Commento in `lib/event.ts` («Leave EVENT.criteria empty») e test in `lib/landing-content.test.ts` | EVT-09 e APP-10 rendono i criteri dati di calcolo. APP-02 non elenca una sezione criteri. Il ranking pubblico attuale mostra comunque le etichette della rubrica fissa | I criteri restano fuori dalla landing. Se la leaderboard live debba mostrare i nomi dei criteri è una domanda, non un sì |
| Il talk di Luca non è in agenda | `EVENT.schedule` non ha uno slot a suo nome. In giuria e fra gli host il nome c'è | EVT-07 è un editor generico e non vieta quello slot | Nella migrazione non aggiungere uno slot «talk di Luca». Non è una regola di piattaforma |
| Contatto partecipanti `hackathon@radixia.ai` | Non compare nel repository. `EVENT.sponsors.contact.email` è `null`, con un TODO | ORG-05 ha un reply-to di organizzazione, senza indirizzo | Non impostarlo come default di piattaforma. Chiedere se è il reply-to dell'organizzazione dell'evento Grok |

MESA non è un requisito. In [ORG-02](hackathon-platform-prd-v0.1.md#org-02) «MESA Group» e «mesa-group» sono un esempio di collisione fra nomi normalizzati. La PR #18, già unita, ha tolto «Meet the MESetAs» dall'agenda: è storia del sito, non una feature da pianificare.

<a id="conflitti"></a>

## Conflitti e tensioni

1. **PR #22 e APP-07.** APP-07 pubblica i progetti solo con un'azione admin, dopo la deadline, con traccia e logo. La PR #22 legge i team con repository e li mostra in homepage. Sono comportamenti diversi. Proposta non approvata: lasciare la PR #22 nel suo iter e non citarla come implementazione di APP-07.
2. **Rubrica fissa e criteri configurabili.** `judge_score` ha cinque colonne con massimi 25/25/20/15/15. `jury_vote` ha tre colonne da 1 a 5 e il giurato è un nome libero (PR #21 unita). APP-09 e APP-10 chiedono l'opposto per il prodotto. Il codice attuale resta valido per l'evento singolo finché il prodotto non esiste.
3. **Check di database e parametri dell'evento.** La PRD dice «dimensione 4–6 con check a database». Il check `team_max_members_limit_check` impone `max_members <= 6`. Il minimo 4 è logica applicativa (`TEAM_LIMITS`), non un vincolo che il team debba avere già 4 membri. EVT-09 vuole min e max come campi. Il tetto 6 hardcoded non sopravvive letteralmente.
4. **Enum ruoli.** La PRD elenca `participant`, `super_admin`, `judge`, `mentor`. Lo schema ha anche `moderator` e `reviewer`. Non vanno cancellati in questa documentazione. Vanno decisi in migrazione.
5. **Figura e prosa.** La prosa fissa `/h/:event-slug`. La figura aggiunge la Console su `/o/:org-slug` e un object storage per loghi e cover. Né il path della Console né il fornitore dello storage sono requisiti testuali.
6. **Admin di singolo evento.** La sezione «Fuori dalla v1» lo esclude. La domanda aperta chiede se basta l'admin di organizzazione. Tensione interna della fonte. Proposta non approvata: tenere l'esclusione come assunto di lavoro finché la domanda non ha risposta.
7. **Errore Luma al login.** Il sito attuale, se Luma fallisce, decide sulla tabella locale e non apre l'accesso per l'errore. La PRD dice che un'email non importata «viene verificata su Luma» e non descrive il fallimento della chiamata. Proposta non approvata: restare fail-closed.
8. **Controllo del repository GitHub.** TEAM-10 chiede un campo repository. Il sito attuale verifica l'URL contro l'API pubblica di GitHub, in modo fail-soft. Non è scritto nella PRD. Proposta non approvata: non aggiungere il controllo come requisito, e non toglierlo dall'evento attuale in questa PR.
9. **TEAM-12 e admission.** TEAM-12 chiede se un team sotto il minimo è ammesso alla deadline. L'admission con posti garantiti e coda è fuori v1. Non sono la stessa funzione. Il significato operativo di «non ammesso» non è specificato.
10. **Testo «l'estate esistente».** L'assunto sullo stack dice così, nel DOCX (`l'estate esistente`). Sembra un refuso per l'assetto o lo stack esistente. La trascrizione non lo corregge. Non è una decisione sull'estate.
11. **Dokploy e Vercel.** `docs/DOKPLOY.md` descrive un deploy Dokploy. Il workflow attuale è `.github/workflows/vercel.yml` (preview su PR, produzione su main con environment `production`). La PRD assume Vercel e lascia aperta la scelta AWS. Non c'è un conflitto da chiudere qui.
12. **ORG-07 e l'evento già pubblico.** Una organizzazione nuova non pubblica senza un platform admin. L'evento Grok è già online. Applicargli di nuovo quel gate non è scritto.

<a id="contesto-non-verificato"></a>

## Contesto indicato, non verificato nel repository

| Affermazione | Cosa si vede nel repo |
| --- | --- |
| PostgreSQL su Neon | `DATABASE_URL` generico. Nessun host Neon in codice o docs. Drizzle dichiara un peer opzionale `@neondatabase/serverless`, non è la connessione usata (`postgres`) |
| Team Vercel Radixia | Il workflow usa `VERCEL_ORG_ID` segreto. Il nome del team non è nel repo. Radixia compare come sponsor in `lib/event.ts` |
| Sito `pavia.grokbot.it` | `getSiteUrl()` legge `NEXT_PUBLIC_SITE_URL` o `VERCEL_URL`. Il dominio non è committato |
| Better Auth ha un plugin organizzazioni adatto alla 1.2 in uso | La PRD dice di non averlo verificato. Questa lettura non lo ha verificato sulla versione risolta |

<a id="domande"></a>

## Domande per Luca

Quelle già aperte nella PRD restano aperte. Si aggiungono i punti nati dal confronto col repository.

Dalla PRD, senza risposta in questa documentazione:

1. Chi può creare un'organizzazione: self-service, approvazione, o invito? Il prezzo è fuori v1: la domanda sul prezzo resta senza modello.
2. Invito a chi non è iscritto: opzione A (raccomandata, default proposto) o B?
3. Il sync Luma ogni 15 minuti va bene? Il pulsante manuale è già nel requisito.
4. Dominio e nome del prodotto. `pavia.grokbot.it` è il sito dell'evento, non un nome di piattaforma scritto nel repo.
5. Serve l'italiano, scelto per evento? Oggi l'interfaccia è inglese.
6. Hosting: restare su Vercel e PostgreSQL, oppure AWS? Neon e il team Radixia sono contesto esterno non verificato nel codice.
7. Piano Cursor Individuale o Teams? Con Teams il vendoring di pstack non è l'unica strada.
8. In v1 basta l'admin sull'intera organizzazione? La sezione «fuori v1» dice già di sì, e la domanda lo rimette in discussione.
9. Bastano primario, accento e modalità chiara o scura?

Dal confronto col codice e con i vincoli dell'evento:

10. La PR #22 resta un cambiamento del sito attuale, separato da APP-07?
11. I nomi dei criteri compaiono sulla leaderboard pubblica, oppure restano solo interni come sulla landing?
12. `hackathon@radixia.ai` è il reply-to dell'organizzazione che possiede l'evento Grok?
13. L'evento Grok già pubblicato salta ORG-07 (grandfathering) oppure serve un platform admin?
14. In quale stato del ciclo di vita va mappato oggi l'evento Grok? La deadline di submission nel codice è il 5 nov 2026 alle 17:00 Europe/Rome, e questa lettura è del 6 nov 2026. Lo stato non si deduce da soli: submissions closed, judging o results published sono tutti plausibili e nessuno è stato scelto.
15. Il path della Console è `/o/:org-slug`, come nella figura?
16. Quale object storage per loghi e cover, e i file in `public/` si migrano lì?
17. Il controllo fail-soft del repository GitHub resta nella submission?
18. Se Luma non risponde al login, si resta sulla copia locale senza aprire l'accesso?
19. I ruoli `moderator` e `reviewer` si ritirano?
20. Il plugin organizzazioni di Better Auth, sulla versione installata, si usa o si modellano le membership a mano? Va verificato prima di scegliere, come chiede la PRD.
21. Quali nomi entrano nella lista riservata di ORG-02? Non è specificata.
22. Qual è la soglia dei rate limit su magic link, inviti e join code? Non è numerata.
23. Qual è il default del flag che mostra i nomi dei membri (APP-11)? Non è scritto.
24. Cosa significa, in pratica, che un team sotto il minimo «non è ammesso» alla deadline?

## Cosa non è stato deciso

Tenancy, URL, account globale, key Luma per organizzazione, monolith con outbox, vendoring di pstack, generatore deterministico, opzione A degli inviti, hosting. Sono Proposed o Unresolved nelle [ADR](adr/README.md). La frase di conferma del 6 nov 2026 non li elenca.
