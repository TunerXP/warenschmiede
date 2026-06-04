'use strict';

const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const KEY = 'ws_cnc_fraesen_einrichtsblatt_plus_v1_0_35_0';
const OLD_KEYS = ['ws_cnc_fraesen_einrichtsblatt_plus_v1_0_34_0','ws_cnc_fraesen_einrichtsblatt_plus_v1_0_33_0','ws_cnc_fraesen_einrichtsblatt_plus_v1_0_32_0','ws_cnc_fraesen_einrichtsblatt_plus_v1_0_31_0','ws_cnc_fraesen_einrichtsblatt_plus_v1_0_30_0','ws_cnc_fraesen_einrichtsblatt_plus_v1_0_29_0','ws_cnc_einrichtblatt_plus_v1_0_28_0','ws_cnc_einrichtblatt_plus_v1_0_27_0','ws_cnc_einrichtblatt_plus_v1_0_24_0','ws_cnc_einrichtblatt_plus_v1_0_23_0','ws_cnc_einrichtblatt_plus_v1_0_22_0','ws_cnc_einrichtblatt_plus_v1_0_21_0','ws_cnc_einrichtblatt_plus_v1_0_20_0','ws_cnc_einrichtblatt_plus_v1_0_19_0','ws_cnc_einrichtblatt_plus_v1_0_18_0','ws_cnc_einrichtblatt_plus_v1_0_17_0','ws_cnc_einrichtblatt_plus_v1_0_16_0','ws_cnc_einrichtblatt_plus_v1_0_15_0','ws_cnc_einrichtblatt_plus_v1_0_14_0','ws_cnc_einrichtblatt_plus_v1_0_13_0','ws_cnc_einrichtblatt_plus_v1_0_12_0','ws_cnc_einrichtblatt_plus_v1_0_11_0','ws_cnc_einrichtblatt_plus_v1_0_10_0','ws_cnc_einrichtblatt_plus_v1_0_9_0','ws_cnc_einrichtblatt_plus_v1_0_8_0','ws_cnc_einrichtblatt_plus_v1_0_7_0','ws_cnc_einrichtblatt_plus_v1_0_6_0','ws_cnc_einrichtblatt_plus_v1_0_5_0','ws_cnc_einrichtblatt_plus_v1_0_4_0','ws_cnc_einrichtblatt_plus_v1_0_3_0','ws_cnc_einrichtblatt_plus_v1_0_2_0'];
const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const jsArg = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/</g, '\\x3c').replace(/>/g, '\\x3e');
const num = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const SNAP_STEP = 1;

const DEFAULT_SETTINGS = {
  companyName: 'Warenschmiede',
  companySub: 'CNC Fräsen-Einrichtsblatt Plus',
  footerNote1: 'Alle Werte prüfen.',
  footerNote2: 'Werkzeughersteller, Maschine und Spannung beachten.',
  footerNote3: 'Nullpunkte vor Start kontrollieren.',
  footerNote4: 'Betriebliche Vorgaben beachten.'
};

let db = cleanDb({});
let selectedShapeId = null;
let selectedShapeIds = new Set();
let drag = null;
let pendingOffsetPreset = null;
let sketchGuides = [];
let shapeClipboard = null;
let edgeMeasureMode = false;
let edgeMeasureFirstId = null;
let edgeMeasureFirstRef = null;
let edgeMeasureHoverRef = null;
let projectMachineFilterMode = null; // null = aktive Maschine, 'all' = alle Maschinen, machineId = gefilterte Maschine

function cleanDb(raw = {}) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const machines = Array.isArray(safe.machines) ? safe.machines : [];
  const projects = Array.isArray(safe.projects) ? safe.projects : [];

  const out = {
    settings: { ...DEFAULT_SETTINGS, ...(safe.settings || {}) },
    machines: machines.map(cleanMachine),
    projects: [],
    activeMachine: safe.activeMachine || null,
    activeProject: safe.activeProject || null,
    activeTool: safe.activeTool || null,
    history: Array.isArray(safe.history) ? safe.history.slice(0, 80).map(cleanHistoryEntry) : []
  };

  out.projects = projects.map(p => cleanProject(p, out.activeMachine));

  if (out.activeMachine && !out.machines.some(m => m.id === out.activeMachine)) out.activeMachine = null;
  if (out.activeProject && !out.projects.some(p => p.id === out.activeProject)) out.activeProject = null;

  // Wichtig: Eine Maschine darf auch ohne Projekt aktiv bleiben.
  // Ältere Versionen sind beim Bereinigen immer wieder auf das erste Projekt zurückgesprungen.
  // Dadurch sah es so aus, als könne man Maschinen ohne eigenes Projekt nicht anklicken.
  let ap = out.projects.find(p => p.id === out.activeProject) || null;
  if (!out.activeMachine) {
    out.activeMachine = ap?.machineId || out.machines[0]?.id || null;
  }
  if (ap && out.activeMachine && ap.machineId !== out.activeMachine) {
    out.activeProject = null;
    ap = null;
  }
  if (!out.activeProject && out.activeMachine) {
    out.activeProject = out.projects.find(p => p.machineId === out.activeMachine)?.id || null;
    ap = out.projects.find(p => p.id === out.activeProject) || null;
  }
  if (!out.activeMachine && out.projects[0]) {
    out.activeProject = out.projects[0].id;
    out.activeMachine = out.projects[0].machineId || null;
    ap = out.projects[0];
  }

  if (ap && out.activeTool && !ap.tools.some(t => t.pid === out.activeTool)) out.activeTool = null;
  if (ap && !out.activeTool) out.activeTool = ap.tools[0]?.pid || null;
  if (!ap) out.activeTool = null;

  return out;
}

function cleanHistoryEntry(h = {}) {
  return {
    id: h.id || uid('h'),
    ts: h.ts || new Date().toISOString(),
    action: h.action || 'Info',
    text: h.text || '',
    user: h.user || db?.settings?.defaultOperator || '',
    ref: h.ref || ''
  };
}

function addHistory(action, text, ref = '') {
  if (!db) return;
  if (!Array.isArray(db.history)) db.history = [];
  db.history.unshift(cleanHistoryEntry({ action, text, ref, user: db.settings?.defaultOperator || '' }));
  db.history = db.history.slice(0, 80);
}

function cleanMachine(m = {}) {
  return {
    id: m.id || uid('m'),
    name: m.name || 'CNC-Maschine',
    kind: 'mill',
    control: m.control || '',
    axes: String(Math.max(3, parseInt(m.axes || 3, 10) || 3)),
    magazines: m.magazines || 20,
    taper: m.taper || '',
    coolant: m.coolant !== false,
    coolantMix: m.coolantMix ?? '',
    longbed: !!m.longbed,
    divider: !!m.divider,
    pallet: !!m.pallet,
    notes: m.notes || ''
  };
}

function cleanProject(p = {}, fallbackMachineId = '') {
  return {
    id: p.id || uid('p'),
    machineId: p.machineId || fallbackMachineId || '',
    name: p.name || 'Neues Einrichtblatt',
    date: p.date || new Date().toISOString().slice(0, 10),
    part: p.part || '', drawing: p.drawing || '', program: p.program || '',
    operation: p.operation || '', material: p.material || '', operator: p.operator || '',
    setup: p.setup || '', jaws: p.jaws || '', fixture: p.fixture || '', clamping: p.clamping || '', notes: p.notes || '', useDivider: typeof p.useDivider === 'boolean' ? p.useDivider : false, status: ['draft','sample','active'].includes(p.status) ? p.status : 'draft', projectNote: p.projectNote || '',
    programLeft: p.programLeft || '', programRight: p.programRight || '',
    programTable1: p.programTable1 || '', programTable2: p.programTable2 || '', subProgram: p.subProgram || '',
    printShapeLabels: !!p.printShapeLabels,
    showShapeLabels: !!p.showShapeLabels,
    showGroupOutline: !!p.showGroupOutline,
    offsets: Array.isArray(p.offsets) ? p.offsets.map(cleanOffset) : [],
    shapes: Array.isArray(p.shapes) ? p.shapes.map(cleanShape) : [],
    tools: Array.isArray(p.tools) ? p.tools.map(cleanTool) : []
  };
}

function cleanOffset(o = {}) {
  return { id: o.id || uid('o'), name: o.name || 'G54', side: normalizeSide(o.side || 'center'), desc: o.desc || '', X: o.X || '', Y: o.Y || '', Z: o.Z || '', A: o.A || '', B: o.B || '', C: o.C || '' };
}

function cleanShape(s = {}) {
  const out = { id: s.id || uid('s'), type: s.type || 'raw', x: num(s.x, 120), y: num(s.y, 90), w: num(s.w, 120), h: num(s.h, 60), label: s.label || '', labelDx: num(s.labelDx, 0), labelDy: num(s.labelDy, 0), side: s.side || 'center', offsetId: s.offsetId || '', rot: num(s.rot, 0), groupId: s.groupId || '', color: s.color || '' };
  // Kantenmaß muss seine Bezugskanten behalten, sonst wird es nach Import/Export zu einem freien Pfeil.
  if (s.type === 'measure') {
    out.refA = s.refA || '';
    out.refB = s.refB || '';
    out.edgeA = s.edgeA || '';
    out.edgeB = s.edgeB || '';
    out.offset = num(s.offset, 0);
  }
  return out;
}

function cleanTool(t = {}) {
  return { pid: t.pid || uid('pt'), id: t.id || uid('t'), no: t.no || t.t || 'T?', name: t.name || 'Werkzeug', type: t.type || 'VHM', dia: t.dia || t.d || '', teeth: t.teeth || t.z || '', holder: t.holder || '', vc: t.vc || '', fz: t.fz || '', rpm: t.rpm || '', feed: t.feed || t.vf || '', coolant: t.coolant || 'KSS', notes: t.notes || t.remark || '' };
}


function scrubPublicDemoTerms(data) {
  // Öffentliche Demo-Sicherheit: alte lokale Testdaten aus früheren Versionen neutralisieren.
  const oldDemoA = 'Entriegelungs' + 'griff';
  const oldDemoB = 'Riegel' + ' Standard';
  const forbidden = [oldDemoA, oldDemoB];
  const neutralMap = {
    [oldDemoA + ' 129 135 244a']: 'Demo Langbett-Aufspannung OP10',
    [oldDemoA]: 'Demo Bauteil',
    [oldDemoB]: 'Demo Wechseltisch-Aufspannung'
  };
  const replaceText = value => {
    let text = String(value ?? '');
    for (const [from, to] of Object.entries(neutralMap)) text = text.split(from).join(to);
    text = text.replace(/129[ .]135[ .]244a/gi, 'DEMO-2001');
    text = text.replace(/129[.]134[.]134\s*C/gi, 'DEMO-3001');
    return text;
  };
  for (const pr of data.projects || []) {
    const allText = JSON.stringify(pr);
    if (forbidden.some(w => allText.includes(w)) || /129[ .]135[ .]244a|129[.]134[.]134/i.test(allText)) {
      ['name','part','drawing','program','programLeft','programRight','programTable1','programTable2','subProgram','operation','material','operator','setup','jaws','fixture','clamping','notes'].forEach(k => { pr[k] = replaceText(pr[k]); });
    }
  }
  return data;
}

function save(skipRender = false) {
  db = cleanDb(db);
  localStorage.setItem(KEY, JSON.stringify(db));
  if (!skipRender) render();
}

function load() {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) raw = OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean) || '{}';
    db = scrubPublicDemoTerms(cleanDb(JSON.parse(raw)));
  } catch (err) {
    console.warn('Datenbank konnte nicht geladen werden:', err);
    db = cleanDb({});
  }
}

function toast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
}

function activeMachine() { return db.machines.find(m => m.id === db.activeMachine) || null; }
function activeProject() { return db.projects.find(p => p.id === db.activeProject) || null; }
function activeTool() { return activeProject()?.tools.find(t => t.pid === db.activeTool) || null; }

function normalizeSelection() {
  const p = activeProject();
  const valid = new Set((p?.shapes || []).map(s => s.id));
  selectedShapeIds = new Set([...selectedShapeIds].filter(id => valid.has(id)));
  if (selectedShapeId && !valid.has(selectedShapeId)) selectedShapeId = null;
  if (selectedShapeId && !selectedShapeIds.has(selectedShapeId)) selectedShapeIds.add(selectedShapeId);
  if (!selectedShapeId && selectedShapeIds.size) selectedShapeId = [...selectedShapeIds][selectedShapeIds.size - 1];
}
function clearShapeSelection() { selectedShapeId = null; selectedShapeIds = new Set(); }
function selectOnlyShape(id) { selectedShapeId = id || null; selectedShapeIds = id ? new Set([id]) : new Set(); }
function toggleShapeSelection(id) {
  if (!id) return;
  if (selectedShapeIds.has(id)) selectedShapeIds.delete(id); else selectedShapeIds.add(id);
  selectedShapeId = id;
  if (!selectedShapeIds.size) selectedShapeId = null;
}

