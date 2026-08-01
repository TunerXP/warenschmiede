/* DataMatrix-Werkstatt Plus – lokale Anwendungslogik. */
(function (root) {
  'use strict';
  const PROJECT_SCHEMA = 'warenschmiede.datamatrixWerkstatt.project';
  const PROJECT_VERSION = 2;
  const LOCAL_DRAFT_KEY = 'warenschmiede.datamatrixWerkstatt.localDraft.v1';
  const MAX_CODES = 500;
  const MAX_VERSIONS = 100;
  const TYPES = {
    text:['Freier Text','Text','Werkzeug geprüft','Beliebiger Text wird unverändert gespeichert.'],
    internal:['Interne ID','Interne ID','WS-2026-0147','Eine frei gewählte Kennung für den eigenen Arbeitsablauf.'],
    inventory:['Inventarnummer','Inventarnummer','INV-0042','Eine Inventarnummer erhält ihre Bedeutung durch deine Dokumentation.'],
    serial:['Seriennummer','Seriennummer','SN-A1-2026-0088','Eine vorhandene oder interne Seriennummer.'],
    part:['Bauteilnummer','Bauteilnummer','BT-CNC-014','Eine flexible Kennung für Bauteile.'],
    location:['Lagerplatz','Lagerplatz','HALLE2-A-04-03','Ein Lagerort oder Regalfach.'],
    url:['URL','Webadresse','https://www.warenschmiede.com/','Eine vollständige Webadresse mit https://.']
  };
  const MODE_LABELS={single:'Einzelcode',copies:'Gleicher Code',series:'Serie',manual:'Manuelle Liste'};
  function generateSeries(prefix,start,count,step,pad,suffix='') {
    start=Number(start); count=Number(count); step=Number(step); pad=Number(pad);
    if(!Number.isSafeInteger(start)||!Number.isInteger(count)||count<1||count>MAX_CODES||!Number.isSafeInteger(step)||step===0||!Number.isInteger(pad)||pad<1||pad>20) throw new Error('Serienparameter sind ungültig. Anzahl 1–500, Schrittweite ungleich 0 und Stellenzahl 1–20 verwenden.');
    return Array.from({length:count},(_,i)=>`${prefix}${String(start+i*step).padStart(pad,'0')}${suffix}`);
  }
  function parseManualList(text){return String(text).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);}
  function sanitizeFilename(value){const clean=String(value).replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^[. -]+|[. -]+$/g,'').slice(0,70);return clean||'code';}
  function calculateA4Layout(options){
    const landscape=options.orientation==='landscape', pageWidth=landscape?297:210, pageHeight=landscape?210:297;
    const width=Number(options.labelWidth),height=Number(options.labelHeight),margin=Number(options.margin),gapX=Number(options.gapX),gapY=Number(options.gapY);
    if([width,height,margin,gapX,gapY].some(v=>!Number.isFinite(v)||v<0)||width<=0||height<=0) throw new Error('Etikettenmaße müssen positive Zahlen sein.');
    const usableWidth=pageWidth-2*margin,usableHeight=pageHeight-2*margin;
    const columns=Math.floor((usableWidth+gapX)/(width+gapX)),rows=Math.floor((usableHeight+gapY)/(height+gapY));
    if(columns<1||rows<1) throw new Error('Der Druckbogen passt mit diesen Etikettenmaßen und Rändern nicht auf A4.');
    return {pageWidth,pageHeight,columns,rows,perPage:columns*rows,usableWidth,usableHeight};
  }
  const escapeMarkup=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function createLabelModel(value,inputs,codeMarkup='') { return {value:String(value),codeMarkup,layout:inputs.labelTemplate,title:inputs.labelTitle,valueLabel:inputs.valueLabel,info1:inputs.labelInfo1,info2:inputs.labelInfo2,border:inputs.labelBorder,corners:inputs.labelCorners,textSize:inputs.labelTextSize,textAlign:inputs.labelTextAlign,borderColor:inputs.borderUseCodeColor?inputs.foregroundText:'#263746'}; }
  function createLabelMarkup(model,{cutLines=false}={}) {
    const visible=model.layout!=='code-only';
    return `<article class="sheet-label layout-${escapeMarkup(model.layout)} border-${escapeMarkup(model.border)} corners-${escapeMarkup(model.corners)} text-${escapeMarkup(model.textSize)} align-${escapeMarkup(model.textAlign)}${cutLines?' cut-lines':''}" style="--label-border:${escapeMarkup(model.borderColor)}"><div class="label-code">${model.codeMarkup}</div>${visible?`<div class="label-info">${model.layout.startsWith('info-')?`<strong>${escapeMarkup(model.title)}</strong>`:''}<span class="label-value">${escapeMarkup(model.valueLabel)}${model.valueLabel?' ':''}${escapeMarkup(model.value)}</span>${model.layout.startsWith('info-')&&model.info1?`<span>${escapeMarkup(model.info1)}</span>`:''}${model.layout.startsWith('info-')&&model.info2?`<span>${escapeMarkup(model.info2)}</span>`:''}</div>`:''}</article>`;
  }
  function paginateLabels(values,layout){return Array.from({length:Math.ceil(values.length/layout.perPage)},(_,page)=>values.slice(page*layout.perPage,(page+1)*layout.perPage));}
  function validateLabelLayout(inputs,layout){
    if(inputs.labelTemplate==='info-portrait'&&(Number(inputs.labelHeight)<35||Number(inputs.labelWidth)<25)) throw new Error('Die Hochkant-Infokarte benötigt mehr Höhe oder Breite.');
    if(inputs.labelTemplate==='info-landscape'&&(Number(inputs.labelWidth)<45||Number(inputs.labelHeight)<25)) throw new Error('Die Querformat-Infokarte benötigt mehr Höhe oder Breite.');
    if(inputs.labelTemplate!=='code-only'&&Number(inputs.labelHeight)<18) throw new Error('Text passt nicht sinnvoll in das gewählte Layout.');
    return layout;
  }
  function migrateProject(project){
    if(!isPlainObject(project)||project.schema!==PROJECT_SCHEMA) throw new Error('Diese Datei ist kein gültiges DataMatrix-Werkstatt-Projekt.');
    if(project.schemaVersion===2)return project;
    if(project.schemaVersion!==1)throw new Error('Diese Projektversion wird nicht unterstützt.');
    const legacyKeys=['singleValue','copyValue','copyCount','seriesPrefix','seriesSuffix','seriesStart','seriesCount','seriesStep','seriesPad','manualList','foregroundText','backgroundText','size','padding','showText','transparent','autoUpdate','orientation','labelWidth','labelHeight','pageMargin','gapX','gapY','printText','cutLines'];
    const migrateInputs=inputs=>{if(!isPlainObject(inputs))throw new Error('Die Projektdatei enthält keine gültigen Eingaben.');for(const key of legacyKeys)if(!Object.hasOwn(inputs,key))throw new Error(`Die Projektdatei: Der erforderliche Eingabewert „${key}“ fehlt.`);return {...DEFAULT_INPUTS,...inputs};};
    if(project.versions!==undefined&&!Array.isArray(project.versions))throw new Error('Der Versionsverlauf ist ungültig.');
    return {...project,schemaVersion:2,inputs:migrateInputs(project.inputs),versions:(project.versions||[]).map(version=>({...version,inputs:migrateInputs(version.inputs)}))};
  }
  function calculateIntegerScale(baseWidth,baseHeight,targetSize){
    const target=Number(targetSize),largest=Math.max(Number(baseWidth),Number(baseHeight));
    if(!Number.isInteger(target)||target<1||!Number.isFinite(largest)||largest<1) throw new Error('Ausgabegröße kann nicht berechnet werden.');
    const scale=Math.floor(target/largest);
    if(scale<1) throw new Error('Der Data-Matrix-Code ist für die gewählte Pixelgröße zu groß.');
    return {scale,width:Number(baseWidth)*scale,height:Number(baseHeight)*scale,targetWidth:target,targetHeight:target};
  }
  function buildBwipOptions({value,scale=1,padding=3,foreground='#102033',background='#ffffff',transparent=false}){
    const clean=value=>String(value).replace('#','').toUpperCase();
    const result={bcid:'datamatrix',text:String(value),scale:Number(scale),padding:Number(padding),barcolor:clean(foreground)};
    if(!transparent) result.backgroundcolor=clean(background);
    return result;
  }
  const isPlainObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
  function validateInputs(inputs,label='Projekt'){
    if(!isPlainObject(inputs)) throw new Error(`${label} enthält keine gültigen Eingaben.`);
    for(const [key,expected] of Object.entries(DEFAULT_INPUTS)){
      if(!Object.hasOwn(inputs,key)) throw new Error(`${label}: Der erforderliche Eingabewert „${key}“ fehlt.`);
      const value=inputs[key];
      if(typeof value!==typeof expected||!Number.isFinite(typeof value==='number'?value:0)) throw new Error(`${label}: Der Eingabewert „${key}“ besitzt den falschen Datentyp.`);
    }
    for(const [key,value] of Object.entries(inputs)) if(!['string','number','boolean'].includes(typeof value)||!Number.isFinite(typeof value==='number'?value:0)) throw new Error(`${label}: Der Eingabewert „${key}“ ist ungültig.`);
    return true;
  }
  function validateVersion(version,index){
    const label=`Version ${index+1}`;
    if(!isPlainObject(version)) throw new Error(`${label} ist kein gültiges Versionsobjekt.`);
    if(!Number.isInteger(version.number)||version.number<1) throw new Error(`${label} besitzt keine gültige Versionsnummer.`);
    if(typeof version.savedAt!=='string') throw new Error(`${label} besitzt keinen gültigen Speicherzeitpunkt.`);
    if(!Object.hasOwn(TYPES,version.type)) throw new Error(`${label} enthält eine unbekannte Inhaltsart.`);
    if(!Object.hasOwn(MODE_LABELS,version.mode)) throw new Error(`${label} enthält einen unbekannten Arbeitsmodus.`);
    validateInputs(version.inputs,label);
    return true;
  }
  function validateProject(project){
    project=migrateProject(project);
    if(!isPlainObject(project)) throw new Error('Die Projektdatei enthält kein gültiges Projektobjekt.');
    if(project.schema!==PROJECT_SCHEMA||project.schemaVersion!==PROJECT_VERSION) throw new Error('Diese Datei ist kein gültiges DataMatrix-Werkstatt-Projekt.');
    if(!Object.hasOwn(TYPES,project.type)) throw new Error('Die Projektdatei enthält eine unbekannte Inhaltsart.');
    if(!Object.hasOwn(MODE_LABELS,project.mode)) throw new Error('Die Projektdatei enthält einen unbekannten Arbeitsmodus.');
    validateInputs(project.inputs,'Die Projektdatei');
    if(project.versions!==undefined&&(!Array.isArray(project.versions)||project.versions.length>MAX_VERSIONS)) throw new Error(`Der Versionsverlauf darf höchstens ${MAX_VERSIONS} Einträge enthalten.`);
    (project.versions||[]).forEach(validateVersion);
    return true;
  }
  const DEFAULT_INPUTS={singleValue:'WS-DM-0001',copyValue:'WS-DM-0001',copyCount:'12',seriesPrefix:'INV-',seriesSuffix:'',seriesStart:'1',seriesCount:'10',seriesStep:'1',seriesPad:'4',manualList:'INV-0042\n\nBT-CNC-014',foregroundText:'#102033',backgroundText:'#ffffff',size:'320',padding:'3',showText:true,transparent:false,autoUpdate:true,orientation:'portrait',labelWidth:'45',labelHeight:'45',pageMargin:'10',gapX:'3',gapY:'3',printText:true,cutLines:false,labelTemplate:'code-text',labelBorder:'fine',labelCorners:'square',labelTextSize:'normal',labelTextAlign:'left',labelTitle:'Inventar',valueLabel:'Inventar-Nr.',labelInfo1:'Standort: Halle 2',labelInfo2:'Bereich: Werkzeugbau',borderUseCodeColor:false};
  const api={generateSeries,parseManualList,sanitizeFilename,calculateA4Layout,calculateIntegerScale,buildBwipOptions,createLabelModel,createLabelMarkup,paginateLabels,validateLabelLayout,migrateProject,validateInputs,validateVersion,validateProject,DEFAULT_INPUTS,MAX_VERSIONS,PROJECT_SCHEMA,PROJECT_VERSION,LOCAL_DRAFT_KEY};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(typeof document==='undefined') return;
  const $=id=>document.getElementById(id); let state={type:'internal',mode:'single',values:['WS-DM-0001'],index:0,page:0,versions:[]}; let lastFocus,draftTimer;
  const fields=Object.keys(DEFAULT_INPUTS);
  function message(text,tone=''){const el=$('validation');el.textContent=text;el.className=`validation ${tone}`;}
  function readValues(){
    let values;
    if(state.mode==='single') values=[$('singleValue').value.trim()];
    if(state.mode==='copies'){const n=Number($('copyCount').value);if(!Number.isInteger(n)||n<1||n>MAX_CODES)throw new Error('Die Kopienzahl muss zwischen 1 und 500 liegen.');values=Array(n).fill($('copyValue').value.trim());}
    if(state.mode==='series') values=generateSeries($('seriesPrefix').value, $('seriesStart').value,$('seriesCount').value,$('seriesStep').value,$('seriesPad').value,$('seriesSuffix').value);
    if(state.mode==='manual'){values=parseManualList($('manualList').value);if(values.length>MAX_CODES)throw new Error('Die Liste enthält mehr als 500 Werte. Bitte aufteilen.');}
    if(!values?.length||values.some(v=>!v))throw new Error('Bitte mindestens einen nicht leeren Inhalt eingeben.');
    if(state.type==='url'&&values.some(v=>{try{const u=new URL(v);return !/^https?:$/.test(u.protocol);}catch{return true;}}))throw new Error('Bitte eine gültige URL einschließlich https:// eingeben.');
    state.values=values;state.index=Math.min(state.index,values.length-1);$('manualCount').textContent=`${parseManualList($('manualList').value).length} gültige Werte erkannt`;
    message(values.some(v=>v.length>500)?`${values.length} Codes entstehen. Sehr lange Inhalte können schwerer scanbar sein.`:`${values.length} ${values.length===1?'Code entsteht':'Codes entstehen'}.`,values.some(v=>v.length>500)?'warn':'');
    return values;
  }
  function options(value,scale=1){return buildBwipOptions({value,scale,padding:$('padding').value,foreground:$('foregroundText').value,background:$('backgroundText').value,transparent:$('transparent').checked});}
  function clearPreview(){const canvas=$('dmCanvas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);canvas.width=1;canvas.height=1;$('previewText').textContent='Vorschau ungültig';$('previewStage').classList.add('invalid');}
  function drawExactCanvas(value){
    const target=Number($('size').value),base=document.createElement('canvas');root.bwipjs.toCanvas(base,options(value,1));
    const dimensions=calculateIntegerScale(base.width,base.height,target),symbol=document.createElement('canvas');root.bwipjs.toCanvas(symbol,options(value,dimensions.scale));
    const canvas=$('dmCanvas');canvas.width=target;canvas.height=target;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    if(!$('transparent').checked){ctx.fillStyle=$('backgroundText').value;ctx.fillRect(0,0,target,target);}
    ctx.drawImage(symbol,Math.floor((target-symbol.width)/2),Math.floor((target-symbol.height)/2));canvas.style.width=`min(${target}px, 100%)`;canvas.style.height='auto';
  }
  function render({save=true}={}){
    try{readValues();if(!root.bwipjs)throw new Error('Die Data-Matrix-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und neu laden.');const value=state.values[state.index];drawExactCanvas(value);$('previewStage').classList.remove('invalid');$('previewText').textContent=$('showText').checked?value:'';$('metaType').textContent=TYPES[state.type][0];$('metaChars').textContent=value.length;$('metaCount').textContent=state.values.length;$('metaValue').textContent=value;$('position').textContent=`${state.index+1} von ${state.values.length}`;$('prevCode').disabled=state.index===0;$('nextCode').disabled=state.index===state.values.length-1;updateSheet();if(save)saveDraft();return true;}
    catch(error){clearPreview();message(error.message||'Data Matrix konnte nicht erzeugt werden.','error');return false;}
  }
  function currentInputs(){return Object.fromEntries(fields.map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value]));}
  function sheetCss(l){const i=currentInputs();return `--page-w:${l.pageWidth};--page-h:${l.pageHeight};--margin:${i.pageMargin};--label-w:${i.labelWidth};--label-h:${i.labelHeight};--gap-x:${i.gapX};--gap-y:${i.gapY};--columns:${l.columns};--rows:${l.rows};--code-color:${i.foregroundText};--code-bg:${i.backgroundText}`;}
  function renderSheetPage(l){const inputs=currentInputs(),pages=paginateLabels(state.values,l);state.page=Math.max(0,Math.min(state.page,pages.length-1));$('a4Page').setAttribute('style',sheetCss(l));$('a4Page').innerHTML=pages[state.page].map(value=>createLabelMarkup(createLabelModel(value,inputs,svg(value)),{cutLines:inputs.cutLines})).join('');$('sheetPosition').textContent=`Seite ${state.page+1} von ${pages.length}`;$('prevSheet').disabled=state.page===0;$('nextSheet').disabled=state.page===pages.length-1;}
  function updateSheet(){try{const inputs=currentInputs(),l=validateLabelLayout(inputs,calculateA4Layout({orientation:inputs.orientation,labelWidth:inputs.labelWidth,labelHeight:inputs.labelHeight,margin:inputs.pageMargin,gapX:inputs.gapX,gapY:inputs.gapY}));const pages=Math.ceil(state.values.length/l.perPage);$('sheetStats').textContent=`${l.columns} Spalten · ${l.rows} Reihen · ${l.perPage} pro Seite · ${state.values.length} Codes · ${pages} Seite(n)`;if(root.bwipjs)renderSheetPage(l);$('sheetValidation').textContent='Layout ist druckbereit.';$('sheetValidation').className='validation';$('printSheet').disabled=false;return l;}catch(e){$('sheetStats').textContent=e.message;$('sheetValidation').textContent=e.message;$('sheetValidation').className='validation error';$('printSheet').disabled=true;$('a4Page').innerHTML='';return null;}}
  function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function fileBase(){return `datamatrix-${sanitizeFilename(state.values[state.index])}`;}
  function png(){if(!render())return;$('dmCanvas').toBlob(blob=>{if(!blob)return message('PNG-Export fehlgeschlagen.','error');download(blob,`${fileBase()}.png`);message('PNG gespeichert. Bitte mit dem später verwendeten Scanner und in echter Druckgröße testen.');},'image/png');}
  function svg(value=state.values[state.index]){if(!root.bwipjs)throw new Error();return root.bwipjs.toSVG(options(value));}
  function svgDownload(){if(!render())return;try{download(new Blob([svg()],{type:'image/svg+xml'}),`${fileBase()}.svg`);message('SVG gespeichert. Bitte mit dem später verwendeten Scanner und in echter Druckgröße testen.');}catch{message('SVG-Export fehlgeschlagen.','error');}}
  function printSheet(){if(!render())return;try{const l=updateSheet();if(!l)throw new Error('Druckbogen passt nicht auf A4.');const inputs=currentInputs(),pages=paginateLabels(state.values,l),w=root.open('','_blank');if(!w)throw new Error('Druckfenster wurde blockiert.');const labels=page=>page.map(v=>createLabelMarkup(createLabelModel(v,inputs,svg(v)),{cutLines:inputs.cutLines})).join('');const sheets=pages.map(page=>`<main class="print-page" style="${sheetCss(l)}">${labels(page)}</main>`).join('');w.document.write(`<!doctype html><html><head><title>Data-Matrix-Druckbogen</title><style>@page{size:A4 ${inputs.orientation};margin:0}*{box-sizing:border-box}body{margin:0}.print-page{width:calc(var(--page-w)*1mm);height:calc(var(--page-h)*1mm);padding:calc(var(--margin)*1mm);display:grid;grid-template-columns:repeat(var(--columns),calc(var(--label-w)*1mm));grid-template-rows:repeat(var(--rows),calc(var(--label-h)*1mm));gap:calc(var(--gap-y)*1mm) calc(var(--gap-x)*1mm);break-after:page}.sheet-label{overflow:hidden;padding:1.5mm;display:flex;align-items:center;justify-content:center;background:var(--code-bg)}.label-code{min-width:0;display:grid;place-items:center}.label-code svg{display:block;max-width:100%;max-height:100%}.label-info{min-width:0;display:flex;flex-direction:column;gap:.6mm;overflow-wrap:anywhere}.layout-code-text,.layout-info-portrait{flex-direction:column}.layout-info-landscape{display:grid;grid-template-columns:45% 1fr;gap:1.5mm}.layout-code-only .label-code{width:100%;height:100%}.border-fine{border:.25mm solid var(--label-border)}.border-strong{border:.6mm solid var(--label-border)}.corners-rounded{border-radius:2mm}.cut-lines{outline:.2mm dashed #999}.text-small{font:7pt system-ui}.text-normal{font:9pt system-ui}.text-large{font:11pt system-ui}.align-center{text-align:center}@media print{body{print-color-adjust:exact}}</style></head><body>${sheets}<script>onload=()=>setTimeout(()=>print(),100)<\/script></body></html>`);w.document.close();message('Druckdialog vorbereitet. Bitte echte Druckgröße und Scanner testen.');}catch(e){message(e.message||'Drucken fehlgeschlagen.','error');}}
  function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML;}
  function snapshot(){return {schema:PROJECT_SCHEMA,schemaVersion:PROJECT_VERSION,tool:'DataMatrix-Werkstatt Plus',savedAt:new Date().toISOString(),type:state.type,mode:state.mode,inputs:Object.fromEntries(fields.filter(id=>$(id)).map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value])),versions:state.versions};}
  function saveDraft(){try{localStorage.setItem(LOCAL_DRAFT_KEY,JSON.stringify(snapshot()));}catch{/* Speicher kann deaktiviert sein. */}}
  function saveDraftSoon(){const validDraft=JSON.stringify(snapshot());clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{localStorage.setItem(LOCAL_DRAFT_KEY,validDraft);}catch{/* Speicher kann deaktiviert sein. */}},250);}
  function persistWithoutRender(){try{readValues();updateSheet();saveDraftSoon();return true;}catch(error){message(error.message||'Die Eingaben sind ungültig.','error');return false;}}
  function handleCurrentInput(){if($('autoUpdate').checked)return render();return persistWithoutRender();}
  function applyProject(p){p=migrateProject(p);validateProject(p);const previous=snapshot(),nextInputs={...p.inputs};try{state.type=p.type;state.mode=p.mode;state.versions=p.versions?[...p.versions]:[];Object.entries(nextInputs).forEach(([id,v])=>{if($(id))$(id).type==='checkbox'?$(id).checked=Boolean(v):$(id).value=String(v);});syncSelectors();if(!render())throw new Error('Die Projektdatei enthält fachlich ungültige Eingaben.');}catch(error){state.type=previous.type;state.mode=previous.mode;state.versions=previous.versions;Object.entries(previous.inputs).forEach(([id,v])=>{$(id).type==='checkbox'?$(id).checked=v:$(id).value=v;});syncSelectors();render();throw error;}}
  function saveProject(){if(!render())return;download(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),`datamatrix-projekt-${new Date().toISOString().slice(0,10)}.json`);message('Projektdatei gespeichert.');}
  function loadProject(file){if(!file)return;if(file.size>2_000_000)return message('Projektdatei ist größer als 2 MB.','error');const reader=new FileReader();reader.onerror=()=>message('Projektdatei konnte nicht gelesen werden.','error');reader.onload=()=>{try{applyProject(JSON.parse(reader.result));message('Projekt geladen.');}catch(e){message(e.message||'Ungültige Projektdatei.','error');}};reader.readAsText(file);}
  function saveVersion(){if(!render())return;if(state.versions.length>=MAX_VERSIONS)return message(`Es können höchstens ${MAX_VERSIONS} lokale Versionen gespeichert werden. Bitte das Projekt exportieren oder den lokalen Arbeitsstand zurücksetzen.`,'warn');const number=state.versions.reduce((highest,version)=>Math.max(highest,version.number),0)+1;state.versions.push({number,savedAt:new Date().toISOString(),type:state.type,mode:state.mode,inputs:snapshot().inputs});saveDraft();message(`Version ${number} lokal gespeichert.`);}
  function resetToDefaults(){state={type:'internal',mode:'single',values:['WS-DM-0001'],index:0,versions:[]};Object.entries(DEFAULT_INPUTS).forEach(([id,value])=>{$(id).type==='checkbox'?$(id).checked=value:$(id).value=value;});$('foreground').value='#102033';$('background').value='#ffffff';syncSelectors();render({save:false});}
  function clearLocalDraft(){const warning='Lokalen DataMatrix-Arbeitsstand wirklich löschen?\n\nAlle lokal gespeicherten Eingaben und Versionen werden entfernt.\nDiese Aktion kann nicht rückgängig gemacht werden.';if(!root.confirm(warning))return;clearTimeout(draftTimer);localStorage.removeItem(LOCAL_DRAFT_KEY);resetToDefaults();message('Lokaler DataMatrix-Arbeitsstand wurde vollständig gelöscht.');}
  function syncSelectors(){document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b.dataset.type===state.type));document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===state.mode));const t=TYPES[state.type];$('singleLabel').textContent=t[1];$('singleExample').textContent=`Beispiel: ${t[2]}`;$('typeHint').textContent=t[3];$('selectionSummary').textContent=`${t[0]} · ${MODE_LABELS[state.mode]}`;}
  function openHelp(topic='start'){lastFocus=document.activeElement;$('helpFrame').src=`/tools/datamatrix-werkstatt/hilfe.html?embed=1#${topic}`;$('helpDialog').showModal();document.documentElement.classList.add('help-open');document.body.classList.add('help-open');}
  function unlockHelpScroll(){document.documentElement.classList.remove('help-open');document.body.classList.remove('help-open');}
  function closeHelp(){$('helpDialog').close();unlockHelpScroll();lastFocus?.focus();}
  function helpWindow(){let hash='start';try{hash=$('helpFrame').contentWindow.location.hash.slice(1)||hash;}catch{}const width=Math.min(1200,root.screen.availWidth||root.innerWidth),height=Math.min(850,root.screen.availHeight||root.innerHeight);const p=root.open(`/tools/datamatrix-werkstatt/hilfe.html#${hash}`,'wsDataMatrixHelp',`popup=yes,resizable=yes,scrollbars=yes,width=${width},height=${height}`);if(p)p.focus();else message('Das eigene Hilfefenster wurde vom Browser blockiert. Bitte Popups für diese Seite erlauben.','warn');}
  function configureMenu(){const help=[{label:'Hilfe & Anleitung',description:'Lern- und Nachschlagebereich öffnen.',action:()=>openHelp()}];if(matchMedia('(min-width:761px)').matches)help.push({label:'Anleitung in eigenem Fenster',description:'Hilfe separat öffnen.',action:helpWindow});root.WSToolMenu?.configure({toolName:'DataMatrix-Werkstatt Plus',toolDescription:'Kompakte zweidimensionale Codes erstellen.',sections:[{title:'Projekt & Daten',items:[{label:'Projekt speichern',description:'DataMatrix-Projekt als JSON-Datei sichern.',action:saveProject},{label:'Projekt laden',description:'Gespeicherte DataMatrix-Projektdatei öffnen.',action:()=>$('projectFileInput').click()},{label:'Version speichern',description:'Snapshot lokal sichern. Beim nächsten Projekt-Export wird der Verlauf mitgespeichert.',action:saveVersion},{label:'Lokalen Arbeitsstand löschen',description:'Lokale Eingaben und Versionen vollständig zurücksetzen.',tone:'danger',action:clearLocalDraft}]},{title:'Hilfe',items:help},{title:'Werkzeugfamilie',items:[{label:'Zur Barcode-Werkstatt Plus',description:'Strichcodes, Serien, Etiketten und Druckbögen erstellen.',href:'/tools/BarcodeWerkstattPlus.html'},{label:'Zur QR-Werkstatt Plus',description:'Links, Kontakte, WLAN, Zahlungen und mehr als QR-Code erstellen.',href:'/tools/QRCodeMasterPro.html'}]},{title:'Warenschmiede',items:[{label:'Zur Tool-Übersicht',href:'/tools/'},{label:'Zur Homepage',href:'https://www.warenschmiede.com/'},{label:'Impressum',href:'/kontakt/impressum.html'},{label:'Datenschutz',href:'/datenschutz.html'}]}]});}
  document.addEventListener('DOMContentLoaded',()=>{
    try{const p=JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY));if(p)applyProject(p);}catch{localStorage.removeItem(LOCAL_DRAFT_KEY);}
    document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{state.type=b.dataset.type;syncSelectors();render();}));document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;state.index=0;syncSelectors();render();}));
    fields.forEach(id=>$(id)?.addEventListener('input',handleCurrentInput));
    [['foreground','foregroundText'],['background','backgroundText']].forEach(([c,t])=>{$(c).addEventListener('input',()=>{$(t).value=$(c).value;handleCurrentInput();});$(t).addEventListener('change',()=>{if(/^#[0-9a-f]{6}$/i.test($(t).value)){$(c).value=$(t).value;handleCurrentInput();}else message('Bitte einen Hexwert wie #102033 eingeben.','error');});});
    $('refresh').onclick=render;$('prevCode').onclick=()=>{state.index--;render();};$('nextCode').onclick=()=>{state.index++;render();};$('downloadPng').onclick=png;$('downloadSvg').onclick=svgDownload;$('copyValue').onclick=async()=>{if(!render())return;try{await navigator.clipboard.writeText(state.values[state.index]);message('Inhalt kopiert.');}catch{message('Zwischenablage ist nicht verfügbar.','error');}};$('printSheet').onclick=printSheet;$('prevSheet').onclick=()=>{state.page--;updateSheet();};$('nextSheet').onclick=()=>{state.page++;updateSheet();};
    $('projectFileInput').onchange=e=>{loadProject(e.target.files[0]);e.target.value='';};$('helpClose').onclick=closeHelp;$('helpDialog').addEventListener('close',()=>{unlockHelpScroll();lastFocus?.focus();});$('helpDialog').addEventListener('cancel',unlockHelpScroll);$('helpWindowOpen').onclick=helpWindow;$('toolMenuBtn').onclick=()=>root.WSToolMenu?.open();syncSelectors();configureMenu();render();
  });
})(typeof window!=='undefined'?window:globalThis);
