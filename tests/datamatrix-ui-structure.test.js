const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const main = read('tools/DataMatrixWerkstattPlus.html');
const app = read('tools/datamatrix-werkstatt/app.js');
const help = read('tools/datamatrix-werkstatt/hilfe.html');
const helpJs = read('tools/datamatrix-werkstatt/hilfe.js');
const css = read('tools/datamatrix-werkstatt/app.css');
const logic = require('../tools/datamatrix-werkstatt/app.js');

test('getrennte DataMatrix-Dateistruktur ist vollständig', () => {
  for (const file of ['tools/DataMatrixWerkstattPlus.html','tools/datamatrix-werkstatt/app.css','tools/datamatrix-werkstatt/app.js','tools/datamatrix-werkstatt/hilfe.html','tools/datamatrix-werkstatt/hilfe.css','tools/datamatrix-werkstatt/hilfe.js']) assert.ok(fs.existsSync(path.join(root,file)), file);
  assert.match(main,/datamatrix-werkstatt\/app\.css/); assert.match(main,/datamatrix-werkstatt\/app\.js/);
  assert.doesNotMatch(main,/<style\b/); assert.doesNotMatch(main,/<script(?![^>]*src=)[^>]*>\s*\S/);
});
test('Menü, Familie, Hilfe und Aktionen sind vorhanden', () => {
  assert.match(main,/toolMenuBtn/); assert.match(app,/Werkzeugfamilie/); assert.match(app,/Barcode-Werkstatt Plus/); assert.match(app,/QR-Werkstatt Plus/);
  assert.match(read('tools/BarcodeWerkstattPlus.html')+read('tools/barcode-werkstatt/app.js'),/DataMatrixWerkstattPlus\.html/); assert.match(read('tools/QRCodeMasterPro.html'),/DataMatrixWerkstattPlus\.html/);
  assert.match(main,/<iframe/); assert.match(app,/wsDataMatrixHelp/); assert.match(app,/help-open/);
  for(const id of ['downloadPng','downloadSvg','copyValue','printSheet']) assert.match(main,new RegExp(`id="${id}"`));
  for(const mode of ['single','copies','series','manual']) assert.match(main,new RegExp(`data-mode="${mode}"`));
});
test('Hilfe enthält alle zentralen Kapitel und keine fertige GS1-Funktion', () => {
  for(const hash of ['start','nutzen','was-ist-datamatrix','vergleich','scanner','inhaltslaenge','inhaltsarten','einzelcode','gleicher-code','serie','manuelle-liste','farben-groesse','export','druckbogen','projekte','scanbarkeit','testdruck','kompatibilitaet','datenschutz','grenzen','fehler']) assert.match(help,new RegExp(`id="${hash}"`));
  assert.match(help,/GS1 DataMatrix: In dieser ersten Version nicht enthalten/); assert.doesNotMatch(main,/GS1[^<]*(Schalter|aktivieren)/i);
});
test('Bibliothek ist fest versioniert und Projektschlüssel sind eindeutig', () => {
  assert.match(main,/bwip-js@4\.5\.1/); assert.doesNotMatch(main,/latest/); assert.equal(logic.PROJECT_SCHEMA,'warenschmiede.datamatrixWerkstatt.project'); assert.equal(logic.LOCAL_DRAFT_KEY,'warenschmiede.datamatrixWerkstatt.localDraft.v1');
});
test('Serie berücksichtigt Nullen und Schrittweite', () => assert.deepEqual(logic.generateSeries('INV-',1,4,3,4,''),['INV-0001','INV-0004','INV-0007','INV-0010']));
test('manuelle Liste ignoriert Leerzeilen und behält Reihenfolge', () => assert.deepEqual(logic.parseManualList(' A\n\n B \n'),['A','B']));
test('Dateinamen werden Windows-sicher und kurz', () => {const v=logic.sanitizeFilename('INV:<0042>/'+ 'x'.repeat(100));assert.doesNotMatch(v,/[<>:"/\\|?*]/);assert.ok(v.length<=70);});
test('A4-Berechnung und unmögliche Maße', () => {const l=logic.calculateA4Layout({orientation:'portrait',labelWidth:45,labelHeight:45,margin:10,gapX:3,gapY:3});assert.deepEqual([l.columns,l.rows,l.perPage],[4,5,20]);assert.throws(()=>logic.calculateA4Layout({orientation:'portrait',labelWidth:300,labelHeight:45,margin:10,gapX:3,gapY:3}),/passt/);});
test('PNG-Plan verwendet ganzzahligen Modulmaßstab und exakte Zielfläche', () => {
  for(const target of [160,320,640]){const plan=logic.calculateIntegerScale(26,26,target);assert.equal(Number.isInteger(plan.scale),true);assert.ok(plan.width<=target);assert.equal(plan.targetWidth,target);assert.equal(plan.targetHeight,target);}
  assert.match(app,/imageSmoothingEnabled=false/);assert.match(app,/canvas\.width=target;canvas\.height=target/);
});
test('bwip-Optionen behandeln Transparenz ohne Alpha-Hexwert', () => {
  const transparent=logic.buildBwipOptions({value:'A',transparent:true});assert.equal(Object.hasOwn(transparent,'backgroundcolor'),false);
  const solid=logic.buildBwipOptions({value:'A',transparent:false,background:'#ffffff'});assert.equal(solid.backgroundcolor,'FFFFFF');
  assert.doesNotMatch(read('tools/datamatrix-werkstatt/app.js')+main,/FFFFFF00/);
});
test('Exporte und Kopieren brechen nach fehlgeschlagenem Rendering ab', () => {
  assert.match(app,/function render\([^)]*\)[\s\S]*return true;[\s\S]*return false;/);
  assert.match(app,/function png\(\)\{if\(!render\(\)\)return/);assert.match(app,/function svgDownload\(\)\{if\(!render\(\)\)return/);assert.match(app,/function printSheet\(\)\{if\(!render\(\)\)return/);
  assert.match(app,/copyValue'[\s\S]*if\(!render\(\)\)return/);assert.match(app,/clearPreview/);assert.match(css,/#previewStage\.invalid/);
});
test('Projektvalidierung akzeptiert nur vollständige eigene Projekte', () => {
  const valid={schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},versions:[]};assert.equal(logic.validateProject(valid),true);
  assert.throws(()=>logic.validateProject({...valid,type:'other'}),/Inhaltsart/);assert.throws(()=>logic.validateProject({...valid,mode:'other'}),/Arbeitsmodus/);assert.throws(()=>logic.validateProject({...valid,inputs:null}),/Eingaben/);assert.throws(()=>logic.validateProject({...valid,versions:{}}),/Versionsverlauf/);
});
test('lokaler Arbeitsstand wird bestätigt, zurückgesetzt und nicht sofort neu gespeichert', () => {
  assert.match(app,/Lokalen DataMatrix-Arbeitsstand wirklich löschen/);assert.match(app,/function resetToDefaults/);assert.match(app,/singleValue:'WS-DM-0001'/);assert.match(app,/state=\{type:'internal',mode:'single'/);assert.match(app,/render\(\{save:false\}\)/);assert.match(app,/clearTimeout\(draftTimer\);localStorage\.removeItem/);
});
test('Hilfe besitzt direkte und eingebettete Familienhülle', () => {
  assert.match(helpJs,/URLSearchParams/);assert.match(helpJs,/get\('embed'\)/);assert.match(help,/<header class="help-header">/);assert.match(help,/DataMatrix-Werkstatt Plus verstehen/);assert.match(help,/href="\/tools\/DataMatrixWerkstattPlus\.html"/);assert.match(helpJs,/IntersectionObserver/);assert.match(helpJs,/hashchange/);
  assert.match(app,/Math\.min\(1200,root\.screen\.availWidth/);assert.match(app,/Math\.min\(850,root\.screen\.availHeight/);
});
test('Oberfläche verwendet die helle sticky Familienoptik', () => {
  assert.match(css,/\.topbar\{position:sticky/);assert.match(css,/background:rgba\(255,255,255/);assert.match(css,/\.topbar-inner\{width:min\(1320px/);assert.match(css,/\.workspace\{width:min\(1320px/);assert.doesNotMatch(css,/linear-gradient\(110deg,#092e58,#155c91\)/);
});
test('gültige Änderungen werden auch ohne automatische Vorschau entprellt gespeichert', () => {
  assert.match(app,/function saveDraftSoon\(\)\{const validDraft=JSON\.stringify\(snapshot\(\)\);clearTimeout\(draftTimer\);draftTimer=setTimeout/);
  assert.match(app,/function persistWithoutRender\(\)[\s\S]*readValues\(\);updateSheet\(\);saveDraftSoon\(\)/);
  assert.match(app,/function handleCurrentInput\(\)\{if\(\$\('autoUpdate'\)\.checked\)return render\(\);return persistWithoutRender\(\)/);
});
test('Projekt und Version werden nur nach erfolgreichem aktuellem Rendering gespeichert', () => {
  assert.match(app,/function saveProject\(\)\{if\(!render\(\)\)return;/);
  assert.match(app,/function saveVersion\(\)\{if\(!render\(\)\)return;/);
  assert.match(app,/if\(state\.type==='url'/);assert.match(app,/step===0/);
});
test('V1-Projekte verlangen alle vollständigen Eingabefelder', () => {
  const valid={schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},versions:[]};
  assert.equal(logic.validateProject(valid),true);
  for(const key of ['singleValue','size','orientation']){const inputs={...valid.inputs};delete inputs[key];assert.throws(()=>logic.validateProject({...valid,inputs}),new RegExp(key));}
  assert.throws(()=>logic.validateProject({...valid,inputs:{...valid.inputs,size:320}}),/Datentyp/);
  assert.match(app,/const previous=snapshot\(\)/);assert.match(app,/catch\(error\)[\s\S]*previous\.inputs/);
});
test('Versionslimit und robuste nächste Versionsnummer sind konsistent', () => {
  const base={number:1,savedAt:'2026-08-01T00:00:00.000Z',type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS}};
  const project={schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},versions:Array.from({length:100},(_,i)=>({...base,number:i+1}))};
  assert.equal(logic.MAX_VERSIONS,100);assert.equal(logic.validateProject(project),true);assert.throws(()=>logic.validateProject({...project,versions:[...project.versions,{...base,number:101}]}),/100/);
  assert.match(app,/state\.versions\.length>=MAX_VERSIONS/);assert.match(app,/reduce\(\(highest,version\)=>Math\.max\(highest,version\.number\),0\)\+1/);
});
test('Versionseinträge werden vollständig validiert', () => {
  const version={number:7,savedAt:'2026-08-01T00:00:00.000Z',type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS}};assert.equal(logic.validateVersion(version,0),true);
  assert.throws(()=>logic.validateVersion({...version,type:'other'},0),/Inhaltsart/);assert.throws(()=>logic.validateVersion({...version,mode:'other'},0),/Arbeitsmodus/);assert.throws(()=>logic.validateVersion({...version,inputs:{}},0),/fehlt/);assert.throws(()=>logic.validateVersion({...version,number:0},0),/Versionsnummer/);
});
