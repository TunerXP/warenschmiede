const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pagePath = 'leistungen/eigene-konstruktionen.html';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('own-designs page presents the phone stand story and all five prepared images', () => {
  const html = read(pagePath);
  assert.match(html, /<h1>Eigene Konstruktionen &amp; 3D-Druck-Projekte<\/h1>/);
  assert.match(html, /Vom CAD-Modell zum fertigen Druck/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.warenschmiede\.com\/leistungen\/eigene-konstruktionen\.html"/);
  for (const name of [
    'phone-stand-01-fertiges-modell.jpg',
    'phone-stand-02-cad-modell.png',
    'phone-stand-03-cad-drahtansicht.png',
    'phone-stand-04-seitenansicht-masse.png',
    'phone-stand-05-isometrie-masse.png',
  ]) {
    assert.ok(html.includes(`/assets/img/3d-modelle/phone-stand/${name}`), `${name} fehlt`);
  }
  assert.match(html, /man lernt/i);
  assert.match(html, /MakerWorld/i);
});

test('own-designs hero uses the real print with compact CAD overlays instead of a generic background', () => {
  const html = read(pagePath);
  assert.match(html, /class="design-project-visual"/);
  assert.match(html, /class="design-project-visual__main"[^>]*phone-stand-01-fertiges-modell\.jpg/);
  assert.match(html, /class="design-project-visual__overlay design-project-visual__overlay--top"[^>]*phone-stand-02-cad-modell\.png/);
  assert.match(html, /class="design-project-visual__overlay design-project-visual__overlay--bottom"[^>]*phone-stand-04-seitenansicht-masse\.png/);
  assert.equal((html.match(/phone-stand-01-fertiges-modell\.jpg/g) || []).length, 1, 'fertiges Modell soll auf der Projektseite nur einmal dominant erscheinen');
  assert.doesNotMatch(html, /page-hero--cad design-project-hero/);
});

test('own-designs hero gives the text enough width and stays compact', () => {
  const html = read(pagePath);
  assert.match(html, /\.design-project-hero\{[^}]*grid-template-columns:minmax\(0,\.9fr\) minmax\(0,1\.1fr\)/);
  assert.match(html, /\.design-project-hero\{[^}]*min-height:0/);
  assert.match(html, /\.design-project-hero \.page-hero__content\{[^}]*width:100%/);
  assert.match(html, /\.design-project-hero \.page-hero__content\{[^}]*padding:0/);
  assert.match(html, /\.design-project-hero h1\{[^}]*max-width:none/);
  assert.match(html, /\.design-project-hero h1\{[^}]*font-size:clamp\(2\.1rem,2\.55vw,2\.8rem\)/);
  assert.match(html, /\.design-project-visual\{[^}]*width:min\(100%,620px\)/);
});

test('own-designs story is easier to read and the construction gallery stays compact', () => {
  const html = read(pagePath);
  assert.match(html, /\.design-story\{[^}]*font-size:1\.08rem/);
  assert.match(html, /\.design-gallery\{[^}]*max-width:900px/);
  assert.doesNotMatch(html, /<figcaption><strong>Fertiger 3D-Druck\./);
});

test('3D-print service links to the portfolio with the finished print image', () => {
  const html = read('leistungen/3d-druck.html');
  assert.ok(html.includes('eigene-konstruktionen.html'));
  assert.ok(html.includes('/assets/img/3d-modelle/phone-stand/phone-stand-01-fertiges-modell.jpg'));
});

test('CAD service links to the portfolio with the dimensioned side view', () => {
  const html = read('leistungen/cad-prototyping.html');
  assert.ok(html.includes('eigene-konstruktionen.html'));
  assert.ok(html.includes('/assets/img/3d-modelle/phone-stand/phone-stand-04-seitenansicht-masse.png'));
});