function groupIdForShape(id) {
  const p = activeProject();
  const s = p?.shapes.find(x => x.id === id);
  return s?.groupId || '';
}
function idsInGroup(groupId) {
  const p = activeProject();
  if (!p || !groupId) return [];
  return (p.shapes || []).filter(s => s.groupId === groupId).map(s => s.id);
}
function selectShapeRespectGroup(id, additive = false) {
  const gid = groupIdForShape(id);
  const ids = gid ? idsInGroup(gid) : [id];
  if (!additive) selectedShapeIds = new Set();
  ids.forEach(x => selectedShapeIds.add(x));
  selectedShapeId = id || ids[ids.length - 1] || null;
}
function toggleShapeSelectionRespectGroup(id) {
  if (!id) return;
  const gid = groupIdForShape(id);
  const ids = gid ? idsInGroup(gid) : [id];
  const allSelected = ids.length && ids.every(x => selectedShapeIds.has(x));
  if (allSelected) ids.forEach(x => selectedShapeIds.delete(x));
  else ids.forEach(x => selectedShapeIds.add(x));
  selectedShapeId = allSelected ? ([...selectedShapeIds][selectedShapeIds.size - 1] || null) : id;
}
function groupSelectedShapes() {
  const p = activeProject();
  const items = selectedShapes();
  if (!p || items.length < 2) { toast('Mindestens zwei Bausteine markieren'); return; }
  const gid = uid('g');
  items.forEach(s => { s.groupId = gid; });
  selectedShapeIds = new Set(items.map(s => s.id));
  selectedShapeId = items[items.length - 1].id;
  save();
  toast(`${items.length} Bausteine gruppiert`);
}
function ungroupSelectedShapes() {
  const items = selectedShapes();
  if (!items.length) { toast('Erst Gruppe oder Bausteine wählen'); return; }
  const groups = new Set(items.map(s => s.groupId).filter(Boolean));
  if (!groups.size) { toast('Keine Gruppe in der Auswahl'); return; }
  const p = activeProject();
  (p?.shapes || []).forEach(s => { if (groups.has(s.groupId)) s.groupId = ''; });
  save();
  toast('Gruppe gelöst');
}
function selectedShapes() {
  const p = activeProject();
  normalizeSelection();
  return (p?.shapes || []).filter(s => selectedShapeIds.has(s.id));
}
function kindName(kind) { return 'Fräsmaschine'; }
function updateMachineKindUi() {
  const axes = $('m_axes');
  if (axes) {
    Array.from(axes.options).forEach(o => { o.hidden = o.value === '2'; });
    if (parseInt(axes.value, 10) < 3) axes.value = '3';
  }
  const longbed = $('m_longbed'), divider = $('m_divider'), pallet = $('m_pallet');
  [longbed, divider, pallet].forEach(el => { if (!el) return; el.closest('label')?.classList.remove('muted-option'); });
}
function normalizeSide(side) { if (side === 'table1' || side === 'table2' || side === 'left' || side === 'right' || side === 'center') return side; return 'center'; }
function activeMachineForProject(project = activeProject()) { return db.machines.find(m => m.id === project?.machineId) || activeMachine() || {}; }
function usesPallet(project = activeProject()) { return !!activeMachineForProject(project).pallet; }
function machineSupportsDivider(project = activeProject()) { const m = activeMachineForProject(project); return !!(m.longbed && m.divider && !m.pallet); }
function usesDivider(project = activeProject()) { return machineSupportsDivider(project) && !!project?.useDivider; }
function machineModeLabel(project = activeProject()) {
  const m = activeMachineForProject(project);
  if (m.pallet) return 'Wechseltisch / Tisch 1+2';
  if (m.longbed && m.divider) return usesDivider(project) ? 'Langbett mit Trennwand' : 'Langbett ohne Trennwand';
  if (m.longbed) return 'Langbett ohne Trennwand';
  return 'Standard-Frästisch';
}
function sideNameFor(side, project = activeProject()) { if (usesPallet(project)) { if (side === 'table1' || side === 'left') return 'Tisch 1'; if (side === 'table2' || side === 'right') return 'Tisch 2'; } return side === 'left' ? 'links' : side === 'right' ? 'rechts' : side === 'table1' ? 'Tisch 1' : side === 'table2' ? 'Tisch 2' : 'Mitte/frei'; }
function sideShortFor(side, project = activeProject()) { if (usesPallet(project)) { if (side === 'table1' || side === 'left') return 'T1'; if (side === 'table2' || side === 'right') return 'T2'; } return side === 'left' ? 'L' : side === 'right' ? 'R' : side === 'table1' ? 'T1' : side === 'table2' ? 'T2' : 'M'; }
function machineName(id) { return db.machines.find(m => m.id === id)?.name || 'ohne Maschine'; }
function sideName(side) { return sideNameFor(side); }
function sideShort(side) { return sideShortFor(side); }
function offsetBaseName(value) { const m = String(value || '').match(/G5[4-9]/i); return m ? m[0].toUpperCase() : (String(value || 'G54').trim() || 'G54'); }
function projectStatusMeta(status) {
  const s = status || 'draft';
  const map = {
    draft: { label: 'Entwurf', cls: 'draft', dot: '🔴' },
    sample: { label: 'Muster', cls: 'sample', dot: '🟡' },
    active: { label: 'Aktiv', cls: 'active', dot: '🟢' }
  };
  return map[s] || map.draft;
}
function statusBadge(p) {
  const m = projectStatusMeta(p?.status);
  return `<span class="status-badge ${m.cls}" title="Status: ${m.label}">${m.dot} ${m.label}</span>`;
}
function programSummaryHtml(p) {
  const m = db.machines.find(x => x.id === p.machineId) || {};
  if (m.pallet) return `Tisch 1: ${esc(p.programTable1 || '-')}<br>Tisch 2: ${esc(p.programTable2 || '-')}<br>UPG: ${esc(p.subProgram || '-')}`;
  if (usesDivider(p)) return `Links: ${esc(p.programLeft || '-')}<br>Rechts: ${esc(p.programRight || '-')}<br>UPG: ${esc(p.subProgram || '-')}`;
  return esc([p.program, p.subProgram].filter(Boolean).join(' / ') || '-');
}

function openTab(id) {
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  $$('.tab').forEach(t => t.classList.toggle('active', t.id === `tab-${id}`));
  renderPrint();
}

function blankMachine() {
  return { id: uid('m'), name: 'Neue CNC-Maschine', kind: 'mill', control: '', axes: '3', magazines: 20, taper: 'SK40', coolant: true, coolantMix: '6-9', longbed: false, divider: false, pallet: false, notes: '' };
}
function blankProject(mid = db.activeMachine) {
  return { id: uid('p'), machineId: mid || '', name: 'Neues Einrichtblatt', date: new Date().toISOString().slice(0, 10), part: '', drawing: '', program: '', operation: '', material: '', operator: '', setup: '', jaws: '', fixture: '', clamping: '', notes: '', programLeft: '', programRight: '', programTable1: '', programTable2: '', subProgram: '', useDivider: false, status: 'draft', projectNote: '', printShapeLabels: false, showShapeLabels: false, showGroupOutline: false, offsets: [], shapes: [], tools: [] };
}
function blankTool() {
  return { pid: uid('pt'), id: uid('t'), no: 'T1', name: 'Neues Werkzeug', type: 'VHM', dia: '', teeth: '', holder: '', vc: '', fz: '', rpm: '', feed: '', coolant: 'KSS', notes: '' };
}

function demo() {
  db = cleanDb({ settings: { ...db.settings } });
  db.machines = [
    { id: 'm_langbett', name: 'Langbett Fräse 1', kind: 'mill', control: 'Heidenhain', axes: '3', magazines: 20, taper: 'SK40', coolant: true, coolantMix: '6-9', longbed: true, divider: true, pallet: false, notes: 'Linke/rechte Seite möglich, Trennwand einsetzbar.' },
    { id: 'm_wechseltisch', name: 'Wechseltisch Fräse 1', kind: 'mill', control: 'Heidenhain', axes: '3', magazines: 20, taper: 'SK40', coolant: true, coolantMix: '6-9', longbed: false, divider: false, pallet: true, notes: 'Tisch 1 und Tisch 2.' },
    { id: 'm_5achs', name: '5-Achs Fräse Vorlage', kind: 'mill', control: 'Heidenhain', axes: '5', magazines: 32, taper: 'HSK-A63', coolant: true, coolantMix: '6-9', longbed: false, divider: false, pallet: false, notes: 'Demo-Vorlage für 5-Achs-Fräsbearbeitung.' }
  ];
  const tools = [
    { pid: uid('pt'), id: 't1', no: 'T1', name: 'VHM Schruppfräser Ø10', type: 'VHM', dia: '10', teeth: '4', holder: 'ER32', vc: '180', fz: '0.05', rpm: '5730', feed: '1146', coolant: 'KSS/Luft', notes: 'Auskragung kurz halten' },
    { pid: uid('pt'), id: 't2', no: 'T2', name: 'VHM Schlichtfräser Ø8', type: 'VHM', dia: '8', teeth: '4', holder: 'ER25', vc: '220', fz: '0.03', rpm: '8754', feed: '1050', coolant: 'KSS', notes: 'Schlichtaufmaß 0,2–0,5 mm' }
  ];
  db.projects = [cleanProject({
    id: 'p_demo', machineId: 'm_langbett', name: 'Demo Langbett-Aufspannung OP10', date: new Date().toISOString().slice(0, 10), part: 'Demo Halterplatte', drawing: 'DEMO-2001', program: 'OP10', programLeft: '%1002', programRight: '%1003', subProgram: 'L11 / L12', operation: 'Fräsen OP10', material: '1.1730', setup: 'Langbett, links/rechts trennbar', jaws: 'Demo-Spannbacken', fixture: 'Schraubstock + Anschlag', clamping: 'links und rechts je ein Schraubstock', notes: 'Demo-Notiz: Nullpunkte prüfen und Werte bei Bedarf eintragen.',
    offsets: [
      { id: 'o1', name: 'G54', side: 'left', desc: 'Nullpunkt links' },
      { id: 'o2', name: 'G54', side: 'right', desc: 'Nullpunkt rechts' }
    ],
    shapes: [
      { id: 's1', type: 'divider', x: 448, y: 40, w: 8, h: 330, label: 'Trennwand' },
      { id: 's2', type: 'viseH', x: 160, y: 145, w: 130, h: 70, label: 'Schraubstock links' },
      { id: 's3', type: 'viseH', x: 610, y: 145, w: 130, h: 70, label: 'Schraubstock rechts' },
      { id: 's4', type: 'offset', x: 225, y: 125, w: 32, h: 32, label: 'G54', side: 'left', offsetId: 'o1' },
      { id: 's5', type: 'offset', x: 675, y: 125, w: 32, h: 32, label: 'G54', side: 'right', offsetId: 'o2' }
    ],
    tools
  }, 'm_langbett')];
  db.activeMachine = 'm_langbett';
  db.activeProject = 'p_demo';
  db.activeTool = db.projects[0].tools[0]?.pid || null;
  save();
  toast('Demo geladen');
}

function render() {
  fillSettings();
  renderDashboardStats();
  renderHistory();
  renderTree();
  renderMachines();
  renderProjects();
  fillProjectForm();
  renderOffsets();
  renderSketch();
  renderTools();
  renderPrint();
}

function fillSettings() {
  ['companyName','companySub','footerNote1','footerNote2','footerNote3','footerNote4'].forEach(id => { const el = $(id); if (el) el.value = db.settings[id] || ''; });
}

function fmtDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
  } catch (_) {
    return iso || '';
  }
}

function renderDashboardStats() {
  const el = $('dashboardStats');
  if (!el) return;
  const projects = db.projects || [];
  const machines = db.machines || [];
  const draft = projects.filter(p => (p.status || 'draft') === 'draft').length;
  const sample = projects.filter(p => p.status === 'sample').length;
  const active = projects.filter(p => p.status === 'active').length;
  const axisSummary = [3,4,5,6].map(a => `Achse ${a}: ${machines.filter(m => String(m.axes) === String(a)).length} Stück`).join(' · ');
  el.innerHTML = `
    <div class="stat-card compact-stat"><span>Maschinen</span><b>${machines.length}</b><small>${axisSummary}</small></div>
    <div class="stat-card compact-stat"><span>Projekte</span><b>${projects.length}</b><small>${active} aktiv · ${sample} Muster · ${draft} Entwurf</small></div>
    <div class="stat-card compact-stat"><span>Historie</span><b>${(db.history || []).length}</b><small>letzte Änderungen lokal gespeichert</small></div>
  `;
}

function openHistoryRef(ref) {
  if (!ref) return;
  const project = db.projects.find(p => p.id === ref);
  if (project) {
    openProject(project.id);
    openTab('sheet');
    toast('Projekt aus Historie geöffnet');
    return;
  }
  const machine = db.machines.find(m => m.id === ref);
  if (machine) {
    selectMachine(machine.id);
    openTab('machines');
    toast('Maschine aus Historie geöffnet');
  }
}

function renderHistory() {
  const el = $('historyList');
  if (!el) return;
  const list = (db.history || []).slice(0, 30);
  el.innerHTML = list.map(h => {
    const clickable = h.ref && (db.projects.some(p => p.id === h.ref) || db.machines.some(m => m.id === h.ref));
    const tag = clickable ? 'button' : 'div';
    const click = clickable ? ` type="button" onclick="openHistoryRef('${jsArg(h.ref)}')" title="Eintrag öffnen"` : '';
    return `<${tag}${click} class="history-item ${clickable ? 'clickable' : ''}"><div><b>${esc(h.action)}</b><p>${esc(h.text)}</p></div><time>${esc(fmtDateTime(h.ts))}</time></${tag}>`;
  }).join('') || '<p class="note">Noch keine Aktivitäten. Ab jetzt werden neue Aktionen hier protokolliert.</p>';
}

function renderTree() {
  const el = $('tree');
  if (!el) return;
  if (!db.machines.length) { el.innerHTML = '<p class="note">Noch keine Maschinen vorhanden.</p>'; return; }
  el.innerHTML = db.machines.map(m => `<button type="button" class="list-card ${db.activeMachine === m.id ? 'active' : ''}" data-machine-id="${esc(m.id)}" onclick="selectMachine('${jsArg(m.id)}')"><b>${esc(m.name)}</b><br><small>${kindName(m.kind)} · ${esc(m.axes)} Achsen · Magazin ${esc(m.magazines || 0)}</small></button>`).join('');
  renderDashboardProjects();
}

function renderDashboardProjects() {
  const el = $('dashboardProjects');
  if (!el) return;
  const q = ($('dashboardSearch')?.value || '').toLowerCase();
  let list = db.projects
    .filter(p => `${p.name} ${p.drawing} ${machineName(p.machineId)} ${p.projectNote || ''}`.toLowerCase().includes(q))
    .slice()
    .sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
  if (!q) list = list.slice(0, 8);
  el.innerHTML = list.map(p => `<button type="button" class="list-card ${db.activeProject === p.id ? 'active' : ''}" data-project-id="${esc(p.id)}" onclick="openProject('${jsArg(p.id)}')"><b>${esc(p.name)}</b>${statusBadge(p)}<br><small>${esc(machineName(p.machineId))} · ZNG ${esc(p.drawing || '-')} · ${esc(p.date || '')}</small>${p.projectNote ? `<br><small class="project-note-preview">${esc(p.projectNote)}</small>` : ''}</button>`).join('') || '<p class="note">Keine Projekte gefunden.</p>';
}

