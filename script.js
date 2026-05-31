//your JS code here. If required.
/* ═══════════════════════════════════════════════════════════════
   CHRONOSTACK — Time-Traveling Debugger
   Simulates JavaScript call stack with step-by-step playback
   ═══════════════════════════════════════════════════════════════ */

"use strict";

// ── Frame colour palette
const PALETTE = ['--f0','--f1','--f2','--f3','--f4','--f5'];

// ── Utility: get CSS variable colour
const cssVar = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// ─────────────────────────────────────────────
//  SCENARIO DEFINITIONS
//  Each scenario has:
//   code  — syntax-highlighted HTML lines
//   steps — array of execution steps
// ─────────────────────────────────────────────
const SCENARIOS = {

  // ── 1. Recursive Factorial ──────────────────
  factorial: {
    title: 'Recursive Factorial',
    code: [
      { html: '<span class="kw">function</span> <span class="fn">factorial</span>(n) {',      id:'L1'  },
      { html: '  <span class="kw">if</span> (n <span class="op"><=</span> <span class="num">1</span>) {', id:'L2'  },
      { html: '    <span class="ret">return</span> <span class="num">1</span>;',                 id:'L3'  },
      { html: '  }',                                                                            id:'L4'  },
      { html: '  <span class="ret">return</span> n <span class="op">*</span> <span class="fn">factorial</span>(n <span class="op">-</span> <span class="num">1</span>);', id:'L5' },
      { html: '}',                                                                              id:'L6'  },
      { html: '',                                                                               id:'L7'  },
      { html: '<span class="kw">const</span> result <span class="op">=</span> <span class="fn">factorial</span>(<span class="num">5</span>);', id:'L8' },
      { html: '<span class="fn">console</span>.<span class="fn">log</span>(result); <span class="cmt">// 120</span>', id:'L9' },
    ],
    steps: [
      { line:'L8', push:{ fn:'factorial', args:'n = 5',  scope:{ n:5  }, ret:null }, log:{type:'push', msg:'CALL factorial(5)'} },
      { line:'L2', info:'Checking base case: 5 <= 1 → false', log:{type:'exec', msg:'Evaluate: 5 <= 1 → false'} },
      { line:'L5', push:{ fn:'factorial', args:'n = 4',  scope:{ n:4  }, ret:null }, log:{type:'push', msg:'CALL factorial(4) — recursive'} },
      { line:'L2', info:'Checking base case: 4 <= 1 → false', log:{type:'exec', msg:'Evaluate: 4 <= 1 → false'} },
      { line:'L5', push:{ fn:'factorial', args:'n = 3',  scope:{ n:3  }, ret:null }, log:{type:'push', msg:'CALL factorial(3) — recursive'} },
      { line:'L2', info:'Checking base case: 3 <= 1 → false', log:{type:'exec', msg:'Evaluate: 3 <= 1 → false'} },
      { line:'L5', push:{ fn:'factorial', args:'n = 2',  scope:{ n:2  }, ret:null }, log:{type:'push', msg:'CALL factorial(2) — recursive'} },
      { line:'L2', info:'Checking base case: 2 <= 1 → false', log:{type:'exec', msg:'Evaluate: 2 <= 1 → false'} },
      { line:'L5', push:{ fn:'factorial', args:'n = 1',  scope:{ n:1  }, ret:null }, log:{type:'push', msg:'CALL factorial(1) — recursive'} },
      { line:'L2', info:'Checking base case: 1 <= 1 → true!', log:{type:'exec', msg:'Evaluate: 1 <= 1 → TRUE — base case!'} },
      { line:'L3', pop:true, retVal:'1',  log:{type:'ret', msg:'RETURN 1  (base case)'} },
      { line:'L5', pop:true, retVal:'2',  log:{type:'ret', msg:'RETURN 2  (2 × 1)'} },
      { line:'L5', pop:true, retVal:'6',  log:{type:'ret', msg:'RETURN 6  (3 × 2)'} },
      { line:'L5', pop:true, retVal:'24', log:{type:'ret', msg:'RETURN 24 (4 × 6)'} },
      { line:'L5', pop:true, retVal:'120',log:{type:'ret', msg:'RETURN 120 (5 × 24)'} },
      { line:'L9', info:'result = 120', log:{type:'exec', msg:'console.log(120)  ✓ Stack empty'} },
    ]
  },

  // ── 2. Fibonacci ───────────────────────────
  fibonacci: {
    title: 'Fibonacci Sequence',
    code: [
      { html: '<span class="kw">function</span> <span class="fn">fib</span>(n) {',              id:'L1' },
      { html: '  <span class="kw">if</span> (n <span class="op"><=</span> <span class="num">1</span>) <span class="ret">return</span> n;', id:'L2' },
      { html: '  <span class="ret">return</span> <span class="fn">fib</span>(n<span class="op">-</span><span class="num">1</span>) <span class="op">+</span> <span class="fn">fib</span>(n<span class="op">-</span><span class="num">2</span>);', id:'L3' },
      { html: '}',                                                                              id:'L4' },
      { html: '',                                                                               id:'L5' },
      { html: '<span class="kw">const</span> r <span class="op">=</span> <span class="fn">fib</span>(<span class="num">4</span>);', id:'L6' },
      { html: '<span class="fn">console</span>.<span class="fn">log</span>(r); <span class="cmt">// 3</span>', id:'L7' },
    ],
    steps: [
      { line:'L6', push:{ fn:'fib', args:'n = 4', scope:{ n:4 }, ret:null }, log:{type:'push', msg:'CALL fib(4)'} },
      { line:'L2', info:'4 <= 1 → false', log:{type:'exec', msg:'Evaluate: 4 <= 1 → false'} },
      { line:'L3', push:{ fn:'fib', args:'n = 3', scope:{ n:3 }, ret:null }, log:{type:'push', msg:'CALL fib(3) — left branch'} },
      { line:'L2', info:'3 <= 1 → false', log:{type:'exec', msg:'Evaluate: 3 <= 1 → false'} },
      { line:'L3', push:{ fn:'fib', args:'n = 2', scope:{ n:2 }, ret:null }, log:{type:'push', msg:'CALL fib(2)'} },
      { line:'L2', info:'2 <= 1 → false', log:{type:'exec', msg:'Evaluate: 2 <= 1 → false'} },
      { line:'L3', push:{ fn:'fib', args:'n = 1', scope:{ n:1 }, ret:null }, log:{type:'push', msg:'CALL fib(1) — base case'} },
      { line:'L2', info:'1 <= 1 → true', log:{type:'exec', msg:'Evaluate: 1 <= 1 → TRUE'} },
      { line:'L2', pop:true, retVal:'1', log:{type:'ret', msg:'RETURN 1'} },
      { line:'L3', push:{ fn:'fib', args:'n = 0', scope:{ n:0 }, ret:null }, log:{type:'push', msg:'CALL fib(0) — base case'} },
      { line:'L2', info:'0 <= 1 → true', log:{type:'exec', msg:'Evaluate: 0 <= 1 → TRUE'} },
      { line:'L2', pop:true, retVal:'0', log:{type:'ret', msg:'RETURN 0'} },
      { line:'L3', pop:true, retVal:'1', log:{type:'ret', msg:'RETURN 1 (fib(1)+fib(0))'} },
      { line:'L3', push:{ fn:'fib', args:'n = 1', scope:{ n:1 }, ret:null }, log:{type:'push', msg:'CALL fib(1) — right branch'} },
      { line:'L2', pop:true, retVal:'1', log:{type:'ret', msg:'RETURN 1'} },
      { line:'L3', pop:true, retVal:'2', log:{type:'ret', msg:'RETURN 2 (fib(2)+fib(1))'} },
      { line:'L3', push:{ fn:'fib', args:'n = 2', scope:{ n:2 }, ret:null }, log:{type:'push', msg:'CALL fib(2) — right branch of fib(4)'} },
      { line:'L2', info:'2 <= 1 → false', log:{type:'exec', msg:'Evaluate: 2 <= 1 → false'} },
      { line:'L3', push:{ fn:'fib', args:'n = 1', scope:{ n:1 }, ret:null }, log:{type:'push', msg:'CALL fib(1)'} },
      { line:'L2', pop:true, retVal:'1', log:{type:'ret', msg:'RETURN 1'} },
      { line:'L3', push:{ fn:'fib', args:'n = 0', scope:{ n:0 }, ret:null }, log:{type:'push', msg:'CALL fib(0)'} },
      { line:'L2', pop:true, retVal:'0', log:{type:'ret', msg:'RETURN 0'} },
      { line:'L3', pop:true, retVal:'1', log:{type:'ret', msg:'RETURN 1'} },
      { line:'L3', pop:true, retVal:'3', log:{type:'ret', msg:'RETURN 3 (fib(3)+fib(2))  ✓'} },
      { line:'L7', info:'r = 3', log:{type:'exec', msg:'console.log(3)  Stack empty!'} },
    ]
  },

  // ── 3. Nested Function Calls ────────────────
  nested: {
    title: 'Nested Function Calls',
    code: [
      { html: '<span class="kw">function</span> <span class="fn">add</span>(a, b) {',         id:'L1' },
      { html: '  <span class="ret">return</span> a <span class="op">+</span> b;',              id:'L2' },
      { html: '}',                                                                             id:'L3' },
      { html: '',                                                                              id:'L4' },
      { html: '<span class="kw">function</span> <span class="fn">multiply</span>(x, y) {',    id:'L5' },
      { html: '  <span class="kw">const</span> sum <span class="op">=</span> <span class="fn">add</span>(x, y);', id:'L6' },
      { html: '  <span class="ret">return</span> x <span class="op">*</span> sum;',            id:'L7' },
      { html: '}',                                                                             id:'L8' },
      { html: '',                                                                              id:'L9' },
      { html: '<span class="kw">function</span> <span class="fn">compute</span>() {',          id:'L10'},
      { html: '  <span class="kw">const</span> m <span class="op">=</span> <span class="fn">multiply</span>(<span class="num">3</span>, <span class="num">4</span>);', id:'L11'},
      { html: '  <span class="ret">return</span> m <span class="op">+</span> <span class="num">10</span>;', id:'L12'},
      { html: '}',                                                                             id:'L13'},
      { html: '',                                                                              id:'L14'},
      { html: '<span class="fn">compute</span>();  <span class="cmt">// → 31</span>',          id:'L15'},
    ],
    steps: [
      { line:'L15', push:{ fn:'compute',  args:'(no args)',  scope:{},         ret:null }, log:{type:'push', msg:'CALL compute()'} },
      { line:'L11', push:{ fn:'multiply', args:'x=3, y=4',  scope:{x:3,y:4},  ret:null }, log:{type:'push', msg:'CALL multiply(3, 4)'} },
      { line:'L6',  push:{ fn:'add',      args:'a=3, b=4',  scope:{a:3,b:4},  ret:null }, log:{type:'push', msg:'CALL add(3, 4)'} },
      { line:'L2',  info:'a + b = 7', log:{type:'exec', msg:'Evaluate: 3 + 4 = 7'} },
      { line:'L2',  pop:true, retVal:'7',  log:{type:'ret', msg:'RETURN 7'} },
      { line:'L7',  info:'sum = 7 → x * sum = 3 * 7', log:{type:'exec', msg:'sum = 7;  x * sum = 21'} },
      { line:'L7',  pop:true, retVal:'21', log:{type:'ret', msg:'RETURN 21'} },
      { line:'L12', info:'m = 21 → m + 10 = 31', log:{type:'exec', msg:'m = 21;  m + 10 = 31'} },
      { line:'L12', pop:true, retVal:'31', log:{type:'ret', msg:'RETURN 31  ✓'} },
      { line:'L15', info:'Result: 31', log:{type:'exec', msg:'Stack fully unwound — result: 31'} },
    ]
  },

  // ── 4. Closure & Scope ──────────────────────
  closure: {
    title: 'Closure & Scope',
    code: [
      { html: '<span class="kw">function</span> <span class="fn">makeCounter</span>(start) {', id:'L1' },
      { html: '  <span class="kw">let</span> count <span class="op">=</span> start;',           id:'L2' },
      { html: '  <span class="kw">function</span> <span class="fn">increment</span>() {',       id:'L3' },
      { html: '    count<span class="op">++</span>;',                                          id:'L4' },
      { html: '    <span class="ret">return</span> count;',                                    id:'L5' },
      { html: '  }',                                                                           id:'L6' },
      { html: '  <span class="ret">return</span> increment;',                                  id:'L7' },
      { html: '}',                                                                             id:'L8' },
      { html: '',                                                                              id:'L9' },
      { html: '<span class="kw">const</span> counter <span class="op">=</span> <span class="fn">makeCounter</span>(<span class="num">0</span>);', id:'L10'},
      { html: '<span class="fn">counter</span>(); <span class="cmt">// 1</span>',              id:'L11'},
      { html: '<span class="fn">counter</span>(); <span class="cmt">// 2</span>',              id:'L12'},
      { html: '<span class="fn">counter</span>(); <span class="cmt">// 3</span>',              id:'L13'},
    ],
    steps: [
      { line:'L10', push:{ fn:'makeCounter', args:'start = 0', scope:{start:0, count:0}, ret:null }, log:{type:'push', msg:'CALL makeCounter(0)'} },
      { line:'L2',  info:'count = 0 (created in closure scope)', log:{type:'exec', msg:'let count = 0  — captured in closure'} },
      { line:'L7',  info:'Returns increment function (keeps closure reference)', log:{type:'exec', msg:'Return reference to increment()'} },
      { line:'L7',  pop:true, retVal:'[Function: increment]', log:{type:'ret', msg:'RETURN fn — closure over {count}'} },
      { line:'L11', push:{ fn:'increment', args:'(closure: count=0)', scope:{'⬤ count':0}, ret:null }, log:{type:'push', msg:'CALL counter()  [1st time]'} },
      { line:'L4',  info:'count++ → count = 1', log:{type:'exec', msg:'count++ → count is now 1'} },
      { line:'L5',  pop:true, retVal:'1', log:{type:'ret', msg:'RETURN 1  (closed-over count)'} },
      { line:'L12', push:{ fn:'increment', args:'(closure: count=1)', scope:{'⬤ count':1}, ret:null }, log:{type:'push', msg:'CALL counter()  [2nd time]'} },
      { line:'L4',  info:'count++ → count = 2', log:{type:'exec', msg:'count++ → count is now 2'} },
      { line:'L5',  pop:true, retVal:'2', log:{type:'ret', msg:'RETURN 2'} },
      { line:'L13', push:{ fn:'increment', args:'(closure: count=2)', scope:{'⬤ count':2}, ret:null }, log:{type:'push', msg:'CALL counter()  [3rd time]'} },
      { line:'L4',  info:'count++ → count = 3', log:{type:'exec', msg:'count++ → count is now 3'} },
      { line:'L5',  pop:true, retVal:'3', log:{type:'ret', msg:'RETURN 3  ✓ Closure persists!'} },
    ]
  }
};

