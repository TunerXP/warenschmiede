

"use strict";
const TOOL_VERSION = "Werkstatt-Rechner Metall Plus v29";
const $=id=>document.getElementById(id);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function num(id){return parseFloat($(id)?.value)||0}
function setText(id,v){const e=$(id); if(e)e.textContent=v}
function round(v,d=2){return Number.isFinite(v)?v.toFixed(d):"--"}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>$("toast").classList.remove("show"),1600)}
function setVal(id,v){$(id).value=v;calcAll()}

const tolRows=[
  [0.5,3,0.05,0.10,0.20,null],
  [3,6,0.05,0.10,0.30,0.50],
  [6,30,0.10,0.20,0.50,1.00],
  [30,120,0.15,0.30,0.80,1.50],
  [120,400,0.20,0.50,1.20,2.50],
  [400,1000,0.30,0.80,2.00,4.00],
  [1000,2000,0.50,1.20,3.00,6.00]
];
const fitData=[
  {max:3,H7:[10,0],H8:[14,0],h6:[0,-6],g6:[-2,-8],f7:[-6,-16],k6:[6,0],p6:[12,6]},
  {max:6,H7:[12,0],H8:[18,0],h6:[0,-8],g6:[-4,-12],f7:[-10,-22],k6:[9,1],p6:[20,12]},
  {max:10,H7:[15,0],H8:[22,0],h6:[0,-9],g6:[-5,-14],f7:[-13,-28],k6:[10,1],p6:[24,15]},
  {max:18,H7:[18,0],H8:[27,0],h6:[0,-11],g6:[-6,-17],f7:[-16,-34],k6:[12,1],p6:[29,18]},
  {max:30,H7:[21,0],H8:[33,0],h6:[0,-13],g6:[-7,-20],f7:[-20,-41],k6:[15,2],p6:[35,22]},
  {max:50,H7:[25,0],H8:[39,0],h6:[0,-16],g6:[-9,-25],f7:[-25,-50],k6:[18,2],p6:[42,26]},
  {max:80,H7:[30,0],H8:[46,0],h6:[0,-19],g6:[-10,-29],f7:[-30,-60],k6:[21,2],p6:[51,32]},
  {max:120,H7:[35,0],H8:[54,0],h6:[0,-22],g6:[-12,-34],f7:[-36,-71],k6:[25,3],p6:[59,37]},
  {max:500,H7:[63,0],H8:[97,0],h6:[0,-40],g6:[-20,-60],f7:[-68,-131],k6:[45,5],p6:[108,68]}
];
const threads={
 "Metrisch Regel (M)":{"M1":0.75,"M1.2":0.95,"M1.4":1.10,"M1.6":1.25,"M2":1.60,"M2.5":2.05,"M3":2.50,"M4":3.30,"M5":4.20,"M6":5.00,"M8":6.80,"M10":8.50,"M12":10.20,"M14":12.00,"M16":14.00,"M18":15.50,"M20":17.50,"M24":21.00,"M30":26.50,"M36":32.00},
 "Metrisch Fein (MF)":{"M3 x 0.35":2.65,"M4 x 0.5":3.50,"M5 x 0.5":4.50,"M6 x 0.75":5.25,"M8 x 1.0":7.00,"M10 x 1.0":9.00,"M10 x 1.25":8.80,"M12 x 1.5":10.50,"M16 x 1.5":14.50,"M20 x 1.5":18.50,"M24 x 2.0":22.00,"M30 x 2.0":28.00},
 "UNC":{"1/4-20":5.1,"5/16-18":6.6,"3/8-16":8.0,"7/16-14":9.4,"1/2-13":10.8,"5/8-11":13.5,"3/4-10":16.5},
 "UNF":{"1/4-28":5.5,"5/16-24":6.9,"3/8-24":8.5,"7/16-20":9.9,"1/2-20":11.5,"5/8-18":14.5,"3/4-16":17.5}
};
const screw={
 M1:{holes:{f:1.1,m:1.2,c:1.3},dk:2.0,k:1.0,cb:2.4,cs:2.2},
 "M1.2":{holes:{f:1.3,m:1.4,c:1.5},dk:2.3,k:1.2,cb:2.7,cs:2.6},
 "M1.4":{holes:{f:1.5,m:1.6,c:1.7},dk:2.6,k:1.4,cb:3.0,cs:3.0},
 "M1.6":{holes:{f:1.7,m:1.8,c:2.0},dk:3.0,k:1.6,cb:3.5,cs:3.4},
 M2:{holes:{f:2.2,m:2.4,c:2.6},dk:3.8,k:2.0,cb:4.4,cs:4.4},
 "M2.5":{holes:{f:2.7,m:2.9,c:3.1},dk:4.5,k:2.5,cb:5.0,cs:5.5},
 M3:{holes:{f:3.2,m:3.4,c:3.6},dk:5.5,k:3,cb:6.5,cs:6.3},
 M4:{holes:{f:4.3,m:4.5,c:4.8},dk:7,k:4,cb:8,cs:8.4},
 M5:{holes:{f:5.3,m:5.5,c:5.8},dk:8.5,k:5,cb:10,cs:10.4},
 M6:{holes:{f:6.4,m:6.6,c:7.0},dk:10,k:6,cb:11,cs:12.4},
 M8:{holes:{f:8.4,m:9.0,c:10.0},dk:13,k:8,cb:15,cs:16.5},
 M10:{holes:{f:10.5,m:11.0,c:12.0},dk:16,k:10,cb:18,cs:20.5},
 M12:{holes:{f:13.0,m:13.5,c:14.5},dk:18,k:12,cb:20,cs:24.8},
 M14:{holes:{f:15.0,m:15.5,c:16.5},dk:21,k:14,cb:23,cs:28.0},
 M16:{holes:{f:17.0,m:17.5,c:18.5},dk:24,k:16,cb:26,cs:33.0},
 M20:{holes:{f:21.0,m:22.0,c:24.0},dk:30,k:20,cb:33,cs:41.0},
 M24:{holes:{f:25.0,m:26.0,c:28.0},dk:36,k:24,cb:40,cs:49.0}
};
const shapeDefs={
 round:`<div><label>Durchmesser d [mm]</label><input id="matD" type="number" value="20"></div>`,
 square:`<div><label>Seitenlänge a [mm]</label><input id="matA" type="number" value="20"></div>`,
 flat:`<div class="row"><div><label>Breite b [mm]</label><input id="matB" type="number" value="50"></div><div><label>Stärke h [mm]</label><input id="matH" type="number" value="10"></div></div>`,
 tube:`<div class="row"><div><label>Außen-Ø D [mm]</label><input id="matDo" type="number" value="40"></div><div><label>Innen-Ø d [mm]</label><input id="matDi" type="number" value="30"></div></div>`
};