function machineCardHtml(m) {
  const projectCount = db.projects.filter(p => p.machineId === m.id).length;
  return `<button type="button" class="list-card ${db.activeMachine === m.id ? 'active' : ''}" data-machine-id="${esc(m.id)}" onclick="selectMachine('${jsArg(m.id)}')"><b>${esc(m.name)}</b><br><small>${kindName(m.kind)} · ${esc(m.axes)} Achsen · Magazin ${esc(m.magazines || 0)} · ${esc(m.taper || '-')}</small><br><small>${m.coolant ? 'KSS ' + esc(m.coolantMix ? m.coolantMix + '%' : '') : 'ohne KSS'} · ${projectCount} Projekt${projectCount === 1 ? '' : 'e'}</small></button>`;
}

function renderMachines() {
  const el = $('machineList');
  if (!el) return;
  const q = ($('machineSearch')?.value || '').toLowerCase().trim();
  const axis = $('machineAxisFilter')?.value || '';
  const list = db.machines.filter(m => {
    const hay = `${m.name} ${m.control} ${m.taper} ${m.axes} ${m.magazines} ${m.notes}`.toLowerCase();
    return (!q || hay.includes(q)) && (!axis || String(m.axes) === String(axis));
  });
  el.innerHTML = list.map(machineCardHtml).join('') || '<p class="note">Keine Maschine gefunden.</p>';
  fillMachineForm();
  fillMachineSelect();
}

function fillMachineForm() {
  const m = activeMachine() || blankMachine();
  ['name','control','axes','magazines','taper','coolantMix','notes'].forEach(k => { const el = $('m_' + k); if (el) el.value = m[k] || ''; });
  if ($('m_kind')) $('m_kind').value = m.kind || 'mill';
  updateMachineKindUi();
  ['coolant','longbed','divider','pallet'].forEach(k => { const el = $('m_' + k); if (el) el.checked = !!m[k]; });
}

function machineFromForm(id) {
  return cleanMachine({ id: id || uid('m'), name: $('m_name').value, kind: $('m_kind').value, control: $('m_control').value, axes: $('m_axes').value, magazines: $('m_magazines').value, taper: $('m_taper').value, coolant: $('m_coolant').checked, coolantMix: $('m_coolantMix').value, longbed: $('m_longbed').checked, divider: $('m_divider').checked, pallet: $('m_pallet').checked, notes: $('m_notes').value });
}

function fillMachineSelect() {
  const sel = $('p_machine'); if (!sel) return;
  const p = activeProject();
  const selectedId = p?.machineId || db.activeMachine || '';
  const q = ($('p_machineSearch')?.value || '').toLowerCase().trim();
  let list = db.machines.filter(m => !q || `${m.name} ${m.control} ${m.taper} ${m.axes} ${m.notes}`.toLowerCase().includes(q));
  if (selectedId && !list.some(m => m.id === selectedId)) {
    const selected = db.machines.find(m => m.id === selectedId);
    if (selected) list = [selected, ...list];
  }
  sel.innerHTML = list.map(m => `<option value="${m.id}">${esc(m.name)} · ${esc(m.axes)} Achsen</option>`).join('');
  if (p) sel.value = selectedId;
}

function renderProjectMachineCapabilities(p = activeProject()) {
  const box = $('projectMachineCapabilities');
  if (!box) return;
  if (!p) { box.innerHTML = ''; return; }
  const m = activeMachineForProject(p);
  const bits = [
    `<b>Maschinenmodus:</b> ${esc(machineModeLabel(p))}`,
    `${esc(m.axes || 3)} Achsen`,
    `Magazin ${esc(m.magazines || 0)}`
  ];
  if (m.pallet) bits.push('Wechseltisch');
  if (m.longbed) bits.push('Langbett');
  if (m.divider) bits.push('Trennwand möglich');
  const dividerToggle = machineSupportsDivider(p)
    ? `<label class="check inline-check"><input id="p_useDivider" type="checkbox" ${p.useDivider ? 'checked' : ''}> Projekt nutzt Trennwand / links-rechts getrennt</label>`
    : '';
  box.innerHTML = `<div class="capability-line">${bits.map(x => `<span>${x}</span>`).join('')}${dividerToggle}</div>`;
  $('p_useDivider')?.addEventListener('change', e => {
    const ap = activeProject();
    if (ap) {
      ap.useDivider = e.target.checked;
      renderProjectMachineCapabilities(ap);
      renderProgramModeBox(ap);
      save();
    }
  });
}

function projectCardHtml(p) {
  return `<button type="button" class="list-card ${db.activeProject === p.id ? 'active' : ''}" data-project-id="${esc(p.id)}" onclick="openProject('${jsArg(p.id)}')"><b>${esc(p.name)}</b>${statusBadge(p)}<br><small>${esc(machineName(p.machineId))} · ZNG ${esc(p.drawing || '-')} · ${esc(p.date || '')}</small>${p.projectNote ? `<br><small class="project-note-preview">${esc(p.projectNote)}</small>` : ''}</button>`;
}

function currentProjectFilterId() {
  if (projectMachineFilterMode === 'all') return '';
  return projectMachineFilterMode || db.activeMachine || '';
}

