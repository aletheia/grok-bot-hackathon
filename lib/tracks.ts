/**
 * Proposed tracks (landing #tracks and /tracks). English translation of the organisers' draft
 * "Grok Hackathon at the Museum – Tracce" (3 November 2026). Edit the copy here; the landing recap
 * and the /tracks page both read from EVENT.tracks (lib/event.ts).
 *
 * Every track uses the same card, in the same order as the source document. Tracks with a letter
 * (A–D) are proposed by a company; tracks with a number (01–06) are open tracks proposed by the
 * organisers.
 *
 * Intentionally NOT published from the source document: the "Open points" field of each card and
 * the material codes (M1, M2, …) that point to the organisers' materials document. They are
 * internal and are tracked in the pull request that introduced this content.
 *
 * Items the source marks as still to be confirmed carry the TBC marker below; the UI renders it as
 * a visible "To be confirmed" tag (see components/tracks/TbcText.tsx).
 */

/** Inline marker for a "to be confirmed" item. Rendered as a tag, never as raw text. */
export const TBC = "{{tbc}}";
export const TBC_LABEL = "To be confirmed";

export type TrackKind = "company" | "open";

export type TrackDemo = {
  /** Optional sentence before the list, e.g. "Three steps." */
  lead?: string;
  items: string[];
  /** Optional sentence after the list (an example or a fallback). */
  note?: string;
};

export type TrackContent = {
  /** URL anchor on /tracks, e.g. "research-radar". */
  id: string;
  /** "A"–"D" for company tracks, "01"–"06" for open tracks. */
  number: string;
  kind: TrackKind;
  title: string;
  subtitle?: string;
  /** Company that proposes the track, or "Organisers". */
  proposedBy: string;
  /** "In short" (from the index of the tracks). */
  summary: string;
  /** Hardware column of the index. */
  hardwareSummary: string;
  /** In one sentence: the question the track answers. */
  oneLiner: string;
  /** The real problem and who has it. */
  context: string;
  /** The system to build. */
  build: string;
  /** Data, materials, hardware and public resources available. */
  inputs: string;
  /** Where Grok is essential. */
  grok: string;
  /** What must work on Thursday at 16:30 to be in the running. */
  demo: TrackDemo;
  /** What takes the solution further, if there is time left. */
  stretch: string[];
  /** What is not asked for, so no time is wasted on it. */
  outOfScope: string;
  /** Track-specific criteria; they add to the common judging rubric, announced separately. */
  judging: string;
  /** Machines, slots and number of teams. */
  hardware: string;
  /** Who helps and on which days. */
  mentors: string;
  /** Starting failure categories (Agent Failure Lab only). */
  taxonomy?: { area: string; items: string }[];
};

export type TracksContent = {
  /** The tracks are proposals until the organisers confirm them. */
  status: "proposed" | "confirmed";
  vision: string;
  statusNote: string;
  /** Explains the "To be confirmed" tag. */
  tbcNote: string;
  items: TrackContent[];
  /** Rules for all tracks. */
  rules: string[];
};

const NO_HARDWARE = "No hardware; no limit on the number of teams.";

