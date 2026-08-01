/* DataMatrix-Werkstatt Plus – lokale Anwendungslogik. */
(function (root) {
  'use strict';
  const PROJECT_SCHEMA = 'warenschmiede.datamatrixWerkstatt.project';
  const PROJECT_VERSION = 1;
  const LOCAL_DRAFT_KEY = 'warenschmiede.datamatrixWerkstatt.localDraft.v1';
  const MAX_CODES = 500;
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
    return {pageWidth,pageHeight,columns,rows,perPage:columns*rows};
  }
  const api={generateSeries,parseManualList,sanitizeFilename,calculateA4Layout,PROJECT_SCHEMA,LOCAL_DRAFT_KEY};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(typeof document==='undefined') return;
  const $=id=>document.getElementById(id); let state={type:'internal',mode:'single',values:['WS-DM-0001'],index:0,versions:[]}; let lastFocus;
  const fields=['singleValue','copyValue','copyCount','seriesPrefix','seriesSuffix','seriesStart','seriesCount','seriesStep','seriesPad','manualList','foregroundText','backgroundText','size','padding','showText','transparent','autoUpdate','orientation','labelWidth','labelHeight','pageMargin','gapX','gapY','printText','cutLines'];
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
  function options(value,scale){return {bcid:'datamatrix',text:value,scale:scale||3,padding:Number($('padding').value),backgroundcolor:$('transparent').checked?'FFFFFF00':$('backgroundText').value.replace('#',''),barcolor:$('foregroundText').value.replace('#','')};}
  function render(){
    try{readValues();if(!root.bwipjs)throw new Error('Die Data-Matrix-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und neu laden.');const value=state.values[state.index];const canvas=$('dmCanvas');root.bwipjs.toCanvas(canvas,options(value));const target=Number($('size').value);canvas.style.width=`min(${target}px, 100%)`;canvas.style.height='auto';$('previewText').textContent=$('showText').checked?value:'';$('metaType').textContent=TYPES[state.type][0];$('metaChars').textContent=value.length;$('metaCount').textContent=state.values.length;$('metaValue').textContent=value;$('position').textContent=`${state.index+1} von ${state.values.length}`;$('prevCode').disabled=state.index===0;$('nextCode').disabled=state.index===state.values.length-1;updateSheet();saveDraft();}
    catch(error){message(error.message||'Data Matrix konnte nicht erzeugt werden.','error');}
  }
  function updateSheet(){try{const l=calculateA4Layout({orientation:$('orientation').value,labelWidth:$('labelWidth').value,labelHeight:$('labelHeight').value,margin:$('pageMargin').value,gapX:$('gapX').value,gapY:$('gapY').value});$('sheetStats').textContent=`${l.columns} Spalten × ${l.rows} Reihen = ${l.perPage} Etiketten pro Seite · ${Math.ceil(state.values.length/l.perPage)} Seite(n)`;return l;}catch(e){$('sheetStats').textContent=e.message;return null;}}
  function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function fileBase(){return `datamatrix-${sanitizeFilename(state.values[state.index])}`;}
  function png(){try{render();$('dmCanvas').toBlob(blob=>{if(!blob)return message('PNG-Export fehlgeschlagen.','error');download(blob,`${fileBase()}.png`);message('PNG gespeichert. Bitte mit dem später verwendeten Scanner und in echter Druckgröße testen.');},'image/png');}catch(e){message('PNG-Export fehlgeschlagen.','error');}}
  function svg(value=state.values[state.index]){if(!root.bwipjs)throw new Error();return root.bwipjs.toSVG(options(value));}
  function svgDownload(){try{render();download(new Blob([svg()],{type:'image/svg+xml'}),`${fileBase()}.svg`);message('SVG gespeichert. Bitte mit dem später verwendeten Scanner und in echter Druckgröße testen.');}catch{message('SVG-Export fehlgeschlagen.','error');}}
  function printSheet(){try{readValues();const l=updateSheet();if(!l)throw new Error('Druckbogen passt nicht auf A4.');const w=root.open('','_blank');if(!w)throw new Error('Druckfenster wurde blockiert.');const o=$('orientation').value,cut=$('cutLines').checked?'1px dashed #aaa':'none',txt=$('printText').checked;const labels=state.values.map(v=>`<article><div>${svg(v)}</div>${txt?`<p>${escapeHtml(v)}</p>`:''}</article>`).join('');w.document.write(`<!doctype html><html><head><title>Data-Matrix-Druckbogen</title><style>@page{size:A4 ${o};margin:${$('pageMargin').value}mm}*{box-sizing:border-box}body{margin:0;display:grid;grid-template-columns:repeat(${l.columns},${$('labelWidth').value}mm);grid-auto-rows:${$('labelHeight').value}mm;gap:${$('gapY').value}mm ${$('gapX').value}mm}article{border:${cut};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2mm;overflow:hidden;break-inside:avoid}svg{display:block;max-width:100%;max-height:${txt?'75%':'100%'}}p{font:9pt system-ui;margin:1mm 0 0;max-width:100%;overflow-wrap:anywhere;text-align:center}</style></head><body>${labels}<script>onload=()=>setTimeout(()=>print(),100)<\/script></body></html>`);w.document.close();message('Druckdialog vorbereitet. Bitte echte Druckgröße und Scanner testen.');}catch(e){message(e.message||'Drucken fehlgeschlagen.','error');}}
  function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML;}
  function snapshot(){return {schema:PROJECT_SCHEMA,schemaVersion:PROJECT_VERSION,tool:'DataMatrix-Werkstatt Plus',savedAt:new Date().toISOString(),type:state.type,mode:state.mode,inputs:Object.fromEntries(fields.filter(id=>$(id)).map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value])),versions:state.versions};}
  function saveDraft(){try{localStorage.setItem(LOCAL_DRAFT_KEY,JSON.stringify(snapshot()));}catch{/* Speicher kann deaktiviert sein. */}}
  function applyProject(p){if(p.schema!==PROJECT_SCHEMA||p.schemaVersion!==PROJECT_VERSION)throw new Error('Diese Datei ist kein gültiges DataMatrix-Werkstatt-Projekt.');state.type=p.type;state.mode=p.mode;state.versions=Array.isArray(p.versions)?p.versions:[];Object.entries(p.inputs||{}).forEach(([id,v])=>{if($(id))$(id).type==='checkbox'?$(id).checked=Boolean(v):$(id).value=v;});syncSelectors();render();}
  function saveProject(){download(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),`datamatrix-projekt-${new Date().toISOString().slice(0,10)}.json`);message('Projektdatei gespeichert.');}
  function loadProject(file){if(!file)return;if(file.size>2_000_000)return message('Projektdatei ist größer als 2 MB.','error');const reader=new FileReader();reader.onerror=()=>message('Projektdatei konnte nicht gelesen werden.','error');reader.onload=()=>{try{applyProject(JSON.parse(reader.result));message('Projekt geladen.');}catch(e){message(e.message||'Ungültige Projektdatei.','error');}};reader.readAsText(file);}
  function saveVersion(){state.versions.push({number:state.versions.length+1,savedAt:new Date().toISOString(),type:state.type,mode:state.mode,inputs:snapshot().inputs});saveDraft();message(`Version ${state.versions.length} lokal gespeichert.`);}
  function syncSelectors(){document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b.dataset.type===state.type));document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===state.mode));const t=TYPES[state.type];$('singleLabel').textContent=t[1];$('singleExample').textContent=`Beispiel: ${t[2]}`;$('typeHint').textContent=t[3];$('selectionSummary').textContent=`${t[0]} · ${MODE_LABELS[state.mode]}`;}
  function openHelp(topic='start'){lastFocus=document.activeElement;$('helpFrame').src=`/tools/datamatrix-werkstatt/hilfe.html?embed=1#${topic}`;$('helpDialog').showModal();document.documentElement.classList.add('help-open');}
  function closeHelp(){$('helpDialog').close();document.documentElement.classList.remove('help-open');lastFocus?.focus();}
  function helpWindow(){let hash='start';try{hash=$('helpFrame').contentWindow.location.hash.slice(1)||hash;}catch{}const p=root.open(`/tools/datamatrix-werkstatt/hilfe.html#${hash}`,'wsDataMatrixHelp','popup=yes,resizable=yes,scrollbars=yes,width=1200,height=850');p?.focus();}
  function configureMenu(){const help=[{label:'Hilfe & Anleitung',description:'Lern- und Nachschlagebereich öffnen.',action:()=>openHelp()}];if(matchMedia('(min-width:761px)').matches)help.push({label:'Anleitung in eigenem Fenster',description:'Hilfe separat öffnen.',action:helpWindow});root.WSToolMenu?.configure({toolName:'DataMatrix-Werkstatt Plus',toolDescription:'Kompakte zweidimensionale Codes erstellen.',sections:[{title:'Projekt & Daten',items:[{label:'Projekt speichern',action:saveProject},{label:'Projekt laden',action:()=>$('projectFileInput').click()},{label:'Version speichern',action:saveVersion},{label:'Lokalen Arbeitsstand löschen',tone:'danger',action:()=>{localStorage.removeItem(LOCAL_DRAFT_KEY);state.versions=[];message('Lokaler Arbeitsstand gelöscht.');}}]},{title:'Hilfe',items:help},{title:'Werkzeugfamilie',items:[{label:'Zur Barcode-Werkstatt Plus',description:'Strichcodes, Serien, Etiketten und Druckbögen erstellen.',href:'/tools/BarcodeWerkstattPlus.html'},{label:'Zur QR-Werkstatt Plus',description:'Links, Kontakte, WLAN, Zahlungen und mehr als QR-Code erstellen.',href:'/tools/QRCodeMasterPro.html'}]},{title:'Warenschmiede',items:[{label:'Zur Tool-Übersicht',href:'/tools/'},{label:'Zur Homepage',href:'https://www.warenschmiede.com/'},{label:'Impressum',href:'/kontakt/impressum.html'},{label:'Datenschutz',href:'/datenschutz.html'}]}]});}
  document.addEventListener('DOMContentLoaded',()=>{
    try{const p=JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY));if(p)applyProject(p);}catch{localStorage.removeItem(LOCAL_DRAFT_KEY);}
    document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{state.type=b.dataset.type;syncSelectors();render();}));document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;state.index=0;syncSelectors();render();}));
    fields.forEach(id=>$(id)?.addEventListener('input',()=>{if(id==='foreground'||id==='background')return;if($('autoUpdate').checked)render();else{try{readValues();updateSheet();}catch(e){message(e.message,'error');}}}));
    [['foreground','foregroundText'],['background','backgroundText']].forEach(([c,t])=>{$(c).addEventListener('input',()=>{$(t).value=$(c).value;render();});$(t).addEventListener('change',()=>{if(/^#[0-9a-f]{6}$/i.test($(t).value)){$(c).value=$(t).value;render();}else message('Bitte einen Hexwert wie #102033 eingeben.','error');});});
    $('refresh').onclick=render;$('prevCode').onclick=()=>{state.index--;render();};$('nextCode').onclick=()=>{state.index++;render();};$('downloadPng').onclick=png;$('downloadSvg').onclick=svgDownload;$('copyValue').onclick=async()=>{try{await navigator.clipboard.writeText(state.values[state.index]);message('Inhalt kopiert.');}catch{message('Zwischenablage ist nicht verfügbar.','error');}};$('printSheet').onclick=printSheet;
    $('projectFileInput').onchange=e=>{loadProject(e.target.files[0]);e.target.value='';};$('helpClose').onclick=closeHelp;$('helpDialog').addEventListener('close',()=>{document.documentElement.classList.remove('help-open');lastFocus?.focus();});$('helpWindowOpen').onclick=helpWindow;$('toolMenuBtn').onclick=()=>root.WSToolMenu?.open();syncSelectors();configureMenu();render();
  });
})(typeof window!=='undefined'?window:globalThis);