function renderProjects() {
  const el = $('projectList'); if (!el) return;
  const q = ($('projectSearch')?.value || '').toLowerCase();
  const filterId = currentProjectFilterId();
  const machineLabel = $('projectActiveMachine');
  if (machineLabel) machineLabel.textContent = filterId ? machineName(filterId) : 'Alle Maschinen';

  const filter = $('projectMachineFilter');
  if (filter) {
    const current = projectMachineFilterMode === 'all' ? '__all__' : (filterId || '__all__');
    filter.innerHTML = '<option value="__all__">Alle Maschinen durchsuchen</option>' + db.machines.map(m => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('');
    filter.value = current;
  }

  const list = db.projects.filter(p => (!filterId || p.machineId === filterId) && `${p.name} ${p.drawing} ${machineName(p.machineId)}`.toLowerCase().includes(q));
  el.classList.toggle('project-list-grouped', !filterId);

  if (!list.length) {
    el.innerHTML = filterId
      ? '<p class="note">Keine Projekte für diese Maschine gefunden.</p>'
      : '<p class="note">Keine Projekte gefunden. Suche ändern oder Maschine auswählen.</p>';
    renderDashboardProjects();
    return;
  }

  if (!filterId) {
    const groups = new Map();
    list.forEach(p => {
      const key = p.machineId || '_none';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    });
    el.innerHTML = Array.from(groups.entries()).map(([machineId, projects]) => {
      const title = machineId === '_none' ? 'Ohne Maschine' : machineName(machineId);
      return `<section class="project-machine-group"><h4>${esc(title)} <span>${projects.length} Projekt${projects.length === 1 ? '' : 'e'}</span></h4><div class="project-group-cards">${projects.map(projectCardHtml).join('')}</div></section>`;
    }).join('');
  } else {
    el.innerHTML = list.map(projectCardHtml).join('');
  }

  renderDashboardProjects();
}

function fillProjectForm() {
  const p = activeProject() || blankProject();
  fillMachineSelect();
  ['name','date','part','drawing','program','operation','material','operator','setup','jaws','fixture','clamping','notes','projectNote'].forEach(k => { const el = $('p_' + k); if (el) el.value = p[k] || ''; });
  if ($('p_status')) $('p_status').value = p.status || 'draft';
  if ($('p_machineSearch')) $('p_machineSearch').value = '';
  if ($('p_machine')) $('p_machine').value = p.machineId || db.activeMachine || '';
  renderProjectMachineCapabilities(p);
  renderProgramModeBox(p);
}

function projectFromForm(id) {
  const old = activeProject() || blankProject();
  const p = { ...old, id: id || old.id || uid('p'), machineId: $('p_machine').value, name: $('p_name').value || 'Neues Einrichtblatt', date: $('p_date').value, part: $('p_part').value, drawing: $('p_drawing').value, program: $('p_program').value, operation: $('p_operation').value, material: $('p_material').value, operator: $('p_operator').value, setup: $('p_setup').value, jaws: $('p_jaws').value, fixture: $('p_fixture').value, clamping: $('p_clamping').value, notes: $('p_notes').value, useDivider: $('p_useDivider')?.checked || false, status: $('p_status')?.value || 'draft', projectNote: $('p_projectNote')?.value || '' };
  p.programLeft = $('p_programLeft')?.value || '';
  p.programRight = $('p_programRight')?.value || '';
  p.programTable1 = $('p_programTable1')?.value || '';
  p.programTable2 = $('p_programTable2')?.value || '';
  p.subProgram = $('p_subProgram')?.value || '';
  return cleanProject(p, p.machineId);
}

function renderProgramModeBox(p) {
  const box = $('programModeBox'); if (!box) return;
  const m = db.machines.find(x => x.id === (p.machineId || db.activeMachine)) || {};  if (m.pallet) {
    box.innerHTML = `<div class="grid3"><div><label>Programm Tisch 1</label><input id="p_programTable1" value="${esc(p.programTable1 || '')}"></div><div><label>Programm Tisch 2</label><input id="p_programTable2" value="${esc(p.programTable2 || '')}"></div><div><label>UPG / Unterprogramme</label><input id="p_subProgram" value="${esc(p.subProgram || '')}"></div></div>`;
  } else if (usesDivider(p)) {
    box.innerHTML = `<div class="grid3"><div><label>Programm links</label><input id="p_programLeft" value="${esc(p.programLeft || '')}"></div><div><label>Programm rechts</label><input id="p_programRight" value="${esc(p.programRight || '')}"></div><div><label>UPG / Unterprogramme</label><input id="p_subProgram" value="${esc(p.subProgram || '')}"></div></div>`;
  } else {
    box.innerHTML = `<div class="grid2"><div><label>UPG / Unterprogramme</label><input id="p_subProgram" value="${esc(p.subProgram || '')}"></div><div><label>Hinweis</label><input value="Standard: ein Hauptprogramm" disabled></div></div>`;
  }
}

function programSummary(p) {
  const m = db.machines.find(x => x.id === p.machineId) || {};
  if (m.pallet) return `T1 ${p.programTable1 || '-'} / T2 ${p.programTable2 || '-'} / UPG ${p.subProgram || '-'}`;
  if (usesDivider(p)) return `L ${p.programLeft || '-'} / R ${p.programRight || '-'} / UPG ${p.subProgram || '-'}`;
  return [p.program, p.subProgram].filter(Boolean).join(' / ') || '-';
}

function axesForProject() {
  const m = db.machines.find(m => m.id === activeProject()?.machineId) || activeMachine();
  const raw = parseInt(m?.axes || 3, 10);
  const n = Math.max(3, Math.min(6, raw));
  return ['X','Y','Z','A','B','C'].slice(0, n);
}

function renderOffsets() {
  const el = $('offsetTable'); if (!el) return;
  const p = activeProject();
  if (!p) { el.innerHTML = '<p class="note">Kein Projekt aktiv.</p>'; return; }
  const ax = axesForProject();
  const sideOptions = usesPallet(p) ? [['table1','Tisch 1'],['table2','Tisch 2'],['center','Mitte/frei']] : [['left','links'],['right','rechts'],['center','Mitte/frei']];
  el.innerHTML = (p.offsets || []).map(o => `<div class="offset-row"><div><label>NP</label><input data-off="${o.id}" data-field="name" value="${esc(o.name)}"></div><div><label>${usesPallet(p) ? 'Tisch' : 'Seite'}</label><select data-off="${o.id}" data-field="side">${sideOptions.map(([v,t]) => `<option value="${v}" ${normalizeSide(o.side) === v || (usesPallet(p) && ((o.side === 'left' && v === 'table1') || (o.side === 'right' && v === 'table2'))) ? 'selected' : ''}>${t}</option>`).join('')}</select></div><div><label>Beschreibung</label><input data-off="${o.id}" data-field="desc" value="${esc(o.desc || '')}"></div>${['X','Y','Z','A','B','C'].map(a => `<div style="display:${ax.includes(a) ? 'block' : 'none'}"><label>${a}</label><input data-off="${o.id}" data-field="${a}" value="${esc(o[a] || '')}"></div>`).join('')}<button class="btn danger" data-delete-offset="${o.id}">×</button></div>`).join('') || '<p class="note">Noch keine Nullpunkte. Am schnellsten über die Presets in der Aufspannskizze setzen.</p>';
}

function ensureOffset(name, side, desc, allowReuse = false) {
  const p = activeProject(); if (!p) return null;
  const baseName = offsetBaseName(name);
  const normSide = normalizeSide(side || 'center');
  if (allowReuse) {
    const existing = (p.offsets || []).find(o => offsetBaseName(o.name) === baseName && normalizeSide(o.side) === normSide);
    if (existing) return existing;
  }
  const o = cleanOffset({ name: baseName, side: normSide, desc });
  p.offsets.push(o);
  save(true);
  return o;
}


function machineTemplateShapes(machine, project = activeProject()) {
  const m = machine || activeMachine() || {};
  const projectLike = project ? { ...project, machineId: project.machineId || m.id } : { machineId: m.id, useDivider: !!m.divider };
  const shapes = [];
  if (m.pallet) {
    shapes.push({ id: uid('s'), type: 'table', x: 170, y: 35, w: 560, h: 155, label: 'Tisch 1', side: 'table1', offsetId: '' });
    shapes.push({ id: uid('s'), type: 'table', x: 170, y: 230, w: 560, h: 155, label: 'Tisch 2', side: 'table2', offsetId: '' });
  } else if (m.longbed) {
    shapes.push({ id: uid('s'), type: 'table', x: 105, y: 55, w: 690, h: 305, label: 'Langbett / Tischfläche', side: 'center', offsetId: '' });
    if (usesDivider(projectLike)) shapes.push({ id: uid('s'), type: 'divider', x: 446, y: 58, w: 8, h: 299, label: 'Trennwand', side: 'center', offsetId: '' });
  } else {
    shapes.push({ id: uid('s'), type: 'table', x: 170, y: 75, w: 560, h: 270, label: 'Tischfläche', side: 'center', offsetId: '' });
  }
  return shapes.map(cleanShape);
}

function applyMachineTemplate(force = false) {
  const p = activeProject();
  if (!p) { toast('Erst Projekt öffnen'); return; }
  if ((p.shapes || []).length && !force && !confirm('Skizze durch Maschinen-Vorlage ersetzen?')) return;
  const m = db.machines.find(x => x.id === p.machineId) || activeMachine();
  p.shapes = machineTemplateShapes(m, p);
  clearShapeSelection();
  save();
  toast(m?.pallet ? 'Wechseltisch-Vorlage eingefügt' : m?.longbed ? 'Langbett-Vorlage eingefügt' : 'Tisch-Vorlage eingefügt');
}

function renderSketch() {
  const svg = $('sketchSvg'); if (!svg) return;
  const p = activeProject();
  if (!p) { svg.innerHTML = ''; return; }
  normalizeSelection();
  const show = $('showShapeLabels'); if (show) show.checked = !!p.showShapeLabels;
  const print = $('printShapeLabels'); if (print) print.checked = !!p.printShapeLabels;
  const groupOutline = $('showGroupOutline'); if (groupOutline) groupOutline.checked = !!p.showGroupOutline;
  renderColorButtons();
  renderOffsetPresets();
  svg.innerHTML = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#111"/></marker><marker id="dimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 5 L 10 0 L 10 10 z" fill="#111"/></marker></defs><g class="axis-fixed"><line x1="6" y1="412" x2="86" y2="412" stroke="#111" stroke-width="3" marker-end="url(#arrow)"/><line x1="6" y1="412" x2="6" y2="332" stroke="#111" stroke-width="3" marker-end="url(#arrow)"/><text x="94" y="417" font-size="16" font-weight="800">X</text><text x="1" y="324" font-size="16" font-weight="800">Y</text></g>` + orderedShapes(p).map(shapeSvg).join('') + edgeMeasureHighlightSvg() + sketchGuideSvg();
}



function layerRank(type) {
  return ({ table: 0, divider: 1, fixture: 2, viseH: 2, viseV: 2, stop: 3, raw: 4, hole: 5, slot: 5, offset: 6, measure: 7, text: 8 }[type] ?? 4);
}
function orderedShapes(p = activeProject()) {
  const arr = [...(p?.shapes || [])];
  return arr.map((s, i) => ({ s, i })).sort((a, b) => (layerRank(a.s.type) - layerRank(b.s.type)) || (a.i - b.i)).map(x => x.s);
}
function edgeKind(edge) { return edge === 'left' || edge === 'right' ? 'v' : 'h'; }
function edgePointFromBounds(b, edge) {
  if (edge === 'left') return { x: b.x1, y: b.cy, kind: 'v' };
  if (edge === 'right') return { x: b.x2, y: b.cy, kind: 'v' };
  if (edge === 'top') return { x: b.cx, y: b.y1, kind: 'h' };
  return { x: b.cx, y: b.y2, kind: 'h' };
}
function edgeLineFromBounds(b, edge) {
  if (edge === 'left' || edge === 'right') { const x = edge === 'left' ? b.x1 : b.x2; return { x1:x, y1:b.y1, x2:x, y2:b.y2 }; }
  const y = edge === 'top' ? b.y1 : b.y2;
  return { x1:b.x1, y1:y, x2:b.x2, y2:y };
}
function nearestEdge(s, pt) {
  const b = shapeBounds(s);
  const distances = [
    ['left', Math.abs(pt.x - b.x1)], ['right', Math.abs(pt.x - b.x2)],
    ['top', Math.abs(pt.y - b.y1)], ['bottom', Math.abs(pt.y - b.y2)]
  ];
  distances.sort((a,b)=>a[1]-b[1]);
  return distances[0][0];
}
function measureLine(s, p = activeProject()) {
  if (s?.refA && s?.refB) {
    const a = p?.shapes?.find(x => x.id === s.refA);
    const b = p?.shapes?.find(x => x.id === s.refB);
    if (a && b) {
      const A = edgePointFromBounds(shapeBounds(a), s.edgeA || 'right');
      const B = edgePointFromBounds(shapeBounds(b), s.edgeB || 'left');
      const offset = Number(s.offset) || 0;
      if (A.kind === 'v' && B.kind === 'v') {
        const baseY = Math.round((A.y + B.y) / 2);
        const y = baseY + offset;
        return { x1:A.x, y1:y, x2:B.x, y2:y, orientation:'h', baseY };
      }
      if (A.kind === 'h' && B.kind === 'h') {
        const baseX = Math.round((A.x + B.x) / 2);
        const x = baseX + offset;
        return { x1:x, y1:A.y, x2:x, y2:B.y, orientation:'v', baseX };
      }
      return { x1:A.x, y1:A.y, x2:B.x, y2:B.y, orientation:'free' };
    }
  }
  return { x1:Number(s.x)||0, y1:Number(s.y)||0, x2:(Number(s.x)||0)+(Number(s.w)||0), y2:(Number(s.y)||0)+(Number(s.h)||0), orientation:'free' };
}
function measureEdgePoints(s, p = activeProject()) {
  if (!(s?.refA && s?.refB)) return null;
  const a = p?.shapes?.find(x => x.id === s.refA);
  const b = p?.shapes?.find(x => x.id === s.refB);
  if (!a || !b) return null;
  return {
    A: edgePointFromBounds(shapeBounds(a), s.edgeA || 'right'),
    B: edgePointFromBounds(shapeBounds(b), s.edgeB || 'left')
  };
}
function measureExtensionSvg(s, m, p = activeProject()) {
  const pts = measureEdgePoints(s, p);
  if (!pts || !m) return '';
  if (m.orientation === 'h') {
    return `<line class="measure-extension" x1="${pts.A.x}" y1="${pts.A.y}" x2="${pts.A.x}" y2="${m.y1}"/>` +
           `<line class="measure-extension" x1="${pts.B.x}" y1="${pts.B.y}" x2="${pts.B.x}" y2="${m.y2}"/>`;
  }
  if (m.orientation === 'v') {
    return `<line class="measure-extension" x1="${pts.A.x}" y1="${pts.A.y}" x2="${m.x1}" y2="${pts.A.y}"/>` +
           `<line class="measure-extension" x1="${pts.B.x}" y1="${pts.B.y}" x2="${m.x2}" y2="${pts.B.y}"/>`;
  }
  return '';
}
function edgeMeasureHighlightSvg() {
  const p = activeProject();
  const lines = [];
  const add = (ref, cls) => {
    if (!ref) return;
    const s = p?.shapes?.find(x => x.id === ref.id);
    if (!s) return;
    const e = edgeLineFromBounds(shapeBounds(s), ref.edge || 'right');
    lines.push(`<line class="${cls}" x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}"/>`);
  };
  add(edgeMeasureHoverRef, 'edge-measure-hover');
  add(edgeMeasureFirstRef, 'edge-measure-highlight');
  return lines.join('');
}

function labelBase(s, p = activeProject()) {
  if (!s) return { x: 0, y: 0 };
  if (s.type === 'offset') return { x: s.x + s.w + 8, y: s.y + s.h / 2 + 5 };
  if (s.type === 'measure') { const m = measureLine(s, p); return { x: (m.x1 + m.x2) / 2 + 6, y: (m.y1 + m.y2) / 2 - 6 }; }
  return { x: s.x + 8, y: s.y + 24 };
}
function labelXY(s, p = activeProject()) {
  const b = labelBase(s, p);
  return { x: b.x + num(s.labelDx, 0), y: b.y + num(s.labelDy, 0) };
}
function shapeTransform(s) {
  const rot = ((Number(s.rot) || 0) % 360 + 360) % 360;
  if (!rot) return '';
  return ` transform="rotate(${rot} ${s.x + s.w / 2} ${s.y + s.h / 2})"`;
}


function resizeHandles(s, measure = false) {
  const size = 6, half = size / 2;
  if (measure || s.type === 'hole') return `<rect class="resize-handle handle-se compact-handle" data-handle="se" x="${s.x + s.w - half}" y="${s.y + s.h - half}" width="${size}" height="${size}"/>`;
  const pts = [
    ['nw', s.x - half, s.y - half], ['ne', s.x + s.w - half, s.y - half],
    ['sw', s.x - half, s.y + s.h - half], ['se', s.x + s.w - half, s.y + s.h - half]
  ];
  return pts.map(([h,x,y]) => `<rect class="resize-handle compact-handle handle-${h}" data-handle="${h}" x="${x}" y="${y}" width="${size}" height="${size}"/>`).join('');
}
function tableSlotLines(s) {
  const lines = [];
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  lines.push(`<line class="table-centerline" x1="${cx}" y1="${s.y}" x2="${cx}" y2="${s.y + s.h}"/>`);
  lines.push(`<line class="table-centerline" x1="${s.x}" y1="${cy}" x2="${s.x + s.w}" y2="${cy}"/>`);
  const step = 45;
  for (let yy = cy - step; yy > s.y + 18; yy -= step) lines.push(`<line class="table-slot" x1="${s.x + 16}" y1="${yy}" x2="${s.x + s.w - 16}" y2="${yy}"/>`);
  for (let yy = cy + step; yy < s.y + s.h - 18; yy += step) lines.push(`<line class="table-slot" x1="${s.x + 16}" y1="${yy}" x2="${s.x + s.w - 16}" y2="${yy}"/>`);
  return lines.join('');
}
function sketchGuideSvg() {
  return sketchGuides.map(g => g.dir === 'x'
    ? `<line class="sketch-guide" x1="${g.value}" y1="0" x2="${g.value}" y2="420"/>`
    : `<line class="sketch-guide" x1="0" y1="${g.value}" x2="900" y2="${g.value}"/>`).join('');
}
function snapMove(s, x, y) {
  sketchGuides = [];
  if (s?.type === 'offset') return { x: Math.round(x), y: Math.round(y) };
  const p = activeProject();
  let nx = Math.round(x / SNAP_STEP) * SNAP_STEP, ny = Math.round(y / SNAP_STEP) * SNAP_STEP;
  const cx = nx + s.w / 2, cy = ny + s.h / 2;
  const targets = [450, 210].map((value, i) => ({ dir: i === 0 ? 'x' : 'y', value }));
  (p?.shapes || []).forEach(o => {
    if (o.id === s.id) return;
    if (o.type === 'table' || o.type === 'fixture' || o.type === 'raw' || o.type === 'viseH' || o.type === 'viseV') {
      targets.push({ dir:'x', value:o.x + o.w / 2 });
      targets.push({ dir:'y', value:o.y + o.h / 2 });
      if (o.type === 'table') {
        targets.push({ dir:'x', value:o.x }); targets.push({ dir:'x', value:o.x + o.w });
        targets.push({ dir:'y', value:o.y }); targets.push({ dir:'y', value:o.y + o.h });
      }
    }
  });
  for (const t of targets) {
    if (t.dir === 'x' && Math.abs(cx - t.value) <= 8) { nx = Math.round((t.value - s.w / 2) / SNAP_STEP) * SNAP_STEP; sketchGuides.push(t); }
    if (t.dir === 'y' && Math.abs(cy - t.value) <= 8) { ny = Math.round((t.value - s.h / 2) / SNAP_STEP) * SNAP_STEP; sketchGuides.push(t); }
  }
  return { x: nx, y: ny };
}
function resizeFromHandle(s, dragInfo, pt) {
  const min = s.type === 'divider' ? 6 : 10;
  const h = dragInfo.handle || 'se';
  let x = dragInfo.start.x, y = dragInfo.start.y, w = dragInfo.start.w, hh = dragInfo.start.h;
  const px = Math.round(pt.x / SNAP_STEP) * SNAP_STEP, py = Math.round(pt.y / SNAP_STEP) * SNAP_STEP;
  if (h.includes('e')) w = px - x;
  if (h.includes('s')) hh = py - y;
  if (h.includes('w')) { const right = x + w; x = px; w = right - x; }
  if (h.includes('n')) { const bottom = y + hh; y = py; hh = bottom - y; }
  if (w < min) { if (h.includes('w')) x = x + w - min; w = min; }
  if (hh < min) { if (h.includes('n')) y = y + hh - min; hh = min; }
  if (s.type === 'hole') {
    const size = Math.max(min, Math.max(Math.abs(w), Math.abs(hh)));
    if (h.includes('w')) x = dragInfo.start.x + dragInfo.start.w - size;
    if (h.includes('n')) y = dragInfo.start.y + dragInfo.start.h - size;
    w = size; hh = size;
  }
  Object.assign(s, { x, y, w, h: hh });
}


function shapeColorStyle(s, fallbackFill, fallbackStroke) {
  const map = {
    blue: ['#dbeafe', '#1d4ed8'], green: ['#dcfce7', '#15803d'], yellow: ['#fef9c3', '#a16207'],
    orange: ['#ffedd5', '#c2410c'], red: ['#fee2e2', '#b91c1c'], violet: ['#ede9fe', '#7c3aed'], gray: ['#e5e7eb', '#374151']
  };
  const c = map[s?.color || ''];
  return c ? { fill: c[0], stroke: c[1] } : { fill: fallbackFill, stroke: fallbackStroke };
}
function applyColorToSelection(color) {
  const items = selectedShapes();
  if (!items.length) { toast('Erst Baustein oder Gruppe auswählen'); return; }
  items.forEach(s => {
    if (!['measure','offset','divider','table'].includes(s.type)) s.color = color || '';
  });
  save();
}
function renderColorButtons() {
  const grid = $('shapeColorGrid');
  if (!grid) return;
  const items = selectedShapes().filter(s => !['measure','offset','divider','table'].includes(s.type));
  const current = items.length ? items[0].color || '' : '';
  grid.querySelectorAll('[data-shape-color]').forEach(btn => btn.classList.toggle('active', btn.dataset.shapeColor === current));
}

function shapeSvg(s) {
  const p = activeProject();
  const isSel = selectedShapeIds.has(s.id);
  const isActive = selectedShapeId === s.id;
  const sel = (isSel ? ' selected' : '') + (s.groupId && p?.showGroupOutline ? ' grouped' : '');
  const label = esc(s.label || defaultLabel(s.type));
  const showLabel = !!p?.showShapeLabels;
  const l = labelXY(s, p);
  const tr = shapeTransform(s);
  if (s.type === 'divider') return `<g class="shape${sel}" data-shape-id="${s.id}"><rect class="shape-main" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#777" stroke="#555"${tr}/>${showLabel ? `<text class="shape-small draggable-label" data-label-drag="1" x="${l.x}" y="${l.y}">${label}</text>` : ''}${isActive ? resizeHandles(s) : ''}</g>`;
  if (s.type === 'offset') {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2, r = Math.max(s.w, s.h) / 2;
    const q = (a1, a2, fill) => {
      const rad = d => d * Math.PI / 180;
      const x1 = cx + r * Math.cos(rad(a1)), y1 = cy + r * Math.sin(rad(a1));
      const x2 = cx + r * Math.cos(rad(a2)), y2 = cy + r * Math.sin(rad(a2));
      const large = Math.abs(a2-a1) > 180 ? 1 : 0;
      return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${fill}" stroke="#0b5aa8" stroke-width="1"/>`;
    };
    return `<g class="shape${sel}" data-shape-id="${s.id}">${q(-90,0,'#111')}${q(0,90,'#fff')}${q(90,180,'#111')}${q(180,270,'#fff')}<circle class="shape-main" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#0b5aa8" stroke-width="3"/><line x1="${cx}" y1="${s.y - 8}" x2="${cx}" y2="${s.y + s.h + 8}" stroke="#0b5aa8"/><line x1="${s.x - 8}" y1="${cy}" x2="${s.x + s.w + 8}" y2="${cy}" stroke="#0b5aa8"/><text class="offset-label draggable-label" data-label-drag="1" x="${l.x}" y="${l.y}">${label} ${sideShortFor(s.side, p)}</text>${isActive ? resizeHandles(s) : ''}</g>`;
  }
  if (s.type === 'measure') {
    const m = measureLine(s, p);
    const ext = measureExtensionSvg(s, m, p);
    const coupled = !!(s.refA && s.refB);
    const midX = (m.x1 + m.x2) / 2, midY = (m.y1 + m.y2) / 2;
    const hit = `<line class="measure-hit" x1="${m.x1}" y1="${m.y1}" x2="${m.x2}" y2="${m.y2}"/>`;
    const grip = isActive && coupled ? `<circle class="measure-grip" data-measure-grip="1" cx="${midX}" cy="${midY}" r="7"/><line class="measure-grip-cross" x1="${midX-5}" y1="${midY}" x2="${midX+5}" y2="${midY}"/><line class="measure-grip-cross" x1="${midX}" y1="${midY-5}" x2="${midX}" y2="${midY+5}"/>` : '';
    return `<g class="shape${sel}" data-shape-id="${s.id}">${ext}${hit}<line class="shape-main measure-line" x1="${m.x1}" y1="${m.y1}" x2="${m.x2}" y2="${m.y2}" stroke="#111" stroke-width="2" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)"/><text class="offset-label measure-label draggable-label" data-label-drag="1" x="${l.x}" y="${l.y}">${label}</text>${grip}${isActive && !coupled ? resizeHandles(s, true) : ''}</g>`;
  }
  if (s.type === 'hole') { const cs = shapeColorStyle(s, '#fff', '#111'); return `<g class="shape${sel}" data-shape-id="${s.id}"><ellipse class="shape-main" cx="${s.x + s.w/2}" cy="${s.y + s.h/2}" rx="${Math.max(5, s.w/2)}" ry="${Math.max(5, s.h/2)}" fill="${cs.fill}" stroke="${cs.stroke}" stroke-width="2"${tr}/><line x1="${s.x + s.w/2}" y1="${s.y + 3}" x2="${s.x + s.w/2}" y2="${s.y + s.h - 3}" stroke="#94a3b8"/><line x1="${s.x + 3}" y1="${s.y + s.h/2}" x2="${s.x + s.w - 3}" y2="${s.y + s.h/2}" stroke="#94a3b8"/>${showLabel ? `<text class="shape-small draggable-label" data-label-drag="1" x="${l.x}" y="${l.y}">${label}</text>` : ''}${isActive ? resizeHandles(s) : ''}</g>`; }
  if (s.type === 'slot') { const cs = shapeColorStyle(s, '#fff', '#111'); return `<g class="shape${sel}" data-shape-id="${s.id}"><rect class="shape-main" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${Math.max(6, Math.min(s.w, s.h)/2)}" fill="${cs.fill}" stroke="${cs.stroke}" stroke-width="2"${tr}/><line x1="${s.x + 8}" y1="${s.y + s.h/2}" x2="${s.x + s.w - 8}" y2="${s.y + s.h/2}" stroke="#94a3b8"/>${showLabel ? `<text class="shape-small draggable-label" data-label-drag="1" x="${l.x}" y="${l.y}">${label}</text>` : ''}${isActive ? resizeHandles(s) : ''}</g>`; }
  if (s.type === 'table') {
    const forceTableLabel = /^(Tisch|Langbett)/.test(s.label || '');
    return `<g class="shape${sel}" data-shape-id="${s.id}"><rect class="shape-main" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#eff6ff" stroke="#64748b" stroke-width="2"${tr}/>${tableSlotLines(s)}${(showLabel || forceTableLabel) ? `<text class="shape-label table-side-label draggable-label" data-label-drag="1" x="${l.x}" y="${l.y}">${label}</text>` : ''}${isActive ? resizeHandles(s) : ''}</g>`;
  }
  const baseFill = { viseH:'#fff', viseV:'#fff', fixture:'#f8fafc', raw:'#fef3c7', stop:'#fee2e2', text:'transparent' }[s.type] || '#fff';
  const baseStroke = { viseH:'#555', viseV:'#555', fixture:'#334155', raw:'#a16207', stop:'#dc2626', text:'#94a3b8' }[s.type] || '#555';
  const cs = shapeColorStyle(s, baseFill, baseStroke);
  const fill = s.type === 'text' && !s.color ? 'transparent' : cs.fill;
  const stroke = cs.stroke;
  const labelClass = s.type === 'text' ? 'shape-label text-label draggable-label' : 'shape-label draggable-label';
  const forceTextLabel = s.type === 'text';
  return `<g class="shape${sel}" data-shape-id="${s.id}"><rect class="shape-main" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.type === 'text' ? 4 : 0}" fill="${fill}" stroke="${stroke}" stroke-width="2"${tr}/>${(showLabel || forceTextLabel) ? `<text class="${labelClass}" data-label-drag="1" x="${l.x}" y="${l.y}">${label}</text>` : ''}${isActive ? resizeHandles(s) : ''}</g>`;
}
function defaultLabel(type) {
  return { table:'Tisch / Fläche', divider:'Trennwand', viseH:'Schraubstock quer', viseV:'Schraubstock längs', fixture:'Vorrichtung', raw:'Rohteil', stop:'Anschlag', text:'Text', offset:'G54', measure:'Maß 100 mm', hole:'Bohrung', slot:'Langloch' }[type] || 'Objekt';
}


function shapeCenter(s) { return { x: (Number(s.x)||0) + (Number(s.w)||0) / 2, y: (Number(s.y)||0) + (Number(s.h)||0) / 2 }; }
function shapeBounds(s) {
  if (s?.type === 'measure' && s.refA && s.refB) { const m = measureLine(s); const x1 = Math.min(m.x1, m.x2), x2 = Math.max(m.x1, m.x2), y1 = Math.min(m.y1, m.y2), y2 = Math.max(m.y1, m.y2); return { x1, x2, y1, y2, cx:(x1+x2)/2, cy:(y1+y2)/2 }; }
  const x1 = Math.min(Number(s.x)||0, (Number(s.x)||0) + (Number(s.w)||0));
  const x2 = Math.max(Number(s.x)||0, (Number(s.x)||0) + (Number(s.w)||0));
  const y1 = Math.min(Number(s.y)||0, (Number(s.y)||0) + (Number(s.h)||0));
  const y2 = Math.max(Number(s.y)||0, (Number(s.y)||0) + (Number(s.h)||0));
  return { x1, x2, y1, y2, cx:(x1+x2)/2, cy:(y1+y2)/2 };
}
function activateEdgeMeasure() {
  edgeMeasureMode = true;
  edgeMeasureFirstId = null;
  edgeMeasureFirstRef = null;
  edgeMeasureHoverRef = null;
  $('sketchSvg')?.classList.add('edge-measure-cursor');
  toast('Kantenmaß aktiv: über Kante fahren und erste Kante anklicken');
  const btn = $('edgeMeasureBtn');
  if (btn) btn.classList.add('active-measure');
}
function finishEdgeMeasureIfActive(clickedId, evt) {
  if (!edgeMeasureMode) return false;
  const p = activeProject();
  const clicked = p?.shapes.find(s => s.id === clickedId);
  if (!p || !clicked) return true;
  const pt = evt ? getPoint(evt) : shapeCenter(clicked);
  const clickedEdge = nearestEdge(clicked, pt);
  if (!edgeMeasureFirstId) {
    edgeMeasureFirstId = clickedId;
    edgeMeasureFirstRef = { id: clickedId, edge: clickedEdge };
    selectOnlyShape(clickedId);
    renderSketch();
    toast('Erste Kante gewählt – zweite Kante anklicken');
    return true;
  }
  if (edgeMeasureFirstId === clickedId && edgeMeasureFirstRef?.edge === clickedEdge) {
    toast('Bitte eine andere zweite Kante wählen');
    return true;
  }
  const a = p.shapes.find(s => s.id === edgeMeasureFirstId);
  const b = clicked;
  if (!a || !b) { edgeMeasureMode = false; edgeMeasureFirstId = null; edgeMeasureFirstRef = null; edgeMeasureHoverRef = null; $('sketchSvg')?.classList.remove('edge-measure-cursor'); return true; }
  const temp = { id: uid('s'), type:'measure', refA: edgeMeasureFirstId, edgeA: edgeMeasureFirstRef?.edge || 'right', refB: clickedId, edgeB: clickedEdge, offset: 0, label:'', x:0, y:0, w:0, h:0, side:'center', offsetId:'', rot:0 };
  const m = measureLine(temp, p);
  const gap = m.orientation === 'v' ? Math.round(Math.abs(m.y2 - m.y1)) : Math.round(Math.abs(m.x2 - m.x1));
  edgeMeasureHoverRef = { id: clickedId, edge: clickedEdge };
  renderSketch();
  const txt = prompt('Maßtext / Abstand:', String(gap));
  if (txt !== null) {
    const s = { ...temp, label: txt, labelDx: 0, labelDy: 0 };
    const ml = measureLine(s, p);
    s.x = Math.round(ml.x1); s.y = Math.round(ml.y1); s.w = Math.round(ml.x2 - ml.x1); s.h = Math.round(ml.y2 - ml.y1);
    p.shapes.push(s);
    selectOnlyShape(s.id);
    toast('Kantenmaß eingefügt');
  }
  edgeMeasureMode = false;
  edgeMeasureFirstId = null;
  edgeMeasureFirstRef = null;
  edgeMeasureHoverRef = null;
  $('sketchSvg')?.classList.remove('edge-measure-cursor');
  const btn = $('edgeMeasureBtn');
  if (btn) btn.classList.remove('active-measure');
  save();
  return true;
}
function moveSelectionLayer(direction) {
  const p = activeProject(); if (!p) return;
  normalizeSelection();
  const ids = new Set(selectedShapeIds);
  if (!ids.size) { toast('Erst Objekt wählen'); return; }
  const arr = p.shapes || [];
  let moved = false;
  if (direction === 'front') {
    for (let i = arr.length - 2; i >= 0; i--) {
      if (!ids.has(arr[i].id)) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (ids.has(arr[j].id)) continue;
        if (layerRank(arr[j].type) === layerRank(arr[i].type)) { [arr[i], arr[j]] = [arr[j], arr[i]]; moved = true; }
        break;
      }
    }
  } else {
    for (let i = 1; i < arr.length; i++) {
      if (!ids.has(arr[i].id)) continue;
      for (let j = i - 1; j >= 0; j--) {
        if (ids.has(arr[j].id)) continue;
        if (layerRank(arr[j].type) === layerRank(arr[i].type)) { [arr[i], arr[j]] = [arr[j], arr[i]]; moved = true; }
        break;
      }
    }
  }
  save();
  toast(moved ? 'Ebene innerhalb Objekt-Stufe verschoben' : 'Keine gleiche Objekt-Stufe zum Verschieben');
}
function alignSelection(mode) {
  const items = selectedShapes();
  if (items.length < 2) { toast('Mehrere Objekte markieren'); return; }
  const bounds = items.map(shapeBounds);
  if (mode === 'left') { const v = Math.min(...bounds.map(b=>b.x1)); items.forEach(s => s.x = v); }
  if (mode === 'right') { const v = Math.max(...bounds.map(b=>b.x2)); items.forEach(s => s.x = v - (Number(s.w)||0)); }
  if (mode === 'centerX') { const v = bounds.reduce((sum,b)=>sum+b.cx,0)/bounds.length; items.forEach(s => s.x = Math.round(v - (Number(s.w)||0)/2)); }
  if (mode === 'top') { const v = Math.min(...bounds.map(b=>b.y1)); items.forEach(s => s.y = v); }
  if (mode === 'bottom') { const v = Math.max(...bounds.map(b=>b.y2)); items.forEach(s => s.y = v - (Number(s.h)||0)); }
  if (mode === 'centerY') { const v = bounds.reduce((sum,b)=>sum+b.cy,0)/bounds.length; items.forEach(s => s.y = Math.round(v - (Number(s.h)||0)/2)); }
  save(); toast('Ausgerichtet');
}

