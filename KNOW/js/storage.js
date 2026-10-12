/**
 * KNOW · Local persistence layer
 * No backend or external dependencies. Loaded before the application modules.
 */

const STORAGE_KEYS = Object.freeze({
  CONCEPTS: 'know_concepts_v1',
  RELATIONSHIPS: 'know_relationships_v1',
  SKILLS: 'know_skills_v1',
  FLASHCARDS: 'know_flashcards_v1',
  CHALLENGES: 'know_challenges_v1',
  ACTIVITY: 'know_learning_activity_v1',
  REVIEWS: 'know_reviews_v1',
  QUIZ_RESULTS: 'know_quiz_results_v1',
  KNOWLEDGE_STRENGTH: 'know_knowledge_strength_v1',
  PROBLEM_PROGRESS: 'know_problem_progress_v1',
  SETTINGS: 'know_settings_v1',
  STATS: 'know_stats_v1'
});

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY_MS).toISOString();

/* First-run sample library. Keep legacy fields used by the current interface,
   alongside the requested name/category/description/strength schema. */
const INITIAL_CONCEPTS = [
  { id: 'html', name: 'HTML', title: 'HTML', category: 'Web Development', domain: 'Web Development', description: 'The semantic markup language used to structure content and interfaces on the web.', summary: 'Structure web pages with semantic elements, metadata, forms, and accessible document outlines.', content: 'HTML (HyperText Markup Language) describes the meaning and structure of web content. Semantic elements such as header, main, article, and footer make interfaces easier to understand and navigate.', strength: 84, mastery: 84, stability: 8, connections: ['css', 'javascript'], tags: ['web', 'markup', 'accessibility'], createdAt: daysAgo(30), created: daysAgo(30), lastReviewed: daysAgo(2), reviewCount: 5 },
  { id: 'css', name: 'CSS', title: 'CSS', category: 'Web Development', domain: 'Web Development', description: 'A style sheet language for describing the presentation and layout of web documents.', summary: 'Style interfaces using the cascade, selectors, layout systems, responsive rules, and design tokens.', content: 'CSS controls presentation. The cascade resolves competing declarations; Flexbox and Grid arrange layouts; media queries adapt the interface to different viewports.', strength: 76, mastery: 76, stability: 6, connections: ['html', 'javascript'], tags: ['web', 'styles', 'layout'], createdAt: daysAgo(28), created: daysAgo(28), lastReviewed: daysAgo(4), reviewCount: 4 },
  { id: 'javascript', name: 'JavaScript', title: 'JavaScript', category: 'Programming', domain: 'Programming', description: 'A programming language that adds behavior and application logic to web pages and other runtimes.', summary: 'Use values, control flow, functions, objects, and browser APIs to build interactive applications.', content: 'JavaScript is a dynamically typed, multi-paradigm language. In the browser it can respond to events, update the DOM, perform calculations, and communicate with web services.', strength: 81, mastery: 81, stability: 7, connections: ['html', 'css', 'functions', 'data-structures'], tags: ['programming', 'web', 'language'], createdAt: daysAgo(26), created: daysAgo(26), lastReviewed: daysAgo(1), reviewCount: 7 },
  { id: 'functions', name: 'Functions', title: 'Functions', category: 'Programming', domain: 'Programming', description: 'Reusable units of code that accept inputs, perform work, and may return a result.', summary: 'Understand parameters, return values, scope, composition, and how functions organize program behavior.', content: 'A function packages behavior behind a name and optional parameters. Functions help separate concerns, avoid repetition, and compose larger programs from smaller operations.', strength: 69, mastery: 69, stability: 4, connections: ['javascript', 'algorithms', 'cpp'], tags: ['programming', 'abstraction', 'fundamentals'], createdAt: daysAgo(22), created: daysAgo(22), lastReviewed: daysAgo(5), reviewCount: 3 },
  { id: 'cpp', name: 'C++', title: 'C++', category: 'Programming', domain: 'Programming', description: 'A compiled, statically typed language commonly used for systems and performance-sensitive software.', summary: 'Explore types, functions, memory, compilation, and the standard library through C++.', content: 'C++ combines low-level control with high-level abstractions. Its type system, compilation model, standard containers, and explicit resource management make it useful for systems and performance-sensitive applications.', strength: 58, mastery: 58, stability: 3, connections: ['functions', 'data-structures', 'algorithms'], tags: ['programming', 'systems', 'compiled'], createdAt: daysAgo(20), created: daysAgo(20), lastReviewed: daysAgo(8), reviewCount: 2 },
  { id: 'data-structures', name: 'Data Structures', title: 'Data Structures', category: 'Computer Science', domain: 'Computer Science', description: 'Organized ways to store and access data for particular operations and constraints.', summary: 'Compare arrays, linked lists, stacks, queues, trees, hash tables, and graphs by their trade-offs.', content: 'Data structures define how data is organized and manipulated. Choosing an appropriate structure changes operation costs, memory use, and the clarity of an algorithm.', strength: 73, mastery: 73, stability: 5, connections: ['javascript', 'cpp', 'algorithms'], tags: ['computer-science', 'data', 'structures'], createdAt: daysAgo(18), created: daysAgo(18), lastReviewed: daysAgo(3), reviewCount: 4 },
  { id: 'algorithms', name: 'Algorithms', title: 'Algorithms', category: 'Computer Science', domain: 'Computer Science', description: 'Finite procedures for solving problems and transforming inputs into desired outputs.', summary: 'Reason about correctness, complexity, searching, sorting, and graph traversal.', content: 'An algorithm is a precise sequence of steps for solving a class of problems. Analyze correctness and resource costs, often expressed with asymptotic time and space complexity.', strength: 66, mastery: 66, stability: 4, connections: ['functions', 'data-structures', 'machine-learning', 'cpp'], tags: ['computer-science', 'problem-solving', 'complexity'], createdAt: daysAgo(15), created: daysAgo(15), lastReviewed: daysAgo(6), reviewCount: 3 },
  { id: 'machine-learning', name: 'Machine Learning', title: 'Machine Learning', category: 'Artificial Intelligence', domain: 'Artificial Intelligence', description: 'Methods that learn patterns from data to make predictions or decisions.', summary: 'Connect data, features, models, objectives, training, evaluation, and generalization.', content: 'Machine learning fits a model to data so it can make useful predictions on new examples. Good practice includes defining a target, splitting data, selecting a metric, checking generalization, and monitoring limitations.', strength: 52, mastery: 52, stability: 2.5, connections: ['algorithms', 'javascript'], tags: ['ai', 'data', 'models'], createdAt: daysAgo(12), created: daysAgo(12), lastReviewed: daysAgo(9), reviewCount: 2 }
];

