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

test('sitemap contains the own-designs page', () => {
  const xml = read('sitemap.xml');
  assert.ok(xml.includes('https://www.warenschmiede.com/leistungen/eigene-konstruktionen.html'));
});