function beginMeasureOffsetDrag(s, pt) {
  const ml = measureLine(s);
  return {
    id: s.id,
    mode: 'measureOffset',
    startOffset: Number(s.offset) || 0,
    startPt: { x: pt.x, y: pt.y },
    orientation: ml.orientation
  };
}

function addShape(type) {
  const p = activeProject();
  if (!p) { toast('Erst Projekt anlegen oder öffnen'); return; }
  let s = { id: uid('s'), type, x: 120, y: 90, w: 150, h: 70, label: defaultLabel(type), side: 'center', offsetId: '' };
  if (type === 'divider') s = { ...s, x: 446, y: 40, w: 8, h: 330, label: 'Trennwand' };
  if (type === 'viseV') s = { ...s, w: 70, h: 140, label: 'Schraubstock längs' };
  if (type === 'viseH') s = { ...s, w: 150, h: 80, label: 'Schraubstock quer' };
  if (type === 'raw') s = { ...s, w: 130, h: 50, label: 'Rohteil' };
  if (type === 'hole') s = { ...s, w: 36, h: 36, label: 'Bohrung' };
  if (type === 'slot') s = { ...s, w: 90, h: 30, label: 'Langloch' };
  if (type === 'fixture') s = { ...s, w: 160, h: 80, label: 'Vorrichtung' };
  if (type === 'stop') s = { ...s, w: 20, h: 90, label: 'Anschlag' };
  if (type === 'measure') { const txt = prompt('Maßtext:', '100 mm'); if (txt === null) return; s = { ...s, x: 160, y: 80, w: 180, h: 0, label: txt }; }
  if (type === 'text') { const txt = prompt('Textfeld:', 'Notiz'); if (txt === null) return; s = { ...s, label: txt, w: 170, h: 45 }; }
  if (type === 'table') p.shapes.unshift(s); else p.shapes.push(s);
  selectOnlyShape(s.id);
  save();
  toast(`${defaultLabel(type)} eingefügt`);
}