const INITIAL_RELATIONSHIPS = INITIAL_CONCEPTS.flatMap(concept =>
  concept.connections.filter(target => concept.id < target).map(target => ({
    id: `${concept.id}:${target}`, sourceId: concept.id, targetId: target,
    type: 'related', createdAt: daysAgo(14)
  }))
);

const INITIAL_SKILLS = [
  { id: 'skill-web', name: 'Web Development Foundations', category: 'Web Development', level: 2, xp: 260, maxXp: 500, description: 'Build accessible, responsive interfaces using the web platform.', requiredConcepts: ['html', 'css', 'javascript'], challengesCompleted: [] },
  { id: 'skill-cs', name: 'Computer Science Fundamentals', category: 'Computer Science', level: 2, xp: 310, maxXp: 500, description: 'Use data structures and algorithms to reason about practical problems.', requiredConcepts: ['functions', 'data-structures', 'algorithms'], challengesCompleted: [] },
  { id: 'skill-ml', name: 'Machine Learning', category: 'Artificial Intelligence', level: 1, xp: 90, maxXp: 300, description: 'Build a foundation in models, data, and evaluation.', requiredConcepts: ['algorithms', 'machine-learning'], challengesCompleted: [] }
];

const INITIAL_FLASHCARDS = [
  { id: 'card-html', conceptId: 'html', front: 'What does semantic HTML provide?', back: 'Meaningful structure that improves accessibility, maintainability, and how tools interpret a page.', box: 2, interval: 3, easeFactor: 2.5, repetitions: 2, nextReviewDate: daysAgo(-1), lastReviewed: daysAgo(2) },
  { id: 'card-css', conceptId: 'css', front: 'What problem do CSS Grid and Flexbox solve?', back: 'They provide layout systems for arranging and aligning interface elements across available space.', box: 1, interval: 1, easeFactor: 2.4, repetitions: 1, nextReviewDate: daysAgo(1), lastReviewed: daysAgo(1) },
  { id: 'card-js', conceptId: 'javascript', front: 'What is a JavaScript event listener used for?', back: 'To run a function in response to an event such as a click, key press, or form submission.', box: 2, interval: 3, easeFactor: 2.5, repetitions: 2, nextReviewDate: daysAgo(-1), lastReviewed: daysAgo(2) },
  { id: 'card-algorithms', conceptId: 'algorithms', front: 'What does Big O describe?', back: 'How an algorithm’s resource use grows as input size grows, abstracting away constant factors.', box: 1, interval: 1, easeFactor: 2.3, repetitions: 1, nextReviewDate: daysAgo(0), lastReviewed: daysAgo(1) }
];

