    const SETTINGS_KEY = 'ws_receipt_plus_settings_v1';
    const HISTORY_KEY = 'ws_receipt_plus_history_v1';
    const OLD_SETTINGS_KEY = 'quittung_company';
    const OLD_HISTORY_KEY = 'quittung_history';

    let items = [];
    let paymentMethod = 'Bar';
    let history = [];
    let companyData = {
      name: '', owner: '', street: '', zip: '', city: '', taxId: '',
      qrType: 'vcard', qrData: '', prefix: 'Q',
      useDefaultLegalText: true,
      legalText: 'Kein Ausweis von USt. gem. §19 UStG.'
    };

    const $ = (id) => document.getElementById(id);

    window.addEventListener('load', () => {
      loadState();
      renderSettings();
      renderItems();
      renderHistory();
      updateAll();
      updateDarkIcon();
      ['itemName','itemPrice','itemQty'].forEach(id => $(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); addItem(); }
      }));
      const liveFields = ['myCompany','myName','myStreet','myZip','myCity','myTaxId','receiptPrefix',
        'custName','custStreet','custZip','custCity','discount','smallBiz','legalText','useDefaultLegalText'];
      liveFields.forEach(id => {
        $(id)?.addEventListener('input', updateAll);
        $(id)?.addEventListener('change', updateAll);
      });
    });

    function loadState() {
      if (localStorage.getItem('receipt_dark') === '1') document.body.classList.add('dark');

      try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
        const old = JSON.parse(localStorage.getItem(OLD_SETTINGS_KEY) || 'null');
        companyData = { ...companyData, ...(saved || old || {}) };
        if (companyData.qrType === undefined) companyData.qrType = 'vcard';
        if (!companyData.prefix) companyData.prefix = 'Q';
        if (typeof companyData.useDefaultLegalText !== 'boolean') companyData.useDefaultLegalText = true;
        if (!companyData.legalText) companyData.legalText = 'Kein Ausweis von USt. gem. §19 UStG.';
      } catch (_) {}

      try {
        const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || 'null');
        const oldHistory = JSON.parse(localStorage.getItem(OLD_HISTORY_KEY) || 'null');
        history = Array.isArray(savedHistory) ? savedHistory : (Array.isArray(oldHistory) ? oldHistory : []);
        saveHistory();
      } catch (_) { history = []; }
    }

    function renderSettings() {
      $('myCompany').value = companyData.name || '';
      $('myName').value = companyData.owner || '';
      $('myStreet').value = companyData.street || '';
      $('myZip').value = companyData.zip || '';
      $('myCity').value = companyData.city || '';
      $('myTaxId').value = companyData.taxId || '';
      $('qrType').value = companyData.qrType || 'vcard';
      $('qrData').value = companyData.qrData || '';
      $('receiptPrefix').value = companyData.prefix || 'Q';
      $('useDefaultLegalText').checked = companyData.useDefaultLegalText !== false;
      $('legalText').value = companyData.legalText || 'Kein Ausweis von USt. gem. §19 UStG.';
      syncLegalTextField();
      updateCompanySummary();
    }

    function updateCompanySummary() {
      const parts = [];
      if (companyData.name) parts.push(companyData.name);
      if (companyData.owner) parts.push(companyData.owner);
      if (companyData.city) parts.push(companyData.city);
      $('companySummary').textContent = parts.length ? parts.join(' · ') : 'Absender einmal eintragen';
    }

    function saveSettings(showMessage = true) {
      companyData = {
        name: $('myCompany').value.trim(), owner: $('myName').value.trim(), street: $('myStreet').value.trim(),
        zip: $('myZip').value.trim(), city: $('myCity').value.trim(), taxId: $('myTaxId').value.trim(),
        qrType: $('qrType').value, qrData: $('qrData').value.trim(), prefix: ($('receiptPrefix').value.trim() || 'Q'),
        useDefaultLegalText: $('useDefaultLegalText').checked,
        legalText: $('legalText').value.trim() || 'Kein Ausweis von USt. gem. §19 UStG.'
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(companyData));
      updateCompanySummary();
      syncLegalTextField();
      if (showMessage) toast('Firmendaten gespeichert.');
    }

    function toggleDark() {
      document.body.classList.toggle('dark');
      localStorage.setItem('receipt_dark', document.body.classList.contains('dark') ? '1' : '0');
      updateDarkIcon();
    }

    function updateDarkIcon() { $('darkBtn').textContent = document.body.classList.contains('dark') ? '☀️' : '🌙'; }

    function togglePanel(id, btnId) {
      const el = $(id);
      const btn = $(btnId);
      el.classList.toggle('hidden');
      btn.textContent = el.classList.contains('hidden') ? 'Ausklappen' : 'Einklappen';
    }

    function parseMoney(value) {
      const normalized = String(value ?? '').replace(/\s/g,'').replace(',', '.');
      const num = Number(normalized);
      return Number.isFinite(num) ? num : NaN;
    }

    function money(value) {
      return (Number(value) || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    function addItem() {
      const name = $('itemName').value.trim();
      const price = parseMoney($('itemPrice').value);
      const qty = parseMoney($('itemQty').value || '1');
      if (!name) return alert('Bitte Artikelbeschreibung eingeben.');
      if (!Number.isFinite(price)) return alert('Bitte Preis eingeben. Komma ist erlaubt, z. B. 12,50.');
      if (!Number.isFinite(qty) || qty <= 0) return alert('Bitte gültige Menge eingeben.');
      items.push({ name, price, qty });
      $('itemName').value = '';
      $('itemPrice').value = '';
      $('itemQty').value = '1';
      $('itemName').focus();
      renderItems();
    }

    function removeItem(index) {
      items.splice(index, 1);
      renderItems();
    }

    function editItem(index) {
      const item = items[index];
      if (!item) return;
      $('itemName').value = item.name;
      $('itemPrice').value = String(item.price).replace('.', ',');
      $('itemQty').value = String(item.qty).replace('.', ',');
      items.splice(index, 1);
      renderItems();
      $('itemName').focus();
    }

    function renderItems() {
      const list = $('itemList');
      list.innerHTML = '';
      if (!items.length) {
        list.innerHTML = '<div class="muted tiny" style="padding:12px;text-align:center;border:1px dashed var(--line);border-radius:14px;">Noch keine Posten.</div>';
      }
      items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div>
            <strong>${escapeHTML(item.name)}</strong>
            <small>${escapeHTML(item.qty)} × ${money(item.price)}</small>
            <div class="item-actions">
              <button class="btn btn-small btn-light" onclick="editItem(${index})">Bearbeiten</button>
              <button class="btn btn-small btn-ghost" onclick="removeItem(${index})">Löschen</button>
            </div>
          </div>
          <div class="item-price">${money(item.price * item.qty)}</div>
        `;
        list.appendChild(div);
      });
      updateAll();
    }

    function calcTotals() {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discount = Math.max(0, parseMoney($('discount').value) || 0);
      const total = Math.max(0, subtotal - discount);
      return { subtotal, discount, total };
    }

    function updateAll() {
      const { discount, total } = calcTotals();
      $('heroTotal').textContent = money(total);
      $('summaryItems').textContent = items.length;
      $('summaryDiscount').textContent = money(discount);
      $('summaryPay').textContent = paymentMethod;
      $('summaryTotal').textContent = money(total);
      $('itemCount').textContent = items.length === 1 ? '1 Posten' : `${items.length} Posten`;
      renderPreview();
    }

    function currentCompanyData() {
      return {
        name: $('myCompany')?.value.trim() || '', owner: $('myName')?.value.trim() || '',
        street: $('myStreet')?.value.trim() || '', zip: $('myZip')?.value.trim() || '',
        city: $('myCity')?.value.trim() || '', taxId: $('myTaxId')?.value.trim() || '',
        prefix: $('receiptPrefix')?.value.trim() || 'Q',
        legalText: $('legalText')?.value.trim() || 'Kein Ausweis von USt. gem. §19 UStG.'
      };
    }

    function getReceiptData() {
      return {
        company: currentCompanyData(),
        customer: {
          name: $('custName')?.value.trim() || '', street: $('custStreet')?.value.trim() || '',
          zip: $('custZip')?.value.trim() || '', city: $('custCity')?.value.trim() || ''
        },
        items: items.map(item => ({ ...item, lineTotal: item.price * item.qty })),
        totals: calcTotals(), paymentMethod, isSmallBiz: $('smallBiz')?.checked !== false,
        receiptNo: receiptNumber(), date: new Date()
      };
    }

    function renderPreview() {
      const target = $('receiptContent');
      if (!target) return;
      const data = getReceiptData();
      const { company, customer, totals } = data;
      const companyLines = [company.owner && `Inh. ${company.owner}`, company.street,
        `${company.zip} ${company.city}`.trim(), company.taxId && `St-Nr/USt-ID: ${company.taxId}`].filter(Boolean);
      const customerLines = [customer.name, customer.street, `${customer.zip} ${customer.city}`.trim()].filter(Boolean);
      const itemRows = data.items.length ? data.items.map(item => `
        <div class="receipt-item">
          <div class="receipt-item-name">${escapeHTML(item.name)}</div>
          <div class="receipt-item-detail"><span>${escapeHTML(String(item.qty).replace('.', ','))} × ${money(item.price)}</span><strong>${money(item.lineTotal)}</strong></div>
        </div>`).join('') : '<div class="receipt-empty">Noch keine Posten</div>';
      const discountRows = totals.discount > 0 ? `
        <div class="receipt-total-row"><span>Zwischensumme</span><span>${money(totals.subtotal)}</span></div>
        <div class="receipt-total-row"><span>Rabatt</span><span>− ${money(totals.discount)}</span></div>` : '';
      const taxNote = data.isSmallBiz ? company.legalText : `Enthält 19 % MwSt.: ${money(totals.total - totals.total / 1.19)}`;
      target.innerHTML = `
        <header class="receipt-brand"><h2>${escapeHTML(company.name || 'Firma')}</h2>${companyLines.map(line => `<p>${escapeHTML(line)}</p>`).join('')}</header>
        <div class="receipt-title">QUITTUNG</div>
        <div class="receipt-meta"><span><span class="receipt-label">Datum</span><br>${data.date.toLocaleDateString('de-DE')}</span><span><span class="receipt-label">Beleg-Nr.</span><br>${escapeHTML(data.receiptNo)}</span></div>
        ${customerLines.length ? `<section class="receipt-customer"><span class="receipt-label">Kunde</span>${customerLines.map(line => `<p>${escapeHTML(line)}</p>`).join('')}</section>` : ''}
        <section class="receipt-items">${itemRows}</section>
        <section class="receipt-totals">${discountRows}<div class="receipt-total-row receipt-grand"><span>GESAMT</span><span>${money(totals.total)}</span></div></section>
        <p class="receipt-note">Bezahlt mit: <strong>${escapeHTML(data.paymentMethod)}</strong></p>
        <p class="receipt-note">${escapeHTML(taxNote)}</p>
        <footer class="receipt-thanks">Vielen Dank für Ihren Einkauf!</footer>`;
    }

    function togglePreview() {
      const stage = $('receiptPreview');
      const button = $('previewToggle');
      const open = stage.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? 'Vorschau ausblenden' : 'Vorschau anzeigen';
    }

    function setPay(method) {
      paymentMethod = method;
      $('payBar').classList.toggle('active', method === 'Bar');
      $('payPaypal').classList.toggle('active', method === 'PayPal');
      $('payBank').classList.toggle('active', method === 'Überweisung');
      updateAll();
    }

    function receiptNumber() {
      const now = new Date();
      const y = now.getFullYear();
      const mo = String(now.getMonth()+1).padStart(2,'0');
      const d = String(now.getDate()).padStart(2,'0');
      const h = String(now.getHours()).padStart(2,'0');
      const mi = String(now.getMinutes()).padStart(2,'0');
      const prefix = $('receiptPrefix')?.value.trim() || companyData.prefix || 'Q';
      return `${prefix}-${y}${mo}${d}-${h}${mi}`;
    }

    function createPDFDoc() {
      if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('PDF-Bibliothek konnte nicht geladen werden.');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: [80, 250] });
      const receiptData = getReceiptData();
      const { company, customer, totals, isSmallBiz, date: now, receiptNo: docNum } = receiptData;
      const { subtotal, discount, total } = totals;
      let y = 10;
      const lineH = 4;
      const centerX = 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(company.name || 'Firma', centerX, y, { align: 'center' }); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      if (company.owner) { doc.text(`Inh. ${company.owner}`, centerX, y, { align:'center' }); y += lineH; }
      if (company.street) { doc.text(company.street, centerX, y, { align:'center' }); y += lineH; }
      if (company.zip || company.city) { doc.text(`${company.zip || ''} ${company.city || ''}`.trim(), centerX, y, { align:'center' }); y += lineH; }
      if (company.taxId) { doc.text(`St-Nr/USt-ID: ${company.taxId}`, centerX, y, { align:'center' }); y += lineH + 2; }

      doc.line(5, y, 75, y); y += 5;
      doc.text(`Datum: ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}`, 5, y); y += lineH;
      doc.text(`Beleg-Nr: ${docNum}`, 5, y); y += lineH + 2;

      const cName = customer.name;
      if (cName) {
        doc.setFont('helvetica', 'bold'); doc.text('Kunde:', 5, y); y += lineH;
        doc.setFont('helvetica', 'normal'); doc.text(cName, 5, y); y += lineH;
        const street = customer.street;
        const cityLine = `${customer.zip} ${customer.city}`.trim();
        if (street) { doc.text(street, 5, y); y += lineH; }
        if (cityLine) { doc.text(cityLine, 5, y); y += lineH; }
        y += 2;
      }

      doc.line(5, y, 75, y); y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Pos', 5, y); doc.text('Preis', 75, y, { align:'right' }); y += lineH;
      doc.setFont('helvetica', 'normal');
      items.forEach(item => {
        const lineTotal = item.price * item.qty;
        const qtyText = String(item.qty).replace('.', ',');
        const unitText = money(item.price).replace(' €',' EUR');
        const text = `${qtyText}x ${item.name} à ${unitText}`;
        const lines = doc.splitTextToSize(text, 50);
        doc.text(lines, 5, y);
        doc.text(money(lineTotal).replace(' €',' EUR'), 75, y, { align:'right' });
        y += lines.length * lineH + 1;
      });

      if (discount > 0) {
        y += 1;
        doc.text('Zwischensumme:', 5, y); doc.text(money(subtotal).replace(' €',' EUR'), 75, y, { align:'right' }); y += lineH;
        doc.text('Rabatt:', 5, y); doc.text('-' + money(discount).replace(' €',' EUR'), 75, y, { align:'right' }); y += lineH;
      }

      doc.line(5, y, 75, y); y += 5;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('GESAMT', 5, y); doc.text(money(total).replace(' €',' EUR'), 75, y, { align:'right' }); y += 6;
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      if (isSmallBiz) doc.text(company.legalText, centerX, y, { align:'center' });
      else {
        const net = total / 1.19;
        const tax = total - net;
        doc.text(`Enthält 19% MwSt: ${money(tax).replace(' €',' EUR')}`, centerX, y, { align:'center' });
      }
      y += lineH;
      doc.setFontSize(8);
      doc.text(`Bezahlt mit: ${paymentMethod}`, 5, y); y += 8;

      if (companyData.qrType !== 'none' && companyData.qrData) {
        let qrValue = '';
        let qrLabel = '';
        if (companyData.qrType === 'paypal') {
          qrValue = `https://paypal.me/${companyData.qrData}/${total.toFixed(2)}EUR`;
          qrLabel = 'PayPal Scan';
        } else {
          qrValue = `BEGIN:VCARD\nVERSION:3.0\nFN:${companyData.name || companyData.owner}\nTEL:${companyData.qrData}\nEND:VCARD`;
          qrLabel = 'Kontakt';
        }
        const qr = new QRious({ element: $('qrCanvas'), value: qrValue, size: 180 });
        doc.addImage(qr.toDataURL(), 'JPEG', 30, y, 20, 20);
        y += 22;
        doc.setFontSize(6);
        doc.text(qrLabel, centerX, y, { align:'center' });
        y += 5;
      }

      doc.text('Vielen Dank für Ihren Einkauf!', centerX, y, { align:'center' });
      return { doc, filename: `Quittung_${docNum}.pdf`, total, docNum };
    }

    function generatePDF(mode = 'download') {
      if (!items.length) return alert('Keine Posten auf der Quittung.');
      try {
        saveSettings(false);
        const { doc, filename, total, docNum } = createPDFDoc();
        doc.save(filename);
        saveToHistory(total, docNum);
        askClearAfterReceipt('PDF wurde erstellt.');
      } catch (err) { alert(err.message); }
    }

    async function sharePDF() {
      if (!items.length) return alert('Keine Posten auf der Quittung.');
      try {
        saveSettings(false);
        const { doc, filename, total, docNum } = createPDFDoc();
        const blob = doc.output('blob');
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Quittung', text: 'Hier ist Ihre Quittung.' });
          saveToHistory(total, docNum);
          askClearAfterReceipt('Quittung geteilt.');
        } else {
          doc.save(filename);
          saveToHistory(total, docNum);
          alert('Teilen wird auf diesem Gerät nicht unterstützt. PDF wurde gespeichert.');
          askClearAfterReceipt('PDF wurde erstellt.');
        }
      } catch (err) {
        if (String(err.name) !== 'AbortError') alert('Teilen fehlgeschlagen: ' + err.message);
      }
    }

    function saveToHistory(total, docNum) {
      const entry = {
        id: Date.now().toString(), receiptNo: docNum, date: new Date().toISOString(),
        custName: $('custName').value.trim(), custStreet: $('custStreet').value.trim(), custZip: $('custZip').value.trim(), custCity: $('custCity').value.trim(),
        items: structuredClone(items), discount: $('discount').value, paymentMethod, isSmallBiz: $('smallBiz').checked, total
      };
      history.push(entry);
      saveHistory();
      renderHistory();
    }

    function saveHistory() { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }

    function renderHistory() {
      const list = $('historyList');
      list.innerHTML = '';
      const sorted = [...history].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
      if (!sorted.length) {
        list.innerHTML = '<div class="muted tiny" style="padding:12px;text-align:center;border:1px dashed var(--line);border-radius:14px;">Noch kein Verlauf.</div>';
        return;
      }
      sorted.forEach(e => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div><strong>${escapeHTML(e.custName || 'Laufkunde')}</strong><small>${new Date(e.date).toLocaleString('de-DE')} · ${money(e.total || 0)} · ${escapeHTML(e.receiptNo || '')}</small></div>
          <div class="history-actions"><button class="btn btn-small btn-light" onclick="loadHistory('${e.id}')">Laden</button><button class="btn btn-small btn-ghost" onclick="deleteHistory('${e.id}')">Löschen</button></div>
        `;
        list.appendChild(div);
      });
    }

    function loadHistory(id) {
      const e = history.find(x => String(x.id) === String(id));
      if (!e) return;
      if (!confirm('Aktuelles Formular mit Verlaufseintrag überschreiben?')) return;
      $('custName').value = e.custName || '';
      $('custStreet').value = e.custStreet || '';
      $('custZip').value = e.custZip || '';
      $('custCity').value = e.custCity || '';
      items = structuredClone(e.items || []);
      $('discount').value = e.discount || '0';
      $('smallBiz').checked = e.isSmallBiz !== false;
      setPay(e.paymentMethod || 'Bar');
      renderItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteHistory(id) {
      if (!confirm('Verlaufseintrag löschen?')) return;
      history = history.filter(x => String(x.id) !== String(id));
      saveHistory();
      renderHistory();
    }

    function downloadBackup() {
      saveSettings();
      const data = { app: 'Quittungs-Werkstatt', version: 1, created: new Date().toISOString(), settings: companyData, history };
      const stamp = new Date().toISOString().slice(0,19).replace('T','_').replaceAll(':','-');
      downloadText(`quittungs_werkstatt_backup_${stamp}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
    }

    function restoreBackup(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!confirm('Backup laden? Aktuelle Firmendaten und Verlauf werden ersetzt.')) return;
          companyData = { ...companyData, ...(data.settings || {}) };
          history = Array.isArray(data.history) ? data.history : [];
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(companyData));
          saveHistory();
          renderSettings();
          renderHistory();
          toast('Backup geladen.');
        } catch (err) { alert('Backup konnte nicht geladen werden.'); }
        finally { input.value = ''; }
      };
      reader.readAsText(file);
    }

    function downloadText(filename, text, type) {
      const blob = new Blob([text], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function resetFormOnly(ask = true) {
      if (ask && !confirm('Kunde, Posten, Rabatt und Zahlart zurücksetzen?')) return;
      $('custName').value = ''; $('custStreet').value = ''; $('custZip').value = ''; $('custCity').value = '';
      items = [];
      $('discount').value = '0';
      setPay('Bar');
      renderItems();
    }

    function askClearAfterReceipt(message) {
      const shouldClear = confirm(`${message}

Formular für die nächste Quittung leeren?`);
      if (shouldClear) resetFormOnly(false);
      else toast(message);
    }

    function syncLegalTextField() {
      const useDefault = $('useDefaultLegalText')?.checked;
      const input = $('legalText');
      if (!input) return;
      input.readOnly = !!useDefault;
      input.style.opacity = useDefault ? '0.62' : '1';
      input.style.background = useDefault ? 'var(--soft)' : 'var(--card)';
      if (useDefault) input.value = 'Kein Ausweis von USt. gem. §19 UStG.';
    }

    function legalTextEnter(event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      $('useDefaultLegalText').checked = true;
      saveSettings(false);
      toast('Rechtstext übernommen und gesperrt.');
    }

    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    }

    function toast(msg) {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.bottom = 'calc(92px + env(safe-area-inset-bottom, 0px))';
      el.style.transform = 'translateX(-50%)';
      el.style.background = '#0f172a';
      el.style.color = '#fff';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '999px';
      el.style.zIndex = '300';
      el.style.boxShadow = '0 12px 30px rgba(0,0,0,.22)';
      el.style.fontWeight = '900';
      el.style.fontSize = '.88rem';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2100);
    }
