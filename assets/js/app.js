const template = `
  <div class="topbar" role="toolbar" aria-label="Barra de herramientas principal">
    <div class="group" role="group" aria-label="Control de imagen">
      <button class="btn icon" id="openImg" data-tip="Agregar imagen (transparente)" type="button">🖼️</button>
      <input type="file" id="imgFile" accept="image/*" hidden />
      <label class="badge" for="imgOpacity" style="margin-left:6px">Opacidad img
        <input id="imgOpacity" class="opacity" type="range" min="0" max="1" step="0.05" value="0.35" />
      </label>
    </div>

    <div class="group" role="group" aria-label="Zoom y edición">
      <button class="btn icon" id="zoomIn" data-tip="Acercar" type="button">＋</button>
      <button class="btn icon" id="zoomOut" data-tip="Alejar" type="button">－</button>
      <button class="btn icon" id="zoomFit" data-tip="Ajustar" type="button">⤢</button>
      <button class="btn icon" id="undo" data-tip="Deshacer" type="button">⤺</button>
      <button class="btn icon" id="redo" data-tip="Rehacer" type="button">⤻</button>
    </div>

    <div class="group" role="group" aria-label="Configuración de grilla">
      <label class="badge">
        <input id="gridToggle" type="checkbox" checked /> Grilla
      </label>
      <label class="badge" for="pxPerCm">px/cm
        <input id="pxPerCm" type="number" value="10" min="1" step="0.1" style="width:70px" />
      </label>
    </div>

    <div class="group" role="group" aria-label="Acciones rápidas">
      <button class="btn" id="btnPreview" data-tip="Previsualización" type="button">👁️ Previsualizar</button>
      <button class="btn" id="btnNotes" data-tip="Colocar nota (clic en mesa)" type="button">🗒️ Notas</button>
      <button class="btn danger" id="btnClearAll" data-tip="Borrar todo" type="button">Borrar Todo</button>
    </div>
  </div>

  <aside class="sidebar" aria-label="Caja de herramientas">
    <div class="title">Caja de Herramientas</div>
    <div class="tool-card stack">
      <div class="label">Selección</div>
      <div class="bar">
        <button class="btn icon tool" data-tool="select" data-tip="Seleccionar/Mover" type="button">🖱️</button>
      </div>

      <div class="label">Punto / Línea</div>
      <div class="bar">
        <button class="btn icon tool" data-tool="point" data-tip="Punto" type="button">●</button>
        <button class="btn icon tool" data-tool="pointLine" data-tip="Marcas sobre línea (intervalo 0 = una sola)" type="button">●—</button>
        <button class="btn icon tool" data-tool="bisector" data-tip="Bisectriz (A, B, C)" type="button">∠</button>
        <button class="btn icon tool primary" data-tool="line" data-tip="Línea (2 clics)" type="button">—</button>
        <button class="btn icon tool" data-tool="measure" data-tip="Medir (deja línea + texto offset)" type="button">📏</button>
      </div>

      <div class="label">Figuras</div>
      <div class="bar">
        <button class="btn icon tool" data-tool="rect" data-tip="Rectángulo" type="button">▭</button>
        <button class="btn icon tool" data-tool="circle" data-tip="Círculo" type="button">◯</button>
        <button class="btn icon tool" data-tool="triangle" data-tip="Triángulo" type="button">△</button>
        <button class="btn icon tool" data-tool="free" data-tip="Forma libre (doble clic para fijar)" type="button">✎</button>
      </div>

      <div class="label">Operaciones</div>
      <div class="bar">
        <button class="btn icon" id="btnRotate" data-tip="Rotar 15°" type="button">⟲</button>
        <button class="btn icon" id="btnMove" data-tip="Mover selección" type="button">✥</button>
        <button class="btn icon" id="btnDuplicate" data-tip="Duplicar" type="button">⧉</button>
        <button class="btn icon danger" id="btnDelete" data-tip="Eliminar" type="button">🗑️</button>
      </div>
    </div>
  </aside>

  <main class="stage" aria-label="Mesa de trabajo">
    <div class="stage-wrap grid-on" id="stageWrap">
      <svg id="stage" viewBox="0 0 1600 900" role="img" aria-label="Lienzo de patronaje">
        <defs>
          <style>
            .preview-line{stroke:#a67bf2;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:0 10;fill:none}
            .preview-path{stroke:#a67bf2;stroke-width:2;fill:none;stroke-dasharray:6 6}
          </style>
        </defs>

        <line id="baseH" x1="80" y1="160" x2="1520" y2="160" stroke="var(--blue)" stroke-width="2" />
        <line id="baseV" x1="120" y1="120" x2="120" y2="840" stroke="var(--red)"  stroke-width="2" />

        <g id="imgLayer"></g>
        <g id="shapeLayer"></g>
        <g id="drawLayer"></g>
        <g id="uiHandles"></g>
        <g id="marksLayer"></g>
        <g id="previewMeasure"></g>
      </svg>

      <div id="tooltip" class="tooltip" role="tooltip"></div>
      <div id="meterTip" class="meter-tip" role="status"></div>

      <div id="noteEditor" class="note-editor hidden" role="dialog" aria-modal="false" aria-label="Editor de nota">
        <div class="note-toolbar" role="toolbar">
          <button data-cmd="bold" title="Negrita" type="button">B</button>
          <button data-cmd="italic" title="Cursiva" type="button"><em>I</em></button>
          <button data-cmd="insertUnorderedList" title="Viñetas" type="button">•</button>
          <button data-cmd="insertOrderedList" title="Numeración" type="button">1.</button>
          <button data-block="h3" title="Título" type="button">H3</button>
          <button data-block="p" title="Párrafo" type="button">P</button>
          <div class="sp" aria-hidden="true"></div>
          <button id="noteDelete" title="Eliminar nota" type="button">🗑️</button>
          <button id="noteClose" title="Cerrar" type="button">✕</button>
        </div>
        <div id="noteContent" class="note-content" contenteditable="true" role="textbox" aria-multiline="true"></div>
      </div>
    </div>
  </main>

  <aside class="rightbar" aria-label="Panel lateral derecho">
    <div class="title">Fórmulas rápidas</div>
    <div class="tool-card stack">
      <div class="row">
        <input id="expr" type="text" placeholder="Ej: $Cintura/4 + 2" aria-label="Expresión" />
        <button class="btn" id="btnVars" data-tip="Mostrar variables" type="button">📋</button>
        <button class="btn primary" id="evalBtn" data-tip="Calcular fórmula" type="button">Calcular</button>
      </div>
      <div id="varsPanel" class="vars hidden"></div>
      <div>Resultado: <strong id="exprOut">—</strong> <span class="label">cm</span></div>
    </div>

    <div class="title">Rotulación</div>
    <div class="tool-card stack">
      <input id="pieceText" type="text" placeholder="Texto de pieza (centrado en selección)" aria-label="Texto de pieza" />
      <div class="row">
        <label class="label" for="textColor">Color</label>
        <input type="color" id="textColor" value="#333333" />
        <label class="label" for="textSize">Tamaño</label>
        <input type="number" id="textSize" value="16" min="8" max="96" style="width:70px" />
      </div>
      <button class="btn" id="applyLabel" data-tip="Aplicar texto a selección" type="button">Aplicar</button>
    </div>

    <div class="title">Estilo de línea</div>
    <div class="tool-card stack">
      <label class="label" for="lineStyle">Estilo</label>
      <select id="lineStyle">
        <option value="solid">Sólida</option>
        <option value="dash">Punteada</option>
        <option value="dot">Puntos</option>
        <option value="dashdot">Guion-punto</option>
        <option value="slash">Slash (corte)</option>
      </select>
      <button class="btn" id="applyLineStyle" type="button">Aplicar estilo</button>
    </div>

    <div class="title">Marcajes / Indicaciones</div>
    <div class="tool-card stack">
      <input id="mkName" type="text" placeholder="Nombre de la pieza (ej: Delantero)" />
      <div class="row">
        <input id="mkCortesTela" type="number" min="0" value="1" style="width:80px" />
        <label class="label" for="mkCortesTela">cortes tela</label>
      </div>
      <div class="row">
        <input id="mkCortesForro" type="number" min="0" value="0" style="width:80px" />
        <label class="label" for="mkCortesForro">cortes forro</label>
      </div>
      <input id="mkTela" type="text" placeholder="Tela (opcional)" />
      <input id="mkForro" type="text" placeholder="Forro (opcional)" />
      <textarea id="mkObs" rows="3" placeholder="Indicaciones (cortar toda la línea / sin desprender / al hilo / al sesgo, etc.)"></textarea>
      <button class="btn" id="mkPlace" type="button">Colocar marcaje (clic en mesa)</button>
    </div>
  </aside>

  <div id="previewOverlay" class="overlay hidden" role="dialog" aria-modal="true" aria-label="Vista previa">
    <button class="btn exit-prev" id="exitPreview" type="button">Salir</button>
    <div class="preview-holder" role="presentation"></div>
  </div>

  <div id="toast" class="toast" role="status" aria-live="polite"></div>
`;

