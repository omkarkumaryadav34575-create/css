/**
 * KNOW - AI Learning Assistant Module
 * Supports direct Google Gemini API integration and built-in offline pedagogical tutor.
 * File: js/ai.js
 */

const AIAssistant = {
  chatHistory: [
    {
      role: 'assistant',
      content: 'Hello! I am your KNOW Learning Assistant. I can help you break down complex concepts using the Feynman technique, craft active recall flashcards, architect real-world challenges, and diagnose memory decay. How can I help you learn today?'
    }
  ],

  async sendMessage(userMessage, context = {}) {
    this.chatHistory.push({ role: 'user', content: userMessage });

    const settings = StorageService.loadSettings();
    const apiKey = settings.geminiApiKey ? settings.geminiApiKey.trim() : '';

    if (apiKey) {
      try {
        const responseText = await this.callGeminiAPI(userMessage, context, apiKey, settings.aiModel || 'gemini-1.5-flash');
        this.chatHistory.push({ role: 'assistant', content: responseText });
        return { response: responseText, mode: 'gemini' };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to offline tutor engine:', err);
        const fallbackText = this.generateOfflineResponse(userMessage, context) + `\n\n*(Note: Gemini API attempt returned an error: ${err.message}. Showing offline tutor response.)*`;
        this.chatHistory.push({ role: 'assistant', content: fallbackText });
        return { response: fallbackText, mode: 'offline-fallback' };
      }
    } else {
      const responseText = this.generateOfflineResponse(userMessage, context);
      this.chatHistory.push({ role: 'assistant', content: responseText });
      return { response: responseText, mode: 'offline' };
    }
  },

  async callGeminiAPI(prompt, context, apiKey, modelName = 'gemini-1.5-flash') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const systemInstruction = `You are KNOW, an elite cognitive tutor and knowledge architect.
Your goal is to help users learn deeply, organize interconnected ideas, master skills, and test knowledge through active recall and real-world problem solving.
Always maintain clarity, rigor, and actionable structure. Use Markdown formatting with clear bullet points and bolding.
Context about the user's knowledge base:
- Total Concepts: ${context.concepts ? context.concepts.length : 0}
- Current Active Concept: ${context.activeConcept ? JSON.stringify({ title: context.activeConcept.title, domain: context.activeConcept.domain, summary: context.activeConcept.summary }) : 'None'}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction + '\n\n' + prompt }]
      }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) throw new Error('No response text received from Gemini API');
    return text;
  },

  generateOfflineResponse(message, context = {}) {
    const msg = message.toLowerCase();
    const active = context.activeConcept;
    const allConcepts = context.concepts || StorageService.loadConcepts();

    if (msg.includes('flashcard') || msg.includes('cards') || msg.includes('generate card')) {
      if (active) {
        return `### 🎴 Generated Active Recall Flashcards for **${active.title}**\n\n` +
          `**Card 1:**\n` +
          `• **Front (Question)**: In simple terms, how would you define the core mechanism of *${active.title}*?\n` +
          `• **Back (Answer)**: ${active.summary || active.content.slice(0, 160)}...\n\n` +
          `**Card 2:**\n` +
          `• **Front (Question)**: Why is *${active.title}* critical in the domain of ${active.domain}, and what failure occurs when it is ignored?\n` +
          `• **Back (Answer)**: It prevents cognitive overload and memory attenuation. Without it, retention decays rapidly according to the forgetting curve.\n\n` +
          `*💡 Tip: Click **"Create Flashcard"** in the Active Recall tab to save these into your daily review deck!*`;
      }
      return `### 🎴 Flashcard Generation\nSelect an active concept from the sidebar first, or tell me which topic you want cards for.`;
    }

    if (msg.includes('feynman') || msg.includes('eli5') || msg.includes('explain simply') || msg.includes('simple')) {
      const target = active || allConcepts[0];
      return `### 💡 Feynman Explanation: **${target.title}**\n\n` +
        `Imagine explaining this to a curious 12-year-old:\n\n` +
        `1. **The Core Analogy**:\n` +
        `Think of ${target.title} like watering a delicate plant. If you dump 10 buckets of water in one afternoon (cramming), most of it washes away. But if you give it one measured cup of water right before the soil dries up, the roots grow deep into the ground.\n\n` +
        `2. **The Problem it Solves**:\n` +
        `${target.summary}\n\n` +
        `3. **Jargon-Free Summary**:\n` +
        `You don't need fancy terminology. It just means organizing your mind so that you do small, timely repetitions instead of overwhelming your brain with passive reading.\n\n` +
        `4. **Your Turn (Active Check)**:\n` +
        `Can you state the purpose of ${target.title} in a single sentence without using any technical buzzwords?`;
    }

    if (msg.includes('challenge') || msg.includes('problem') || msg.includes('scenario')) {
      const target = active || allConcepts[0];
      return `### 🛠️ Real-World Applied Challenge: **${target.title}**\n\n` +
        `**Scenario**:\n` +
        `You are hired as a Lead Architect for a high-intensity learning platform with 50,000 active students. Currently, retention metrics show that users forget 65% of lesson content within 72 hours of completion.\n\n` +
        `**Your Mission**:\n` +
        `1. Apply principles of **${target.title}** to redesign the review schedule.\n` +
        `2. Calculate the exact formula to flag at-risk concepts before retention drops below 50%.\n` +
        `3. Identify potential user friction points (e.g., backlog panic) and design an automated smoothing mechanism.\n\n` +
        `*Try drafting your solution in the **Problem Lab** tab!*`;
    }

    if (msg.includes('quiz') || msg.includes('socratic') || msg.includes('test me')) {
      const target = active || allConcepts[Math.floor(Math.random() * allConcepts.length)];
      return `### 🏛️ Socratic Examination: **${target.title}**\n\n` +
        `Let us test your mental model. Answer this without checking your notes:\n\n` +
        `> **Question**: *Suppose someone argues that highlighting a book three times is just as effective as self-testing on ${target.title}. How would you scientifically disprove their claim using neurobiology or cognitive science?*\n\n` +
        `Take a moment and reply with your thought process!`;
    }

    if (msg.includes('decay') || msg.includes('forgetting') || msg.includes('retention')) {
      const summary = DecayEngine.getDecaySummary(allConcepts);
      return `### 📉 Memory Decay Diagnostic\n\n` +
        `• **Current Average Retention**: **${summary.avgRetention}%** across your Knowledge Base.\n` +
        `• **Severely Decayed Concepts (<50%)**: ${summary.decayed.length} (${summary.decayed.map(d => d.concept.title).join(', ') || 'None! Great job!'})\n` +
        `• **Fading Concepts (50-80%)**: ${summary.fading.length}\n` +
        `• **Solid Concepts (>80%)**: ${summary.fresh.length}\n\n` +
        `**Tutor Recommendation**:\n` +
        `Target the decayed concepts immediately through Active Recall. Reviewing a concept just as it hits the brink of forgetting produces the largest synaptic consolidation bonus!`;
    }

    // "What should I learn next?" / Recommendations using user's actual knowledge data
    if (msg.includes('learn next') || msg.includes('what to learn') || msg.includes('what should i learn') || msg.includes('recommend') || msg.includes('next topic') || msg.includes('study next')) {
      const summary = DecayEngine.getDecaySummary(allConcepts);
      const skills = StorageService.loadSkills();
      const challenges = StorageService.loadChallenges();
      const unsolvedChallenges = challenges.filter(c => c.status !== 'completed');

      let response = `### 🧭 Personalized Learning Recommendation\n\n`;

      // 1. Check for decaying concepts first (protect retention)
      if (summary.decayed.length > 0) {
        const topDecayed = summary.decayed[0];
        response += `1. **Urgent Memory Refresh**: Your memory trace for **${topDecayed.concept.title}** has decayed to **${topDecayed.retention}%**. Review this in Active Recall before adding new cognitive load.\n\n`;
      } else if (summary.fading.length > 0) {
        const topFading = summary.fading[0];
        response += `1. **Preventive Spaced Review**: **${topFading.concept.title}** is attenuating at **${topFading.retention}%**. A quick 2-minute review will lock in long-term stability.\n\n`;
      } else {
        response += `1. **Memory Health**: Excellent! All your concepts currently boast strong retention (>80%). You have high cognitive headroom to learn new concepts.\n\n`;
      }

      // 2. Identify skill frontier
      if (skills.length > 0) {
        const activeSkill = skills[0];
        response += `2. **Skill Tree Target**: Focus on **${activeSkill.name}** (Level ${activeSkill.level}, ${activeSkill.xp}/${activeSkill.maxXp} XP). `;
        const unmasteredPrereqs = (activeSkill.requiredConcepts || [])
          .map(cid => allConcepts.find(c => c.id === cid))
          .filter(c => c && (c.mastery || 50) < 80);

        if (unmasteredPrereqs.length > 0) {
          response += `Solidify your mastery of prerequisite concept **${unmasteredPrereqs[0].title}** to advance this skill.\n\n`;
        } else if (unsolvedChallenges.length > 0) {
          response += `Level up this skill by solving the applied challenge: **${unsolvedChallenges[0].title}** in the Problem Lab.\n\n`;
        } else {
          response += `You have mastered all prerequisites in this track! Consider creating a new advanced challenge.\n\n`;
        }
      }

      // 3. Recommended adjacent concepts based on current knowledge graph
      const domains = Array.from(new Set(allConcepts.map(c => c.domain)));
      response += `3. **Synthesizing Next Concepts**:\n`;
      if (domains.includes('Computer Science')) {
        response += `• *Computer Science*: Explore **Dijkstra's Algorithm** or **Dynamic Programming** to extend your graph fundamentals.\n`;
      }
      if (domains.includes('System Architecture')) {
        response += `• *System Architecture*: Explore **CAP Theorem** or **Saga Distributed Transactions** to build upon Cache Invalidation and Event-Driven Architecture.\n`;
      }
      if (domains.includes('Learning Science')) {
        response += `• *Cognitive Science*: Explore **Interleaving Practice** and **Dual Coding Theory** to expand your meta-learning arsenal.\n`;
      }

      return response;
    }

    if (msg.includes('connect') || msg.includes('graph') || msg.includes('relat')) {
      if (active) {
        const conns = (active.connections || []).map(id => {
          const found = allConcepts.find(c => c.id === id);
          return found ? `**${found.title}**` : id;
        });
        return `### 🕸️ Concept Connections for **${active.title}**\n\n` +
          `Currently linked to: ${conns.length > 0 ? conns.join(', ') : 'None yet.'}\n\n` +
          `**Suggested New Connections**:\n` +
          `In cognitive architectures, concepts form associative neural clusters. Consider linking ${active.title} to foundational mental models in the **Knowledge Graph** tab to unlock multi-hop associative recall.`;
      }
      return `### 🕸️ Knowledge Graph Architecture\nKnowledge is non-linear. Try connecting ideas from different domains (e.g. connecting *Spaced Repetition* in Cognitive Science to *Cache Invalidation* in Systems Architecture). Cross-domain metaphors create durable mental models!`;
    }

    return `### 🎓 Deep Learning Guidance\n\n` +
      `Here are recommended ways I can assist your learning journey right now:\n\n` +
      `• **Feynman Technique**: Ask *"Explain [topic] using the Feynman technique"*\n` +
      `• **Flashcard Generator**: Ask *"Generate active recall flashcards"*\n` +
      `• **Real-World Scenarios**: Ask *"Create a real-world problem challenge"*\n` +
      `• **Socratic Quiz**: Ask *"Test my understanding with a Socratic question"*\n` +
      `• **Decay Diagnosis**: Ask *"Analyze my memory decay curve"*\n\n` +
      `*(Pro-tip: You can also enter a Google Gemini API Key in **Settings** to enable real-time generative intelligence!)*`;
  },

  renderView() {
    const concepts = StorageService.loadConcepts();
    const settings = StorageService.loadSettings();
    const select = document.getElementById('ai-context-concept-select');

    if (select) {
      const curVal = select.value;
      select.innerHTML = `<option value="">None (General Guidance)</option>`;
      concepts.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.title} (${c.domain})`;
        if (c.id === curVal) opt.selected = true;
        select.appendChild(opt);
      });
    }

    const badge = document.getElementById('ai-active-mode-badge');
    if (badge) {
      if (settings.geminiApiKey) {
        badge.textContent = `Live Gemini Mode (${settings.aiModel || '1.5 Flash'})`;
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#10b981';
      } else {
        badge.textContent = 'Offline Pedagogical Mode';
        badge.style.background = 'rgba(99, 102, 241, 0.2)';
        badge.style.color = '#818cf8';
      }
    }

    this.renderChat();
  },

  renderChat() {
    const container = document.getElementById('ai-chat-messages-container');
    if (!container) return;

    container.innerHTML = '';
    this.chatHistory.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.role}`;
      bubble.innerHTML = this.formatMarkdown(msg.content);
      container.appendChild(bubble);
    });
    container.scrollTop = container.scrollHeight;
  },

  formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^\• (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/\n\n/g, '<br><br>');
    return html;
  },

  async handleUserPrompt(promptText) {
    const inputEl = document.getElementById('ai-chat-input');
    const text = promptText || inputEl?.value.trim();
    if (!text) return;

    if (inputEl) inputEl.value = '';

    const concepts = StorageService.loadConcepts();
    const activeConceptId = document.getElementById('ai-context-concept-select')?.value;
    const activeConcept = concepts.find(c => c.id === activeConceptId);

    this.chatHistory.push({ role: 'user', content: text });
    this.renderChat();

    const container = document.getElementById('ai-chat-messages-container');
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'chat-bubble assistant';
    thinkingBubble.id = 'ai-thinking-bubble';
    thinkingBubble.innerHTML = '<em>Thinking & formulating pedagogical response...</em>';
    container?.appendChild(thinkingBubble);
    if (container) container.scrollTop = container.scrollHeight;

    try {
      this.chatHistory.pop();
      await this.sendMessage(text, { activeConcept, concepts });
    } catch (err) {
      this.chatHistory.push({
        role: 'assistant',
        content: `Error generating response: ${err.message}`
      });
    } finally {
      document.getElementById('ai-thinking-bubble')?.remove();
      this.renderChat();
    }
  }
};
