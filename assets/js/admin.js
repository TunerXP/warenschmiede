(() => {
  'use strict';
  const state = { inventory: null, sitemap: new Set(), seo: [], seoScanned: false, downloads: [], release: null, warnings: [] };
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
  const PAGE_CATEGORIES = Object.freeze({
    public: 'Öffentliche Seite', tool: 'Tool', legal: 'Rechtliches', document: 'Dokument',
    technical: 'Technisch', legacy: 'Legacy', admin: 'Admin'
  });
  const EXCLUDED_CATEGORIES = new Set(['document', 'technical', 'admin']);
  const SEVERITY_ORDER = Object.freeze({ excluded: -1, ok: 0, info: 1, warning: 2, error: 3 });

  function normalizePath(path) { return path.replace(/^\/+/, '').replace(/\\/g, '/'); }
  function classifyPage(path) {
    const normalized = normalizePath(path).toLowerCase();
    if (normalized === 'admin/index.html' || normalized.startsWith('admin/')) return 'admin';
    if (normalized.startsWith('docs/')) return 'document';
    if (['datenschutz.html', 'kontakt/impressum.html'].includes(normalized)) return 'legal';
    if (normalized === 'tools/zeiterfassung.html' || /(^|\/)zeiterfassung[-_](alt|legacy)(\/|\.|$)/.test(normalized)) return 'legacy';
    if (normalized === '404.html' || /(^|\/)(selftest|ergebnis|rechnung|angebot)([-_][^/]*)?\.html$/.test(normalized)) return 'technical';
    if (normalized.startsWith('tools/')) return 'tool';
    return 'public';
  }
  function isSeoRelevant(page) { return !EXCLUDED_CATEGORIES.has(page.category); }
  function issue(severity, message) { return { severity, message }; }
  function highestSeverity(issues) {
    return issues.reduce((highest, current) => SEVERITY_ORDER[current.severity] > SEVERITY_ORDER[highest] ? current.severity : highest, 'ok');
  }
  function evaluateSeo(page) {
    if (!isSeoRelevant(page)) {
      return { ...page, issues: [issue('excluded', `${PAGE_CATEGORIES[page.category]} / SEO nicht relevant`)], severity: 'excluded' };
    }
    const primaryCategory = page.category === 'public' || page.category === 'tool';
    const secondarySeverity = primaryCategory ? 'warning' : 'info';
    const issues = [];
    if (!page.title) issues.push(issue(primaryCategory ? 'error' : 'info', 'Title fehlt'));
    if (!page.noindex) {
      if (!page.description) issues.push(issue(secondarySeverity, 'Description fehlt'));
      if (!page.h1) issues.push(issue(secondarySeverity, 'H1 fehlt'));
      if (!page.og) issues.push(issue(secondarySeverity, 'og:image fehlt'));
      if (!page.inSitemap) issues.push(issue(secondarySeverity, 'Nicht in Sitemap'));
    }
    return { ...page, issues, severity: highestSeverity(issues) };
  }

  function summary() {
    const html = inventoryList('html'), images = inventoryList('images');
    const documents = inventoryList('documents', 'docs'), downloads = inventoryList('downloads');
    const scanValue = value => state.seoScanned ? value : null;
    return { html: html.length, images: images.length, documents: documents.length + downloads.length,
      sitemap: state.sitemap.size,
      indexable: scanValue(state.seo.filter(item => isSeoRelevant(item) && !item.noindex).length),
      noindex: scanValue(state.seo.filter(item => isSeoRelevant(item) && item.noindex).length),
      warnings: scanValue(state.seo.filter(item => item.severity === 'warning').length),
      errors: scanValue(state.seo.filter(item => item.severity === 'error').length),
      info: scanValue(state.seo.filter(item => item.severity === 'info').length),
      excluded: scanValue(state.seo.filter(item => item.severity === 'excluded').length) };
  }

  function renderStats() {
    const values = summary();
    const labels = { html: 'HTML-Seiten', images: 'Bilder', documents: 'Dokumente / öffentliche Dateien', sitemap: 'Sitemap-URLs', indexable: 'Indexierbare Seiten', noindex: 'Noindex-Seiten', errors: 'SEO-Fehler', warnings: 'SEO-Warnungen', info: 'SEO-Hinweise', excluded: 'Vom SEO-Scan ausgenommen' };
    $('#stats').innerHTML = Object.entries(labels).map(([key, label]) => `<article class="stat"><strong>${values[key] === null ? '–' : escapeHtml(values[key])}</strong><span>${escapeHtml(label)}${values[key] === null ? '<br>Noch nicht geprüft' : ''}</span></article>`).join('');
  }

  function resetSeoScan() {
    state.seo = [];
    state.seoScanned = false;
    $('#seo-scan-state').textContent = 'SEO-Scan noch nicht durchgeführt.';
    $('#seo-body').innerHTML = '<tr><td colspan="9">Scan noch nicht gestartet.</td></tr>';
    renderStats();
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

  async function scanSeo() {
    const pages = inventoryList('html');
    if (!pages.length) return setNotice('Keine HTML-Seiten im Inventory gefunden.', true);
    $('#scan-seo').disabled = true; setNotice(`SEO-Scan für ${pages.length} Seiten läuft …`);
    state.seoScanned = false;
    state.seo = await Promise.all(pages.map(async path => {
      const category = classifyPage(path);
      try {
        const doc = new DOMParser().parseFromString(await fetchText(siteUrl(path)), 'text/html');
        const page = {
          path, category,
          title: doc.querySelector('title')?.textContent.trim() || '',
          description: doc.querySelector('meta[name="description"]')?.content.trim() || '',
          h1: doc.querySelector('h1')?.textContent.trim() || '',
          robots: doc.querySelector('meta[name="robots"]')?.content || '',
          og: doc.querySelector('meta[property="og:image"]')?.content || '',
          inSitemap: state.sitemap.has(normalizePath(path))
        };
        page.noindex = /noindex/i.test(page.robots);
        return evaluateSeo(page);
      } catch (error) {
        const page = { path, category, title: '', description: '', h1: '', robots: '', og: '', noindex: false, inSitemap: false };
        if (!isSeoRelevant(page)) return { ...page, issues: [issue('excluded', `${PAGE_CATEGORIES[category]} / SEO nicht relevant (nicht lesbar)`)], severity: 'excluded' };
        return { ...page, issues: [issue('error', `Nicht lesbar: ${error.message}`)], severity: 'error' };
      }
    }));
    state.seoScanned = true;
    $('#scan-seo').disabled = false;
    $('#seo-scan-state').textContent = `SEO-Scan abgeschlossen: ${pages.length} Seiten geprüft und klassifiziert.`;
    setNotice('SEO-Scan abgeschlossen. Die Übersicht wurde aktualisiert.'); renderSeo(); renderStats();
  }

  function renderSeo() {
    if (!state.seoScanned) return;
    const query = $('#seo-search').value.toLowerCase(), filter = $('#seo-filter').value;
    const rows = state.seo.filter(item => item.path.toLowerCase().includes(query) && (filter === 'all' || (filter === 'noindex' ? item.noindex : item.severity === filter)));
    $('#seo-body').innerHTML = rows.length ? rows.map(item => `<tr><td><a href="${escapeHtml(siteUrl(item.path))}" target="_blank" rel="noopener">${escapeHtml(item.path)}</a></td><td class="category-label">${escapeHtml(PAGE_CATEGORIES[item.category])}</td><td class="status-${item.severity}">${item.severity === 'ok' ? 'OK' : escapeHtml(item.issues.map(i => i.message).join(', '))}</td><td>${item.title ? '✓' : '–'}</td><td>${item.description ? '✓' : '–'}</td><td>${item.h1 ? '✓' : '–'}</td><td>${item.noindex ? 'Noindex' : 'Index'}</td><td>${item.og ? '✓' : '–'}</td><td>${item.inSitemap ? '✓' : '–'}</td></tr>`).join('') : '<tr><td colspan="9">Keine passenden Ergebnisse.</td></tr>';
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
    const sitemapDifferences = state.seo.filter(item => item.issues.some(entry => entry.message === 'Nicht in Sitemap'));
    const counts = summary();
    return {
      reportType: 'warenschmiede-admin-diagnostic',
      reportGeneratedAt: new Date().toISOString(),
      inventoryGeneratedAt: state.inventory?.generatedAt || null,
      seoScanCompleted: state.seoScanned,
      counts,
      seoSummary: { errors: counts.errors, warnings: counts.warnings, info: counts.info, excluded: counts.excluded },
      seoEntries: state.seo.map(item => ({ path: item.path, category: item.category, severity: item.severity, issues: item.issues.map(entry => entry.message) })),
      actionableSitemapDifferences: sitemapDifferences.filter(item => item.issues.some(entry => entry.message === 'Nicht in Sitemap' && entry.severity === 'warning')).map(item => item.path),
      informationalSitemapDifferences: sitemapDifferences.filter(item => item.issues.some(entry => entry.message === 'Nicht in Sitemap' && entry.severity === 'info')).map(item => item.path),
      downloadChecks: state.downloads.map(({ name, path, status }) => ({ name, path, status })),
      zeiterfassungPlusRelease: state.release,
      technicalWarnings: [...new Set(state.warnings)]
    };
  }
  function showDiagnostic() { const value = JSON.stringify(diagnostic(), null, 2); $('#diagnostic-preview').value = value; return value; }
  function downloadDiagnostic() { const value = showDiagnostic(), blob = new Blob([value], { type: 'application/json' }), link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `warenschmiede-admin-diagnose-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); }

  $('#reload').addEventListener('click', () => { resetSeoScan(); return Promise.all([loadInventory(), loadSitemap(), loadDownloads(), loadRelease()]); });
  $('#scan-seo').addEventListener('click', scanSeo); $('#seo-search').addEventListener('input', renderSeo); $('#seo-filter').addEventListener('change', renderSeo);
  $('#image-search').addEventListener('input', renderImages); $('#image-filter').addEventListener('change', renderImages);
  $('#gallery').addEventListener('click', event => { const button = event.target.closest('[data-copy]'); if (button) navigator.clipboard.writeText(decodeURIComponent(button.dataset.copy)); });
  $('#check-downloads').addEventListener('click', checkDownloads); $('#download-diagnostic').addEventListener('click', downloadDiagnostic);
  $('#copy-diagnostic').addEventListener('click', async () => { await navigator.clipboard.writeText(showDiagnostic()); setNotice('Diagnosebericht wurde kopiert.'); });
  Promise.all([loadInventory(), loadSitemap(), loadDownloads(), loadRelease()]);
})();
