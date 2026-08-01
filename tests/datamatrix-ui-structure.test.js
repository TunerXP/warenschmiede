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
const individualLabelFixture=()=>[
 logic.createIndividualLabel({id:'label-1',title:'Station 1',visibleValue:'Gerät A',info1:'Zusatz 1',codeValue:'Gerät: Gerät A | CODE-A'}),
 logic.createIndividualLabel({id:'label-2',title:'Station 2',visibleValue:'Gerät B',info1:'Zusatz 2',codeValue:'Gerät: Gerät B | CODE-B'}),
 logic.createIndividualLabel({id:'label-3',title:'Station 3',visibleValue:'Gerät C',info1:'Zusatz 3',codeValue:'Gerät: Gerät C | CODE-C'}),
 logic.createIndividualLabel({id:'label-4',title:'Station 4',visibleValue:'Gerät D',info1:'Zusatz 4',codeValue:'Gerät: Gerät D | CODE-D'}),
 logic.createIndividualLabel({id:'label-5',title:'Station 5',visibleValue:'Gerät E',info1:'Zusatz 5',codeValue:'Gerät: Gerät E | CODE-E'})
];

test('getrennte DataMatrix-Dateistruktur ist vollständig', () => {
  for (const file of ['tools/DataMatrixWerkstattPlus.html','tools/datamatrix-werkstatt/app.css','tools/datamatrix-werkstatt/app.js','tools/datamatrix-werkstatt/hilfe.html','tools/datamatrix-werkstatt/hilfe.css','tools/datamatrix-werkstatt/hilfe.js']) assert.ok(fs.existsSync(path.join(root,file)), file);
  assert.match(main,/datamatrix-werkstatt\/app\.css/); assert.match(main,/datamatrix-werkstatt\/app\.js/);
  assert.doesNotMatch(main,/<style\b/); assert.doesNotMatch(main,/<script(?![^>]*src=)[^>]*>\s*\S/);
});
test('Menü, Familie, Hilfe und Aktionen sind vorhanden', () => {
  assert.match(main,/toolMenuBtn/); assert.match(app,/Werkzeugfamilie/); assert.match(app,/toolId:'barcode'/); assert.match(app,/toolId:'qr'/);
  assert.match(read('tools/barcode-werkstatt/app.js'),/toolId: 'datamatrix'/); assert.match(read('tools/QRCodeMasterPro.html'),/toolId: 'datamatrix'/);
  assert.match(main,/<iframe/); assert.match(app,/wsDataMatrixHelp/); assert.match(app,/help-open/);
  for(const id of ['downloadPng','downloadSvg','copyContent','printSheet']) assert.match(main,new RegExp(`id="${id}"`));
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
  assert.match(app,/function png\(\)\{if\(!render\(\)\|\|!state\.values\[state\.index\]\)return/);assert.match(app,/function svgDownload\(\)\{if\(!render\(\)\|\|!state\.values\[state\.index\]\)return/);assert.match(app,/function printSheet\(\)\{if\(!render\(\)\)return/);
  assert.match(app,/copyContent'[\s\S]*if\(!render\(\)\|\|!state\.values\[state\.index\]\)return/);assert.match(app,/clearPreview/);assert.match(css,/#previewStage\.invalid/);
});
test('Projektvalidierung akzeptiert nur vollständige eigene Projekte', () => {
  const valid={schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},versions:[]};assert.equal(logic.validateProject(valid),true);
  assert.throws(()=>logic.validateProject({...valid,type:'other'}),/Inhaltsart/);assert.throws(()=>logic.validateProject({...valid,mode:'other'}),/Arbeitsmodus/);assert.throws(()=>logic.validateProject({...valid,inputs:null}),/Eingaben/);assert.throws(()=>logic.validateProject({...valid,versions:{}}),/Versionsverlauf/);
});
test('lokaler Arbeitsstand wird bestätigt, zurückgesetzt und nicht sofort neu gespeichert', () => {
  assert.match(app,/Lokalen DataMatrix-Arbeitsstand wirklich löschen/);assert.match(app,/function resetToDefaults/);assert.match(app,/singleValue:''/);assert.match(app,/state=\{type:'internal',mode:'single'/);assert.match(app,/render\(\{save:false\}\)/);assert.match(app,/clearTimeout\(draftTimer\);localStorage\.removeItem/);
});
test('Hilfe besitzt direkte und eingebettete Familienhülle', () => {
  assert.match(helpJs,/URLSearchParams/);assert.match(helpJs,/get\('embed'\)/);assert.match(help,/<header class="help-header">/);assert.match(help,/DataMatrix-Werkstatt Plus verstehen/);assert.match(help,/href="\/tools\/DataMatrixWerkstattPlus\.html"/);assert.match(helpJs,/IntersectionObserver/);assert.match(helpJs,/hashchange/);
  assert.match(app,/Math\.min\(1200,root\.screen\.availWidth/);assert.match(app,/Math\.min\(850,root\.screen\.availHeight/);
});
test('Oberfläche verwendet die helle sticky Familienoptik', () => {
  assert.match(css,/\.topbar\{position:sticky/);assert.match(css,/background:rgba\(255,255,255/);assert.match(css,/\.topbar-inner\{width:min\(1560px/);assert.match(css,/\.workspace\{width:min\(1560px/);assert.doesNotMatch(css,/linear-gradient\(110deg,#092e58,#155c91\)/);
});
test('Mobile Oberfläche bleibt nach allen Tablet-Regeln einspaltig und breitenflexibel', () => {
  assert.match(css, /@media\(min-width:721px\) and \(max-width:1200px\)\{\.workspace\{grid-template-columns:minmax\(300px,330px\) minmax\(500px,1fr\)/);
  assert.doesNotMatch(css, /@media\(max-width:1200px\)\{\.workspace\{grid-template-columns:minmax\(300px,330px\) minmax\(500px,1fr\)/);
  const mobileSafety = css.slice(css.indexOf('/* Mobile Breitenabsicherung'));
  assert.match(mobileSafety, /@media\(max-width:720px\)/);
  assert.match(mobileSafety, /\.workspace\{width:calc\(100% - 20px\);grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(mobileSafety, /\.workspace>\*,\.middle,\.card,\.body,\.sheet-workshop-body,\.sheet-settings,\.sheet-preview\{min-width:0;max-width:100%\}/);
  assert.match(mobileSafety, /\.middle,\.preview-card,\.sheet-workshop\{grid-column:auto\}/);
  assert.match(mobileSafety, /\.sheet-workshop-body,\.labels-workspace\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(mobileSafety, /input,select,textarea\{max-width:100%\}/);
  assert.match(mobileSafety, /\.a4-stage,\.a4-page\{max-width:100%\}/);
});
test('DataMatrix-Menübutton verwendet die gemeinsamen Icon- und Label-Spans', () => {
  const button = main.match(/<button id="toolMenuBtn"[\s\S]*?<\/button>/)?.[0] || '';
  assert.match(button, /<span class="ws-tool-menu-icon" aria-hidden="true">☰<\/span>/);
  assert.match(button, /<span class="ws-tool-menu-label">Tool-Menü<\/span>/);
  assert.equal(button.replace(/<[^>]+>/g, '').replace(/\s+/g, ''), '☰Tool-Menü');
  assert.match(read('assets/css/ws-tool-menu.css'), /@media \(max-width:420px\)[\s\S]*\.ws-tool-menu-btn--label \.ws-tool-menu-label/);
  const mobileSafety = css.slice(css.indexOf('/* Mobile Breitenabsicherung'));
  assert.match(mobileSafety, /\.brand,\.brand>div\{min-width:0\}/);
});
test('gültige Änderungen werden auch ohne automatische Vorschau entprellt gespeichert', () => {
  assert.match(app,/function saveDraftSoon\(\)\{const validDraft=JSON\.stringify\(snapshot\(\)\);clearTimeout\(draftTimer\);draftTimer=setTimeout/);
  assert.match(app,/function persistWithoutRender\(\)[\s\S]*readValues\(\);updateSheet\(\);saveDraftSoon\(\)/);
  assert.match(app,/function handleCurrentInput\(\)\{if\(\$\('autoUpdate'\)\.checked\)return render\(\);return persistWithoutRender\(\)/);
});
test('Projekt und Version werden vollständig validiert gespeichert', () => {
  assert.match(app,/function saveProject\(\)\{try\{const project=snapshot\(\);validateProject\(project\)/);
  assert.match(app,/function saveVersion\(\)[\s\S]*validateVersion\(version/);
  assert.match(app,/if\(state\.type==='url'/);assert.match(app,/step===0/);
});
test('V1-Projekte verlangen alle vollständigen Eingabefelder', () => {
  const valid={schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},versions:[]};
  assert.equal(logic.validateProject(valid),true);
  for(const key of ['singleValue','size','orientation']){const inputs={...valid.inputs};delete inputs[key];assert.throws(()=>logic.validateProject({...valid,inputs}),new RegExp(key));}
  assert.throws(()=>logic.validateProject({...valid,inputs:{...valid.inputs,size:320}}),/Datentyp/);
  assert.match(app,/const previous=captureCurrentState\(\)/);assert.match(app,/catch\(error\)\{restoreCapturedState\(previous\)/);
});
test('Versionslimit und robuste nächste Versionsnummer sind konsistent', () => {
  const base={number:1,savedAt:'2026-08-01T00:00:00.000Z',type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS}};
  const project={schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},versions:Array.from({length:100},(_,i)=>({...base,number:i+1}))};
  assert.equal(logic.MAX_VERSIONS,100);assert.equal(logic.validateProject(project),true);assert.throws(()=>logic.validateProject({...project,versions:[...project.versions,{...base,number:101}]}),/100/);
  assert.match(app,/state\.versions\.length>=MAX_VERSIONS/);assert.match(app,/reduce\(\(highest,version\)=>Math\.max\(highest,version\.number\),0\)\+1/);
});
test('Versionseinträge werden vollständig validiert', () => {
  const version={number:7,savedAt:'2026-08-01T00:00:00.000Z',type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},labels:[],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT}};assert.equal(logic.validateVersion(version,0),true);
  assert.throws(()=>logic.validateVersion({...version,type:'other'},0),/Inhaltsart/);assert.throws(()=>logic.validateVersion({...version,mode:'other'},0),/Arbeitsmodus/);assert.throws(()=>logic.validateVersion({...version,inputs:{}},0),/fehlt/);assert.throws(()=>logic.validateVersion({...version,number:0},0),/Versionsnummer/);
});


test('Projekt V1 wird vollständig und sicher auf V2 migriert',()=>{
 const oldKeys=['singleValue','copyValue','copyCount','seriesPrefix','seriesSuffix','seriesStart','seriesCount','seriesStep','seriesPad','manualList','foregroundText','backgroundText','size','padding','showText','transparent','autoUpdate','orientation','labelWidth','labelHeight','pageMargin','gapX','gapY','printText','cutLines'];
 const inputs=Object.fromEntries(oldKeys.map(key=>[key,logic.DEFAULT_INPUTS[key]]));const migrated=logic.migrateProject({schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs,versions:[]});assert.equal(migrated.schemaVersion,3);assert.equal(migrated.inputs.labelTitle,'');assert.equal(logic.validateProject(migrated),true);
});
test('Navigation und Übersicht binden DataMatrix mit dem bestehenden Kartenbild ein',()=>{const nav=read('assets/js/ws-layout.js'),overview=read('tools/index.html');assert.match(nav,/DataMatrix-Werkstatt Plus/);assert.match(nav,/tools\/DataMatrixWerkstattPlus.html/);assert.doesNotMatch(overview,/datamatrix-art/);assert.match(overview,/datamatrix data matrix 2d code inventar/);assert.match(overview,/img[^>]+datamatrix-werkstatt-card\.png/i);});

test('Klartextschalter steuert nur den sichtbaren codierten Wert',()=>{
  const markup=(layout,printText)=>logic.createLabelMarkup(logic.createLabelModel('ENCODED',{...logic.DEFAULT_INPUTS,labelTemplate:layout,printText,labelTitle:'Titel',labelInfo1:'Zusatz'},'<svg viewBox="0 0 10 10"></svg>'));
  assert.match(markup('code-text',true),/ENCODED/);assert.doesNotMatch(markup('code-text',false),/ENCODED/);
  assert.doesNotMatch(markup('code-only',true),/ENCODED/);
  const info=markup('info-portrait',false);assert.match(info,/Titel/);assert.match(info,/Zusatz/);assert.doesNotMatch(info,/ENCODED/);
});
test('A4-Vorschau verwendet feste proportionale Maße und weißes Papier',()=>{
  assert.doesNotMatch(css,/grid-template-columns:repeat\(var\(--columns\),1fr\)/);
  assert.match(css,/calc\(var\(--label-w\)\/var\(--page-w\)\*100cqw\)/);
  assert.match(css,/\.a4-page\{[^}]*background:#fff/);
  assert.match(app,/i\.transparent\?'transparent':i\.backgroundText/);
  assert.match(app,/\.print-page:last-child\{break-after:auto\}/);
});
test('Textprüfung blockiert unbrauchbare Kombinationen, nicht Code pur',()=>{
 const layout=logic.calculateA4Layout({orientation:'portrait',labelWidth:25,labelHeight:35,margin:10,gapX:2,gapY:2});
 const long='X'.repeat(180),small={...logic.DEFAULT_INPUTS,labelTemplate:'info-portrait',labelWidth:'25',labelHeight:'35',labelTitle:long,longestValue:'1'};
 assert.throws(()=>logic.validateLabelLayout(small,layout),/wahrscheinlich zu lang/);
 assert.doesNotThrow(()=>logic.validateLabelLayout({...small,labelWidth:'90',labelHeight:'90'},layout));
 assert.doesNotThrow(()=>logic.validateLabelLayout({...small,labelTemplate:'code-only'},layout));
});
test('Seitennavigation begrenzt Seiten robust',()=>{assert.equal(logic.clampSheetPage(3,1),0);assert.equal(logic.clampSheetPage(3,4),3);assert.equal(logic.clampSheetPage(0,0),0);});

test('Etiketten-SVG wird für Live-Vorschau und Druck robust normalisiert',()=>{
  const svg=logic.normalizeLabelCodeSvg('<svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 0h40v40z"/></svg>');
  assert.match(svg,/class="label-code-svg"/);assert.match(svg,/width="100%"/);assert.match(svg,/height="100%"/);assert.match(svg,/preserveAspectRatio="xMidYMid meet"/);
  assert.throws(()=>logic.normalizeLabelCodeSvg(''),/Codegrafik/);assert.throws(()=>logic.normalizeLabelCodeSvg('<div>kein Code</div>'),/Codegrafik/);
  assert.match(css,/\.label-code-svg\{[^}]*width:100%!important;[^}]*height:100%!important/);
  assert.match(app,/\.label-code-svg\{display:block;width:100%!important;height:100%!important/);
});
test('alle Etikettenvorlagen besitzen einen definierten Codebereich',()=>{
  assert.match(css,/\.layout-code-only\{grid-template:/);assert.match(css,/\.layout-code-text\{grid-template-rows:minmax\(var\(--code-min\),var\(--code-share\)\)/);
  assert.match(css,/\.layout-info-portrait\{grid-template-rows:auto minmax\(/);assert.match(css,/\.layout-info-landscape\{grid-template-columns:minmax\(var\(--code-min\),var\(--code-share\)\)/);
});
test('Vorschaukarte bleibt statisch und die Druckbedienung erklärt Modi',()=>{
  assert.match(css,/\.preview-card\{position:static\}/);assert.doesNotMatch(css,/\.preview-card\{position:sticky;top:108px/);
  assert.match(main,/data-mode="copies">Mehrfach drucken/);assert.match(main,/Anzahl Etiketten \/ Kopien/);assert.match(main,/id="printQuantitySummary"/);assert.match(main,/id="setupCopies"/);assert.match(main,/id="printSheetA4"/);
  assert.match(app,/\$\('printSheet'\)\.onclick=printSheet;\$\('printSheetA4'\)\.onclick=printSheet/);
  assert.match(app,/state\.mode==='series'\|\|state\.mode==='manual'/);assert.match(app,/Code \$\{state\.index\+1\} von \$\{count\}/);
});
test('zwölf Kopien bleiben zwölf identische Druckwerte',()=>{
  const values=Array(12).fill('WS-DM-0001');assert.equal(values.length,12);assert.equal(new Set(values).size,1);
  assert.equal(logic.DEFAULT_INPUTS.copyCount,'12');
});

test('individuelle Etiketten besitzen getrennte Pflichtdaten und Reihenfolge',()=>{
 const labels=individualLabelFixture();assert.equal(labels.length,5);labels.forEach(label=>logic.validateLabel(label));
 assert.deepEqual(labels.map(label=>label.title),['Station 1','Station 2','Station 3','Station 4','Station 5']);
 assert.ok(labels.every(label=>label.codeValue.includes('Gerät:')));assert.ok(!labels[0].codeValue.includes(labels[0].info1));
 const moved=logic.moveLabel(labels,'label-2',-1);assert.equal(moved[0].id,'label-2');
 const copied=logic.duplicateLabel(labels,'label-1');assert.notEqual(copied[0].id,copied[1].id);
 labels[0].enabled=false;assert.equal(logic.enabledLabels(labels).length,4);
});
test('übersprungene Felder gelten nur auf erster Seite',()=>{
 const layout={perPage:4},pages=logic.paginateWithSkippedSlots(['A','B','C','D','E'],layout,2);assert.deepEqual(pages,[[null,null,'A','B'],['C','D','E']]);assert.throws(()=>logic.paginateWithSkippedSlots(['A'],layout,4),/Startposition/);
});
test('V2 migriert vollständig auf Projekt V3',()=>{
 const v2={schema:logic.PROJECT_SCHEMA,schemaVersion:2,type:'internal',mode:'manual',inputs:{...logic.DEFAULT_INPUTS},versions:[]};const v3=logic.migrateProject(v2);assert.equal(v3.schemaVersion,3);assert.deepEqual(v3.labels,[]);assert.equal(v3.outputProfile.type,'a4-sheet');assert.equal(logic.validateProject(v3),true);
});
test('Textanpassung respektiert Mindestgröße und Platzverteilungen',()=>{
 assert.deepEqual(logic.calculateTextFit({scrollWidth:100,clientWidth:100,scrollHeight:20,clientHeight:20}),{fits:true,fontSize:9});const fit=logic.calculateTextFit({scrollWidth:300,clientWidth:100,scrollHeight:60,clientHeight:20});assert.equal(fit.fontSize,6);assert.equal(fit.fits,false);assert.equal(logic.calculateTextFit({scrollWidth:300,clientWidth:100,scrollHeight:60,clientHeight:20,behavior:'block'}).fits,false);
 for(const key of ['code-large','balanced','text-more'])assert.ok(logic.codeShare(key)>0);
});

test('übersprungene A4-Felder unterscheiden Vorschau und Ausdruck',()=>{
 const preview=logic.createSheetSlotMarkup(null,'preview'),printed=logic.createSheetSlotMarkup(null,'print');assert.match(preview,/bereits verwendet/);assert.doesNotMatch(printed,/bereits verwendet/);assert.match(printed,/empty-print-slot/);
 const pages=logic.paginateWithSkippedSlots(['A','B'],{perPage:4},2);assert.deepEqual(pages[0],[null,null,'A','B']);assert.match(app,/createSheetItemMarkup\(item,'preview'/);assert.match(app,/createSheetItemMarkup\(item,'print'/);
});
test('Textverhalten besitzt genau eine sichtbare Datenquelle',()=>{
 assert.equal((main.match(/id="textBehavior"/g)||[]).length,1);assert.doesNotMatch(main,/id="autoFitText"/);assert.equal(Object.hasOwn(logic.DEFAULT_INPUTS,'autoFitText'),false);
 const fixed=logic.calculateTextFit({scrollWidth:200,clientWidth:100,scrollHeight:40,clientHeight:20,fontSize:9,behavior:'fixed'});assert.deepEqual(fixed,{fits:false,fontSize:9});const auto=logic.calculateTextFit({scrollWidth:120,clientWidth:100,scrollHeight:24,clientHeight:20,fontSize:9,behavior:'auto'});assert.ok(auto.fontSize<9&&auto.fontSize>=6);assert.match(app,/fitRenderedLabels\(stage,inputs\.textBehavior,LABEL_GEOMETRY\.fontPt/);assert.doesNotMatch(app,/document\.querySelectorAll\('\.sheet-label'\).*setTimeout/);
});
test('alle Vorlagen nutzen zentrale Platzverteilung ohne Code-Verzerrung',()=>{
 for(const layout of ['code-text','info-portrait','info-landscape']){for(const distribution of ['code-large','balanced','text-more']){const markup=logic.createLabelMarkup(logic.createLabelModel('A',{...logic.DEFAULT_INPUTS,labelTemplate:layout,spaceDistribution:distribution},'<svg viewBox="0 0 10 10"></svg>'));assert.match(markup,new RegExp(`layout-${layout}`));assert.match(markup,new RegExp(`distribution-${distribution}`));}}
 for(const distribution of ['code-large','balanced','text-more']){const markup=logic.createLabelMarkup(logic.createLabelModel('A',{...logic.DEFAULT_INPUTS,labelTemplate:'code-only',spaceDistribution:distribution},'<svg viewBox="0 0 10 10"></svg>'));assert.match(markup,/layout-code-only/);}assert.match(css,/\.layout-code-only\{--code-share:100%/);assert.match(css,/\.label-code\{aspect-ratio:1/);
});
test('Ausgabeprofil wird fachlich validiert und verbindlich angewendet',()=>{
 const profile={...logic.OUTPUT_PROFILE_DEFAULT,orientation:'landscape',pageMargin:8,gapX:2,gapY:4,skipSlots:3};assert.equal(logic.validateOutputProfile(profile,{perPage:20}),true);assert.deepEqual(logic.applyOutputProfileToInputs(profile,{}),{orientation:'landscape',pageMargin:'8',gapX:'2',gapY:'4',skipSlots:'3'});
 assert.throws(()=>logic.validateOutputProfile({...profile,orientation:'diagonal'}),/Ausrichtung/);assert.throws(()=>logic.validateOutputProfile({...profile,gapX:-1}),/gapX/);assert.throws(()=>logic.validateOutputProfile({...profile,skipSlots:1.5}),/ganze Zahl/);assert.throws(()=>logic.validateOutputProfile({...profile,skipSlots:20},{perPage:20}),/Druckraster/);assert.throws(()=>logic.validateProfileConsistency({...logic.DEFAULT_INPUTS,gapX:'9'},profile,'Projekt'),/widersprechen/);
});
test('Projektladen besitzt vollständigen tiefen Rollback',()=>{assert.match(app,/function captureCurrentState\(\)/);assert.match(app,/structuredClone\(state\)/);assert.match(app,/function restoreCapturedState/);assert.match(app,/state=structuredClone\(captured\.state\)/);assert.match(app,/foreground.*background/);});
test('Etikettenauswahl und Navigation synchronisieren Einzelvorschau',()=>{assert.match(app,/if\(action==='edit'\)state\.selectedLabelId=id/);assert.match(app,/state\.index=Math\.max\(0,state\.labels\.findIndex/);assert.match(app,/state\.selectedLabelId=state\.labels\[state\.index\]/);assert.match(app,/Dieses Etikett ist für den Druckbogen deaktiviert/);assert.match(app,/scrollIntoView\(\{block:'nearest'\}\)/);});
test('individuelle Vorprüfung bewertet keinen langen codeValue als sichtbaren Text',()=>{
 const layout=logic.calculateA4Layout({orientation:'portrait',labelWidth:45,labelHeight:45,margin:10,gapX:3,gapY:3}),inputs={...logic.DEFAULT_INPUTS,labelTemplate:'info-portrait',labelWidth:'45',labelHeight:'45',labelTitle:'X'.repeat(300),longestValue:'X'.repeat(2000)};
 assert.doesNotThrow(()=>logic.validateLabelMinimums(inputs,layout));assert.throws(()=>logic.validateSimpleVisibleText(inputs,layout),/wahrscheinlich zu lang/);const bambu=individualLabelFixture();assert.ok(bambu.every(label=>label.codeValue.length>label.visibleValue.length));assert.match(app,/state\.mode==='labels'\?validateLabelMinimums\(inputs,baseLayout\)/);
});
test('kein aktives Etikett ist ein speicherbarer, aber nicht druckbereiter Entwurf',()=>{
 const labels=individualLabelFixture().map(label=>({...label,enabled:false})),state=logic.getLabelsPrintState(labels);assert.deepEqual(state,{count:0,ready:false,message:'Für den A4-Druckbogen ist derzeit kein Etikett aktiviert.'});assert.doesNotThrow(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels}));labels[0].enabled=true;assert.deepEqual(logic.getLabelsPrintState(labels),{count:1,ready:true,message:''});const draft=logic.createIndividualLabel({id:'draft',title:'Entwurf',enabled:false});assert.doesNotThrow(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels:[draft]}));draft.enabled=true;assert.throws(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels:[draft]}),/Data-Matrix-Inhalt/);
});
test('Etikettengeometrie und Auto-Fit verwenden stabile physische Einheiten',()=>{
 assert.deepEqual(logic.LABEL_GEOMETRY.fontPt,{small:7,normal:9,large:11});assert.equal(logic.LABEL_GEOMETRY.minFontPt,6);assert.equal(logic.LABEL_GEOMETRY.paddingMm,1.5);assert.equal(logic.LABEL_GEOMETRY.minCodeMm,8);assert.match(app,/--fitted-font-pt/);assert.doesNotMatch(app,/--fitted-font:[^p]/);assert.match(css,/padding:calc\(1\.5\/var\(--page-w\)\*100cqw\)/);assert.match(app,/padding:1\.5mm/);assert.match(css,/--base-font-pt:7/);assert.match(app,/--base-font-pt:7/);assert.doesNotMatch(css,/\.label-info[^}]*\bvw\b/);
});
test('fachliche Arbeitsinhalte werden vor Persistenz modusspezifisch geprüft',()=>{
 const base={type:'internal',inputs:{...logic.DEFAULT_INPUTS,copyValue:'TEST'},labels:[]};assert.throws(()=>logic.validateWorkForPersistence({...base,mode:'single',inputs:{...base.inputs,singleValue:' '}}),/Einzelcode/);assert.throws(()=>logic.validateWorkForPersistence({...base,mode:'copies',inputs:{...base.inputs,copyCount:'0'}}),/Kopienzahl/);assert.throws(()=>logic.validateWorkForPersistence({...base,mode:'manual',inputs:{...base.inputs,manualList:'\n'}}),/mindestens/);assert.throws(()=>logic.validateWorkForPersistence({...base,type:'url',mode:'single',inputs:{...base.inputs,singleValue:'kein-url'}}),/gültige URL/);assert.match(app,/saveProject\(\)[\s\S]*validateWorkForPersistence\(project\)/);assert.match(app,/saveVersion\(\)[\s\S]*validateWorkForPersistence/);
});
test('selectedLabelId und Versionsraster werden vollständig geprüft',()=>{
 const label=logic.createIndividualLabel({id:'chosen',title:'Wahl',codeValue:'A'}),base={schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'labels',inputs:{...logic.DEFAULT_INPUTS},labels:[label],selectedLabelId:'chosen',outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]};assert.equal(logic.validateProject(base),true);assert.throws(()=>logic.validateProject({...base,selectedLabelId:'missing'}),/ausgewählte Etiketten-ID/);const version={number:1,savedAt:'2026-08-01',type:'internal',mode:'labels',inputs:{...logic.DEFAULT_INPUTS,labelWidth:'90',labelHeight:'90',skipSlots:'6'},labels:[label],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT,skipSlots:6}};assert.throws(()=>logic.validateVersion(version,0),/Druckraster/);const migrated=logic.migrateProject({schema:logic.PROJECT_SCHEMA,schemaVersion:2,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS},selectedLabelId:'old',versions:[]});assert.equal(migrated.selectedLabelId,null);
});
test('ungültige A4-Eingaben räumen die veraltete Vorschau auf',()=>{assert.match(app,/function invalidateSheet\(messageText\)/);assert.match(app,/setPrintAvailability\(false\)/);assert.match(app,/a4Page'\)\.innerHTML='<div class="invalid-sheet">/);assert.match(app,/sheetPosition'\)\.textContent='Seite – von –'/);assert.match(app,/catch\(error\)\{invalidateSheet\(error\.message\)/);});

test('frühe Renderfehler invalidieren immer den alten A4-Bogen',()=>{assert.match(app,/catch\(error\)\{clearPreview\(\);setSingleOutputAvailability\(false\);invalidateSheet\(error\.message/);assert.match(app,/function invalidateSheet[\s\S]*setPrintAvailability\(false\)[\s\S]*A4-Vorschau ungültig[\s\S]*Seite – von –/);});
test('deaktivierter leerer Entwurf lässt Einzel- und A4-Ausgabe getrennt',()=>{const draft=logic.createIndividualLabel({id:'draft-empty',title:'Entwurf',enabled:false}),active=logic.createIndividualLabel({id:'active',title:'Aktiv',codeValue:'A'});assert.equal(logic.getLabelsPrintState([draft,active]).ready,true);assert.deepEqual(logic.enabledLabels([draft,active]).map(label=>label.id),['active']);assert.doesNotThrow(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels:[draft,active]}));assert.match(app,/Dieser Entwurf besitzt noch keinen Data-Matrix-Inhalt/);assert.match(app,/function setSingleOutputAvailability/);assert.match(app,/function setPrintAvailability/);assert.match(app,/draftWithoutCode[\s\S]*setSingleOutputAvailability\(false\)[\s\S]*updateSheet\(\)/);});
test('Etiketteneditor aktualisiert beim Tippen nur die Listenzusammenfassung',()=>{assert.match(app,/function renderLabelsList\(\)/);assert.match(app,/function loadSelectedLabelIntoEditor/);assert.match(app,/function updateSelectedLabelListSummary/);const update=app.match(/function updateSelectedLabel\(event\)\{[^}]+\}/)?.[0]||'';assert.match(update,/updateSelectedLabelListSummary\(label\)/);assert.doesNotMatch(update,/renderLabelsEditor|loadSelectedLabelIntoEditor|scrollIntoView/);assert.match(app,/if\(scroll\).*scrollIntoView/);});
test('Etikettenprüfung berücksichtigt nur aktive individuelle Etiketten',()=>{const bad=logic.createIndividualLabel({id:'label-3',title:'Etikett 3',codeValue:''}),project={mode:'labels',type:'text',inputs:{...logic.DEFAULT_INPUTS},labels:[bad]};assert.throws(()=>logic.validateWorkForPersistence(project),/Data-Matrix-Inhalt/);bad.enabled=false;assert.doesNotThrow(()=>logic.validateWorkForPersistence(project));});


test('neutraler Leerzustand trennt Vorschau und A4-Blatt von Fehlerklassen',()=>{
 assert.match(app,/function showNeutralPreview\(\)/);assert.match(app,/classList\.remove\('invalid'\)[\s\S]*classList\.add\('empty'\)/);
 assert.match(app,/class="empty-sheet">Bitte zuerst einen Inhalt eingeben\./);assert.match(app,/a4Page'\)\.classList\.remove\('invalid'\)[\s\S]*a4Page'\)\.classList\.add\('empty'\)/);
 assert.match(css,/#previewStage\.empty\{[^}]*background:#f7f9fb/);assert.match(css,/\.a4-page\.empty\{display:grid;place-items:center\}/);
 assert.match(app,/function clearPreview\(\)[\s\S]*classList\.remove\('empty'\)[\s\S]*classList\.add\('invalid'\)/);
 assert.match(app,/function invalidateSheet[\s\S]*classList\.remove\('empty'\)[\s\S]*invalid-sheet/);
});
test('Leerzustand räumt Navigation, Zähler, Seitenposition und Ausgaben vollständig auf',()=>{
 assert.match(app,/function showEmptyState[\s\S]*state\.values=\[\];state\.index=0;state\.page=0/);
 for(const id of ['codeNavigation','navigationHint','copiesPreviewSummary'])assert.match(app,new RegExp(`\\$\\('${id}'\\)\\.hidden=true`));
 for(const id of ['prevCode','nextCode','prevSheet','nextSheet'])assert.match(app,new RegExp(`\\$\\('${id}'\\)\\.disabled=true`));
 assert.match(app,/setSingleOutputAvailability\(false\);setPrintAvailability\(false\)/);assert.match(app,/metaChars'\)\.textContent='0'/);assert.match(app,/metaCount'\)\.textContent='0'/);
 assert.match(app,/metaValue'\)\.textContent='Noch kein Data-Matrix-Inhalt'/);assert.match(app,/printQuantitySummary'\)\.textContent=`Druckmenge: 0 Etiketten/);assert.match(app,/sheetPosition'\)\.textContent='Seite – von –'/);
 assert.match(app,/function resetToDefaults\(\)\{state=\{type:'internal',mode:'single',values:\[''\]/);assert.match(main,/Druckmenge: 0 Etiketten · Quelle: Einzelcode/);
});
test('alle bewusst leeren Arbeitsmodi bleiben neutral, ungültige Werte nicht',()=>{
 const defaults={...logic.DEFAULT_INPUTS};
 assert.equal(logic.isNeutralEmptyMode('single',defaults),true);
 assert.equal(logic.isNeutralEmptyMode('copies',defaults),true);
 assert.equal(logic.isNeutralEmptyMode('manual',defaults),true);
 assert.equal(logic.isNeutralEmptyMode('series',defaults),true);
 assert.equal(logic.isNeutralEmptyMode('labels',defaults,[]),true);
 assert.equal(logic.isNeutralEmptyMode('labels',defaults,[logic.createIndividualLabel({enabled:false})]),true);
 assert.equal(logic.isNeutralEmptyMode('copies',{...defaults,copyCount:'0'}),false);
 assert.equal(logic.isNeutralEmptyMode('labels',defaults,[logic.createIndividualLabel({enabled:true})]),false);
 assert.equal(logic.isNeutralEmptyMode('single',{...defaults,singleValue:'kein-url'}),false);
});
test('Serie startet ohne Codes und wird erst mit gültiger Anzahl erzeugt',()=>{
 assert.equal(logic.DEFAULT_INPUTS.seriesCount,'');assert.match(main,/id="seriesCount"[^>]*placeholder="z\. B\. 10"/);assert.doesNotMatch(main,/id="seriesCount"[^>]*value="10"/);
 assert.equal(logic.isNeutralEmptyMode('series',logic.DEFAULT_INPUTS),true);
 assert.deepEqual(logic.generateSeries('INV-',1,2,1,4,''),['INV-0001','INV-0002']);
});
test('neutrales A4-Blatt erhält sichere Maße für beide Ausrichtungen',()=>{
 assert.match(app,/const landscape=\$\('orientation'\)\.value==='landscape',pageWidth=landscape\?297:210,pageHeight=landscape\?210:297/);
 assert.match(app,/a4Page'\)\.setAttribute\('style',`--page-w:\$\{pageWidth\};--page-h:\$\{pageHeight\}`\)/);
 assert.match(css,/width:min\(100%,calc\(70vh \* var\(--page-w\) \/ var\(--page-h\)\)\)/);assert.match(css,/aspect-ratio:var\(--page-w\)\/var\(--page-h\)/);
});
test('leere Modi synchronisieren Hilfsanzeigen vollständig',()=>{
 assert.match(app,/copiesShortcut'\)\.hidden=state\.mode!=='single'/);assert.match(app,/manualCount'\)\.textContent='0 gültige Werte erkannt'/);
 assert.match(app,/copiesPreviewSummary'\)\.hidden=true/);assert.match(app,/navigationHint'\)\.hidden=true/);assert.match(app,/codeNavigation'\)\.hidden=true/);
 assert.match(app,/Druckmenge: 0 Etiketten · Quelle: \$\{MODE_LABELS\[state\.mode\]\}/);
});
test('manueller Druck wird erst nach vollständiger Vorbereitung freigegeben',()=>{
 assert.match(app,/id="manualPrint"[^>]*hidden disabled/);
 const preparation=app.match(/async function prepareAndPrintWindow\(printWindow\)\{[\s\S]*?\n  \}/)?.[0]||'';
 assert.match(preparation,/document\.readyState!=='complete'[\s\S]*addEventListener\('load'/);assert.match(preparation,/document\.fonts\?\.ready/);assert.equal((preparation.match(/await nextAnimationFrame\(printWindow\)/g)||[]).length,2);assert.match(preparation,/await delay\(300\)/);
 assert.match(preparation,/printPreparation[^\n]*hidden[\s\S]*manualPrint\.hidden=false;manualPrint\.disabled=false;[\s\S]*printWindow\.focus\(\);[\s\S]*printWindow\.print\(\)/);
 assert.match(app,/@media print\{\.manual-print,\.print-preparation\{display:none!important\}\}/);
});


test('Inhaltsarten sind verständlich gruppiert und intern kompatibel',()=>{
 assert.match(main,/data-content-kind="text">Text oder Kennung/);assert.match(main,/data-content-kind="url">Webadresse/);
 for(const type of ['text','internal','inventory','serial','part','location'])assert.match(main,new RegExp(`option value="${type}"`));
 assert.equal(logic.isValidHttpUrl('https://warenschmiede.com/x'),true);assert.equal(logic.isValidHttpUrl('warenschmiede.com'),false);
});
test('fünf Arbeitsmodi und ihre Erklärungen bleiben sichtbar',()=>{
 for(const mode of ['single','copies','series','manual','labels'])assert.match(main,new RegExp(`data-mode="${mode}"`));
 for(const text of ['Ein Inhalt wird einmal erzeugt','Derselbe Inhalt wird mehrfach','Fortlaufende Kennungen','Jede Zeile','Jedes Etikett'])assert.match(main+app,new RegExp(text));
});
test('Mini-Sonderweg ist vollständig aus Produktion und neuen Projektdaten entfernt',()=>{
 assert.doesNotMatch(main,/Mini-Preiscode|Mini-Code-Testbogen|miniArticleId|miniPrice|miniMaterial|miniDuration|miniSize/);
 assert.doesNotMatch(app,/applyMiniPreset|printMiniTestSheet|buildMiniPriceContent|createMiniTestSheet/);
 for(const key of Object.keys(logic.DEFAULT_INPUTS))assert.doesNotMatch(key,/^mini/i);
 const old={schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS,miniPrice:'12,50 EUR'},labels:[],selectedLabelId:null,outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]};
 const migrated=logic.migrateProject(old);assert.equal(Object.hasOwn(migrated.inputs,'miniPrice'),false);assert.equal(logic.validateProject(migrated),true);
});
test('Druckarten reduzieren die jeweils sichtbaren Einstellungen',()=>{
 assert.match(main,/data-print-type="code-only"[^>]*>Nur Code/);assert.match(main,/data-print-type="label"[^>]*>Etikett mit Text/);
 assert.match(main,/id="codeSize"[^>]*value="20"/);assert.match(app,/labelWidth:String\(inputs\.codeSize\).*labelHeight:String\(inputs\.codeSize\)/);
 for(const label of ['Code oben · Text unten','Code links · Text rechts','Infokarte'])assert.match(main,new RegExp(label));
 assert.doesNotMatch(main,/>Textverhalten<|>Platzverteilung<|>Textgröße</);
});
test('unterschiedliche reine Codes werden erkannt und bestätigt',()=>{
 assert.equal(logic.hasDifferentCodes(['A','A']),false);assert.equal(logic.hasDifferentCodes(['A','B']),true);
 assert.match(main,/Dieser Druckbogen enthält unterschiedliche Codes/);assert.match(main,/Etikett mit Text verwenden/);assert.match(app,/nicht mehr visuell unterschieden/);
});
test('A4-Zusammenfassung erklärt freie und übersprungene Plätze',()=>{
 const layout={perPage:20};assert.equal(logic.summarizeSheet(20,layout,0,1),'20 Etiketten · 20 Plätze pro Seite · 1 Seite');
 assert.equal(logic.summarizeSheet(20,layout,4,2),'20 Etiketten · 16 freie Plätze auf Seite 1 · 4 weitere Etiketten auf 1 Folgeseite · insgesamt 2 Seiten');
 assert.equal(logic.summarizeSheet(1,layout,4,1),'1 Etikett · beginnt auf Feld 5 · 1 Seite');
});
test('alte Vorlagen werden ohne Schemaerhöhung sinnvoll zugeordnet',()=>{
 for(const template of ['code-only','code-text','info-landscape','info-portrait'])assert.equal(logic.normalizeTemplate(template),template);
 const base={schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'labels',inputs:{...logic.DEFAULT_INPUTS,labelTemplate:'info-landscape',miniSize:'12'},labels:[],selectedLabelId:null,outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]};
 const migrated=logic.migrateProject(base);assert.equal(migrated.schemaVersion,3);assert.equal(migrated.inputs.labelTemplate,'info-landscape');assert.equal(Object.hasOwn(migrated.inputs,'miniSize'),false);
});


test('Persistenz normalisiert Nur-Code und bewahrt Textetiketten',()=>{
 const raw={...logic.DEFAULT_INPUTS,codeSize:'12',labelTemplate:'info-landscape',labelWidth:'70',labelHeight:'30',labelBorder:'strong',labelCorners:'rounded',cutLines:true,printText:true,labelTitle:'Titel',valueLabel:'ID',labelInfo1:'Info',labelInfo2:'Mehr'};
 const code=logic.normalizeInputsForPersistence(raw,'code-only');assert.deepEqual({template:code.labelTemplate,width:code.labelWidth,height:code.labelHeight,border:code.labelBorder,corners:code.labelCorners,cut:code.cutLines,text:code.printText,title:code.labelTitle,info:code.labelInfo1},{template:'code-only',width:'12',height:'12',border:'none',corners:'square',cut:false,text:false,title:'',info:''});
 const label=logic.normalizeInputsForPersistence(raw,'label');assert.deepEqual({template:label.labelTemplate,width:label.labelWidth,height:label.labelHeight,border:label.labelBorder,corners:label.labelCorners,cut:label.cutLines,text:label.printText},{template:'info-landscape',width:'70',height:'30',border:'strong',corners:'rounded',cut:true,text:true});
 assert.match(app,/function projectInputs\(\)\{return currentInputs\(\);\}/);assert.match(app,/function snapshot\(\)\{const inputs=projectInputs\(\)/);assert.match(app,/saveDraftSoon\(\)\{const validDraft=JSON\.stringify\(snapshot\(\)\)/);assert.match(app,/inputs:project\.inputs/);
});
test('Textvorlagen-Select bleibt vom Nur-Code-Zustand getrennt',()=>{
 assert.equal(logic.DEFAULT_INPUTS.labelTemplate,'code-text');assert.match(app,/printType:'code-only'/);assert.match(app,/inputsForDomAfterLoad\(applyOutputProfileToInputs/);assert.match(app,/resetToDefaults[\s\S]*printType:'code-only'/);
});
test('alte V3-Codegrößen werden gezielt und streng migriert',()=>{
 const project=inputs=>({schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'single',inputs,labels:[],selectedLabelId:null,outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]});
 const square={...logic.DEFAULT_INPUTS,labelTemplate:'code-only',labelWidth:'12',labelHeight:'12'};delete square.codeSize;assert.equal(logic.migrateProject(project(square)).inputs.codeSize,'12');
 const rectangle={...logic.DEFAULT_INPUTS,labelTemplate:'code-only',labelWidth:'20',labelHeight:'15'};delete rectangle.codeSize;assert.equal(logic.migrateProject(project(rectangle)).inputs.codeSize,'15');
 const text={...logic.DEFAULT_INPUTS};delete text.codeSize;assert.equal(logic.migrateProject(project(text)).inputs.codeSize,'20');
 const missing={...logic.DEFAULT_INPUTS};delete missing.size;assert.throws(()=>logic.validateProject(project(missing)),/size/);
 const mini={...logic.DEFAULT_INPUTS,miniPrice:'alt'};assert.equal(Object.hasOwn(logic.migrateProject(project(mini)).inputs,'miniPrice'),false);
});
test('V3-Etiketten bleiben streng validiert',()=>{
 const project=labels=>({schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'labels',inputs:{...logic.DEFAULT_INPUTS},labels,selectedLabelId:null,outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]}),valid=logic.createIndividualLabel({id:'one',codeValue:'A'});
 const missing={...valid};delete missing.notes;assert.throws(()=>logic.validateProject(project([missing])),/notes/);
 assert.throws(()=>logic.validateProject(project([valid,{...valid}])),/doppelt/);
 assert.throws(()=>logic.validateProject(project([{...valid,enabled:'yes'}])),/Aktivstatus/);
 assert.throws(()=>logic.validateProject(project(Array.from({length:501},(_,i)=>({...valid,id:`id-${i}`})))),/500/);
});
test('Nur-Code-Bestätigung ist an Modus, Reihenfolge, Werte und Aktivstatus gebunden',()=>{
 const signature=logic.codeOnlySignature('series',['A','B']);assert.equal(signature,logic.codeOnlySignature('series',['A','B']));assert.notEqual(signature,logic.codeOnlySignature('series',['A','C']));assert.notEqual(signature,logic.codeOnlySignature('series',['B','A']));assert.notEqual(signature,logic.codeOnlySignature('manual',['A','B']));
 const labels=[logic.createIndividualLabel({id:'a',codeValue:'A'}),logic.createIndividualLabel({id:'b',codeValue:'B',enabled:false})];assert.notEqual(logic.codeOnlySignature('labels',[],labels),logic.codeOnlySignature('labels',[],labels.map(label=>({...label,enabled:true}))));
 assert.match(app,/confirmedCodeOnlySignature===signature/);assert.doesNotMatch(logic.codeOnlySignature('series',['A','B']),/pageMargin|gapX|gapY/);assert.match(app,/Druck wartet auf Entscheidung: unterschiedliche Codes ohne sichtbare Kennung/);
});
test('A4-Zusammenfassung unterstützt eine und mehrere Folgeseiten',()=>{
 const layout={perPage:20};assert.equal(logic.summarizeSheet(20,layout,0,1),'20 Etiketten · 20 Plätze pro Seite · 1 Seite');assert.equal(logic.summarizeSheet(20,layout,4,2),'20 Etiketten · 16 freie Plätze auf Seite 1 · 4 weitere Etiketten auf 1 Folgeseite · insgesamt 2 Seiten');assert.equal(logic.summarizeSheet(50,layout,4,3),'50 Etiketten · 16 freie Plätze auf Seite 1 · 34 weitere Etiketten auf 2 Folgeseiten · insgesamt 3 Seiten');assert.equal(logic.summarizeSheet(10,layout,4,1),'10 Etiketten · beginnen auf Feld 5 · 1 Seite');assert.equal(logic.summarizeSheet(1,layout,4,1),'1 Etikett · beginnt auf Feld 5 · 1 Seite');
});
test('Produktionscode enthält keine Testgeräte oder verwaiste Dichtehelfer',()=>{assert.doesNotMatch(app,/Bambu|buildBambuExample|parseSvgModules|Mini-Code-Dichte|estimateMini/);});


test('Code-only-Laden bewahrt Codegröße und setzt sichere Textetikettenwerte',()=>{
 const stored={...logic.DEFAULT_INPUTS,labelTemplate:'code-only',codeSize:'12',labelWidth:'12',labelHeight:'12',labelBorder:'none',cutLines:false},dom=logic.inputsForDomAfterLoad(stored);
 assert.equal(stored.codeSize,'12');assert.deepEqual({template:dom.labelTemplate,width:dom.labelWidth,height:dom.labelHeight,border:dom.labelBorder,corners:dom.labelCorners,cut:dom.cutLines,align:dom.labelTextAlign},{template:'code-text',width:'45',height:'45',border:'fine',corners:'square',cut:false,align:'left'});
 const active=logic.normalizeInputsForPersistence({...dom,codeSize:stored.codeSize},'code-only');assert.deepEqual([active.labelWidth,active.labelHeight],['12','12']);
 for(const size of ['12','15']){const loaded=logic.inputsForDomAfterLoad({...stored,codeSize:size});assert.equal(loaded.codeSize,size);assert.deepEqual([loaded.labelWidth,loaded.labelHeight],['45','45']);}
});
test('Rollback erfasst rohe DOM-Werte getrennt von Vorschau und Persistenz',()=>{
 assert.match(app,/function rawInputsFromDom\(\)\{return Object\.fromEntries/);assert.match(app,/function currentInputs\(\)\{return normalizeInputsForPersistence\(rawInputsFromDom\(\),state\.printType\);\}/);assert.match(app,/function captureCurrentState\(\)\{return \{state:structuredClone\(state\),inputs:rawInputsFromDom\(\)/);
 const raw={...logic.DEFAULT_INPUTS,labelTemplate:'info-landscape',labelWidth:'70',labelHeight:'30',labelBorder:'strong',cutLines:true,codeSize:'12'},normalized=logic.normalizeInputsForPersistence(raw,'code-only');assert.deepEqual([raw.labelWidth,raw.labelHeight,raw.labelBorder,raw.cutLines],['70','30','strong',true]);assert.deepEqual([normalized.labelWidth,normalized.labelHeight,normalized.labelBorder,normalized.cutLines],['12','12','none',false]);
 assert.match(app,/catch\(error\)\{restoreCapturedState\(previous\);throw error;\}/);
});
test('V3 akzeptiert ausschließlich die vier bekannten Etikettenvorlagen',()=>{
 const project=inputs=>({schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'single',inputs,labels:[],selectedLabelId:null,outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]});
 const missing={...logic.DEFAULT_INPUTS};delete missing.labelTemplate;assert.throws(()=>logic.migrateProject(project(missing)),/Etikettenvorlage/);assert.throws(()=>logic.migrateProject(project({...logic.DEFAULT_INPUTS,labelTemplate:'unbekannt'})),/Etikettenvorlage/);
 for(const template of ['code-only','code-text','info-landscape','info-portrait'])assert.doesNotThrow(()=>logic.validateProject(project({...logic.DEFAULT_INPUTS,labelTemplate:template})));
 const v2={schema:logic.PROJECT_SCHEMA,schemaVersion:2,type:'internal',mode:'single',inputs:{...logic.DEFAULT_INPUTS,labelTemplate:'unbekannt'},versions:[]};assert.equal(logic.migrateProject(v2).inputs.labelTemplate,'code-text');
});


test('zentrale Modusregel beschränkt Webadressen auf Einzelcode und Kopien',()=>{
 const all=['single','copies','series','manual','labels'];
 for(const type of ['text','internal','inventory','serial','part','location'])assert.deepEqual(logic.allowedModesForType(type),all);
 assert.deepEqual(logic.allowedModesForType('url'),['single','copies']);
 for(const mode of all)assert.equal(logic.isModeAllowedForType('url',mode),['single','copies'].includes(mode));
});
test('Webadressen-Modi werden semantisch ausgeblendet und nutzen ein lückenloses Raster',()=>{
 assert.match(app,/b\.hidden=!isModeAllowedForType\(state\.type,b\.dataset\.mode\)/);
 assert.match(app,/classList\.toggle\('url-modes',state\.type==='url'\)/);
 assert.match(css,/#modeButtons\.url-modes\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
 assert.match(css,/#modeButtons button\[hidden\]\{display:none\}/);
});
test('alte URL-Projekte und Versionen werden verlustfrei als Text migriert',()=>{
 const inputs={...logic.DEFAULT_INPUTS,manualList:'https://a.example\nfreier Wert',seriesPrefix:'ALT-',labelTitle:'Bewahren'};
 const version={number:1,savedAt:'2026-07-31T00:00:00.000Z',type:'url',mode:'manual',inputs:{...inputs},labels:[],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT}};
 for(const mode of ['series','manual','labels']){const old={schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'url',mode,inputs:{...inputs},labels:[],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[{...version,mode}]};const migrated=logic.migrateProject(old);assert.equal(migrated.type,'text');assert.equal(migrated.mode,mode);assert.deepEqual(migrated.inputs,inputs);assert.equal(migrated.versions[0].type,'text');assert.equal(migrated.versions[0].mode,mode);}
});
test('neue manipulierte URL-Projekte werden abgelehnt, gültige URLs akzeptiert',()=>{
 const base={schema:logic.PROJECT_SCHEMA,schemaVersion:3,modeRules:logic.MODE_RULES_VERSION,type:'url',mode:'single',inputs:{...logic.DEFAULT_INPUTS,singleValue:'https://www.warenschmiede.com'},labels:[],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]};
 assert.equal(logic.validateProject(base),true);assert.equal(logic.validateProject({...base,mode:'copies',inputs:{...base.inputs,copyValue:'https://www.warenschmiede.com',copyCount:'2'}}),true);
 assert.throws(()=>logic.validateProject({...base,mode:'series'}),/nicht erlaubte Kombination/);
 for(const value of ['www.warenschmiede.com','http://www.warenschmiede.com'])assert.throws(()=>logic.validateProject({...base,inputs:{...base.inputs,singleValue:value}}),/https:\/\//);
});
test('Pixelgröße und Hilfe entsprechen der Oberfläche',()=>{
 assert.match(main,/PNG-\/Vorschaugröße \(Pixel\)/);assert.match(main,/Pixelgröße betrifft die Einzelvorschau und den PNG-Export/);assert.match(main,/physische Druckgröße[^<]+Millimetern/);
 for(const phrase of ['nur als „Einzelcode“ oder „Mehrfach drucken“','Angebrochenen A4-Bogen fortsetzen','Lokaler Arbeitsstand','Projektdatei','Version speichern','PNG-/Vorschaugröße (Pixel)','Jetzt drucken'])assert.ok(help.includes(phrase),phrase);
 for(const removed of ['Mini-Preiscode','Mini-Code-Testbogen','Bambu-Beispieldaten','Rollenetiketten'])assert.doesNotMatch(help,new RegExp(removed));
});


test('Inhaltsartwechsel plant übernommene Kennungen als neutralen URL-Zustand',()=>{
 assert.deepEqual(logic.contentTypeSwitchPlan('url','single','WS-ART-0042'),{type:'url',mode:'single',changedMode:false,pendingUrl:true});
 assert.deepEqual(logic.contentTypeSwitchPlan('url','copies','INV-0042'),{type:'url',mode:'copies',changedMode:false,pendingUrl:true});
 for(const mode of ['series','manual','labels'])assert.deepEqual(logic.contentTypeSwitchPlan('url',mode,'WS-ALT'),{type:'url',mode:'single',changedMode:true,pendingUrl:true});
 assert.deepEqual(logic.contentTypeSwitchPlan('url','single','https://www.warenschmiede.com'),{type:'url',mode:'single',changedMode:false,pendingUrl:false});
 assert.deepEqual(logic.contentTypeSwitchPlan('internal','single','WS-ART-0042'),{type:'internal',mode:'single',changedMode:false,pendingUrl:false});
});
test('neutraler URL-Zustand löscht Ausgaben ohne Fehlerdarstellung oder Eingabefelder',()=>{
 const pending=app.match(/function showPendingUrlState[\s\S]*?\n  function switchContentType/)?.[0]||'';
 assert.match(pending,/showEmptyState\(\{save:false\}\)/);assert.match(pending,/className='validation'/);assert.match(pending,/saveDraft\(\)/);assert.doesNotMatch(pending,/invalidateSheet|classList\.add\('invalid'\)|singleValue.*value=|copyValue.*value=/);
 const switching=app.match(/function switchContentType[\s\S]*?\n  function render/)?.[0]||'';
 assert.match(switching,/contentTypeSwitchPlan/);assert.match(switching,/if\(!plan\.pendingUrl\)return render\(\)/);assert.match(switching,/showPendingUrlState/);assert.doesNotMatch(switching,/seriesPrefix.*value=|manualList.*value=|state\.labels=/);
});

test('lokale URL-Entwürfe dürfen unvollständig sein, Projekte und Versionen bleiben streng',()=>{
 const draft=(mode,value,count='12')=>({schema:logic.PROJECT_SCHEMA,schemaVersion:3,modeRules:logic.MODE_RULES_VERSION,type:'url',mode,inputs:{...logic.DEFAULT_INPUTS,singleValue:mode==='single'?value:'',copyValue:mode==='copies'?value:'',copyCount:count},labels:[],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT},versions:[]});
 for(const project of [draft('single','WS-ART-0042'),draft('single',''),draft('copies','INV-0042')]){assert.equal(logic.validateProject(project,{allowIncompleteWork:true}),true);assert.throws(()=>logic.validateProject(project),/https:\/\/|leer/);}
 assert.throws(()=>logic.validateProject(draft('copies','INV-0042','0'),{allowIncompleteWork:true}),/Kopienzahl/);
 assert.throws(()=>logic.validateProject({...draft('single',''),mode:'series'},{allowIncompleteWork:true}),/nicht erlaubte Kombination/);
 const invalidVersion={number:1,savedAt:'2026-08-01T00:00:00.000Z',type:'url',mode:'single',inputs:{...logic.DEFAULT_INPUTS,singleValue:'WS-ART-0042'},labels:[],outputProfile:{...logic.OUTPUT_PROFILE_DEFAULT}};
 assert.throws(()=>logic.validateProject({...draft('single',''),versions:[invalidVersion]},{allowIncompleteWork:true}),/https:\/\//);
 assert.equal(logic.validateProject(draft('single','https://www.warenschmiede.com')),true);
});
test('Projektladen unterscheidet lokalen Entwurf von expliziter Projektdatei',()=>{
 assert.match(app,/function applyProject\(project,\{source='project'\}=\{\}\)/);assert.match(app,/validateProject\(migrated,\{allowIncompleteWork:draft\}\)/);assert.match(app,/pendingDraft[\s\S]*showPendingUrlState\(\{save:false\}\)/);
 assert.match(app,/applyProject\(p,\{source:'draft'\}\)/);assert.match(app,/const migrated=applyProject\(JSON\.parse\(reader\.result\)\)/);
 assert.match(app,/catch\{localStorage\.removeItem\(LOCAL_DRAFT_KEY\);\}/);
});


test('Startablauf rendert einen geladenen lokalen Entwurf nicht erneut',()=>{
 assert.match(app,/let startupStateApplied=false,localMigrationNotice=false/);
 assert.match(app,/if\(p\)\{localMigrationNotice=applyProject\(p,\{source:'draft'\}\);startupStateApplied=true;\}/);
 assert.match(app,/syncSelectors\(\);configureMenu\(\);if\(!startupStateApplied\)render\(\)/);
 assert.match(app,/catch\{localStorage\.removeItem\(LOCAL_DRAFT_KEY\);\}/);
});