export const TRACKS_CONTENT: TracksContent = {
  status: "proposed",
  vision:
    "There are ten tracks, and each one is described with the same card, so they can be compared field by field. Tracks with a letter (A–D) are proposed by a company; tracks with a number (01–06) are open tracks proposed by the organisers.",
  statusNote: "These are proposed tracks. They may be refined before the event.",
  tbcNote: "Items marked “To be confirmed” depend on materials or confirmations that are still being collected.",
  items: [
    {
      id: "ctrl-f-sea",
      number: "A",
      kind: "company",
      title: "CTRL+F: SEA",
      subtitle: "See, Explore, Assist",
      proposedBy: "SEA Vision",
      summary: "Find an object in real space that has been described, photographed or is out of place",
      hardwareSummary: "Arm, camera, dog",
      oneLiner: "How do you play “Where's Waldo?” when Waldo changes every time and hides in a real room?",
      context:
        "Waldo, in his red-and-white striped jumper, usually sits on a sheet of paper or a screen and always looks the same. Here the object to find changes and hides in real space. The system has to work with people to map and identify objects: starting from a photo, from a description, or because something is “out of place”.",
      build:
        "A vision system, possibly with an arm or the robot dog, that is given an object to look for, finds it in the scene and shows it to a person.",
      inputs: `A station with a table and 20–30 everyday objects; camera 2; arm 2 with the printed tool, of which the tip is used; 1–2 slots on the robot dog to search the museum rooms ${TBC}. Public starting resource: YOLO-World, a detector that finds objects from a text description (GPL-3.0).`,
      grok: "Understand the request (text, voice, photo) and compare it with what the camera sees; explain why an object is out of place; ask for clarification when the request is ambiguous.",
      demo: {
        lead: "Two modes, tested by the jury on new requests.",
        items: [
          "Find this: given a description or a photo, the system highlights the object in the image and the arm indicates it.",
          "What changed: given a reference scene, the system flags the object that was added, removed or moved.",
        ],
      },
      stretch: [
        "The arm lifts an object placed on a tray with the fork",
        "The dog explores a room and comes back with the location",
        "Voice dialogue",
        "A map of the room with the objects found",
      ],
      outOfScope: "Training a detector from scratch; autonomous navigation of the dog in unprepared spaces.",
      judging:
        "SEA Vision's criteria: originality, how well the team makes the theme its own, a working demo. “Amaze us!” Measures: objects found out of 10 new requests from the jury; average time to find them; false alarms in “What changed” mode.",
      hardware:
        "Arm 2 with camera 2, for 2 teams in alternating slots; 1–2 slots on the dog. When no hardware is free, teams work on recorded videos of the station. Indicative number of teams: 2–3.",
      mentors: "Claudio Peroni (Wednesday and Thursday, also on the jury); Michele Antolini (Thursday).",
    },
    {
      id: "best-rice-company",
      number: "B",
      kind: "company",
      title: "B.R.C. Best Rice Company: Autonomous Company",
      proposedBy: "Riso Scotti",
      summary: "Agents that take a retail order all the way to the invoice and settle disputes",
      hardwareSummary: "None",
      oneLiner:
        "How can a traditional food company handle orders, invoices and disputes without repetitive manual work?",
      context:
        "Riso Scotti wants to rethink its business processes like a tech company: less manual paperwork in the offices, faster response to the market, higher product quality. The critical issue is the dialogue with large retail chains: complex orders, delivery notes, invoices, disputes. Production enters the simulation as events, not with robots.",
      build:
        "A “zero-touch” back office on synthetic data, plus an architectural concept of how data flows from the factory to the administration.",
      inputs:
        "No documents from Riso Scotti: you start from public resources, and the team generates the dispute emails with Grok. Public resources: sample EDI ORDERS, DESADV and INVOIC messages in EdiFabric/EDIFACT-Examples; Italian e-invoices with python-a38; annotated commercial contract clauses in CUAD; a reconciliation baseline with sample files of the typical dispute cases: threeway.",
      grok: "Agents that read orders and documents, check quantities against stock, prepare the invoice, compare order, delivery and invoice, and propose how to settle a dispute, citing the documents they base it on.",
      demo: {
        items: [
          "An end-to-end process on a new order: receipt, availability check, simulated production and shipping events, invoice, reconciliation.",
          "On at least one dispute (partial delivery, different price, contested goods) the system proposes a resolution with the evidence.",
          "Every decision above a threshold goes through a person.",
        ],
      },
      stretch: [
        "Visual quality control of the rice grain on images, for example from GrainSet (licence to be checked)",
        "Predictive production planning",
        "An exceptions dashboard",
      ],
      outOfScope: "Connecting to a real ERP; real customer data; robots and production lines.",
      judging:
        "Orders reconciled correctly on a test set, better than the deterministic baseline; disputes resolved with the right evidence; cases handed to a person when needed; every action traceable to the document it comes from.",
      hardware: NO_HARDWARE,
      mentors: `Someone from Riso Scotti ${TBC}`,
    },
    {
      id: "labelling-from-the-model-pack",
      number: "C",
      kind: "company",
      title: "Labelling from the Model Pack",
      proposedBy: "Cristina Portinaro Cosmetics",
      summary: "A robot that learns where the labels go by looking at a sample",
      hardwareSummary: "Arm, camera",
      oneLiner: "Can a robot learn to label a new product by looking at a single sample pack?",
      context:
        "For small batches of luxury cosmetics, labels are printed on die-cut sheets and applied by hand, usually two per pack: front (logo and name) and back (INCI and legal wording). The positions change from product to product (front, back, cap, bottom), and the model pack on the table shows the right combination. A wrong INCI is a compliance problem, not just a cosmetic one.",
      build:
        "A system that reads the model pack, repeats the work cycle with an arm and rejects non-compliant packs, with no retraining for each product.",
      inputs:
        "Packs and labels from Cristina Portinaro Cosmetics, or empty bottles or boxes with dummy labels on pre-cut adhesive sheets: one model pack per format and defective examples (crooked, creased or wrong label); camera 1; arm 1 with the printed tool, with the packs placed on slotted trays. Public resources: images of crooked, creased and bubbled labels in Bottle_defect (CC BY 4.0); official INCI names in the EU CosIng database; demonstrations and policies for arms in LeRobot.",
      grok: "Read the photos of the model pack and turn them into a specification (which label, on which face, where, with what tolerance); check that the sheet matches the product; judge compliance with an explanation.",
      demo: {
        lead: "Three steps.",
        items: [
          "Read the model: from the photos of the model pack, Grok produces the specification in a structured format.",
          "Cycle: the arm moves a pack from the left area to the work area, lifting it on the tray with the fork or pushing it; has it framed by the camera; takes it to the right if it is compliant, or pushes it into the reject box at the edge of the table if it is not. The labels are applied by hand by the team.",
          "New product: the jury brings a model pack the system has never seen, and the system produces the specification and the checks without new training.",
        ],
      },
      stretch: [
        "A check after each label, so the back label is not wasted if the front one is defective",
        "Detecting when a sheet runs out",
        "Learning the cycle from a video of a team member labelling",
      ],
      outOfScope: "Peeling off and applying the labels with the arm; picking up packs without a tray; production speed.",
      judging:
        "Specification correct against the model; non-compliant packs rejected and compliant ones accepted (the most serious error is accepting a wrong pack); cycle completed without intervention; result on the new pack brought by the jury.",
      hardware:
        "Arm 1 with camera 1, 2 teams in alternating slots; outside the slots, teams work on photos and videos of the station.",
      mentors: `Someone from Cristina Portinaro Cosmetics who decides what is compliant ${TBC}`,
    },
    {
      id: "robot-dog-patrol",
      number: "D",
      kind: "company",
      title: "Robot Dog Patrol",
      proposedBy: "Riello",
      summary: "A camera sees an anomaly, the dog goes to check, the alert goes out",
      hardwareSummary: "Dog, smartphones as cameras",
      oneLiner: "Can a robot dog become the patrol that goes to check when a camera sees something strange?",
      context:
        "A company with a site of about 55,000 m² wants to pair a robot dog with its video surveillance: programmable patrols, targeted checks when a camera flags an anomaly, control from the guardhouse, a PC or a smartphone, automatic alerts to security or the caretaker. The museum rooms stand in for the site.",
      build: "The event → mission → check → alert flow, with a control console and a log of everything that happens.",
      inputs: `The museum's robot dog, in slots; 2–3 smartphones or laptops used as surveillance cameras, plus the dog's camera if it has one; a floor plan of the available rooms; a simulator of the dog, if the model allows it ${TBC}. Public resources: the unitree_sdk2_python and go2_ros2_sdk SDKs if the dog is a Unitree; camera events with Frigate; the alert call with the xAI voice-agent-phone example (requires Twilio).`,
      grok: "A natural-language console, typed or with Grok Voice (“patrol room 2”); assess the camera event and decide whether to send the dog; describe what the dog frames; compose the alert, also as a voice call.",
      demo: {
        lead: "Three steps.",
        items: [
          "A scheduled patrol between 3 spots in a room.",
          "A smartphone used as a camera detects a staged anomaly (a person in a restricted area, an abandoned object) and Grok sends the dog to the spot.",
          "The dog frames the scene, Grok describes it, and an alert goes out to a test number. Every event ends up in the log.",
        ],
        note: "Without a slot on the dog, the same flow runs with a simulated dog.",
      },
      stretch: [
        "A console on the smartphone",
        "Prioritising several events at once",
        "Recognising false alarms",
        "An end-of-shift report",
      ],
      outOfScope:
        "Sirens, deterrents or other modules mounted on the dog; footage of the real site; real calls to security or the police; autonomous navigation over 55,000 m².",
      judging:
        "Time between the event and the dog's arrival; staged anomalies verified correctly; false alarms forwarded; clarity of the alert; completeness of the log.",
      hardware: "Robot dog, 1–2 teams, only with museum staff present; 1–2 slots are kept for track A.",
      mentors: `Someone from Riello ${TBC}`,
    },
    {
      id: "research-radar",
      number: "01",
      kind: "open",
      title: "Research Radar",
      subtitle: "Mapping the Evolution of Scientific Knowledge",
      proposedBy: "Organisers",
      summary: "A map of how a research field changes over time",
      hardwareSummary: "None",
      oneLiner: "How is a research field changing?",
      context:
        "Research evolves too fast to follow by hand. Keyword searches return lists of papers, but rarely show how new subtopics emerge, which approaches converge and which results actually changed the landscape. Users: researchers, R&D, deep-tech investors, innovation teams.",
      build:
        "Given a topic and a time range, a system that collects publications from open sources, identifies the main strands, reconstructs the relationships between papers and flags which directions are accelerating or slowing down. Distinctive element: the “What changed?” mode, which compares two time windows and also states the variations caused by source coverage.",
      inputs:
        "A topic, a main period (for example 24 months), a comparison window, optional filters. Open sources: arXiv, OpenAlex, PubMed/Europe PMC. Public resources: the pyalex Python client for OpenAlex (CC0 data, MIT library); BERTopic for topics over time.",
      grok: "Give the clusters readable names; write the report so that every claim has a linked source; flag uncertainty. Cluster names are hypotheses derived from the data, not predefined labels.",
      demo: {
        items: [
          "One domain and one source, 500–1,000 records with a reproducible query.",
          "5–10 clusters with readable names, example papers and a timeline.",
          "A comparison between two windows with at least 3 insights backed by sources.",
          "A mini-dashboard filterable by period and cluster.",
        ],
        note: "Example: “reinforcement learning”, the last 90 days against the previous 90, with clusters such as offline RL or RL for agents and the relative growth of each.",
      },
      stretch: [
        "Cross-source deduplication",
        "Interactive citation graph",
        "Novelty score",
        "Recurring alerts",
        "Comparison between authors and labs",
        "Conversational search with sources",
        "Suggested topics close to the companies: AI for food quality control, robots that learn from a demonstration",
      ],
      outOfScope: "Full-text extraction without the rights; claiming that more papers mean more quality or impact.",
      judging:
        "Retrieval quality on an annotated sample; cluster coherence assessed by hand; correctness of the dates; share of report claims with a valid source; usefulness of the trends against a simple baseline.",
      hardware: NO_HARDWARE,
      mentors: TBC,
    },
    {
      id: "github-benchmark-arena",
      number: "02",
      kind: "open",
      title: "GitHub Benchmark Arena",
      subtitle: "Continuous Evaluation of Emerging Open-Source Tools",
      proposedBy: "Organisers",
      summary: "A reproducible benchmark of new open-source tools",
      hardwareSummary: "None",
      oneLiner: "Which new tools actually work?",
      context:
        "New frameworks and libraries come out every week, with claims that are hard to compare. GitHub stars and promotional demos do not measure reliability or performance on real workloads. Users: developers, platform engineers, AI infrastructure teams, CTOs, applied researchers.",
      build:
        "Given a software topic, a system that finds relevant open-source repositories, installs and runs them in a controlled environment, compares them on shared tasks with reproducible metrics and keeps a leaderboard over time. Distinctive element: re-running the comparisons when a repository changes or a new one arrives, keeping the experiments comparable.",
      inputs:
        "A category (for example agent harnesses), a GitHub query, minimum requirements, a task suite, a time budget. Public resources: tasks for agents with tools and a simulated user in tau-bench and tau2-bench (MIT). Isolated containers with Docker on the teams' laptops.",
      grok: "Grok is the fixed model used by all the tools being compared, so the leaderboard measures the tools and not the models; for open-ended answers, Grok acts as a judge with a rubric calibrated on examples, alongside deterministic checks.",
      demo: {
        items: [
          "3 compatible repositories chosen by hand.",
          "10 tasks with a common adapter and an explicit baseline.",
          "At least 2 runs per tool, saving the commit, configuration and logs.",
          "A leaderboard with a comparison by metric and at least one reproducible failure.",
        ],
        note: "Example: 3 agent harnesses on the same 10 tasks, measuring success, duration, calls, tokens and estimated cost.",
      },
      stretch: [
        "Automatic discovery of new repositories",
        "Confidence intervals",
        "Regressions between versions",
        "Scheduled runs with notifications",
      ],
      outOfScope:
        "Running unknown code outside the containers; using an LLM judge as the only source of truth without annotated examples.",
      judging:
        "Reproducibility of the runs; correctness of the adapters; coverage and quality of the tasks; transparency of the scoring; robustness to installation errors; execution security.",
      hardware: NO_HARDWARE,
      mentors: TBC,
    },
    {
      id: "agent-failure-lab",
      number: "03",
      kind: "open",
      title: "Agent Failure Lab",
      subtitle: "Understanding Why AI Agents Fail",
      proposedBy: "Organisers",
      summary: "Understand why an agent fails and verify the fix",
      hardwareSummary: "None",
      oneLiner: "Why does an agent fail, and how can it be improved?",
      context:
        "When an agent fails, the final result rarely says whether the cause is a wrong plan, an incomplete search, a misused tool or a loop. Analysing long traces by hand is slow and does not scale. Users: teams building agents, QA, MLOps, AI product engineering.",
      build:
        "A system that reads the execution traces of agents, classifies the failures, identifies the most plausible cause and proposes fixes verified with new runs. Distinctive element: a fix only counts if it improves a test without obvious regressions.",
      inputs:
        "A task, an expected outcome or success test, a structured trace (messages, tool calls, outputs, timings, costs), the agent configuration. Public resources: traces annotated with 14 failure modes in MAST-Data (code in MAST); failures attributed to agent and step in Who&When. The traces produced by the teams on tracks A, B, C and D are real cases, if they share them.",
      grok: "Grok acts as the diagnostician: it reads the trace and proposes a category and a cause, citing the steps, with a confidence level. Alongside it there are deterministic rules for timeouts, loops and failed tests.",
      demo: {
        items: [
          "15–20 traces, synthetic ones included, with at least 4 error categories and an annotated ground truth.",
          "A parser, a timeline and a classifier with per-step evidence.",
          "2 concrete fixes (for example a controlled retry and a mandatory check before the final answer).",
          "A replay on 5 tasks with success, regressions, timings and costs before and after.",
        ],
      },
      stretch: [
        "Traces read live",
        "Grouping of recurring failures",
        "Generated regression tests",
        "Proposed fixes with human approval",
        "Comparison between agents and versions",
      ],
      outOfScope: "Presenting a Grok diagnosis as causal proof without an experiment that verifies it.",
      judging:
        "Classification accuracy on annotated traces; precision in finding the relevant step; quality and verifiability of the explanations; effective fixes; regressions introduced; additional cost.",
      hardware: NO_HARDWARE,
      mentors: TBC,
      taxonomy: [
        { area: "Plan", items: "incomplete, dependencies overlooked." },
        { area: "Tool use", items: "wrong tool, wrong parameters." },
        { area: "Context", items: "insufficient sources, lost context." },
        { area: "Reasoning", items: "unsupported inferences, premature choices." },
        { area: "Execution", items: "timeouts, crashes, resource limits." },
        { area: "Verification", items: "output not checked, tests not run, success wrongly claimed." },
      ],
    },
    {
      id: "voice-control",
      number: "04",
      kind: "open",
      title: "Voice Control",
      proposedBy: "Organisers",
      summary: "Control a robotic arm by voice with Grok Voice",
      hardwareSummary: "Arm",
      oneLiner: "Can you control a robotic arm by speaking, with natural requests in Italian?",
      context:
        "In a lab or on a production line, people who don't program robots should be able to call up ready-made operations without writing code or using the teach pendant. Voice frees the hands, but it has to be safe: confirmations before movements and a stop that is always available.",
      build:
        "A voice assistant that understands the request, chooses among 3–5 predefined skills of the arm, asks for confirmation, executes and reports what it did.",
      inputs:
        "Arm 3 with the printed tool and slotted trays; basic skills (go to pose, indicate, lift the tray, put down, push) written by the team with the arms' software; the laptop microphone. Public resources: the official xai-sdk-python SDK and the voice-agent-web example of a voice agent in the browser.",
      grok: "Grok Voice in real time, with function calls to the arm's skills; voice confirmation before every movement; recognising “stop” at any moment.",
      demo: {
        items: [
          "The jury dictates 5 new commands, including an ambiguous request (the system asks for clarification) and a “stop” that halts the arm immediately.",
          "Each command maps to a skill, with confirmation before the movement and a final report.",
        ],
      },
      stretch: [
        "Sequences of several skills (“lift the tray and take it to the right”)",
        "Recording a new skill by voice",
        "More languages",
      ],
      outOfScope: "Free trajectories dictated by voice; movements without confirmation.",
      judging:
        "Commands executed correctly out of 10; time between the end of the sentence and the start of the movement; handling of ambiguous or out-of-reach commands; a stop that is reliable at any moment.",
      hardware:
        "Arm 3, dedicated, without a camera; 2 teams in alternating slots. Outside the slots, teams work with a simulated arm that receives the same commands.",
      mentors: TBC,
    },
    {
      id: "robot-skill-passport",
      number: "05",
      kind: "open",
      title: "Robot Skill Passport",
      proposedBy: "Organisers",
      summary: "Tutorials generated from manuals and videos, with a hands-on check",
      hardwareSummary: "Short test on an arm",
      oneLiner:
        "Can someone who has never used a robot learn from an automatically generated tutorial, and prove it?",
      context:
        "Training on robots relies on long manuals and on people who already know how to use them. What is missing is a short path, with a check that tells whether the person has really learned.",
      build:
        "A tutorial generator that, from manuals and videos, produces short steps with key images and a verifiable checklist, plus a “passport” that records the skills each person has acquired.",
      inputs:
        "The manuals of the arms, available online; videos of the basic operations (switching on, manual movement, attaching the tray, emergency stop) recorded by the team during the slots. Public resource for prototyping before the real videos: datasets of demonstrations with video in LeRobot.",
      grok: "Read manuals and video frames; write the steps; generate the check questions and assess the answers; flag when a step of the tutorial has no match in the manual.",
      demo: {
        items: [
          "A tutorial for 2 real operations.",
          "A person who doesn't know the arms follows it in front of the jury.",
          "The checklist records what they did well and what they didn't; the passport shows the skills acquired.",
        ],
      },
      stretch: [
        "A practical check with the smartphone (for example: did they press the emergency stop?)",
        "Tutorials in more languages",
        "Automatic updates when the manual changes",
      ],
      outOfScope: "Real safety certifications; using the robot without staff.",
      judging:
        "Time and errors of the person with and without the tutorial; no step invented with respect to the manual; clarity of the checklist.",
      hardware: "No hardware to build; 15 minutes on arm 3 for the final test; no limit on the number of teams.",
      mentors: TBC,
    },
    {
      id: "labos",
      number: "06",
      kind: "open",
      title: "LabOS",
      proposedBy: "Organisers",
      summary: "A chat custodian for the inventory and bookings of a lab",
      hardwareSummary: "None",
      oneLiner:
        "Can a digital custodian keep a robotics lab in order: what is there, where it is, who uses it and when?",
      context:
        "In shared labs, time is lost on inventory, machine bookings and usage rules. The information lives in scattered spreadsheets and in the head of whoever runs the lab.",
      build:
        "A custodian in chat that manages inventory, calendar and bookings, applies the lab rules and keeps the history.",
      inputs: `The real inventory of the hackathon (arms, dog, cameras, grippers) and the station slots as a real case ${TBC}. Public resource: eLabFTW, open-source software (AGPL-3.0) with inventory, a booking calendar and an API, usable as a base.`,
      grok: "A Grok bot that takes bookings in natural language, checks conflicts and rules, answers questions like “where is the suction gripper?”, sends reminders and frees up slots.",
      demo: {
        items: [
          "A searchable inventory; a calendar; booking and cancelling in chat.",
          "At least 3 rules applied (no overlaps, 30-minute slots, staff present).",
          "A history of the operations.",
        ],
        note: "The jury's test includes conflicting requests.",
      },
      stretch: [
        "Becoming the tool the teams use to book slots on Thursday morning",
        "Automatic reminders",
        "Connection to the machines' logs",
      ],
      outOfScope: "Physical access control; integration with company systems.",
      judging:
        "Requests handled correctly on a test set, including conflicting ones; rules never broken; time to complete a booking.",
      hardware: NO_HARDWARE,
      mentors: TBC,
    },
  ],
  rules: [
    "Grok (the API, Grok Voice or the Bot) must be essential to how the solution works, not decorative.",
    "The minimum demo must be shown on Thursday by 16:30, on a new case chosen by the jury.",
    "You deliver a repository with a README, the data used, at least one result measured against a baseline, and the known limitations.",
    "The arms and the dog are used in 30-minute slots, always with staff alongside; outside the slots, you work in simulation or on video. The arms have no gripper: they carry a printed tool with a fork, a pusher and a tip, and only lift objects placed on slotted trays.",
    "Only public data, synthetic data or data provided by the companies for the event.",
  ],
};
