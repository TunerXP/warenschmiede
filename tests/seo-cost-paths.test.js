const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const test = require('node:test');

test('SEO monitor uses the repository-relative calculator path', () => {
  const result = JSON.parse(execFileSync('python', ['-c', [
    'import json, seo_monitor',
    'print(json.dumps({"included": sorted(seo_monitor.INCLUDED_SITEMAP_PATHS), "files": seo_monitor.collect_html_files()}))'
  ].join(';')], { encoding: 'utf8' }));
  const currentPath = 'tools/ws_3d_print_kostenrechner.html';
  assert.ok(result.included.includes(currentPath));
  assert.ok(result.files.includes(currentPath));
  assert.equal(result.included.some(path => path.startsWith('/tools/')), false);
});

test('internal SEO scanner resolves the calculator relative to its tools folder', () => {
  const source = fs.readFileSync('tools/seo-scanner.html', 'utf8');
  assert.match(source, /'ws_3d_print_kostenrechner\.html'/);
  assert.doesNotMatch(source, /'\/tools\/ws_3d_print_kostenrechner\.html'/);
  assert.doesNotMatch(source, /3D_Druck_kostenrechner\.html/);
});
