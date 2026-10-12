/**
 * KNOW - Knowledge Decay & Ebbinghaus Forgetting Curve Engine
 * Implements Ebbinghaus decay math and SuperMemo-2 (SM-2) spaced repetition logic.
 * File: js/decay.js
 */

const DecayEngine = {
  /**
   * Calculates retention percentage using Ebbinghaus Forgetting Curve:
   * R = exp(-t / S)
   * @param {string|number} lastReviewed - ISO date string or timestamp
   * @param {number} stability - Memory stability factor in days (default: 2.0)
   * @returns {number} Retention percentage (0 to 100)
   */
  calculateRetention(lastReviewed, stability = 2.0) {
    if (!lastReviewed) return 0;
    const reviewedTime = new Date(lastReviewed).getTime();
    const now = Date.now();
    
    // Time elapsed in fractional days
    const elapsedDays = Math.max(0, (now - reviewedTime) / (1000 * 60 * 60 * 24));
    const safeStability = Math.max(0.5, stability || 2.0);
    
    // R = e^(-t / S)
    const retentionRate = Math.exp(-elapsedDays / safeStability);
    return Math.min(100, Math.max(0, Math.round(retentionRate * 100)));
  },

  /**
   * Get decay status object with label, CSS class, and color
   * @param {number} retentionPercent - 0 to 100
   */
  getStatus(retentionPercent) {
    if (retentionPercent >= 80) {
      return {
        label: 'Fresh & Solid',
        code: 'fresh',
        color: '#10b981',
        badgeClass: 'badge-fresh',
        description: 'Memory traces are strong.'
      };
    } else if (retentionPercent >= 50) {
      return {
        label: 'Memory Fading',
        code: 'fading',
        color: '#f59e0b',
        badgeClass: 'badge-fading',
        description: 'Synaptic connections are attenuating. Review recommended.'
      };
    } else {
      return {
        label: 'Decayed (Needs Review)',
        code: 'decayed',
        color: '#ef4444',
        badgeClass: 'badge-decayed',
        description: 'High probability of recall failure. Urgent active recall needed!'
      };
    }
  },

  /**
   * Processes a flashcard review using modified SuperMemo-2 (SM-2) algorithm
   * @param {object} card - Flashcard object
   * @param {number} rating - 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
   * @returns {object} Updated card properties
   */
  processCardReview(card, rating) {
    let interval = card.interval || 1;
    let repetitions = card.repetitions || 0;
    let easeFactor = card.easeFactor || 2.5;

    // Convert 1-4 rating to SM-2 quality (0 to 5)
    // 1 (Again) -> 1, 2 (Hard) -> 3, 3 (Good) -> 4, 4 (Easy) -> 5
    const qMap = { 1: 1, 2: 3, 3: 4, 4: 5 };
    const q = qMap[rating] || 3;

    if (q >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    } else {
      // Failed recall: reset repetitions, review next day
      repetitions = 0;
      interval = 1;
    }

    // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Bonus for "Easy" rating
    if (rating === 4) {
      interval = Math.round(interval * 1.3);
    }

    const nextDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    return {
      ...card,
      repetitions,
      interval,
      easeFactor: Number(easeFactor.toFixed(2)),
      lastReviewed: new Date().toISOString(),
      nextReviewDate: nextDate.toISOString()
    };
  },

  /**
   * Refreshes a concept's stability & mastery after review
   * @param {object} concept 
   * @param {number} boostFactor (default: 1.5)
   */
  boostConceptMemory(concept, boostFactor = 1.5) {
    const currentStability = concept.stability || 2.0;
    const newStability = Math.min(60, Number((currentStability * boostFactor).toFixed(1)));
    const currentMastery = concept.mastery || 50;
    const newMastery = Math.min(100, Math.round(currentMastery + (100 - currentMastery) * 0.15));

    return {
      ...concept,
      stability: newStability,
      mastery: newMastery,
      lastReviewed: new Date().toISOString()
    };
  },

  /**
   * Human-friendly relative time string
   * @param {string} dateString 
   */
  formatRelativeTime(dateString) {
    if (!dateString) return 'Never';
    const ms = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  },

  /**
   * Returns list of concepts categorized by decay urgency
   * @param {Array} concepts 
   */
  getDecaySummary(concepts) {
    const list = concepts.map(c => {
      const retention = this.calculateRetention(c.lastReviewed, c.stability);
      const status = this.getStatus(retention);
      return {
        concept: c,
        retention,
        status
      };
    });

    list.sort((a, b) => a.retention - b.retention);

    const decayed = list.filter(item => item.retention < 50);
    const fading = list.filter(item => item.retention >= 50 && item.retention < 80);
    const fresh = list.filter(item => item.retention >= 80);

    const avgRetention = list.length > 0
      ? Math.round(list.reduce((acc, curr) => acc + curr.retention, 0) / list.length)
      : 100;

    return {
      all: list,
      decayed,
      fading,
      fresh,
      avgRetention
    };
  }
};