const INITIAL_CHALLENGES = [
  { id: 'problem-responsive-page', title: 'Build a Responsive Product Page', difficulty: 'Beginner', skillId: 'skill-web', relatedConcepts: ['html', 'css', 'javascript'], scenario: 'Create a semantic product page that adapts cleanly from mobile to desktop and includes an interactive save action.', requirements: ['Use semantic HTML landmarks.', 'Create a responsive layout with CSS.', 'Add a JavaScript interaction with visible feedback.'], hints: ['Start with the narrowest viewport.', 'Keep structure, presentation, and behavior separate.'], solutionGuide: 'Use semantic page structure, a mobile-first CSS layout, and a small event handler that updates accessible status text.', userSolution: '', status: 'in_progress', completedDate: null },
  { id: 'problem-search', title: 'Choose a Search Strategy', difficulty: 'Intermediate', skillId: 'skill-cs', relatedConcepts: ['data-structures', 'algorithms'], scenario: 'A library needs to find records quickly while supporting frequent inserts and predictable ordering. Explain the data structure and search approach you would choose.', requirements: ['Describe lookup complexity.', 'Account for update cost.', 'Explain the trade-offs.'], hints: ['Consider a hash table and a sorted index as different tools.'], solutionGuide: 'Choose the structure based on the dominant workload. A hash table offers average constant-time key lookup; a sorted index supports ordered traversal and logarithmic search, with different update costs.', userSolution: '', status: 'unsolved', completedDate: null }
];

const INITIAL_ACTIVITY = [
  { id: 'activity-seed-1', type: 'study', description: 'Reviewed JavaScript fundamentals', conceptId: 'javascript', createdAt: daysAgo(1) },
  { id: 'activity-seed-2', type: 'concept-created', description: 'Added Machine Learning to the library', conceptId: 'machine-learning', createdAt: daysAgo(12) }
];
const INITIAL_REVIEWS = INITIAL_CONCEPTS.map(({ id, lastReviewed, reviewCount, strength }) => ({ conceptId: id, lastReviewed, reviewCount, strength }));
const INITIAL_QUIZ_RESULTS = [{ id: 'quiz-seed-1', score: 3, total: 4, topic: 'Programming foundations', completedAt: daysAgo(2) }];
const INITIAL_KNOWLEDGE_STRENGTH = Object.fromEntries(INITIAL_CONCEPTS.map(({ id, strength }) => [id, strength]));
const INITIAL_PROBLEM_PROGRESS = Object.fromEntries(INITIAL_CHALLENGES.map(({ id, status, completedDate }) => [id, { status, completedDate, attempts: status === 'in_progress' ? 1 : 0 }]));
const INITIAL_SETTINGS = { geminiApiKey: '', aiModel: 'gemini-1.5-flash', theme: 'dark', userName: 'Learner', retentionThreshold: 60 };
const INITIAL_STATS = { streakDays: 3, lastStudyDate: new Date().toISOString().slice(0, 10), cardsReviewedToday: 1, totalXp: 660 };

/* Generic safe key/value helpers. Invalid serialized data is discarded and
   replaced with a cloned default so callers never share mutable seed objects. */