const mountNode = document.getElementById('app');
mountNode.innerHTML = template;

const state = {
  selected: null,
  activeTool: 'line',
  startPoint: null,
  previewLine: null,
  toolState: null,
  markPlaceArmed: false,
  notes: new Map(),
  currentNoteId: null
};

const dom = {
  stage: document.getElementById('stage'),
  wrap: document.getElementById('stageWrap'),
  tooltip: document.getElementById('tooltip'),
  meterTip: document.getElementById('meterTip'),
  pxPerCm: document.getElementById('pxPerCm'),
  toast: document.getElementById('toast'),
  noteEditor: document.getElementById('noteEditor'),
  noteContent: document.getElementById('noteContent')
};

const layers = {};

function refreshLayers() {
  layers.img = document.getElementById('imgLayer');
  layers.shapes = document.getElementById('shapeLayer');
  layers.draw = document.getElementById('drawLayer');
  layers.ui = document.getElementById('uiHandles');
  layers.marks = document.getElementById('marksLayer');
  layers.preview = document.getElementById('previewMeasure');
}

refreshLayers();

const MEASUREMENTS = {
  $Busto: 88,
  $Cintura: 66,
  $Cadera: 92,
  $LargoTalle: 42
};

class HistoryStack {
  constructor(stage, onChange) {
    this.stage = stage;
    this.undoStack = [];
    this.redoStack = [];
    this.pending = null;
    this.onChange = onChange;
  }

  snapshot() {
    return this.stage.innerHTML;
  }

  begin() {
    this.pending = this.snapshot();
  }

  finalize() {
    if (!this.pending) return;
    const current = this.snapshot();
    if (current !== this.pending) {
      this.undoStack.push(this.pending);
      this.redoStack.length = 0;
      this.onChange?.(this);
    }
    this.pending = null;
  }