function getPoint(evt) {
  const svg = $('sketchSvg');
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function selectedShape() { normalizeSelection(); return activeProject()?.shapes.find(s => s.id === selectedShapeId) || null; }

function duplicateShapeObject(source, dx = 25, dy = 25) {
  const cp = cleanShape({ ...JSON.parse(JSON.stringify(source)), id: uid('s'), x: num(source.x, 120) + dx, y: num(source.y, 90) + dy });
  if (cp.type === 'offset') {
    const o = ensureOffset(offsetBaseName(cp.label || 'G54'), cp.side || 'center', 'kopierter Nullpunkt');
    cp.offsetId = o.id;
  } else {
    cp.offsetId = '';
  }
  return cp;
}

function copySelectedShapeToClipboard() {
  const items = selectedShapes();
  if (!items.length) { toast('Erst Objekt wählen'); return false; }
  shapeClipboard = JSON.parse(JSON.stringify(items));
  toast(items.length === 1 ? 'Objekt kopiert' : `${items.length} Objekte kopiert`);
  return true;
}
function pasteShapeFromClipboard() {
  const p = activeProject();
  const items = Array.isArray(shapeClipboard) ? shapeClipboard : (shapeClipboard ? [shapeClipboard] : []);
  if (!p || !items.length) { toast('Nichts kopiert'); return; }
  const groupMap = new Map();
  const pasteDx = 28, pasteDy = 28;
  const clones = items.map((src) => {
    // Wichtig für Gruppen: Alle Bausteine bekommen denselben Versatz.
    // Früher bekam jedes Element einen kleinen zusätzlichen Offset; dadurch verrutschten Loch/Langloch im Rohteil.
    const cp = duplicateShapeObject(src, pasteDx, pasteDy);
    if (src.groupId) {
      if (!groupMap.has(src.groupId)) groupMap.set(src.groupId, uid('g'));
      cp.groupId = groupMap.get(src.groupId);
    } else cp.groupId = '';
    return cp;
  });
  const idMap = new Map(items.map((src, i) => [src.id, clones[i].id]));
  clones.forEach(cp => {
    if (cp.type === 'measure') {
      if (idMap.has(cp.refA)) cp.refA = idMap.get(cp.refA);
      if (idMap.has(cp.refB)) cp.refB = idMap.get(cp.refB);
    }
  });
  p.shapes.push(...clones);
  selectedShapeIds = new Set(clones.map(c => c.id));
  selectedShapeId = clones[clones.length - 1]?.id || null;
  save();
  toast(clones.length === 1 ? 'Objekt eingefügt' : `${clones.length} Objekte eingefügt`);
}
function deleteSelectedShape() {
  const p = activeProject();
  const items = selectedShapes();
  if (!p || !items.length) return;
  const ids = new Set(items.map(s => s.id));
  const offsetIds = new Set(items.filter(s => s.type === 'offset' && s.offsetId).map(s => s.offsetId));
  p.shapes = p.shapes.filter(x => !ids.has(x.id));
  p.offsets = (p.offsets || []).filter(o => !offsetIds.has(o.id));
  clearShapeSelection();
  save();
}


function addOffsetMarker(name, side, x, y) {
  const o = ensureOffset(name || 'G54', side || 'center', `Nullpunkt ${sideNameFor(side)}`);
  const p = activeProject(); if (!o || !p) return;
  const s = { id: uid('s'), type: 'offset', x: Math.round(x - 17), y: Math.round(y - 17), w: 34, h: 34, label: o.name, side: o.side, offsetId: o.id };
  p.shapes.push(s);
  selectOnlyShape(s.id);
  pendingOffsetPreset = null;
  updatePresetStatus();
  save();
}


function renderOffsetPresets() {
  const grid = $('offsetPresetGrid');
  if (!grid) return;
  const p = activeProject();
  const pallet = usesPallet(p);
  const sides = pallet ? [['table1','T1'], ['table2','T2']] : [['left','L'], ['right','R']];
  grid.innerHTML = ['G54','G55','G56','G57','G58','G59'].map(g => sides.map(([side, short]) => `<button class="np-btn" data-offset-preset="${g}" data-side="${side}">${g} ${short}</button>`).join('')).join('');
  const hint = $('npModeHint');
  if (hint) hint.textContent = pallet ? 'Wechseltisch aktiv: Nullpunkte werden nach Tisch 1 / Tisch 2 getrennt.' : 'G54 links und G54 rechts sind getrennt möglich.';
  $$('.np-btn', grid).forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); pendingOffsetPreset = { name: btn.dataset.offsetPreset, side: btn.dataset.side }; updatePresetStatus(); toast(`${pendingOffsetPreset.name} ${sideShortFor(pendingOffsetPreset.side, p)} aktiv – Position anklicken`); }));
  updatePresetStatus();
}

function updatePresetStatus() {
  $$('.np-btn').forEach(btn => btn.classList.toggle('active', pendingOffsetPreset && btn.dataset.offsetPreset === pendingOffsetPreset.name && btn.dataset.side === pendingOffsetPreset.side));
  const st = $('presetStatus');
  if (st) st.textContent = pendingOffsetPreset ? `${pendingOffsetPreset.name} ${sideShortFor(pendingOffsetPreset.side)} aktiv – jetzt Position in der Skizze anklicken.` : 'Kein Nullpunkt-Preset aktiv.';
}

function renderTools() {
  const el = $('toolList'); if (!el) return;
  const p = activeProject();
  if (!p) { el.innerHTML = '<p class="note">Kein Projekt aktiv.</p>'; fillToolForm(); return; }
  el.innerHTML = (p.tools || []).map(t => `<button type="button" class="list-card ${db.activeTool === t.pid ? 'active' : ''}" data-tool-id="${esc(t.pid)}" onclick="selectTool('${jsArg(t.pid)}')"><b>${esc(t.no)} · ${esc(t.name)}</b><br><small>${esc(t.type)} · Ø${esc(t.dia || '-')} · ${esc(t.holder || '-')} · n ${esc(t.rpm || '-')} · vf ${esc(t.feed || '-')}</small></button>`).join('') || '<p class="note">Noch keine Werkzeuge in diesem Projekt. Mit „+ Werkzeug im Projekt“ starten.</p>';
  fillToolForm();
}

function fillToolForm() {
  const t = activeTool() || blankTool();
  ['no','name','type','dia','teeth','holder','vc','fz','rpm','feed','coolant','notes'].forEach(k => { const el = $('t_' + k); if (el) el.value = t[k] || ''; });
}
function toolFromForm(id) {
  return cleanTool({ pid: id || uid('pt'), id: id || uid('t'), no: $('t_no').value || 'T?', name: $('t_name').value || 'Werkzeug', type: $('t_type').value, dia: $('t_dia').value, teeth: $('t_teeth').value, holder: $('t_holder').value, vc: $('t_vc').value, fz: $('t_fz').value, coolant: $('t_coolant').value, rpm: $('t_rpm').value, feed: $('t_feed').value, notes: $('t_notes').value });
}

function toolCountForBlank() {
  const top = $('blankToolCount');
  const preview = $('blankToolCountPreview');
  const raw = top?.value || preview?.value || '15';
  return Math.max(1, Math.min(20, parseInt(raw, 10) || 15));
}
function sketchHeightForToolCount(count) {
  if (count <= 10) return 310;
  if (count <= 15) return 255;
  if (count <= 18) return 220;
  return 190;
}
function syncBlankToolCount(source) {
  const top = $('blankToolCount');
  const preview = $('blankToolCountPreview');
  const val = Math.max(1, Math.min(20, parseInt(source?.value || '15', 10) || 15));
  if (top) top.value = String(val);
  if (preview) preview.value = String(val);
}

function renderPrint() {
  const el = $('printSheet'); if (!el) return;
  const p = activeProject();
  if (!p) { el.innerHTML = '<p>Kein Projekt aktiv.</p>'; return; }
  const m = db.machines.find(x => x.id === p.machineId) || {};
  const ax = axesForProject();
  const offsets = (p.offsets || []).filter(o => o && (o.name || o.desc || ax.some(a => o[a])));
  const offsetRows = offsets.length
    ? offsets.map(o => `<tr><td><b>${esc(offsetBaseName(o.name))}</b></td><td>${esc(sideNameFor(o.side, p))}</td><td>${esc(o.desc || '')}</td>${ax.map(a => `<td>${esc(o[a] || '')}</td>`).join('')}</tr>`).join('')
    : `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>${ax.map(() => '<td>&nbsp;</td>').join('')}</tr>`;
  const offsetSideHeader = m.pallet ? 'Tisch' : 'Seite';
  const coordWidth = Math.max(10, Math.floor(48 / Math.max(3, ax.length)));
  const offsetColgroup = `<colgroup><col style="width:10%"><col style="width:14%"><col style="width:${100 - 10 - 14 - coordWidth * ax.length}%">${ax.map(() => `<col style="width:${coordWidth}%">`).join('')}</colgroup>`;
  const svgMarkup = `<svg viewBox="0 -20 900 460" preserveAspectRatio="xMidYMid meet" class="print-svg ${p.printShapeLabels ? '' : 'print-hide-labels'}"><defs><marker id="arrowP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#111"/></marker><marker id="dimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 5 L 10 0 L 10 10 z" fill="#111"/></marker><marker id="dimArrowP" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 5 L 10 0 L 10 10 z" fill="#111"/></marker></defs><g class="axis-fixed"><line x1="6" y1="412" x2="86" y2="412" stroke="#111" stroke-width="3" marker-end="url(#arrowP)"/><line x1="6" y1="412" x2="6" y2="332" stroke="#111" stroke-width="3" marker-end="url(#arrowP)"/><text x="94" y="417" font-size="16" font-weight="800">X</text><text x="1" y="324" font-size="16" font-weight="800">Y</text></g>${orderedShapes(p).map(shapeSvg).join('')}</svg>`;
  const tools = (p.tools || []).filter(t => t && (t.no || t.name || t.dia || t.teeth || t.feed || t.rpm || t.coolant || t.holder || t.notes));
  const shownTools = tools;
  const restTools = [];
  el.style.setProperty('--sketch-h', sketchHeightForToolCount(Math.max(10, Math.min(20, shownTools.length || 10))) + 'px');

  el.innerHTML = `<div class="print-title"><div>Einrichtblatt</div><div>${esc(db.settings.companyName || '')}</div></div><div class="setup-top"><div class="setup-field"><b>Datum:</b><span>${esc(p.date)}</span></div><div class="setup-field"><b>Name:</b><span>${esc(p.operator)}</span></div><div class="setup-field"><b>Teile-Bezeichnung:</b><span>${esc(p.part || p.name)}</span></div><div class="setup-field"><b>Zeichnung Nr.:</b><span>${esc(p.drawing)}</span></div><div class="setup-field"><b>Maschine:</b><span>${esc(m.name || '')}</span></div><div class="setup-field"><b>Maschinenmodus:</b><span>${esc(machineModeLabel(p))}</span></div><div class="setup-field"><b>Programm Nr.:</b><span>${programSummaryHtml(p)}</span></div><div class="setup-field"><b>Arbeitsgang Nr.:</b><span>${esc(p.operation)}</span></div><div class="setup-field"><b>Material:</b><span>${esc(p.material)}</span></div><div class="setup-field"><b>N = Nullpunkte:</b><span>${esc(offsets.map(o => `${offsetBaseName(o.name)} ${sideShortFor(o.side, p)}`).join(', '))}</span></div><div class="setup-field"><b>Achsen:</b><span>${esc(ax.join(' / '))}</span></div><div class="setup-field"><b>Aufspannung:</b><span>${esc(p.setup)}</span></div><div class="setup-field"><b>Spannbacken:</b><span>${esc(p.jaws)}</span></div><div class="setup-field"><b>Spannvorrichtung:</b><span>${esc(p.fixture)}</span></div><div class="setup-field"><b>Schraubstock:</b><span>${esc(p.clamping)}</span></div></div><div class="print-section-title">Nullpunkte / Koordinaten</div><table class="offset-print-table">${offsetColgroup}<thead><tr><th>NP</th><th>${offsetSideHeader}</th><th>Lage / Beschreibung</th>${ax.map(a => `<th>${a}</th>`).join('')}</tr></thead><tbody>${offsetRows}</tbody></table><div class="print-main full"><div class="print-sketch">${svgMarkup}</div></div><div class="print-section-title">Werkzeugfolge</div>${toolTable(shownTools)}<div class="print-notes"><b>Notizen:</b><br>${esc(p.notes || '')}</div><p class="footer-small">${[db.settings.footerNote1, db.settings.footerNote2, db.settings.footerNote3, db.settings.footerNote4].filter(Boolean).map(esc).join(' · ')}</p>${restTools.length ? `<div class="tools-page"><h2>Werkzeugliste – ${esc(p.name)}</h2>${toolTable(restTools)}<p class="footer-small">Mehr als 10 Werkzeuge: komplette Werkzeugliste bewusst auf separatem Blatt.</p></div>` : ''}`;
}

