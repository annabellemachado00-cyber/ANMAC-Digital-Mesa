const svgNS = "http://www.w3.org/2000/svg";

const stage = document.getElementById("stage");
const stageWrap = document.getElementById("stageWrap");
const shapeLayer = document.getElementById("shapeLayer");
const drawLayer = document.getElementById("drawLayer");
const labelLayer = document.getElementById("labelLayer");
const previewMeasure = document.getElementById("previewMeasure");
const imgLayer = document.getElementById("imgLayer");
const notesLayer = document.getElementById("notesLayer");
const tooltip = document.getElementById("tooltip");
const meterTip = document.getElementById("meterTip");
const miniBar = document.getElementById("miniBar");
const noteEditor = document.getElementById("noteEditor");
const noteContent = document.getElementById("noteContent");

const pxPerCmInput = document.getElementById("pxPerCm");
const exprInput = document.getElementById("expr");
const exprOut = document.getElementById("exprOut");
const lineStyleSelect = document.getElementById("lineStyle");
const textInput = document.getElementById("pieceText");
const textColorInput = document.getElementById("textColor");
const textSizeInput = document.getElementById("textSize");
const btnNotes = document.getElementById("btnNotes");
const btnPreview = document.getElementById("btnPreview");
const previewOverlay = document.getElementById("previewOverlay");
const previewHolder = previewOverlay.querySelector(".preview-holder");

let uidCounter = 1;
let noteSaveTimer = null;

const state = {
  tool: "line",
  pxPerCm: parseFloat(pxPerCmInput.value) || 10,
  zoom: 1,
  pendingLine: null,
  pendingMeasure: null,
  pendingCurve: [],
  freeDrawing: null,
  history: [],
  future: [],
  selection: null,
  selectionType: null,
  noteMode: false,
  activeNote: null,
  draggingNote: null,
  noteOffset: { x: 0, y: 0 },
  pointCounter: 1
};

const lineStyles = {
  solid: "",
  dash: "8 6",
  dot: "2 4",
  dashdot: "12 6 2 6",
  slash: "1 12"
};

function nextId(prefix = "shape") {
  return `${prefix}-${uidCounter++}`;
}

function setTool(tool) {
  state.tool = tool;
  document.querySelectorAll(".tool").forEach((btn) => {
    btn.classList.toggle("primary", btn.dataset.tool === tool);
    btn.classList.toggle("active", btn.dataset.tool === tool);
  });
  if (tool !== "line") {
    state.pendingLine = null;
    clearPreview();
  }
  if (tool !== "measure") {
    state.pendingMeasure = null;
    clearPreview();
  }
  if (tool !== "curve") {
    state.pendingCurve = [];
    clearPreview();
  }
  if (tool !== "free" && state.freeDrawing) {
    finalizeFreePath();
  }
  showTooltip(`Herramienta: ${toolLabel(tool)}`);
}

function toolLabel(tool) {
  const map = {
    select: "Selección",
    point: "Punto",
    midpoint: "Punto medio",
    line: "Línea",
    measure: "Medición",
    curve: "Curva",
    base: "Rectángulo base",
    circleR: "Círculo radio",
    free: "Trazo libre"
  };
  return map[tool] || tool;
}

function showTooltip(text, point) {
  tooltip.textContent = text;
  if (point) {
    tooltip.style.left = `${point.x}px`;
    tooltip.style.top = `${point.y}px`;
  }
  tooltip.classList.add("show");
  setTimeout(() => tooltip.classList.remove("show"), 1600);
}

function showMeter(text, point) {
  meterTip.textContent = text;
  meterTip.style.left = `${point.x}px`;
  meterTip.style.top = `${point.y}px`;
  meterTip.classList.add("show");
}

function hideMeter() {
  meterTip.classList.remove("show");
}

function getSVGPoint(evt) {
  const pt = stage.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = stage.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgP = pt.matrixTransform(ctm.inverse());
  return { x: svgP.x, y: svgP.y };
}

function bindShape(shape) {
  if (!shape.dataset.id) {
    shape.dataset.id = nextId();
  }
  shape.classList.add("shape");
  shape.addEventListener("pointerdown", (evt) => {
    evt.stopPropagation();
    if (state.tool !== "select" && state.tool !== "measure") {
      // allow selecting even if another tool is active via modifier
      if (!evt.metaKey && !evt.ctrlKey) {
        return;
      }
    }
    selectShape(shape.dataset.id, "shape");
  });
}