  record(mutator) {
    this.begin();
    mutator();
    this.finalize();
  }

  undo() {
    if (!this.undoStack.length) return false;
    const current = this.snapshot();
    const previous = this.undoStack.pop();
    this.redoStack.push(current);
    this.stage.innerHTML = previous;
    refreshLayers();
    this.onChange?.(this);
    return true;
  }

  redo() {
    if (!this.redoStack.length) return false;
    const current = this.snapshot();
    const next = this.redoStack.pop();
    this.undoStack.push(current);
    this.stage.innerHTML = next;
    refreshLayers();
    this.onChange?.(this);
    return true;
  }
}

const history = new HistoryStack(dom.stage, updateUndoRedoButtons);

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undo');
  const redoBtn = document.getElementById('redo');
  undoBtn.disabled = history.undoStack.length === 0;
  redoBtn.disabled = history.redoStack.length === 0;
}

updateUndoRedoButtons();

function notify(message, variant = 'info') {
  const toast = dom.toast;
  toast.textContent = message;
  toast.dataset.variant = variant;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

function pxPerCm() {
  return Math.max(1, parseFloat(dom.pxPerCm.value) || 10);
}

function svgPointFromEvent(event) {
  const point = dom.stage.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(dom.stage.getScreenCTM().inverse());
}

function make(tag, attrs, parent = layers.draw) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  (parent || layers.draw).appendChild(el);
  return el;
}

function toggleGrid() {
  const px = pxPerCm();
  dom.wrap.style.setProperty('--cell-px', `${px}px`);
  dom.wrap.style.setProperty('--cell', `${px}px`);
  const gridEnabled = document.getElementById('gridToggle').checked;
  dom.wrap.classList.toggle('grid-on', gridEnabled);
}

function handleGridToggleChange() {
  toggleGrid();
  const enabled = document.getElementById('gridToggle').checked;
  notify(`Grilla ${enabled ? 'activada' : 'desactivada'}.`, 'info');
}

document.getElementById('gridToggle').addEventListener('change', handleGridToggleChange);
dom.pxPerCm.addEventListener('input', () => {
  toggleGrid();
});
toggleGrid();

function setupTooltips() {
  document.querySelectorAll('[data-tip]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      dom.tooltip.textContent = el.dataset.tip;
      dom.tooltip.style.display = 'block';
    });
    el.addEventListener('mousemove', (event) => {
      dom.tooltip.style.left = `${event.clientX}px`;
      dom.tooltip.style.top = `${event.clientY - 14}px`;
    });
    el.addEventListener('mouseleave', () => {
      dom.tooltip.style.display = 'none';
    });
  });
}

setupTooltips();

function setActiveTool(tool, button) {
  state.activeTool = tool;
  document.querySelectorAll('.tool').forEach((btn) => btn.classList.remove('primary'));
  button?.classList.add('primary');
  const drawingTools = ['line', 'rect', 'circle', 'triangle', 'free', 'measure', 'pointLine', 'bisector'];
  document.body.classList.toggle('drawing', drawingTools.includes(tool));
  layers.ui.innerHTML = '';
}

Array.from(document.querySelectorAll('.tool')).forEach((button) => {
  button.addEventListener('click', () => setActiveTool(button.dataset.tool, button));
});

function beginPreview(point) {
  state.previewLine = make('line', { x1: point.x, y1: point.y, x2: point.x, y2: point.y }, layers.draw);
  state.previewLine.classList.add('preview-line');
  dom.meterTip.style.display = 'block';
}

function updatePreview(point, clientX, clientY) {
  if (!state.previewLine) return;
  const x1 = +state.previewLine.getAttribute('x1');
  const y1 = +state.previewLine.getAttribute('y1');
  state.previewLine.setAttribute('x2', point.x);
  state.previewLine.setAttribute('y2', point.y);
  const cmLen = (Math.hypot(point.x - x1, point.y - y1) / pxPerCm()).toFixed(1);
  dom.meterTip.textContent = `${cmLen} cm`;
  dom.meterTip.style.left = `${clientX}px`;
  dom.meterTip.style.top = `${clientY - 22}px`;
}

function endPreview() {
  state.previewLine?.remove();
  state.previewLine = null;
  dom.meterTip.style.display = 'none';
}

function select(element) {
  state.selected = element;
  layers.ui.innerHTML = '';
  if (!element) return;
  if (element.getAttribute('data-type') === 'line') {
    const handleOne = make('circle', { cx: +element.dataset.x1, cy: +element.dataset.y1, r: 7, class: 'handle' }, layers.ui);
    const handleTwo = make('circle', { cx: +element.dataset.x2, cy: +element.dataset.y2, r: 7, class: 'handle' }, layers.ui);
    let activeHandle = null;

    const moveHandle = (event) => {
      if (!activeHandle) return;
      const point = svgPointFromEvent(event);
      if (activeHandle === handleOne) {
        element.dataset.x1 = point.x;
        element.dataset.y1 = point.y;
      } else {
        element.dataset.x2 = point.x;
        element.dataset.y2 = point.y;
      }
      const line = element.querySelector('line');
      line.setAttribute('x1', element.dataset.x1);
      line.setAttribute('y1', element.dataset.y1);
      line.setAttribute('x2', element.dataset.x2);
      line.setAttribute('y2', element.dataset.y2);
      handleOne.setAttribute('cx', element.dataset.x1);
      handleOne.setAttribute('cy', element.dataset.y1);
      handleTwo.setAttribute('cx', element.dataset.x2);
      handleTwo.setAttribute('cy', element.dataset.y2);
    };

    const stopMove = () => {
      if (!activeHandle) return;
      activeHandle = null;
      history.finalize();
      window.removeEventListener('mousemove', moveHandle);
      window.removeEventListener('mouseup', stopMove);
    };

    [handleOne, handleTwo].forEach((handle) => {
      handle.addEventListener('mousedown', () => {
        history.begin();
        activeHandle = handle;
        window.addEventListener('mousemove', moveHandle);
        window.addEventListener('mouseup', stopMove);
      });
    });
  }
}

