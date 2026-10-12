/**
 * KNOW - Interactive Visual Knowledge Graph Module
 * Pure Vanilla HTML5 Canvas force-directed graph renderer.
 * File: js/graph.js
 */

class KnowledgeGraph {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.options = Object.assign({
      onNodeClick: null,
      colorMode: 'domain'
    }, options);

    this.nodes = [];
    this.links = [];
    this.domainColorMap = {};

    this.transform = {
      x: 0,
      y: 0,
      scale: 1.0
    };

    this.isDragging = false;
    this.isPanning = false;
    this.draggedNode = null;
    this.hoveredNode = null;
    this.lastMousePos = { x: 0, y: 0 };
    this.highlightQuery = '';

    this.simulationRunning = false;
    this.alpha = 1.0;
    this.alphaDecay = 0.02;

    this.initEventListeners();
    this.resize();
  }

  getDomainColor(domain) {
    if (!domain) return '#6366f1';
    if (!this.domainColorMap[domain]) {
      const colors = ['#6366f1', '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#14b8a6'];
      const keys = Object.keys(this.domainColorMap);
      this.domainColorMap[domain] = colors[keys.length % colors.length];
    }
    return this.domainColorMap[domain];
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 500;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);

    if (this.transform.x === 0 && this.transform.y === 0) {
      this.resetView();
    }
    this.render();
  }

  resetView() {
    this.transform.x = this.width / 2;
    this.transform.y = this.height / 2;
    this.transform.scale = 1.0;
    this.alpha = 0.8;
    this.startSimulation();
  }

  setData(concepts) {
    const existingNodeMap = new Map();
    this.nodes.forEach(n => existingNodeMap.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy }));

    this.nodes = concepts.map((c, index) => {
      const existing = existingNodeMap.get(c.id);
      const angle = (index / (concepts.length || 1)) * Math.PI * 2;
      const radius = 120 + Math.random() * 80;

      const retention = DecayEngine.calculateRetention(c.lastReviewed, c.stability);
      const status = DecayEngine.getStatus(retention);
      const connCount = (c.connections || []).length;

      return {
        id: c.id,
        concept: c,
        title: c.title,
        domain: c.domain,
        retention,
        status,
        connections: c.connections || [],
        radius: Math.max(18, Math.min(32, 16 + connCount * 3)),
        x: existing ? existing.x : Math.cos(angle) * radius,
        y: existing ? existing.y : Math.sin(angle) * radius,
        vx: existing ? existing.vx : (Math.random() - 0.5) * 2,
        vy: existing ? existing.vy : (Math.random() - 0.5) * 2,
        fixed: false
      };
    });

    const nodeMap = new Map();
    this.nodes.forEach(n => nodeMap.set(n.id, n));

    this.links = [];
    const linkSet = new Set();
    this.nodes.forEach(source => {
      (source.connections || []).forEach(targetId => {
        const target = nodeMap.get(targetId);
        if (target) {
          const key = [source.id, target.id].sort().join('--');
          if (!linkSet.has(key)) {
            linkSet.add(key);
            this.links.push({ source, target });
          }
        }
      });
    });

    this.alpha = 1.0;
    this.startSimulation();
  }

  setColorMode(mode) {
    this.options.colorMode = mode;
    this.render();
  }

  setHighlight(query) {
    this.highlightQuery = (query || '').toLowerCase().trim();
    this.render();
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      this.transform.x = mouseX - (mouseX - this.transform.x) * zoomFactor;
      this.transform.y = mouseY - (mouseY - this.transform.y) * zoomFactor;
      this.transform.scale = Math.max(0.2, Math.min(3.0, this.transform.scale * zoomFactor));

      this.render();
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => {
      const mouse = this.screenToWorld(e.offsetX, e.offsetY);
      this.lastMousePos = { x: e.offsetX, y: e.offsetY };

      const clickedNode = this.getNodeAt(mouse.x, mouse.y);
      if (clickedNode) {
        this.isDragging = true;
        this.draggedNode = clickedNode;
        clickedNode.fixed = true;
        this.alpha = 0.5;
        this.startSimulation();
      } else {
        this.isPanning = true;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const mouse = this.screenToWorld(e.offsetX, e.offsetY);

      if (this.isDragging && this.draggedNode) {
        this.draggedNode.x = mouse.x;
        this.draggedNode.y = mouse.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
        this.alpha = Math.max(this.alpha, 0.3);
        this.render();
      } else if (this.isPanning) {
        const dx = e.offsetX - this.lastMousePos.x;
        const dy = e.offsetY - this.lastMousePos.y;
        this.transform.x += dx;
        this.transform.y += dy;
        this.lastMousePos = { x: e.offsetX, y: e.offsetY };
        this.render();
      } else {
        const hovered = this.getNodeAt(mouse.x, mouse.y);
        if (hovered !== this.hoveredNode) {
          this.hoveredNode = hovered;
          this.canvas.style.cursor = hovered ? 'pointer' : 'grab';
          this.render();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.draggedNode) {
        this.draggedNode.fixed = false;
        this.draggedNode = null;
      }
      this.isDragging = false;
      this.isPanning = false;
    });

    this.canvas.addEventListener('click', (e) => {
      const mouse = this.screenToWorld(e.offsetX, e.offsetY);
      const clicked = this.getNodeAt(mouse.x, mouse.y);
      if (clicked && this.options.onNodeClick) {
        this.options.onNodeClick(clicked.concept);
      }
    });
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.transform.x) / this.transform.scale,
      y: (sy - this.transform.y) / this.transform.scale
    };
  }

  getNodeAt(wx, wy) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dist = Math.hypot(n.x - wx, n.y - wy);
      if (dist <= n.radius) return n;
    }
    return null;
  }

  startSimulation() {
    if (!this.simulationRunning) {
      this.simulationRunning = true;
      this.stepSimulation();
    }
  }

  stepSimulation() {
    if (this.alpha > 0.005) {
      this.updatePhysics();
      this.alpha -= this.alphaDecay * 0.5;
      this.render();
      requestAnimationFrame(() => this.stepSimulation());
    } else {
      this.simulationRunning = false;
      this.render();
    }
  }

  updatePhysics() {
    const repulsionStrength = 1800;
    const linkTargetDistance = 140;
    const linkStrength = 0.04;
    const centerStrength = 0.015;

    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);

        if (dist < 400) {
          const force = (repulsionStrength / distSq) * this.alpha;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!n1.fixed) { n1.vx -= fx; n1.vy -= fy; }
          if (!n2.fixed) { n2.vx += fx; n2.vy += fy; }
        }
      }
    }

    this.links.forEach(link => {
      const s = link.source;
      const t = link.target;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      const displacement = dist - linkTargetDistance;
      const force = displacement * linkStrength * this.alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!s.fixed) { s.vx += fx; s.vy += fy; }
      if (!t.fixed) { t.vx -= fx; t.vy -= fy; }
    });

    this.nodes.forEach(n => {
      if (!n.fixed) {
        n.vx -= n.x * centerStrength * this.alpha;
        n.vy -= n.y * centerStrength * this.alpha;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
      }
    });
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);

    // Subtle coordinate grid
    this.drawGrid(ctx);

    // Edges
    this.links.forEach(link => {
      const isConnectedToHover = this.hoveredNode &&
        (link.source.id === this.hoveredNode.id || link.target.id === this.hoveredNode.id);

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      
      if (isConnectedToHover) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 8;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Nodes
    this.nodes.forEach(node => {
      this.drawNode(ctx, node);
    });

    ctx.restore();

    // Floating Tooltip
    if (this.hoveredNode) {
      this.drawTooltip(ctx, this.hoveredNode);
    }
  }

  drawGrid(ctx) {
    const gridSize = 60;
    const bounds = 1200;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = -bounds; x <= bounds; x += gridSize) {
      ctx.moveTo(x, -bounds);
      ctx.lineTo(x, bounds);
    }
    for (let y = -bounds; y <= bounds; y += gridSize) {
      ctx.moveTo(-bounds, y);
      ctx.lineTo(bounds, y);
    }
    ctx.stroke();
  }

  drawNode(ctx, node) {
    const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
    const isMatch = this.highlightQuery && node.title.toLowerCase().includes(this.highlightQuery);
    
    let fillColor = this.options.colorMode === 'decay' 
      ? node.status.color 
      : this.getDomainColor(node.domain);

    ctx.save();

    if (isHovered || isMatch) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = isHovered ? 15 : 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = isHovered ? 2.5 : 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius - 3, 0, Math.PI * 2);
    ctx.strokeStyle = node.status.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '500 12px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const maxChars = 18;
    const displayTitle = node.title.length > maxChars 
      ? node.title.slice(0, maxChars) + '…' 
      : node.title;

    ctx.fillText(displayTitle, node.x, node.y + node.radius + 6);
    ctx.restore();
  }

  drawTooltip(ctx, node) {
    const screenX = node.x * this.transform.scale + this.transform.x;
    const screenY = node.y * this.transform.scale + this.transform.y;

    const pad = 12;
    const line1 = node.title;
    const line2 = `${node.domain} • ${node.retention}% Retention`;
    const line3 = `${node.connections.length} connections • ${node.status.label}`;

    ctx.font = '600 13px Inter, sans-serif';
    const w1 = ctx.measureText(line1).width;
    ctx.font = '400 11px Inter, sans-serif';
    const w2 = ctx.measureText(line2).width;
    const boxWidth = Math.max(w1, w2) + pad * 2;
    const boxHeight = 64;

    const tooltipX = Math.min(this.width - boxWidth - 10, Math.max(10, screenX - boxWidth / 2));
    const tooltipY = Math.max(10, screenY - node.radius * this.transform.scale - boxHeight - 14);

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    this.roundRect(ctx, tooltipX, tooltipY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(line1, tooltipX + pad, tooltipY + pad);

    ctx.font = '400 11px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(line2, tooltipX + pad, tooltipY + pad + 18);

    ctx.fillStyle = node.status.color;
    ctx.fillText(line3, tooltipX + pad, tooltipY + pad + 34);

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

const GraphModule = {
  instance: null,

  init(canvas) {
    if (!this.instance && canvas) {
      this.instance = new KnowledgeGraph(canvas, {
        onNodeClick: (concept) => {
          if (window.App && typeof App.openConceptDetail === 'function') {
            App.openConceptDetail(concept.id);
          }
        },
        colorMode: document.getElementById('graph-color-mode-select')?.value || 'domain'
      });
    }
    return this.instance;
  },

  render() {
    const canvas = document.getElementById('knowledge-graph-canvas');
    if (!this.instance) {
      this.init(canvas);
    }
    if (this.instance) {
      const concepts = StorageService.loadConcepts();
      this.instance.setData(concepts);
      this.instance.resize();
    }
  },

  resetView() {
    if (this.instance) this.instance.resetView();
  },

  zoom(factor) {
    if (this.instance) {
      this.instance.transform.scale = Math.max(0.2, Math.min(3.0, this.instance.transform.scale * factor));
      this.instance.render();
    }
  },

  setColorMode(mode) {
    if (this.instance) this.instance.setColorMode(mode);
  },

  setHighlight(query) {
    if (this.instance) this.instance.setHighlight(query);
  }
};