function bindAllShapes() {
  shapeLayer.querySelectorAll(".shape").forEach(bindShape);
}

function bindAllNotes() {
  notesLayer.querySelectorAll(".note").forEach((note) => {
    if (!note.dataset.id) {
      note.dataset.id = nextId("note");
    }
    note.addEventListener("pointerdown", notePointerDown);
  });
}

function selectShape(id, type = "shape") {
  clearSelection();
  state.selection = id;
  state.selectionType = type;
  if (type === "shape") {
    const node = shapeLayer.querySelector(`[data-id="${id}"]`);
    if (node) {
      node.classList.add("selected");
      updateMiniBar(node);
      updateLabelInputs(node);
    }
  } else if (type === "note") {
    const note = notesLayer.querySelector(`[data-id="${id}"]`);
    if (note) {
      note.classList.add("selected");
      updateMiniBar(note);
    }
  }
}

function clearSelection() {
  state.selection = null;
  state.selectionType = null;
  shapeLayer.querySelectorAll(".shape.selected").forEach((el) => el.classList.remove("selected"));
  notesLayer.querySelectorAll(".note.selected").forEach((el) => el.classList.remove("selected"));
  miniBar.classList.add("hidden");
}

function updateMiniBar(node) {
  const rect = node.getBoundingClientRect();
  const stageRect = stageWrap.getBoundingClientRect();
  miniBar.style.left = `${rect.left - stageRect.left + rect.width / 2}px`;
  miniBar.style.top = `${rect.top - stageRect.top - 36}px`;
  miniBar.classList.remove("hidden");
}

function updateLabelInputs(node) {
  const label = labelLayer.querySelector(`[data-for="${node.dataset.id}"]`);
  if (label) {
    textInput.value = label.textContent || "";
    textColorInput.value = rgbToHex(label.getAttribute("fill") || "#333333");
    textSizeInput.value = parseInt(label.getAttribute("font-size") || "16", 10);
  } else {
    textInput.value = "";
  }
}

function rgbToHex(color) {
  if (!color || color.startsWith("#")) return color || "#333333";
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

function createSVGElement(tag, attrs = {}) {
  const el = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      el.setAttribute(key, value);
    }
  });
  return el;
}

function createPoint(x, y, opts = {}) {
  const id = nextId();
  const g = createSVGElement("g");
  g.dataset.id = id;
  g.dataset.type = opts.type || "point";
  const circle = createSVGElement("circle", { cx: x, cy: y, r: 6, fill: "white", stroke: "#222", "stroke-width": 2 });
  const label = createSVGElement("text", { x, y: y - 12, "text-anchor": "middle", "font-size": 14, fill: "#222" });
  const text = opts.label || `${opts.type === "midpoint" ? "M" : "P"}${state.pointCounter++}`;
  label.textContent = text;
  g.append(circle, label);
  bindShape(g);
  shapeLayer.appendChild(g);
  g.addEventListener("dblclick", () => {
    const newText = prompt("Etiqueta del punto", label.textContent);
    if (newText !== null) {
      label.textContent = newText;
    }
  });
  selectShape(id);
  pushHistory();
  return g;
}

function createLine(x1, y1, x2, y2, opts = {}) {
  const id = nextId();
  const g = createSVGElement("g");
  g.dataset.id = id;
  g.dataset.type = opts.type || "line";
  const line = createSVGElement("line", {
    x1,
    y1,
    x2,
    y2,
    stroke: opts.stroke || "#222",
    "stroke-width": opts.strokeWidth || 2,
    "marker-end": opts.arrow ? "url(#arrowSmall)" : undefined,
    "marker-start": opts.arrow ? "url(#arrowSmall)" : undefined,
    "stroke-dasharray": opts.dash || ""
  });
  g.append(line);
  bindShape(g);
  shapeLayer.appendChild(g);
  selectShape(id);
  if (opts.measure) {
    addMeasureLabel(g);
  }
  pushHistory();
  return g;
}