function toolTable(list, minRows = 0) {
  const rows = (list || []).map((t, i) => `<tr><td>${i + 1}</td><td>${esc(t.no)}</td><td>${esc(t.name)}</td><td>${esc(t.teeth)}</td><td>${esc(t.dia)}</td><td>${esc(t.feed)}</td><td>${esc(t.rpm)}</td><td>${esc(t.coolant)}</td><td>${esc(t.holder)}</td><td>${esc(t.notes)}</td></tr>`);
  while (rows.length < minRows) rows.push(`<tr><td>${rows.length + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`);
  if (!rows.length) rows.push('<tr><td colspan="10">Keine Werkzeuge eingetragen.</td></tr>');
  return `<table class="tall-print-table tool-print-table"><colgroup><col style="width:4%"><col style="width:7%"><col style="width:24%"><col style="width:4%"><col style="width:5%"><col style="width:8%"><col style="width:8%"><col style="width:7%"><col style="width:10%"><col style="width:23%"></colgroup><thead><tr><th>#</th><th>T</th><th>Werkzeugbenennung</th><th>Z</th><th>Ø</th><th>Vorsch.</th><th>Drehz.</th><th>Kühl.</th><th>Halter</th><th>Bemerkung</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function selectMachine(id) {
  if (!db.machines.some(m => m.id === id)) return;
  db.activeMachine = id;
  const p = activeProject();
  if (!p || p.machineId !== id) {
    db.activeProject = db.projects.find(pr => pr.machineId === id)?.id || null;
    db.activeTool = activeProject()?.tools[0]?.pid || null;
  }
  save();
  toast('Maschine ausgewählt');
}

function openProject(id) {
  const p = db.projects.find(pr => pr.id === id);
  if (!p) return;
  db.activeProject = id;
  db.activeMachine = p.machineId || db.activeMachine;
  db.activeTool = p.tools[0]?.pid || null;
  save();
  openTab('sheet');
}

function selectTool(id) { db.activeTool = id; save(); }
window.selectMachine = selectMachine;
window.openProject = openProject;
window.selectTool = selectTool;


function blankRows(count, cols) {
  return Array.from({ length: count }, () => `<tr>${Array.from({ length: cols }, () => '<td>&nbsp;</td>').join('')}</tr>`).join('');
}
function renderBlankPrint() {
  const el = $('printSheet'); if (!el) return;
  const p = activeProject() || blankProject(db.activeMachine);
  const m = db.machines.find(x => x.id === p.machineId) || activeMachine() || {};
  const blankToolCount = toolCountForBlank();
  el.style.setProperty('--sketch-h', sketchHeightForToolCount(blankToolCount) + 'px');
  const ax = axesForProject();
  const sideHeader = m.pallet ? 'Tisch' : 'Seite';
  const offsetColgroup = `<colgroup><col style="width:10%"><col style="width:14%"><col style="width:28%">${ax.map(() => '<col style="width:16%">').join('')}</colgroup>`;
  const emptyOffsets = Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>${ax.map(() => '<td>&nbsp;</td>').join('')}</tr>`).join('');
  const emptyTools = Array.from({ length: blankToolCount }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('');
  const tableShapes = machineTemplateShapes(m).filter(s => s.type === 'table');
  const svgMarkup = `<svg viewBox="0 -20 900 460" preserveAspectRatio="xMidYMid meet" class="print-svg"><defs><marker id="arrowP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#111"/></marker></defs><g class="axis-fixed"><line x1="6" y1="412" x2="86" y2="412" stroke="#111" stroke-width="3" marker-end="url(#arrowP)"/><line x1="6" y1="412" x2="6" y2="332" stroke="#111" stroke-width="3" marker-end="url(#arrowP)"/><text x="94" y="417" font-size="16" font-weight="800">X</text><text x="1" y="324" font-size="16" font-weight="800">Y</text></g>${orderedShapes({shapes: tableShapes}).map(shapeSvg).join('')}</svg>`;
  el.innerHTML = `<div class="print-title"><div>Einrichtblatt</div><div>${esc(db.settings.companyName || '')}</div></div><div class="setup-top">${['Datum:','Name:','Teile-Bezeichnung:','Zeichnung Nr.:','Maschine:','Programm Nr.:','Arbeitsgang Nr.:','Material:','N = Nullpunkte:','Achsen:','Aufspannung:','Spannbacken:','Spannvorrichtung:','Schraubstock:'].map(label => `<div class="setup-field"><b>${label}</b><span>&nbsp;</span></div>`).join('')}</div><div class="print-section-title">Nullpunkte / Koordinaten</div><table class="offset-print-table tall-print-table">${offsetColgroup}<thead><tr><th>NP</th><th>${sideHeader}</th><th>Lage / Beschreibung</th>${ax.map(a => `<th>${a}</th>`).join('')}</tr></thead><tbody>${emptyOffsets}</tbody></table><div class="print-main full"><div class="print-sketch">${svgMarkup}</div></div><div class="print-section-title">Werkzeugfolge</div><table class="tall-print-table tool-print-table"><colgroup><col style="width:4%"><col style="width:7%"><col style="width:24%"><col style="width:4%"><col style="width:5%"><col style="width:8%"><col style="width:8%"><col style="width:7%"><col style="width:10%"><col style="width:23%"></colgroup><thead><tr><th>#</th><th>T</th><th>Werkzeugbenennung</th><th>Z</th><th>Ø</th><th>Vorsch.</th><th>Drehz.</th><th>Kühl.</th><th>Halter</th><th>Bemerkung</th></tr></thead><tbody>${emptyTools}</tbody></table><div class="print-notes"><b>Notizen:</b><br>&nbsp;</div>`;
}
function printBlank() {
  renderBlankPrint();
  setTimeout(() => window.print(), 50);
  setTimeout(() => renderPrint(), 700);
}
function tableByName(names) {
  const p = activeProject();
  return (p?.shapes || []).find(s => s.type === 'table' && names.some(n => String(s.label || '').toLowerCase().includes(n)));
}

function copyOpposite180() {
  const p = activeProject(); if (!p) { toast('Erst Projekt öffnen'); return; }
  const m = activeMachineForProject(p);
  let source = null, target = null, sourceSide = 'left', targetSide = 'right';
  if (m.pallet) {
    source = tableByName(['tisch 1']); target = tableByName(['tisch 2']);
    sourceSide = 'table1'; targetSide = 'table2';
  } else {
    source = tableByName(['langbett', 'tischfläche']); target = source;
    sourceSide = 'left'; targetSide = 'right';
  }
  if (!source || !target) { toast('Erst Maschinen-Vorlage einfügen'); return; }

  const dividerX = source.x + source.w / 2;
  const isSourceShape = s => {
    if (!s || s.type === 'table' || s.type === 'divider') return false;
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    const insideSource = cx >= source.x && cx <= source.x + source.w && cy >= source.y && cy <= source.y + source.h;
    if (m.pallet) return s.side === sourceSide || s.side === 'left' || insideSource;
    return s.side === sourceSide || (insideSource && cx < dividerX);
  };

  const clones = [];
  const offsetAssignments = [];
  for (const s of (p.shapes || []).filter(isSourceShape)) {
    const cp = cleanShape(JSON.parse(JSON.stringify(s)));
    cp.id = uid('s');
    cp.rot = ((Number(cp.rot) || 0) + 180) % 360;
    cp.side = targetSide;

    if (m.pallet) {
      cp.x = Math.round(target.x + (source.w - ((s.x - source.x) + s.w)));
      cp.y = Math.round(target.y + (source.h - ((s.y - source.y) + s.h)));
    } else {
      cp.x = Math.round(dividerX + (dividerX - (s.x + s.w)));
      cp.y = Math.round(source.y + (source.h - ((s.y - source.y) + s.h)));
    }

    if (cp.type === 'offset') {
      const baseName = offsetBaseName(cp.label || 'G54');
      cp.offsetId = ''; // erst nach erfolgreicher Shape-Erzeugung vergeben
      cp.label = baseName;
      cp.side = targetSide;
      offsetAssignments.push({ shapeId: cp.id, baseName });
    } else {
      cp.offsetId = '';
    }
    clones.push(cp);
  }
  if (!clones.length) { toast('Keine Bausteine auf Ausgangsseite gefunden'); return; }

  // Erst jetzt Nullpunkt-Zeilen erzeugen, damit keine Tabellen-Einträge entstehen,
  // wenn grafisch gar nichts kopiert wurde.
  for (const item of offsetAssignments) {
    const cp = clones.find(c => c.id === item.shapeId);
    if (!cp) continue;
    const o = ensureOffset(item.baseName, targetSide, m.pallet ? 'Nullpunkt Tisch 2' : 'Nullpunkt rechts', true);
    cp.offsetId = o?.id || '';
    cp.side = o?.side || targetSide;
    cp.label = o?.name || item.baseName;
  }

  p.shapes.push(...clones);
  selectedShapeIds = new Set(clones.map(c => c.id));
  selectedShapeId = clones[clones.length - 1]?.id || null;
  save();
  toast(`${clones.length} Baustein(e) 180° kopiert`);
}