function createFinalLine(a, b) {
  history.record(() => {
    const group = make('g', { 'data-type': 'line', 'data-x1': a.x, 'data-y1': a.y, 'data-x2': b.x, 'data-y2': b.y }, layers.draw);
    make('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'final-line' }, group);
    make('circle', { cx: a.x, cy: a.y, r: 3, class: 'endpoint' }, group);
    make('circle', { cx: b.x, cy: b.y, r: 3, class: 'endpoint' }, group);
    select(group);
  });
}

function placeMeasure(a, b) {
  history.record(() => {
    const group = make('g', { 'data-type': 'measure' }, layers.preview);
    make('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'measure-line' }, group);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const nx = -uy;
    const ny = ux;
    const tick = 8;
    make('line', { x1: a.x - nx * tick, y1: a.y - ny * tick, x2: a.x + nx * tick, y2: a.y + ny * tick, class: 'measure-end' }, group);
    make('line', { x1: b.x - nx * tick, y1: b.y - ny * tick, x2: b.x + nx * tick, y2: b.y + ny * tick, class: 'measure-end' }, group);
    const midx = (a.x + b.x) / 2;
    const midy = (a.y + b.y) / 2;
    const offset = 14;
    const label = make('text', { x: midx + nx * offset, y: midy + ny * offset, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'measure-text' }, group);
    label.textContent = `${(length / pxPerCm()).toFixed(1)} cm`;
  });
}

function findNearestPoint(clientX, clientY, radiusPx = 12) {
  const nodes = [...dom.stage.querySelectorAll('circle.endpoint, circle.point-node')];
  const point = dom.stage.createSVGPoint();
  let best = null;
  let bestDistance = Infinity;
  let bestSvg = null;
  nodes.forEach((node) => {
    const cx = +node.getAttribute('cx');
    const cy = +node.getAttribute('cy');
    point.x = cx;
    point.y = cy;
    const screenPoint = point.matrixTransform(node.getCTM());
    const distance = Math.hypot(screenPoint.x - clientX, screenPoint.y - clientY);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = node;
      bestSvg = { x: cx, y: cy };
    }
  });
  return best && bestDistance <= radiusPx ? { svg: bestSvg } : null;
}
function closestLineGroup(px, py) {
  const groups = [...layers.draw.querySelectorAll('[data-type="line"]')];
  let best = null;
  let bestDistance = Infinity;
  groups.forEach((group) => {
    const x1 = +group.dataset.x1;
    const y1 = +group.dataset.y1;
    const x2 = +group.dataset.x2;
    const y2 = +group.dataset.y2;
    const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2 || 1;
    const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lengthSquared;
    const clamped = Math.max(0, Math.min(1, t));
    const qx = x1 + (x2 - x1) * clamped;
    const qy = y1 + (y2 - y1) * clamped;
    const distanceSquared = (qx - px) ** 2 + (qy - py) ** 2;
    if (distanceSquared < bestDistance) {
      bestDistance = distanceSquared;
      best = group;
    }
  });
  return best;
}

function previewShape(kind, a, b) {
  const shared = { fill: 'none', stroke: '#a67bf2', 'stroke-width': 2, 'stroke-dasharray': '6 6' };
  if (kind === 'rect') {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const width = Math.abs(b.x - a.x);
    const height = Math.abs(b.y - a.y);
    return make('rect', { x, y, width, height, ...shared }, layers.shapes);
  }
  if (kind === 'circle') {
    const r = Math.hypot(b.x - a.x, b.y - a.y);
    return make('circle', { cx: a.x, cy: a.y, r, ...shared }, layers.shapes);
  }
  if (kind === 'triangle') {
    const x1 = a.x;
    const y1 = b.y;
    const x2 = (a.x + b.x) / 2;
    const y2 = a.y;
    const x3 = b.x;
    const y3 = b.y;
    return make('polygon', { points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`, ...shared }, layers.shapes);
  }
  if (kind === 'free') {
    return make('polyline', { points: `${a.x},${a.y}`, ...shared, 'stroke-dasharray': '4 4' }, layers.shapes);
  }
  return null;
}

function finalizeShape(kind, a, b, tmp) {
  history.record(() => {
    tmp?.remove();
    const shared = { fill: 'none', stroke: '#8e8e8e', 'stroke-width': 2 };
    const group = make('g', { 'data-type': 'shape' }, layers.shapes);
    if (kind === 'rect') {
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const width = Math.abs(b.x - a.x);
      const height = Math.abs(b.y - a.y);
      make('rect', { x, y, width, height, ...shared }, group);
    } else if (kind === 'circle') {
      make('circle', { cx: a.x, cy: a.y, r: Math.hypot(b.x - a.x, b.y - a.y), ...shared }, group);
    } else if (kind === 'triangle') {
      const x1 = a.x;
      const y1 = b.y;
      const x2 = (a.x + b.x) / 2;
      const y2 = a.y;
      const x3 = b.x;
      const y3 = b.y;
      make('polygon', { points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`, ...shared }, group);
    } else if (kind === 'free') {
      make('polyline', { points: state.toolState.points.map((p) => `${p.x},${p.y}`).join(' '), ...shared }, group);
    }
    select(group);
  });
}