function openTab(id){
  $$(".tab-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
  $$(".tab").forEach(t=>t.classList.toggle("active",t.id==="tab-"+id));
  history.replaceState(null,"","#"+id);
  setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),30);
}
function cutConsoleInputIds(){return ["cutConsoleD","cutConsoleVc","cutConsoleS","cutConsoleZ","cutConsoleFz","cutConsoleF"]}
function cutVal(id){const e=$(id); if(!e) return 0; const v=String(e.value||"").replace(",","."); return parseFloat(v)||0}
function fmtCut(v,d=2){if(!Number.isFinite(v)) return ""; let txt=Number(v).toFixed(d); return txt.replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
function setCutConsole(id,val,dec=2,calculated=true){
  const e=$(id); if(!e || !Number.isFinite(val)) return;
  e.value=fmtCut(val,dec);
  e.classList.toggle("is-calc", !!calculated);
  if(calculated) delete e.dataset.time;
}
function clearCutCalculated(){cutConsoleInputIds().forEach(id=>$(id)?.classList.remove('is-calc'))}
function setCutManual(el){if(!el) return; el.dataset.time=String(Date.now()); el.classList.remove('is-calc')}
function syncHiddenCut(d,vc,z,f){
  if($('cutD')) $('cutD').value=fmtCut(d,2);
  if($('cutVc')) $('cutVc').value=fmtCut(vc,2);
  if($('cutZ')) $('cutZ').value=fmtCut(z,0);
  if($('cutFz')) $('cutFz').value=fmtCut(f,4);
}
function syncConsoleFromHidden(force=false){
  const map=[["cutConsoleD","cutD",2],["cutConsoleVc","cutVc",2],["cutConsoleZ","cutZ",0],["cutConsoleFz","cutFz",4]];
  map.forEach(([cid,hid])=>{const c=$(cid), h=$(hid); if(c&&h&&(force || !c.value)) c.value=h.value||"";});
}
function updateCutModeUI(){
  const op=$("cutOp")?.value || "drill";
  const zInput=$("cutConsoleZ"), feedLabel=$("cutFeedLabel"), hint=$("cutModeHint");
  if(op==="drill"){
    if(zInput){zInput.value=2; zInput.disabled=true; zInput.classList.add("is-calc"); delete zInput.dataset.time;}
    if(feedLabel) feedLabel.innerHTML='f <span class="unit-mini">mm/U</span>';
    if(hint) hint.innerHTML='<b>Bohren:</b> Gib z. B. Ø und vc ein, dann berechnet das Tool S. Gib S und F ein, dann berechnet es den Vorschub f zurück.';
  } else if(op==="turn"){
    if(zInput){zInput.value=1; zInput.disabled=true; zInput.classList.add("is-calc"); delete zInput.dataset.time;}
    if(feedLabel) feedLabel.innerHTML='f <span class="unit-mini">mm/U</span>';
    if(hint) hint.innerHTML='<b>Drehen:</b> Ø, vc, S, f und F können rückwärts gerechnet werden. z wird nicht benötigt.';
  } else {
    if(zInput){zInput.disabled=false;}
    if(feedLabel) feedLabel.innerHTML='fz <span class="unit-mini">mm/Zahn</span>';
    if(hint) hint.innerHTML='<b>Fräsen:</b> Die letzten Eingaben führen. Typisch: Ø + vc berechnet S, S + z + fz berechnet F, oder S + z + F berechnet fz.';
  }
}
function calcSchnitt(){
  updateCutModeUI();
  syncConsoleFromHidden(false);
  const op=$("cutOp")?.value || "drill";
  let d=cutVal("cutConsoleD"), vc=cutVal("cutConsoleVc"), n=cutVal("cutConsoleS"), z=cutVal("cutConsoleZ"), f=cutVal("cutConsoleFz"), vf=cutVal("cutConsoleF");
  if(op==="drill") z=2;
  if(op==="turn") z=1;
  const t=id=>parseInt($(id)?.dataset.time||"0",10);
  const tVc=t("cutConsoleVc"), tN=t("cutConsoleS"), tF=t("cutConsoleF"), tFz=t("cutConsoleFz");
  // Drehzahl/Schnittgeschwindigkeit: die zuletzt aktiv geänderte Seite gewinnt.
  if(d>0){
    if(n>0 && (tN>tVc || !vc)){
      vc=(Math.PI*d*n)/1000;
      setCutConsole("cutConsoleVc",vc,1,true);
    } else if(vc>0){
      n=(vc*1000)/(Math.PI*d);
      setCutConsole("cutConsoleS",n,0,true);
    }
  }
  // Vorschub: F und f/fz können vorwärts/rückwärts gerechnet werden.
  const denom=(op==="drill"||op==="turn") ? n : n*z;
  if(denom>0){
    if(vf>0 && (tF>tFz || !f)){
      f=vf/denom;
      setCutConsole("cutConsoleFz",f, op==="drill"||op==="turn" ? 3 : 4, true);
    } else if(f>0){
      vf=denom*f;
      setCutConsole("cutConsoleF",vf,0,true);
    }
  }
  if(op==="drill") setCutConsole("cutConsoleZ",2,0,true);
  if(op==="turn") setCutConsole("cutConsoleZ",1,0,true);
  syncHiddenCut(d,vc,z,f);
  setText("cutN",round(n,0)); setText("cutVf",round(vf,0));
  // Kompatible alte Anzeige-IDs, falls noch irgendwo genutzt.
  setText("cncS",round(n,0)); setText("cncF",round(vf,0)); setText("cncVc",round(vc,0)); setText("cncD",round(d,1).replace(".0", ""));
  setText("cncMode", op==="turn" ? "DREHEN" : (op==="drill" ? "BOHREN" : "FRÄSEN"));
  const w=$("cutWarn"); if(!w) return; w.className="";
  if(n>20000){w.textContent="Achtung: Drehzahl sehr hoch";w.classList.add("bad")} else if(vf>3000){w.textContent="Achtung: Vorschub hoch";w.classList.add("warn")} else {w.textContent="Startwert plausibel";w.classList.add("good")}
}
function loadCutPreset(){
  const data={
    steel:{drill:[25,.10,2],millRough:[120,.05,4],millFinish:[180,.03,4],turn:[160,.12,1]},
    inox:{drill:[15,.08,2],millRough:[80,.04,4],millFinish:[120,.03,4],turn:[90,.10,1]},
    alu:{drill:[80,.18,2],millRough:[400,.10,3],millFinish:[600,.08,3],turn:[450,.18,1]},
    plastic:{drill:[60,.18,2],millRough:[300,.15,2],millFinish:[400,.10,2],turn:[250,.15,1]},
    cast:{drill:[22,.10,2],millRough:[110,.06,4],millFinish:[150,.04,4],turn:[130,.14,1]}
  };
  const p=data[$("cutMat").value][$("cutOp").value];
  if($('cutConsoleVc')) {$('cutConsoleVc').value=p[0]; setCutManual($('cutConsoleVc'));}
  if($('cutConsoleFz')) {$('cutConsoleFz').value=p[1]; setCutManual($('cutConsoleFz'));}
  if($('cutConsoleZ')) {$('cutConsoleZ').value=p[2]; setCutManual($('cutConsoleZ'));}
  syncHiddenCut(cutVal('cutConsoleD')||10,p[0],p[2],p[1]);
  calcSchnitt(); toast("Richtwerte geladen");
}
function fmtTol(v){return Number.isFinite(v) ? Number(v).toFixed(2) : "--"}
function fmtTolCell(v){return v==null ? "—" : "±" + Number(v).toFixed(2)}
function calcTol(){
  const d=num("tolDim"), cls=$("tolClass")?.value || "m";
  const idx={f:2,m:3,c:4,v:5}[cls];
  const row=tolRows.find(r=>d>=r[0]&&d<=r[1]) || tolRows.find(r=>d<=r[1]) || tolRows[tolRows.length-1];
  const t=row ? row[idx] : null;
  const status=$("tolStatusLine");
  const clsText={f:"fein",m:"mittel",c:"grob",v:"sehr grob"}[cls] || cls;
  if(status) status.textContent = `Maß ${d ? fmtTol(d) : "--"} mm · Klasse ${cls} (${clsText}) · Bereich ${row ? row[0]+" bis "+row[1]+" mm" : "--"}`;
  setText("tolNominal", d ? fmtTol(d)+" mm" : "--");
  if(!row || t==null || !d){
    setText("tolVal","--"); setText("tolValUm","--"); setText("tolMin","--"); setText("tolMax","--"); setText("tolRange","--");
    const box=$("tolCheckBox"); if(box){box.className="iso-check-box warn";}
    setText("tolCheckText", t==null ? "für diesen Bereich nicht hinterlegt" : "Maß eingeben");
    setText("tolCheckHint", "Bitte Maßbereich und Klasse prüfen.");
    return;
  }
  const min=d-t, max=d+t;
  setText("tolVal",fmtTol(t)); setText("tolValUm",`${Math.round(t*1000)} µm`); setText("tolMin",fmtTol(min)); setText("tolMax",fmtTol(max)); setText("tolRange",`${fmtTol(min)} – ${fmtTol(max)}`);
  const actualRaw=$("tolActual")?.value;
  const actual=actualRaw==="" ? NaN : parseFloat(String(actualRaw).replace(",","."));
  const box=$("tolCheckBox");
  if(!box) return;
  if(!Number.isFinite(actual)){
    box.className="iso-check-box";
    setText("tolCheckText","optional eintragen");
    setText("tolCheckHint","Dann wird direkt gegen Unter- und Obergrenze geprüft.");
  } else if(actual>=min && actual<=max){
    box.className="iso-check-box good";
    setText("tolCheckText",`${fmtTol(actual)} mm · i.O.`);
    setText("tolCheckHint",`liegt innerhalb ${fmtTol(min)} bis ${fmtTol(max)} mm`);
  } else {
    box.className="iso-check-box bad";
    setText("tolCheckText",`${fmtTol(actual)} mm · n.i.O.`);
    setText("tolCheckHint",`zulässig wäre ${fmtTol(min)} bis ${fmtTol(max)} mm`);
  }
}
function renderTolTable(){
  const table=$("tolTable"); if(!table) return;
  table.innerHTML=`<thead><tr><th>Nennmaß</th><th>f</th><th>m</th><th>c</th><th>v</th></tr></thead><tbody>`+
  tolRows.map(r=>`<tr><td>${r[0]} bis ${r[1]} mm</td><td class="mono">${fmtTolCell(r[2])}</td><td class="mono">${fmtTolCell(r[3])}</td><td class="mono">${fmtTolCell(r[4])}</td><td class="mono">${fmtTolCell(r[5])}</td></tr>`).join("")+"</tbody>";
}
let currentFitMode="pair";
function setFitMode(mode){
  currentFitMode=mode || "pair";
  $$(".fit-mode-btn").forEach(b=>b.classList.toggle("active", b.dataset.fitMode===currentFitMode));
  $("fitPresetWrap")?.classList.toggle("fit-hidden", currentFitMode!=="pair");
  $("fitHoleBox")?.classList.toggle("fit-hidden", currentFitMode==="shaft");
  $("fitShaftBox")?.classList.toggle("fit-hidden", currentFitMode==="hole");
  calcFit();
}
function applyFitPreset(){const v=$("fitPreset").value;if(!v)return;const [h,s]=v.split("-");$("holeChar").value=h[0];$("holeNum").value=h[1];$("shaftChar").value=s[0];$("shaftNum").value=s[1];setFitMode("pair")}
function fitVals(dim,code){const e=fitData.find(x=>dim<=x.max);return e?e[code]:null}
function fmtFitRange(min,max){return `${round(min,3)} – ${round(max,3)} mm`}
function fmtFitTol(min,max){const spread=Math.abs(max-min);return `<span class="fit-values-main">${round(spread*1000,0)} µm Toleranz</span><span class="fit-values-sub">${round(spread,3)} mm</span>`}
function updateFitPractice(d, mode, holeCode, shaftCode, hmin, hmax, smin, smax){
  const isH7 = /^H7$/.test(holeCode);
  let allowance = d <= 10 ? 0.15 : d <= 30 ? 0.20 : d <= 80 ? 0.30 : 0.50;
  const pre = Math.max(0, d - allowance);
  if(mode==="shaft"){
    setText("fitDrill", "Rohmaß prüfen");
    setText("fitFinish", round(d,3).replace(/\.000$/,"" ) + " " + shaftCode);
    setText("fitTool", "Drehen/Schleifen Ø" + round(d,3).replace(/\.000$/,"" ) + " " + shaftCode);
    return;
  }
  setText("fitDrill", "ca. " + round(pre,2).replace(/\.00$/,"" ) + " mm");
  setText("fitFinish", isH7 ? (round(d,3).replace(/\.000$/,"" ) + " H7") : (holeCode + " / " + round(hmin,3) + "–" + round(hmax,3)));
  setText("fitTool", isH7 ? "Reibahle Ø" + round(d,3).replace(/\.000$/,"" ) + " H7" : "nach Tabelle prüfen");
}
function calcFit(){
  const d=num("fitDim"), mode=currentFitMode || "pair", hc=$("holeChar").value+$("holeNum").value, sc=$("shaftChar").value+$("shaftNum").value;
  const ft=$("fitType"); if(!ft) return; ft.className="";
  const holeRow=$("holeRangeRow"), shaftRow=$("shaftRangeRow"), valuesRow=$("fitValuesRow"), valuesLabel=$("fitValuesLabel");
  if(!d){setText("fitType","Nennmaß eingeben");return}
  const hv=fitVals(d,hc), sv=fitVals(d,sc);
  holeRow?.classList.toggle("fit-hidden", mode==="shaft");
  shaftRow?.classList.toggle("fit-hidden", mode==="hole");
  valuesRow?.classList.remove("fit-hidden");
  if(mode!=="shaft" && !hv){setText("fitType","Bohrung nicht hinterlegt");return}
  if(mode!=="hole" && !sv){setText("fitType","Welle nicht hinterlegt");return}
  let hmax=null,hmin=null,smax=null,smin=null;
  if(hv){hmax=d+hv[0]/1000; hmin=d+hv[1]/1000; setText("holeRange",fmtFitRange(hmin,hmax));}
  if(sv){smax=d+sv[0]/1000; smin=d+sv[1]/1000; setText("shaftRange",fmtFitRange(smin,smax));}
  updateFitPractice(d, mode, hc, sc, hmin, hmax, smin, smax);
  if(mode==="hole"){
    ft.textContent="Bohrung " + hc; ft.classList.add("fit-status-blue");
    if(valuesLabel) valuesLabel.textContent="Bohrungs-Toleranz";
    if($("fitValues")) $("fitValues").innerHTML=fmtFitTol(hmin,hmax);
    return;
  }
  if(mode==="shaft"){
    ft.textContent="Welle " + sc; ft.classList.add("fit-status-blue");
    if(valuesLabel) valuesLabel.textContent="Wellen-Toleranz";
    if($("fitValues")) $("fitValues").innerHTML=fmtFitTol(smin,smax);
    return;
  }
  if(valuesLabel) valuesLabel.textContent="Spiel / Übermaß";
  const maxClear=hmax-smin,minClear=hmin-smax;
  if(minClear>=0){
    ft.textContent="Spielpassung";ft.classList.add("good");
    if($("fitValues")) $("fitValues").innerHTML=`<span class="fit-values-main">${round(minClear*1000,0)} bis ${round(maxClear*1000,0)} µm Spiel</span><span class="fit-values-sub">${round(minClear,3)} bis ${round(maxClear,3)} mm</span>`;
  }
  else if(maxClear<=0){
    ft.textContent="Übermaßpassung";ft.classList.add("bad");
    if($("fitValues")) $("fitValues").innerHTML=`<span class="fit-values-main">${round(Math.abs(maxClear)*1000,0)} bis ${round(Math.abs(minClear)*1000,0)} µm Übermaß</span><span class="fit-values-sub">${round(Math.abs(maxClear),3)} bis ${round(Math.abs(minClear),3)} mm</span>`;
  }
  else{
    ft.textContent="Übergangspassung";ft.classList.add("warn");
    if($("fitValues")) $("fitValues").innerHTML=`<span class="fit-values-main">${round(Math.abs(minClear)*1000,0)} µm Übermaß bis ${round(maxClear*1000,0)} µm Spiel</span><span class="fit-values-sub">${round(Math.abs(minClear),3)} mm Übermaß bis ${round(maxClear,3)} mm Spiel</span>`;
  }
}
function initThreads(){
  const tt=$("threadType"); tt.innerHTML=Object.keys(threads).map(k=>`<option>${k}</option>`).join("");
  tt.onchange=()=>{populateThreads();calcThread()}; $("threadSize").onchange=calcThread; populateThreads();
  $("threadQuick").innerHTML="<thead><tr><th>Gewinde</th><th>Kernloch</th></tr></thead><tbody>"+Object.entries(threads["Metrisch Regel (M)"]).map(([k,v])=>`<tr><td>${k}</td><td class="mono">${v} mm</td></tr>`).join("")+"</tbody>";
}
function populateThreads(){const list=threads[$("threadType").value];$("threadSize").innerHTML=Object.keys(list).map(k=>`<option>${k}</option>`).join("")}
function calcThread(){const kind=$("threadType").value, name=$("threadSize").value, val=threads[kind][name];setText("threadDrill",round(val,2).replace(".00",""));setText("threadName",name);setText("threadKind",kind)}
function calcScrew(){const s=screw[$("scrSize").value], fit=$("scrFit").value, type=$("scrType").value;if(!s)return;setText("scrHole",s.holes[fit].toFixed(1));setText("scrDk",s.dk.toFixed(1)+" mm");setText("scrCounterDia",(type==="912"?s.cb:s.cs).toFixed(1)+" mm");setText("scrDepth",(type==="912"?s.k+0.4:s.k).toFixed(1)+" mm")}
function conv(mode){
  if(mode==="mm") $("inchVal").value=round(num("mmVal")/25.4,4);
  if(mode==="inch") $("mmVal").value=round(num("inchVal")*25.4,3);
  if(mode==="deg") $("radVal").value=round(num("degVal")*Math.PI/180,4);
  if(mode==="rad") $("degVal").value=round(num("radVal")*180/Math.PI,3);
  calcReverse();
}
function calcReverse(){const d=num("revD"), n=num("revN");setText("revVc",round(Math.PI*d*n/1000,1))}
function updateShape(){const type=$("shapeType").value;$("shapeInputs").innerHTML=shapeDefs[type];$$("input",$("shapeInputs")).forEach(e=>e.oninput=calcWeight);calcWeight()}
function calcWeight(){
  const dens=num("matType"), type=$("shapeType").value, L=num("matL"), qty=num("matQty")||1; let area=0;
  if(type==="round") area=Math.PI*Math.pow(num("matD"),2)/4;
  if(type==="square") area=Math.pow(num("matA"),2);
  if(type==="flat") area=num("matB")*num("matH");
  if(type==="tube") area=Math.PI*(Math.pow(num("matDo"),2)-Math.pow(num("matDi"),2))/4;
  const kg=area*L*dens/1000000, total=kg*qty; setText("matSingle",round(kg,2)); setText("matTotal",round(total,2));
  const price=num("matPrice"); setText("matCost",price?round(total*price,2)+" €":"--");
  const lift=$("matLift"); lift.className="";
  if(kg>=25){lift.textContent="Hebehilfe/Kran einplanen";lift.classList.add("bad")} else if(kg>=15){lift.textContent="vorsichtig heben";lift.classList.add("warn")} else {lift.textContent="von Hand meist unkritisch";lift.classList.add("good")}
}
function setAttr(id,attrs){const e=$(id); if(!e)return; Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));}
const toRad=d=>d*Math.PI/180, toDeg=r=>r*180/Math.PI, sinD=d=>Math.sin(toRad(d)), cosD=d=>Math.cos(toRad(d));
let angleMode='right';
function angleTyped(el){ if(el.value!==''){el.dataset.time=Date.now(); el.classList.remove('calculated'); el.classList.add('driver');} else {delete el.dataset.time; el.classList.remove('driver','calculated');} }
function setAngleMode(mode){
  angleMode=mode;
  ['Right','General','Taper'].forEach(n=>{const b=$('angleMode'+n); if(b)b.classList.toggle('active', mode===n.toLowerCase());});
  const tri=mode!=='taper';
  $('angleTriangleInputs')?.classList.toggle('angle-hidden', !tri); $('angleTaperInputs')?.classList.toggle('angle-hidden', tri);
  $('angleTriangleGroup')?.classList.toggle('angle-hidden', !tri); $('angleTaperGroup')?.classList.toggle('angle-hidden', tri);
  setText('angleModeLabel', mode==='right'?'Rechtwinkliges Dreieck':mode==='general'?'Allgemeines Dreieck':'Kegel / Drehbank');
  const g=$('angGamma'); const cLbl=$('angCLabel');
  if(g){ g.disabled = mode==='right'; if(mode==='right' && !g.value) g.value=90; if(mode!=='right' && g.value==='90' && !g.dataset.time) g.value=''; }
  if(cLbl) cLbl.textContent=mode==='right'?'Seite c / Hypotenuse [mm]':'Seite c [mm]';
  calcAll();
}
function resetAngle(){
  ['angA','angB','angC','angAlpha','angBeta','angGamma','tapD','tapd','tapL'].forEach(id=>{const e=$(id); if(!e)return; e.classList.remove('driver','calculated'); delete e.dataset.time; e.value='';});
  if(angleMode==='right') $('angGamma').value=90; calcAll();
}
function valAngle(id){const e=$(id); const v=parseFloat(e?.value); return Number.isFinite(v)?v:null}
function setAngleVal(id,val,drivers){const e=$(id); if(!e || val==null || !Number.isFinite(val)) return; if(drivers.includes(id)) return; e.value=(Math.abs(val)>=100?val.toFixed(2):val.toFixed(3)).replace(/\.000$/,''); e.classList.add('calculated'); e.classList.remove('driver'); delete e.dataset.time;}
function solveAngleTriangle(){
  const ids=['angA','angB','angC','angAlpha','angBeta','angGamma'];
  let inputs=ids.map(id=>({id,val:valAngle(id),time:parseInt($(id)?.dataset.time||0)})).filter(x=>x.val!=null && x.time>0).sort((a,b)=>b.time-a.time);
  const needed=angleMode==='right'?2:3;
  let drivers=inputs.slice(0,needed);
  if(angleMode==='general'){
    const sides=['angA','angB','angC'];
    if(!drivers.some(d=>sides.includes(d.id))){ const s=inputs.slice(needed).find(d=>sides.includes(d.id)); if(s){drivers.pop();drivers.push(s);} }
  }
  const driverIds=drivers.map(d=>d.id);
  let a=driverIds.includes('angA')?valAngle('angA'):null, b=driverIds.includes('angB')?valAngle('angB'):null, c=driverIds.includes('angC')?valAngle('angC'):null;
  let A=driverIds.includes('angAlpha')?valAngle('angAlpha'):null, B=driverIds.includes('angBeta')?valAngle('angBeta'):null, G=driverIds.includes('angGamma')?valAngle('angGamma'):null;
  if(angleMode==='right') G=90;
  if(inputs.length<needed){
    setText('angleHint',`Gib ${needed} Werte ein. Grün markierte Felder werden automatisch berechnet.`);
    drawAngleTriangle(50,100,111.8,26.57,63.43,90);
    return;
  }
  for(let k=0;k<8;k++){
    if(A!=null && B!=null && G==null) G=180-A-B;
    if(A!=null && G!=null && B==null) B=180-A-G;
    if(B!=null && G!=null && A==null) A=180-B-G;
    if(angleMode==='right'){
      if(a!=null && b!=null && c==null) c=Math.hypot(a,b);
      if(a!=null && c!=null && b==null && c>=a) b=Math.sqrt(c*c-a*a);
      if(b!=null && c!=null && a==null && c>=b) a=Math.sqrt(c*c-b*b);
      if(a!=null && c!=null && A==null) A=toDeg(Math.asin(Math.min(1,Math.max(-1,a/c))));
      if(b!=null && c!=null && B==null) B=toDeg(Math.asin(Math.min(1,Math.max(-1,b/c))));
      if(A!=null && c!=null && a==null) a=c*sinD(A);
      if(B!=null && c!=null && b==null) b=c*sinD(B);
      if(A!=null && b!=null && a==null) a=b*Math.tan(toRad(A));
      if(A!=null && a!=null && b==null) b=a/Math.tan(toRad(A));
    } else {
      if(a!=null && b!=null && c!=null){
        if(A==null) A=toDeg(Math.acos(Math.min(1,Math.max(-1,(b*b+c*c-a*a)/(2*b*c)))));
        if(B==null) B=toDeg(Math.acos(Math.min(1,Math.max(-1,(a*a+c*c-b*b)/(2*a*c)))));
        if(G==null && A!=null && B!=null) G=180-A-B;
      }
      if(a!=null && A!=null){
        if(B!=null && b==null) b=a*sinD(B)/sinD(A);
        if(G!=null && c==null) c=a*sinD(G)/sinD(A);
        if(b!=null && B==null) B=toDeg(Math.asin(Math.min(1,Math.max(-1,b*sinD(A)/a))));
        if(c!=null && G==null) G=toDeg(Math.asin(Math.min(1,Math.max(-1,c*sinD(A)/a))));
      }
      if(b!=null && B!=null){
        if(A!=null && a==null) a=b*sinD(A)/sinD(B);
        if(G!=null && c==null) c=b*sinD(G)/sinD(B);
      }
      if(b!=null && c!=null && A!=null && a==null) a=Math.sqrt(Math.max(0,b*b+c*c-2*b*c*cosD(A)));
      if(a!=null && c!=null && B!=null && b==null) b=Math.sqrt(Math.max(0,a*a+c*c-2*a*c*cosD(B)));
      if(a!=null && b!=null && G!=null && c==null) c=Math.sqrt(Math.max(0,a*a+b*b-2*a*b*cosD(G)));
    }
  }
  setAngleVal('angA',a,driverIds); setAngleVal('angB',b,driverIds); setAngleVal('angC',c,driverIds); setAngleVal('angAlpha',A,driverIds); setAngleVal('angBeta',B,driverIds); setAngleVal('angGamma',G,driverIds);
  if(a&&b&&c){
    const area=0.5*a*b*sinD(G||90); const per=a+b+c;
    setText('angleRes1Label','Winkel α'); setText('angleRes1',round(A||0,2)+'°');
    setText('angleRes2Label','Seite c'); setText('angleRes2',round(c,2)+' mm');
    setText('angleRes3Label',angleMode==='right'?'Steigung':'Fläche'); setText('angleRes3',angleMode==='right'?(b?round(a/b*100,1)+'%':'--'):(round(area,2)+' mm²'));
    setText('angleHint','Berechnet. Du kannst jetzt einen beliebigen Wert ändern; die letzten Eingaben werden bevorzugt.');
    drawAngleTriangle(a,b,c,A||0,B||0,G||90);
  }
}
function drawAngleTriangle(a,b,c,A,B,G){
  if(!a||!b||!G)return;
  const C={x:0,y:0}, Bp={x:a,y:0}, Ap={x:b*cosD(G),y:b*sinD(G)};
  const minX=Math.min(C.x,Bp.x,Ap.x), maxX=Math.max(C.x,Bp.x,Ap.x), minY=Math.min(C.y,Bp.y,Ap.y), maxY=Math.max(C.y,Bp.y,Ap.y);
  const scale=Math.min(310/Math.max(1,maxX-minX),250/Math.max(1,maxY-minY))*0.82;
  const tx=x=>75+(x-minX)*scale, ty=y=>295-(y-minY)*scale;
  const pC={x:tx(C.x),y:ty(C.y)}, pB={x:tx(Bp.x),y:ty(Bp.y)}, pA={x:tx(Ap.x),y:ty(Ap.y)};
  setAttr('angleTriPoly',{points:`${pC.x},${pC.y} ${pB.x},${pB.y} ${pA.x},${pA.y}`});
  setAttr('angleBaseHelp',{x1:pC.x,y1:pC.y,x2:pB.x,y2:pB.y}); setAttr('angleHeightHelp',{x1:pB.x,y1:pB.y,x2:pA.x,y2:pA.y});

  function labelWithLine(labelId,lineId,anchor,label,dx,dy){
    const lx=anchor.x+dx, ly=anchor.y+dy;
    setAttr(lineId,{x1:anchor.x,y1:anchor.y,x2:lx,y2:ly});
    setAttr(labelId,{x:lx,y:ly});
    setText(labelId,label);
  }
  const midAB={x:(pC.x+pB.x)/2,y:(pC.y+pB.y)/2};
  const midCA={x:(pC.x+pA.x)/2,y:(pC.y+pA.y)/2};
  const midCB={x:(pA.x+pB.x)/2,y:(pA.y+pB.y)/2};
  labelWithLine('angleLblA','angleLineA',midAB,'a  '+round(a,1)+' mm',0,34);
  labelWithLine('angleLblB','angleLineB',midCA,'b  '+round(b,1)+' mm',-48,-10);
  labelWithLine('angleLblC','angleLineC',midCB,'c  '+round(c,1)+' mm',44,-10);

  setAttr('angleLblGamma',{x:pC.x+35,y:pC.y-18}); setText('angleLblGamma','γ '+round(G,1)+'°');
  setAttr('angleLblBeta',{x:pB.x-52,y:pB.y-18}); setText('angleLblBeta','β '+round(B,1)+'°');
  setAttr('angleLblAlpha',{x:pA.x+14,y:pA.y+32}); setText('angleLblAlpha','α '+round(A,1)+'°');
  const r=38, theta=G*Math.PI/180, ax=pC.x+r, ay=pC.y, ex=pC.x+r*Math.cos(theta), ey=pC.y-r*Math.sin(theta), large=G>180?1:0;
  setAttr('angleArc',{d:`M ${ax} ${ay} A ${r} ${r} 0 ${large} 0 ${ex} ${ey}`});
}
function solveTaperAngle(){
  const D=num('tapD'), d=num('tapd'), L=num('tapL');
  if(!(D&&d&&L)){setText('angleRes1','--');return;}
  const angle=toDeg(Math.atan(((D-d)/2)/L)); const ratio=(D-d)!==0?L/(D-d):0;
  setText('angleRes1Label','Einstellwinkel α/2'); setText('angleRes1',round(angle,3)+'°');
  setText('angleRes2Label','Kegel je Länge'); setText('angleRes2','1 : '+round(ratio,1));
  setText('angleRes3Label','Ø-Differenz'); setText('angleRes3',round(D-d,2)+' mm');
  setText('taperAngleLabel','α/2 '+round(angle,2)+'°');
}
function solveAngle(){ if(angleMode==='taper') solveTaperAngle(); else solveAngleTriangle(); }