function bindAll() {
  $('tabs')?.addEventListener('click', e => { const btn = e.target.closest('button[data-tab]'); if (btn) openTab(btn.dataset.tab); });

  ['companyName','companySub','footerNote1','footerNote2','footerNote3','footerNote4'].forEach(id => $(id)?.addEventListener('input', () => { db.settings[id] = $(id).value; save(true); renderPrint(); }));

  $('btnDemo').onclick = demo;
  $('btnBlankPrint')?.addEventListener('click', printBlank);
  $('btnBlankPrintPreview')?.addEventListener('click', printBlank);
  $('blankToolCount')?.addEventListener('change', e => syncBlankToolCount(e.target));
  $('blankToolCountPreview')?.addEventListener('change', e => syncBlankToolCount(e.target));
  $('btnExport').onclick = () => {
    const blob = new Blob([JSON.stringify(cleanDb(db), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'warenschmiede_cnc_einrichtblatt_plus_backup.json';
    a.click(); URL.revokeObjectURL(a.href);
  };
  $('importFile').onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { db = cleanDb(JSON.parse(reader.result)); save(); toast('JSON importiert'); } catch (err) { alert('JSON konnte nicht gelesen werden. Details: ' + (err?.message || err)); } e.target.value = ''; };
    reader.readAsText(file);
  };

  document.body.addEventListener('click', e => {
    const machine = e.target.closest('[data-machine-id]'); if (machine) { selectMachine(machine.dataset.machineId); return; }
    const project = e.target.closest('[data-project-id]'); if (project) { openProject(project.dataset.projectId); return; }
    const tool = e.target.closest('[data-tool-id]'); if (tool) { db.activeTool = tool.dataset.toolId; save(); return; }
    const delOffset = e.target.closest('[data-delete-offset]'); if (delOffset) { const p = activeProject(); if (p) { p.offsets = p.offsets.filter(o => o.id !== delOffset.dataset.deleteOffset); p.shapes = p.shapes.filter(s => s.offsetId !== delOffset.dataset.deleteOffset); save(); } return; }
    const addOff = e.target.closest('[data-add-offset]'); if (addOff) { ensureOffset('G54', addOff.dataset.addOffset, ''); save(); return; }
  });

  $$('.compact-buttons [data-shape-btn]').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); addShape(btn.dataset.shapeBtn); }));
  $('edgeMeasureBtn')?.addEventListener('click', e => { e.preventDefault(); activateEdgeMeasure(); });
  $('bringFront')?.addEventListener('click', e => { e.preventDefault(); moveSelectionLayer('front'); });
  $('sendBack')?.addEventListener('click', e => { e.preventDefault(); moveSelectionLayer('back'); });
  $$('[data-align]').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); alignSelection(btn.dataset.align); }));
  $('applyMachineTemplate').onclick = () => applyMachineTemplate(false);
  renderOffsetPresets();

  $('newMachine').onclick = () => { const m = blankMachine(); db.machines.push(m); db.activeMachine = m.id; addHistory('Maschine neu', m.name); save(); };
  $('machineSearch')?.addEventListener('input', renderMachines);
  $('machineAxisFilter')?.addEventListener('change', renderMachines);
  $('m_kind')?.addEventListener('change', () => { updateMachineKindUi(); });
  $('saveMachine').onclick = () => { const i = db.machines.findIndex(m => m.id === db.activeMachine); const m = machineFromForm(db.activeMachine); if (i >= 0) { db.machines[i] = m; addHistory('Maschine bearbeitet', m.name, m.id); } else { db.machines.push(m); addHistory('Maschine neu', m.name, m.id); } db.activeMachine = m.id; save(); toast('Maschine gespeichert'); };
  $('deleteMachine').onclick = () => { if (!db.activeMachine) return; if (confirm('Maschine löschen? Projekte bleiben erhalten, sind dann ohne Maschine.')) { const old = db.activeMachine; const name = machineName(old); db.machines = db.machines.filter(m => m.id !== old); db.projects.forEach(p => { if (p.machineId === old) p.machineId = ''; }); db.activeMachine = db.machines[0]?.id || null; db.activeProject = null; addHistory('Maschine gelöscht', name, old); save(); } };

  $('newProject').onclick = () => { const p = blankProject(db.activeMachine); const pm = db.machines.find(m => m.id === p.machineId) || activeMachine(); p.useDivider = !!(pm?.longbed && pm?.divider && !pm?.pallet); p.shapes = machineTemplateShapes(pm, p); db.projects.push(p); db.activeProject = p.id; db.activeTool = null; addHistory('Projekt neu', `${p.name} · ${machineName(p.machineId)}`, p.id); save(); openTab('sheet'); };
  $('dashboardNewProject').onclick = () => { const p = blankProject(db.activeMachine); const pm = db.machines.find(m => m.id === p.machineId) || activeMachine(); p.useDivider = !!(pm?.longbed && pm?.divider && !pm?.pallet); p.shapes = machineTemplateShapes(pm, p); db.projects.push(p); db.activeProject = p.id; db.activeTool = null; addHistory('Projekt neu', `${p.name} · ${machineName(p.machineId)}`, p.id); save(); openTab('sheet'); };
  $('saveProject').onclick = () => { const p = projectFromForm(db.activeProject); const i = db.projects.findIndex(x => x.id === p.id); if (i >= 0) { db.projects[i] = p; addHistory('Projekt bearbeitet', `${p.name} · ${machineName(p.machineId)}`, p.id); } else { db.projects.push(p); addHistory('Projekt neu', `${p.name} · ${machineName(p.machineId)}`, p.id); } db.activeProject = p.id; db.activeMachine = p.machineId; save(); toast('Projekt gespeichert'); };
  $('copyProject').onclick = () => { const p = activeProject(); if (!p) return; const cp = cleanProject(JSON.parse(JSON.stringify(p)), p.machineId); cp.id = uid('p'); cp.name = p.name + ' Kopie'; db.projects.push(cp); db.activeProject = cp.id; db.activeTool = cp.tools[0]?.pid || null; addHistory('Projekt kopiert', `${cp.name} · aus ${p.name}`, cp.id); save(); };
  $('deleteProject').onclick = () => { if (db.activeProject && confirm('Projekt löschen?')) { const old = activeProject(); db.projects = db.projects.filter(p => p.id !== db.activeProject); db.activeProject = db.projects.find(p => p.machineId === db.activeMachine)?.id || null; db.activeTool = activeProject()?.tools[0]?.pid || null; addHistory('Projekt gelöscht', old?.name || 'Projekt', old?.id || ''); save(); } };
  $('projectSearch').oninput = renderProjects;
  $('projectMachineFilter')?.addEventListener('change', e => {
    if (e.target.value === '__all__') {
      projectMachineFilterMode = 'all';
      db.activeProject = null;
      db.activeTool = null;
      renderProjects();
      return;
    }
    projectMachineFilterMode = e.target.value || null;
    if (e.target.value) {
      selectMachine(e.target.value);
    } else {
      renderProjects();
    }
  });
  $('dashboardSearch').oninput = renderDashboardProjects;
  $('p_machineSearch')?.addEventListener('input', fillMachineSelect);
  $('p_machine').onchange = () => { const p = activeProject(); if (p) { p.machineId = $('p_machine').value; db.activeMachine = p.machineId; const m = activeMachineForProject(p); p.useDivider = !!(m.longbed && m.divider && !m.pallet); renderProjectMachineCapabilities(p); renderProgramModeBox(p); save(); } };

  const updateOffsetField = e => { const id = e.target.dataset.off, field = e.target.dataset.field; if (!id || !field) return; const o = activeProject()?.offsets.find(x => x.id === id); if (o) { o[field] = field === 'side' ? normalizeSide(e.target.value) : e.target.value; save(true); renderSketch(); renderPrint(); } };
  $('offsetTable').addEventListener('input', updateOffsetField);
  $('offsetTable').addEventListener('change', updateOffsetField);

  $('newTool').onclick = () => { const p = activeProject(); if (!p) { toast('Erst Projekt öffnen'); return; } const t = blankTool(); p.tools.push(t); db.activeTool = t.pid; save(); };
  $('saveTool').onclick = () => { const p = activeProject(); if (!p) return; const t = toolFromForm(db.activeTool); const i = p.tools.findIndex(x => x.pid === t.pid); if (i >= 0) p.tools[i] = t; else p.tools.push(t); db.activeTool = t.pid; save(); toast('Werkzeug gespeichert'); };
  $('deleteTool').onclick = () => { const p = activeProject(); if (p && db.activeTool && confirm('Werkzeug aus Projekt löschen?')) { p.tools = p.tools.filter(t => t.pid !== db.activeTool); db.activeTool = p.tools[0]?.pid || null; save(); } };
  $('calcToolValues').onclick = () => { const d = parseFloat($('t_dia').value) || 0, vc = parseFloat($('t_vc').value) || 0, z = parseFloat($('t_teeth').value) || 1, fz = parseFloat($('t_fz').value) || 0; if (!d || !vc) { toast('Ø und vc fehlen'); return; } const rpm = Math.round(vc * 1000 / (Math.PI * d)); const feed = Math.round(rpm * z * fz); $('t_rpm').value = rpm; $('t_feed').value = feed || ''; toast('Fräswert: vf = n · z · fz'); };

  const svg = $('sketchSvg');
  svg.addEventListener('pointerdown', e => {
    const shape = e.target.closest('[data-shape-id]');
    if (!shape && pendingOffsetPreset) { const pt = getPoint(e); addOffsetMarker(pendingOffsetPreset.name, pendingOffsetPreset.side, pt.x, pt.y); return; }
    if (!shape) { clearShapeSelection(); renderSketch(); return; }

    const clickedId = shape.dataset.shapeId;
    if (finishEdgeMeasureIfActive(clickedId, e)) return;
    const multiKey = e.shiftKey || e.ctrlKey || e.metaKey;
    const wasSelected = selectedShapeIds.has(clickedId);

    // Ohne Modifikator: einzelnes Objekt auswählen, außer man greift bewusst in eine bestehende Mehrfachauswahl.
    // Mit Shift/Strg: Objekt zur Mehrfachauswahl hinzufügen/entfernen.
    if (multiKey) {
      toggleShapeSelectionRespectGroup(clickedId);
      if (!selectedShapeIds.has(clickedId)) { renderSketch(); return; }
    } else if (!wasSelected || !selectedShapeIds.size) {
      selectShapeRespectGroup(clickedId, false);
    } else {
      selectedShapeId = clickedId;
      // Bei gruppierten Bausteinen bleibt die ganze Gruppe aktiv.
      const gid = groupIdForShape(clickedId);
      if (gid) idsInGroup(gid).forEach(id => selectedShapeIds.add(id));
    }

    const s = selectedShape(); if (!s) return;
    const pt = getPoint(e);
    const isLabel = e.target.closest('[data-label-drag]');
    const base = labelBase(s);
    const resizeTarget = e.target.closest('.resize-handle');
    const measureGrip = e.target.closest('[data-measure-grip]');
    const isCoupledMeasure = s.type === 'measure' && s.refA && s.refB;
    // Beim gekoppelten Kantenmaß wird die Zahl/Linie/der mittlere Kreis als Greifer genutzt.
    // Der Maßpfeil bleibt an den Kanten kleben; bewegt wird nur der Abstand der Maßlinie parallel zur Kante.
    if (isCoupledMeasure && (measureGrip || isLabel || !resizeTarget)) {
      drag = beginMeasureOffsetDrag(s, pt);
    } else {
      drag = isLabel
        ? { id: s.id, mode: 'label', dx: pt.x - (base.x + num(s.labelDx, 0)), dy: pt.y - (base.y + num(s.labelDy, 0)) }
        : { id: s.id, mode: resizeTarget ? 'resize' : 'move', handle: resizeTarget?.dataset.handle || 'se', start: { x: s.x, y: s.y, w: s.w, h: s.h }, dx: pt.x - s.x, dy: pt.y - s.y,
            starts: selectedShapes().map(o => ({ id: o.id, x: Number(o.x) || 0, y: Number(o.y) || 0, w: Number(o.w) || 0, h: Number(o.h) || 0 })) };
    }
    svg.setPointerCapture(e.pointerId);
    renderSketch();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag && edgeMeasureMode) {
      const shape = e.target.closest('[data-shape-id]');
      if (shape) {
        const p = activeProject();
        const o = p?.shapes.find(x => x.id === shape.dataset.shapeId);
        if (o) { const pt0 = getPoint(e); const ref = { id: o.id, edge: nearestEdge(o, pt0) }; if (!edgeMeasureHoverRef || edgeMeasureHoverRef.id !== ref.id || edgeMeasureHoverRef.edge !== ref.edge) { edgeMeasureHoverRef = ref; renderSketch(); } }
      } else if (edgeMeasureHoverRef) { edgeMeasureHoverRef = null; renderSketch(); }
      return;
    }
    if (!drag) return; const s = selectedShape(); if (!s) return; const pt = getPoint(e);
    if (drag.mode === 'measureOffset') {
      const step = 1; // Kantenmaße sollen fein und nicht grob am Raster springen.
      if (drag.orientation === 'h') s.offset = Math.round((drag.startOffset + (pt.y - drag.startPt.y)) / step) * step;
      else if (drag.orientation === 'v') s.offset = Math.round((drag.startOffset + (pt.x - drag.startPt.x)) / step) * step;
      save(true); renderSketch(); renderPrint(); return;
    }
    if (drag.mode === 'move') {
      if (s.type === 'measure' && s.refA && s.refB) { drag = beginMeasureOffsetDrag(s, pt); return; }
      const snapped = snapMove(s, pt.x - drag.dx, pt.y - drag.dy);
      const dx = snapped.x - drag.start.x, dy = snapped.y - drag.start.y;
      const p = activeProject();
      if (selectedShapeIds.size > 1 && p) {
        (drag.starts || []).forEach(st => { const o = p.shapes.find(x => x.id === st.id); if (o) { o.x = st.x + dx; o.y = st.y + dy; } });
      } else { s.x = snapped.x; s.y = snapped.y; }
    }
    else if (drag.mode === 'label') { sketchGuides = []; const base = labelBase(s); s.labelDx = Math.round((pt.x - drag.dx - base.x) / SNAP_STEP) * SNAP_STEP; s.labelDy = Math.round((pt.y - drag.dy - base.y) / SNAP_STEP) * SNAP_STEP; }
    else {
      sketchGuides = [];
      if (s.type === 'measure') {
        const w = Math.round((pt.x - s.x) / SNAP_STEP) * SNAP_STEP;
        const h = Math.round((pt.y - s.y) / SNAP_STEP) * SNAP_STEP;
        const len = Math.hypot(w, h);
        if (len >= 20) { s.w = w; s.h = h; }
      } else {
        resizeFromHandle(s, drag, pt);
      }
    }
    save(true); renderSketch(); renderPrint();
  });
  svg.addEventListener('pointerup', e => { drag = null; sketchGuides = []; renderSketch(); try { svg.releasePointerCapture(e.pointerId); } catch (_) {} save(); });

  $('copyOpposite180').onclick = copyOpposite180;
  $('groupShapes')?.addEventListener('click', e => { e.preventDefault(); groupSelectedShapes(); });
  $('ungroupShapes')?.addEventListener('click', e => { e.preventDefault(); ungroupSelectedShapes(); });
  $('copyShape').onclick = () => { if (copySelectedShapeToClipboard()) pasteShapeFromClipboard(); };
  $('rotateShape').onclick = () => { const s = selectedShape(); if (!s) return; if (s.type === 'measure') { if (s.refA && s.refB) { toast('Kantenmaß bleibt an den gewählten Kanten fest'); return; } const len = Math.max(20, Math.hypot(Number(s.w) || 0, Number(s.h) || 0) || 180); const angle = Math.atan2(Number(s.h) || 0, Number(s.w) || 0) + Math.PI / 4; s.w = Math.round(Math.cos(angle) * len / 5) * 5; s.h = Math.round(Math.sin(angle) * len / 5) * 5; } else { [s.w, s.h] = [s.h, s.w]; } save(); };
  $('deleteShape').onclick = deleteSelectedShape;
  $('clearSketch').onclick = () => { const p = activeProject(); if (p && confirm('Skizze leeren?')) { p.shapes = []; clearShapeSelection(); save(); } };
  $('showShapeLabels').onchange = () => { const p = activeProject(); if (p) { p.showShapeLabels = $('showShapeLabels').checked; save(); } };
  $('printShapeLabels').onchange = () => { const p = activeProject(); if (p) { p.printShapeLabels = $('printShapeLabels').checked; save(); } };
  $('showGroupOutline').onchange = () => { const p = activeProject(); if (p) { p.showGroupOutline = $('showGroupOutline').checked; save(); } };
  $('shapeColorGrid')?.addEventListener('click', e => { const btn = e.target.closest('[data-shape-color]'); if (!btn) return; e.preventDefault(); applyColorToSelection(btn.dataset.shapeColor || ''); });
  $('clearHistory')?.addEventListener('click', e => { e.preventDefault(); if (confirm('Historie leeren?')) { db.history = []; save(); toast('Historie geleert'); } });

  document.addEventListener('keydown', e => {
    const tag = (e.target?.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
    if (typing) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedShape()) { e.preventDefault(); deleteSelectedShape(); }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      if (selectedShape()) { e.preventDefault(); copySelectedShapeToClipboard(); }
      return;
    }
    if (e.key === 'Escape' && edgeMeasureMode) {
      edgeMeasureMode = false; edgeMeasureFirstId = null; edgeMeasureFirstRef = null; edgeMeasureHoverRef = null;
      $('sketchSvg')?.classList.remove('edge-measure-cursor');
      $('edgeMeasureBtn')?.classList.remove('active-measure');
      toast('Kantenmaß abgebrochen');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      if (shapeClipboard) { e.preventDefault(); pasteShapeFromClipboard(); }
    }
  });
}

load();
bindAll();
if (!db.machines.length) demo();
else render();