function addMeasureLabel(group) {
  const line = group.querySelector("line");
  if (!line) return;
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));
  const x2 = parseFloat(line.getAttribute("x2"));
  const y2 = parseFloat(line.getAttribute("y2"));
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const lengthPx = Math.hypot(x2 - x1, y2 - y1);
  const lengthCm = lengthPx / state.pxPerCm;
  let label = group.querySelector("text");
  if (!label) {
    label = createSVGElement("text", {
      x: midX,
      y: midY - 10,
      "text-anchor": "middle",
      class: "measure-label"
    });
    group.appendChild(label);
  } else {
    label.setAttribute("x", midX);
    label.setAttribute("y", midY - 10);
  }
  label.textContent = `${lengthCm.toFixed(2)} cm`;
}

function createRect(x, y, width, height) {
  const id = nextId();
  const g = createSVGElement("g");
  g.dataset.id = id;
  g.dataset.type = "rect";
  const rect = createSVGElement("rect", {
    x,
    y,
    width,
    height,
    fill: "rgba(122, 134, 203, 0.12)",
    stroke: "#2c2c34",
    "stroke-width": 2
  });
  g.append(rect);
  bindShape(g);
  shapeLayer.appendChild(g);
  selectShape(id);
  pushHistory();
  return g;
}

function createCircle(x, y, r) {
  const id = nextId();
  const g = createSVGElement("g");
  g.dataset.id = id;
  g.dataset.type = "circle";
  const circle = createSVGElement("circle", {
    cx: x,
    cy: y,
    r,
    fill: "transparent",
    stroke: "#2c2c34",
    "stroke-width": 2
  });
  g.append(circle);
  bindShape(g);
  shapeLayer.appendChild(g);
  selectShape(id);
  pushHistory();
  return g;
}

function createCurve(points) {
  if (points.length !== 4) return;
  const id = nextId();
  const g = createSVGElement("g");
  g.dataset.id = id;
  g.dataset.type = "curve";
  const [p0, p1, p2, p3] = points;
  const path = createSVGElement("path", {
    d: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
    fill: "transparent",
    stroke: "#2c2c34",
    "stroke-width": 2
  });
  g.append(path);
  bindShape(g);
  shapeLayer.appendChild(g);
  selectShape(id);
  pushHistory();
}

function startFreePath(point) {
  const id = nextId();
  const path = createSVGElement("path", {
    d: `M ${point.x} ${point.y}`,
    class: "free-path"
  });
  drawLayer.appendChild(path);
  state.freeDrawing = { id, path, points: [point] };
}

function appendFreePath(point) {
  if (!state.freeDrawing) return;
  const { path, points } = state.freeDrawing;
  points.push(point);
  const d = points.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
  path.setAttribute("d", d);
}

function finalizeFreePath() {
  if (!state.freeDrawing) return;
  const { path } = state.freeDrawing;
  const id = nextId();
  const g = createSVGElement("g");
  g.dataset.id = id;
  g.dataset.type = "free";
  const clone = path.cloneNode();
  clone.classList.remove("free-path");
  clone.setAttribute("stroke", "#2c2c34");
  clone.setAttribute("stroke-width", 2);
  clone.setAttribute("fill", "none");
  g.append(clone);
  bindShape(g);
  shapeLayer.appendChild(g);
  drawLayer.removeChild(path);
  state.freeDrawing = null;
  selectShape(id);
  pushHistory();
}

function clearPreview() {
  previewMeasure.innerHTML = "";
  hideMeter();
}

function handleStagePointerDown(evt) {
  const point = getSVGPoint(evt);
  if (state.noteMode) {
    createNoteAt(evt.clientX, evt.clientY);
    return;
  }

  switch (state.tool) {
    case "select":
      clearSelection();
      break;
    case "point":
      createPoint(point.x, point.y);
      break;
    case "midpoint":
      createMidpoint();
      break;
    case "line":
      handleLineStart(point);
      break;
    case "measure":
      handleMeasureStart(point);
      break;
    case "base":
      createBaseRect(point);
      break;
    case "circleR":
      handleCircle(point);
      break;
    case "curve":
      handleCurve(point);
      break;
    case "free":
      startFreePath(point);
      stage.addEventListener("pointermove", handleStagePointerMove);
      stage.addEventListener("pointerup", handleStagePointerUp);
      break;
    default:
      break;
  }
}

