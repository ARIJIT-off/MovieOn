---
name: humanize-academic-paper
description: >-
  Humanizes AI-generated academic papers, engineering project reports, and B.Tech thesis
  documents. Strips synthetic vocabulary, buzzword clustering, and formulaic phrasing
  while preserving 100% technical accuracy, metrics, code schemas, and formal structure.
---

# Academic Paper Humanizer Skill (`humanize-academic-paper`)

This skill defines the methodology, linguistic patterns, and transformation rules for rewriting and humanizing AI-generated academic papers, B.Tech engineering project reports, abstracts, and technical thesis chapters.

---

## 1. Core Purpose

AI models writing academic papers often produce text that is technically correct but syntactically unnatural. It exhibits:
- Excessive density of stacked formal jargon (e.g., *"reconciling high-concurrency seat reservation with real-time operational transparency"*).
- Predictable clause structures (e.g., *"By combining X and Y, the proposed system achieves Z, delivering high throughput and low-latency usability"*).
- Hyperbolic descriptors for everyday engineering choices (e.g., calling a dark background an *"engineered void canvas"*).

This skill guides the agent to transform AI-generated drafts into **authentic, high-scoring human academic writing** that sounds like an articulate, capable undergraduate or graduate engineering student.

---

## 2. De-AI Linguistic Rules (The "Humanizer" Filter)

### Rule A: Banned Synthetic Phrases & Replacement Matrix
Replace these ubiquitous AI expressions with natural academic equivalents:

| AI Synthetic Pattern | Human Academic Alternative |
| :--- | :--- |
| *"In contemporary digital era / Rapid digitalization in..."* | *"In recent years, modern web platforms / Online booking systems..."* |
| *"Reconciling X with operational transparency"* | *"Balancing user experience with accurate backend tracking"* |
| *"Bifurcates cleanly after authentication"* | *"Directs the user to either the customer or admin interface"* |
| *"Deterministic state-driven pipeline"* | *"Structured step-by-step workflow"* |
| *"Empirical deployment demonstrates..."* | *"Testing and real-world deployment showed that..."* |
| *"Eradicate / neutralize concurrency hazards"* | *"Prevent race conditions and double-bookings"* |
| *"Engineered void surface (#0a0a0f)"* | *"Dark-themed user interface with high contrast"* |
| *"Vulnerable to screenshot forgery"* | *"Easy to duplicate or tamper with"* |
| *"Delivering X, Y, and Z"* (at the end of every paragraph) | Break into a clean, direct concluding sentence. |

### Rule B: Sentence Length and Rhythm Variation
- **AI Pattern:** Long compound sentences (40–60 words) joined by semicolons, em-dashes, and multiple participial clauses (*"featuring...", "enforcing...", "delivering..."*).
- **Human Pattern:** Alternating rhythm. Use a clear, direct statement (12–18 words), followed by an explanatory sentence with specific examples (20–28 words).

### Rule C: Active Engineering Voice
- Let the student's voice speak through design decisions:
  - **Instead of:** *"The proposed architecture replaces traditional password-heavy registration forms with..."*
  - **Use:** *"To eliminate login friction and forgotten passwords, we implemented a passwordless 4-digit OTP system..."*

---

## 3. Preservation Rules (Do Not Change)

When humanizing an engineering paper, **NEVER alter or weaken:**
1. **Technical Specifications:** Tool names (`Node.js`, `Express.js`, `MongoDB Atlas`, `SheetJS`, `Nodemailer`, `Canvas API`).
2. **Database Schemas & Identifiers:** Collection names (`bookings`, `users`, `admins`, `otps`), field types, and ID formats (`MOV-2026-KOL-xxxxx`).
3. **Exact System Values:** Port numbers (`4000`), TTL durations (`300s`), seat counts (`180`, `150`, `70`), and auditorium labels (`Audi 1 STD`, `Audi 2 STD+`, `Audi 3 REC`).
4. **Academic Structure:** Chapter titles, table numbers, citation indices (`[1]`, `[2]`), and methodology headings.

---

## 4. Step-by-Step Humanization Workflow

When invoked on a file or section:
1. **Analyze:** Identify the target text and locate the heaviest AI-vocabulary clusters (especially in the Abstract, Introduction, and Conclusion).
2. **Preserve Anchors:** Extract all code symbols, metrics, and library names to keep them strictly intact.
3. **Rework Syntax:**
   - Simplify introductory sentences to state real-world engineering problems plainly.
   - Replace abstract nouns with active verbs.
   - Remove repetitive transition phrases (*"Furthermore", "Moreover", "Notably"*).
4. **Inspect for AI Traps:** Ensure no lingering AI hallmarks remain (e.g., *"tapestry"*, *"paramount"*, *"testament"*, *"reconciling"*).
5. **Format & Verify:** Output the humanized text preserving all Markdown or DOCX structure.