const PROJECT_STORE_KEY="ws_metall_cut_project_folder_v1";
let cutTools=[];
let activeToolId=null;
let activeProjectId=null;
let suppressToolLive=false;
function projectFolder(){try{return JSON.parse(localStorage.getItem(PROJECT_STORE_KEY)||"[]")}catch(e){return[]}}
function setProjectFolder(arr){localStorage.setItem(PROJECT_STORE_KEY,JSON.stringify((arr||[]).map(normalizeProject)))}
function toolName(){return ($("cutNote")?.value||"").trim()}
function toolT(){return ($("toolT")?.value||"").trim()}
function toolSummaryFromInputs(){
  const op=$("cutOp")?.value||"drill";
  const displayName = toolName();
  return normalizeTool({
    id:activeToolId || ("tool_"+Date.now()+"_"+Math.random().toString(16).slice(2)),
    t:toolT(),
    name:displayName,
    diameter:$("cutD")?.value||"",
    length:$("toolLen")?.value||"",
    coating:$("toolCoat")?.value||"unbeschichtet",
    material:$("cutMat")?.options[$("cutMat").selectedIndex]?.text || "",
    op:$("cutOp")?.options[$("cutOp").selectedIndex]?.text || "",
    values:{
      d:$("cutD")?.value||"",
      vc:$("cutVc")?.value||"",
      z:$("cutZ")?.value||"",
      f:$("cutFz")?.value||"",
      n:$("cutN")?.textContent||"",
      vf:$("cutVf")?.textContent||"",
      check:$("cutWarn")?.textContent||""
    },
    raw:{
      mat:$("cutMat")?.value||"",
      op,
      d:$("cutD")?.value||"",
      vc:$("cutVc")?.value||"",
      z:$("cutZ")?.value||"",
      f:$("cutFz")?.value||"",
      note:displayName,
      t:toolT(),
      len:$("toolLen")?.value||"",
      coat:$("toolCoat")?.value||""
    },
    updated:new Date().toISOString()
  });
}
function normalizeTool(t){
  t=t||{};
  const raw=t.raw||{};
  const values=t.values||{};
  return {
    id:t.id || ("tool_"+Date.now()+"_"+Math.random().toString(16).slice(2)),
    t:String(t.t ?? raw.t ?? "").trim(),
    name:String(t.name ?? raw.note ?? "").trim(),
    diameter:String(t.diameter ?? values.d ?? raw.d ?? "").trim(),
    length:String(t.length ?? raw.len ?? "").trim(),
    coating:String(t.coating ?? raw.coat ?? "unbeschichtet").trim(),
    material:String(t.material ?? "").trim(),
    op:String(t.op ?? "").trim(),
    values:{
      d:String(values.d ?? t.diameter ?? raw.d ?? "").trim(),
      vc:String(values.vc ?? raw.vc ?? "").trim(),
      z:String(values.z ?? raw.z ?? "").trim(),
      f:String(values.f ?? raw.f ?? "").trim(),
      n:String(values.n ?? "").trim(),
      vf:String(values.vf ?? "").trim(),
      check:String(values.check ?? "").trim()
    },
    raw:{
      mat:String(raw.mat ?? "").trim(),
      op:String(raw.op ?? "").trim(),
      d:String(raw.d ?? values.d ?? t.diameter ?? "").trim(),
      vc:String(raw.vc ?? values.vc ?? "").trim(),
      z:String(raw.z ?? values.z ?? "").trim(),
      f:String(raw.f ?? values.f ?? "").trim(),
      note:String(raw.note ?? t.name ?? "").trim(),
      t:String(raw.t ?? t.t ?? "").trim(),
      len:String(raw.len ?? t.length ?? "").trim(),
      coat:String(raw.coat ?? t.coating ?? "unbeschichtet").trim()
    },
    updated:t.updated || new Date().toISOString()
  };
}
function normalizeProject(p){
  p=p||{};
  return {
    id:p.id || ("proj_"+Date.now()+"_"+Math.random().toString(16).slice(2)),
    name:String(p.name || "Unbenanntes Projekt").trim(),
    ref:String(p.ref || "").trim(),
    orderNo:String(p.orderNo || "").trim(),
    drawingNo:String(p.drawingNo || "").trim(),
    customer:String(p.customer || "").trim(),
    description:String(p.description || "").trim(),
    tools:Array.isArray(p.tools)?p.tools.map(normalizeTool):[],
    updated:p.updated || new Date().toISOString(),
    version:TOOL_VERSION
  };
}
function saveToolToBasket(){
  if(!toolT() || !toolName()){toast("T-Nummer und Werkzeugbeschreibung sind Pflicht");return}
  const item=toolSummaryFromInputs();
  const i=cutTools.findIndex(x=>x.id===item.id || (x.t.toLowerCase()===item.t.toLowerCase() && x.name.toLowerCase()===item.name.toLowerCase()));
  if(i>=0){item.id=cutTools[i].id;cutTools[i]=item;activeToolId=item.id;toast("Werkzeug aktualisiert");renderToolBasket();}
  else {cutTools.push(item);activeToolId=null;toast("Werkzeug gespeichert – Eingabe geleert");renderToolBasket();newToolEntry(false);}
}
function newToolEntry(showToast=true){
  suppressToolLive=true; activeToolId=null;
  ["toolT","cutNote","toolLen"].forEach(id=>{if($(id)) $(id).value=""});
  if($("toolCoat")) $("toolCoat").value="unbeschichtet";
  [["cutConsoleD","10"],["cutConsoleVc","120"],["cutConsoleS",""] ,["cutConsoleZ","2"],["cutConsoleFz","0.10"],["cutConsoleF",""]].forEach(([id,v])=>{if($(id)){ $(id).value=v; delete $(id).dataset.time; $(id).classList.remove("is-calc"); }});
  syncHiddenCut(10,120,2,0.10);
  updateCutModeUI(); calcSchnitt(); suppressToolLive=false; renderToolBasket(false);
  if(showToast) toast("Eingabe für neues Werkzeug geleert");
}
function updateActiveToolLive(){
  if(suppressToolLive || !activeToolId) return;
  const i=cutTools.findIndex(x=>x.id===activeToolId);
  if(i<0 || !toolT() || !toolName()) return;
  const item=toolSummaryFromInputs(); item.id=activeToolId; cutTools[i]=item; renderToolBasket(false);
}
function loadTool(id){
  const item=cutTools.find(x=>x.id===id); if(!item) return;
  suppressToolLive=true; activeToolId=id;
  if($("toolT")) $("toolT").value=item.raw?.t||item.t||"";
  if($("cutNote")) $("cutNote").value=item.raw?.note||item.name||"";
  if($("toolLen")) $("toolLen").value=item.raw?.len||item.length||"";
  if($("toolCoat")) $("toolCoat").value=item.raw?.coat||item.coating||"unbeschichtet";
  if($("cutMat")) $("cutMat").value=item.raw?.mat||"steel";
  if($("cutOp")) $("cutOp").value=item.raw?.op||"drill";
  updateCutModeUI();
  [["cutD","d"],["cutVc","vc"],["cutZ","z"],["cutFz","f"]].forEach(([id,k])=>{if($(id)) $(id).value=item.raw?.[k]||""});
  [["cutConsoleD","d"],["cutConsoleVc","vc"],["cutConsoleZ","z"],["cutConsoleFz","f"]].forEach(([id,k])=>{if($(id)){ $(id).value=item.raw?.[k]||""; delete $(id).dataset.time; $(id).classList.remove("is-calc"); }});
  if($('cutConsoleS')) { $('cutConsoleS').value=item.values?.n||""; delete $('cutConsoleS').dataset.time; $('cutConsoleS').classList.add('is-calc'); }
  if($('cutConsoleF')) { $('cutConsoleF').value=item.values?.vf||""; delete $('cutConsoleF').dataset.time; $('cutConsoleF').classList.add('is-calc'); }
  suppressToolLive=false; calcSchnitt(); renderToolBasket(false); toast("Werkzeug geladen");
}
function deleteTool(id){
  const item=cutTools.find(x=>x.id===id); if(!item) return;
  if(!confirm(`Werkzeug ${item.t} – ${item.name} wirklich löschen?`)) return;
  cutTools=cutTools.filter(x=>x.id!==id); if(activeToolId===id) activeToolId=null; renderToolBasket(); toast("Werkzeug gelöscht");
}
function renderToolBasket(showEmpty=true){
  const list=$("toolBasketList"), empty=$("toolBasketEmpty"); if(!list) return;
  list.innerHTML=cutTools.map(item=>`<div class="tool-mini-card ${item.id===activeToolId?'is-active':''}" onclick="loadTool('${item.id}')"><div class="tool-mini-top"><span>${escapeHtml(item.t)} · ${escapeHtml(item.name)}</span><span>${escapeHtml(item.op||'')}</span></div><div class="tool-mini-meta"><span>Ø ${escapeHtml(item.diameter||'-')} mm</span><span>L ${escapeHtml(item.length||'-')} mm</span><span>${escapeHtml(item.coating||'-')}</span></div><div class="tool-mini-actions"><button type="button" onclick="event.stopPropagation();loadTool('${item.id}')">Laden</button><button type="button" onclick="event.stopPropagation();deleteTool('${item.id}')">Löschen</button></div></div>`).join("");
  if(empty) empty.style.display=cutTools.length?"none":"block";
}
function escapeHtml(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]))}
function currentProjectPayload(){return normalizeProject({
  id:activeProjectId||("proj_"+Date.now()),
  name:($("cutProjectName")?.value||"Unbenanntes Projekt").trim(),
  ref:($("cutProjectRef")?.value||"").trim(),
  orderNo:($("cutOrderNo")?.value||"").trim(),
  drawingNo:($("cutDrawingNo")?.value||"").trim(),
  customer:($("cutCustomer")?.value||"").trim(),
  description:($("cutProjectDesc")?.value||"").trim(),
  tools:cutTools.map(normalizeTool),
  updated:new Date().toISOString(),
  version:TOOL_VERSION
})}
function saveCutProject(){
  if(!cutTools.length){toast("Erst Werkzeuge in den Korb legen");return}
  const p=currentProjectPayload(); activeProjectId=p.id;
  const arr=projectFolder(); const i=arr.findIndex(x=>x.id===p.id || (x.name||"").toLowerCase()===p.name.toLowerCase());
  if(i>=0){p.id=arr[i].id;activeProjectId=p.id;arr[i]=p}else arr.unshift(p);
  setProjectFolder(arr); toast("Projekt gespeichert");
}
function loadCutProject(id){
  const p=projectFolder().find(x=>x.id===id); if(!p) return;
  activeProjectId=p.id; cutTools=Array.isArray(p.tools)?p.tools.map(normalizeTool):[]; activeToolId=null;
  if($("cutProjectName")) $("cutProjectName").value=p.name||""; if($("cutProjectRef")) $("cutProjectRef").value=p.ref||""; if($("cutOrderNo")) $("cutOrderNo").value=p.orderNo||""; if($("cutDrawingNo")) $("cutDrawingNo").value=p.drawingNo||""; if($("cutCustomer")) $("cutCustomer").value=p.customer||""; if($("cutProjectDesc")) $("cutProjectDesc").value=p.description||"";
  renderToolBasket(); projectDialog?.close(); toast("Projekt geladen");
}
function deleteCutProject(id){
  const arr=projectFolder(); const p=arr.find(x=>x.id===id); if(!p) return;
  if(!confirm(`Projekt „${p.name}“ wirklich löschen?`)) return;
  setProjectFolder(arr.filter(x=>x.id!==id)); renderProjectDialog(); toast("Projekt gelöscht");
}
let selectedProjectDialogId=null;
function filteredProjects(){
  const q=($("projectSearch")?.value||"").toLowerCase();
  return projectFolder().filter(p=>((p.name||"")+" "+(p.ref||"")+" "+(p.orderNo||"")+" "+(p.drawingNo||"")+" "+(p.customer||"")+" "+(p.description||"")+" "+(p.tools||[]).map(t=>(t.t||"")+" "+(t.name||"")).join(" ")).toLowerCase().includes(q));
}
function openProjectDialog(){
  const arr=filteredProjects();
  selectedProjectDialogId=activeProjectId || selectedProjectDialogId || (arr[0]?.id||null);
  renderProjectDialog();
  projectDialog.showModal();
}
function selectProjectDialog(id){selectedProjectDialogId=id;renderProjectDialog()}
function renderProjectDialog(){
  const list=$("projectList"), detail=$("projectDetail"); if(!list||!detail) return;
  const arr=filteredProjects();
  if(!arr.some(p=>p.id===selectedProjectDialogId)) selectedProjectDialogId=arr[0]?.id||null;
  list.innerHTML=arr.length?arr.map(p=>`<tr class="project-row ${p.id===selectedProjectDialogId?'is-active':''}" onclick="selectProjectDialog('${p.id}')"><td><b>${escapeHtml(p.name||'Unbenannt')}</b><small>${new Date(p.updated||Date.now()).toLocaleString('de-DE')}</small></td><td>${escapeHtml(p.ref||'-')}</td><td>${(p.tools||[]).length}</td></tr>`).join(""):`<tr><td colspan="3"><div class="project-empty-state">Noch keine gespeicherten Projekte gefunden.</div></td></tr>`;
  const p=arr.find(x=>x.id===selectedProjectDialogId);
  if(!p){detail.innerHTML=`<div class="project-empty-state">Wähle links ein Projekt aus. Hier erscheinen dann Beschreibung, Werkzeugliste und Aktionen.</div>`;return;}
  const tools=Array.isArray(p.tools)?p.tools:[];
  detail.innerHTML=`
    <div>
      <h3>${escapeHtml(p.name||'Unbenanntes Projekt')}</h3>
      <div class="project-detail-meta">
        <span class="project-detail-badge">Projekt-Nr.: ${escapeHtml(p.ref||'-')}</span>
        ${p.orderNo?`<span class="project-detail-badge">Auftrag: ${escapeHtml(p.orderNo)}</span>`:''}
        ${p.drawingNo?`<span class="project-detail-badge">Zeichnung: ${escapeHtml(p.drawingNo)}</span>`:''}
        ${p.customer?`<span class="project-detail-badge">Kunde: ${escapeHtml(p.customer)}</span>`:''}
        <span class="project-detail-badge">${tools.length} Werkzeug(e)</span>
        <span class="project-detail-badge">Geändert: ${new Date(p.updated||Date.now()).toLocaleString('de-DE')}</span>
      </div>
    </div>
    <div class="project-detail-desc"><b>Beschreibung:</b><br>${escapeHtml(p.description||'Keine Beschreibung hinterlegt.')}</div>
    <div>
      <h3>Werkzeuge</h3>
      <div class="project-tool-list">${tools.length?tools.map(t=>`<div class="project-tool-row"><b>${escapeHtml(t.t||'-')}</b><div><strong>${escapeHtml(t.name||'-')}</strong><br><span>${escapeHtml(t.op||'-')} · Ø ${escapeHtml(t.diameter||'-')} mm · L ${escapeHtml(t.length||'-')} mm · ${escapeHtml(t.coating||'-')}</span></div><span>${escapeHtml(t.values?.n||'-')} U/min</span></div>`).join(''):`<div class="project-empty-state">Keine Werkzeuge im Projekt gespeichert.</div>`}</div>
    </div>
    <div class="project-detail-actions">
      <button class="btn btn-blue" type="button" onclick="loadCutProject('${p.id}')">Projekt laden</button>
      <button class="btn btn-red" type="button" onclick="deleteCutProject('${p.id}')">Projekt löschen</button>
    </div>`;
}
function exportProjectFolder(){
  const data={type:"warenschmiede-werkstatt-rechner-schnittdaten-aktenordner",exported:new Date().toISOString(),version:TOOL_VERSION,projects:projectFolder().map(normalizeProject)};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="warenschmiede_schnittdaten_aktenordner.json"; a.click(); URL.revokeObjectURL(a.href);
}
function importProjectFolder(ev){
  const file=ev.target.files?.[0]; if(!file) return; const r=new FileReader();
  r.onload=()=>{try{const data=JSON.parse(r.result); const projects=Array.isArray(data.projects)?data.projects:(Array.isArray(data)?data:[]); setProjectFolder(projects.map(normalizeProject)); toast("Aktenordner geladen"); renderProjectDialog();}catch(e){alert("JSON konnte nicht gelesen werden.")}};
  r.readAsText(file); ev.target.value="";
}
function printToolSheet(){
  const p=currentProjectPayload();
  if(!p.tools.length){toast("Keine Werkzeuge im Projekt");return}
  const cleanOp = op => String(op||'-').replace('Fräsen Schruppen','Schruppfräser').replace('Fräsen Schlichten','Schlichtfräser');
  const rows=p.tools.map(t=>{
    const v=t.values||{};
    const toolNo=String(t.t||'-').trim();
    const dia=String(t.diameter||'-').trim();
    const len=String(t.length||'-').trim();
    const z=String(v.z||'-').trim();
    const vc=String(v.vc||'-').trim();
    const f=String(v.f||'-').trim();
    const n=String(v.n||'-').trim();
    const vf=String(v.vf||'-').trim();
    return `<section class="tool-card-print">
      <div class="tool-main">
        <div class="tool-t"><span class="label">Tool</span><strong>T${escapeHtml(toolNo).replace(/^T/i,'')}</strong></div>
        <div class="tool-s"><span class="label">S</span><b>${escapeHtml(n)}</b><small>U/min</small></div>
        <div class="tool-f"><span class="label">F</span><b>${escapeHtml(vf)}</b><small>mm/min</small></div>
      </div>
      <div class="cell tool-name"><span class="label">Werkzeug</span><b>${escapeHtml(t.name||'-')}</b></div>
      <div class="cell measure"><span class="label">Maße</span><b>Ø ${escapeHtml(dia)} mm <em>z ${escapeHtml(z)}</em></b><b>L ${escapeHtml(len)} mm</b></div>
      <div class="cell values"><span class="label">Schnittwerte</span><b>vc ${escapeHtml(vc)} m/min</b><b>${String(t.op||'').includes('Fräsen')?'fz':'f'} ${escapeHtml(f)}</b></div>
      <div class="cell coat"><span class="label">Beschichtung</span><b>${escapeHtml(t.coating||'-')}</b></div>
    </section>`;
  }).join('');
  const w=window.open("","_blank"); if(!w) return;
  w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(p.name)} Werkzeugblatt</title><style>
    @page{size:A4 portrait;margin:8mm 8mm 9mm}
    *{box-sizing:border-box}
    body{font-family:Arial,"Segoe UI",sans-serif;margin:0;color:#142033;background:#fff;font-size:9.6px;line-height:1.15}
    .print-actions{position:sticky;top:0;background:#fff;padding:8px 0 10px;border-bottom:1px solid #d8e2ee;margin-bottom:10px;display:flex;gap:8px;z-index:10}
    button{border:1px solid #b8c8d8;background:#0b74c8;color:#fff;border-radius:9px;padding:7px 11px;font-weight:800;cursor:pointer}button.secondary{background:#fff;color:#102033}
    main{width:100%;max-width:194mm;margin:0 auto}
    h1{margin:0 0 7px;font-size:17px;letter-spacing:-.02em;color:#102033}
    .head-line{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;border-bottom:2px solid #102033;padding-bottom:6px}
    .count{border:1px solid #cbd8e6;background:#edf4fb;border-radius:999px;padding:4px 8px;font-weight:800;white-space:nowrap;color:#314861}
    .project-grid{display:grid;grid-template-columns:1.1fr .85fr .85fr 1fr;gap:0;border:1px solid #233243;border-radius:8px;overflow:hidden;margin-bottom:6px}
    .project-grid div{border-right:1px solid #233243;padding:5px 7px;min-height:25px}.project-grid div:last-child{border-right:0}.project-grid .wide{grid-column:1 / -1;border-top:1px solid #233243;border-right:0;min-height:24px}.project-grid .customer{grid-column:1 / -1;border-top:1px solid #233243;border-right:0}
    .label{display:block;font-size:7.1px;line-height:1;color:#5c6f82;text-transform:uppercase;letter-spacing:.07em;font-weight:900;margin-bottom:3px}
    .project-grid b{font-size:9px}.project-grid span{font-size:9.8px;font-weight:700;color:#162536}
    .tools{display:grid;gap:5px}
    .tools{display:grid;gap:4.7mm}
    .tool-card-print{display:grid;grid-template-columns:37mm 1.45fr .86fr .92fr .78fr;border:1.2px solid #90a5b8;border-radius:8px;overflow:hidden;break-inside:avoid;page-break-inside:avoid;background:#fff;min-height:19mm;box-shadow:0 1px 0 rgba(16,32,51,.06)}
    .tool-main{display:grid;grid-template-columns:14mm 23mm;grid-template-rows:1fr 1fr;border-right:1px solid #a8b8c7;background:#f4f8fc}
    .tool-t{grid-row:1 / span 2;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid #c3d0dc;padding:3px;text-align:center}.tool-t .label{font-size:6.6px;margin-bottom:2px}.tool-t strong{font-size:18px;line-height:.95;letter-spacing:-.04em;color:#0b5aa8}
    .tool-s,.tool-f{padding:3px 5px;display:flex;flex-direction:column;justify-content:center;text-align:center}.tool-s{border-bottom:1px solid #c3d0dc}.tool-s b,.tool-f b{font-size:12px;line-height:1;color:#102033}.tool-s small,.tool-f small{display:block;font-size:6.7px;color:#5c6f82;margin-top:1px}
    .cell{border-right:1px solid #c3d0dc;padding:5px 7px;min-width:0;background:#fff;display:flex;flex-direction:column;justify-content:flex-start}.cell:nth-child(odd){background:#fbfdff}.cell:last-child{border-right:0}.cell b{display:block;font-size:12px;line-height:1.22;white-space:normal;overflow:hidden;text-overflow:ellipsis}.cell small{display:block;font-size:9px;color:#506273;font-weight:700;margin-top:2px;white-space:normal;overflow:hidden;text-overflow:ellipsis}.measure b,.values b{font-size:11px}.measure em{font-style:normal;margin-left:8px;color:#0b5aa8}.coat b{font-size:12px;color:#102033}
    footer{margin:7px 0 0;border-top:1px solid #9aabbc;padding-top:4px;color:#5b6f83;font-size:7.6px;display:flex;justify-content:space-between;gap:10px}
    @media print{.print-actions{display:none} body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    /* v25 Merker-Dialog: lesbarer, öffentliche Hilfe statt Bauhinweise */
    .cut-info-dialog{max-width:min(980px,calc(100vw - 28px));}
    .cut-info-rich{display:grid;gap:16px;color:var(--muted);}
    .cut-info-hero{border:1px solid var(--line);border-radius:18px;padding:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--paper-soft) 92%,transparent),color-mix(in srgb,#eaf3ff 56%,var(--paper)));}
    .cut-info-hero b{color:var(--text)}
    .formula-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
    .formula-card{border:1px solid var(--line);border-radius:16px;background:var(--paper-soft);padding:13px;}
    .formula-card h3{margin:0 0 8px;color:var(--text);font-size:1rem;}
    .formula-card code{display:block;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:9px 10px;margin:6px 0;font-family:var(--mono);font-weight:900;color:var(--text);white-space:normal;}
    .term-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}
    .term-box{border:1px solid var(--line);border-radius:15px;background:var(--paper);padding:11px;}
    .term-box strong{display:block;color:var(--blue);font-size:.95rem;margin-bottom:3px;}
    .term-box span{font-size:.86rem;line-height:1.45;color:var(--muted);}
    .practice-box{border:1px solid color-mix(in srgb,var(--orange) 32%,var(--line));border-radius:16px;background:color-mix(in srgb,#fff7ed 55%,var(--paper));padding:13px;}
    .practice-box h3{margin:0 0 8px;color:var(--text)}
    .practice-box ul{margin:0;padding-left:1.1rem;display:grid;gap:6px;}
    .muted-small{font-size:.84rem;color:var(--muted);line-height:1.45;}
    @media(max-width:840px){.formula-grid,.term-grid{grid-template-columns:1fr}.cut-info-dialog{max-width:calc(100vw - 16px)}}

  </style></head><body><div class="print-actions"><button onclick="window.print();return false;">Drucken / PDF speichern</button><button class="secondary" onclick="window.close();return false;">Schließen</button></div><main><div class="head-line"><h1>Werkzeug-Schnittdatenblatt</h1><span class="count">${p.tools.length} Werkzeug(e)</span></div><section class="project-grid"><div><b>Projektname</b><br><span>${escapeHtml(p.name||'')}</span></div><div><b>Projekt-Nr.</b><br><span>${escapeHtml(p.ref||'')}</span></div><div><b>Auftrag-Nr.</b><br><span>${escapeHtml(p.orderNo||'')}</span></div><div><b>Zeichnungs-Nr.</b><br><span>${escapeHtml(p.drawingNo||'')}</span></div><div class="wide"><b>Beschreibung</b><br><span>${escapeHtml(p.description||'')}</span></div>${p.customer?`<div class="customer"><b>Kunde</b><br><span>${escapeHtml(p.customer)}</span></div>`:''}</section><div class="tools">${rows}</div><footer><span>Richtwerte prüfen: Herstellerdaten, Maschine, Spannung und Werkzeugzustand bleiben entscheidend.</span><span>Warenschmiede Werkstatt-Rechner Metall Plus v29</span></footer></main></body></html>`);
  w.document.close();
}

function saveHistory(type){ if(type==="schnitt") saveToolToBasket(); }
function renderHistory(){ renderToolBasket(); }
function copySummary(type){
  let txt="";
  if(type==="schnitt") txt=`Schnittdaten: Ø ${$("cutD").value} mm, vc ${$("cutVc").value} m/min, z ${$("cutZ").value}, fz ${$("cutFz").value} mm → n ${$("cutN").textContent} U/min, vf ${$("cutVf").textContent} mm/min`;
  if(type==="thread") txt=`${$("threadName").textContent}: Kernloch ${$("threadDrill").textContent} mm (${$("threadKind").textContent})`;
  if(type==="angle") txt=`Winkel: ${$("angleRes1Label").textContent} ${$("angleRes1").textContent}, ${$("angleRes2Label").textContent} ${$("angleRes2").textContent}, ${$("angleRes3Label").textContent} ${$("angleRes3").textContent}`;
  navigator.clipboard?.writeText(txt).then(()=>toast("Kopiert")).catch(()=>alert(txt));
}
function calcAll(){calcSchnitt();calcTol();calcFit();calcThread();calcScrew();calcReverse();calcWeight();solveAngle();updateActiveToolLive()}
function initHelpTips(){
  let pop = document.querySelector('.ws-help-pop');
  if(!pop){
    pop = document.createElement('div');
    pop.className = 'ws-help-pop';
    document.body.appendChild(pop);
  }
  let active = null;
  function place(el){
    const text = el.getAttribute('data-tip') || '';
    if(!text) return;
    active = el;
    pop.textContent = text;
    pop.classList.add('show');
    pop.style.left = '0px';
    pop.style.top = '0px';
    pop.style.setProperty('--arrow-left','22px');
    const r = el.getBoundingClientRect();
    const pw = pop.offsetWidth || 320;
    const ph = pop.offsetHeight || 80;
    const margin = 12;
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));
    let top = r.bottom + 10;
    if(top + ph > window.innerHeight - margin){
      top = Math.max(margin, r.top - ph - 10);
      pop.classList.add('above');
    } else {
      pop.classList.remove('above');
    }
    const arrow = Math.max(14, Math.min(pw - 22, r.left + r.width/2 - left - 6));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    pop.style.setProperty('--arrow-left', arrow + 'px');
  }
  function hide(el){
    if(el && active && el !== active) return;
    active = null;
    pop.classList.remove('show');
  }
  document.addEventListener('mouseover', e => { const el = e.target.closest?.('.help-dot[data-tip]'); if(el) place(el); });
  document.addEventListener('focusin', e => { const el = e.target.closest?.('.help-dot[data-tip]'); if(el) place(el); });
  document.addEventListener('mouseout', e => { const el = e.target.closest?.('.help-dot[data-tip]'); if(el && !el.contains(e.relatedTarget)) hide(el); });
  document.addEventListener('focusout', e => { const el = e.target.closest?.('.help-dot[data-tip]'); if(el) hide(el); });
  window.addEventListener('scroll', () => { if(active) place(active); }, true);
  window.addEventListener('resize', () => { if(active) place(active); });
}

function setupCutConsole(){
  cutConsoleInputIds().forEach(id=>{
    const el=$(id); if(!el) return;
    el.addEventListener('input',()=>{ setCutManual(el); calcAll(); });
  });
  syncConsoleFromHidden(true);
}

function init(){
  initHelpTips();
  setupCutConsole();
  $$(".fit-mode-btn").forEach(b=>b.onclick=()=>setFitMode(b.dataset.fitMode));
  $$(".tab-btn").forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
  $("btnTheme").onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==="dark"?"light":"dark"};
  $("btnHelp").onclick=()=>helpDialog.showModal();
  $$("input,select").forEach(e=>e.addEventListener("input",calcAll));
  $$("select").forEach(e=>e.addEventListener("change",calcAll));
  $("shapeType").addEventListener("change",updateShape);
  initThreads(); updateShape(); renderTolTable(); renderHistory(); if($("angA")) angleTyped($("angA")); if($("angB")) angleTyped($("angB")); calcAll();
  const hash=location.hash.replace("#",""); if(hash && $("tab-"+hash)) openTab(hash);
}
document.addEventListener("DOMContentLoaded",init);
