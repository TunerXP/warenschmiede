(() => {
  const HELP_URL = '/tools/ws_3d_print_kostenrechner_anleitung.html';
  const STORAGE_KEY = 'warenschmiede.costcalc.sidebarWidth.v1';
  const DEFAULT_WIDTH = 580;
  const MIN_WIDTH = 460;
  const ABSOLUTE_MAX_WIDTH = 760;
  const desktopMaximum = () => Math.max(MIN_WIDTH, Math.min(ABSOLUTE_MAX_WIDTH, Math.floor(window.innerWidth * .55)));
  const calculator = () => window.WSCostCalculatorInstance || null;
  const withCalculator = action => {
    const instance = calculator();
    if (instance) action(instance);
    else window.alert('Der Kostenrechner wird noch geladen. Bitte kurz erneut versuchen.');
  };
  const openHelpWindow = () => {
    const availableWidth = Number(screen.availWidth) || Number(window.outerWidth) || 1380;
    const availableHeight = Number(screen.availHeight) || Number(window.outerHeight) || 900;
    const availableLeft = Number.isFinite(Number(screen.availLeft)) ? Number(screen.availLeft) : (Number(window.screenX) || 0);
    const availableTop = Number.isFinite(Number(screen.availTop)) ? Number(screen.availTop) : (Number(window.screenY) || 0);
    const width = Math.min(1380, Math.max(760, availableWidth - 80), availableWidth);
    const height = Math.min(900, Math.max(640, availableHeight - 80), availableHeight);
    const left = Math.round(availableLeft + Math.max(0, (availableWidth - width) / 2));
    const top = Math.round(availableTop + Math.max(0, (availableHeight - height) / 2));
    const features = `popup=yes,resizable=yes,scrollbars=yes,width=${width},height=${height},left=${left},top=${top}`;
    const popup = window.open(HELP_URL, 'wsCostCalculatorHelp', features);
    if (!popup) window.alert('Die Anleitung konnte nicht geöffnet werden. Bitte erlauben Sie Pop-ups für diese Seite.');
    else popup.focus();
  };

  window.WSCostCalculatorActions = Object.freeze({
    remember: () => withCalculator(app => app.rememberHistory('Manuell gemerkt')),
    history: () => withCalculator(app => { app.historyOpen = true; }),
    check: () => withCalculator(app => app.openPreflight()),
    save: () => withCalculator(app => app.exportFile()),
    load: () => document.getElementById('costProjectFileInput')?.click(),
    settings: () => withCalculator(app => { app.settingsOpen = true; }),
    help: () => { window.location.href = HELP_URL; },
    openHelpWindow
  });

  const configureMenu = () => window.WSToolMenu?.configure({
    toolId: '3d-cost',
    side: 'left',
    sections: [
      { title: 'Projekt & Daten', items: [
        { label: 'Merken', description: 'Aktuellen Stand in der lokalen History merken.', action: window.WSCostCalculatorActions.remember },
        { label: 'History', description: 'Gespeicherte Arbeitsstände anzeigen.', action: window.WSCostCalculatorActions.history },
        { label: 'Projekt speichern', description: 'Bearbeitbare Projektdatei als JSON sichern.', action: window.WSCostCalculatorActions.save },
        { label: 'Projekt laden', description: 'Vorhandene JSON-Projektdatei öffnen.', action: window.WSCostCalculatorActions.load }
      ]},
      { title: 'Prüfen & Einstellungen', items: [
        { label: 'Dokument prüfen', description: 'Vor PDF und Druck auf typische Stolperstellen prüfen.', action: window.WSCostCalculatorActions.check },
        { label: 'Einstellungen', description: 'Firma, Design, Zahlung, Presets und Ausgabe verwalten.', action: window.WSCostCalculatorActions.settings }
      ]},
      { title: 'Hilfe', items: [
        { label: 'Hilfe & Anleitung', description: 'Die Anleitung in diesem Fenster öffnen.', action: window.WSCostCalculatorActions.help },
        { label: 'Anleitung in neuem Fenster', description: 'Die Anleitung separat und skalierbar öffnen.', action: window.WSCostCalculatorActions.openHelpWindow }
      ]},
      { title: 'Passende Werkzeuge', items: [
        { toolId: 'qr' },
        { label: 'Quittungs-Werkstatt', description: 'Quittungen direkt im Browser erstellen.', href: '/tools/ReceiptWriterPro.html' }
      ]},
      { title: '3D-Druck & Wissen', items: [
        { label: '3D-Druck Wissen', description: 'FAQ, Materialien, Fehlerhilfe und Drucktipps.', href: '/3d_druck/3ddruck-faq.html' },
        { label: 'Wartung & Reinigung', description: 'Drucker zuverlässig pflegen und reinigen.', href: '/3d_druck/wartung-reinigung.html' }
      ]},
      { title: 'Warenschmiede', items: [
        { label: 'Zur Tool-Übersicht', href: '/tools/' },
        { label: 'Zur Homepage', href: '/' },
        { label: 'Kontakt', href: '/kontakt/kontakt.html' },
        { label: 'Impressum', href: '/kontakt/impressum.html' },
        { label: 'Datenschutz', href: '/datenschutz.html' }
      ]}
    ]
  });

  const setupResizer = () => {
    const handle = document.getElementById('costResizer');
    if (!handle) return;
    let preferredWidth = DEFAULT_WIDTH;
    let appliedWidth = DEFAULT_WIDTH;
    const normalizePreferred = value => Math.round(Math.max(MIN_WIDTH, Math.min(ABSOLUTE_MAX_WIDTH, value)));
    const applyPreferredWidth = () => {
      appliedWidth = Math.max(MIN_WIDTH, Math.min(preferredWidth, desktopMaximum()));
      document.documentElement.style.setProperty('--cost-sidebar-width', appliedWidth + 'px');
      handle.setAttribute('aria-valuenow', String(appliedWidth));
      handle.setAttribute('aria-valuemax', String(desktopMaximum()));
    };
    const setPreferredWidth = value => {
      preferredWidth = normalizePreferred(value);
      applyPreferredWidth();
    };
    const persist = () => { try { localStorage.setItem(STORAGE_KEY, String(preferredWidth)); } catch (_) {} };
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      preferredWidth = Number.isFinite(saved) && saved >= MIN_WIDTH && saved <= ABSOLUTE_MAX_WIDTH ? normalizePreferred(saved) : DEFAULT_WIDTH;
      applyPreferredWidth();
    } catch (_) { preferredWidth = DEFAULT_WIDTH; applyPreferredWidth(); }
    handle.addEventListener('pointerdown', event => {
      if (window.innerWidth <= 1100) return;
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add('cost-resizing');
      const startX = event.clientX;
      const startWidth = appliedWidth;
      const move = moveEvent => setPreferredWidth(startWidth + moveEvent.clientX - startX);
      const cleanup = () => {
        document.body.classList.remove('cost-resizing');
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', cleanup);
        handle.removeEventListener('pointercancel', cleanup);
        handle.removeEventListener('lostpointercapture', cleanup);
        persist();
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', cleanup);
      handle.addEventListener('pointercancel', cleanup);
      handle.addEventListener('lostpointercapture', cleanup);
    });
    handle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      setPreferredWidth(appliedWidth + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 50 : 10));
      persist();
    });
    handle.addEventListener('dblclick', () => { setPreferredWidth(DEFAULT_WIDTH); persist(); });
    window.addEventListener('resize', applyPreferredWidth);
  };

  document.addEventListener('DOMContentLoaded', () => { configureMenu(); setupResizer(); });
})();