function handleStagePointerMove(evt) {
  const point = getSVGPoint(evt);
  if (state.tool === "line" && state.pendingLine) {
    drawPreviewLine(state.pendingLine, point);
  } else if (state.tool === "measure" && state.pendingMeasure) {
    drawPreviewMeasure(state.pendingMeasure, point, evt.clientX, evt.clientY);
  } else if (state.tool === "curve" && state.pendingCurve.length) {
    drawPreviewCurve(point);
  } else if (state.tool === "free" && state.freeDrawing) {
    appendFreePath(point);
  }
}

function handleStagePointerUp() {
  if (state.tool === "free") {
    finalizeFreePath();
    stage.removeEventListener("pointermove", handleStagePointerMove);
    stage.removeEventListener("pointerup", handleStagePointerUp);
  }
}

function handleLineStart(point) {
  if (!state.pendingLine) {
    state.pendingLine = point;
    drawPreviewLine(point, point);
  } else {
    createLine(state.pendingLine.x, state.pendingLine.y, point.x, point.y);
    state.pendingLine = null;
    clearPreview();
  }
}

function handleMeasureStart(point) {
  if (!state.pendingMeasure) {
    state.pendingMeasure = point;
    drawPreviewMeasure(point, point, 0, 0);
  } else {
    const group = createLine(state.pendingMeasure.x, state.pendingMeasure.y, point.x, point.y, {
      type: "measure",
      measure: true,
      stroke: "#3a7bd5"
    });
    addMeasureLabel(group);
    state.pendingMeasure = null;
    clearPreview();
  }
}

function drawPreviewLine(start, end) {
  previewMeasure.innerHTML = "";
  const line = createSVGElement("line", {
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
    class: "preview-line"
  });
  previewMeasure.appendChild(line);
}

function drawPreviewMeasure(start, end, clientX, clientY) {
  drawPreviewLine(start, end);
  const lengthPx = Math.hypot(end.x - start.x, end.y - start.y);
  const lengthCm = lengthPx / state.pxPerCm;
  showMeter(`${lengthCm.toFixed(2)} cm`, { x: clientX, y: clientY });
}

function handleCurve(point) {
  state.pendingCurve.push(point);
  if (state.pendingCurve.length === 4) {
    createCurve(state.pendingCurve);
    state.pendingCurve = [];
    clearPreview();
  } else {
    drawPreviewCurve(point);
  }
}

function drawPreviewCurve(point) {
  const points = [...state.pendingCurve, point];
  previewMeasure.innerHTML = "";
  if (points.length < 2) return;
  const path = createSVGElement("path", { class: "preview-path" });
  if (points.length === 2) {
    path.setAttribute("d", `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`);
  } else if (points.length === 3) {
    path.setAttribute("d", `M ${points[0].x} ${points[0].y} Q ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y}`);
  } else {
    const [p0, p1, p2, p3] = points;
    path.setAttribute("d", `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`);
  }
  previewMeasure.appendChild(path);
}

function createBaseRect(point) {
  const widthCm = prompt("Ancho (cm)", "40");
  if (widthCm === null) return;
  const heightCm = prompt("Alto (cm)", "50");
  if (heightCm === null) return;
  const widthPx = parseFloat(widthCm) * state.pxPerCm;
  const heightPx = parseFloat(heightCm) * state.pxPerCm;
  if (Number.isNaN(widthPx) || Number.isNaN(heightPx)) return;
  createRect(point.x, point.y, widthPx, heightPx);
}

function handleCircle(point) {
  const radioCm = prompt("Radio (cm)", "10");
  if (radioCm === null) return;
  const radiusPx = parseFloat(radioCm) * state.pxPerCm;
  if (Number.isNaN(radiusPx)) return;
  createCircle(point.x, point.y, radiusPx);
}

function createMidpoint() {
  if (!state.selection || state.selectionType !== "shape") {
    showTooltip("Selecciona una línea primero");
    return;
  }
  const group = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
  if (!group) return;
  const line = group.querySelector("line");
  if (!line) {
    showTooltip("La selección debe ser una línea");
    return;
  }
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));
  const x2 = parseFloat(line.getAttribute("x2"));
  const y2 = parseFloat(line.getAttribute("y2"));
  createPoint((x1 + x2) / 2, (y1 + y2) / 2, { type: "midpoint", label: "M" });
}

