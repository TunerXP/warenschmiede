(() => {
  'use strict';
  const state = { inventory: null, sitemap: new Set(), seo: [], downloads: [], release: null, warnings: [] };
  const $ = selector => document.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const text = value => String(value ?? '–');
  const escapeHtml = value => text(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  const siteUrl = path => new URL(`../${path.replace(/^\//, '')}`, location.href).href;
  const setNotice = (message, error = false) => { $('#notice').textContent = message; $('#notice').classList.toggle('error', error); };

  $$('.admin-tabs button').forEach(button => button.addEventListener('click', () => {
    $$('.admin-tabs button,.tab-panel').forEach(element => element.classList.remove('active'));
    button.classList.add('active'); $(`#${button.dataset.tab}`).classList.add('active');
  }));

  async function fetchText(url, options) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  }

  function inventoryList(name, alias) { return state.inventory?.[name] || state.inventory?.[alias] || []; }
  function summary() {
    const html = inventoryList('html'), images = inventoryList('images');
    const documents = inventoryList('documents', 'docs'), downloads = inventoryList('downloads');
    const indexable = state.seo.filter(item => !item.noindex).length;
    const noindex = state.seo.filter(item => item.noindex).length;
    return { html: html.length, images: images.length, documents: documents.length + downloads.length,
      sitemap: state.sitemap.size, indexable, noindex,
      warnings: state.seo.filter(item => item.level === 'warning').length,
      errors: state.seo.filter(item => item.level === 'error').length };
  }

  function renderStats() {
    const values = summary();
    const labels = { html: 'HTML-Seiten', images: 'Bilder', documents: 'Dokumente / öffentliche Dateien', sitemap: 'Sitemap-URLs', indexable: 'Indexierbare Seiten', noindex: 'Noindex-Seiten', warnings: 'SEO-Warnungen', errors: 'SEO-Fehler' };
    $('#stats').innerHTML = Object.entries(labels).map(([key, label]) => `<article class="stat"><strong>${escapeHtml(values[key])}</strong><span>${escapeHtml(label)}</span></article>`).join('');
  }

  async function loadInventory() {
    try {
      state.inventory = JSON.parse(await fetchText(`./site_inventory.json?v=${Date.now()}`));
      $('#inventory-status').innerHTML = '<span class="status-ok">OK</span>';
      $('#inventory-time').textContent = state.inventory.generatedAt ? new Date(state.inventory.generatedAt).toLocaleString('de-DE') : 'Nicht angegeben';
      $('#inventory-generator').textContent = text(state.inventory.generator);
      setNotice('Deploy-Inventar erfolgreich geladen. Alle Funktionen arbeiten ausschließlich lesend.');
      renderImages();
    } catch (error) {
      state.inventory = null; state.warnings.push(`Inventory konnte nicht geladen werden: ${error.message}`);
      $('#inventory-status').innerHTML = '<span class="status-error">Fehler</span>';
      setNotice('Deploy-Inventar fehlt oder ist nicht erreichbar. Bitte das Uploadpaket erneut erstellen.', true);
    }
    renderStats();
  }

  async function loadSitemap() {
    try {
      const xml = new DOMParser().parseFromString(await fetchText('../sitemap.xml'), 'application/xml');
      state.sitemap = new Set($$('loc', xml).map(node => new URL(node.textContent).pathname.replace(/^\//, '') || 'index.html'));
    } catch (error) { state.warnings.push(`Sitemap konnte nicht geladen werden: ${error.message}`); }
    renderStats();
  }

  function technicalPage(path) { return path === 'admin/index.html' || /(^|\/)(404|selftest|ergebnis|rechnung|angebot)\.html$/i.test(path); }
  async function scanSeo() {
    const pages = inventoryList('html').filter(path => !technicalPage(path));
    if (!pages.length) return setNotice('Keine HTML-Seiten im Inventory gefunden.', true);
    $('#scan-seo').disabled = true; setNotice(`SEO-Scan für ${pages.length} Seiten läuft …`);
    state.seo = await Promise.all(pages.map(async path => {
      try {
        const doc = new DOMParser().parseFromString(await fetchText(siteUrl(path)), 'text/html');
        const title = doc.querySelector('title')?.textContent.trim() || '';
        const description = doc.querySelector('meta[name="description"]')?.content.trim() || '';
        const h1 = doc.querySelector('h1')?.textContent.trim() || '';
        const robots = doc.querySelector('meta[name="robots"]')?.content || '';
        const og = doc.querySelector('meta[property="og:image"]')?.content || '';
        const noindex = /noindex/i.test(robots); const inSitemap = state.sitemap.has(path);
        const issues = [];
        if (!title) issues.push({ type: 'error', message: 'Title fehlt' });
        if (!description && !noindex) issues.push({ type: 'warning', message: 'Description fehlt' });
        if (!h1 && !noindex) issues.push({ type: 'warning', message: 'H1 fehlt' });
        if (!og && !noindex) issues.push({ type: 'warning', message: 'og:image fehlt' });
        if (!inSitemap && !noindex) issues.push({ type: 'warning', message: 'Nicht in Sitemap' });
        return { path, title, description, h1, robots, og, noindex, inSitemap, issues, level: issues.some(i => i.type === 'error') ? 'error' : issues.length ? 'warning' : 'ok' };
      } catch (error) { return { path, title: '', description: '', h1: '', robots: '', og: '', noindex: false, inSitemap: false, issues: [{ type: 'error', message: `Nicht lesbar: ${error.message}` }], level: 'error' }; }
    }));
    $('#scan-seo').disabled = false; setNotice('SEO-Scan abgeschlossen. Die Übersicht wurde aktualisiert.'); renderSeo(); renderStats();
  }

  function renderSeo() {
    const query = $('#seo-search').value.toLowerCase(), filter = $('#seo-filter').value;
    const rows = state.seo.filter(item => item.path.toLowerCase().includes(query) && (filter === 'all' || (filter === 'noindex' ? item.noindex : item.level === filter)));
    $('#seo-body').innerHTML = rows.length ? rows.map(item => `<tr><td><a href="${escapeHtml(siteUrl(item.path))}" target="_blank" rel="noopener">${escapeHtml(item.path)}</a></td><td class="status-${item.level}">${item.level === 'ok' ? 'OK' : escapeHtml(item.issues.map(i => i.message).join(', '))}</td><td>${item.title ? '✓' : '–'}</td><td>${item.description ? '✓' : '–'}</td><td>${item.h1 ? '✓' : '–'}</td><td>${item.noindex ? 'Noindex' : 'Index'}</td><td>${item.og ? '✓' : '–'}</td><td>${item.inSitemap ? '✓' : '–'}</td></tr>`).join('') : '<tr><td colspan="8">Keine passenden Ergebnisse.</td></tr>';
  }

  function renderImages() {
    const query = $('#image-search').value.toLowerCase(), filter = $('#image-filter').value;
    const items = inventoryList('images').filter(path => { const ext = path.split('.').pop().toLowerCase(); return path.toLowerCase().includes(query) && (filter === 'all' || (filter === 'jpg' ? ['jpg', 'jpeg'].includes(ext) : ext === filter)); });
    $('#gallery').innerHTML = items.length ? items.map(path => `<article class="image-card"><div class="preview"><img src="${escapeHtml(siteUrl(path))}" alt="" loading="lazy"></div><div class="image-info"><strong>${escapeHtml(path.split('/').pop())}</strong><code>${escapeHtml(path)}</code><div class="image-actions"><button data-copy="${escapeHtml(encodeURIComponent(path))}">Pfad kopieren</button><a href="${escapeHtml(siteUrl(path))}" target="_blank" rel="noopener">Original öffnen</a></div></div></article>`).join('') : '<p>Keine passenden Bilder gefunden.</p>';
  }

  async function loadDownloads() {
    try {
      const doc = new DOMParser().parseFromString(await fetchText('../downloads.html'), 'text/html');
      const downloadsPage = new URL('../downloads.html', location.href);
      state.downloads = [...doc.querySelectorAll('a[href]')].filter(a => new URL(a.getAttribute('href'), downloadsPage).pathname.startsWith('/dateien/')).map(a => ({ name: a.textContent.trim() || a.getAttribute('href').split('/').pop(), path: new URL(a.getAttribute('href'), downloadsPage).pathname, status: 'Nicht geprüft' }));
    } catch (error) { state.warnings.push(`Downloadseite konnte nicht geladen werden: ${error.message}`); }
    renderDownloads();
  }

  async function checkDownloads() {
    $('#check-downloads').disabled = true;
    for (const item of state.downloads) {
      try { const response = await fetch(item.path, { method: 'HEAD', cache: 'no-store' }); item.status = response.ok ? 'Erreichbar' : response.status === 405 || response.status === 501 ? 'Nicht geprüft' : 'Nicht erreichbar'; }
      catch (_) { item.status = 'Nicht geprüft'; }
      renderDownloads();
    }
    $('#check-downloads').disabled = false;
  }
  function renderDownloads() { $('#download-body').innerHTML = state.downloads.length ? state.downloads.map(item => `<tr><td>${escapeHtml(item.name)}</td><td><a href="${escapeHtml(item.path)}" target="_blank" rel="noopener">${escapeHtml(item.path)}</a></td><td class="status-${item.status === 'Erreichbar' ? 'ok' : item.status === 'Nicht erreichbar' ? 'error' : 'warning'}">${escapeHtml(item.status)}</td></tr>`).join('') : '<tr><td colspan="3">Keine Links unter /dateien/ gefunden.</td></tr>'; }

  function selectReleaseFields(release) {
    if (!release || typeof release !== 'object' || Array.isArray(release)) return {};
    const allowedFields = ['displayVersion', 'version', 'versionCode', 'channel', 'status', 'apk', 'apkFile', 'apkPath', 'publishedAt', 'releaseDate', 'date'];
    return Object.fromEntries(allowedFields.filter(key => {
      const value = release[key];
      return ['string', 'number', 'boolean'].includes(typeof value) && String(value).trim() !== '';
    }).map(key => [key, release[key]]));
  }

  async function loadRelease() {
    try {
      state.release = selectReleaseFields(JSON.parse(await fetchText('/dateien/zeiterfassung-plus/release.json')));
      const safeFields = Object.entries(state.release);
      $('#release-details').innerHTML = '<div><dt>Ladestatus</dt><dd class="status-ok">Geladen</dd></div>' + safeFields.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    } catch (error) { state.warnings.push(`Release-Metadaten konnten nicht geladen werden: ${error.message}`); $('#release-details').innerHTML = '<div><dt>Status</dt><dd class="status-warning">Nicht verfügbar / nicht geprüft</dd></div>'; }
  }

  function diagnostic() {
    const mismatches = state.seo.filter(item => !item.noindex && !item.inSitemap).map(item => item.path);
    return { reportType: 'warenschmiede-admin-diagnostic', reportGeneratedAt: new Date().toISOString(), inventoryGeneratedAt: state.inventory?.generatedAt || null, counts: summary(), seoIssues: state.seo.filter(i => i.issues.length).map(i => ({ path: i.path, level: i.level, issues: i.issues.map(x => x.message) })), sitemapInventoryDifferences: mismatches, downloadChecks: state.downloads.map(({ name, path, status }) => ({ name, path, status })), zeiterfassungPlusRelease: state.release, technicalWarnings: [...new Set(state.warnings)] };
  }
  function showDiagnostic() { const value = JSON.stringify(diagnostic(), null, 2); $('#diagnostic-preview').value = value; return value; }
  function downloadDiagnostic() { const value = showDiagnostic(), blob = new Blob([value], { type: 'application/json' }), link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `warenschmiede-admin-diagnose-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); }

  $('#reload').addEventListener('click', () => Promise.all([loadInventory(), loadSitemap(), loadDownloads(), loadRelease()]));
  $('#scan-seo').addEventListener('click', scanSeo); $('#seo-search').addEventListener('input', renderSeo); $('#seo-filter').addEventListener('change', renderSeo);
  $('#image-search').addEventListener('input', renderImages); $('#image-filter').addEventListener('change', renderImages);
  $('#gallery').addEventListener('click', event => { const button = event.target.closest('[data-copy]'); if (button) navigator.clipboard.writeText(decodeURIComponent(button.dataset.copy)); });
  $('#check-downloads').addEventListener('click', checkDownloads); $('#download-diagnostic').addEventListener('click', downloadDiagnostic);
  $('#copy-diagnostic').addEventListener('click', async () => { await navigator.clipboard.writeText(showDiagnostic()); setNotice('Diagnosebericht wurde kopiert.'); });
  Promise.all([loadInventory(), loadSitemap(), loadDownloads(), loadRelease()]);
})();