function placeMarkCardAt(container, clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const card = document.createElement('div');
  card.className = 'mark-card';
  card.style.left = `${clientX - rect.left}px`;
  card.style.top = `${clientY - rect.top}px`;
  const data = collectMarkForm();
  card.innerHTML = renderMarkHTML(data);
  enableCardDrag(card);
  container.appendChild(card);
  card.addEventListener('dblclick', () => {
    const updated = collectMarkForm();
    card.innerHTML = renderMarkHTML(updated);
  });
  notify('Marcaje colocado.', 'success');
}

function collectMarkForm() {
  return {
    name: (document.getElementById('mkName').value || '').trim(),
    ct: +document.getElementById('mkCortesTela').value || 0,
    cf: +document.getElementById('mkCortesForro').value || 0,
    tela: (document.getElementById('mkTela').value || '').trim(),
    forro: (document.getElementById('mkForro').value || '').trim(),
    obs: (document.getElementById('mkObs').value || '').trim()
  };
}

function renderMarkHTML(mark) {
  const lines = [];
  if (mark.name) lines.push(`<h4>${escapeHTML(mark.name)}</h4>`);
  lines.push(`<p>• Cortes tela: <strong>${mark.ct}</strong></p>`);
  lines.push(`<p>• Cortes forro: <strong>${mark.cf}</strong></p>`);
  if (mark.tela) lines.push(`<p class="small">Tela: ${escapeHTML(mark.tela)}</p>`);
  if (mark.forro) lines.push(`<p class="small">Forro: ${escapeHTML(mark.forro)}</p>`);
  if (mark.obs) lines.push(`<p>${escapeHTML(mark.obs).replace(/\n/g, '<br>')}</p>`);
  return lines.join('');
}

function escapeHTML(text) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, (char) => entities[char] || char);
}

function enableCardDrag(card) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  const move = (event) => {
    if (!dragging) return;
    const rect = dom.wrap.getBoundingClientRect();
    card.style.left = `${event.clientX - rect.left - offsetX}px`;
    card.style.top = `${event.clientY - rect.top - offsetY}px`;
  };
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stop);
  };
  card.addEventListener('mousedown', (event) => {
    dragging = true;
    card.classList.add('dragging');
    offsetX = event.offsetX;
    offsetY = event.offsetY;
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    event.preventDefault();
  });
}

function enablePinDrag(pin) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  const move = (event) => {
    if (!dragging) return;
    const rect = dom.wrap.getBoundingClientRect();
    const x = event.clientX - rect.left - offsetX;
    const y = event.clientY - rect.top - offsetY;
    pin.style.left = `${x}px`;
    pin.style.top = `${y}px`;
    const note = state.notes.get(pin.dataset.id);
    if (note) {
      note.x = x;
      note.y = y;
    }
  };
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    pin.classList.remove('dragging');
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stop);
  };
  pin.addEventListener('mousedown', (event) => {
    dragging = true;
    pin.classList.add('dragging');
    offsetX = event.offsetX;
    offsetY = event.offsetY;
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    event.preventDefault();
  });
}

function openNoteEditor(id, pin) {
  state.currentNoteId = id;
  const note = state.notes.get(id) || { x: 0, y: 0, html: '' };
  dom.noteContent.innerHTML = note.html || '<p></p>';
  const wrapRect = dom.wrap.getBoundingClientRect();
  const pinRect = pin.getBoundingClientRect();
  dom.noteEditor.style.left = `${pinRect.left - wrapRect.left + 26}px`;
  dom.noteEditor.style.top = `${pinRect.top - wrapRect.top - 6}px`;
  dom.noteEditor.classList.remove('hidden');
  dom.noteContent.focus();
}

function placeNotePin(clientX, clientY) {
  const wrapRect = dom.wrap.getBoundingClientRect();
  const id = `n${Date.now()}`;
  const pin = document.createElement('div');
  pin.className = 'note-pin';
  pin.textContent = '🗒️';
  pin.dataset.id = id;
  const x = clientX - wrapRect.left - 11;
  const y = clientY - wrapRect.top - 11;
  pin.style.left = `${x}px`;
  pin.style.top = `${y}px`;
  dom.wrap.appendChild(pin);
  state.notes.set(id, { x, y, html: '' });
  enablePinDrag(pin);
  pin.addEventListener('click', () => openNoteEditor(id, pin));
  notify('Nota colocada. Haz clic para editar.', 'success');
}

function withNoteContentSaved(callback) {
  if (state.currentNoteId) {
    const note = state.notes.get(state.currentNoteId);
    if (note) {
      note.html = dom.noteContent.innerHTML;
    }
  }
  callback?.();
}