function createNoteAt(clientX, clientY) {
  const stageRect = stageWrap.getBoundingClientRect();
  const scale = state.zoom || 1;
  const baseX = (clientX - stageRect.left) / scale;
  const baseY = (clientY - stageRect.top) / scale;
  const note = document.createElement("div");
  note.className = "note";
  note.dataset.id = nextId("note");
  note.dataset.baseX = baseX;
  note.dataset.baseY = baseY;
  note.style.left = `${baseX}px`;
  note.style.top = `${baseY}px`;
  note.style.transform = "translate(-50%, -50%)";
  note.innerHTML = "Nueva nota";
  note.addEventListener("pointerdown", notePointerDown);
  notesLayer.appendChild(note);
  selectShape(note.dataset.id, "note");
  openNoteEditor(note);
  pushHistory();
}

function notePointerDown(evt) {
  evt.stopPropagation();
  const note = evt.currentTarget;
  selectShape(note.dataset.id, "note");
  if (state.noteMode) {
    openNoteEditor(note);
  }
  state.draggingNote = note;
  const rect = note.getBoundingClientRect();
  const scale = state.zoom || 1;
  state.noteOffset = {
    x: (evt.clientX - rect.left) / scale,
    y: (evt.clientY - rect.top) / scale
  };
  document.addEventListener("pointermove", notePointerMove);
  document.addEventListener("pointerup", notePointerUp);
}

function notePointerMove(evt) {
  if (!state.draggingNote) return;
  evt.preventDefault();
  const stageRect = stageWrap.getBoundingClientRect();
  const scale = state.zoom || 1;
  const x = (evt.clientX - stageRect.left) / scale - state.noteOffset.x;
  const y = (evt.clientY - stageRect.top) / scale - state.noteOffset.y;
  state.draggingNote.style.left = `${x}px`;
  state.draggingNote.style.top = `${y}px`;
  state.draggingNote.dataset.baseX = x;
  state.draggingNote.dataset.baseY = y;
}

function notePointerUp() {
  if (state.draggingNote) {
    pushHistory();
  }
  state.draggingNote = null;
  document.removeEventListener("pointermove", notePointerMove);
  document.removeEventListener("pointerup", notePointerUp);
}

function openNoteEditor(note) {
  state.activeNote = note;
  noteContent.innerHTML = note.innerHTML;
  noteEditor.classList.remove("hidden");
}

function closeNoteEditor() {
  if (state.activeNote) {
    state.activeNote.innerHTML = noteContent.innerHTML;
  }
  if (noteSaveTimer) {
    clearTimeout(noteSaveTimer);
    noteSaveTimer = null;
    pushHistory();
  }
  state.activeNote = null;
  noteEditor.classList.add("hidden");
}

function applyNoteChanges() {
  if (!state.activeNote) return;
  state.activeNote.innerHTML = noteContent.innerHTML;
  if (noteSaveTimer) clearTimeout(noteSaveTimer);
  noteSaveTimer = setTimeout(() => {
    pushHistory();
    noteSaveTimer = null;
  }, 300);
}

function updatePxPerCm() {
  const value = parseFloat(pxPerCmInput.value);
  if (Number.isNaN(value) || value <= 0) return;
  state.pxPerCm = value;
  shapeLayer.querySelectorAll("g[data-type='measure']").forEach(addMeasureLabel);
}

function zoom(delta) {
  state.zoom = Math.min(3, Math.max(0.3, state.zoom * delta));
  stageWrap.style.setProperty("--stage-scale", state.zoom.toFixed(2));
}

function zoomFit() {
  state.zoom = 1;
  stageWrap.style.setProperty("--stage-scale", "1");
}

function applyLabel() {
  if (!state.selection || state.selectionType !== "shape") return;
  const node = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
  if (!node) return;
  const bbox = node.getBBox();
  let label = labelLayer.querySelector(`[data-for="${state.selection}"]`);
  if (!label) {
    label = createSVGElement("text", {
      class: "label-text",
      "text-anchor": "middle"
    });
    label.dataset.for = state.selection;
    labelLayer.appendChild(label);
  }
  label.textContent = textInput.value;
  label.setAttribute("fill", textColorInput.value);
  label.setAttribute("font-size", textSizeInput.value);
  label.setAttribute("x", bbox.x + bbox.width / 2);
  label.setAttribute("y", bbox.y + bbox.height / 2);
  pushHistory();
}

