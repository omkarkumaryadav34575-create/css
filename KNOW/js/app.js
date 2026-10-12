/**
 * KNOW - Main Application Controller
 * File: js/app.js
 * Coordinates dashboard, concepts, graph, skills, active recall, problem lab, and AI assistant.
 */

const App = {
  activeTab: 'dashboard',
  activeConceptId: null,
  currentSolverChallenge: null,

  // Active recall study state
  studyQueue: [],
  studyIndex: 0,
  studyCardFlipped: false,
  initialized: false,

  init() {
    if (this.initialized) return;
    if (typeof StorageService === 'undefined') {
      console.error('KNOW could not start: StorageService is unavailable. Check the script order in index.html.');
      return;
    }
    this.initialized = true;
    // Prime the existing local storage service before any view or module reads it.
    StorageService.loadConcepts();
    StorageService.loadSkills();
    StorageService.loadFlashcards();
    StorageService.loadChallenges();
    StorageService.loadStats();
    StorageService.loadSettings();
    this.applyTheme();
    this.initEventListeners();
    if (typeof initializeDashboard === 'function') initializeDashboard();
    this.updateDueBadge();
    this.switchTab('dashboard');
  },

  applyTheme() {
    const settings = StorageService.loadSettings();
    if (settings.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  },

  switchTab(tabId) {
    const pane = document.getElementById(`tab-${tabId}`);
    if (!pane || !pane.classList.contains('tab-pane')) return;

    this.activeTab = tabId;

    document.querySelectorAll('.nav-link').forEach(link => {
      const isActive = link.dataset.tab === tabId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      const isActive = pane.id === `tab-${tabId}`;
      pane.classList.toggle('active', isActive);
      pane.setAttribute('aria-hidden', String(!isActive));
    });

    this.renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCurrentTab() {
    if (this.activeTab === 'dashboard') this.renderDashboard();
    if (this.activeTab === 'concepts') this.renderConcepts();
    if (this.activeTab === 'graph') this.renderGraph();
    if (this.activeTab === 'skills') this.renderSkills();
    if (this.activeTab === 'recall') this.initStudySession();
    if (this.activeTab === 'challenges') this.renderChallenges();
    if (this.activeTab === 'ai') AIAssistant.renderView();

    this.updateDueBadge();
  },

  // Toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icons = { info: '💡', success: '✅', warning: '⚠️', error: '❌' };
    const icon = document.createElement('span');
    icon.textContent = icons[type] || '💡';
    const text = document.createElement('span');
    text.textContent = String(message);
    toast.append(icon, text);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.querySelector('input:not([type="hidden"]), select, textarea, button')?.focus({ preventScroll: true });
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
  },

  getDueFlashcards() {
    const flashcards = StorageService.loadFlashcards();
    const now = Date.now();
    return flashcards.filter(c => !c.nextReviewDate || new Date(c.nextReviewDate).getTime() <= now);
  },

  updateDueBadge() {
    const count = this.getDueFlashcards().length;
    const badge = document.getElementById('nav-due-count');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  // Dashboard rendering is owned by js/dashboard.js.
  renderDashboard() {
    if (typeof refreshDashboard === 'function') refreshDashboard();
  },

  // =========================================================================
  // 2. CONCEPTS (KNOWLEDGE BASE)
  // =========================================================================
  renderConcepts() {
    const concepts = StorageService.loadConcepts();
    const searchQuery = (document.getElementById('concepts-search')?.value || '').toLowerCase().trim();
    const domainFilter = document.getElementById('concepts-domain-filter')?.value || 'all';
    const decayFilter = document.getElementById('concepts-decay-filter')?.value || 'all';

    // Populate domain select dropdown
    const domains = Array.from(new Set(concepts.map(c => c.domain).filter(Boolean)));
    const domainSelect = document.getElementById('concepts-domain-filter');
    if (domainSelect) {
      const curVal = domainSelect.value;
      domainSelect.innerHTML = `<option value="all">All Domains (${concepts.length})</option>`;
      domains.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        if (d === curVal) opt.selected = true;
        domainSelect.appendChild(opt);
      });
    }

    const filtered = concepts.filter(c => {
      const retention = DecayEngine.calculateRetention(c.lastReviewed, c.stability);
      const status = DecayEngine.getStatus(retention);

      if (domainFilter !== 'all' && c.domain !== domainFilter) return false;
      if (decayFilter !== 'all' && status.code !== decayFilter) return false;

      if (searchQuery) {
        const titleMatch = c.title.toLowerCase().includes(searchQuery);
        const summaryMatch = (c.summary || '').toLowerCase().includes(searchQuery);
        const tagsMatch = (c.tags || []).some(t => t.toLowerCase().includes(searchQuery));
        if (!titleMatch && !summaryMatch && !tagsMatch) return false;
      }
      return true;
    });

    const container = document.getElementById('concepts-grid-container');
    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No concepts found matching your filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(c => {
      const retention = DecayEngine.calculateRetention(c.lastReviewed, c.stability);
      const status = DecayEngine.getStatus(retention);
      const connCount = (c.connections || []).length;

      const card = document.createElement('div');
      card.className = 'concept-card';
      card.innerHTML = `
        <div class="concept-card-top">
          <span class="badge badge-domain">${c.domain}</span>
          <span class="badge ${status.badgeClass}">${retention}% • ${status.label}</span>
        </div>
        <h3 class="concept-title">${c.title}</h3>
        <p class="concept-summary">${c.summary || ''}</p>
        <div class="concept-tags-row">
          ${(c.tags || []).map(t => `<span class="badge badge-tag">#${t}</span>`).join('')}
        </div>
        <div class="concept-footer">
          <div class="connections-count">
            <span>🕸️</span>
            <span>${connCount} connections</span>
          </div>
          <div>Mastery: ${c.mastery || 50}%</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openConceptDetail(c.id);
      });

      container.appendChild(card);
    });
  },

  openConceptDetail(conceptId) {
    const concepts = StorageService.loadConcepts();
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return;

    this.activeConceptId = concept.id;
    const retention = DecayEngine.calculateRetention(concept.lastReviewed, concept.stability);
    const status = DecayEngine.getStatus(retention);

    document.getElementById('detail-concept-domain').textContent = concept.domain;
    document.getElementById('detail-concept-title').textContent = concept.title;
    document.getElementById('detail-concept-retention').innerHTML = `
      <span style="color: ${status.color};">${retention}%</span> 
      <span style="font-size: 0.82rem; color: var(--text-secondary);">(${status.label}) • Reviewed ${DecayEngine.formatRelativeTime(concept.lastReviewed)}</span>
    `;
    document.getElementById('detail-concept-summary').textContent = concept.summary || '';
    document.getElementById('detail-concept-content').textContent = concept.content || 'No detailed notes provided.';

    const connsContainer = document.getElementById('detail-concept-connections');
    connsContainer.innerHTML = '';
    const connIds = concept.connections || [];
    if (connIds.length === 0) {
      connsContainer.innerHTML = `<span class="form-help">No connected concepts yet.</span>`;
    } else {
      connIds.forEach(id => {
        const found = concepts.find(c => c.id === id);
        if (found) {
          const btn = document.createElement('button');
          btn.className = 'btn btn-outline btn-sm';
          btn.innerHTML = `<span>🔗</span> <span>${found.title}</span>`;
          btn.addEventListener('click', () => this.openConceptDetail(found.id));
          connsContainer.appendChild(btn);
        }
      });
    }

    this.openModal('modal-concept-detail');
  },

  openConceptForm(conceptToEdit = null) {
    const concepts = StorageService.loadConcepts();
    const connsBox = document.getElementById('concept-connections-checkboxes');
    connsBox.innerHTML = '';

    const otherConcepts = concepts.filter(c => !conceptToEdit || c.id !== conceptToEdit.id);
    if (otherConcepts.length === 0) {
      connsBox.innerHTML = `<span class="form-help">No other concepts available to connect with.</span>`;
    } else {
      otherConcepts.forEach(c => {
        const isChecked = conceptToEdit && (conceptToEdit.connections || []).includes(c.id);
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '0.45rem';
        label.style.fontSize = '0.82rem';
        label.style.cursor = 'pointer';
        label.innerHTML = `
          <input type="checkbox" value="${c.id}" ${isChecked ? 'checked' : ''}>
          <span>${c.title} <small style="color:var(--text-muted)">(${c.domain})</small></span>
        `;
        connsBox.appendChild(label);
      });
    }

    if (conceptToEdit) {
      document.getElementById('concept-modal-title').textContent = 'Edit Concept';
      document.getElementById('concept-id-input').value = conceptToEdit.id;
      document.getElementById('concept-title-input').value = conceptToEdit.title;
      document.getElementById('concept-domain-input').value = conceptToEdit.domain;
      document.getElementById('concept-tags-input').value = (conceptToEdit.tags || []).join(', ');
      document.getElementById('concept-summary-input').value = conceptToEdit.summary || '';
      document.getElementById('concept-content-input').value = conceptToEdit.content || '';
    } else {
      document.getElementById('concept-modal-title').textContent = 'Create New Concept';
      document.getElementById('concept-form').reset();
      document.getElementById('concept-id-input').value = '';
    }

    this.openModal('modal-concept');
  },

  saveConcept(e) {
    e.preventDefault();
    const concepts = StorageService.loadConcepts();
    const id = document.getElementById('concept-id-input').value;
    const title = document.getElementById('concept-title-input').value.trim();
    const domain = document.getElementById('concept-domain-input').value.trim();
    const tags = document.getElementById('concept-tags-input').value.split(',').map(t => t.trim()).filter(Boolean);
    const summary = document.getElementById('concept-summary-input').value.trim();
    const content = document.getElementById('concept-content-input').value.trim();
    const selectedConns = Array.from(document.querySelectorAll('#concept-connections-checkboxes input:checked'))
      .map(cb => cb.value);

    if (id) {
      const idx = concepts.findIndex(c => c.id === id);
      if (idx !== -1) {
        const oldConns = concepts[idx].connections || [];
        concepts[idx] = { ...concepts[idx], title, domain, tags, summary, content, connections: selectedConns };

        // Synchronize reciprocal connections with newly linked targets
        selectedConns.forEach(targetId => {
          const target = concepts.find(c => c.id === targetId);
          if (target) {
            target.connections = target.connections || [];
            if (!target.connections.includes(id)) {
              target.connections.push(id);
            }
          }
        });

        // Remove reciprocal links from disconnected targets
        oldConns.filter(targetId => !selectedConns.includes(targetId)).forEach(targetId => {
          const target = concepts.find(c => c.id === targetId);
          if (target) {
            target.connections = (target.connections || []).filter(cId => cId !== id);
          }
        });

        this.showToast(`Updated "${title}"`, 'success');
      }
    } else {
      const newConcept = {
        id: 'c_' + Date.now(),
        title,
        domain,
        summary,
        content,
        tags,
        connections: selectedConns,
        mastery: 50,
        stability: 2.5,
        lastReviewed: new Date().toISOString(),
        created: new Date().toISOString()
      };
      concepts.push(newConcept);

      selectedConns.forEach(targetId => {
        const target = concepts.find(c => c.id === targetId);
        if (target) {
          target.connections = target.connections || [];
          if (!target.connections.includes(newConcept.id)) {
            target.connections.push(newConcept.id);
          }
        }
      });

      const stats = StorageService.loadStats();
      stats.totalXp = (stats.totalXp || 0) + 50;
      StorageService.saveStats(stats);
      this.showToast(`Created concept "${title}" (+50 XP)`, 'success');
    }

    StorageService.saveConcepts(concepts);
    if (GraphModule && GraphModule.instance) {
      GraphModule.instance.setData(concepts);
    }
    this.closeModal('modal-concept');
    this.renderCurrentTab();
  },

  deleteConcept() {
    if (!this.activeConceptId) return;
    let concepts = StorageService.loadConcepts();
    const concept = concepts.find(c => c.id === this.activeConceptId);
    if (!confirm(`Are you sure you want to delete "${concept?.title}"?`)) return;

    concepts = concepts.filter(c => c.id !== this.activeConceptId);
    concepts.forEach(c => {
      c.connections = (c.connections || []).filter(id => id !== this.activeConceptId);
    });

    let flashcards = StorageService.loadFlashcards();
    flashcards = flashcards.filter(fc => fc.conceptId !== this.activeConceptId);

    StorageService.saveConcepts(concepts);
    StorageService.saveFlashcards(flashcards);

    this.closeModal('modal-concept-detail');
    this.showToast('Concept deleted successfully', 'info');
    this.renderCurrentTab();
  },

  boostConcept(conceptId) {
    const concepts = StorageService.loadConcepts();
    const idx = concepts.findIndex(c => c.id === conceptId);
    if (idx !== -1) {
      concepts[idx] = DecayEngine.boostConceptMemory(concepts[idx]);
      StorageService.saveConcepts(concepts);

      const stats = StorageService.loadStats();
      stats.totalXp = (stats.totalXp || 0) + 25;
      StorageService.saveStats(stats);

      this.showToast(`Memory reinforced for "${concepts[idx].title}" (+25 XP)`, 'success');
      this.renderCurrentTab();
    }
  },

  // =========================================================================
  // 3. KNOWLEDGE GRAPH
  // =========================================================================
  renderGraph() {
    const canvas = document.getElementById('knowledge-graph-canvas');
    if (canvas) {
      GraphModule.render();
    }
  },

  // =========================================================================
  // 4. SKILL TREES
  // =========================================================================
  renderSkills() {
    const skills = StorageService.loadSkills();
    const concepts = StorageService.loadConcepts();
    const tiers = ['Novice', 'Competent', 'Proficient', 'Advanced', 'Master'];
    const container = document.getElementById('skills-grid-container');

    container.innerHTML = '';
    if (skills.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);"><p>No skill tracks created yet.</p></div>`;
      return;
    }

    skills.forEach(skill => {
      const tierName = tiers[Math.min(tiers.length - 1, Math.max(0, (skill.level || 1) - 1))];
      const xpPercent = Math.min(100, Math.round(((skill.xp || 0) / (skill.maxXp || 1000)) * 100));

      const conceptBadges = (skill.requiredConcepts || []).map(cid => {
        const found = concepts.find(c => c.id === cid);
        if (!found) return '';
        const retention = DecayEngine.calculateRetention(found.lastReviewed, found.stability);
        const status = DecayEngine.getStatus(retention);
        return `
          <div class="skill-concept-item" style="cursor: pointer;" data-concept-id="${found.id}" title="Click to view concept details">
            <span>${found.title}</span>
            <span class="badge ${status.badgeClass}">${retention}%</span>
          </div>
        `;
      }).join('');

      const card = document.createElement('div');
      card.className = 'skill-card';
      card.innerHTML = `
        <div class="skill-header">
          <div class="skill-title-block">
            <span class="badge badge-domain">${skill.category}</span>
            <h3 class="skill-name">${skill.name}</h3>
          </div>
          <span class="skill-badge-level">Lvl ${skill.level} ${tierName}</span>
        </div>
        <p class="card-desc-text">${skill.description}</p>
        
        <div class="skill-xp-row">
          <div class="skill-xp-labels">
            <span>Progress: ${xpPercent}%</span>
            <span>${skill.xp || 0} / ${skill.maxXp || 1000} XP</span>
          </div>
          <div class="progress-bar-bg" style="height: 8px;">
            <div class="progress-bar-fill" style="width: ${xpPercent}%; background: linear-gradient(90deg, #6366f1, #a855f7);"></div>
          </div>
        </div>

        <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.2rem;">
          Prerequisite Concepts (${skill.requiredConcepts?.length || 0}):
        </div>
        <div class="skill-concepts-list">
          ${conceptBadges || '<span class="form-help">None assigned</span>'}
        </div>
      `;

      card.querySelectorAll('.skill-concept-item').forEach(item => {
        item.addEventListener('click', () => {
          const cid = item.dataset.conceptId;
          if (cid) this.openConceptDetail(cid);
        });
      });

      container.appendChild(card);
    });
  },

  openSkillForm() {
    const concepts = StorageService.loadConcepts();
    const box = document.getElementById('skill-concepts-select-box');
    box.innerHTML = '';

    concepts.forEach(c => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '0.45rem';
      label.style.fontSize = '0.82rem';
      label.style.cursor = 'pointer';
      label.innerHTML = `
        <input type="checkbox" value="${c.id}">
        <span>${c.title} <small style="color:var(--text-muted)">(${c.domain})</small></span>
      `;
      box.appendChild(label);
    });

    document.getElementById('skill-form').reset();
    this.openModal('modal-skill');
  },

  saveSkill(e) {
    e.preventDefault();
    const skills = StorageService.loadSkills();
    const name = document.getElementById('skill-name-input').value.trim();
    const category = document.getElementById('skill-category-input').value.trim();
    const description = document.getElementById('skill-desc-input').value.trim();
    const requiredConcepts = Array.from(document.querySelectorAll('#skill-concepts-select-box input:checked'))
      .map(cb => cb.value);

    const newSkill = {
      id: 's_' + Date.now(),
      name,
      category,
      level: 1,
      xp: 0,
      maxXp: 500,
      description,
      requiredConcepts,
      challengesCompleted: []
    };

    skills.push(newSkill);
    StorageService.saveSkills(skills);
    this.closeModal('modal-skill');
    this.renderCurrentTab();
    this.showToast(`Created skill track "${name}"`, 'success');
  },

  awardSkillXp(skillId, xpPoints, challengeId) {
    const skills = StorageService.loadSkills();
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    // Track which challenges have been completed under this skill
    if (challengeId) {
      if (!Array.isArray(skill.challengesCompleted)) skill.challengesCompleted = [];
      if (!skill.challengesCompleted.includes(challengeId)) {
        skill.challengesCompleted.push(challengeId);
      }
    }

    skill.xp = (skill.xp || 0) + xpPoints;
    if (skill.xp >= skill.maxXp) {
      skill.level = (skill.level || 1) + 1;
      skill.xp = skill.xp - skill.maxXp;
      skill.maxXp = Math.round(skill.maxXp * 1.5);
      this.showToast(`Level Up! ${skill.name} reached Level ${skill.level}! 🎉`, 'success');
    }
    StorageService.saveSkills(skills);
  },

  // =========================================================================
  // 5. ACTIVE RECALL (SPACED REPETITION FLASHCARDS)
  // =========================================================================
  initStudySession(forceAll = false) {
    const flashcards = StorageService.loadFlashcards();
    if (forceAll) {
      this.studyQueue = [...flashcards];
    } else {
      this.studyQueue = this.getDueFlashcards();
    }

    this.studyIndex = 0;
    this.studyCardFlipped = false;

    const cardEl = document.getElementById('flashcard-interactive-card');
    const sm2Row = document.getElementById('sm2-buttons-row');
    const progressRow = document.getElementById('recall-progress-bar-row');
    const emptyDeck = document.getElementById('empty-deck-display');

    if (this.studyQueue.length === 0) {
      if (cardEl) cardEl.style.display = 'none';
      if (sm2Row) sm2Row.style.display = 'none';
      if (progressRow) progressRow.style.display = 'none';
      if (emptyDeck) emptyDeck.style.display = 'flex';
    } else {
      if (cardEl) cardEl.style.display = 'block';
      if (sm2Row) sm2Row.style.display = 'grid';
      if (progressRow) progressRow.style.display = 'flex';
      if (emptyDeck) emptyDeck.style.display = 'none';
      this.displayCurrentStudyCard();
    }

    this.updateDueBadge();
  },

  displayCurrentStudyCard() {
    const card = this.studyQueue[this.studyIndex];
    const cardEl = document.getElementById('flashcard-interactive-card');
    const sm2Row = document.getElementById('sm2-buttons-row');
    const progressRow = document.getElementById('recall-progress-bar-row');
    const emptyDeck = document.getElementById('empty-deck-display');

    if (!card) {
      if (cardEl) cardEl.style.display = 'none';
      if (sm2Row) sm2Row.style.display = 'none';
      if (progressRow) progressRow.style.display = 'none';
      if (emptyDeck) emptyDeck.style.display = 'flex';
      return;
    }

    this.studyCardFlipped = false;
    cardEl.classList.remove('flipped');

    document.getElementById('recall-counter-text').textContent = `Card ${this.studyIndex + 1} of ${this.studyQueue.length}`;
    document.getElementById('recall-deck-status').textContent = card.repetitions > 0 ? `Repetition ${card.repetitions}` : 'New Card';

    const concepts = StorageService.loadConcepts();
    const concept = concepts.find(c => c.id === card.conceptId);
    document.getElementById('fc-concept-title').textContent = concept ? concept.title : 'General Knowledge';
    document.getElementById('fc-front-text').textContent = card.front;
    document.getElementById('fc-back-text').textContent = card.back;
  },

  flipCard() {
    this.studyCardFlipped = !this.studyCardFlipped;
    const cardEl = document.getElementById('flashcard-interactive-card');
    if (cardEl) cardEl.classList.toggle('flipped', this.studyCardFlipped);
  },

  rateCard(rating) {
    const card = this.studyQueue[this.studyIndex];
    if (!card) return;

    const updatedCard = DecayEngine.processCardReview(card, rating);
    const flashcards = StorageService.loadFlashcards();
    const idx = flashcards.findIndex(fc => fc.id === card.id);
    if (idx !== -1) {
      flashcards[idx] = updatedCard;
      StorageService.saveFlashcards(flashcards);
    }

    if (card.conceptId) {
      const concepts = StorageService.loadConcepts();
      const cIdx = concepts.findIndex(c => c.id === card.conceptId);
      if (cIdx !== -1) {
        const boost = rating >= 3 ? 1.6 : 1.1;
        concepts[cIdx] = DecayEngine.boostConceptMemory(concepts[cIdx], boost);
        StorageService.saveConcepts(concepts);
      }
    }

    const stats = StorageService.loadStats();
    stats.cardsReviewedToday = (stats.cardsReviewedToday || 0) + 1;
    stats.totalXp = (stats.totalXp || 0) + (rating * 10);
    StorageService.saveStats(stats);

    this.updateDueBadge();
    this.studyIndex++;
    this.displayCurrentStudyCard();
  },

  openFlashcardForm() {
    const concepts = StorageService.loadConcepts();
    const select = document.getElementById('flashcard-concept-select');
    select.innerHTML = '';

    concepts.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.title} (${c.domain})`;
      select.appendChild(opt);
    });

    document.getElementById('flashcard-form').reset();
    this.openModal('modal-flashcard');
  },

  saveFlashcard(e) {
    e.preventDefault();
    const conceptId = document.getElementById('flashcard-concept-select').value;
    const front = document.getElementById('flashcard-front-input').value.trim();
    const back = document.getElementById('flashcard-back-input').value.trim();

    const flashcards = StorageService.loadFlashcards();
    const newCard = {
      id: 'fc_' + Date.now(),
      conceptId,
      front,
      back,
      box: 1,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      lastReviewed: null
    };

    flashcards.push(newCard);
    StorageService.saveFlashcards(flashcards);
    this.closeModal('modal-flashcard');
    this.showToast('Created active recall flashcard!', 'success');
    this.updateDueBadge();
    this.initStudySession();
  },

  // =========================================================================
  // 6. PROBLEM LAB (REAL-WORLD CHALLENGES)
  // =========================================================================
  renderChallenges() {
    const challenges = StorageService.loadChallenges();
    const skills = StorageService.loadSkills();
    const container = document.getElementById('challenges-grid-container');

    container.innerHTML = '';
    if (challenges.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);"><p>No challenges created yet.</p></div>`;
      return;
    }

    challenges.forEach(ch => {
      const isSolved = ch.status === 'completed';
      const skill = skills.find(s => s.id === ch.skillId);

      const card = document.createElement('div');
      card.className = 'challenge-card';
      card.innerHTML = `
        <div class="challenge-top">
          <span class="badge ${isSolved ? 'badge-fresh' : 'badge-fading'}">${isSolved ? 'Solved ✓' : ch.difficulty}</span>
          <span class="badge badge-domain">${skill ? skill.name : 'Engineering'}</span>
        </div>
        <h3 class="challenge-title">${ch.title}</h3>
        <p class="challenge-scenario">${ch.scenario}</p>
        
        <div class="challenge-reqs">
          <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Objectives:</div>
          ${(ch.requirements || []).slice(0, 3).map(r => `
            <div class="challenge-req-item">
              <span>🎯</span> <span>${r}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.76rem; color: var(--text-muted);">
            ${isSolved ? `Solved on ${new Date(ch.completedDate).toLocaleDateString()}` : 'Reward: +100 XP'}
          </span>
          <button class="btn ${isSolved ? 'btn-outline' : 'btn-primary'} btn-sm solve-challenge-card-btn">
            ${isSolved ? 'Review Solution' : 'Solve Challenge'}
          </button>
        </div>
      `;

      card.querySelector('.solve-challenge-card-btn').addEventListener('click', () => {
        this.openChallengeSolver(ch.id);
      });

      container.appendChild(card);
    });
  },

  openChallengeSolver(challengeId) {
    const challenges = StorageService.loadChallenges();
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;

    this.currentSolverChallenge = ch;
    document.getElementById('solver-title').textContent = ch.title;
    document.getElementById('solver-difficulty-badge').textContent = ch.difficulty;
    document.getElementById('solver-scenario').textContent = ch.scenario;
    document.getElementById('solver-requirements').innerHTML = (ch.requirements || []).map(r => `<li>${r}</li>`).join('');

    const hintsBox = document.getElementById('solver-hints-box');
    hintsBox.style.display = 'none';
    hintsBox.textContent = (ch.hints || []).join('\n\n') || 'No specific hints for this challenge.';
    document.getElementById('solver-toggle-hints-btn').textContent = 'Show Hints';

    document.getElementById('solver-user-solution').value = ch.userSolution || '';

    const guideSection = document.getElementById('solver-model-guide-section');
    guideSection.style.display = 'none';
    document.getElementById('solver-model-guide').textContent = ch.solutionGuide || 'No model solution provided.';
    document.getElementById('solver-reveal-guide-btn').textContent = 'Compare with Model Solution';
    document.getElementById('solver-mark-complete-btn').textContent = ch.status === 'completed' ? 'Update Notes' : 'Mark as Solved (+100 XP)';

    this.openModal('modal-challenge-solver');
  },

  toggleSolverHints() {
    const hintsBox = document.getElementById('solver-hints-box');
    const isVisible = hintsBox.style.display !== 'none';
    hintsBox.style.display = isVisible ? 'none' : 'block';
    document.getElementById('solver-toggle-hints-btn').textContent = isVisible ? 'Show Hints' : 'Hide Hints';
  },

  toggleSolverModelGuide() {
    const guideSection = document.getElementById('solver-model-guide-section');
    const isVisible = guideSection.style.display !== 'none';
    guideSection.style.display = isVisible ? 'none' : 'block';
    document.getElementById('solver-reveal-guide-btn').textContent = isVisible ? 'Compare with Model Solution' : 'Hide Model Solution';
  },

  markChallengeComplete() {
    if (!this.currentSolverChallenge) return;
    const userText = document.getElementById('solver-user-solution').value.trim();
    this.currentSolverChallenge.userSolution = userText;

    if (this.currentSolverChallenge.status !== 'completed') {
      this.currentSolverChallenge.status = 'completed';
      this.currentSolverChallenge.completedDate = new Date().toISOString();

      const stats = StorageService.loadStats();
      stats.totalXp = (stats.totalXp || 0) + 100;
      StorageService.saveStats(stats);

      if (this.currentSolverChallenge.skillId) {
        this.awardSkillXp(this.currentSolverChallenge.skillId, 100, this.currentSolverChallenge.id);
      }
      this.showToast('Challenge completed! (+100 XP)', 'success');
    } else {
      this.showToast('Solution notes updated!', 'info');
    }

    const challenges = StorageService.loadChallenges();
    const idx = challenges.findIndex(c => c.id === this.currentSolverChallenge.id);
    if (idx !== -1) {
      challenges[idx] = this.currentSolverChallenge;
      StorageService.saveChallenges(challenges);
    }

    this.closeModal('modal-challenge-solver');
    this.renderCurrentTab();
  },

  openChallengeCreateForm() {
    const skills = StorageService.loadSkills();
    const select = document.getElementById('ch-create-skill');
    select.innerHTML = '';

    skills.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.category})`;
      select.appendChild(opt);
    });

    document.getElementById('challenge-create-form').reset();
    this.openModal('modal-challenge-create');
  },

  saveChallenge(e) {
    e.preventDefault();
    const title = document.getElementById('ch-create-title').value.trim();
    const difficulty = document.getElementById('ch-create-difficulty').value;
    const skillId = document.getElementById('ch-create-skill').value;
    const scenario = document.getElementById('ch-create-scenario').value.trim();
    const requirements = document.getElementById('ch-create-requirements').value.split('\n').map(r => r.trim()).filter(Boolean);
    const solutionGuide = document.getElementById('ch-create-solution').value.trim();

    const challenges = StorageService.loadChallenges();
    const newChallenge = {
      id: 'ch_' + Date.now(),
      title,
      difficulty,
      skillId,
      relatedConcepts: [],
      scenario,
      requirements,
      hints: ['Break down the requirements into modular components.'],
      solutionGuide,
      userSolution: '',
      status: 'unsolved',
      completedDate: null
    };

    challenges.push(newChallenge);
    StorageService.saveChallenges(challenges);
    this.closeModal('modal-challenge-create');
    this.renderCurrentTab();
    this.showToast(`Created challenge "${title}"`, 'success');
  },

  // =========================================================================
  // 7. EVENT LISTENERS
  // =========================================================================
  initEventListeners() {
    // Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    document.getElementById('brand-home-btn')?.addEventListener('click', () => this.switchTab('dashboard'));
    document.getElementById('quick-add-btn')?.addEventListener('click', () => this.openConceptForm());

    // Graph section "Add Concept" shortcut button
    document.getElementById('graph-add-concept-btn')?.addEventListener('click', () => this.openConceptForm());

    // Global search in topbar: routes to concepts tab with search pre-filled
    document.getElementById('global-search-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = e.target.value.trim();
        if (!q) return;
        this.switchTab('concepts');
        const conceptsSearch = document.getElementById('concepts-search');
        if (conceptsSearch) {
          conceptsSearch.value = q;
          this.renderConcepts();
        }
      }
    });
    // Theme Toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      const settings = StorageService.loadSettings();
      settings.theme = isLight ? 'light' : 'dark';
      StorageService.saveSettings(settings);
      this.showToast(`Switched to ${isLight ? 'Light' : 'Dark'} mode`, 'info');
    });

    // Settings Modal
    document.getElementById('settings-modal-btn')?.addEventListener('click', () => {
      const settings = StorageService.loadSettings();
      document.getElementById('settings-username-input').value = settings.userName || '';
      document.getElementById('settings-api-key-input').value = settings.geminiApiKey || '';
      document.getElementById('settings-model-select').value = settings.aiModel || 'gemini-1.5-flash';
      this.openModal('modal-settings');
    });

    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = StorageService.loadSettings();
      settings.userName = document.getElementById('settings-username-input').value.trim();
      settings.geminiApiKey = document.getElementById('settings-api-key-input').value.trim();
      settings.aiModel = document.getElementById('settings-model-select').value;
      StorageService.saveSettings(settings);
      this.closeModal('modal-settings');
      this.showToast('Settings saved successfully!', 'success');
      // Immediately reflect the new name in the dashboard heading
      if (settings.userName) {
        const heading = document.getElementById('welcome-heading');
        if (heading) heading.textContent = `Welcome back, ${settings.userName} 👋`;
      }
      this.renderCurrentTab();
    });

    // Backup Export & Import
    document.getElementById('export-json-btn')?.addEventListener('click', () => {
      const json = StorageService.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `know-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Backup downloaded successfully!', 'success');
    });

    document.getElementById('import-json-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = StorageService.importBackup(event.target.result);
        if (ok) {
          this.showToast('Backup restored successfully!', 'success');
          this.closeModal('modal-settings');
          this.renderCurrentTab();
          this.updateDueBadge();
        } else {
          this.showToast('Invalid backup format.', 'error');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    document.getElementById('reset-factory-data-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data back to the default library?')) {
        StorageService.resetAll();
      }
    });

    // Dashboard actions
    document.getElementById('dash-practice-now-btn')?.addEventListener('click', () => this.switchTab('recall'));
    document.getElementById('dash-view-all-challenges-btn')?.addEventListener('click', () => this.switchTab('challenges'));
    document.getElementById('dash-ask-ai-btn')?.addEventListener('click', () => this.switchTab('ai'));

    // Concepts view
    document.getElementById('add-concept-btn')?.addEventListener('click', () => this.openConceptForm());
    document.getElementById('concepts-search')?.addEventListener('input', () => this.renderConcepts());
    document.getElementById('concepts-domain-filter')?.addEventListener('change', () => this.renderConcepts());
    document.getElementById('concepts-decay-filter')?.addEventListener('change', () => this.renderConcepts());
    document.getElementById('concept-form')?.addEventListener('submit', (e) => this.saveConcept(e));
    document.getElementById('detail-delete-concept-btn')?.addEventListener('click', () => this.deleteConcept());
    document.getElementById('detail-boost-memory-btn')?.addEventListener('click', () => {
      if (this.activeConceptId) {
        this.boostConcept(this.activeConceptId);
        this.openConceptDetail(this.activeConceptId);
      }
    });
    document.getElementById('detail-edit-concept-btn')?.addEventListener('click', () => {
      this.closeModal('modal-concept-detail');
      const concepts = StorageService.loadConcepts();
      const c = concepts.find(item => item.id === this.activeConceptId);
      if (c) this.openConceptForm(c);
    });
    document.getElementById('detail-ai-explain-btn')?.addEventListener('click', () => {
      const cid = this.activeConceptId;
      const concepts = StorageService.loadConcepts();
      const c = concepts.find(item => item.id === cid);
      this.closeModal('modal-concept-detail');
      this.switchTab('ai');
      document.getElementById('ai-context-concept-select').value = cid;
      if (c) {
        AIAssistant.handleUserPrompt(`Explain "${c.title}" using the Feynman technique`);
      }
    });

    // Graph view
    document.getElementById('graph-reset-btn')?.addEventListener('click', () => GraphModule.resetView());
    document.getElementById('graph-zoom-in')?.addEventListener('click', () => GraphModule.zoom(1.25));
    document.getElementById('graph-zoom-out')?.addEventListener('click', () => GraphModule.zoom(0.8));
    document.getElementById('graph-color-mode-select')?.addEventListener('change', (e) => GraphModule.setColorMode(e.target.value));
    document.getElementById('graph-search-input')?.addEventListener('input', (e) => GraphModule.setHighlight(e.target.value));

    // Skills
    document.getElementById('add-skill-btn')?.addEventListener('click', () => this.openSkillForm());
    document.getElementById('skill-form')?.addEventListener('submit', (e) => this.saveSkill(e));

    // Active Recall
    document.getElementById('add-flashcard-btn')?.addEventListener('click', () => this.openFlashcardForm());
    document.getElementById('flashcard-form')?.addEventListener('submit', (e) => this.saveFlashcard(e));
    document.getElementById('study-all-cards-btn')?.addEventListener('click', () => this.initStudySession(true));
    document.getElementById('restart-deck-btn')?.addEventListener('click', () => this.initStudySession(true));
    document.getElementById('flashcard-interactive-card')?.addEventListener('click', () => this.flipCard());

    document.querySelectorAll('.btn-rate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rating = parseInt(btn.dataset.rating, 10);
        this.rateCard(rating);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (this.activeTab === 'recall' && e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.flipCard();
      }
    });

    // Challenges
    document.getElementById('add-challenge-btn')?.addEventListener('click', () => this.openChallengeCreateForm());
    document.getElementById('challenge-create-form')?.addEventListener('submit', (e) => this.saveChallenge(e));
    document.getElementById('solver-toggle-hints-btn')?.addEventListener('click', () => this.toggleSolverHints());
    document.getElementById('solver-reveal-guide-btn')?.addEventListener('click', () => this.toggleSolverModelGuide());
    document.getElementById('solver-mark-complete-btn')?.addEventListener('click', () => this.markChallengeComplete());

    // AI Assistant
    document.getElementById('ai-send-btn')?.addEventListener('click', () => AIAssistant.handleUserPrompt());
    document.getElementById('ai-chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') AIAssistant.handleUserPrompt();
    });
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => AIAssistant.handleUserPrompt(btn.dataset.prompt));
    });
    document.getElementById('ai-clear-chat-btn')?.addEventListener('click', () => {
      AIAssistant.chatHistory = [{
        role: 'assistant',
        content: 'Chat cleared. How can I help you learn today?'
      }];
      AIAssistant.renderChat();
    });
    document.getElementById('ai-open-settings-btn')?.addEventListener('click', () => this.openModal('modal-settings'));

    // Modal Close
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal(btn.dataset.close));
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal(overlay.id);
      });
    });

    // Escape dismisses the topmost open dialog.
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const openOverlays = [...document.querySelectorAll('.modal-overlay.active')];
      if (openOverlays.length) this.closeModal(openOverlays[openOverlays.length - 1].id);
    });
  }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