function applyLabelToSelection() {
  if (!state.selected) {
    notify('Selecciona una pieza o línea.', 'error');
    return;
  }
  const text = (document.getElementById('pieceText').value || '').trim();
  if (!text) return;
  const color = document.getElementById('textColor').value;
  const size = +document.getElementById('textSize').value || 16;
  history.record(() => {
    const bbox = state.selected.getBBox();
    state.selected.querySelector('.piece-label')?.remove();
    const label = make('text', {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': size,
      'font-family': 'Inter',
      fill: color,
      class: 'piece-label'
    }, state.selected);
    label.textContent = text;
  });
  notify('Rotulación aplicada.', 'success');
}

function applyLineStyle(style) {
  if (!state.selected || state.selected.getAttribute('data-type') !== 'line') {
    notify('Selecciona una línea para aplicar estilo.', 'error');
    return;
  }
  history.record(() => {
    const line = state.selected.querySelector('line');
    if (!line) return;
    state.selected.querySelector('.slash-style')?.remove();
    line.removeAttribute('stroke-dasharray');
    line.setAttribute('stroke-linecap', 'butt');
    if (style === 'solid') return;
    if (style === 'dash') {
      line.setAttribute('stroke-dasharray', '8 6');
      return;
    }
    if (style === 'dot') {
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-dasharray', '0 8');
      return;
    }
    if (style === 'dashdot') {
      line.setAttribute('stroke-dasharray', '10 6 2 6');
      return;
    }
    if (style === 'slash') {
      const x1 = +state.selected.dataset.x1;
      const y1 = +state.selected.dataset.y1;
      const x2 = +state.selected.dataset.x2;
      const y2 = +state.selected.dataset.y2;
      const length = Math.hypot(x2 - x1, y2 - y1);
      const step = 18;
      const count = Math.max(1, Math.floor(length / step));
      const ux = (x2 - x1) / length;
      const uy = (y2 - y1) / length;
      const nx = -uy;
      const ny = ux;
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'slash-style');
      state.selected.appendChild(group);
      for (let i = 1; i < count; i += 1) {
        const s = i * step;
        const px = x1 + ux * s;
        const py = y1 + uy * s;
        const len = 7;
        const segment = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        segment.setAttribute('x1', px - nx * len);
        segment.setAttribute('y1', py - ny * len);
        segment.setAttribute('x2', px + nx * len);
        segment.setAttribute('y2', py + ny * len);
        segment.setAttribute('stroke', '#8e8e8e');
        segment.setAttribute('stroke-width', '2');
        group.appendChild(segment);
      }
    }
  });
  notify('Estilo de línea aplicado.', 'success');
}

function rotateSelection() {
  if (!state.selected) return;
  history.record(() => {
    const bbox = state.selected.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const current = Number(state.selected.getAttribute('data-rot') || 0);
    const rotation = (current + 15) % 360;
    state.selected.setAttribute('transform', `rotate(${rotation} ${cx} ${cy})`);
    state.selected.setAttribute('data-rot', rotation);
  });
}

function duplicateSelection() {
  if (!state.selected) return;
  history.record(() => {
    const clone = state.selected.cloneNode(true);
    (state.selected.parentNode || layers.draw).appendChild(clone);
    select(clone);
  });
}

function deleteSelection() {
  if (!state.selected) return;
  history.record(() => {
    state.selected.remove();
    select(null);
  });
}

function enableMove() {
  if (!state.selected) return;
  let origin = null;
  const mouseDown = (event) => {
    history.begin();
    origin = svgPointFromEvent(event);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp, { once: true });
  };
  const mouseMove = (event) => {
    if (!origin) return;
    const point = svgPointFromEvent(event);
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    origin = point;
    const transform = dom.stage.createSVGTransform();
    transform.setTranslate(dx, dy);
    state.selected.transform.baseVal.appendItem(transform);
  };
  const mouseUp = () => {
    history.finalize();
    window.removeEventListener('mousemove', mouseMove);
  };
  dom.stage.addEventListener('mousedown', mouseDown, { once: true });
}

document.getElementById('btnRotate').addEventListener('click', rotateSelection);
document.getElementById('btnDuplicate').addEventListener('click', duplicateSelection);
document.getElementById('btnDelete').addEventListener('click', deleteSelection);
document.getElementById('btnMove').addEventListener('click', enableMove);

document.getElementById('applyLabel').addEventListener('click', applyLabelToSelection);
document.getElementById('applyLineStyle').addEventListener('click', () => applyLineStyle(document.getElementById('lineStyle').value));
function attachNoteToolbarActions() {
  document.querySelectorAll('.note-toolbar button[data-cmd]').forEach((button) => {
    button.addEventListener('click', () => document.execCommand(button.dataset.cmd, false, null));
  });
  document.querySelectorAll('.note-toolbar button[data-block]').forEach((button) => {
    button.addEventListener('click', () => document.execCommand('formatBlock', false, button.dataset.block));
  });
  document.getElementById('noteClose').addEventListener('click', () => {
    withNoteContentSaved(() => {
      dom.noteEditor.classList.add('hidden');
      state.currentNoteId = null;
    });
  });
  document.getElementById('noteDelete').addEventListener('click', () => {
    if (!state.currentNoteId) return;
    const pin = [...document.querySelectorAll('.note-pin')].find((node) => node.dataset.id === state.currentNoteId);
    pin?.remove();
    state.notes.delete(state.currentNoteId);
    dom.noteEditor.classList.add('hidden');
    state.currentNoteId = null;
  });
}

attachNoteToolbarActions();

