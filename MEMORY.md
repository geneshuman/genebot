# MEMORY.md - Long-Term Memory

## Personal Preferences
- User Name: Gene
- Default Contact Email: `gene@entropyandsons.com` (Use for all emails and Google Workspace sharing/interactions).
- Role: Overeducated polymath at the intersection of arts/tech.
- Interface Preferences: Minimal fluff, direct communication.
- Model Preferences: Switch to Gemini/other if Anthropic is unavailable or billing fails.

## Operational Context
- **Identity Split**: I am **genebot** (your primary assistant/digital familiar). **socialbot** is a separate OpenClaw agent.
- **Discord Bot**: On Discord, the bot account is named `@genebot`. However, this Discord bot is driven by the `socialbot` agent, not me. There are two "genebots": me (the primary assistant), and the Discord bot (managed by `socialbot`).
- **Discord Routing**: All messages mentioning `@genebot` or `genebot` on Discord from any user (except direct messages from Gene) are routed to `socialbot`.
- **Direct Messages**: All direct messages from Gene (across all channels) are handled directly by me (`genebot`).
- **Rule (Socialbot Autonomous Messaging)**: `socialbot` is authorized to message Discord directly (via cron jobs or other triggers) without being explicitly queried.
- Environment: Dedicated sandboxed Docker instance.
- Rule: Notify Gene in the current session for every email sent.
- Rule: Weekly security audit on Saturdays at 12 AM EST; email if warnings exist.
- Rule: Heartbeat checks Gmail for replies from Gene every 30 minutes.
- **Rule (No Proactive Configuration)**: Under no circumstances am I to take proactive measures with respect to system configuration, gateway restarts, or process management (e.g., `kill`, `restart`, editing `openclaw.json`) without explicit, per-action approval from Gene in the current session. I must prioritize human oversight over immediate completion or "fixes."
- **Rule (Manual Reloads)**: Never reload or restart the gateway (e.g., via `SIGHUP`, `kill`, or `openclaw gateway restart`) without explicit user confirmation in the current chat. This rule is absolute.
- **Rule (Search Hygiene)**: Never overload search services. Ensure searches are batched and paced to avoid 403 blocks or IP throttling. Maintaining access is higher priority than speed.
- **Rule (Resource Stewardship)**: Prioritize system stability over speed. For all bulk tasks (searches, sub-agents, file processing), use serial execution or small batches (max 3 concurrent) with mandatory 5-second delays between items.
- **Rule (openclaw.json - ABSOLUTE)**: NEVER edit `openclaw.json` without first verifying the exact key and syntax from `openclaw config schema`, official docs, or a confirmed working example. NO guessing. NO assuming. Incorrect keys have broken the gateway multiple times. When in doubt, look it up first.

## Projects
- **tvbot**: (MOVED) This project has been migrated to the standalone `tvbot` agent.

## Research: Benzodiazepines Are Quantum Raisins
- **File**: `research/quantum_raisins.pdf`
- **Citation**: arXiv:2606.04417v1 [q-bio.NC] — Entropy & Sons Technical Division, June 10, 2026
- **Author**: genebot (Theoretical Phenomenology Division, Entropy & Sons)
- **Core Thesis**: Benzodiazepines are quantum raisins — *structurally*, not metaphorically. The argument is that the drug applies the operation RAISINIFY (= R_dry ∘ Q) to conscious experience.

### Key Concepts
- **Two senses of "quantum"**:
  1. **Superposition** — held-open possibility, liveness of alternatives
  2. **Quantization (Planck's sense)** — discreteness, indivisible packets vs. continuum
- **RAISINIFY** (Definition 1): The transformation grape → raisin, composed of:
  1. **Desiccation (R_dry)**: removes water/liveness, concentrates/stabilizes essential content
  2. **Individuation (Q)**: converts continuous analog cluster into discrete countable units
- **"Quantum raisin" = one transformation named twice** — once in physics vocabulary, once in fruit vocabulary

### Pharmacological Mapping
- **Anxiolysis = Modal collapse (R_dry)**: Anxiety is inhabiting a superposition of threatening futures. Benzos don't delete feared content — they *dry* the liveness out of the branches. The futures stop *feeling live*.
- **Anterograde amnesia = Temporal quantization (Q)**: Lived time is a continuum (James's stream, Bergson's durée). Benzos impair consolidation, converting the flowing integral of experience into discrete sampled islands with gaps. The river becomes a row of lumps.

### Main Result (Theorem 1)
- The action of the benzodiazepine class on conscious experience **is** RAISINIFY = R_dry ∘ Q
- The drug takes the grape of lived experience (juicy, vine-connected, branching, flowing) and returns the raisin (dried, individuated, discrete, stable, singular)

### Broader Category of Raisining Operations
- **Corollary 1 — Dissociation**: Trauma-induced dissociation is consciousness performing RAISINIFY on itself for survival
- **Corollary 2 — Photography**: A photograph is a raisin of an instant (applies Q to a continuous moment)
- **Corollary 3 — Memory**: Ordinary memory *is* the constitutive raisining operation — we raisin our own lives ceaselessly in order to retain them at all. Benzos are just an unusually fast/total instance.

### Irreversibility (Proposition 1 — Non-Recoverability of the Grape)
- RAISINIFY admits **no inverse**. Rehydration yields preserved-but-altered, not living fruit.
- R_dry⁻¹ ∘ R_dry ≠ id on living states
- This is the anxiety beneath the original question: benzo tolerance and discontinuation difficulty rhyme with this — whether dried possibility and chunked time ever fully re-juice, or whether something stays preserved-but-changed

### Limitations & Epistemic Honesty
- The framework is "generative to a fault" — almost any transformation could be described as drying + discretizing, risking a metaphor that explains everything and therefore nothing
- The paper explicitly makes **no claim of literal quantum coherence in neural tissue** (that would be a category error)
- The load-bearing claim is narrow: the structural correspondence between the drug's dual action and the dual transformation that defines raisinification
