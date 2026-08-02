    const ENTRY_KEY = 'ws_time_entries_plus_v1';
    const SETTINGS_KEY = 'ws_time_settings_plus_v1';
    const OLD_KEY = 'workTimeEntries_v2';

    let entries = [];
    let settingsReturnFocus = null;
    let settings = {
      name: '',
      company: '',
      useDefaults: false,
      useNote: false,
      start: '07:00',
      end: '16:00',
      pause: 30,
      note: ''
    };

    const $ = (id) => document.getElementById(id);

    window.addEventListener('load', () => {
      loadData();
      initMonth();
      bindLiveDuration();
      render();
      configureToolMenu();
    });

    function todayISO() {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    }

    function currentMonthISO() {
      return todayISO().slice(0, 7);
    }

    function loadData() {
      try {
        const storedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
        if (storedSettings) settings = { ...settings, ...storedSettings };
      } catch (_) {}

      const plusRaw = localStorage.getItem(ENTRY_KEY);
      if (plusRaw) {
        try { entries = JSON.parse(plusRaw) || []; } catch (_) { entries = []; }
      } else {
        try {
          const old = JSON.parse(localStorage.getItem(OLD_KEY) || '[]');
          if (Array.isArray(old) && old.length) {
            entries = old.map(e => ({
              id: Number(e.id) || Date.now() + Math.floor(Math.random()*10000),
              date: e.date,
              start: e.start,
              end: e.end,
              pause: Number(e.pause) || 0,
              note: e.note || '',
              duration: Number.isFinite(Number(e.duration)) ? Number(e.duration) : calcDuration(e.start, e.end, Number(e.pause)||0)
            })).filter(e => e.date && e.start && e.end);
            saveEntries();
          }
        } catch (_) { entries = []; }
      }

      $('setName').value = settings.name;
      $('setCompany').value = settings.company;
      $('setUseDefaults').checked = !!settings.useDefaults;
      $('setUseNote').checked = !!settings.useNote;
      $('setStart').value = settings.start;
      $('setEnd').value = settings.end;
      $('setPause').value = settings.pause;
      $('setNote').value = settings.note;
      syncOptionVisibility();
    }

    function saveEntries() {
      localStorage.setItem(ENTRY_KEY, JSON.stringify(entries));
    }

    function saveSettings() {
      settings = {
        name: $('setName').value.trim(),
        company: $('setCompany').value.trim(),
        useDefaults: $('setUseDefaults').checked,
        useNote: $('setUseNote').checked,
        start: $('setStart').value || '07:00',
        end: $('setEnd').value || '16:00',
        pause: Number($('setPause').value) || 0,
        note: $('setUseNote').checked ? $('setNote').value.trim() : ''
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast('Standardwerte gespeichert.');
      render();
    }

    function resetSettings() {
      if (!confirm('Standardwerte zurücksetzen?')) return;
      settings = { name: '', company: '', useDefaults: false, useNote: false, start: '07:00', end: '16:00', pause: 30, note: '' };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      loadData();
      render();
    }

    function initMonth() {
      $('monthPicker').value = currentMonthISO();
    }

    function goToToday() {
      $('monthPicker').value = currentMonthISO();
      render();
    }

    function selectedMonthEntries() {
      const m = $('monthPicker').value || currentMonthISO();
      return entries
        .filter(e => e.date && e.date.startsWith(m))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.start).localeCompare(String(b.start)));
    }

    function render() {
      const month = $('monthPicker').value || currentMonthISO();
      const filtered = selectedMonthEntries();
      const total = filtered.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
      const days = new Set(filtered.map(e => e.date)).size;
      const avg = days ? Math.round(total / days) : 0;
      const monthDate = new Date(month + '-01T12:00:00');
      const monthLabel = monthDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

      $('monthTitle').textContent = monthLabel;
      $('statusLine').textContent = `${filtered.length} Einträge im ausgewählten Monat · Daten lokal gespeichert`;
      $('entryHint').textContent = monthLabel;
      $('statTotal').textContent = formatMinutes(total) + ' h';
      $('statDays').textContent = days;
      $('statAverage').textContent = formatMinutes(avg) + ' h';
      $('statEntries').textContent = filtered.length;

      renderMobile(filtered);
      renderTable(filtered, total);
    }

    function renderMobile(filtered) {
      const list = $('entryList');
      list.innerHTML = '';
      if (!filtered.length) {
        list.innerHTML = '<div class="empty">Noch keine Einträge für diesen Monat.<br><br><button class="btn btn-primary" onclick="openEntryModal()">＋ Ersten Arbeitstag eintragen</button></div>';
        return;
      }
      filtered.forEach(e => {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
          <div class="entry-head">
            <div>
              <div class="entry-date">${escapeHTML(formatDate(e.date))}</div>
              <div class="entry-time">${escapeHTML(e.start)} – ${escapeHTML(e.end)} · Pause ${Number(e.pause)||0} min</div>
            </div>
            <div class="entry-duration">${formatMinutes(e.duration)} h</div>
          </div>
          ${e.note ? `<div class="entry-note">${escapeHTML(e.note)}</div>` : ''}
          <div class="entry-actions">
            <button class="btn btn-small btn-light" onclick="editEntry(${e.id})">Bearbeiten</button>
            <button class="btn btn-small btn-ghost" onclick="deleteEntry(${e.id})">Löschen</button>
          </div>
        `;
        list.appendChild(div);
      });
    }

    function renderTable(filtered, total) {
      const body = $('entryTable');
      body.innerHTML = '';
      if (!filtered.length) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:28px;">Keine Einträge für diesen Monat.</td></tr>';
        return;
      }
      filtered.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHTML(formatDate(e.date))}</strong></td>
          <td>${escapeHTML(e.start)}</td>
          <td>${escapeHTML(e.end)}</td>
          <td>${Number(e.pause)||0} min</td>
          <td class="num"><strong>${formatMinutes(e.duration)} h</strong></td>
          <td>${escapeHTML(e.note || '-')}</td>
          <td class="num"><button class="btn btn-small btn-light" onclick="editEntry(${e.id})">Edit</button> <button class="btn btn-small btn-ghost" onclick="deleteEntry(${e.id})">X</button></td>
        `;
        body.appendChild(tr);
      });
      const sum = document.createElement('tr');
      sum.className = 'sum-row';
      sum.innerHTML = `<td colspan="4" class="num">Gesamt</td><td class="num">${formatMinutes(total)} h</td><td colspan="2"></td>`;
      body.appendChild(sum);
    }

    function bindLiveDuration() {
      ['entryStart', 'entryEnd', 'entryPause'].forEach(id => $(id).addEventListener('input', updateDurationPreview));
    }

    function openEntryModal(preset = {}) {
      const isEdit = !!preset.id;
      $('entryId').value = preset.id || '';
      $('modalTitle').textContent = isEdit ? 'Arbeitstag bearbeiten' : 'Arbeitstag eintragen';
      $('entryDate').value = preset.date || todayISO();
      $('entryStart').value = preset.start || (settings.useDefaults ? settings.start : '');
      $('entryEnd').value = preset.end || (settings.useDefaults ? settings.end : '');
      $('entryPause').value = preset.pause ?? (settings.useDefaults ? settings.pause : 0);
      $('entryNote').value = preset.note ?? (settings.useNote ? settings.note : '');
      updateDurationPreview();
      $('entryModal').classList.remove('hidden');
      setTimeout(() => $('entryDate').focus(), 60);
    }

    function closeEntryModal() {
      $('entryModal').classList.add('hidden');
    }

    function quickToday() {
      if (!settings.useDefaults) {
        alert('Standardzeiten sind deaktiviert. Öffne „Person & Optionen“ und aktiviere Standardzeiten oder trage den Tag manuell ein.');
        return;
      }
      const date = todayISO();
      const existing = entries.find(e => e.date === date && e.start === settings.start && e.end === settings.end);
      if (existing && !confirm('Für heute gibt es bereits einen ähnlichen Eintrag. Trotzdem hinzufügen?')) return;
      entries.push({
        id: Date.now(),
        date,
        start: settings.start || '07:00',
        end: settings.end || '16:00',
        pause: Number(settings.pause) || 0,
        note: settings.useNote ? (settings.note || '') : '',
        duration: calcDuration(settings.start || '07:00', settings.end || '16:00', Number(settings.pause)||0)
      });
      saveEntries();
      $('monthPicker').value = date.slice(0, 7);
      render();
      toast('Heute wurde eingetragen.');
    }

    function editEntry(id) {
      const e = entries.find(x => Number(x.id) === Number(id));
      if (!e) return;
      openEntryModal(e);
    }

    function saveEntry() {
      const id = $('entryId').value;
      const date = $('entryDate').value;
      const start = $('entryStart').value;
      const end = $('entryEnd').value;
      const pause = Number($('entryPause').value) || 0;
      const note = $('entryNote').value.trim();
      if (!date || !start || !end) { alert('Bitte Datum, Start und Ende ausfüllen.'); return; }
      const duration = calcDuration(start, end, pause);
      if (duration <= 0) { alert('Die berechnete Arbeitszeit ist 0 oder negativ. Bitte Zeiten und Pause prüfen.'); return; }
      if (id) {
        const idx = entries.findIndex(e => Number(e.id) === Number(id));
        if (idx >= 0) entries[idx] = { id: Number(id), date, start, end, pause, note, duration };
      } else {
        entries.push({ id: Date.now(), date, start, end, pause, note, duration });
      }
      saveEntries();
      $('monthPicker').value = date.slice(0, 7);
      closeEntryModal();
      render();
    }

    function deleteEntry(id) {
      const e = entries.find(x => Number(x.id) === Number(id));
      if (!e) return;
      if (!confirm(`Eintrag vom ${formatDate(e.date)} löschen?`)) return;
      entries = entries.filter(x => Number(x.id) !== Number(id));
      saveEntries();
      render();
    }

    function updateDurationPreview() {
      const start = $('entryStart').value;
      const end = $('entryEnd').value;
      const pause = Number($('entryPause').value) || 0;
      const duration = start && end ? calcDuration(start, end, pause) : 0;
      $('entryDurationPreview').value = formatMinutes(Math.max(0, duration)) + ' h';
    }

    function calcDuration(start, end, pause) {
      const [sh, sm] = String(start).split(':').map(Number);
      const [eh, em] = String(end).split(':').map(Number);
      if (![sh, sm, eh, em].every(Number.isFinite)) return 0;

      const startMinutes = sh * 60 + sm;
      let endMinutes = eh * 60 + em;

      // Liegt die Endzeit vor der Startzeit, endet die Schicht am Folgetag.
      // Beispiel: 23:00 bis 12:00 = 13:00 Stunden vor Abzug der Pause.
      if (endMinutes < startMinutes) endMinutes += 24 * 60;

      return endMinutes - startMinutes - (Number(pause) || 0);
    }

    function formatMinutes(min) {
      min = Math.max(0, Math.round(Number(min) || 0));
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function formatDate(iso) {
      const d = new Date(iso + 'T12:00:00');
      return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function preparePrint() {
      const filtered = selectedMonthEntries();
      const total = filtered.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
      const month = $('monthPicker').value || currentMonthISO();
      const monthDate = new Date(month + '-01T12:00:00');
      const monthLabel = monthDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      $('printMonth').textContent = monthLabel;
      $('printCreated').textContent = new Date().toLocaleDateString('de-DE');
      $('printName').textContent = settings.name || '-';
      $('printCompany').textContent = settings.company || '-';
      $('printTotal').textContent = formatMinutes(total) + ' h';
      const rows = $('printRows');
      rows.innerHTML = '';
      filtered.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHTML(formatDate(e.date))}</td>
          <td>${escapeHTML(e.start)}</td>
          <td>${escapeHTML(e.end)}</td>
          <td>${Number(e.pause)||0} min</td>
          <td class="num">${formatMinutes(e.duration)} h</td>
          <td>${escapeHTML(e.note || '')}</td>
        `;
        rows.appendChild(tr);
      });
      const sum = document.createElement('tr');
      sum.className = 'print-sum';
      sum.innerHTML = `<td colspan="4" class="num">Gesamt</td><td class="num">${formatMinutes(total)} h</td><td></td>`;
      rows.appendChild(sum);
    }

    function prepareAndPrint() {
      preparePrint();
      window.print();
    }

    function exportCSV() {
      const filtered = selectedMonthEntries();
      const month = $('monthPicker').value || currentMonthISO();
      let csv = 'Datum;Start;Ende;Pause (Minuten);Dauer;Notiz\n';
      filtered.forEach(e => {
        csv += `${formatDate(e.date)};${e.start};${e.end};${Number(e.pause)||0};${formatMinutes(e.duration)};${String(e.note||'').replaceAll(';', ',')}\n`;
      });
      downloadText(`Zeiterfassung_${month}.csv`, csv, 'text/csv;charset=utf-8');
    }

    function downloadBackup() {
      const payload = {
        app: 'Zeiterfassung Plus',
        version: 1,
        created: new Date().toISOString(),
        settings,
        entries
      };
      const stamp = new Date().toISOString().slice(0, 19).replace('T', '_').replaceAll(':', '-');
      downloadText(`zeiterfassung_plus_backup_${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    }

    function restoreBackup(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const importedEntries = Array.isArray(data) ? data : data.entries;
          const importedSettings = Array.isArray(data) ? null : data.settings;
          if (!Array.isArray(importedEntries)) throw new Error('Keine Eintragsliste gefunden.');
          if (!confirm(`${importedEntries.length} Einträge aus Backup laden? Aktuelle Einträge werden ersetzt.`)) return;
          entries = importedEntries.map(e => ({
            id: Number(e.id) || Date.now() + Math.floor(Math.random()*10000),
            date: e.date,
            start: e.start,
            end: e.end,
            pause: Number(e.pause) || 0,
            note: e.note || '',
            duration: Number.isFinite(Number(e.duration)) ? Number(e.duration) : calcDuration(e.start, e.end, Number(e.pause)||0)
          })).filter(e => e.date && e.start && e.end);
          if (importedSettings) settings = { ...settings, ...importedSettings };
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
          saveEntries();
          loadData();
          render();
          toast('Backup wurde geladen.');
        } catch (err) {
          alert('Backup konnte nicht geladen werden: ' + err.message);
        } finally {
          input.value = '';
        }
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

    function openSettingsModal() {
      settingsReturnFocus = document.activeElement;
      syncOptionVisibility();
      $('settingsModal').classList.remove('hidden');
      setTimeout(() => $('setName').focus(), 60);
    }

    function closeSettingsModal() {
      $('settingsModal').classList.add('hidden');
      settingsReturnFocus?.focus?.();
      settingsReturnFocus = null;
    }

    function toggleSettings() {
      if ($('settingsModal').classList.contains('hidden')) openSettingsModal();
      else closeSettingsModal();
    }

    function configureToolMenu() {
      const actions = window.WSTimeTrackingActions;
      window.WSToolMenu?.configure({
        toolId: 'time', side: 'right',
        sections: [
          { title: 'Arbeitszeit', items: [
            { label: 'Arbeitstag eintragen', action: actions.addEntry },
            { label: 'Heute Standardzeit', action: actions.quickToday },
            { label: 'Heute anzeigen', action: actions.goToToday }
          ] },
          { title: 'Einstellungen', items: [{ label: 'Person & Optionen', action: actions.openSettings }] },
          { title: 'Daten & Export', items: [
            { label: 'CSV exportieren', action: actions.exportCSV },
            { label: 'Backup sichern', action: actions.downloadBackup },
            { label: 'Backup laden', action: actions.restoreBackup }
          ] },
          { title: 'Android-App', items: [
            { label: '🤖 Android-App & Installation', href: '/downloads.html#zeiterfassung-plus', description: 'Aktuelle APK, Installationshilfe und Update-Hinweise.' },
            { label: 'APK direkt herunterladen', href: '/dateien/zeiterfassung-plus/Zeiterfassung_Plus.apk', description: 'Aktuelle Android-App direkt von warenschmiede.com.' }
          ] },
          { title: 'Warenschmiede', items: [
            { label: 'Zur Tool-Übersicht', href: '/tools/' }, { label: 'Zur Homepage', href: '/' },
            { label: 'Kontakt', href: '/kontakt/kontakt.html' }, { label: 'Impressum', href: '/kontakt/impressum.html' }, { label: 'Datenschutz', href: '/datenschutz.html' }
          ] }
        ]
      });
    }

    function syncOptionVisibility() {
      const useDefaults = $('setUseDefaults')?.checked;
      const useNote = $('setUseNote')?.checked;
      document.querySelectorAll('.default-field').forEach(el => el.classList.toggle('hidden', !useDefaults));
      document.querySelectorAll('.note-field').forEach(el => el.classList.toggle('hidden', !useNote));
      const parts = [];
      const name = $('setName')?.value?.trim();
      const company = $('setCompany')?.value?.trim();
      if (name) parts.push(name);
      if (company) parts.push(company);
      parts.push(useDefaults ? 'Standardzeiten aktiv' : 'Zeiten manuell');
      parts.push(useNote ? 'Standardnotiz aktiv' : 'Notizen je Tag möglich');
      if ($('settingsSummary')) $('settingsSummary').textContent = parts.join(' · ');
    }

    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    }

    function toast(msg) {
      const el = document.createElement('div');
      el.className = 'time-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2100);
    }

window.WSTimeTrackingActions = Object.freeze({
  addEntry: () => openEntryModal(), quickToday: () => quickToday(), goToToday: () => goToToday(),
  openSettings: () => openSettingsModal(), exportCSV: () => exportCSV(), downloadBackup: () => downloadBackup(),
  restoreBackup: () => document.getElementById('backupFile')?.click()
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !document.getElementById('settingsModal')?.classList.contains('hidden')) closeSettingsModal(); });