document.getElementById('btnNotes').addEventListener('click', () => {
  notify('Haz clic en la mesa para colocar un pin de nota.', 'info');
  const once = (event) => {
    if (!(event.target === dom.wrap || event.target === dom.stage)) return;
    placeNotePin(event.clientX, event.clientY);
    dom.wrap.removeEventListener('mousedown', once, true);
  };
  dom.wrap.addEventListener('mousedown', once, true);
});

document.getElementById('mkPlace').addEventListener('click', () => {
  notify('Haz clic en la mesa para colocar la tarjeta de marcaje.', 'info');
  state.markPlaceArmed = true;
});

function collectStagePoint(event) {
  return svgPointFromEvent(event);
}

dom.stage.addEventListener('mousedown', (event) => {
  const targetIsStage = event.target.id === 'stage';
  const point = collectStagePoint(event);

  if (state.markPlaceArmed && (event.target === dom.wrap || targetIsStage)) {
    placeMarkCardAt(dom.wrap, event.clientX, event.clientY);
    state.markPlaceArmed = false;
    return;
  }

  if (state.activeTool === 'select') {
    const group = event.target.closest('[data-type]');
    if (group) select(group);
    return;
  }

  if (state.activeTool === 'line' && targetIsStage) {
    if (!state.startPoint) {
      state.startPoint = point;
      beginPreview(point);
    } else {
      const start = state.startPoint;
      endPreview();
      createFinalLine(start, point);
      state.startPoint = null;
    }
    return;
  }

  if (state.activeTool === 'measure' && targetIsStage) {
    if (!state.startPoint) {
      state.startPoint = point;
      beginPreview(point);
    } else {
      const start = state.startPoint;
      endPreview();
      placeMeasure(start, point);
      state.startPoint = null;
    }
    return;
  }

  if (state.activeTool === 'point') {
    const near = findNearestPoint(event.clientX, event.clientY, 12);
    const cx = near ? near.svg.x : point.x;
    const cy = near ? near.svg.y : point.y;
    history.record(() => {
      make('circle', { cx, cy, r: 3, fill: '#6b55b3', class: 'point-node' }, layers.shapes);
    });
    return;
  }

  if (state.activeTool === 'pointLine') {
    let group = event.target.closest('[data-type="line"]');
    if (!group) group = closestLineGroup(point.x, point.y);
    if (!group) {
      notify('No hay líneas cercanas para marcar.', 'error');
      return;
    }
    let d0 = parseFloat(prompt('Distancia de inicio (cm):', '0'));
    if (Number.isNaN(d0) || d0 < 0) d0 = 0;
    let step = parseFloat(prompt('Intervalo (cm) (0 = una sola marca):', '10'));
    if (Number.isNaN(step) || step < 0) step = 0;

    const x1 = +group.dataset.x1;
    const y1 = +group.dataset.y1;
    const x2 = +group.dataset.x2;
    const y2 = +group.dataset.y2;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const cm = pxPerCm();
    let startPx = d0 * cm;
    const stepPx = step * cm;
    if (startPx > length) {
      notify('La distancia inicial supera la longitud de la línea.', 'error');
      return;
    }

    const ux = (x2 - x1) / length;
    const uy = (y2 - y1) / length;
    const nx = -uy;
    const ny = ux;
    const tickLength = 6;

    history.record(() => {
      if (stepPx === 0) {
        const px = x1 + ux * startPx;
        const py = y1 + uy * startPx;
        make('line', { x1: px - nx * tickLength, y1: py - ny * tickLength, x2: px + nx * tickLength, y2: py + ny * tickLength, stroke: '#6b55b3', 'stroke-width': 2 }, group);
      } else {
        for (let s = startPx; s <= length; s += stepPx) {
          const px = x1 + ux * s;
          const py = y1 + uy * s;
          make('line', { x1: px - nx * tickLength, y1: py - ny * tickLength, x2: px + nx * tickLength, y2: py + ny * tickLength, stroke: '#6b55b3', 'stroke-width': 2 }, group);
        }
      }
    });
    return;
  }

  if (state.activeTool === 'bisector') {
    if (!state.toolState) state.toolState = { tool: 'bisector', points: [point] };
    else if (state.toolState.points.length === 1) state.toolState.points.push(point);
    else {
      state.toolState.points.push(point);
      const [A, B, C] = state.toolState.points;
      const u = { x: A.x - B.x, y: A.y - B.y };
      const v = { x: C.x - B.x, y: C.y - B.y };
      const l1 = Math.hypot(u.x, u.y) || 1;
      const l2 = Math.hypot(v.x, v.y) || 1;
      const w = { x: u.x / l1 + v.x / l2, y: u.y / l1 + v.y / l2 };
      const len = 160;
      createFinalLine({ x: B.x, y: B.y }, { x: B.x + w.x * len, y: B.y + w.y * len });
      state.toolState = null;
    }
    return;
  }

  if (['rect', 'circle', 'triangle'].includes(state.activeTool) && targetIsStage) {
    state.toolState = { tool: state.activeTool, a: point, tmp: previewShape(state.activeTool, point, point) };
    return;
  }

  if (state.activeTool === 'free' && targetIsStage) {
    state.toolState = { tool: 'free', points: [point], tmp: previewShape('free', point, point) };
  }
});

