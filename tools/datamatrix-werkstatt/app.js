/* DataMatrix-Werkstatt Plus – lokale Anwendungslogik. */
(function (root) {
  'use strict';
  const PROJECT_SCHEMA = 'warenschmiede.datamatrixWerkstatt.project';
  const PROJECT_VERSION = 3;
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
  const MODE_LABELS={single:'Einzelcode',copies:'Mehrfach drucken',series:'Serie',manual:'Manuelle Liste',labels:'Individuelle Etiketten'};
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
  function normalizeLabelCodeSvg(codeMarkup) {
    const markup=String(codeMarkup||'').trim();
    if(!/^<svg\b[\s\S]*<\/svg>$/i.test(markup)) throw new Error('Die Data-Matrix-Codegrafik fehlt oder ist ungültig. Bitte Vorschau aktualisieren.');
    return markup.replace(/^<svg\b([^>]*)>/i,(_,attributes)=>{
      let clean=attributes.replace(/\s(?:class|width|height|preserveAspectRatio)=(['"])[\s\S]*?\1/gi,'');
      return `<svg${clean} class="label-code-svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
    });
  }
  function createLabelModel(value,inputs,codeMarkup='',visibleValue=value) { return {value:String(visibleValue),codeValue:String(value),codeMarkup:normalizeLabelCodeSvg(codeMarkup),layout:inputs.labelTemplate,title:inputs.labelTitle,valueLabel:inputs.valueLabel,info1:inputs.labelInfo1,info2:inputs.labelInfo2,printText:inputs.printText,border:inputs.labelBorder,corners:inputs.labelCorners,textSize:inputs.labelTextSize,textAlign:inputs.labelTextAlign,distribution:inputs.spaceDistribution||'balanced',textBehavior:inputs.textBehavior||'auto',borderColor:inputs.borderUseCodeColor?inputs.foregroundText:'#263746'}; }
  function createLabelMarkup(model,{cutLines=false}={}) {
    const info=model.layout.startsWith('info-'),showValue=model.layout!=='code-only'&&model.printText;
    const title=info&&model.title?`<strong class="label-title">${escapeMarkup(model.title)}</strong>`:'';
    const details=info||showValue?`<div class="label-info">${model.layout==='info-landscape'?title:''}${showValue?`<span class="label-value">${escapeMarkup(model.valueLabel)}${model.valueLabel?' ':''}${escapeMarkup(model.value)}</span>`:''}${info&&model.info1?`<span>${escapeMarkup(model.info1)}</span>`:''}${info&&model.info2?`<span>${escapeMarkup(model.info2)}</span>`:''}</div>`:'';
    return `<article class="sheet-label layout-${escapeMarkup(model.layout)} border-${escapeMarkup(model.border)} corners-${escapeMarkup(model.corners)} text-${escapeMarkup(model.textSize)} align-${escapeMarkup(model.textAlign)} distribution-${escapeMarkup(model.distribution)}${cutLines?' cut-lines':''}" style="--label-border:${escapeMarkup(model.borderColor)}">${model.layout==='info-portrait'?title:''}<div class="label-code">${model.codeMarkup}</div>${details}</article>`;
  }
  function paginateLabels(values,layout){return Array.from({length:Math.ceil(values.length/layout.perPage)},(_,page)=>values.slice(page*layout.perPage,(page+1)*layout.perPage));}
  function clampSheetPage(page,pageCount){return Math.max(0,Math.min(Number.isInteger(page)?page:0,Math.max(0,pageCount-1)));}
  function validateLabelLayout(inputs,layout){
    if(inputs.labelTemplate==='info-portrait'&&(Number(inputs.labelHeight)<35||Number(inputs.labelWidth)<25)) throw new Error('Die Hochkant-Infokarte benötigt mehr Höhe oder Breite.');
    if(inputs.labelTemplate==='info-landscape'&&(Number(inputs.labelWidth)<45||Number(inputs.labelHeight)<25)) throw new Error('Die Querformat-Infokarte benötigt mehr Höhe oder Breite.');
    if(inputs.labelTemplate!=='code-only'&&Number(inputs.labelHeight)<18) throw new Error('Text passt nicht sinnvoll in das gewählte Layout.');
    if(inputs.labelTemplate==='code-only') return {...layout,warning:''};
    const fontFactor={small:1.25,normal:1,large:.75}[inputs.labelTextSize]||1;
    const info=inputs.labelTemplate.startsWith('info-'),visible=[info?inputs.labelTitle:'',inputs.printText?`${inputs.valueLabel} ${inputs.longestValue||''}`:'',info?inputs.labelInfo1:'',info?inputs.labelInfo2:''].join('').length;
    const layoutFactor=inputs.labelTemplate==='info-landscape'?.32:inputs.labelTemplate==='info-portrait'?.42:.32;
    const capacity=Number(inputs.labelWidth)*Number(inputs.labelHeight)*layoutFactor*fontFactor/10;
    const error='Die sichtbaren Texte sind für dieses Etikett wahrscheinlich zu lang. Bitte Etikett vergrößern, kleinere Schrift wählen oder Text kürzen.';
    if(visible>capacity*1.35) throw new Error(error);
    return {...layout,warning:visible>capacity?'Die sichtbaren Texte könnten knapp werden. Bitte Vorschau und Testdruck prüfen.':''};
  }
  const OUTPUT_PROFILE_DEFAULT={type:'a4-sheet',orientation:'portrait',pageMargin:10,gapX:3,gapY:3,skipSlots:0};
  const LABEL_REQUIRED_FIELDS=['id','codeValue','title','valueLabel','visibleValue','info1','info2'];
  function createIndividualLabel(overrides={}){
    const id=overrides.id||`label-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    return {id,codeValue:'',title:'',valueLabel:'',visibleValue:'',info1:'',info2:'',notes:'',enabled:true,...overrides,id};
  }
  function validateLabel(label,context='Etikett'){
    if(!isPlainObject(label))throw new Error(`${context} ist ungültig.`);
    LABEL_REQUIRED_FIELDS.forEach(key=>{if(typeof label[key]!=='string'||(key==='id'&&!label[key]))throw new Error(`${context}: „${key}“ fehlt oder ist ungültig.`);});
    if(label.notes!==undefined&&typeof label.notes!=='string')throw new Error(`${context}: Notiz ist ungültig.`);
    if(label.enabled!==undefined&&typeof label.enabled!=='boolean')throw new Error(`${context}: Aktivstatus ist ungültig.`);
    return true;
  }
  function duplicateLabel(labels,id){const source=labels.find(label=>label.id===id);if(!source)throw new Error('Etikett wurde nicht gefunden.');const ids=new Set(labels.map(label=>label.id));let copyId;do{copyId=`label-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;}while(ids.has(copyId));const index=labels.indexOf(source);return [...labels.slice(0,index+1),createIndividualLabel({...source,id:copyId,title:source.title?`${source.title} (Kopie)`:''}),...labels.slice(index+1)];}
  function moveLabel(labels,id,direction){const copy=[...labels],index=copy.findIndex(label=>label.id===id),next=index+direction;if(index<0||next<0||next>=copy.length)return copy;[copy[index],copy[next]]=[copy[next],copy[index]];return copy;}
  function enabledLabels(labels){return labels.filter(label=>label.enabled!==false&&label.codeValue.trim());}
  function buildBambuExample(){return [
    ['Station 1','Bambu Lab A1','unten links','AMS Lite','350 W'],['Station 2','Bambu Lab A1','unten rechts','AMS Lite','350 W'],['Station 3','Bambu Lab A1','oben links','AMS Lite','350 W'],['Station 4','Bambu Lab A1','oben rechts','AMS Lite','350 W'],['Station 5','Bambu Lab X1C','oben rechts','AMS','1000 W']
  ].map((row,index)=>{const [title,device,location,system,power]=row;return createIndividualLabel({id:`label-${index+1}`,title,valueLabel:'Gerät',visibleValue:device,info1:`${location} · ${system}`,info2:power,codeValue:`Station: ${index+1}\nGerät: ${device}\nStandort: ${location}\nSystem: ${system}\nLeistung: ${power}`});});}
  function buildMiniPriceContent({articleId='',price='',material='',duration=''}){return [articleId,price,material,duration].map(value=>String(value).trim()).filter(Boolean).join(' | ');}
  function createMiniTestSheet(value){return [10,12,15,20].flatMap(size=>Array.from({length:4},()=>({size,width:size,height:size,value:String(value)})));}
  function paginateWithSkippedSlots(items,layout,skipSlots=0){
    const skip=Number(skipSlots);if(!Number.isInteger(skip)||skip<0||skip>=layout.perPage)throw new Error(`Die Startposition muss zwischen 0 und ${layout.perPage-1} liegen.`);
    const firstCapacity=layout.perPage-skip,pages=[];if(items.length||skip)pages.push([...Array(skip).fill(null),...items.slice(0,firstCapacity)]);for(let offset=firstCapacity;offset<items.length;offset+=layout.perPage)pages.push(items.slice(offset,offset+layout.perPage));return pages.length?pages:[[]];
  }
  function codeShare(distribution){return { 'code-large':.62,balanced:.48,'text-more':.36}[distribution]||.48;}
  function calculateTextFit({scrollWidth,clientWidth,scrollHeight,clientHeight,fontSize=9,minFontSize=6,behavior='auto'}){
    const overflow=scrollWidth>clientWidth+.5||scrollHeight>clientHeight+.5;if(!overflow)return {fits:true,fontSize};
    if(behavior!=='auto')return {fits:false,fontSize};
    const ratio=Math.min(clientWidth/Math.max(scrollWidth,1),clientHeight/Math.max(scrollHeight,1));const fitted=Math.max(minFontSize,Math.floor(fontSize*ratio*10)/10);return {fits:fitted>minFontSize||ratio*fontSize>=minFontSize,fontSize:fitted};
  }
  function labelToModel(label,inputs,codeMarkup=''){return createLabelModel(label.codeValue,{...inputs,labelTitle:label.title,valueLabel:label.valueLabel,labelInfo1:label.info1,labelInfo2:label.info2},codeMarkup,label.visibleValue);}
  function migrateProject(project){
    if(!isPlainObject(project)||project.schema!==PROJECT_SCHEMA) throw new Error('Diese Datei ist kein gültiges DataMatrix-Werkstatt-Projekt.');
    if(![1,2,3].includes(project.schemaVersion))throw new Error('Diese Projektversion wird nicht unterstützt.');
    const legacyKeys=['singleValue','copyValue','copyCount','seriesPrefix','seriesSuffix','seriesStart','seriesCount','seriesStep','seriesPad','manualList','foregroundText','backgroundText','size','padding','showText','transparent','autoUpdate','orientation','labelWidth','labelHeight','pageMargin','gapX','gapY','printText','cutLines'];
    const migrateInputs=(inputs,legacy=false)=>{if(!isPlainObject(inputs))throw new Error('Die Projektdatei enthält keine gültigen Eingaben.');if(legacy)for(const key of legacyKeys)if(!Object.hasOwn(inputs,key))throw new Error(`Die Projektdatei: Der erforderliche Eingabewert „${key}“ fehlt.`);return {...DEFAULT_INPUTS,...inputs};};
    if(project.versions!==undefined&&!Array.isArray(project.versions))throw new Error('Der Versionsverlauf ist ungültig.');
    const migratePart=part=>{const inputs=migrateInputs(part.inputs,project.schemaVersion===1);return {...part,inputs,labels:Array.isArray(part.labels)?part.labels.map(createIndividualLabel):[],outputProfile:{...OUTPUT_PROFILE_DEFAULT,orientation:inputs.orientation,pageMargin:Number(inputs.pageMargin),gapX:Number(inputs.gapX),gapY:Number(inputs.gapY),skipSlots:Number(inputs.skipSlots||0),...(part.outputProfile||{})}};};
    const migrated=migratePart(project);return {...migrated,schemaVersion:3,versions:(project.versions||[]).map(migratePart)};
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
  function validateOutputProfile(profile){if(!isPlainObject(profile)||profile.type!=='a4-sheet')throw new Error('Das Ausgabeprofil ist ungültig.');for(const key of ['orientation','pageMargin','gapX','gapY','skipSlots'])if(!Object.hasOwn(profile,key))throw new Error(`Ausgabeprofil: „${key}“ fehlt.`);return true;}
  function validateVersion(version,index){
    const label=`Version ${index+1}`;
    if(!isPlainObject(version)) throw new Error(`${label} ist kein gültiges Versionsobjekt.`);
    if(!Number.isInteger(version.number)||version.number<1) throw new Error(`${label} besitzt keine gültige Versionsnummer.`);
    if(typeof version.savedAt!=='string') throw new Error(`${label} besitzt keinen gültigen Speicherzeitpunkt.`);
    if(!Object.hasOwn(TYPES,version.type)) throw new Error(`${label} enthält eine unbekannte Inhaltsart.`);
    if(!Object.hasOwn(MODE_LABELS,version.mode)) throw new Error(`${label} enthält einen unbekannten Arbeitsmodus.`);
    validateInputs(version.inputs,label);if(!Array.isArray(version.labels))throw new Error(`${label}: Etikettenliste ist ungültig.`);version.labels.forEach((item,i)=>validateLabel(item,`${label}, Etikett ${i+1}`));validateOutputProfile(version.outputProfile);
    return true;
  }
  function validateProject(project){
    project=migrateProject(project);
    if(!isPlainObject(project)) throw new Error('Die Projektdatei enthält kein gültiges Projektobjekt.');
    if(project.schema!==PROJECT_SCHEMA||project.schemaVersion!==PROJECT_VERSION) throw new Error('Diese Datei ist kein gültiges DataMatrix-Werkstatt-Projekt.');
    if(!Object.hasOwn(TYPES,project.type)) throw new Error('Die Projektdatei enthält eine unbekannte Inhaltsart.');
    if(!Object.hasOwn(MODE_LABELS,project.mode)) throw new Error('Die Projektdatei enthält einen unbekannten Arbeitsmodus.');
    validateInputs(project.inputs,'Die Projektdatei');if(!Array.isArray(project.labels))throw new Error('Die Etikettenliste ist ungültig.');project.labels.forEach((label,index)=>validateLabel(label,`Etikett ${index+1}`));validateOutputProfile(project.outputProfile);
    if(project.versions!==undefined&&(!Array.isArray(project.versions)||project.versions.length>MAX_VERSIONS)) throw new Error(`Der Versionsverlauf darf höchstens ${MAX_VERSIONS} Einträge enthalten.`);
    (project.versions||[]).forEach(validateVersion);
    return true;
  }
  const DEFAULT_INPUTS={singleValue:'WS-DM-0001',copyValue:'WS-DM-0001',copyCount:'12',seriesPrefix:'INV-',seriesSuffix:'',seriesStart:'1',seriesCount:'10',seriesStep:'1',seriesPad:'4',manualList:'INV-0042\n\nBT-CNC-014',foregroundText:'#102033',backgroundText:'#ffffff',size:'320',padding:'3',showText:true,transparent:false,autoUpdate:true,orientation:'portrait',labelWidth:'45',labelHeight:'45',pageMargin:'10',gapX:'3',gapY:'3',printText:true,cutLines:false,labelTemplate:'code-text',labelBorder:'fine',labelCorners:'square',labelTextSize:'normal',labelTextAlign:'left',labelTitle:'Inventar',valueLabel:'Inventar-Nr.',labelInfo1:'Standort: Halle 2',labelInfo2:'Bereich: Werkzeugbau',borderUseCodeColor:false,autoFitText:true,textBehavior:'auto',spaceDistribution:'balanced',skipSlots:'0',miniArticleId:'WS-ART-0042',miniPrice:'12,50 EUR',miniMaterial:'PLA',miniDuration:'5,5 h',miniSize:'12'};
  const api={generateSeries,parseManualList,sanitizeFilename,calculateA4Layout,calculateIntegerScale,buildBwipOptions,normalizeLabelCodeSvg,createLabelModel,createLabelMarkup,paginateLabels,paginateWithSkippedSlots,clampSheetPage,validateLabelLayout,createIndividualLabel,validateLabel,duplicateLabel,moveLabel,enabledLabels,buildBambuExample,buildMiniPriceContent,createMiniTestSheet,calculateTextFit,codeShare,labelToModel,migrateProject,validateInputs,validateVersion,validateProject,validateOutputProfile,DEFAULT_INPUTS,OUTPUT_PROFILE_DEFAULT,LABEL_REQUIRED_FIELDS,MAX_VERSIONS,PROJECT_SCHEMA,PROJECT_VERSION,LOCAL_DRAFT_KEY};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(typeof document==='undefined') return;
  const $=id=>document.getElementById(id); let state={type:'internal',mode:'single',values:['WS-DM-0001'],labels:[],selectedLabelId:null,index:0,page:0,versions:[]}; let lastFocus,draftTimer;
  const fields=Object.keys(DEFAULT_INPUTS);
  function message(text,tone=''){const el=$('validation');el.textContent=text;el.className=`validation ${tone}`;}
  function readValues(){
    let values;
    if(state.mode==='single') values=[$('singleValue').value.trim()];
    if(state.mode==='copies'){const n=Number($('copyCount').value);if(!Number.isInteger(n)||n<1||n>MAX_CODES)throw new Error('Die Kopienzahl muss zwischen 1 und 500 liegen.');values=Array(n).fill($('copyValue').value.trim());}
    if(state.mode==='series') values=generateSeries($('seriesPrefix').value, $('seriesStart').value,$('seriesCount').value,$('seriesStep').value,$('seriesPad').value,$('seriesSuffix').value);
    if(state.mode==='manual'){values=parseManualList($('manualList').value);if(values.length>MAX_CODES)throw new Error('Die Liste enthält mehr als 500 Werte. Bitte aufteilen.');}
    if(state.mode==='labels'){const active=enabledLabels(state.labels);values=active.map(label=>label.codeValue);if(values.length>MAX_CODES)throw new Error('Die Liste enthält mehr als 500 Etiketten.');}
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
  function updateModeUi(){
    const navigable=state.mode==='series'||state.mode==='manual'||state.mode==='labels',count=state.values.length;
    $('codeNavigation').hidden=!navigable;$('navigationHint').hidden=!navigable;$('copiesPreviewSummary').hidden=state.mode!=='copies';
    $('position').textContent=`Code ${state.index+1} von ${count}`;$('prevCode').disabled=state.index===0;$('nextCode').disabled=state.index===count-1;
    if(navigable)$('navigationHint').textContent=state.mode==='series'?'Hier wechselst du zwischen den erzeugten Seriencodes. PNG und SVG exportieren jeweils den aktuell sichtbaren Code.':'Hier wechselst du zwischen den Einträgen deiner Liste. PNG und SVG exportieren jeweils den aktuell sichtbaren Code.';
    if(state.mode==='copies'){$('copiesPreviewSummary').textContent=`${count} gleiche Etiketten`;$('copiesSummary').textContent=`${count} gleiche Etiketten entstehen.`;}
    const quantity={single:`1 Etikett`,copies:`${count} gleiche Etiketten`,series:`${count} fortlaufende Etiketten`,manual:`${count} unterschiedliche Etiketten`,labels:`${count} individuelle Etiketten`}[state.mode];
    $('printQuantitySummary').textContent=`Druckmenge: ${quantity} · Quelle: ${MODE_LABELS[state.mode]}`;$('copiesShortcut').hidden=state.mode!=='single';
  }
  function setPrintAvailability(available){$('printSheet').disabled=!available;$('printSheetA4').disabled=!available;}
  function render({save=true}={}){
    try{readValues();if(!root.bwipjs)throw new Error('Die Data-Matrix-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und neu laden.');const value=state.values[state.index];drawExactCanvas(value);$('previewStage').classList.remove('invalid');$('previewText').textContent=$('showText').checked?value:'';$('metaType').textContent=TYPES[state.type][0];$('metaChars').textContent=value.length;$('metaCount').textContent=state.values.length;$('metaValue').textContent=value;updateModeUi();updateSheet();if(save)saveDraft();return true;}
    catch(error){clearPreview();setPrintAvailability(false);message(error.message||'Data Matrix konnte nicht erzeugt werden.','error');return false;}
  }
  function currentInputs(){return Object.fromEntries(fields.map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value]));}
  function sheetCss(l){const i=currentInputs(),background=i.transparent?'transparent':i.backgroundText;return `--page-w:${l.pageWidth};--page-h:${l.pageHeight};--margin:${i.pageMargin};--label-w:${i.labelWidth};--label-h:${i.labelHeight};--gap-x:${i.gapX};--gap-y:${i.gapY};--columns:${l.columns};--rows:${l.rows};--code-color:${i.foregroundText};--code-bg:${background}`;}
  function renderSheetPage(l){
    const inputs=currentInputs(),items=state.mode==='labels'?enabledLabels(state.labels):state.values,pages=paginateWithSkippedSlots(items,l,Number(inputs.skipSlots));
    state.page=clampSheetPage(state.page,pages.length);const labels=pages[state.page]||[];$('a4Page').setAttribute('style',sheetCss(l));
    $('a4Page').innerHTML=`<div class="a4-grid">${labels.map(item=>item===null?'<div class="used-slot">bereits verwendet</div>':createLabelMarkup(state.mode==='labels'?labelToModel(item,inputs,svg(item.codeValue)):createLabelModel(item,inputs,svg(item)),{cutLines:inputs.cutLines})).join('')}</div>`;
    const count=Math.max(1,pages.length);$('sheetPosition').textContent=`Seite ${state.page+1} von ${count}`;$('prevSheet').disabled=state.page===0;$('nextSheet').disabled=state.page>=count-1;measureTextOverflow();
  }
  function updateSheet(){try{const inputs={...currentInputs(),longestValue:state.values.reduce((longest,value)=>value.length>longest.length?value:longest,'')},l=validateLabelLayout(inputs,calculateA4Layout({orientation:inputs.orientation,labelWidth:inputs.labelWidth,labelHeight:inputs.labelHeight,margin:inputs.pageMargin,gapX:inputs.gapX,gapY:inputs.gapY}));const pages=paginateWithSkippedSlots(state.values,l,Number(inputs.skipSlots)).length;$('sheetStats').textContent=`${l.columns} Spalten · ${l.rows} Reihen · ${l.perPage} pro Seite · ${state.values.length} Codes · ${pages} Seite(n)`;if(root.bwipjs)renderSheetPage(l);$('sheetValidation').textContent=l.warning||'Layout ist druckbereit.';$('sheetValidation').className=`validation${l.warning?' warn':''}`;setPrintAvailability(true);return l;}catch(e){$('sheetStats').textContent=e.message;$('sheetValidation').textContent=e.message;$('sheetValidation').className='validation error';setPrintAvailability(false);$('a4Page').innerHTML='';return null;}}
  function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function fileBase(){return `datamatrix-${sanitizeFilename(state.values[state.index])}`;}
  function png(){if(!render())return;$('dmCanvas').toBlob(blob=>{if(!blob)return message('PNG-Export fehlgeschlagen.','error');download(blob,`${fileBase()}.png`);message('PNG gespeichert. Bitte mit dem später verwendeten Scanner und in echter Druckgröße testen.');},'image/png');}
  function svg(value=state.values[state.index]){if(!root.bwipjs)throw new Error();return root.bwipjs.toSVG(options(value));}
  function svgDownload(){if(!render())return;try{download(new Blob([svg()],{type:'image/svg+xml'}),`${fileBase()}.svg`);message('SVG gespeichert. Bitte mit dem später verwendeten Scanner und in echter Druckgröße testen.');}catch{message('SVG-Export fehlgeschlagen.','error');}}
  function printSheet(){if(!render())return;try{const l=updateSheet();if(!l)throw new Error('Druckbogen passt nicht auf A4.');const inputs=currentInputs(),items=state.mode==='labels'?enabledLabels(state.labels):state.values,pages=paginateWithSkippedSlots(items,l,Number(inputs.skipSlots));const labels=page=>page.map(item=>item===null?'<div class="used-slot">bereits verwendet</div>':createLabelMarkup(state.mode==='labels'?labelToModel(item,inputs,svg(item.codeValue)):createLabelModel(item,inputs,svg(item)),{cutLines:inputs.cutLines})).join('');const sheets=pages.map(page=>`<main class="print-page" style="${sheetCss(l)}">${labels(page)}</main>`).join('');if(!sheets.includes('label-code-svg'))throw new Error('Drucken ist ohne gültige Data-Matrix-Codegrafik nicht möglich.');const w=root.open('','_blank');if(!w)throw new Error('Druckfenster wurde blockiert.');w.document.write(`<!doctype html><html><head><title>Data-Matrix-Druckbogen</title><style>@page{size:A4 ${inputs.orientation};margin:0}*{box-sizing:border-box}body{margin:0}.print-page{width:calc(var(--page-w)*1mm);height:calc(var(--page-h)*1mm);padding:calc(var(--margin)*1mm);display:grid;grid-template-columns:repeat(var(--columns),calc(var(--label-w)*1mm));grid-template-rows:repeat(var(--rows),calc(var(--label-h)*1mm));gap:calc(var(--gap-y)*1mm) calc(var(--gap-x)*1mm);break-after:page;page-break-after:always;background:#fff}.print-page:last-child{break-after:auto;page-break-after:auto}.used-slot{display:block}.sheet-label{position:relative;overflow:hidden;padding:1.5mm;display:grid;align-items:stretch;justify-items:stretch;background:var(--code-bg)}.label-code{min-width:0;min-height:0;display:grid;place-items:center;overflow:hidden}.label-code-svg{display:block;width:100%!important;height:100%!important;max-width:100%;max-height:100%;aspect-ratio:1}.label-info{min-width:0;max-width:100%;display:flex;flex-direction:column;gap:.6mm;overflow-wrap:anywhere}.layout-code-only{grid-template: minmax(0,1fr)/minmax(0,1fr)}.layout-code-text{grid-template-rows:minmax(0,1fr) auto}.layout-info-portrait{grid-template-rows:auto minmax(8mm,1fr) auto}.layout-info-landscape{grid-template-columns:minmax(0,var(--code-share,48%)) minmax(0,1fr);gap:1.5mm}.layout-code-only .label-code{width:100%;height:100%}.layout-info-landscape .label-code{width:100%;height:100%}.border-fine{box-shadow:inset 0 0 0 .25mm var(--label-border)}.border-strong{box-shadow:inset 0 0 0 .6mm var(--label-border)}.corners-rounded{border-radius:2mm}.cut-lines{outline:.2mm dashed #777;outline-offset:-.2mm}.text-small{font:7pt system-ui}.text-normal{font:9pt system-ui}.text-large{font:11pt system-ui}.distribution-code-large{--code-share:62%}.distribution-balanced{--code-share:48%}.distribution-text-more{--code-share:36%}.label-title,.label-value,.label-info>span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:visible;overflow-wrap:anywhere}.align-center{text-align:center}@media print{body{print-color-adjust:exact}}</style></head><body>${sheets}<script>onload=()=>setTimeout(()=>{let bad=false;document.querySelectorAll('.sheet-label').forEach(l=>{let s=parseFloat(getComputedStyle(l).fontSize)||9;const a=[...l.querySelectorAll('.label-title,.label-value,.label-info>span,.label-info')];while(a.some(e=>e.scrollWidth>e.clientWidth+.5||e.scrollHeight>e.clientHeight+.5)&&s>6){s=Math.max(6,s-.5);l.style.fontSize=s+'px'}if(a.some(e=>e.scrollWidth>e.clientWidth+.5||e.scrollHeight>e.clientHeight+.5))bad=true});if(bad){document.body.insertAdjacentHTML('afterbegin','<p style=\"color:#b42318;font:14px system-ui\">Druck blockiert: Sichtbarer Text passt nicht in mindestens ein Etikett.</p>');return}print()},100)<\/script></body></html>`);w.document.close();message('Druckdialog vorbereitet. Bitte echte Druckgröße und Scanner testen.');}catch(e){message(e.message||'Drucken fehlgeschlagen.','error');}}
  function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML;}
  function currentOutputProfile(){const i=currentInputs();return {type:'a4-sheet',orientation:i.orientation,pageMargin:Number(i.pageMargin),gapX:Number(i.gapX),gapY:Number(i.gapY),skipSlots:Number(i.skipSlots)};}
  function snapshot(){return {schema:PROJECT_SCHEMA,schemaVersion:PROJECT_VERSION,tool:'DataMatrix-Werkstatt Plus',savedAt:new Date().toISOString(),type:state.type,mode:state.mode,labels:state.labels,selectedLabelId:state.selectedLabelId,outputProfile:currentOutputProfile(),inputs:Object.fromEntries(fields.filter(id=>$(id)).map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value])),versions:state.versions};}
  function saveDraft(){try{localStorage.setItem(LOCAL_DRAFT_KEY,JSON.stringify(snapshot()));}catch{/* Speicher kann deaktiviert sein. */}}
  function saveDraftSoon(){const validDraft=JSON.stringify(snapshot());clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{localStorage.setItem(LOCAL_DRAFT_KEY,validDraft);}catch{/* Speicher kann deaktiviert sein. */}},250);}
  function persistWithoutRender(){try{readValues();updateSheet();saveDraftSoon();return true;}catch(error){message(error.message||'Die Eingaben sind ungültig.','error');return false;}}
  function handleCurrentInput(){if($('autoUpdate').checked)return render();return persistWithoutRender();}
  function applyProject(p){p=migrateProject(p);validateProject(p);const previous=snapshot(),nextInputs={...p.inputs};try{state.type=p.type;state.mode=p.mode;state.versions=p.versions?[...p.versions]:[];state.labels=p.labels.map(createIndividualLabel);state.selectedLabelId=p.selectedLabelId||state.labels[0]?.id||null;Object.entries(nextInputs).forEach(([id,v])=>{if($(id))$(id).type==='checkbox'?$(id).checked=Boolean(v):$(id).value=String(v);});syncSelectors();if(!render())throw new Error('Die Projektdatei enthält fachlich ungültige Eingaben.');}catch(error){state.type=previous.type;state.mode=previous.mode;state.versions=previous.versions;Object.entries(previous.inputs).forEach(([id,v])=>{$(id).type==='checkbox'?$(id).checked=v:$(id).value=v;});syncSelectors();render();throw error;}}
  function saveProject(){if(!render())return;download(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),`datamatrix-projekt-${new Date().toISOString().slice(0,10)}.json`);message('Projektdatei gespeichert.');}
  function loadProject(file){if(!file)return;if(file.size>2_000_000)return message('Projektdatei ist größer als 2 MB.','error');const reader=new FileReader();reader.onerror=()=>message('Projektdatei konnte nicht gelesen werden.','error');reader.onload=()=>{try{applyProject(JSON.parse(reader.result));message('Projekt geladen.');}catch(e){message(e.message||'Ungültige Projektdatei.','error');}};reader.readAsText(file);}
  function saveVersion(){if(!render())return;if(state.versions.length>=MAX_VERSIONS)return message(`Es können höchstens ${MAX_VERSIONS} lokale Versionen gespeichert werden. Bitte das Projekt exportieren oder den lokalen Arbeitsstand zurücksetzen.`,'warn');const number=state.versions.reduce((highest,version)=>Math.max(highest,version.number),0)+1;state.versions.push({number,savedAt:new Date().toISOString(),type:state.type,mode:state.mode,labels:state.labels.map(label=>({...label})),outputProfile:currentOutputProfile(),inputs:snapshot().inputs});saveDraft();message(`Version ${number} lokal gespeichert.`);}
  function resetToDefaults(){state={type:'internal',mode:'single',values:['WS-DM-0001'],labels:[],selectedLabelId:null,index:0,page:0,versions:[]};Object.entries(DEFAULT_INPUTS).forEach(([id,value])=>{$(id).type==='checkbox'?$(id).checked=value:$(id).value=value;});$('foreground').value='#102033';$('background').value='#ffffff';syncSelectors();render({save:false});}
  function clearLocalDraft(){const warning='Lokalen DataMatrix-Arbeitsstand wirklich löschen?\n\nAlle lokal gespeicherten Eingaben und Versionen werden entfernt.\nDiese Aktion kann nicht rückgängig gemacht werden.';if(!root.confirm(warning))return;clearTimeout(draftTimer);localStorage.removeItem(LOCAL_DRAFT_KEY);resetToDefaults();message('Lokaler DataMatrix-Arbeitsstand wurde vollständig gelöscht.');}
  function syncSelectors(){document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b.dataset.type===state.type));document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===state.mode));const t=TYPES[state.type];$('singleLabel').textContent=t[1];$('singleExample').textContent=`Beispiel: ${t[2]}`;$('typeHint').textContent=t[3];$('selectionSummary').textContent=`${t[0]} · ${MODE_LABELS[state.mode]}`;renderLabelsEditor();}
  const editorFields={editLabelTitle:'title',editCodeValue:'codeValue',editValueLabel:'valueLabel',editVisibleValue:'visibleValue',editInfo1:'info1',editInfo2:'info2',editNotes:'notes',editEnabled:'enabled'};
  function selectedLabel(){return state.labels.find(label=>label.id===state.selectedLabelId);}
  function renderLabelsEditor(){
    const list=$('labelsList');if(!list)return;list.innerHTML=state.labels.map((label,index)=>`<article class="label-list-item${label.id===state.selectedLabelId?' selected':''}"><button type="button" class="label-select" data-label-action="edit" data-label-id="${escapeMarkup(label.id)}"><strong>${index+1}. ${escapeMarkup(label.title||'Ohne Überschrift')}</strong><small>${escapeMarkup(label.codeValue.slice(0,70)||'Noch kein Code-Inhalt')}</small><span>${label.enabled===false?'Nicht aktiv':'Aktiv'}</span></button><div><button type="button" data-label-action="duplicate" data-label-id="${escapeMarkup(label.id)}">Duplizieren</button><button type="button" data-label-action="up" data-label-id="${escapeMarkup(label.id)}" aria-label="Nach oben">↑</button><button type="button" data-label-action="down" data-label-id="${escapeMarkup(label.id)}" aria-label="Nach unten">↓</button><button type="button" data-label-action="remove" data-label-id="${escapeMarkup(label.id)}">Entfernen</button></div></article>`).join('')||'<p class="hint">Noch keine individuellen Etiketten angelegt.</p>';
    const label=selectedLabel();$('labelEditor').disabled=!label;for(const [id,key] of Object.entries(editorFields)){const element=$(id);if(!element)continue;element.type==='checkbox'?element.checked=label?.[key]!==false:element.value=label?.[key]||'';}
  }
  function addLabel(label=createIndividualLabel({title:`Etikett ${state.labels.length+1}`})){state.labels.push(label);state.selectedLabelId=label.id;renderLabelsEditor();handleCurrentInput();}
  function updateSelectedLabel(event){const label=selectedLabel();if(!label)return;const key=editorFields[event.target.id];if(!key)return;label[key]=event.target.type==='checkbox'?event.target.checked:event.target.value;renderLabelsEditor();handleCurrentInput();}
  function handleLabelList(event){const button=event.target.closest('[data-label-action]');if(!button)return;const {labelAction:action,labelId:id}=button.dataset;if(action==='edit')state.selectedLabelId=id;if(action==='duplicate'){state.labels=duplicateLabel(state.labels,id);state.selectedLabelId=state.labels[state.labels.findIndex(label=>label.id===id)+1].id;}if(action==='up')state.labels=moveLabel(state.labels,id,-1);if(action==='down')state.labels=moveLabel(state.labels,id,1);if(action==='remove'){state.labels=state.labels.filter(label=>label.id!==id);state.selectedLabelId=state.labels[0]?.id||null;}renderLabelsEditor();if(action!=='edit')handleCurrentInput();}
  function measureTextOverflow(){
    let failure=null;document.querySelectorAll('#a4Page .sheet-label').forEach(label=>{const areas=[...label.querySelectorAll('.label-title,.label-value,.label-info>span,.label-info')];let size=Number.parseFloat(getComputedStyle(label).fontSize)||9;const behavior=$('autoFitText').checked&&$('textBehavior').value==='auto'?'auto':$('textBehavior').value;while(areas.some(area=>area.scrollWidth>area.clientWidth+.5||area.scrollHeight>area.clientHeight+.5)&&behavior==='auto'&&size>6){size=Math.max(6,size-.5);label.style.fontSize=`${size}px`;label.dataset.fittedFontSize=String(size);}if(areas.some(area=>area.scrollWidth>area.clientWidth+.5||area.scrollHeight>area.clientHeight+.5))failure=label.querySelector('.label-title')?.textContent||'Etikett';});
    if(failure)throw new Error(`Der sichtbare Text von „${failure}“ passt nicht in das gewählte Etikett. Bitte Text kürzen, Etikett vergrößern oder eine andere Vorlage wählen.`);return true;
  }
  function applyMiniPreset(){if(!['single','copies','labels'].includes(state.mode))return message('Mini-Preiscode ist in diesem Arbeitsmodus nicht verfügbar.','warn');const value=buildMiniPriceContent({articleId:$('miniArticleId').value,price:$('miniPrice').value,material:$('miniMaterial').value,duration:$('miniDuration').value});$('labelTemplate').value='code-only';$('printText').checked=false;$('labelBorder').value='none';$('labelCorners').value='square';$('autoFitText').checked=false;$('labelWidth').value=$('miniSize').value||'12';$('labelHeight').value=$('miniSize').value||'12';$('pageMargin').value='5';$('gapX').value='2';$('gapY').value='2';$('foregroundText').value='#102033';$('backgroundText').value='#ffffff';$('padding').value='3';if(state.mode==='single')$('singleValue').value=value;if(state.mode==='copies')$('copyValue').value=value;if(state.mode==='labels'){const label=selectedLabel();if(label)label.codeValue=value;else addLabel(createIndividualLabel({title:'Mini-Preiscode',codeValue:value}));renderLabelsEditor();}render();message('Mini-Preiscode als Startvorlage eingesetzt. Bitte in echter Größe testscannen.','warn');}
  function printMiniTestSheet(){const value=buildMiniPriceContent({articleId:$('miniArticleId').value,price:$('miniPrice').value,material:$('miniMaterial').value,duration:$('miniDuration').value});if(!value)return message('Bitte zuerst einen kurzen Testinhalt eingeben.','error');const items=createMiniTestSheet(value),w=root.open('','_blank');if(!w)return message('Druckfenster wurde blockiert.','error');const groups=[10,12,15,20].map(size=>`<section><h2>${size} × ${size} mm</h2><div>${items.filter(item=>item.size===size).map(item=>`<figure style="width:${size}mm"><div style="width:${size}mm;height:${size}mm">${svg(item.value)}</div><figcaption>${size} mm</figcaption></figure>`).join('')}</div></section>`).join('');w.document.write(`<!doctype html><title>Mini-Code-Testbogen</title><style>@page{size:A4 portrait;margin:10mm}body{font:10pt system-ui}section>div{display:flex;gap:8mm;margin-bottom:8mm}figure{margin:0}svg{width:100%;height:100%}figcaption{text-align:center;margin-top:2mm}</style><h1>Mini-Code-Testbogen</h1><p>Auf normalem Papier und anschließend auf Klebepapier mit dem späteren Scanner testen.</p>${groups}<script>onload=()=>print()<\/script>`);w.document.close();}
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
    $('refresh').onclick=render;$('prevCode').onclick=()=>{state.index--;render();};$('nextCode').onclick=()=>{state.index++;render();};$('downloadPng').onclick=png;$('downloadSvg').onclick=svgDownload;$('copyContent').onclick=async()=>{if(!render())return;try{await navigator.clipboard.writeText(state.values[state.index]);message('Inhalt kopiert.');}catch{message('Zwischenablage ist nicht verfügbar.','error');}};$('printSheet').onclick=printSheet;$('printSheetA4').onclick=printSheet;$('setupCopies').onclick=()=>{state.mode='copies';state.index=0;syncSelectors();render();$('copyCount').focus();$('copyCount').scrollIntoView({behavior:'smooth',block:'center'});};$('prevSheet').onclick=()=>{state.page--;updateSheet();};$('nextSheet').onclick=()=>{state.page++;updateSheet();};
    $('newLabel').onclick=()=>addLabel(createIndividualLabel({title:`Etikett ${state.labels.length+1}`}));$('selectAllLabels').onclick=()=>{state.labels.forEach(label=>label.enabled=true);renderLabelsEditor();handleCurrentInput();};$('deselectAllLabels').onclick=()=>{state.labels.forEach(label=>label.enabled=false);renderLabelsEditor();handleCurrentInput();};$('clearLabels').onclick=()=>{if(state.labels.length&&!root.confirm('Alle individuellen Etiketten wirklich löschen?'))return;state.labels=[];state.selectedLabelId=null;renderLabelsEditor();handleCurrentInput();};$('insertBambuExample').onclick=()=>{if(state.labels.length&&!root.confirm('Bestehende individuelle Etiketten durch die frei änderbaren Beispieldaten ersetzen?'))return;state.labels=buildBambuExample();state.selectedLabelId=state.labels[0].id;renderLabelsEditor();handleCurrentInput();};$('labelsList').onclick=handleLabelList;Object.keys(editorFields).forEach(id=>$(id).addEventListener('input',updateSelectedLabel));$('applyMiniPreset').onclick=applyMiniPreset;$('createMiniTestSheet').onclick=printMiniTestSheet;
    $('projectFileInput').onchange=e=>{loadProject(e.target.files[0]);e.target.value='';};$('helpClose').onclick=closeHelp;$('helpDialog').addEventListener('close',()=>{unlockHelpScroll();lastFocus?.focus();});$('helpDialog').addEventListener('cancel',unlockHelpScroll);$('helpWindowOpen').onclick=helpWindow;$('toolMenuBtn').onclick=()=>root.WSToolMenu?.open();syncSelectors();configureMenu();render();
  });
})(typeof window!=='undefined'?window:globalThis);
