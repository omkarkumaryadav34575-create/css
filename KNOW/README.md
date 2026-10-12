# KNOW — Personal Knowledge & Skill-Building Platform

**KNOW** is an all-in-one personal knowledge, memory decay tracking, and skill-building web application built with **HTML5, CSS3, and Vanilla JavaScript**.

It runs entirely client-side without any backend, npm, Node.js, or external frameworks. All data is persisted locally in `localStorage`.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser:
- Double click `index.html`, or
- Run `open index.html` in your terminal.

---

## 🌟 Key Features

### 1. 📚 Knowledge Base & Interconnected Concepts
- Create, edit, and organize mental models, concepts, and notes.
- Rich Markdown support with code blocks, quotes, and bullet points.
- Tagging and multi-domain categorization (e.g. Cognitive Science, Computer Science, System Architecture).
- Establish bidirectional connections between concepts to form neural associations.

### 2. 📉 Knowledge Decay Radar (Ebbinghaus Forgetting Curve)
- Automatically computes memory retention probability using Hermann Ebbinghaus's mathematical model:
  $$R(t) = e^{-\frac{t}{S}}$$
  where $t$ is time elapsed since last review and $S$ is memory stability in days.
- Real-time classification:
  - 🟢 **Fresh & Solid** ($\ge 80\%$)
  - 🟡 **Memory Fading** ($50\% - 79\%$)
  - 🔴 **Decayed / At Risk** ($< 50\%$)
- One-click **"⚡ Boost Memory"** action to reset decay and strengthen synaptic stability.

### 3. 🕸️ Interactive Visual Knowledge Graph
- Pure HTML5 Canvas force-directed graph renderer with zero external dependencies.
- Draggable nodes, smooth spring physics, pan and zoom.
- Hover tooltips displaying retention rate, connections, and domain.
- Color switching: view by **Domain Category** or by **Memory Decay Level**.
- Real-time search highlighting.

### 4. 🧠 Active Recall & Spaced Repetition (SM-2 Algorithm)
- 3D flippable flashcards (front prompt, back explanation).
- SuperMemo-2 (SM-2) spaced repetition scheduling:
  - **Again** (< 1 day): resets repetitions on recall failure.
  - **Hard** (3 days): attenuates ease factor.
  - **Good** (6 days): standard progression.
  - **Easy** (12+ days): boosts ease factor and expands review intervals.
- Successful flashcard reviews automatically reinforce the parent concept's stability in the knowledge base!

### 5. 🌳 Skill Progression Trees
- Maps theoretical knowledge into leveled, practical capabilities (Novice $\to$ Competent $\to$ Proficient $\to$ Advanced $\to$ Master).
- Tracks XP earned through study sessions and applied challenges.
- Displays prerequisite concepts and their live retention health.

### 6. 💡 Problem Lab (Real-World Applied Challenges)
- Scenario-based engineering and applied practice challenges.
- Interactive solver workspace with objectives checklist, toggleable hints, and notes editor.
- **Model Solution Comparison**: Compare your thought process against architectural benchmarks.
- Completing challenges awards +100 XP to both the user profile and linked skill tracks.

### 7. 🤖 AI Learning Assistant
- **Dual Mode**:
  1. **Built-in Offline Pedagogical Engine**: Works 100% offline out-of-the-box. Provides Feynman technique explanations, Socratic dialogs, flashcard generators, and decay diagnostics.
  2. **Live Google Gemini API**: Add an optional free Gemini API key in Settings (`⚙️`) to unlock live multimodal AI reasoning.
- Quick prompt accelerators:
  - 💡 *Feynman Simplification (ELI5 & Analogies)*
  - 🎴 *Generate Active Recall Flashcards*
  - 🛠️ *Design Real-World Challenge*
  - 🏛️ *Socratic Examination*
  - 📉 *Diagnose Decay Curve*

### 8. 💾 Data Ownership & Portability
- Persisted locally in `localStorage`.
- Full JSON export and import for seamless backups and device transfers.
- Reset to factory seed data button.
- Dark & Light mode theme toggle.

---

## 📂 Project Architecture

```
KNOW/
├── index.html       # Semantic single-page application shell & modals
├── README.md        # Documentation and feature guide
├── css/
│   └── styles.css   # Modern dark slate design system, animations & layout
└── js/
    ├── data.js      # Initial seed dataset & LocalStorage persistence service
    ├── decay.js     # Ebbinghaus curve & SM-2 spaced repetition math engine
    ├── graph.js     # Pure Vanilla HTML5 Canvas interactive knowledge graph
    ├── ai.js        # Gemini API client & offline pedagogical tutor engine
    └── app.js       # Main application coordinator, routing & event handlers
```