// ─────────────────────────────────────────────
//  DEBUGGER ENGINE
// ─────────────────────────────────────────────
class DebuggerEngine {
  constructor() {
    // State
    this.scenario     = null;
    this.stepIndex    = -1;
    this.callStack    = [];     // array of { fn, args, scope, color, depth }
    this.playing      = false;
    this.playTimer    = null;
    this.speed        = 900;
    this.stepCount    = 0;

    // DOM refs
    this.codeBlock      = document.getElementById('codeBlock');
    this.stackFrames    = document.getElementById('stackFrames');
    this.logScroll      = document.getElementById('logScroll');
    this.logEmpty       = document.getElementById('logEmpty');
    this.stackDepthBadge= document.getElementById('stackDepthBadge');
    this.currentFnBadge = document.getElementById('currentFnBadge');
    this.tlProgress     = document.getElementById('tlProgress');
    this.tlThumb        = document.getElementById('tlThumb');
    this.tlSteps        = document.getElementById('tlSteps');
    this.returnToast    = document.getElementById('returnToast');
    this.btnPlay        = document.getElementById('btnPlay');
    this.btnNext        = document.getElementById('btnNext');
    this.btnPrev        = document.getElementById('btnPrev');
    this.btnReset       = document.getElementById('btnReset');
    this.scenarioPicker = document.getElementById('scenarioPicker');
    this.speedSlider    = document.getElementById('speedSlider');
    this.speedLabel     = document.getElementById('speedLabel');

    this.bindEvents();
    this.loadScenario('factorial');
  }

