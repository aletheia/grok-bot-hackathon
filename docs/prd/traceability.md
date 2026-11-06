# Matrice di tracciabilità — PRD v0.1

<a id="matrice"></a>

Ogni riga punta alla [trascrizione](hackathon-platform-prd-v0.1.md). Le feature sono in [features.md](features.md). Le ADR sono in [adr/README.md](adr/README.md). I conflitti non risolti sono in [gaps-and-questions.md](gaps-and-questions.md).

Gli ID `ORG-*`, `EVT-*`, `APP-*` e `TEAM-*` sono quelli della fonte. Gli altri riferimenti (`DEC-*`, `RUOLO-*`, `LIFE-*`, `NFR-*`, `REG-*`, `FN-*`, `Q-*`, `A-*`) sono localizzatori di questo documento, non identificatori presenti nel DOCX.

Stato implementazione, verificato su `db33ac9` e sulla PR #22 non unita:

- **Gap** — assente su main e nella PR #22.
- **Parziale** — comportamento single-event su main, non il prodotto descritto.
- **PR #22** — solo nella pull request aperta, che non va trattata come deploy né come APP-07.
- **Confermato nella fonte** — frase del 6 nov 2026. Non è codice.
- **Proposed** — raccomandazione della PRD, senza conferma in quella frase.
- **Unresolved** — domanda aperta, nessuna scelta.

## Decisioni raccomandate