function updateLabelPositionForShape(id) {
  const node = shapeLayer.querySelector(`[data-id="${id}"]`);
  const label = labelLayer.querySelector(`[data-for="${id}"]`);
  if (!node || !label) return;
  const bbox = node.getBBox();
  label.setAttribute("x", bbox.x + bbox.width / 2);
  label.setAttribute("y", bbox.y + bbox.height / 2);
}

function applyLineStyle() {
  if (!state.selection || state.selectionType !== "shape") return;
  const node = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
  if (!node) return;
  const dash = lineStyles[lineStyleSelect.value] || "";
  node.querySelectorAll("line, path, rect, circle").forEach((el) => {
    if (dash) {
      el.setAttribute("stroke-dasharray", dash);
    } else {
      el.removeAttribute("stroke-dasharray");
    }
  });
  pushHistory();
}

function evaluateExpr() {
  const expr = exprInput.value.trim();
  if (!expr) return;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    if (Number.isFinite(result)) {
      exprOut.textContent = `${result.toFixed(2)}`;
    } else {
      exprOut.textContent = "—";
    }
  } catch (error) {
    exprOut.textContent = "Err";
  }
}

function serializeState() {
  return JSON.stringify({
    shape: shapeLayer.innerHTML,
    draw: drawLayer.innerHTML,
    label: labelLayer.innerHTML,
    img: imgLayer.innerHTML,
    notes: notesLayer.innerHTML,
    pxPerCm: state.pxPerCm
  });
}

function restoreState(snapshot) {
  if (!snapshot) return;
  try {
    const data = JSON.parse(snapshot);
    shapeLayer.innerHTML = data.shape || "";
    drawLayer.innerHTML = data.draw || "";
    labelLayer.innerHTML = data.label || "";
    imgLayer.innerHTML = data.img || "";
    notesLayer.innerHTML = data.notes || "";
    if (data.pxPerCm) {
      state.pxPerCm = data.pxPerCm;
      pxPerCmInput.value = data.pxPerCm;
    }
    bindAllShapes();
    bindAllNotes();
    const points = shapeLayer.querySelectorAll("g[data-type='point'], g[data-type='midpoint']").length;
    state.pointCounter = points + 1;
  } catch (error) {
    console.error("No se pudo restaurar", error);
  }
}

function pushHistory() {
  const snapshot = serializeState();
  if (state.history.length && state.history[state.history.length - 1] === snapshot) {
    return;
  }
  state.history.push(snapshot);
  if (state.history.length > 60) {
    state.history.shift();
  }
  state.future = [];
}

function undo() {
  if (state.history.length < 2) return;
  const current = state.history.pop();
  state.future.push(current);
  const previous = state.history[state.history.length - 1];
  restoreState(previous);
  clearSelection();
}

function redo() {
  if (!state.future.length) return;
  const snapshot = state.future.pop();
  state.history.push(snapshot);
  restoreState(snapshot);
  clearSelection();
}

function deleteSelection() {
  if (!state.selection) return;
  if (state.selectionType === "shape") {
    const node = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
    if (node) node.remove();
    const label = labelLayer.querySelector(`[data-for="${state.selection}"]`);
    if (label) label.remove();
  } else if (state.selectionType === "note") {
    const note = notesLayer.querySelector(`[data-id="${state.selection}"]`);
    if (note) note.remove();
  }
  clearSelection();
  pushHistory();
}

function duplicateSelection() {
  if (!state.selection || state.selectionType !== "shape") return;
  const node = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
  if (!node) return;
  const clone = node.cloneNode(true);
  clone.dataset.id = nextId();
  const transform = clone.getAttribute("transform") || "";
  clone.setAttribute("transform", `${transform} translate(30 30)`.trim());
  bindShape(clone);
  shapeLayer.appendChild(clone);
  const label = labelLayer.querySelector(`[data-for="${state.selection}"]`);
  if (label) {
    const clonedLabel = label.cloneNode(true);
    clonedLabel.dataset.for = clone.dataset.id;
    labelLayer.appendChild(clonedLabel);
    updateLabelPositionForShape(clone.dataset.id);
  }
  selectShape(clone.dataset.id);
  pushHistory();
}

