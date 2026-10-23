/**
 * Proposed tracks (landing #tracks and /tracks). English translation of the organisers'
 * "Hackathon AI – challenge brief". Edit the copy here; the landing recap and the /tracks page
 * both read from EVENT.tracks (lib/event.ts).
 *
 * Intentionally NOT published from the brief: the 100-point rubric, eligibility criteria, the
 * 48-hour phase table, the final-presentation format and the optional prizes. Criteria, prizes and
 * jury are announced separately (see EVENT.criteria / EVENT.prizes / EVENT.jury).
 */

export type TrackExample = { title: string; text: string };

export type TrackContent = {
  /** URL anchor on /tracks, e.g. "research-radar". */
  id: string;
  number: string;
  title: string;
  subtitle: string;
  guidingQuestion: string;
  mainResult: string;
  mission: string;
  problem: string;
  users: string;
  input: string;
  output: string;
  distinctive: string;
  example: TrackExample;
  coreFeatures: string[];
  mvp: string[];
  stretch: string[];
  /** Only some tracks have a risks section. */
  risks?: string;
  /** Initial failure taxonomy (Agent Failure Lab only). */
  taxonomy?: { area: string; items: string }[];
  /** Indicative guidance for this track; the final judging criteria are announced separately. */
  evaluation: string;
};

export type TracksContent = {
  /** The tracks are proposals until the organisers confirm them. */
  status: "proposed" | "confirmed";
  vision: string;
  statusNote: string;
  items: TrackContent[];
  principles: { title: string; text: string }[];
  deliverables: { items: string[]; note: string };
  /** Shown at the end of /tracks. */
  suggestionsNote: string;
};