| Ref | Testo | Fonte | Feature | ADR | Stato |
| --- | --- | --- | --- | --- | --- |
| DEC-TENANCY | Un deployment, un database, riga legata a organization ed event | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-F0](features.md#feat-f0) | [0001](adr/0001-tenancy-single-deployment.md) | Proposed. Gap |
| DEC-URL | Path `/h/:event-slug` e `/team` | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-APP-01](features.md#feat-app-01) | [0002](adr/0002-event-url-path.md) | Proposed. Gap. La figura aggiunge `/o/:org-slug`, non deciso |
| DEC-IDENTITY | Account globale, magic link, membership | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md), [0004](adr/0004-global-account-and-memberships.md) | Magic link e codice: confermati nella fonte. Account globale e membership: Proposed. Parziale (solo OTP) |
| DEC-REG | Native oppure sync, sync solo con key | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-REG-01](features.md#feat-reg-01), [FEAT-REG-02](features.md#feat-reg-02) | [0005](adr/0005-registration-native-or-luma.md) | Confermato nella fonte. Parziale sul solo sync single-event |
| DEC-LUMAKEY | Segreto di organizzazione, cifrato, write-only | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-ORG-04](features.md#feat-org-04) | [0006](adr/0006-luma-key-per-organization.md) | Proposed. Parziale (env unica) |
| DEC-ARCH | Modular monolith, outbox in-process | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-F0](features.md#feat-f0) | [0007](adr/0007-modular-monolith-outbox.md) | Proposed. Il monolith Next.js c'è; l'outbox no |
| DEC-PSTACK | Vendoring nel repository | [tabella](hackathon-platform-prd-v0.1.md#tabella-decisioni) | [FEAT-DEL-01](features.md#feat-del-01) | [0016](adr/0016-pstack-vendoring.md) | Proposed. Gap. Non fatto in questa PR |
| DEC-CONFIRM | Conferma del 6 nov 2026: native o sync; magic link e codice; questo repository; cinque funzioni fuori v1 | [paragrafo](hackathon-platform-prd-v0.1.md#conferma-6-nov) | vedi ADR | [0003](adr/0003-magic-link-and-otp-fallback.md), [0005](adr/0005-registration-native-or-luma.md), [0011](adr/0011-v1-exclusions.md), [0015](adr/0015-stay-in-this-repository.md) | Confermato nella fonte, non implementato come piattaforma |

## Ruoli

| Ref | Ruolo | Feature | ADR | Stato |
| --- | --- | --- | --- | --- |
| RUOLO-PLATFORM | Platform admin: approva organizzazioni, sospende eventi | [FEAT-ORG-05](features.md#feat-org-05) | [0004](adr/0004-global-account-and-memberships.md) | Gap |
| RUOLO-OWNER | Org owner: admin, più admin, Luma key, cancellazione | [FEAT-ORG-02](features.md#feat-org-02), [FEAT-ORG-04](features.md#feat-org-04) | [0004](adr/0004-global-account-and-memberships.md) | Gap |
| RUOLO-ORG-ADMIN | Org admin: tutti gli eventi dell'organizzazione | [FEAT-ORG-02](features.md#feat-org-02), [FEAT-EVT-06](features.md#feat-evt-06) | [0004](adr/0004-global-account-and-memberships.md) | Gap. Oggi un super admin globale |
| RUOLO-JUDGE | Giudice e mentor di evento | [FEAT-EVT-06](features.md#feat-evt-06), [FEAT-APP-04](features.md#feat-app-04) | [0004](adr/0004-global-account-and-memberships.md) | Parziale: enum globale `judge` e `mentor`. Lo schema ha anche `moderator` e `reviewer`, non citati dalla PRD |
| RUOLO-TEAM-OWNER | Inviti, rimozione, ownership, nome, logo | [FEAT-TEAM-03](features.md#feat-team-03), [FEAT-TEAM-05](features.md#feat-team-05) | [0008](adr/0008-event-scoped-teams.md) | Parziale, senza logo né invito email |
| RUOLO-TEAM-MEMBER | Submission e uscita | [FEAT-TEAM-05](features.md#feat-team-05), [FEAT-TEAM-06](features.md#feat-team-06) | [0008](adr/0008-event-scoped-teams.md) | Parziale |
| RUOLO-PART | Creare o entrare in un team | [FEAT-TEAM-01](features.md#feat-team-01) | [0008](adr/0008-event-scoped-teams.md) | Parziale, un team globale |
| RUOLO-MULTI | La stessa persona può essere admin di un'organizzazione e partecipante di un'altra | [FEAT-F0](features.md#feat-f0) | [0004](adr/0004-global-account-and-memberships.md) | Gap |

## Login e ciclo di vita

| Ref | Requisito | Feature | ADR | Stato |
| --- | --- | --- | --- | --- |
| LOGIN-1 | Link scade dopo 15 minuti | [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md) | Gap |
| LOGIN-2 | Link monouso | [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md) | Gap |
| LOGIN-3 | Consumo solo alla conferma esplicita | [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md) | Gap |
| LOGIN-4 | Codice a 6 cifre, stessa scadenza, invalida l'altro | [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md) | Parziale: il codice c'è, l'invalidazione incrociata no |
| LOGIN-5 | 2FA di owner e admin dopo il link | [FEAT-AUTH-01](features.md#feat-auth-01), [FEAT-NFR-03](features.md#feat-nfr-03) | [0003](adr/0003-magic-link-and-otp-fallback.md) | Parziale: 2FA admin su password, non dopo un magic link |
| LIFE-1 | Draft, solo admin | [FEAT-EVT-05](features.md#feat-evt-05), [FEAT-APP-01](features.md#feat-app-01) | [0002](adr/0002-event-url-path.md) | Gap |
| LIFE-2 | Published, azione admin, iscrizioni chiuse | [FEAT-EVT-05](features.md#feat-evt-05) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | Gap |
| LIFE-3 | Registration open sul timestamp | [FEAT-EVT-05](features.md#feat-evt-05) | [0005](adr/0005-registration-native-or-luma.md) | Gap come stato. Il sito attuale ha una finestra di registrazione costante |
| LIFE-4 | Running dall'inizio, team fino al lock | [FEAT-EVT-05](features.md#feat-evt-05), [FEAT-TEAM-01](features.md#feat-team-01) | [0008](adr/0008-event-scoped-teams.md) | Parziale: il lock esiste, lo stato Running no |
| LIFE-5 | Submissions closed sulla deadline | [FEAT-TEAM-06](features.md#feat-team-06) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | Parziale: sola lettura dopo `PORTAL_DEADLINE` |
| LIFE-6 | Judging, leaderboard nascosta o live | [FEAT-APP-03](features.md#feat-app-03), [FEAT-APP-04](features.md#feat-app-04) | [0009](adr/0009-configurable-criteria-authenticated-jury.md) | Parziale |
| LIFE-7 | Results published, azione admin | [FEAT-EVT-05](features.md#feat-evt-05), [FEAT-APP-02](features.md#feat-app-02) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | Gap. PR #22 non è questa azione |
| LIFE-8 | Archived, sola lettura, retention | [FEAT-NFR-02](features.md#feat-nfr-02) | [0012](adr/0012-privacy-retention-export.md) | Gap |
| LIFE-RULE | 3, 4, 5 automatici; 2, 7, 8 espliciti; ritorno in Draft solo senza partecipanti | [FEAT-EVT-05](features.md#feat-evt-05) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | Gap |

## Requisiti non funzionali

| Ref | Area | Feature | ADR | Stato |
| --- | --- | --- | --- | --- |
| NFR-ISOL | Isolamento tenant, test per endpoint | [FEAT-NFR-01](features.md#feat-nfr-01) | [0001](adr/0001-tenancy-single-deployment.md) | Gap |
| NFR-PRIV | DPA, informativa, retention, export, cancellazione | [FEAT-NFR-02](features.md#feat-nfr-02) | [0012](adr/0012-privacy-retention-export.md) | Gap |
| NFR-SEC | 2FA, rate limit, upload, niente SVG pericolosi | [FEAT-NFR-03](features.md#feat-nfr-03) | [0003](adr/0003-magic-link-and-otp-fallback.md), [0006](adr/0006-luma-key-per-organization.md) | Parziale |
| NFR-SECRET | Luma key cifrata, non al client, non nei log | [FEAT-ORG-04](features.md#feat-org-04), [FEAT-NFR-03](features.md#feat-nfr-03) | [0006](adr/0006-luma-key-per-organization.md) | Gap |
| NFR-AUDIT | Log admin: chi, cosa, quando | [FEAT-ORG-06](features.md#feat-org-06) | [0007](adr/0007-modular-monolith-outbox.md) | Gap sul registro di organizzazione |
| NFR-A11Y | Contrasto WCAG AA prima del salvataggio | [FEAT-EVT-03](features.md#feat-evt-03) | [0002](adr/0002-event-url-path.md) | Gap |
| NFR-LOAD | 50–500 partecipanti, meno di 10 eventi contemporanei | nessuna feature | [0001](adr/0001-tenancy-single-deployment.md) | Assunto, non verificato come capacità |

## PRD-01

| ID | Feature | ADR | Priorità | Stato |
| --- | --- | --- | --- | --- |
| [ORG-01](hackathon-platform-prd-v0.1.md#org-01) | [FEAT-ORG-01](features.md#feat-org-01), [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md), [0004](adr/0004-global-account-and-memberships.md) | P0 | Gap |
| [ORG-02](hackathon-platform-prd-v0.1.md#org-02) | [FEAT-ORG-01](features.md#feat-org-01) | [0004](adr/0004-global-account-and-memberships.md) | P0 | Gap. «MESA Group» è un esempio, non un tenant |
| [ORG-03](hackathon-platform-prd-v0.1.md#org-03) | [FEAT-ORG-02](features.md#feat-org-02) | [0004](adr/0004-global-account-and-memberships.md) | P0 | Gap |
| [ORG-04](hackathon-platform-prd-v0.1.md#org-04) | [FEAT-ORG-02](features.md#feat-org-02) | [0004](adr/0004-global-account-and-memberships.md) | P0 | Gap |
| [ORG-05](hackathon-platform-prd-v0.1.md#org-05) | [FEAT-ORG-03](features.md#feat-org-03) | [0012](adr/0012-privacy-retention-export.md) | P0 | Gap |
| [ORG-06](hackathon-platform-prd-v0.1.md#org-06) | [FEAT-ORG-04](features.md#feat-org-04) | [0006](adr/0006-luma-key-per-organization.md) | P0 | Parziale (env) |
| [ORG-07](hackathon-platform-prd-v0.1.md#org-07) | [FEAT-ORG-05](features.md#feat-org-05) | [0004](adr/0004-global-account-and-memberships.md) | P0 | Gap. Grandfathering dell'evento Grok: unresolved |
| [ORG-08](hackathon-platform-prd-v0.1.md#org-08) | [FEAT-ORG-06](features.md#feat-org-06) | [0007](adr/0007-modular-monolith-outbox.md) | P1 | Gap |
| REG-NATIVE | [FEAT-REG-02](features.md#feat-reg-02) | [0005](adr/0005-registration-native-or-luma.md) | fase 5 | Gap |
| REG-SYNC | [FEAT-REG-01](features.md#feat-reg-01) | [0005](adr/0005-registration-native-or-luma.md), [0006](adr/0006-luma-key-per-organization.md) | serve al cutover Grok | Parziale |
| REG-REVOKE | [FEAT-ORG-04](features.md#feat-org-04) | [0006](adr/0006-luma-key-per-organization.md) | nel testo dopo la tabella sync | Gap. Key revocata: nominativi fermi e avviso admin |
| LUMA-PLUS | [FEAT-ORG-04](features.md#feat-org-04) | [0006](adr/0006-luma-key-per-organization.md) | P1, fuori dalla key unica di v1 | Non implementare più calendari in v1 |
| [EVT-01](hackathon-platform-prd-v0.1.md#evt-01) | [FEAT-EVT-01](features.md#feat-evt-01) | [0002](adr/0002-event-url-path.md) | P0 | Parziale come costante |
| [EVT-02](hackathon-platform-prd-v0.1.md#evt-02) | [FEAT-EVT-01](features.md#feat-evt-01) | [0007](adr/0007-modular-monolith-outbox.md) | P0 | Parziale come costante |
| [EVT-03](hackathon-platform-prd-v0.1.md#evt-03) | [FEAT-EVT-01](features.md#feat-evt-01) | [0001](adr/0001-tenancy-single-deployment.md) | P0 | Parziale come costante |
| [EVT-04](hackathon-platform-prd-v0.1.md#evt-04) | [FEAT-EVT-02](features.md#feat-evt-02) | [0007](adr/0007-modular-monolith-outbox.md) | P0 | Parziale come costante |
| [EVT-05](hackathon-platform-prd-v0.1.md#evt-05) | [FEAT-EVT-02](features.md#feat-evt-02) | [0007](adr/0007-modular-monolith-outbox.md) | P0 | Dati premi vuoti; sezione non mostrata |
| [EVT-06](hackathon-platform-prd-v0.1.md#evt-06) | [FEAT-EVT-02](features.md#feat-evt-02), [FEAT-APP-04](features.md#feat-app-04) | [0009](adr/0009-configurable-criteria-authenticated-jury.md) | P0 | Parziale: nomi, non l'accesso email |
| [EVT-07](hackathon-platform-prd-v0.1.md#evt-07) | [FEAT-EVT-02](features.md#feat-evt-02) | [0007](adr/0007-modular-monolith-outbox.md) | P0 | Parziale. Vincolo contenuto: niente talk di Luca |
| [EVT-08](hackathon-platform-prd-v0.1.md#evt-08) | [FEAT-EVT-03](features.md#feat-evt-03) | [0017](adr/0017-hosting-v1.md) solo per dove stanno i file | P0 | Gap sul modello. Tema unico presente |
| [EVT-09](hackathon-platform-prd-v0.1.md#evt-09) | [FEAT-EVT-04](features.md#feat-evt-04) | [0005](adr/0005-registration-native-or-luma.md), [0009](adr/0009-configurable-criteria-authenticated-jury.md) | P0 | Parziale come costanti e rubriche fisse |
| [EVT-10](hackathon-platform-prd-v0.1.md#evt-10) | [FEAT-EVT-05](features.md#feat-evt-05) | [0002](adr/0002-event-url-path.md) | P0 | Gap |
| [EVT-11](hackathon-platform-prd-v0.1.md#evt-11) | [FEAT-EVT-06](features.md#feat-evt-06) | [0004](adr/0004-global-account-and-memberships.md) | P0 | Parziale, un solo evento |
| [EVT-12](hackathon-platform-prd-v0.1.md#evt-12) | [FEAT-EVT-07](features.md#feat-evt-07) | [0001](adr/0001-tenancy-single-deployment.md) | P1 | Gap |
| [EVT-13](hackathon-platform-prd-v0.1.md#evt-13) | [FEAT-EVT-08](features.md#feat-evt-08) | [0001](adr/0001-tenancy-single-deployment.md) | P1 | Parziale sul solo evento Grok |
| FUORI-ORG | nessuna in v1: billing, custom domain, admin di singolo evento, dominio email, SSO enterprise | [0011](adr/0011-v1-exclusions.md) | fuori v1 | Confermato per assenza: la sezione li esclude. Il billing è anche assunto assente |

## PRD-02

| ID | Feature | ADR | Priorità | Stato |
| --- | --- | --- | --- | --- |
| [APP-01](hackathon-platform-prd-v0.1.md#app-01) | [FEAT-APP-01](features.md#feat-app-01) | [0002](adr/0002-event-url-path.md) | P0 | Gap sul path. Il sito unico esiste |
| [APP-02](hackathon-platform-prd-v0.1.md#app-02) | [FEAT-APP-01](features.md#feat-app-01) | [0002](adr/0002-event-url-path.md) | P0 | Parziale, sezioni da costanti. I criteri non sono una sezione, e restano non pubblicati |
| [APP-03](hackathon-platform-prd-v0.1.md#app-03) | [FEAT-EVT-03](features.md#feat-evt-03) | [0002](adr/0002-event-url-path.md) | P0 | Gap |
| [APP-04](hackathon-platform-prd-v0.1.md#app-04) | [FEAT-APP-01](features.md#feat-app-01) | [0002](adr/0002-event-url-path.md) | P0 | Parziale per un solo sito |
| [APP-05](hackathon-platform-prd-v0.1.md#app-05) | [FEAT-APP-01](features.md#feat-app-01) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | P0 | Parziale: le CTA attuali non seguono i sette stati |
| [APP-06](hackathon-platform-prd-v0.1.md#app-06) | [FEAT-APP-01](features.md#feat-app-01), [FEAT-AUTH-01](features.md#feat-auth-01) | [0002](adr/0002-event-url-path.md), [0003](adr/0003-magic-link-and-otp-fallback.md) | P0 | Parziale: esiste un portale, non lo slug |
| [APP-07](hackathon-platform-prd-v0.1.md#app-07) | [FEAT-APP-02](features.md#feat-app-02) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | P0 | Gap. PR #22 è una vetrina diversa, non unita |
| [APP-08](hackathon-platform-prd-v0.1.md#app-08) | [FEAT-APP-03](features.md#feat-app-03) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | P0 | Parziale: ranking pubblico, senza i quattro stati |
| [APP-09](hackathon-platform-prd-v0.1.md#app-09) | [FEAT-APP-04](features.md#feat-app-04) | [0009](adr/0009-configurable-criteria-authenticated-jury.md) | P0 | Parziale al contrario: voto anonimo di nome, PR #21 unita |
| [APP-10](hackathon-platform-prd-v0.1.md#app-10) | [FEAT-APP-04](features.md#feat-app-04) | [0009](adr/0009-configurable-criteria-authenticated-jury.md) | P0 | Gap: colonne fisse |
| [APP-11](hackathon-platform-prd-v0.1.md#app-11) | [FEAT-APP-05](features.md#feat-app-05) | [0012](adr/0012-privacy-retention-export.md) | P1 | Gap |
| FN-LANDING | [FEAT-APP-01](features.md#feat-app-01). Landing, agenda, tracce, regole, SEO | [0002](adr/0002-event-url-path.md) | Sì | Parziale |
| FN-SIGNIN | [FEAT-AUTH-01](features.md#feat-auth-01), [FEAT-REG-01](features.md#feat-reg-01). Sign-in email e guest list | [0003](adr/0003-magic-link-and-otp-fallback.md) | Sì | Parziale |
| FN-TEAM | [FEAT-TEAM-01](features.md#feat-team-01), [FEAT-TEAM-04](features.md#feat-team-04), [FEAT-TEAM-05](features.md#feat-team-05). Crea, join, leave, lock | [0008](adr/0008-event-scoped-teams.md) | Sì | Parziale |
| FN-SUB | [FEAT-TEAM-06](features.md#feat-team-06). Submission repository e video | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | Sì | Parziale, senza traccia |
| FN-JUDGE | [FEAT-APP-04](features.md#feat-app-04). Giudici e valutazione | [0009](adr/0009-configurable-criteria-authenticated-jury.md) | Sì | Parziale, criteri fissi |
| FN-RANK | [FEAT-APP-03](features.md#feat-app-03). Ranking pubblicabile | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | Sì | Parziale |
| FN-JURY | [FEAT-APP-04](features.md#feat-app-04). Voto giuria riprogettato | [0009](adr/0009-configurable-criteria-authenticated-jury.md) | Sì, riprogettato | Presente nella forma da sostituire |
| FN-ADMISSION | nessuna in v1. Admission | [0011](adr/0011-v1-exclusions.md) | No | Presente su main, da rendere irraggiungibile nel multi-tenant |
| FN-SCREEN | nessuna in v1. Screening | [0011](adr/0011-v1-exclusions.md) | No | Presente su main, stessa regola |
| FN-CREDITS | nessuna in v1. Credits | [0011](adr/0011-v1-exclusions.md) | No | Presente su main, stessa regola |
| FN-MENTOR | nessuna in v1. Richieste ai mentor | [0011](adr/0011-v1-exclusions.md) | No | Presente su main, stessa regola |
| FN-PARTNER | nessuna in v1. Pagina partnership | [0011](adr/0011-v1-exclusions.md) | No | Presente su main, stessa regola |

## PRD-03

| ID | Feature | ADR | Priorità | Stato |
| --- | --- | --- | --- | --- |
| [TEAM-01](hackathon-platform-prd-v0.1.md#team-01) | [FEAT-TEAM-01](features.md#feat-team-01) | [0002](adr/0002-event-url-path.md), [0008](adr/0008-event-scoped-teams.md) | P0 | Parziale |
| [TEAM-02](hackathon-platform-prd-v0.1.md#team-02) | [FEAT-TEAM-01](features.md#feat-team-01) | [0008](adr/0008-event-scoped-teams.md) | P0 | Parziale |
| [TEAM-03](hackathon-platform-prd-v0.1.md#team-03) | [FEAT-TEAM-01](features.md#feat-team-01) | [0014](adr/0014-deterministic-team-name-logo.md) | P0 | Parziale: il nome c'è, il generatore no. I limiti 3–40 non sono verificati come vincolo attuale |
| [TEAM-04](hackathon-platform-prd-v0.1.md#team-04) | [FEAT-TEAM-02](features.md#feat-team-02) | [0014](adr/0014-deterministic-team-name-logo.md) | P0 | Gap |
| [TEAM-05](hackathon-platform-prd-v0.1.md#team-05) | [FEAT-TEAM-03](features.md#feat-team-03) | [0013](adr/0013-team-invite-does-not-admit.md) | P0 | Gap |
| [TEAM-06](hackathon-platform-prd-v0.1.md#team-06) | [FEAT-TEAM-03](features.md#feat-team-03) | [0003](adr/0003-magic-link-and-otp-fallback.md), [0013](adr/0013-team-invite-does-not-admit.md) | P0 | Gap |
| [TEAM-07](hackathon-platform-prd-v0.1.md#team-07) | [FEAT-TEAM-04](features.md#feat-team-04) | [0008](adr/0008-event-scoped-teams.md) | P0 | Parziale: codice e rigenerazione sì, tetto tentativi no |
| [TEAM-08](hackathon-platform-prd-v0.1.md#team-08) | [FEAT-TEAM-05](features.md#feat-team-05) | [0008](adr/0008-event-scoped-teams.md) | P0 | Parziale |
| [TEAM-09](hackathon-platform-prd-v0.1.md#team-09) | [FEAT-TEAM-01](features.md#feat-team-01) | [0008](adr/0008-event-scoped-teams.md) | P0 | Parziale. Il check database limita `max_members` a 6, non legge un parametro libero |
| [TEAM-10](hackathon-platform-prd-v0.1.md#team-10) | [FEAT-TEAM-06](features.md#feat-team-06) | [0010](adr/0010-deliverable-and-leaderboard-publication.md) | P0 | Parziale, senza traccia |
| [TEAM-11](hackathon-platform-prd-v0.1.md#team-11) | [FEAT-TEAM-07](features.md#feat-team-07) | [0008](adr/0008-event-scoped-teams.md) | P1 | Parziale |
| [TEAM-12](hackathon-platform-prd-v0.1.md#team-12) | [FEAT-TEAM-08](features.md#feat-team-08) | [0008](adr/0008-event-scoped-teams.md) | P1 | Parziale solo come definizione di team formato per l'admission, che è fuori v1 |
| [TEAM-13](hackathon-platform-prd-v0.1.md#team-13) | [FEAT-TEAM-09](features.md#feat-team-09) | [0008](adr/0008-event-scoped-teams.md) | P1 | Gap |
| TEAM-NAME | [FEAT-TEAM-01](features.md#feat-team-01), [FEAT-TEAM-02](features.md#feat-team-02) | [0014](adr/0014-deterministic-team-name-logo.md) | raccomandato, senza P0 proprio | Proposed. Gap. Generatore deterministico, non un modello |
| TEAM-STATE | [FEAT-TEAM-03](features.md#feat-team-03). Invito pending, accepted, revoked, expired | [0013](adr/0013-team-invite-does-not-admit.md) | nel testo | Gap |
| TEAM-A | [FEAT-TEAM-03](features.md#feat-team-03). Opzione A raccomandata, default proposto | [0013](adr/0013-team-invite-does-not-admit.md) | Proposed | Unresolved finché Luca non sceglie |
| TEAM-B | nessuna finché non scelta. Opzione B, l'invito ammette | [0013](adr/0013-team-invite-does-not-admit.md) | alternativa | Non implementare |

## Contesti e figura

| Ref | Contenuto | Feature | ADR | Stato |
| --- | --- | --- | --- | --- |
| CTX-ORG | Organization & Access e i suoi eventi | [FEAT-F0](features.md#feat-f0), [FEAT-ORG-01](features.md#feat-org-01) | [0007](adr/0007-modular-monolith-outbox.md) | Proposed. Gap |
| CTX-CATALOG | Event Catalog | [FEAT-EVT-01](features.md#feat-evt-01), [FEAT-EVT-02](features.md#feat-evt-02) | [0007](adr/0007-modular-monolith-outbox.md) | Proposed. Gap |
| CTX-REG | Registration | [FEAT-REG-01](features.md#feat-reg-01), [FEAT-REG-02](features.md#feat-reg-02) | [0005](adr/0005-registration-native-or-luma.md) | Proposed. Parziale |
| CTX-TEAMS | Teams | [FEAT-TEAM-01](features.md#feat-team-01) | [0008](adr/0008-event-scoped-teams.md) | Proposed. Parziale |
| CTX-SUB | Submissions & Judging | [FEAT-TEAM-06](features.md#feat-team-06), [FEAT-APP-04](features.md#feat-app-04) | [0007](adr/0007-modular-monolith-outbox.md), [0009](adr/0009-configurable-criteria-authenticated-jury.md) | Proposed. Parziale |
| CTX-OUTBOX | Outbox nella stessa transazione, consumer idempotenti | [FEAT-F0](features.md#feat-f0) | [0007](adr/0007-modular-monolith-outbox.md) | Proposed. Gap |
| FIG-CONSOLE | Path Console `/o/:org-slug`, solo nella figura | nessuna finché il path non è deciso | [0002](adr/0002-event-url-path.md) | Unresolved |
| FIG-STORAGE | Object storage per loghi e cover, solo nella figura | [FEAT-TEAM-02](features.md#feat-team-02), [FEAT-EVT-01](features.md#feat-evt-01), [FEAT-EVT-03](features.md#feat-evt-03) | [0017](adr/0017-hosting-v1.md) | Unresolved sul fornitore. I file oggi sono in `public/` |
| FIG-RESEND | Email transazionale Resend | [FEAT-AUTH-01](features.md#feat-auth-01) | [0003](adr/0003-magic-link-and-otp-fallback.md) | Parziale: OTP attuale via Resend |
| FIG-LUMA | Luma API con key per organizzazione | [FEAT-ORG-04](features.md#feat-org-04) | [0006](adr/0006-luma-key-per-organization.md) | Parziale |

## Delivery, fasi, domande, assunti

| Ref | Contenuto | Feature | ADR | Stato |
| --- | --- | --- | --- | --- |
| PSTACK-SETUP-1 | Lavorare in questo repository, PR verso il fork | [FEAT-DEL-01](features.md#feat-del-01) | [0015](adr/0015-stay-in-this-repository.md) | Confermato nella fonte per il repository. Questa PR rispetta il vincolo |
| PSTACK-SETUP-2 | PR di solo tooling | [FEAT-DEL-01](features.md#feat-del-01) | [0016](adr/0016-pstack-vendoring.md) | Proposed. Non è questa PR |
| PSTACK-SETUP-3 | Smoke test Cloud Agent | [FEAT-DEL-01](features.md#feat-del-01) | [0016](adr/0016-pstack-vendoring.md) | Non eseguito, né dalla PRD né qui |
| PSTACK-SETUP-4 | Solo dopo, il lavoro di prodotto | [FEAT-DEL-01](features.md#feat-del-01) | [0016](adr/0016-pstack-vendoring.md) | Proposed. Il prodotto non parte in questa PR |
| FASE-0 … FASE-5 | Sequenza di capacità | tutte le feature di fase, vedi [features](features.md#features) | [0016](adr/0016-pstack-vendoring.md) per il vincolo di merge manuale in fase 0 | Sequenza recepita, non avviata |
| Q-ORG-CREATE | Chi crea un'organizzazione, e il prezzo | [FEAT-ORG-01](features.md#feat-org-01) | [0004](adr/0004-global-account-and-memberships.md) | Unresolved. Billing escluso dalla v1 |
| Q-INVITE | Opzione A o B | [FEAT-TEAM-03](features.md#feat-team-03) | [0013](adr/0013-team-invite-does-not-admit.md) | Unresolved. Default proposto A |
| Q-LUMA-FREQ | Sync ogni 15 minuti più pulsante | [FEAT-REG-01](features.md#feat-reg-01) | [0005](adr/0005-registration-native-or-luma.md) | Unresolved. Il pulsante è nel requisito; i 15 minuti no |
| Q-DOMAIN | Dominio e nome del prodotto | [FEAT-APP-01](features.md#feat-app-01) | [0002](adr/0002-event-url-path.md), [0017](adr/0017-hosting-v1.md) | Unresolved |
| Q-LANG | Italiano per evento | nessuna | [0015](adr/0015-stay-in-this-repository.md) | Unresolved. Il sito attuale è inglese |
| Q-HOST | Vercel e PostgreSQL, oppure AWS | [FEAT-F0](features.md#feat-f0) | [0017](adr/0017-hosting-v1.md) | Unresolved |
| Q-CURSOR | Piano Individuale o Teams | [FEAT-DEL-01](features.md#feat-del-01) | [0016](adr/0016-pstack-vendoring.md) | Unresolved |
| Q-ADMIN-EVENT | Basta l'admin di organizzazione in v1 | [FEAT-ORG-02](features.md#feat-org-02) | [0011](adr/0011-v1-exclusions.md) | La prosa «fuori v1» esclude l'admin di singolo evento. La domanda resta aperta nel testo |
| Q-COLOR | Primario e accento, oppure ogni colore | [FEAT-EVT-03](features.md#feat-evt-03) | [0002](adr/0002-event-url-path.md) | Unresolved. Il requisito attuale è primario, accento, modalità |
| A-REPO | Questo repository, push del 5 nov 2026 | tutte | [0015](adr/0015-stay-in-this-repository.md) | Verificato: `db33ac9` è main |
| A-STACK | Next.js, Drizzle, PostgreSQL, Better Auth, Resend, Vercel | [FEAT-F0](features.md#feat-f0) | [0017](adr/0017-hosting-v1.md) | Lo stack nel repo coincide. «l'estate esistente» è il testo della fonte, vedi gap |
| A-ACCOUNT | Account globale per email | [FEAT-AUTH-01](features.md#feat-auth-01) | [0004](adr/0004-global-account-and-memberships.md) | Proposed. L'email è già unica su `user` |
| A-ADMIN-ALL | Gli admin vedono tutti gli eventi dell'organizzazione | [FEAT-ORG-02](features.md#feat-org-02) | [0004](adr/0004-global-account-and-memberships.md) | Assunto coerente con ORG-04 |
| A-ONE-KEY | Una Luma key, un calendario | [FEAT-ORG-04](features.md#feat-org-04) | [0006](adr/0006-luma-key-per-organization.md) | Proposed |
| A-LOAD | 50–500, meno di 10 eventi | nessuna | [0001](adr/0001-tenancy-single-deployment.md) | Assunto |
| A-NO-BILLING | Nessun billing in v1 | nessuna | [0011](adr/0011-v1-exclusions.md) | Coerente con «fuori v1» |
| A-BA-PLUGIN | Plugin organizzazioni di Better Auth non verificato sulla versione in uso | [FEAT-ORG-02](features.md#feat-org-02) | [0004](adr/0004-global-account-and-memberships.md) | Unresolved. `better-auth` è `^1.2.0`. Non verificato neanche in questa lettura |

## Copertura degli ID di requisito

Gli ID numerati della fonte sono 45: ORG-01 … ORG-08, EVT-01 … EVT-13, APP-01 … APP-11, TEAM-01 … TEAM-13. Ognuno compare nella tabella PRD-01, PRD-02 o PRD-03 di questa pagina e in [features.md](features.md). Il controllo automatico è `python3 docs/prd/check_docs.py`.
