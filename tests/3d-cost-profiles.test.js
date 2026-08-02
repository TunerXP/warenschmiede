const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('tools/3d-druck-kostenrechner-plus/app.js', 'utf8');
const html = fs.readFileSync('tools/ws_3d_print_kostenrechner.html', 'utf8');
const css = fs.readFileSync('tools/3d-druck-kostenrechner-plus/app.css', 'utf8');
const application = source.slice(source.indexOf('const DEFAULT_CALCULATION_PROFILES')) + '\n;globalThis.testExports={DEFAULT_CALCULATION_PROFILES,cloneDefaultProfiles,app};';
let nextTimerId = 0;
const timers = new Map();
const context = {
  console,
  setTimeout(callback) { const id=++nextTimerId; timers.set(id,callback); return id; },
  clearTimeout(id) { timers.delete(id); },
  confirm: () => true,
  document: {},
  window: {}
};
vm.runInNewContext(application, context);
const { DEFAULT_CALCULATION_PROFILES, cloneDefaultProfiles, app } = context.testExports;
const fresh = () => Object.assign(app(), { $nextTick(callback) { callback(); } });

test('calculation profile defaults are four deeply frozen canonical templates', () => {
  assert.deepEqual(Array.from(DEFAULT_CALCULATION_PROFILES, p => p.id), ['standard', 'hobby', 'business', 'express']);
  assert.deepEqual(JSON.parse(JSON.stringify(DEFAULT_CALCULATION_PROFILES)), [
    {id:'standard',name:'Standard Verkauf',marginPercent:35,laborMinutes:10,hourlyRate:50,failRate:5},
    {id:'hobby',name:'Selbstkosten / Hobby',marginPercent:10,laborMinutes:5,hourlyRate:25,failRate:3},
    {id:'business',name:'Gewerblich sauber',marginPercent:60,laborMinutes:15,hourlyRate:60,failRate:8},
    {id:'express',name:'Express / Einzelstück',marginPercent:85,laborMinutes:20,hourlyRate:70,failRate:10}
  ]);
  assert.equal(Object.isFrozen(DEFAULT_CALCULATION_PROFILES), true);
  assert.equal(DEFAULT_CALCULATION_PROFILES.every(Object.isFrozen), true);
  const clones = cloneDefaultProfiles();
  assert.notEqual(clones[0], DEFAULT_CALCULATION_PROFILES[0]);
  assert.equal(Object.isFrozen(clones[0]), false);
});

test('built-ins are added without overwriting modified or custom profiles and jobs', () => {
  const state = fresh();
  const custom = {id:'mine',name:'Mein Profil',marginPercent:1,laborMinutes:2,hourlyRate:3,failRate:4};
  const modified = {id:'standard',name:'Mein Standard',marginPercent:'35',laborMinutes:10,hourlyRate:50,failRate:5};
  const job = {profileId:'standard',weight:99,marginPercent:77};
  state.presets.profiles = [modified, custom]; state.jobs = [job];
  state.ensureBuiltInProfiles();
  assert.equal(state.presets.profiles.length, 5);
  assert.equal(state.presets.profiles[0], modified);
  assert.equal(state.presets.profiles[1], custom);
  assert.deepEqual(state.jobs[0], job);
  assert.equal(state.isProfileModified({...DEFAULT_CALCULATION_PROFILES[0], marginPercent:'35'}), false);
  assert.equal(state.profileStatus(modified), 'Angepasst');
  assert.equal(state.profileStatus(custom), 'Eigenes Profil');
});

test('single reset restores only its built-in and never changes jobs', () => {
  const state = fresh(); state.seed();
  const standard = state.presets.profiles[0]; const hobby = state.presets.profiles[1];
  standard.name='Anders'; standard.marginPercent=99; hobby.marginPercent=12;
  state.jobs=[{profileId:'standard',marginPercent:88,laborMinutes:44,hourlyRate:22,failRate:11,weight:123,time:9}];
  state.resetProfile(standard);
  assert.deepEqual(JSON.parse(JSON.stringify(standard)), JSON.parse(JSON.stringify(DEFAULT_CALCULATION_PROFILES[0])));
  assert.equal(hobby.marginPercent, 12);
  assert.equal(state.jobs[0].marginPercent, 88);
  assert.match(state.settingsNotice, /wurde zurückgesetzt/);
});

test('position feedback is scoped, replaces its timer and handles missing profiles', () => {
  timers.clear();
  const state = fresh(); state.seed();
  const jobA={id:'a',profileId:'standard',weight:123,time:4,marginPercent:0,laborMinutes:0,hourlyRate:0,failRate:0};
  const jobB={id:'b',profileId:'standard',marginPercent:9};
  state.jobs=[jobA,jobB];
  state.reapplyProfile(jobA);
  assert.equal(state.positionNoticeJobId, jobA.id);
  assert.match(state.positionNoticeText, /in diese Position/);
  assert.equal(state.settingsNotice, '');
  assert.equal(timers.size, 1);
  state.reapplyProfile(jobB);
  assert.equal(state.positionNoticeJobId, jobB.id);
  assert.equal(timers.size, 1);
  const before={...jobA};
  jobA.profileId='missing';
  state.reapplyProfile(jobA);
  assert.equal(state.positionNoticeJobId, jobA.id);
  assert.equal(state.positionNoticeText, 'Das ausgewählte Profil wurde nicht gefunden.');
  assert.deepEqual({...jobA,profileId:before.profileId}, before);
  assert.equal(timers.size, 1);
});

test('profile UI provides statuses, safe actions, direct navigation and unit fields', () => {
  for (const text of ['Zurücksetzen', 'Profilwerte neu übernehmen']) assert.match(html, new RegExp(text));
  assert.ok(html.includes('openProfileSettings(job)'));
  for (const text of ['Standard', 'Angepasst', 'Eigenes Profil']) assert.match(source, new RegExp(text));
  assert.match(html, /x-show="isBuiltInProfile\(p\)"[\s\S]*resetProfile\(p\)/);
  assert.match(html, /x-show="!isBuiltInProfile\(p\)"[\s\S]*removeProfile\(p\)/);
  assert.match(html, /:id="'cost-profile-'\+p\.id"/);
  assert.match(source, /scrollIntoView\(/);
  assert.match(source, /highlightedProfileId/);
  assert.match(source, /element\.querySelector\('input'\)\?\.focus/);
  assert.equal((html.match(/unit-input__suffix" aria-hidden="true"/g) || []).length >= 21, true);
  assert.match(css, /\.unit-input \{ display:grid; grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(css, /\.unit-input__control \{[^}]*border:0[^}]*padding-right:\.65rem/);
  assert.match(css, /\.unit-input__suffix \{ position:static; transform:none; display:flex/);
  assert.doesNotMatch(css, /padding-right:5\.5rem|\.unit-input__suffix \{ position:absolute/);
  assert.match(css, /\.unit-input__suffix[^}]*white-space:nowrap/);
  assert.match(html, /minmax\(165px,185px\)[^\n]*kg CO₂\/kg/);
  assert.match(css, /@container \(max-width: 500px\)[\s\S]*cost-position-unit-grid/);
  assert.match(html, /positionNoticeText && positionNoticeJobId === job\.id/);
  assert.equal((html.match(/x-show="settingsNotice"/g)||[]).length, 1);
  assert.match(html, /x-model\.number="job\.weight"/);
  assert.match(html, /x-model\.number="p\.marginPercent"/);
});
