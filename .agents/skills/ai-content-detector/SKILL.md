---
name: ai-content-detector
description: >-
  Audits, analyzes, and scores academic text, project reports, and essays for AI-generated
  markers, perplexity patterns, burstiness variance, and synthetic vocabulary density.
  Provides a calibrated AI probability score (0-100%), highlights flagged sentences,
  and suggests humanizing edits.
---

# AI Content Detector & Perplexity Auditor Skill (`ai-content-detector`)

This skill evaluates text against the exact statistical, stylistic, and semantic heuristics utilized by commercial AI detection engines (such as Turnitin AI Writing Detection, GPTZero, ZeroGPT, and CopyLeaks).

---

## 1. Core Heuristics Evaluated

Commercial AI detectors do not "read" like humans; they evaluate mathematical and structural patterns:

1. **Perplexity (Vocabulary Predictability):**
   - AI models choose the statistically most probable next token given context.
   - Low perplexity = smooth, predictable, robotic word flow.
   - High perplexity = creative, varied, non-standard vocabulary choices typical of human writers.

2. **Burstiness (Sentence Length & Rhythm Variance):**
   - AI outputs maintain uniform sentence lengths (usually 25–35 words per sentence) with consistent syntactic cadence.
   - Humans write with "bursts": an ultra-short punchy sentence (6 words) followed by a moderately complex sentence (18 words), followed by an illustrative compound sentence (35 words). Low burstiness variance is a prime trigger for AI flags.

3. **Synthetic Transition Density & Tri-gram Clustering:**
   - Detects clustered transitional markers (*"Furthermore"*, *"Moreover"*, *"Notably"*, *"In summary"*, *"It is crucial to note"*).
   - Flags formulaic structural templates (*"X not only accomplishes Y, but also ensures Z, delivering..."*).

4. **Abstract Noun Stacking & Thesaurus Inflation:**
   - Detects over-abstraction where simple engineering facts are masked in hyper-formal nouns (*"reconciling operational transparency with high-concurrency paradigms"*).

---

## 2. Scoring Matrix (0% to 100%)

When auditing text, assign a weighted score across four dimensions:

| Dimension | Weight | Detection Metric | Low Risk (Human: 0–25%) | High Risk (AI: 75–100%) |
| :--- | :---: | :--- | :--- | :--- |
| **Burstiness Variance** | 30% | Standard deviation of sentence word counts ($\sigma_{len}$) | $\sigma > 12$ words (High variance) | $\sigma < 5$ words (Uniform length) |
| **Perplexity & Surprisal** | 30% | Frequency of unexpected vs. statistically obvious synonyms | Organic vocabulary & direct phrasing | Saturated multi-syllabic jargon chains |
| **Marker Density** | 20% | Count of synthetic filler phrases per 500 words | 0–1 markers per 500 words | $\ge 5$ markers per 500 words |
| **Syntax Uniformity** | 20% | Frequency of participial trailing clauses (*"delivering...", "enforcing..."*) | Rare / purposeful | Saturated at paragraph endings |

### Score Interpretation:
- **0% – 15%:** **Authentic Human.** High burstiness, natural rhythm, direct phrasing, no buzzword clustering.
- **16% – 35%:** **Mostly Human / Polished.** Slight formality, but natural sentence variance and authentic voice.
- **36% – 60%:** **Mixed / AI-Assisted.** Noticeable rhythm uniformity and predictable transition words.
- **61% – 100%:** **High AI Probability.** Classic LLM signature: uniform sentence pacing, excessive jargon stacking, participial concluding clauses.

---

## 3. Audit Protocol & Output Format

When auditing any passage or chapter, format the report as follows:

```markdown
### 📊 AI Detection Audit Report

- **Estimated AI Probability Score:** [0% – 100%]
- **Burstiness Rating:** [High Variance (Human) / Moderate / Uniform (AI)]
- **Perplexity Level:** [Organic / Low Predictability / Highly Predictable (AI)]

#### 🚩 Flagged Sentences & AI Triggers
1. **Quote:** *"..."*
   - **Trigger:** [e.g., Low burstiness / thesaurus stacking / trailing participial clause]
   - **Human Alternative:** *"..."*

#### 💡 Recommendations for 0% Flag
- Specific recommendations on rhythm, phrasing, and vocabulary to neutralize AI detectors.
```