function app(){ return {
  appVersion:'1.9.4',
  settingsOpen:false, historyOpen:false, preflightOpen:false, historyNotice:'', historySearch:'', historyDateFilter:'all', historySort:'newest', activeTab:'firma', tabs:[{id:'firma',label:'Firma'},{id:'design',label:'Logo & Design'},{id:'zahlung',label:'Zahlung'},{id:'steuer',label:'Steuer'},{id:'presets',label:'Presets'},{id:'qr',label:'QR-Code'},{id:'ausgabe',label:'Ausgabe'},{id:'daten',label:'Daten'}],
  theme:{color:'#2563eb', textColor:'#ffffff'},
  company:{name:'',owner:'',slogan:'',street:'',zip:'',city:'',email:'',phone:'',logo:'',logoWidth:90,showName:true},
  customer:{name:'',address:'',id:'',contact:''},
  doc:{type:'angebot',number:'ANG-2026-001',date:new Date().toISOString().slice(0,10),project:'',validUntil:'',dueDate:''},
  payment:{bank:'',accountName:'',iban:'',bic:'',days:14,link:'',showOnOffer:false},
  tax:{enabled:false,rate:19,profile:'de_small',customText:'Gemäß Kleinunternehmerregelung wird keine Umsatzsteuer berechnet.\nDer Rechnungsbetrag ist ohne Abzug fällig.'},
  qr:{enabled:false,type:'url',value:'https://www.warenschmiede.com/',label:'Zur Website'},
  output:{compactPdf:false, compactForceArticle:false, showStorageInfo:true},
  presets:{materials:[],printers:[],profiles:[]}, jobs:[], extras:[{desc:'Versandpauschale',qty:1,price:4.90}], history:[],

  setupMiniHelp(){
    const pop=document.getElementById('calcHelpPop');
    if(!pop) return;
    const hide=()=>{ pop.style.display='none'; };
    document.addEventListener('click', e=>{
      const btn=e.target.closest('[data-help-title][data-help-text]');
      if(!btn){ if(!e.target.closest('.help-pop')) hide(); return; }
      e.preventDefault(); e.stopPropagation();
      pop.innerHTML='<strong>'+this.escapeHtml(btn.dataset.helpTitle||'Hinweis')+'</strong>'+this.escapeHtml(btn.dataset.helpText||'');
      pop.style.display='block';
      const r=btn.getBoundingClientRect();
      let left=r.left, top=r.bottom+10;
      pop.style.left=left+'px'; pop.style.top=top+'px';
      const pr=pop.getBoundingClientRect();
      if(pr.right>window.innerWidth-12) left=window.innerWidth-pr.width-12;
      if(pr.bottom>window.innerHeight-12) top=r.top-pr.height-10;
      pop.style.left=Math.max(12,left)+'px'; pop.style.top=Math.max(12,top)+'px';
    });
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') hide(); });
  },
  escapeHtml(s){ return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m] || m)); },
  init(){ window.WSCostCalculatorInstance=this; this.setupMiniHelp(); const hist=localStorage.getItem('ws3d-plus-history'); if(hist){ try{ this.history=JSON.parse(hist)||[]; }catch(e){ this.history=[]; } } const saved=localStorage.getItem('ws3d-plus'); if(saved){ try{ this.applySnapshot(JSON.parse(saved)); }catch(e){} } else { this.seed(); this.addJob(); } if(!this.theme) this.theme={color:'#2563eb',textColor:'#ffffff'}; if(!this.theme.textColor) this.theme.textColor='#ffffff'; this.$watch('$data',()=>{ localStorage.setItem('ws3d-plus', JSON.stringify(this.snapshot())); this.$nextTick(()=>this.renderQr()); },{deep:true}); this.$nextTick(()=>this.renderQr()); },
  applySnapshot(data){ if(!data) return; const keepHistory=this.history; const keepOpen=this.historyOpen; const keepNotice=this.historyNotice; Object.assign(this, data); if(!this.output) this.output={compactPdf:false,compactForceArticle:false,showStorageInfo:true}; if(this.output.compactForceArticle===undefined) this.output.compactForceArticle=false; this.history=keepHistory; this.historyOpen=keepOpen; this.historyNotice=keepNotice; },
  seed(){ this.presets.materials=[{id:'pla',name:'PLA Standard',priceKg:20,co2:2.5},{id:'pla_plus',name:'PLA+',priceKg:25,co2:2.6},{id:'petg',name:'PETG',priceKg:25,co2:3.5},{id:'asa',name:'ASA',priceKg:35,co2:4.2},{id:'tpu',name:'TPU',priceKg:38,co2:3.2},{id:'custom',name:'Eigenes Material',priceKg:25,co2:0}]; this.presets.printers=[{id:'a1',name:'Bambu Lab A1 / ähnlich',watts:180,machineHourly:1.5,loadFactor:70},{id:'x1c',name:'Bambu Lab X1C / ähnlich',watts:250,machineHourly:2.5,loadFactor:75},{id:'custom',name:'Eigener Drucker',watts:200,machineHourly:2,loadFactor:70}]; this.presets.profiles=[{id:'standard',name:'Standard Verkauf',marginPercent:35,laborMinutes:10,hourlyRate:50,failRate:5},{id:'hobby',name:'Selbstkosten / Hobby',marginPercent:10,laborMinutes:5,hourlyRate:25,failRate:3},{id:'business',name:'Gewerblich sauber',marginPercent:60,laborMinutes:15,hourlyRate:60,failRate:8},{id:'express',name:'Express / Einzelstück',marginPercent:85,laborMinutes:20,hourlyRate:70,failRate:10}]; },
  softColor(hex){ const h=hex.replace('#',''); const r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16); return `rgba(${r},${g},${b},.13)`; },
  uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); },
  blankJob(){ const j={id:this.uid(),open:true,name:'',quantity:1,materialId:this.presets.materials[0]?.id||'custom',printerId:this.presets.printers[0]?.id||'custom',profileId:this.presets.profiles[0]?.id||'standard',publicMode:'compact',weight:0,time:0,priceKg:25,energyPrice:.40,watts:200,loadFactor:70,machineHourly:2,laborMinutes:10,hourlyRate:50,failRate:5,fixedCost:0,marginPercent:35,manual:false,manualPrice:0}; this.applyMaterial(j); this.applyPrinter(j); this.applyProfile(j); return j; },
  addJob(){ this.jobs.push(this.blankJob()); }, removeJob(i){ this.jobs.splice(i,1); }, duplicateJob(i){ const c=JSON.parse(JSON.stringify(this.jobs[i])); c.id=this.uid(); c.open=true; c.name=c.name?c.name+' Kopie':''; this.jobs.splice(i+1,0,c); },
  addMaterial(){ this.presets.materials.push({id:this.uid(),name:'Neues Material',priceKg:25,co2:0}); }, addPrinter(){ this.presets.printers.push({id:this.uid(),name:'Neuer Drucker',watts:200,machineHourly:2,loadFactor:70}); }, addProfile(){ this.presets.profiles.push({id:this.uid(),name:'Neues Profil',marginPercent:30,laborMinutes:10,hourlyRate:50,failRate:5}); },
  applyMaterial(j){ const m=this.presets.materials.find(x=>x.id===j.materialId); if(m) j.priceKg=m.priceKg; }, applyPrinter(j){ const p=this.presets.printers.find(x=>x.id===j.printerId); if(p){ j.watts=p.watts; j.machineHourly=p.machineHourly; j.loadFactor=p.loadFactor; } }, applyProfile(j){ const p=this.presets.profiles.find(x=>x.id===j.profileId); if(p){ j.marginPercent=p.marginPercent; j.laborMinutes=p.laborMinutes; j.hourlyRate=p.hourlyRate; j.failRate=p.failRate; } },
  toggleManual(j){ j.manual=!j.manual; if(j.manual) j.manualPrice=Number(this.calculatedUnit(j).toFixed(2)); },
  calcParts(j){ const mat=(Number(j.weight)||0)/1000*(Number(j.priceKg)||0); const kwh=(Number(j.watts)||0)*(Number(j.loadFactor)||0)/100/1000*(Number(j.time)||0); const energy=kwh*(Number(j.energyPrice)||0); const machine=(Number(j.time)||0)*(Number(j.machineHourly)||0); const labor=(Number(j.laborMinutes)||0)/60*(Number(j.hourlyRate)||0); const base=mat+energy+machine+labor+(Number(j.fixedCost)||0); const fail=base*(Number(j.failRate)||0)/100; const self=base+fail; const margin=self*(Number(j.marginPercent)||0)/100; return {mat,energy,machine,labor,fix:Number(j.fixedCost)||0,fail,self,margin,total:self+margin}; },
  calculatedUnit(j){ return this.calcParts(j).total; }, unitPrice(j){ return j.manual ? (Number(j.manualPrice)||0) : this.calculatedUnit(j); }, positionTotal(j){ return this.unitPrice(j)*(Number(j.quantity)||0); },
  breakdown(j){ const p=this.calcParts(j); return [{label:'Material',value:p.mat},{label:'Strom',value:p.energy},{label:'Maschine',value:p.machine},{label:'Arbeit',value:p.labor},{label:'Fixkosten',value:p.fix},{label:'Ausschuss',value:p.fail},{label:'Selbstkosten',value:p.self},{label:'Aufschlag',value:p.margin},{label:'Verkaufspreis netto',value:p.total}]; },
  documentLines(){ const lines=this.jobs.map((j,i)=>{ const m=this.presets.materials.find(x=>x.id===j.materialId); const mode=(this.output?.compactPdf && this.output?.compactForceArticle) ? 'compact' : j.publicMode; let details=''; if(mode==='normal') details=`Material: ${m?.name||''} · ${j.weight||0} g · ${j.time||0} h Druckzeit`; let transparent=''; if(mode==='transparent'){ const p=this.calcParts(j); transparent=`Kalkulation sichtbar:\nMaterial ${this.money(p.mat)}, Strom ${this.money(p.energy)}, Maschine ${this.money(p.machine)}, Arbeit ${this.money(p.labor)}, Ausschuss/Fix ${this.money(p.fail+p.fix)}, Aufschlag ${this.money(p.margin)}`; } return {key:j.id,desc:j.name||'3D-Druck Bauteil',qty:j.quantity,price:this.unitPrice(j),total:this.positionTotal(j),details,transparent,units: transparent ? (this.output?.compactPdf?3:4) : (details ? 2 : 1)}; }); this.extras.forEach((e,i)=>lines.push({key:'e'+i,desc:e.desc||'Zusatzposition',qty:e.qty||1,price:e.price||0,total:(e.qty||1)*(e.price||0),units:1})); return lines.map((l,i)=>({...l,pos:String(i+1).padStart(2,'0')})); },
  getPages(){ const all=this.documentLines(); const pages=[]; let cur=[]; let used=0; let limit=this.output?.compactPdf?16:10; const nextLimit=this.output?.compactPdf?24:16; const push=()=>{ pages.push({number:pages.length+1,first:pages.length===0,lines:cur}); cur=[]; used=0; limit=nextLimit; }; all.forEach(line=>{ const u=Math.max(1,line.units||1); if(cur.length && used+u>limit) push(); cur.push(line); used+=u; }); if(cur.length || !pages.length) push(); pages.forEach((p,i)=>{ p.totalPages=pages.length; p.last=i===pages.length-1; }); return pages; },
  subtotal(){ return this.documentLines().reduce((s,l)=>s+(Number(l.total)||0),0); }, vat(){ return this.tax.enabled ? this.subtotal()*(Number(this.tax.rate)||0)/100 : 0; }, total(){ return this.subtotal()+this.vat(); }, money(v){ return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(v)||0); }, date(d){ return d?new Date(d+'T00:00:00').toLocaleDateString('de-DE'):''; },
  titleForDoc(){ return this.doc.type==='rechnung'?'Rechnung':this.doc.type==='lieferschein'?'Lieferschein':'Angebot'; }, setDocType(t){ this.doc.type=t; const core=(this.doc.number||'001').replace(/^(ANG|RE|LS)-/,''); this.doc.number=(t==='rechnung'?'RE-':t==='lieferschein'?'LS-':'ANG-')+core; },
  activeLegalText(){ if(this.tax.profile==='custom' || this.tax.profile==='ch_custom') return this.tax.customText; if(this.tax.profile==='de_vat') return `Leistungsdatum entspricht Rechnungsdatum.\nZahlbar innerhalb von ${this.payment.days||14} Tagen netto.`; if(this.tax.profile==='at_small') return `Umsatzsteuerfrei aufgrund der Kleinunternehmerregelung.\nZahlbar innerhalb von ${this.payment.days||14} Tagen ohne Abzug.`; return this.tax.customText || `Gemäß §19 UStG wird keine Umsatzsteuer berechnet.\nZahlbar innerhalb von ${this.payment.days||14} Tagen ohne Abzug.`; },
  showBankOnDocument(){ return this.doc.type==='rechnung' || (this.doc.type==='angebot' && this.payment.showOnOffer); },
  qrContent(){ if(this.qr.type==='payment') return this.payment.link || this.qr.value; if(this.qr.type==='email') return 'mailto:'+this.qr.value; if(this.qr.type==='phone') return 'tel:'+this.qr.value; return this.qr.value; },
  renderQr(){ this.$nextTick(()=>{ const els=document.querySelectorAll('.qrPrint'); if(!els.length) return; els.forEach(el=>{ el.innerHTML=''; if(this.qr.enabled && window.QRCode && this.qrContent()) new QRCode(el,{text:this.qrContent(),width:72,height:72,correctLevel:QRCode.CorrectLevel.M}); }); }); },
  loadLogo(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>this.company.logo=ev.target.result; r.readAsDataURL(f); e.target.value=''; },
  snapshot(){ return {theme:this.theme,company:this.company,customer:this.customer,doc:this.doc,payment:this.payment,tax:this.tax,qr:this.qr,output:this.output,presets:this.presets,jobs:this.jobs,extras:this.extras}; },
  historyLabel(){ const parts=[this.titleForDoc(), this.doc.number||'ohne Nummer']; if(this.customer.name) parts.push(this.customer.name); if(this.doc.project) parts.push(this.doc.project); return parts.join(' · '); },
  stableStringify(obj){
    const seen=new WeakSet();
    const norm=(v)=>{
      if(v && typeof v==='object'){
        if(seen.has(v)) return null;
        seen.add(v);
        if(Array.isArray(v)) return v.map(norm);
        return Object.keys(v).sort().reduce((a,k)=>{ a[k]=norm(v[k]); return a; },{});
      }
      return v;
    };
    return JSON.stringify(norm(obj));
  },
  historyKey(data){
    let str=this.stableStringify(data);
    let h=0;
    for(let i=0;i<str.length;i++){ h=((h<<5)-h)+str.charCodeAt(i); h|=0; }
    return String(h)+'-'+str.length;
  },
  saveHistoryStore(){ localStorage.setItem('ws3d-plus-history', JSON.stringify(this.history.slice(0,500))); },
  rememberHistory(reason='Manuell gemerkt'){
    const data=JSON.parse(JSON.stringify(this.snapshot()));
    const key=this.historyKey(data);
    const existingIndex=this.history.findIndex(h=>h.key===key);
    if(existingIndex>=0){
      const existing=this.history[existingIndex];
      existing.savedAt=new Date().toISOString();
      existing.reason=reason+' · unverändert erkannt';
      existing.label=this.historyLabel();
      this.history.splice(existingIndex,1);
      this.history=[existing, ...this.history].slice(0,500);
      this.saveHistoryStore();
      this.historyNotice='Stand war bereits in der History – Eintrag wurde nach oben verschoben.';
      setTimeout(()=>{ this.historyNotice=''; },4000);
      return;
    }
    const item={id:this.uid(),key,savedAt:new Date().toISOString(),reason,label:this.historyLabel(),data};
    this.history=[item, ...this.history].slice(0,500);
    this.saveHistoryStore();
    this.historyNotice='Neuer Stand in der lokalen History gespeichert: '+(this.doc.number||this.titleForDoc());
    setTimeout(()=>{ this.historyNotice=''; },4000);
  },
  historyByType(t){ return this.history.filter(h=>(h.data?.doc?.type||'angebot')===t).sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt)); },
  historyAmount(h){ const d=h?.data; if(!d) return 0; const jobs=d.jobs||[], extras=d.extras||[]; const jobSum=jobs.reduce((s,j)=>{ const unit=j.manual ? (Number(j.manualPrice)||0) : this.calcPartsFor(j).total; return s + unit*(Number(j.quantity)||0); },0); const extraSum=extras.reduce((s,e)=>s+(Number(e.qty)||1)*(Number(e.price)||0),0); const vat=(d.tax?.enabled ? (jobSum+extraSum)*(Number(d.tax?.rate)||0)/100 : 0); return jobSum+extraSum+vat; },
  historyTotal(h){ return this.money(this.historyAmount(h)); },
  historyFiltered(t){
    const q=String(this.historySearch||'').toLowerCase().trim();
    const now=new Date();
    let list=this.historyByType(t).filter(h=>{
      const saved=h.savedAt ? new Date(h.savedAt) : new Date(0);
      if(this.historyDateFilter==='today' && saved.toDateString()!==now.toDateString()) return false;
      if(this.historyDateFilter==='30' && (now-saved)>(30*24*60*60*1000)) return false;
      if(this.historyDateFilter==='year' && saved.getFullYear()!==now.getFullYear()) return false;
      if(!q) return true;
      const d=h.data||{};
      const hay=[h.reason,h.label,d.doc?.number,d.doc?.project,d.customer?.name,d.customer?.address,this.historyTotal(h),this.formatDateTime(h.savedAt)].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
    if(this.historySort==='oldest') list=list.sort((a,b)=>new Date(a.savedAt)-new Date(b.savedAt));
    if(this.historySort==='number') list=list.sort((a,b)=>String(a.data?.doc?.number||'').localeCompare(String(b.data?.doc?.number||''),'de',{numeric:true}));
    if(this.historySort==='amount_desc') list=list.sort((a,b)=>this.historyAmount(b)-this.historyAmount(a));
    return list;
  },
  calcPartsFor(j){ const mat=(Number(j.weight)||0)/1000*(Number(j.priceKg)||0); const kwh=(Number(j.watts)||0)*(Number(j.loadFactor)||0)/100/1000*(Number(j.time)||0); const energy=kwh*(Number(j.energyPrice)||0); const machine=(Number(j.time)||0)*(Number(j.machineHourly)||0); const labor=(Number(j.laborMinutes)||0)/60*(Number(j.hourlyRate)||0); const base=mat+energy+machine+labor+(Number(j.fixedCost)||0); const fail=base*(Number(j.failRate)||0)/100; const self=base+fail; const margin=self*(Number(j.marginPercent)||0)/100; return {total:self+margin}; },
  loadHistoryRecord(h){ if(!h) return; if(confirm('Diesen gespeicherten Stand laden? Der aktuelle Arbeitsstand wird ersetzt.')){ this.applySnapshot(JSON.parse(JSON.stringify(h.data))); this.historyOpen=false; this.renderQr(); } },
  loadHistoryItem(i){ this.loadHistoryRecord(this.history[i]); },
  deleteHistoryById(id){ if(confirm('Diesen History-Eintrag wirklich löschen?')){ this.history=this.history.filter(h=>h.id!==id); this.saveHistoryStore(); } },
  deleteHistoryItem(i){ if(confirm('Diesen History-Eintrag wirklich löschen?')){ this.history.splice(i,1); this.saveHistoryStore(); } },
  clearHistory(){ if(confirm('History wirklich leeren?')){ this.history=[]; this.saveHistoryStore(); } },
  prefixForType(t){ return t==='rechnung'?'RE':t==='lieferschein'?'LS':'ANG'; },
  nextNumberSuggestion(t=this.doc.type){
    const prefix=this.prefixForType(t);
    const year=new Date().getFullYear();
    let max=0;
    (this.history||[]).forEach(h=>{
      const n=h?.data?.doc?.number || '';
      const m=String(n).match(new RegExp('^'+prefix+'-(\\d{4})-(\\d+)$'));
      if(m && Number(m[1])===year) max=Math.max(max, Number(m[2])||0);
    });
    const current=String(this.doc.number||'').match(new RegExp('^'+prefix+'-'+year+'-(\\d+)$'));
    if(current) max=Math.max(max, Number(current[1])||0);
    return `${prefix}-${year}-${String(max+1).padStart(3,'0')}`;
  },
  useNextNumber(){ this.doc.number=this.nextNumberSuggestion(this.doc.type); },
  exportHistory(){
    const payload={kind:'Warenschmiede 3D-Druck Kostenrechner Plus History Backup',version:1,toolVersion:this.appVersion,exportedAt:new Date().toISOString(),history:this.history||[]};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='ws_3d_print_kostenrechner_history_'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
    URL.revokeObjectURL(a.href);
    this.historyNotice='History-Backup wurde als JSON gespeichert.';
    setTimeout(()=>{ this.historyNotice=''; },4000);
  },
  importHistory(e){
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const payload=JSON.parse(ev.target.result);
        const imported=Array.isArray(payload) ? payload : (payload.history||[]);
        if(!Array.isArray(imported)) throw new Error('Keine History gefunden');
        const byKey=new Map((this.history||[]).map(h=>[h.key||h.id,h]));
        imported.forEach(h=>{ if(h && h.data){ byKey.set(h.key||h.id||this.historyKey(h.data), h); } });
        this.history=Array.from(byKey.values()).sort((a,b)=>new Date(b.savedAt||0)-new Date(a.savedAt||0)).slice(0,500);
        this.saveHistoryStore();
        this.historyNotice='History-Backup geladen und mit vorhandener History zusammengeführt.';
        setTimeout(()=>{ this.historyNotice=''; },5000);
      }catch(err){ alert('History-Backup konnte nicht geladen werden.'); }
    };
    r.readAsText(f); e.target.value='';
  },
  formatDateTime(v){ return v ? new Date(v).toLocaleString('de-DE') : ''; },

  preflightWarnings(){
    const w=[];
    const hasLines=this.documentLines().length>0;
    if(!this.doc.number) w.push({level:'kritisch',title:'Dokumentnummer fehlt',text:'Bitte eine eindeutige Nummer eintragen oder den Nummernvorschlag übernehmen.'});
    if(!this.customer.name) w.push({level:'hinweis',title:'Kunde fehlt',text:'Für ein echtes Dokument sollte mindestens Name/Firma des Kunden eingetragen sein.'});
    if(!hasLines) w.push({level:'kritisch',title:'Keine Positionen vorhanden',text:'Es gibt weder 3D-Druckpositionen noch Zusatzpositionen. Das Dokument wäre leer.'});
    if(this.doc.type==='rechnung' && (!this.doc.dueDate)) w.push({level:'hinweis',title:'Fälligkeitsdatum fehlt',text:'Bei Rechnungen ist ein Fälligkeitsdatum praktisch und sauberer.'});
    if(this.doc.type==='rechnung' && this.showBankOnDocument() && (!this.payment.iban || !this.payment.bic)) w.push({level:'hinweis',title:'Bankdaten unvollständig',text:'Bei Rechnungen werden Bankdaten angezeigt. IBAN/BIC sind noch nicht vollständig eingetragen.'});
    if(this.doc.type!=='lieferschein' && !String(this.activeLegalText()||'').trim()) w.push({level:'hinweis',title:'Rechtstext fehlt',text:'Für Angebot/Rechnung sollte ein passender Steuer- oder Zahlungshinweis eingetragen sein.'});
    if(this.qr.enabled && !this.qrContent()) w.push({level:'hinweis',title:'QR-Code ohne Inhalt',text:'Der QR-Code ist aktiviert, aber es ist kein nutzbarer Inhalt hinterlegt.'});
    const pages=this.getPages().length;
    if(pages>2 && !this.output.compactPdf) w.push({level:'hinweis',title:'Mehrseitiges Dokument',text:'Das Dokument hat '+pages+' Seiten. Der Kompaktmodus kann bei langen Rechnungen helfen.'});
    if(this.jobs.some(j=>j.publicMode==='transparent') && !this.output.compactPdf) w.push({level:'hinweis',title:'Transparente Kalkulation braucht Platz',text:'Mindestens eine Position zeigt die Kalkulation. Bei vielen Positionen kann der Kompaktmodus sinnvoll sein.'});
    return w;
  },
  openPreflight(){ this.preflightOpen=true; },
  forcePrint(){ this.preflightOpen=false; this.rememberHistory('PDF/Druck gestartet'); document.title=`${this.titleForDoc()}_${this.doc.number||''}`; window.print(); },
  exportFile(){ this.rememberHistory('Als JSON gespeichert'); const blob=new Blob([JSON.stringify(this.snapshot(),null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(this.doc.number||'kalkulation')+'.json'; a.click(); URL.revokeObjectURL(a.href); },
  importFile(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ try{ this.applySnapshot(JSON.parse(ev.target.result)); this.rememberHistory('Aus JSON geladen'); this.renderQr(); }catch(err){ alert('Datei konnte nicht geladen werden.'); } }; r.readAsText(f); e.target.value=''; },
  printDoc(){ const issues=this.preflightWarnings(); if(issues.length){ this.preflightOpen=true; return; } this.forcePrint(); }, resetAll(){ if(confirm('Alle lokal gespeicherten Daten und die History löschen?')){ localStorage.removeItem('ws3d-plus'); localStorage.removeItem('ws3d-plus-history'); location.reload(); } }
}}
