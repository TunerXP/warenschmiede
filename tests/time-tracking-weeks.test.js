const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('tools/zeiterfassung-plus/app.js','utf8');
const noop=()=>{};
const element=()=>({value:'',checked:false,disabled:false,dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},addEventListener:noop,focus:noop,setAttribute:noop,appendChild:noop,innerHTML:'',textContent:''});
function make(){ const elements=new Proxy({}, {get:(o,k)=>o[k]??=element()}); const document={getElementById:id=>elements[id],querySelectorAll:()=>[],createElement:element,body:{classList:{toggle:noop},appendChild:noop},activeElement:null,addEventListener:noop}; const localStorage={getItem:()=>null,setItem:noop}; const s={document,localStorage,window:{addEventListener:noop},Date,Math,JSON,Number,String,Set,Map,Blob:function(){},URL:{createObjectURL:noop,revokeObjectURL:noop},setTimeout:noop,confirm:()=>true,alert:noop,console}; vm.createContext(s);vm.runInContext(source,s);return s; }
const plain=value=>JSON.parse(JSON.stringify(value));

test('ISO-Wochen reichen korrekt von Montag bis Sonntag über Monats- und Jahresgrenzen',()=>{const s=make();assert.deepEqual(plain(s.getIsoWeekInfo('2026-07-27')),{year:2026,week:31});assert.deepEqual(plain(s.getIsoWeekInfo('2026-08-02')),{year:2026,week:31});assert.deepEqual(plain(s.getIsoWeekRange(2026,31)),{start:'2026-07-27',end:'2026-08-02'});assert.deepEqual(plain(s.getIsoWeekInfo('2026-12-31')),{year:2026,week:53});assert.deepEqual(plain(s.getIsoWeekInfo('2027-01-03')),{year:2026,week:53});});

test('Wochen summieren vorhandene duration aus beiden Monaten ohne Mutation',()=>{const s=make();const entries=[{date:'2026-07-31',duration:120,pause:99},{date:'2026-08-01',duration:180,pause:1}];const before=JSON.stringify(entries);const weeks=s.buildWeekSummaries(entries,'2026-08');assert.equal(weeks[0].start,'2026-07-27');assert.equal(weeks[0].actualMinutes,300);assert.equal(JSON.stringify(entries),before);});

test('Monatshinweis priorisiert früheren Monat, danach späteren, und mutiert nicht',()=>{const s=make();const entries=[...Array.from({length:5},(_,i)=>({date:`2026-07-${String(i+1).padStart(2,'0')}`})),{date:'2026-09-01'}];const before=JSON.stringify(entries);assert.deepEqual(plain(s.findNearbyPopulatedMonth(entries,'2026-08')),{month:'2026-07',count:5});assert.deepEqual(plain(s.findNearbyPopulatedMonth([{date:'2026-09-01'}],'2026-08')),{month:'2026-09',count:1});assert.equal(s.findNearbyPopulatedMonth([],'2026-08'),null);assert.equal(JSON.stringify(entries),before);});

test('Differenzen tragen eindeutige Vorzeichen',()=>{const s=make();assert.equal(s.formatDifference(150),'+02:30 h');assert.equal(s.formatDifference(-195),'−03:15 h');assert.equal(s.formatDifference(0),'±00:00 h');});