export const TRACKS_CONTENT: TracksContent = {
  status: "proposed",
  vision:
    "From prototypes that answer questions to systems that collect evidence, measure results and make changes explainable. The three tracks are independent but share one principle: every insight must be verifiable.",
  statusNote: "This is the first set of proposed tracks. They may be refined before the event.",
  items: [
    {
      id: "research-radar",
      number: "01",
      title: "Research Radar",
      subtitle: "Mapping the Evolution of Scientific Knowledge",
      guidingQuestion: "How is a research field changing?",
      mainResult: "A temporal map of the literature",
      mission:
        "Given a scientific topic and a time range, build a system that ingests publications from open sources, identifies the main strands of work, reconstructs the relationships between papers and flags which directions are accelerating or slowing down.",
      problem:
        "Research evolves too fast to follow by hand. Keyword searches return lists of papers, but rarely show reliably how new subtopics emerge, which approaches converge and which results actually changed the landscape.",
      users: "Researchers, R&D teams, deep-tech investors, innovation teams.",
      input:
        "A topic (e.g. reinforcement learning), a main period (e.g. 24 months), a comparison window (e.g. the last 14 days), and optional sources and filters.",
      output:
        "Topic clusters, a timeline, a paper–citation graph, a summary of recent movements, representative papers and links to the sources.",
      distinctive:
        "A “What changed?” mode that compares two homogeneous time windows and also makes explicit any variation caused by source coverage.",
      example: {
        title: "Example: reinforcement learning",
        text: "A user selects “reinforcement learning”, from October 2024 to October 2026, and asks what happened in the last 90 days compared with the previous 90. The system retrieves metadata and abstracts, proposes clusters such as offline RL, model-based RL and RL for agents, and computes the relative growth of publications per cluster. A summary flags the growing clusters and shows 3–5 representative papers with a rationale and links. Cluster names are hypotheses generated from the data, not predefined labels.",
      },
      coreFeatures: [
        "Ingestion from arXiv, OpenAlex and, for biomedical topics, PubMed/Europe PMC, through permitted APIs and downloads; deduplication by DOI/arXiv ID and title.",
        "Normalisation of title, authors, date, abstract, venue, identifiers, citations and full-text availability.",
        "Semantic clustering with interpretable labels, and the ability to correct incoherent clusters.",
        "Relationships between papers: documented citations, semantic similarity and shared authors, shown as distinct edge types.",
        "Temporal analysis: absolute volumes, share per topic, acceleration, novelty and comparison between windows.",
        "A report with verifiable claims, precise links to the sources and an indication of uncertainty.",
      ],
      mvp: [
        "One domain and one source, with 500–2,000 metadata/abstract records and a reproducible query.",
        "5–12 clusters with readable labels, example papers and a timeline.",
        "A comparison of two time windows, with at least three insights backed by sources.",
        "A mini-dashboard with filters by period and cluster, and access to the original papers.",
      ],
      stretch: [
        "Cross-source deduplication",
        "Interactive citation graph",
        "Novelty score",
        "Recurring alerts",
        "Comparison between authors and labs",
        "Grounded conversational search",
        "Full-text extraction where permitted",
      ],
      evaluation:
        "Retrieval quality on an annotated sample; cluster coherence assessed manually; precision of the relationships; correctness of dates; share of report claims with a valid source; usefulness of the trends against simple baselines. Note: growth in the number of papers does not automatically mean higher quality or impact.",
    },
    {
      id: "github-benchmark-arena",
      number: "02",
      title: "GitHub Benchmark Arena",
      subtitle: "Continuous Evaluation of Emerging Open-Source Tools",
      guidingQuestion: "Which new tools actually work?",
      mainResult: "A continuous benchmark and a leaderboard",
      mission:
        "Given a software topic, find relevant open-source repositories, install and run them in a controlled environment, and compare them on shared tasks with reproducible metrics and a historical leaderboard.",
      problem:
        "New frameworks and libraries appear every week, with claims that are hard to compare. GitHub stars and promotional demos do not measure reliability or performance on real workloads.",
      users: "Developers, platform engineers, AI infrastructure teams, CTOs and applied researchers.",
      input: "A category (e.g. agent harness), a GitHub query, minimum requirements, a task suite and a runtime budget.",
      output: "Eligible repositories, installation outcomes, benchmark results, metrics, versions, logs and a leaderboard.",
      distinctive:
        "Incremental re-runs when a repository changes or a new candidate enters, keeping experiments comparable.",
      example: {
        title: "Example: agent harnesses",
        text: "The platform selects 3–5 harnesses compatible with the same model and the same tools. Each harness runs 20 tasks, for example searching a small knowledge base, editing test files and solving problems with mock tools. Success rate, duration, number of calls, tokens and estimated cost are measured. For open-ended text outputs, an LLM-as-a-Judge applies a fixed rubric; tasks with an exact answer are scored deterministically.",
      },
      coreFeatures: [
        "GitHub discovery by topic, licence, recent updates, language and compatibility.",
        "A standard adapter that maps each repository to one execution interface.",
        "Automated setup in ephemeral containers with pinned dependencies, timeouts, CPU/RAM limits and a blocked network or an allowlist.",
        "A gold-standard benchmark with inputs, expected outputs or success criteria, edge cases and scoring.",
        "Metrics: task success, p50/p95 latency, memory use, error rate, cost and stability across runs.",
        "An LLM judge with rubrics, calibrated examples, tracked judgements and human review of a sample.",
        "A leaderboard filterable by version, date, task and quality/cost trade-off.",
      ],
      mvp: [
        "Manually select 3 compatible open-source repositories, then automate discovery of new releases.",
        "Define 10–20 tasks and a common adapter, with an explicit baseline.",
        "Run each tool at least twice, saving the commit SHA, configuration and logs.",
        "Show the leaderboard, a comparison by metric and at least one reproducible failure case.",
      ],
      stretch: [
        "Fully automatic discovery",
        "Multi-model benchmarks",
        "Statistical significance and confidence intervals",
        "Regressions between releases",
        "Benchmark contamination detection",
        "Periodic scheduling and notifications",
      ],
      risks:
        "Do not run unknown repositories on the host: use least-privilege sandboxes, no secrets and a restricted filesystem. Check licences, hardware requirements, compatibility and API policies. An LLM judge is not a gold standard by itself: it must be calibrated with annotated examples and backed by deterministic checks.",
      evaluation:
        "Reproducibility of runs; correctness of the adapters; coverage and quality of the benchmark; transparency of scoring; robustness to setup errors; quality of the leaderboard; execution security.",
    },
    {
      id: "agent-failure-lab",
      number: "03",
      title: "Agent Failure Lab",
      subtitle: "Understanding Why AI Agents Fail",
      guidingQuestion: "Why does an agent fail, and how can it be improved?",
      mainResult: "Diagnosis, replay and verification of fixes",
      mission:
        "Observe the execution traces of AI agents, recognise and classify failures, identify the most plausible cause and propose changes that are tested with new runs and regression benchmarks.",
      problem:
        "When an agent fails, the final result rarely explains whether the cause was a wrong plan, an incomplete search, a misused tool or a loop. Analysing long traces by hand is slow and does not scale.",
      users: "Teams building agents, QA, MLOps, AI product engineering.",
      input:
        "A task, an expected outcome or success test, a structured trace (messages, tool calls, outputs, timings, costs) and the agent configuration.",
      output:
        "A failure taxonomy, suspicious steps, an explanation with evidence, severity, a proposed fix and a before/after comparison.",
      distinctive: "A fix is not considered valid until it improves a test and causes no obvious regressions.",
      example: {
        title: "Example: an agent that edits code",
        text: "Task: “Fix a parsing function and make the tests pass”. The agent opens the wrong file, edits an unrelated module and concludes the task is solved without running pytest. The platform reconstructs the sequence, flags a possible tool-selection failure and a verification failure, cites the trace steps and suggests a mandatory test check before the final message. The replay verifies whether the new policy increases the number of solved tasks without raising cost and latency excessively.",
      },
      taxonomy: [
        { area: "Planning", items: "incomplete plan, neglected dependencies, wrong priorities." },
        { area: "Tool use", items: "wrong tool, malformed parameters, unhandled errors." },
        { area: "Retrieval/context", items: "insufficient sources, irrelevant information, lost context." },
        { area: "Reasoning/decision", items: "unsupported inferences, premature choices, repeated attempts." },
        { area: "Execution", items: "timeouts, crashes, resource limits, environment incompatibilities." },
        { area: "Verification", items: "output not checked, tests not run, false claim of success." },
      ],
      coreFeatures: [
        "Trace ingestion in JSON with a common schema: timestamp, step ID, role, tool, input/output, status, and cost and tokens where available.",
        "Visual replay of the sequence, highlighting the steps that precede the failure.",
        "A hybrid failure detector: deterministic rules (timeouts, loops, failed tests) plus LLM classification with a rubric.",
        "Root-cause hypotheses citing specific steps, with a confidence level, distinguishing symptom from cause.",
        "A remediation engine that proposes prompt patches, guardrails, tool validation or strategy changes.",
        "Before/after evaluation on a fixed task set, with regressions and costs made explicit.",
      ],
      mvp: [
        "Collect 15–30 traces, even synthetic but realistic ones, with at least 4 failure categories and annotated ground truth.",
        "Build a parser, a timeline and a failure classifier with per-step evidence.",
        "Implement two concrete remediations, for example a controlled retry and a verification gate.",
        "Run a replay on 5–10 tasks and measure success rate, regressions, latency and cost before and after.",
      ],
      stretch: [
        "Live trace ingestion",
        "Causal debugging through controlled interventions",
        "Clustering of recurring failures",
        "Automatic generation of regression tests",
        "Patch suggestions with human approval",
        "Comparison across agents and versions",
      ],
      evaluation:
        "Classification accuracy on annotated traces; precision in locating the relevant step; quality and verifiability of explanations; rate of effective fixes; regressions introduced; additional cost. Avoid presenting an LLM diagnosis as causal proof without an experiment.",
    },
  ],
  principles: [
    { title: "Reproducibility", text: "Sources, versions, parameters and results must be traced." },
    { title: "Evidence first", text: "Separate objective measurements, LLM assessments and interpretations." },
    { title: "Human in the loop", text: "Allow review of the most uncertain results." },
    { title: "Security by design", text: "Respect licences, privacy, rate limits and the isolation of external code." },
    {
      title: "Realistic scope",
      text: "A robust end-to-end pipeline on a narrow use case is better than a broad but fragile demo.",
    },
  ],
  deliverables: {
    items: [
      "A GitHub repository with a README and run instructions",
      "A 5-minute demo",
      "Datasets or test fixtures",
      "Quantitative results",
      "A description of the limitations",
      "A short roadmap",
    ],
    note: "A UI is recommended but not mandatory if a CLI or API can be demonstrated.",
  },
  suggestionsNote: "Sources, stack and numbers mentioned in the tracks are design suggestions, not rigid requirements.",
};
