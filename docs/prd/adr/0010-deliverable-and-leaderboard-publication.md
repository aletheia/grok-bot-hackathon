# ADR-0010 — Pubblicazione esplicita di deliverable e leaderboard

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-APP-02](../features.md#feat-app-02), [FEAT-APP-03](../features.md#feat-app-03), [FEAT-TEAM-06](../features.md#feat-team-06)

## Contesto

La submission attuale (`project`) è privata al team e all'admin fino alla deadline, poi in sola lettura. I campi sono nome, descrizione, repository, video, demo. Manca la traccia. Il ranking è una pagina pubblica con penalità e override.

APP-07 chiede una pagina pubblica solo dopo un'azione admin, possibile solo dopo la deadline, con nascondi singolo progetto e anteprima per il team. APP-08 chiede quattro stati: nascosta, live, congelata, finale, più classifica per traccia. Results published e la pubblicazione dei deliverable sono azioni esplicite (passaggi 7 e, per i deliverable, il testo di APP-07).

La [PR #22](https://github.com/aletheia/grok-bot-hackathon/pull/22) mostra in homepage i progetti che hanno un repository, senza quell'azione. È aperta. Non è questa decisione e non è in produzione per effetto di questa documentazione.

## Opzioni

1. Pubblicazione esplicita e quattro stati di leaderboard. Raccomandazione P0.
2. Pubblicazione automatica di chi ha compilato il repository, come nella PR #22. Non soddisfa APP-07. Può restare una proposta separata per il sito dell'evento corrente, da approvare lì.
3. Ranking sempre pubblico, come oggi. Non soddisfa lo stato «nascosta».

## Decisione

Nessuna. Proposed. La PR #22 non si modifica e non si considera il veicolo di APP-07.

## Conseguenze

TEAM-10 aggiunge la traccia alla submission: senza, la classifica per traccia e la scheda pubblica sono incomplete. Nascondere un progetto non cancella la riga. Lo stato congelata deve smettere di riflettere voti nuovi; lo stato finale coincide con Results published solo se Luca li tiene insieme. La fonte non dice che siano lo stesso bottone. Non fonderli di nostra iniziativa.

Privacy: la scheda pubblica include repository e video. I nomi dei membri solo se l'evento lo abilita (APP-11, P1, default non scritto).

## Verifica

Test di stato: prima dell'azione admin la pagina pubblica è vuota; dopo, il progetto c'è; un progetto nascosto no; leaderboard nascosta non mostra numeri; congelata ignora un voto successivo. Non scritti.

## Fonti

- [APP-07](../hackathon-platform-prd-v0.1.md#app-07), [APP-08](../hackathon-platform-prd-v0.1.md#app-08), [TEAM-10](../hackathon-platform-prd-v0.1.md#team-10)
- [Ciclo di vita](../hackathon-platform-prd-v0.1.md#ciclo-di-vita)
- PR #22, aperta