  // ── Event wiring ─────────────────────────────
  bindEvents() {
    this.btnPlay.addEventListener('click', () => this.togglePlay());
    this.btnNext.addEventListener('click', () => this.stepForward());
    this.btnPrev.addEventListener('click', () => this.stepBack());
    this.btnReset.addEventListener('click', () => this.reset());
    this.scenarioPicker.addEventListener('change', e => this.loadScenario(e.target.value));
    document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
    this.speedSlider.addEventListener('input', e => {
      // Slider max=2000 → fast. We invert so right = fast
      this.speed = 2200 - parseInt(e.target.value);
      const mult = (2200 - this.speed) / 1000;
      this.speedLabel.textContent = mult.toFixed(1) + '×';
    });
    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); this.stepForward(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.stepBack(); }
      if (e.key === 'Enter')      this.togglePlay();
      if (e.key === 'r' || e.key === 'R') this.reset();
    });
  }

  // ── Load / Reset ─────────────────────────────
  loadScenario(key) {
    this.scenario   = SCENARIOS[key];
    this.reset();
  }

  reset() {
    this.stopPlay();
    this.stepIndex  = -1;
    this.callStack  = [];
    this.stepCount  = 0;

    this.renderCode();
    this.renderStack();
    this.renderTimeline();
    this.clearLog();
    this.updateBadges();
    this.updateButtons();
    this.addLog('info', '⏳', `Scenario loaded: ${this.scenario.title} — press STEP or PLAY`);
  }

  // ── Code Rendering ────────────────────────────
  renderCode() {
    this.codeBlock.innerHTML = '';
    this.scenario.code.forEach((l, i) => {
      const span = document.createElement('span');
      span.className   = 'code-line';
      span.dataset.id  = l.id;
      span.dataset.ln  = String(i + 1).padStart(2, ' ');
      span.innerHTML   = l.html || '&nbsp;';
      this.codeBlock.appendChild(span);
    });
  }

  highlightLine(lineId) {
    document.querySelectorAll('.code-line').forEach(el => {
      el.classList.remove('active', 'dimmed');
      el.classList.add('dimmed');
    });
    if (!lineId) return;
    const target = document.querySelector(`.code-line[data-id="${lineId}"]`);
    if (target) {
      target.classList.remove('dimmed');
      target.classList.add('active');
      target.scrollIntoView({ block:'nearest', behavior:'smooth' });
    }
  }

  // ── Stack Rendering ───────────────────────────
  renderStack() {
    this.stackFrames.innerHTML = '';
    this.callStack.forEach((frame, i) => {
      this.stackFrames.appendChild(this.buildFrameEl(frame, i));
    });
  }

  buildFrameEl(frame, i) {
    const isTop = i === this.callStack.length - 1;
    const col   = cssVar(frame.colorVar);
    const div   = document.createElement('div');
    div.className = 'frame';
    div.style.borderLeftColor = col;
    div.style.boxShadow = `0 0 8px ${col}22, inset 0 0 20px ${col}06`;
    div.dataset.frameId = frame.id;

    const topLabel = isTop
      ? `<span class="frame-top-label" style="background:${col}22;color:${col};border:1px solid ${col}44">TOP</span>`
      : '';

    const scopeHtml = Object.entries(frame.scope)
      .map(([k,v]) => `<span><strong>${k}:</strong> ${v}</span>`)
      .join('');

    div.innerHTML = `
      ${topLabel}
      <div class="frame-fn" style="color:${col}">${frame.fn}()</div>
      <div class="frame-args">${frame.args}</div>
      <div class="frame-meta">
        <span><strong>depth:</strong> ${frame.depth}</span>
        ${scopeHtml}
      </div>
    `;
    return div;
  }

  // ── Timeline ──────────────────────────────────
  renderTimeline() {
    const total = this.scenario.steps.length;
    const pct   = total > 1 ? (Math.max(0, this.stepIndex) / (total - 1)) * 100 : 0;
    this.tlProgress.style.width  = pct + '%';
    this.tlThumb.style.left      = pct + '%';

    // Draw step markers once
    if (this.stepIndex <= 0) {
      this.tlSteps.innerHTML = '';
      this.scenario.steps.forEach((_, i) => {
        const m = document.createElement('div');
        m.className = 'tl-step-marker';
        m.style.left = ((i / Math.max(1, total - 1)) * 100) + '%';
        this.tlSteps.appendChild(m);
      });
    }
  }

  // ── Log ───────────────────────────────────────
  addLog(type, icon, msg) {
    this.logEmpty.style.display = 'none';
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const ts = String(this.stepCount).padStart(3, '0');
    entry.innerHTML = `
      <span class="log-ts">#${ts}</span>
      <span class="log-icon">${icon}</span>
      <span class="log-msg">${msg}</span>
    `;
    this.logScroll.appendChild(entry);
    this.logScroll.scrollTop = this.logScroll.scrollHeight;
  }

  clearLog() {
    this.logScroll.innerHTML = '';
    this.logScroll.appendChild(this.logEmpty);
    this.logEmpty.style.display = '';
  }

  // ── Badges ────────────────────────────────────
  updateBadges() {
    this.stackDepthBadge.textContent = `depth: ${this.callStack.length}`;
    const top = this.callStack[this.callStack.length - 1];
    this.currentFnBadge.textContent  = top ? top.fn + '()' : '—';
  }

  updateButtons() {
    const total = this.scenario.steps.length;
    this.btnPrev.disabled = this.stepIndex <= 0;
    this.btnNext.disabled = this.stepIndex >= total - 1;
  }

  // ── Toast ─────────────────────────────────────
  showReturnToast(val) {
    this.returnToast.textContent = `↩ RETURN  ${val}`;
    this.returnToast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.returnToast.classList.remove('show'), 1600);
  }

  // ── Playback ──────────────────────────────────
  togglePlay() {
    if (this.playing) { this.stopPlay(); }
    else               { this.startPlay(); }
  }

  startPlay() {
    if (this.stepIndex >= this.scenario.steps.length - 1) this.reset();
    this.playing = true;
    this.btnPlay.textContent = '⏸ PAUSE';
    this.btnPlay.classList.add('playing');
    this.scheduleNext();
  }

  stopPlay() {
    this.playing = false;
    this.btnPlay.textContent = '▶ PLAY';
    this.btnPlay.classList.remove('playing');
    clearTimeout(this.playTimer);
  }

  scheduleNext() {
    this.playTimer = setTimeout(() => {
      if (!this.playing) return;
      const hasMore = this.stepForward();
      if (hasMore && this.stepIndex < this.scenario.steps.length - 1) {
        this.scheduleNext();
      } else {
        this.stopPlay();
      }
    }, this.speed);
  }

  // ── Core Step Logic ───────────────────────────
  stepForward() {
    if (this.stepIndex >= this.scenario.steps.length - 1) return false;
    this.stepIndex++;
    this.stepCount++;
    this.applyStep(this.scenario.steps[this.stepIndex]);
    this.renderTimeline();
    this.updateButtons();
    return true;
  }

  stepBack() {
    if (this.stepIndex <= 0) {
      this.reset();
      return;
    }
    // Replay from scratch up to stepIndex - 1
    const target = this.stepIndex - 1;
    this.callStack = [];
    this.stepIndex  = -1;
    this.stepCount  = 0;
    this.clearLog();
    for (let i = 0; i <= target; i++) {
      this.stepIndex = i;
      this.stepCount++;
      this.applyStepSilent(this.scenario.steps[i]);
    }
    // Re-render final state
    const step = this.scenario.steps[this.stepIndex];
    this.highlightLine(step.line);
    if (step.log) {
      const icons = { push:'📥', pop:'📤', exec:'⚙️', ret:'✅', info:'ℹ️' };
      this.addLog(step.log.type, icons[step.log.type] || '•', step.log.msg);
    }
    this.renderStack();
    this.updateBadges();
    this.renderTimeline();
    this.updateButtons();
  }

  // Apply step with full rendering
  applyStep(step) {
    this.highlightLine(step.line);

    if (step.push) {
      const colVar = PALETTE[this.callStack.length % PALETTE.length];
      const frame = {
        id: Date.now() + Math.random(),
        fn:       step.push.fn,
        args:     step.push.args,
        scope:    step.push.scope || {},
        depth:    this.callStack.length + 1,
        colorVar: colVar
      };
      this.callStack.push(frame);
      this.renderStack();
      this.addLog('push', '📥', step.log.msg);
    } else if (step.pop) {
      const popped = this.callStack.pop();
      // Animate the departing frame
      const el = this.stackFrames.lastElementChild;
      if (el) {
        el.classList.add('popping');
        setTimeout(() => el.remove(), 280);
      }
      this.addLog('pop', '📤', step.log.msg);
      if (step.retVal !== undefined) this.showReturnToast(step.retVal);
    } else if (step.info) {
      this.addLog('exec', '⚙️', step.log ? step.log.msg : step.info);
    } else if (step.log) {
      const icons = { push:'📥', pop:'📤', exec:'⚙️', ret:'✅', info:'ℹ️' };
      this.addLog(step.log.type, icons[step.log.type] || '•', step.log.msg);
    }

    this.updateBadges();
  }

  // Silent version for replay (no animation/toast)
  applyStepSilent(step) {
    if (step.push) {
      const colVar = PALETTE[this.callStack.length % PALETTE.length];
      this.callStack.push({
        id: Date.now() + Math.random(),
        fn:       step.push.fn,
        args:     step.push.args,
        scope:    step.push.scope || {},
        depth:    this.callStack.length + 1,
        colorVar: colVar
      });
    } else if (step.pop) {
      this.callStack.pop();
    }
  }
}

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.chronostack = new DebuggerEngine();
});