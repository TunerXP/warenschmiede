const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('tools/3d-druck-kostenrechner-plus/app.js', 'utf8');
const html = fs.readFileSync('tools/ws_3d_print_kostenrechner.html', 'utf8');
const css = fs.readFileSync('tools/3d-druck-kostenrechner-plus/app.css', 'utf8');
const application = source.slice(source.indexOf('const DEFAULT_CALCULATION_PROFILES')) + '\n;globalThis.testExports={DEFAULT_CALCULATION_PROFILES,cloneDefaultProfiles,app};';
const context = { console, setTimeout, clearTimeout, confirm: () => true, document: {}, window: {} };
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
  assert.match(css, /\.unit-input__control \{ padding-right:5\.5rem/);
  assert.match(html, /x-model\.number="job\.weight"/);
  assert.match(html, /x-model\.number="p\.marginPercent"/);
});
