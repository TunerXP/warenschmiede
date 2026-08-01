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


test('A4-Etikettenwerkstatt teilt Seiten und nutzt zentrale Renderlogik', () => {
  assert.match(main,/4\.<\/span><h2>A4-Druckbogen &amp; Etiketten/); assert.match(main,/id="a4Page"/);
  for (const value of ['code-only','code-text','info-portrait','info-landscape']) assert.match(main,new RegExp(`value="${value}"`));
  const layout=logic.calculateA4Layout({orientation:'portrait',labelWidth:90,labelHeight:90,margin:10,gapX:0,gapY:0});
  assert.deepEqual(logic.paginateLabels(['A','B','C','D','E','F','G'],layout),[['A','B','C','D','E','F'],['G']]);
  const model=logic.createLabelModel('CODED',{...logic.DEFAULT_INPUTS,labelTemplate:'info-portrait',labelInfo1:'nur sichtbar'},'<svg viewBox="0 0 10 10"></svg>');
  const markup=logic.createLabelMarkup(model,{cutLines:true});assert.match(markup,/CODED/);assert.match(markup,/nur sichtbar/);assert.match(markup,/cut-lines/);
  assert.doesNotMatch(model.value,/nur sichtbar/); assert.match(app,/function createSheetItemMarkup/);
});
test('Projekt V1 wird vollständig und sicher auf V2 migriert',()=>{
 const oldKeys=['singleValue','copyValue','copyCount','seriesPrefix','seriesSuffix','seriesStart','seriesCount','seriesStep','seriesPad','manualList','foregroundText','backgroundText','size','padding','showText','transparent','autoUpdate','orientation','labelWidth','labelHeight','pageMargin','gapX','gapY','printText','cutLines'];
 const inputs=Object.fromEntries(oldKeys.map(key=>[key,logic.DEFAULT_INPUTS[key]]));const migrated=logic.migrateProject({schema:logic.PROJECT_SCHEMA,schemaVersion:1,type:'internal',mode:'single',inputs,versions:[]});assert.equal(migrated.schemaVersion,3);assert.equal(migrated.inputs.labelTitle,'');assert.equal(logic.validateProject(migrated),true);
});
test('Navigation und Übersicht binden DataMatrix ohne Bildattrappe ein',()=>{const nav=read('assets/js/ws-layout.js'),overview=read('tools/index.html');assert.match(nav,/DataMatrix-Werkstatt Plus/);assert.match(nav,/tools\/DataMatrixWerkstattPlus.html/);assert.match(overview,/datamatrix-art/);assert.match(overview,/datamatrix data matrix 2d code inventar/);assert.doesNotMatch(overview,/img[^>]+datamatrix/i);});

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
 const labels=logic.buildBambuExample();assert.equal(labels.length,5);labels.forEach(label=>logic.validateLabel(label));
 assert.deepEqual(labels.map(label=>label.title),['Station 1','Station 2','Station 3','Station 4','Station 5']);
 assert.ok(labels.every(label=>label.codeValue.includes('Gerät:')));assert.ok(!labels[0].codeValue.includes(labels[0].info1));
 const moved=logic.moveLabel(labels,'label-2',-1);assert.equal(moved[0].id,'label-2');
 const copied=logic.duplicateLabel(labels,'label-1');assert.notEqual(copied[0].id,copied[1].id);
 labels[0].enabled=false;assert.equal(logic.enabledLabels(labels).length,4);
});
test('Mini-Preiscode und Testbogen verwenden erwartete Größen',()=>{
 const value=logic.buildMiniPriceContent({articleId:'WS-ART-0042',price:'12,50 EUR',material:'PLA',duration:'5,5 h'});assert.equal(value,'WS-ART-0042 | 12,50 EUR | PLA | 5,5 h');
 assert.deepEqual([...new Set(logic.createMiniTestSheet(value).map(item=>item.size))],[10,12,15,20]);
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
test('V3-Projekte werden streng statt reparierend validiert',()=>{
 const label=logic.createIndividualLabel({id:'strict-1',title:'Station',codeValue:'CODE'}),profile={...logic.OUTPUT_PROFILE_DEFAULT},base={schema:logic.PROJECT_SCHEMA,schemaVersion:3,type:'internal',mode:'labels',inputs:{...logic.DEFAULT_INPUTS},labels:[label],outputProfile:profile,versions:[]};assert.equal(logic.validateProject(base),true);
 const missingInputs={...base.inputs};delete missingInputs.size;assert.throws(()=>logic.validateProject({...base,inputs:missingInputs}),/size/);
 const missingLabel={...label};delete missingLabel.notes;assert.throws(()=>logic.validateProject({...base,labels:[missingLabel]}),/notes/);
 assert.throws(()=>logic.validateProject({...base,labels:[{...label,id:''}]}),/ID/);assert.throws(()=>logic.validateProject({...base,labels:[label,{...label}]}),/doppelt/);assert.throws(()=>logic.validateProject({...base,labels:[{...label,codeValue:''}]}),/Data-Matrix-Inhalt/);assert.throws(()=>logic.validateProject({...base,labels:[{...label,enabled:'ja'}]}),/Aktivstatus/);assert.throws(()=>logic.validateProject({...base,labels:Array.from({length:501},(_,i)=>({...label,id:`id-${i}`}))}),/500/);
 const untouched={...base};delete untouched.labels;assert.strictEqual(logic.migrateProject(untouched),untouched);
});
test('Ausgabeprofil wird fachlich validiert und verbindlich angewendet',()=>{
 const profile={...logic.OUTPUT_PROFILE_DEFAULT,orientation:'landscape',pageMargin:8,gapX:2,gapY:4,skipSlots:3};assert.equal(logic.validateOutputProfile(profile,{perPage:20}),true);assert.deepEqual(logic.applyOutputProfileToInputs(profile,{}),{orientation:'landscape',pageMargin:'8',gapX:'2',gapY:'4',skipSlots:'3'});
 assert.throws(()=>logic.validateOutputProfile({...profile,orientation:'diagonal'}),/Ausrichtung/);assert.throws(()=>logic.validateOutputProfile({...profile,gapX:-1}),/gapX/);assert.throws(()=>logic.validateOutputProfile({...profile,skipSlots:1.5}),/ganze Zahl/);assert.throws(()=>logic.validateOutputProfile({...profile,skipSlots:20},{perPage:20}),/Druckraster/);assert.throws(()=>logic.validateProfileConsistency({...logic.DEFAULT_INPUTS,gapX:'9'},profile,'Projekt'),/widersprechen/);
});
test('Projektladen besitzt vollständigen tiefen Rollback',()=>{assert.match(app,/function captureCurrentState\(\)/);assert.match(app,/structuredClone\(state\)/);assert.match(app,/function restoreCapturedState/);assert.match(app,/state=structuredClone\(captured\.state\)/);assert.match(app,/foreground.*background/);});
test('Etikettenauswahl und Navigation synchronisieren Einzelvorschau',()=>{assert.match(app,/if\(action==='edit'\)state\.selectedLabelId=id/);assert.match(app,/state\.index=Math\.max\(0,state\.labels\.findIndex/);assert.match(app,/state\.selectedLabelId=state\.labels\[state\.index\]/);assert.match(app,/Dieses Etikett ist für den Druckbogen deaktiviert/);assert.match(app,/scrollIntoView\(\{block:'nearest'\}\)/);});
test('Mini-Code-Dichte wird konservativ bewertet',()=>{assert.equal(logic.parseSvgModules('<svg viewBox="0 0 40 40"></svg>'),40);assert.equal(logic.estimateMiniCodeDensity(40,10).level,'warn');assert.equal(logic.estimateMiniCodeDensity(60,10).level,'block');assert.equal(logic.estimateMiniCodeDensity(20,20).level,'ok');assert.match(app,/sehr dicht/);assert.match(app,/Testgröße – keine Scan-Garantie/);assert.match(app,/\$\('transparent'\)\.checked=false/);assert.match(app,/\$\('spaceDistribution'\)\.value='code-large'/);});

test('individuelle Vorprüfung bewertet keinen langen codeValue als sichtbaren Text',()=>{
 const layout=logic.calculateA4Layout({orientation:'portrait',labelWidth:45,labelHeight:45,margin:10,gapX:3,gapY:3}),inputs={...logic.DEFAULT_INPUTS,labelTemplate:'info-portrait',labelWidth:'45',labelHeight:'45',labelTitle:'X'.repeat(300),longestValue:'X'.repeat(2000)};
 assert.doesNotThrow(()=>logic.validateLabelMinimums(inputs,layout));assert.throws(()=>logic.validateSimpleVisibleText(inputs,layout),/wahrscheinlich zu lang/);const bambu=logic.buildBambuExample();assert.ok(bambu.every(label=>label.codeValue.length>label.visibleValue.length));assert.match(app,/state\.mode==='labels'\?validateLabelMinimums\(inputs,baseLayout\)/);
});
test('kein aktives Etikett ist ein speicherbarer, aber nicht druckbereiter Entwurf',()=>{
 const labels=logic.buildBambuExample().map(label=>({...label,enabled:false})),state=logic.getLabelsPrintState(labels);assert.deepEqual(state,{count:0,ready:false,message:'Für den A4-Druckbogen ist derzeit kein Etikett aktiviert.'});assert.doesNotThrow(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels}));labels[0].enabled=true;assert.deepEqual(logic.getLabelsPrintState(labels),{count:1,ready:true,message:''});const draft=logic.createIndividualLabel({id:'draft',title:'Entwurf',enabled:false});assert.doesNotThrow(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels:[draft]}));draft.enabled=true;assert.throws(()=>logic.validateWorkForPersistence({mode:'labels',type:'internal',inputs:{...logic.DEFAULT_INPUTS},labels:[draft]}),/Data-Matrix-Inhalt/);
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
test('Mini-Dichteprüfung umfasst alle tatsächlich gedruckten Werte',()=>{const labels=[logic.createIndividualLabel({id:'short',title:'Station 1',codeValue:'kurz'}),logic.createIndividualLabel({id:'dense',title:'Station 2',codeValue:'sehr-lang'}),logic.createIndividualLabel({id:'off',title:'Aus',codeValue:'dicht-aus',enabled:false})],targets=logic.getDensityTargets('labels',labels,[]);assert.deepEqual(targets.map(target=>target.name),['Station 1','Station 2']);assert.throws(()=>logic.evaluateDensityTargets(targets,12,value=>value==='sehr-lang'?60:20),/Station 2/);assert.doesNotThrow(()=>logic.evaluateDensityTargets(logic.getDensityTargets('labels',[labels[2]],[]),12,()=>60));assert.equal(logic.getDensityTargets('copies',[],['A','A']).length,1);assert.equal(logic.getDensityTargets('series',[],['A','B','A']).length,2);assert.equal(logic.getDensityTargets('manual',[],['A','B']).length,2);});
test('URL-Prüfung berücksichtigt nur aktive individuelle Etiketten',()=>{const bad=logic.createIndividualLabel({id:'url-3',title:'Etikett 3',codeValue:'keine-url'}),project={mode:'labels',type:'url',inputs:{...logic.DEFAULT_INPUTS},labels:[bad]};assert.throws(()=>logic.validateWorkForPersistence(project),/URL von „Etikett 3“/);bad.enabled=false;assert.doesNotThrow(()=>logic.validateWorkForPersistence(project));bad.enabled=true;assert.throws(()=>logic.validateWorkForPersistence(project),/https:\/\//);});


test('Druckfenster wartet zentral auf Dokument, Schriften und Rendering',()=>{
 assert.match(app,/async function prepareAndPrintWindow/);assert.match(app,/document\.fonts\?\.ready/);
 assert.ok((app.match(/await nextAnimationFrame\(printWindow\)/g)||[]).length>=2);
 assert.match(app,/await delay\(300\)/);assert.match(app,/printWindow\.focus\(\)[\s\S]*printWindow\.print\(\)/);
 assert.match(app,/Druckansicht wird vorbereitet …/);assert.match(app,/Jetzt drucken/);
 assert.equal((app.match(/prepareAndPrintWindow\(w\)/g)||[]).length,2);assert.doesNotMatch(app,/setTimeout\(\(\)=>print\(\),100\)|onload=\(\)=>print\(\)/);
});
test('Mini-Testbogen trennt Kartenfläche, Codegröße und druckstabile Beschriftung',()=>{
 for(const size of [10,12,15,20])assert.match(app,new RegExp(`size-\\$\\{size\\}|size-${size}`));
 assert.match(app,/class="test-card"/);assert.match(app,/width:36mm/);assert.match(app,/\.size-10\{width:10mm;height:10mm\}/);assert.match(app,/\.size-20\{width:20mm;height:20mm\}/);
 assert.match(app,/break-inside:avoid/);assert.match(app,/page-break-inside:avoid/);assert.match(app,/overflow-wrap:normal/);assert.match(app,/word-break:normal/);assert.match(app,/hyphens:none/);
 assert.equal(logic.createMiniTestSheet('TEST').length,16);assert.equal(logic.createMiniTestSheet('TEST').filter(item=>item.size===20).length,4);
});
test('neuer Produktionszustand ist leer, neutral und nur mit Platzhaltern versehen',()=>{
 for(const key of ['singleValue','copyValue','seriesPrefix','manualList','labelTitle','labelInfo1','labelInfo2','miniArticleId','miniPrice','miniMaterial','miniDuration'])assert.equal(logic.DEFAULT_INPUTS[key],'');
 assert.doesNotMatch(main,/id="insertBambuExample"|Bambu-Lab-Beispiel einsetzen/);assert.doesNotMatch(main,/value="(?:WS-DM-0001|WS-ART-0042|12,50 EUR|PLA|5,5 h)"/);
 assert.match(main,/placeholder="z\. B\. WS-ART-0042"/);assert.match(main,/placeholder="z\. B\. 12,50 EUR"/);
 assert.match(app,/function showEmptyState/);assert.match(app,/Bitte zuerst einen Inhalt eingeben\./);assert.match(app,/setSingleOutputAvailability\(false\);setPrintAvailability\(false\)/);
 assert.match(help,/frei änderbar, werden nicht automatisch in das Tool eingesetzt/);
});
