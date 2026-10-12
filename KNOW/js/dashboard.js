/**
 * KNOW · Dynamic dashboard views
 * Reads the shared StorageService and renders existing dashboard containers.
 */

const Dashboard = {
  initialized: false,
  previewLimit: 4,

  initializeDashboard() {
    if (!this.initialized) {
      this.initialized = true;
      window.addEventListener('storage', event => {
        if (!event.key || Object.values(STORAGE_KEYS).includes(event.key)) this.refreshDashboard();
      });
      window.addEventListener('know:data-changed', () => {
        if (document.getElementById('tab-dashboard')?.classList.contains('active')) this.refreshDashboard();
      });
      document.getElementById('dash-review-all-btn')?.addEventListener('click', () => window.App?.switchTab('recall'));
    }
    this.refreshDashboard();
  },

  getData() {
    const concepts = StorageService.loadConcepts();
    const skills = StorageService.loadSkills();
    const flashcards = StorageService.loadFlashcards();
    const challenges = StorageService.loadChallenges();
    const stats = StorageService.loadStats();
    const activity = StorageService.loadActivity();
    const reviews = StorageService.loadReviews();
    const quizResults = StorageService.loadQuizResults();
    const problemProgress = StorageService.loadProblemProgress();
    const strengthMap = StorageService.loadKnowledgeStrength();
    return { concepts, skills, flashcards, challenges, stats, activity, reviews, quizResults, problemProgress, strengthMap };
  },

  getRetention(concept) {
    if (window.DecayEngine?.calculateRetention) {
      return DecayEngine.calculateRetention(concept.lastReviewed, concept.stability);
    }
    if (!concept.lastReviewed) return 0;
    const elapsed = Math.max(0, (Date.now() - new Date(concept.lastReviewed).getTime()) / 86400000);
    return Math.round(100 * Math.exp(-elapsed / Math.max(.5, Number(concept.stability) || 2)));
  },

  getDueCards(cards) {
    const now = Date.now();
    return cards.filter(card => !card.nextReviewDate || !Number.isFinite(new Date(card.nextReviewDate).getTime()) || new Date(card.nextReviewDate).getTime() <= now)
      .sort((a, b) => new Date(a.nextReviewDate || 0) - new Date(b.nextReviewDate || 0));
  },

  setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  },

  clearList(id, emptyMessage) {
    const list = document.getElementById(id);
    if (!list) return null;
    list.replaceChildren();
    if (emptyMessage) {
      const empty = document.createElement('p');
      empty.className = 'card-desc-text';
      empty.textContent = emptyMessage;
      list.appendChild(empty);
    }
    return list;
  },

  makeItem(title, detail, badgeText, badgeClass = 'badge-domain') {
    const item = document.createElement('div');
    item.className = 'decay-item';
    const left = document.createElement('div');
    left.className = 'decay-item-left';
    const heading = document.createElement('span');
    heading.className = 'decay-item-title';
    heading.textContent = title || 'Untitled';
    left.appendChild(heading);
    const meta = document.createElement('div');
    meta.className = 'decay-item-meta';
    if (badgeText) {
      const badge = document.createElement('span');
      badge.className = `badge ${badgeClass}`;
      badge.textContent = badgeText;
      meta.appendChild(badge);
    }
    if (detail) {
      const desc = document.createElement('span');
      desc.textContent = detail;
      meta.appendChild(desc);
    }
    left.appendChild(meta);
    item.appendChild(left);
    return { item, left, heading, meta };
  },

  renderStats(data = this.getData()) {
    const { concepts, skills, flashcards, stats, strengthMap } = data;
    const inProgressSkills = skills.filter(skill => this.getSkillProgress(skill, concepts) < 100);
    const dueCount = this.getDueCards(flashcards).length;
    const strengths = concepts.map(concept => Number(strengthMap?.[concept.id] ?? concept.strength ?? concept.mastery ?? this.getRetention(concept)))
      .filter(value => Number.isFinite(value));
    const averageStrength = strengths.length ? Math.round(strengths.reduce((sum, value) => sum + value, 0) / strengths.length) : 0;
    this.setText('stat-total-concepts', concepts.length);
    this.setText('stat-avg-retention', `${averageStrength}%`);
    this.setText('stat-cards-due', dueCount);
    this.setText('stat-active-skills', inProgressSkills.length);
    this.setText('stat-total-xp', `${(Number(stats.totalXp) || 0).toLocaleString()} XP earned`);
    const streak = Math.max(0, Number(stats.streakDays) || 0);
    this.setText('stat-streak-days', `${streak} ${streak === 1 ? 'day' : 'days'}`);
    const alert = document.getElementById('decay-alert-count');
    if (alert) {
      const atRisk = concepts.filter(concept => this.getRetention(concept) < 80).length;
      alert.textContent = `${atRisk} At Risk`;
      alert.className = atRisk ? 'badge badge-decayed' : 'badge badge-fresh';
    }
  },

  renderRecentActivity(data = this.getData()) {
    const list = this.clearList('dashboard-activity-list', 'No learning activity yet. Your progress will appear here.');
    if (!list) return;
    const events = [...(data.activity || [])];
    const conceptNames = new Map(data.concepts.map(concept => [concept.id, concept.name || concept.title]));
    data.concepts.forEach(concept => {
      if (concept.createdAt || concept.created) events.push({
        id: `concept-${concept.id}`, type: 'concept-created', description: `Added ${concept.name || concept.title}`,
        createdAt: concept.createdAt || concept.created
      });
      if (concept.lastReviewed) events.push({
        id: `review-${concept.id}`, type: 'review', description: `Reviewed ${conceptNames.get(concept.id)}`,
        createdAt: concept.lastReviewed
      });
    });
    data.challenges.forEach(problem => {
      if (problem.completedDate) events.push({
        id: `problem-${problem.id}`, type: 'problem-completed', description: `Completed ${problem.title}`,
        createdAt: problem.completedDate
      });
    });
    data.quizResults.forEach(result => events.push({
      id: result.id, type: 'quiz', description: `Completed ${result.topic || 'a quiz'} · ${Number(result.score) || 0}/${Number(result.total) || 0}`,
      createdAt: result.completedAt || result.createdAt
    }));
    const unique = new Map();
    events.filter(event => event.createdAt && Number.isFinite(new Date(event.createdAt).getTime()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(event => { if (!unique.has(event.id || `${event.description}:${event.createdAt}`)) unique.set(event.id || `${event.description}:${event.createdAt}`, event); });
    const recent = [...unique.values()].slice(0, this.previewLimit);
    if (!recent.length) return;
    list.replaceChildren();
    recent.forEach(event => {
      const { item, meta } = this.makeItem(event.description || event.type || 'Learning activity', this.relativeDate(event.createdAt), this.activityLabel(event.type), 'badge-domain');
      item.classList.add('activity-item');
      list.appendChild(item);
    });
  },

  getSkillProgress(skill, concepts) {
    const required = skill.requiredConcepts || skill.conceptIds || [];
    const linked = required.map(id => concepts.find(concept => concept.id === id)).filter(Boolean);
    if (linked.length) {
      return Math.max(0, Math.min(100, Math.round(linked.reduce((sum, concept) => sum + Number(concept.strength ?? concept.mastery ?? this.getRetention(concept)), 0) / linked.length)));
    }
    const xp = Math.max(0, Number(skill.xp) || 0);
    const maxXp = Math.max(1, Number(skill.maxXp) || 100);
    return Math.max(0, Math.min(100, Math.round(xp / maxXp * 100)));
  },

  renderSkillPreview(data = this.getData()) {
    const list = this.clearList('dashboard-skills-list', 'No skill tracks yet. Add a skill track to see progress.');
    if (!list) return;
    const items = data.skills.map(skill => ({ skill, progress: this.getSkillProgress(skill, data.concepts) }))
      .sort((a, b) => a.progress - b.progress).slice(0, this.previewLimit);
    if (!items.length) return;
    list.replaceChildren();
    items.forEach(({ skill, progress }) => {
      const { item, left, heading, meta } = this.makeItem(skill.name, `${skill.category || 'Skill'} · ${progress}%`, `Level ${Number(skill.level) || 1}`, 'badge-domain');
      const bar = document.createElement('div');
      bar.className = 'progress-bar-bg';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuenow', String(progress));
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      const fill = document.createElement('div');
      fill.className = 'progress-bar-fill';
      fill.style.width = `${progress}%`;
      bar.appendChild(fill);
      left.appendChild(bar);
      list.appendChild(item);
    });
  },

  renderReviewPreview(data = this.getData()) {
    const list = this.clearList('dashboard-review-list', 'Nothing is due right now.');
    if (!list) return;
    const due = this.getDueCards(data.flashcards).slice(0, this.previewLimit);
    if (!due.length) return;
    list.replaceChildren();
    due.forEach(card => {
      const concept = data.concepts.find(item => item.id === card.conceptId);
      const { item } = this.makeItem(concept?.name || concept?.title || card.front || 'Review card', 'Ready for active recall', 'Due now', 'badge-fading');
      const button = document.createElement('button');
      button.className = 'btn btn-outline btn-sm';
      button.type = 'button';
      button.textContent = 'Study';
      button.addEventListener('click', () => window.App?.switchTab('recall'));
      item.appendChild(button);
      list.appendChild(item);
    });
  },

  renderDecayPreview(data = this.getData()) {
    const list = this.clearList('dashboard-decay-list', 'No concepts yet. Add a concept to start tracking knowledge strength.');
    if (!list) return;
    const ranked = data.concepts.map(concept => ({ concept, retention: this.getRetention(concept) }))
      .sort((a, b) => a.retention - b.retention).slice(0, this.previewLimit);
    if (!ranked.length) return;
    list.replaceChildren();
    ranked.forEach(({ concept, retention }) => {
      const status = window.DecayEngine?.getStatus ? DecayEngine.getStatus(retention) : { code: retention >= 80 ? 'fresh' : retention >= 50 ? 'fading' : 'decayed' };
      const { item, heading, meta } = this.makeItem(concept.name || concept.title, `${concept.category || concept.domain || 'Concept'} · ${retention}% retained`, status.code === 'fresh' ? 'Strong' : status.code === 'fading' ? 'Fading' : 'At risk', status.code === 'fresh' ? 'badge-fresh' : status.code === 'fading' ? 'badge-fading' : 'badge-decayed');
      heading.tabIndex = 0;
      heading.setAttribute('role', 'button');
      const open = () => window.App?.openConceptDetail(concept.id);
      heading.addEventListener('click', open);
      heading.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
      const wrap = document.createElement('div');
      wrap.className = 'decay-bar-wrap';
      const value = document.createElement('div');
      value.className = 'decay-bar-label';
      value.textContent = `${retention}%`;
      const track = document.createElement('div');
      track.className = 'progress-bar-bg';
      const fill = document.createElement('div');
      fill.className = `progress-bar-fill ${status.code}`;
      fill.style.width = `${retention}%`;
      track.appendChild(fill);
      wrap.append(value, track);
      item.appendChild(wrap);
      list.appendChild(item);
    });
  },

  renderProblemPreview(data = this.getData()) {
    const list = this.clearList('dashboard-challenges-list', 'No real-world problems yet. Create a challenge to practice applying concepts.');
    if (!list) return;
    const problems = [...data.challenges].sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed')).slice(0, this.previewLimit);
    if (!problems.length) return;
    list.replaceChildren();
    problems.forEach(problem => {
      const progress = data.problemProgress?.[problem.id];
      const complete = problem.status === 'completed' || progress?.status === 'completed';
      const { item } = this.makeItem(problem.title, `${(problem.relatedConcepts || []).length} concepts · ${problem.difficulty || 'Challenge'}`, complete ? 'Completed' : 'In progress', complete ? 'badge-fresh' : 'badge-fading');
      const button = document.createElement('button');
      button.className = 'btn btn-outline btn-sm';
      button.type = 'button';
      button.textContent = complete ? 'Review' : 'Solve';
      button.addEventListener('click', () => window.App?.openChallengeSolver(problem.id));
      item.appendChild(button);
      list.appendChild(item);
    });
  },

  relativeDate(value) {
    const elapsed = Date.now() - new Date(value).getTime();
    const days = Math.floor(elapsed / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  },

  activityLabel(type) {
    return ({ review: 'Review', study: 'Study', 'concept-created': 'New concept', quiz: 'Quiz', 'problem-completed': 'Problem solved' })[type] || 'Activity';
  },

  refreshDashboard() {
    if (!window.StorageService) return;
    const data = this.getData();
    this.renderStats(data);
    this.renderRecentActivity(data);
    this.renderSkillPreview(data);
    this.renderReviewPreview(data);
    this.renderDecayPreview(data);
    this.renderProblemPreview(data);
  }
};

function initializeDashboard() { Dashboard.initializeDashboard(); }
function renderStats() { Dashboard.renderStats(); }
function renderRecentActivity() { Dashboard.renderRecentActivity(); }
function renderSkillPreview() { Dashboard.renderSkillPreview(); }
function renderReviewPreview() { Dashboard.renderReviewPreview(); }
function renderDecayPreview() { Dashboard.renderDecayPreview(); }
function renderProblemPreview() { Dashboard.renderProblemPreview(); }
function refreshDashboard() { Dashboard.refreshDashboard(); }

window.Dashboard = Dashboard;
window.initializeDashboard = initializeDashboard;
window.renderStats = renderStats;
window.renderRecentActivity = renderRecentActivity;
window.renderSkillPreview = renderSkillPreview;
window.renderReviewPreview = renderReviewPreview;
window.renderDecayPreview = renderDecayPreview;
window.renderProblemPreview = renderProblemPreview;
window.refreshDashboard = refreshDashboard;