function saveData(key, data) {
  try {
    localStorage.setItem(String(key), JSON.stringify(data));
    if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new window.CustomEvent('know:data-changed', { detail: { key: String(key) } }));
    }
    return data;
  } catch (error) {
    console.error(`Unable to save KNOW data for "${key}".`, error);
    return null;
  }
}

function loadData(key, defaultValue) {
  try {
    const raw = localStorage.getItem(String(key));
    if (raw === null) {
      const fallback = cloneData(defaultValue);
      saveData(key, fallback);
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Invalid or unavailable KNOW data for "${key}"; restoring defaults.`, error);
    try { localStorage.removeItem(String(key)); } catch (_) { /* Storage may be disabled. */ }
    const fallback = cloneData(defaultValue);
    saveData(key, fallback);
    return fallback;
  }
}

function removeData(key) {
  try { localStorage.removeItem(String(key)); return true; }
  catch (error) { console.error(`Unable to remove KNOW data for "${key}".`, error); return false; }
}

function clearAllData() {
  let success = true;
  Object.values(STORAGE_KEYS).forEach(key => { if (!removeData(key)) success = false; });
  return success;
}

function cloneData(value) {
  if (value === undefined) return null;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function loadCollection(key, seed) {
  const result = loadData(key, seed);
  return Array.isArray(result) ? result : cloneData(seed);
}

const StorageService = {
  saveConcepts(data) {
    const saved = saveData(STORAGE_KEYS.CONCEPTS, data);
    if (Array.isArray(data)) {
      const previous = loadCollection(STORAGE_KEYS.RELATIONSHIPS, INITIAL_RELATIONSHIPS);
      const previousByPair = new Map(previous.map(edge => [`${edge.sourceId}:${edge.targetId}`, edge]));
      const relationships = [];
      data.forEach(concept => (concept.connections || []).forEach(targetId => {
        if (!data.some(other => other.id === targetId)) return;
        const [sourceId, normalizedTarget] = [concept.id, targetId].sort();
        const pair = `${sourceId}:${normalizedTarget}`;
        if (!relationships.some(edge => edge.id === pair)) {
          relationships.push(previousByPair.get(pair) || {
            id: pair, sourceId, targetId: normalizedTarget, type: 'related', createdAt: new Date().toISOString()
          });
        }
      }));
      saveData(STORAGE_KEYS.RELATIONSHIPS, relationships);
      saveData(STORAGE_KEYS.KNOWLEDGE_STRENGTH, Object.fromEntries(data.map(concept => [concept.id, concept.strength ?? concept.mastery ?? 0])));
      saveData(STORAGE_KEYS.REVIEWS, data.map(concept => ({
        conceptId: concept.id,
        lastReviewed: concept.lastReviewed || null,
        reviewCount: Number(concept.reviewCount) || 0,
        strength: concept.strength ?? concept.mastery ?? 0
      })));
    }
    return saved;
  },
  loadConcepts: () => loadCollection(STORAGE_KEYS.CONCEPTS, INITIAL_CONCEPTS),
  saveRelationships: data => saveData(STORAGE_KEYS.RELATIONSHIPS, data),
  loadRelationships: () => loadCollection(STORAGE_KEYS.RELATIONSHIPS, INITIAL_RELATIONSHIPS),
  saveSkills: data => saveData(STORAGE_KEYS.SKILLS, data),
  loadSkills: () => loadCollection(STORAGE_KEYS.SKILLS, INITIAL_SKILLS),
  saveFlashcards: data => saveData(STORAGE_KEYS.FLASHCARDS, data),
  loadFlashcards: () => loadCollection(STORAGE_KEYS.FLASHCARDS, INITIAL_FLASHCARDS),
  saveChallenges: data => saveData(STORAGE_KEYS.CHALLENGES, data),
  loadChallenges: () => loadCollection(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES),
  saveActivity: data => saveData(STORAGE_KEYS.ACTIVITY, data),
  loadActivity: () => loadCollection(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY),
  saveReviews: data => saveData(STORAGE_KEYS.REVIEWS, data),
  loadReviews: () => loadCollection(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS),
  saveQuizResults: data => saveData(STORAGE_KEYS.QUIZ_RESULTS, data),
  loadQuizResults: () => loadCollection(STORAGE_KEYS.QUIZ_RESULTS, INITIAL_QUIZ_RESULTS),
  saveKnowledgeStrength: data => saveData(STORAGE_KEYS.KNOWLEDGE_STRENGTH, data),
  loadKnowledgeStrength: () => loadData(STORAGE_KEYS.KNOWLEDGE_STRENGTH, INITIAL_KNOWLEDGE_STRENGTH),
  saveProblemProgress: data => saveData(STORAGE_KEYS.PROBLEM_PROGRESS, data),
  loadProblemProgress: () => loadData(STORAGE_KEYS.PROBLEM_PROGRESS, INITIAL_PROBLEM_PROGRESS),
  saveSettings: data => saveData(STORAGE_KEYS.SETTINGS, data),
  loadSettings: () => ({ ...INITIAL_SETTINGS, ...loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS) }),
  saveStats: data => saveData(STORAGE_KEYS.STATS, data),
  loadStats: () => ({ ...INITIAL_STATS, ...loadData(STORAGE_KEYS.STATS, INITIAL_STATS) }),
  exportBackup() {
    const backup = {
      version: '2.0', exportedAt: new Date().toISOString(),
      concepts: this.loadConcepts(), relationships: this.loadRelationships(), skills: this.loadSkills(),
      flashcards: this.loadFlashcards(), challenges: this.loadChallenges(), activity: this.loadActivity(),
      reviews: this.loadReviews(), quizResults: this.loadQuizResults(),
      knowledgeStrength: this.loadKnowledgeStrength(), problemProgress: this.loadProblemProgress(),
      settings: this.loadSettings(), stats: this.loadStats()
    };
    return JSON.stringify(backup, null, 2);
  },
  importBackup(jsonString) {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || typeof backup !== 'object' || Array.isArray(backup)) return false;
      const mapping = {
        concepts: 'saveConcepts', relationships: 'saveRelationships', skills: 'saveSkills',
        flashcards: 'saveFlashcards', challenges: 'saveChallenges', activity: 'saveActivity',
        reviews: 'saveReviews', quizResults: 'saveQuizResults', knowledgeStrength: 'saveKnowledgeStrength',
        problemProgress: 'saveProblemProgress', settings: 'saveSettings', stats: 'saveStats'
      };
      for (const [field, method] of Object.entries(mapping)) {
        if (Object.prototype.hasOwnProperty.call(backup, field)) this[method](backup[field]);
      }
      return true;
    } catch (error) {
      console.error('Failed to import KNOW backup.', error);
      return false;
    }
  },
  resetAll() {
    clearAllData();
    if (typeof location !== 'undefined' && typeof location.reload === 'function') location.reload();
  }
};

// Populate every app data bucket on first launch and repair malformed values.
Object.entries({
  [STORAGE_KEYS.CONCEPTS]: INITIAL_CONCEPTS,
  [STORAGE_KEYS.RELATIONSHIPS]: INITIAL_RELATIONSHIPS,
  [STORAGE_KEYS.SKILLS]: INITIAL_SKILLS,
  [STORAGE_KEYS.FLASHCARDS]: INITIAL_FLASHCARDS,
  [STORAGE_KEYS.CHALLENGES]: INITIAL_CHALLENGES,
  [STORAGE_KEYS.ACTIVITY]: INITIAL_ACTIVITY,
  [STORAGE_KEYS.REVIEWS]: INITIAL_REVIEWS,
  [STORAGE_KEYS.QUIZ_RESULTS]: INITIAL_QUIZ_RESULTS,
  [STORAGE_KEYS.KNOWLEDGE_STRENGTH]: INITIAL_KNOWLEDGE_STRENGTH,
  [STORAGE_KEYS.PROBLEM_PROGRESS]: INITIAL_PROBLEM_PROGRESS,
  [STORAGE_KEYS.SETTINGS]: INITIAL_SETTINGS,
  [STORAGE_KEYS.STATS]: INITIAL_STATS
}).forEach(([key, fallback]) => loadData(key, fallback));

window.StorageService = StorageService;
window.saveData = saveData;
window.loadData = loadData;
window.removeData = removeData;
window.clearAllData = clearAllData;