dom.stage.addEventListener('mousemove', (event) => {
  const point = collectStagePoint(event);
  if (state.startPoint && ['line', 'measure'].includes(state.activeTool)) {
    updatePreview(point, event.clientX, event.clientY);
    return;
  }
  if (state.toolState && ['rect', 'circle', 'triangle'].includes(state.toolState.tool)) {
    state.toolState.tmp?.remove();
    state.toolState.tmp = previewShape(state.toolState.tool, state.toolState.a, point);
    return;
  }
  if (state.toolState && state.toolState.tool === 'free') {
    state.toolState.points.push(point);
    state.toolState.tmp.setAttribute('points', state.toolState.points.map((p) => `${p.x},${p.y}`).join(' '));
  }
});

dom.stage.addEventListener('mouseup', (event) => {
  if (state.toolState && ['rect', 'circle', 'triangle'].includes(state.toolState.tool)) {
    finalizeShape(state.toolState.tool, state.toolState.a, collectStagePoint(event), state.toolState.tmp);
    state.toolState = null;
  }
});

dom.stage.addEventListener('dblclick', () => {
  if (state.toolState?.tool === 'free') {
    finalizeShape('free', null, null, state.toolState.tmp);
    state.toolState = null;
  }
});

document.getElementById('applyLabel').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') applyLabelToSelection();
});

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    history.record(() => {
      layers.img.innerHTML = '';
      const image = make('image', { href: reader.result, x: 0, y: 0, width: 1600, height: 900, opacity: document.getElementById('imgOpacity').value }, layers.img);
      image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    });
  };
  reader.readAsDataURL(file);
}

document.getElementById('openImg').addEventListener('click', () => document.getElementById('imgFile').click());
document.getElementById('imgFile').addEventListener('change', handleImageUpload);
document.getElementById('imgOpacity').addEventListener('input', (event) => {
  const image = layers.img.querySelector('image');
  if (image) image.setAttribute('opacity', event.target.value);
});

const viewBox = { x: 0, y: 0, w: 1600, h: 900 };
function updateViewBox() {
  dom.stage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}

updateViewBox();

document.getElementById('zoomIn').addEventListener('click', () => {
  viewBox.w /= 1.2;
  viewBox.h /= 1.2;
  updateViewBox();
});

document.getElementById('zoomOut').addEventListener('click', () => {
  viewBox.w *= 1.2;
  viewBox.h *= 1.2;
  updateViewBox();
});

document.getElementById('zoomFit').addEventListener('click', () => {
  viewBox.x = 0;
  viewBox.y = 0;
  viewBox.w = 1600;
  viewBox.h = 900;
  updateViewBox();
});

document.getElementById('undo').addEventListener('click', () => {
  if (history.undo()) {
    select(null);
    notify('Acción deshecha.', 'info');
  }
});

document.getElementById('redo').addEventListener('click', () => {
  if (history.redo()) {
    select(null);
    notify('Acción rehecha.', 'info');
  }
});

document.getElementById('btnPreview').addEventListener('click', () => {
  const overlay = document.getElementById('previewOverlay');
  const holder = overlay.querySelector('.preview-holder');
  overlay.classList.remove('hidden');
  holder.innerHTML = '';
  const clone = dom.stage.cloneNode(true);
  clone.querySelector('#uiHandles')?.remove();
  clone.querySelector('#previewMeasure')?.remove();
  holder.appendChild(clone);
});

document.getElementById('exitPreview').addEventListener('click', () => {
  document.getElementById('previewOverlay').classList.add('hidden');
});

document.getElementById('btnClearAll').addEventListener('click', () => {
  if (!confirm('¿Borrar TODO el lienzo, notas y marcajes?')) return;
  history.record(() => {
    ['imgLayer', 'shapeLayer', 'drawLayer', 'uiHandles', 'marksLayer', 'previewMeasure'].forEach((id) => {
      const layer = document.getElementById(id);
      if (layer) layer.innerHTML = '';
    });
  });
  document.querySelectorAll('.note-pin, .mark-card').forEach((node) => node.remove());
  state.notes.clear();
  state.currentNoteId = null;
  dom.noteEditor.classList.add('hidden');
  notify('Se vació la mesa de trabajo.', 'info');
});

function populateVariables() {
  const panel = document.getElementById('varsPanel');
  if (panel.dataset.filled) return;
  Object.entries(MEASUREMENTS).forEach(([key, value]) => {
    const button = document.createElement('button');
    button.textContent = `${key} = ${value} cm`;
    button.type = 'button';
    button.addEventListener('click', () => {
      const input = document.getElementById('expr');
      const start = input.selectionStart || input.value.length;
      const token = key;
      input.value = `${input.value.slice(0, start)}${token}${input.value.slice(start)}`;
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    });
    panel.appendChild(button);
  });
  panel.dataset.filled = '1';
}

document.getElementById('btnVars').addEventListener('click', () => {
  populateVariables();
  document.getElementById('varsPanel').classList.toggle('hidden');
});

document.getElementById('evalBtn').addEventListener('click', () => {
  const output = document.getElementById('exprOut');
  let expr = (document.getElementById('expr').value || '').trim();
  if (!expr) {
    output.textContent = '—';
    return;
  }
  Object.keys(MEASUREMENTS).forEach((key) => {
    const regex = new RegExp(key.replace(/\$/g, '\\$'), 'g');
    expr = expr.replace(regex, MEASUREMENTS[key]);
  });
  try {
    expr = expr.replace(/([0-9.]+)%/g, '($1/100)');
    const result = Function(`return (${expr})`)();
    output.textContent = Number.isFinite(result) ? Math.round(result * 100) / 100 : 'Error';
  } catch (error) {
    output.textContent = 'Error';
  }
});

updateUndoRedoButtons();