function rotateSelection() {
  if (!state.selection || state.selectionType !== "shape") return;
  const node = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
  if (!node) return;
  const bbox = node.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const transform = node.getAttribute("transform") || "";
  node.setAttribute("transform", `${transform} rotate(15 ${cx} ${cy})`.trim());
  updateLabelPositionForShape(state.selection);
  pushHistory();
}

function moveSelection() {
  if (!state.selection) return;
  const dxCm = prompt("Desplazar en X (cm)", "1");
  if (dxCm === null) return;
  const dyCm = prompt("Desplazar en Y (cm)", "1");
  if (dyCm === null) return;
  const dx = parseFloat(dxCm) * state.pxPerCm;
  const dy = parseFloat(dyCm) * state.pxPerCm;
  if (Number.isNaN(dx) || Number.isNaN(dy)) return;
  if (state.selectionType === "shape") {
    const node = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
    if (!node) return;
    const transform = node.getAttribute("transform") || "";
    node.setAttribute("transform", `${transform} translate(${dx} ${dy})`.trim());
    updateLabelPositionForShape(state.selection);
  } else if (state.selectionType === "note") {
    const note = notesLayer.querySelector(`[data-id="${state.selection}"]`);
    if (!note) return;
    const left = parseFloat(note.dataset.baseX || note.style.left || 0);
    const top = parseFloat(note.dataset.baseY || note.style.top || 0);
    const newX = left + dx;
    const newY = top + dy;
    note.dataset.baseX = newX;
    note.dataset.baseY = newY;
    note.style.left = `${newX}px`;
    note.style.top = `${newY}px`;
  }
  pushHistory();
}

function createDart() {
  if (!state.selection || state.selectionType !== "shape") return;
  const group = shapeLayer.querySelector(`[data-id="${state.selection}"]`);
  if (!group) return;
  const line = group.querySelector("line");
  if (!line) {
    showTooltip("Selecciona una línea base para la pinza");
    return;
  }
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));
  const x2 = parseFloat(line.getAttribute("x2"));
  const y2 = parseFloat(line.getAttribute("y2"));
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  const length = Math.hypot(x2 - x1, y2 - y1);
  const normal = { x: -(y2 - y1) / length, y: (x2 - x1) / length };
  const depth = Math.min(80, length * 0.2);
  const p1 = { x: mid.x + normal.x * depth, y: mid.y + normal.y * depth };
  const path = createSVGElement("path", {
    d: `M ${x1} ${y1} L ${p1.x} ${p1.y} L ${x2} ${y2}`,
    stroke: "#d64550",
    "stroke-width": 2,
    fill: "rgba(214,69,80,0.18)"
  });
  const container = createSVGElement("g");
  container.dataset.id = nextId();
  container.dataset.type = "dart";
  container.append(path);
  bindShape(container);
  shapeLayer.appendChild(container);
  selectShape(container.dataset.id);
  pushHistory();
}

function toggleGrid(evt) {
  if (evt.target.checked) {
    stageWrap.classList.add("grid-on");
    stageWrap.classList.remove("grid-off");
  } else {
    stageWrap.classList.remove("grid-on");
    stageWrap.classList.add("grid-off");
  }
}

function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = () => {
    imgLayer.innerHTML = "";
    const image = createSVGElement("image", {
      href: reader.result,
      x: 0,
      y: 0,
      width: 2000,
      height: 1000,
      opacity: document.getElementById("imgOpacity").value
    });
    imgLayer.appendChild(image);
    pushHistory();
  };
  reader.readAsDataURL(file);
}

function updateImageOpacity(value) {
  const image = imgLayer.querySelector("image");
  if (image) {
    image.setAttribute("opacity", value);
  }
}

function clearAll() {
  if (!confirm("¿Borrar toda la mesa?")) return;
  shapeLayer.innerHTML = "";
  drawLayer.innerHTML = "";
  labelLayer.innerHTML = "";
  previewMeasure.innerHTML = "";
  imgLayer.innerHTML = "";
  notesLayer.innerHTML = "";
  clearSelection();
  pushHistory();
}

function toggleNotes() {
  state.noteMode = !state.noteMode;
  btnNotes.classList.toggle("primary", state.noteMode);
  if (!state.noteMode) {
    closeNoteEditor();
  } else {
    showTooltip("Haz clic en la mesa para colocar una nota");
  }
}

