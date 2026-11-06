# ADR-0016 — Vendoring di pstack per i Cloud Agent

- Stato: **Proposed**
- Data: 2026-11-06
- Feature: [FEAT-DEL-01](../features.md#feat-del-01)

## Contesto

La PRD raccomanda di committare pstack in `.cursor/skills` e `.cursor/agents`, più le skill di cursor-team-kit usate dai playbook, una rule di modelli, `AGENTS.md` e l'ambiente con Node 20 e PostgreSQL. Lo smoke test su un Cloud Agent reale non è stato fatto, né dalla PRD (mancavano credenziali) né qui. L'installazione personale dal marketplace non è verificata come sufficiente. Il piano Teams renderebbe il marketplace un'alternativa. La conferma del 6 nov non include pstack.

La fonte chiede di fare questo prima del lavoro di prodotto, e di non lasciare all'agent il merge della fase 0.

## Opzioni

1. Vendoring nel repository. Raccomandazione. Two-way door. Costo citato: 537 file e 5,1 MB, aggiornamenti manuali, commit upstream da registrare.
2. Marketplace sul Cursor locale. La fonte dice che non è documentato che arrivi ai Cloud Agent.
3. Team marketplace con plugin Required. Solo piani Teams ed Enterprise. Dipende dalla domanda sul piano Cursor.

## Decisione

Nessuna. Proposed. Questa pull request non vendorizzza nulla e non aggiunge `AGENTS.md`. Il punto 2 del setup («posso preparare io la pull request») non è questa PR.

## Conseguenze

Se si vendorizzza senza lo smoke test, non si sa se `poteto-agent` trova `poteto-mode` né se la rule dei modelli è letta. I default citati dalla fonte, in assenza di rule, sono `grok-4.7-xhigh-fast` e `claude-opus-5-5-xhigh`. Non fissarli qui.

Sicurezza: il vendoring porta script che usano Node e `gh`. Vanno letti prima del commit, non copiati alla cieca. Nessun segreto nel repository.

## Verifica

Lo smoke test della fonte: `/poteto-help` carica la skill, `/poteto-mode` avvia un `poteto-agent`, i modelli sono quelli della rule. Non eseguito.

## Fonti

- [Tabella decisioni, riga pstack](../hackathon-platform-prd-v0.1.md#tabella-decisioni)
- [Delivery con pstack](../hackathon-platform-prd-v0.1.md#delivery-pstack)
- [Open question sul piano Cursor](../hackathon-platform-prd-v0.1.md#open-questions)