function openPreview() {
  previewHolder.innerHTML = "";
  const clone = stage.cloneNode(true);
  clone.removeAttribute("style");
  clone.setAttribute("viewBox", stage.getAttribute("viewBox"));
  previewHolder.appendChild(clone);
  previewOverlay.classList.remove("hidden");
}

function closePreview() {
  previewOverlay.classList.add("hidden");
  previewHolder.innerHTML = "";
}

function miniBarAction(action) {
  switch (action) {
    case "move":
      moveSelection();
      break;
    case "rot":
      rotateSelection();
      break;
    case "dup":
      duplicateSelection();
      break;
    case "del":
      deleteSelection();
      break;
    default:
      break;
  }
}

function initHistory() {
  pushHistory();
}

// Event bindings

document.querySelectorAll(".tool").forEach((btn) => {
  btn.addEventListener("click", () => setTool(btn.dataset.tool));
});

stage.addEventListener("pointerdown", handleStagePointerDown);
stage.addEventListener("pointermove", handleStagePointerMove);
stage.addEventListener("pointerup", handleStagePointerUp);

document.getElementById("zoomIn").addEventListener("click", () => zoom(1.2));
document.getElementById("zoomOut").addEventListener("click", () => zoom(0.8));
document.getElementById("zoomFit").addEventListener("click", zoomFit);
document.getElementById("undo").addEventListener("click", undo);
document.getElementById("redo").addEventListener("click", redo);

document.getElementById("applyLabel").addEventListener("click", applyLabel);
document.getElementById("applyLineStyle").addEventListener("click", applyLineStyle);
document.getElementById("evalBtn").addEventListener("click", evaluateExpr);
pxPerCmInput.addEventListener("change", updatePxPerCm);

document.getElementById("btnDelete").addEventListener("click", deleteSelection);
document.getElementById("btnDuplicate").addEventListener("click", duplicateSelection);
document.getElementById("btnRotate").addEventListener("click", rotateSelection);
document.getElementById("btnMove").addEventListener("click", moveSelection);
document.getElementById("btnDart").addEventListener("click", createDart);

document.getElementById("btnClearAll").addEventListener("click", clearAll);
document.getElementById("gridToggle").addEventListener("change", toggleGrid);

btnNotes.addEventListener("click", toggleNotes);
btnPreview.addEventListener("click", openPreview);
document.getElementById("exitPreview").addEventListener("click", closePreview);

miniBar.addEventListener("click", (evt) => {
  const action = evt.target.dataset.act;
  if (action) {
    miniBarAction(action);
  }
});

noteEditor.addEventListener("input", applyNoteChanges);
noteEditor.querySelectorAll("button[data-cmd]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.execCommand(btn.dataset.cmd, false, null);
    applyNoteChanges();
  });
});
noteEditor.querySelectorAll("button[data-block]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.execCommand("formatBlock", false, btn.dataset.block);
    applyNoteChanges();
  });
});

document.getElementById("noteClose").addEventListener("click", () => {
  closeNoteEditor();
});

document.getElementById("noteDelete").addEventListener("click", () => {
  if (state.activeNote) {
    state.activeNote.remove();
    closeNoteEditor();
    pushHistory();
  }
});

document.getElementById("openImg").addEventListener("click", () => {
  document.getElementById("imgFile").click();
});

document.getElementById("imgFile").addEventListener("change", (evt) => {
  const file = evt.target.files?.[0];
  if (file) handleImageUpload(file);
  evt.target.value = "";
});

document.getElementById("imgOpacity").addEventListener("input", (evt) => {
  updateImageOpacity(evt.target.value);
});

document.addEventListener("keydown", (evt) => {
  if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === "z") {
    evt.preventDefault();
    undo();
  } else if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === "y") {
    evt.preventDefault();
    redo();
  } else if (evt.key === "Delete") {
    deleteSelection();
  }
});

notesLayer.addEventListener("dblclick", (evt) => {
  const note = evt.target.closest(".note");
  if (note) {
    openNoteEditor(note);
  }
});

previewOverlay.addEventListener("click", (evt) => {
  if (evt.target === previewOverlay) {
    closePreview();
  }
});

initHistory();
bindAllShapes();
bindAllNotes();
setTool("line");
