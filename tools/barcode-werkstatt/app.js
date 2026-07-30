    const $ = (id)=>document.getElementById(id);
    let currentType = 'CODE128';
    let currentMode = 'single';
    let generatedCodes = [];
    let typeDrafts = {};
    let projectVersions = [];
    let currentVersionId = null;
    let currentSheetPage = 0;

    const LABEL_SIZE_PRESETS = Object.freeze({
      '38.1x21.2': Object.freeze({width:38.1, height:21.2, group:'Kompakt'}),
      '48.3x25.4': Object.freeze({width:48.3, height:25.4, group:'Kompakt'}),
      '52.5x29.7': Object.freeze({width:52.5, height:29.7, group:'Universal'}),
      '64.6x33.8': Object.freeze({width:64.6, height:33.8, group:'Universal'}),
      '70x36': Object.freeze({width:70, height:36, group:'Universal'}),
      '99.1x38.1': Object.freeze({width:99.1, height:38.1, group:'Groß'}),
      '105x48': Object.freeze({width:105, height:48, group:'Groß'}),
      '105x57': Object.freeze({width:105, height:57, group:'Groß'})
    });

    // Die alten Format- und Skalierungswerte bleiben ausschließlich für die
    // verlustfreie Migration bereits gespeicherter Arbeitsstände erhalten.
    const PRINT_LAYOUT = Object.freeze({
      pageWidthMm: 210,
      pageHeightMm: 297,
      customLimits: Object.freeze({minWidth:10, maxWidth:190, minHeight:10, maxHeight:277}),
      scale: Object.freeze({small:.82, medium:1, large:1.22}),
      format: Object.freeze({
        compact: Object.freeze({width:50, height:22}),
        normal: Object.freeze({width:55, height:28}),
        wide: Object.freeze({width:66, height:25}),
        tall: Object.freeze({width:45, height:39}),
        sign: Object.freeze({width:72, height:50})
      })
    });

    function populateLabelSizePresets(){
      const select = $('labelSizePreset');
      if(!select) return;
      select.innerHTML = '';
      [...new Set(Object.values(LABEL_SIZE_PRESETS).map(preset=>preset.group))].forEach(groupName=>{
        const group = document.createElement('optgroup');
        group.label = groupName;
        Object.entries(LABEL_SIZE_PRESETS).filter(([, preset])=>preset.group === groupName).forEach(([key, preset])=>{
          const option = document.createElement('option');
          option.value = key;
          option.textContent = `${formatMm(preset.width)} × ${formatMm(preset.height)} mm`;
          group.appendChild(option);
        });
        select.appendChild(group);
      });
      const customGroup = document.createElement('optgroup');
      customGroup.label = 'Individuell';
      const custom = document.createElement('option');
      custom.value = 'custom';
      custom.textContent = 'Eigenes Maß';
      customGroup.appendChild(custom);
      select.appendChild(customGroup);
      select.value = '70x36';
    }

    const typeInfo = {
      CODE128:{label:'Code128',numericOnly:false,hint:'Code128 ist flexibel und eignet sich z. B. für interne Nummern, Lagerplätze, Aufträge und Werkstattetiketten.',help:'Code128 ist flexibel und eignet sich z. B. für interne Nummern, Lagerplätze, Aufträge und Werkstattetiketten.',ex:'Artikelnummer, Auftragsnummer, Lagerfach, interne Werkzeug-ID.',sample:'WS-2026-001'},
      EAN13:{label:'EAN-13',numericOnly:true,baseLen:12,fullLen:13,hint:'EAN-13 codiert eine 13-stellige GTIN. 12 Basisziffern werden ergänzt; bei 13 Ziffern wird die Prüfziffer geprüft.',help:'EAN-13 codiert eine 13-stellige GTIN. Die letzte Ziffer ist die Prüfziffer. Gib 12 Basisziffern ein, damit sie automatisch ergänzt wird, oder alle 13 Ziffern, um eine vorhandene Prüfziffer prüfen zu lassen. Für den offiziellen Einsatz müssen gültig vergebene Nummern verwendet werden.',ex:'Beispiel: 400638133393 → 4006381333931.',sample:'400638133393'},
      EAN8:{label:'EAN-8',numericOnly:true,baseLen:7,fullLen:8,hint:'EAN-8 codiert eine 8-stellige GTIN. 7 Basisziffern werden ergänzt; bei 8 Ziffern wird die Prüfziffer geprüft.',help:'EAN-8 codiert eine 8-stellige GTIN. Die letzte Ziffer ist die Prüfziffer. Gib 7 Basisziffern ein, damit sie automatisch ergänzt wird, oder alle 8 Ziffern, um die Prüfziffer prüfen zu lassen.',ex:'Beispiel: 9638507 → 96385074.',sample:'9638507'},
      CODE39:{label:'Code39',numericOnly:false,hint:'Code39 ist einfach und robust für Industrie, Werkstatt und Lager.',help:'Code39 eignet sich für robuste interne Codes. Verwende Großbuchstaben, Zahlen, Leerzeichen und - . $ / + %.',ex:'Beispiel: WERKZEUG-01 oder LAGER A12.',sample:'WERKZEUG-01'},
      ITF14:{label:'ITF-14',numericOnly:true,baseLen:13,fullLen:14,hint:'ITF-14 codiert GTINs auf Um- bzw. Transportverpackungen. 13 Basisziffern werden um die Prüfziffer ergänzt.',help:'ITF-14 ist ein 14-stelliger Barcode für GTINs auf Um- bzw. Transportverpackungen und wird nicht am klassischen Retail-POS verwendet. Die letzte Ziffer ist die Prüfziffer. Bei 13 Basisziffern ergänzt das Tool sie automatisch. Für den offiziellen Einsatz müssen gültig vergebene Nummern verwendet werden.',ex:'Beispiel: 1234567890123 → 12345678901231.',sample:'1234567890123'}
    };
    const modeInfo = {
      single:{label:'Einzelcode',hint:'Ein einzelner Barcode für Artikelnummer, Auftrag oder Lagerfach.'},
      copies:{label:'Gleicher Code',hint:'Ein Barcode wird mehrfach als Etikettenbogen erzeugt.'},
      series:{label:'Serie',hint:'Fortlaufende Codes mit Prefix, Startnummer, Anzahl und Stellen.'},
      manual:{label:'Manuelle Liste',hint:'Eigene Codes zeilenweise einfügen, z. B. aus Excel.'}
    };

    function toast(text){const t=$('toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
    function gs1Checksum(digits){
      const nums = String(digits).replace(/\D/g,'').split('').map(Number);
      let sum = 0;
      for(let i = nums.length - 1, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3){
        sum += nums[i] * weight;
      }
      return String((10 - (sum % 10)) % 10);
    }
    function isNumericType(){
      return !!typeInfo[currentType].numericOnly;
    }
    function baseLength(){
      return typeInfo[currentType].baseLen || 0;
    }
    function normalizeValue(input){
      let v = String(input || '').trim();
      const info = typeInfo[currentType];

      if(info.numericOnly){
        let digits = v.replace(/\D/g,'');
        if(!digits) digits = String(info.sample || '').replace(/\D/g,'');

        if(digits.length <= info.baseLen){
          const base = digits.padStart(info.baseLen, '0').slice(-info.baseLen);
          return base + gs1Checksum(base);
        }

        if(digits.length === info.fullLen){
          return digits;
        }

        const base = digits.slice(0, info.baseLen);
        return base + gs1Checksum(base);
      }

      if(currentType === 'CODE39'){
        v = v.toUpperCase().replace(/[^0-9A-Z \-.$/+%]/g,'');
      }

      return v || info.sample;
    }
    function activeInputValue(){
      if(currentMode === 'single') return $('barcodeValue').value;
      if(currentMode === 'copies') return $('copyValue').value;
      if(currentMode === 'series') {
        const prefix = $('seriesPrefix').value || '';
        const suffix = $('seriesSuffix').value || '';
        const start = Number($('seriesStart').value || 1);
        const pad = Number($('seriesPad').value || 0);
        return prefix + String(start).padStart(pad, '0') + suffix;
      }
      if(currentMode === 'manual') return ($('manualList').value.split(/\r?\n/).find(x=>x.trim()) || '');
      return '';
    }
    function barcodeOptions(){
      return {
        format: currentType,
        lineColor: $('lineColorText').value || '#102033',
        background: $('bgColorText').value || '#ffffff',
        width: Number($('barWidth').value),
        height: Number($('barHeight').value),
        displayValue: $('showText').value === 'true',
        fontSize: Number($('fontSize').value),
        margin: 16
      };
    }
    function renderBarcodeToSvg(svgEl, value, small=false){
      const barcodeSize = getValue('labelBarcodeSize') || 'balanced';
      const sizeMap = {
        compact: {height:44, widthOffset:-1, margin:4},
        balanced:{height:58, widthOffset:0,  margin:4},
        large:   {height:72, widthOffset:0,  margin:3},
        max:     {height:86, widthOffset:1,  margin:2}
      };
      const cfg = sizeMap[barcodeSize] || sizeMap.balanced;
      JsBarcode(svgEl, value, Object.assign({}, barcodeOptions(), small ? {
        width: Math.max(1, Number($('barWidth').value) + cfg.widthOffset),
        height: cfg.height,
        fontSize: Number(getValue('labelBarcodeTextSize') || 11),
        margin: cfg.margin
      } : {}));
    }

    function friendlyBarcodeError(){
      return 'Der Barcode konnte nicht dargestellt werden. Bitte Inhalt und Barcode-Art prüfen.';
    }
    function explainFinalCode(rawInput){
      const box = $('finalCodeBox');
      if(!box) return;

      if(!isNumericType()){
        box.classList.remove('active');
        box.innerHTML = '';
        return;
      }

      const info = typeInfo[currentType];
      let digits = String(rawInput || '').replace(/\D/g,'');
      if(!digits) digits = String(info.sample || '').replace(/\D/g,'');

      box.classList.add('active');
      if(digits.length === info.fullLen){
        const base = digits.slice(0, info.baseLen);
        const enteredCheckDigit = digits.slice(-1);
        const expectedCheckDigit = gs1Checksum(base);
        const matches = enteredCheckDigit === expectedCheckDigit;
        box.innerHTML = `
          <strong>${info.label} arbeitet mit Prüfziffer:</strong><br>
          Basisnummer: <code>${base}</code><br>
          Eingegebene Prüfziffer: <code>${enteredCheckDigit}</code><br>
          Erwartete Prüfziffer: <code>${expectedCheckDigit}</code><br>
          Status: Prüfziffer stimmt${matches ? '' : ' nicht'}
        `;
        return;
      }

      const base = digits.padStart(info.baseLen, '0').slice(-info.baseLen);
      const calculatedCheckDigit = gs1Checksum(base);
      box.innerHTML = `
        <strong>${info.label} arbeitet mit Prüfziffer:</strong><br>
        Basisnummer: <code>${base}</code><br>
        Berechnete Prüfziffer: <code>${calculatedCheckDigit}</code><br>
        Endgültiger Barcode-Inhalt: <code>${base + calculatedCheckDigit}</code>
      `;
    }
    function updateStandardWarning(){
      const box = $('standardWarning');
      if(!box) return;
      box.style.display = ['EAN13','EAN8','ITF14'].includes(currentType) ? 'block' : 'none';
    }
    function updateDynamicLabels(){
      const numeric = isNumericType();
      const labelText = numeric ? 'Basisnummer / Ziffern' : 'Barcode-Inhalt';
      const copyText = numeric ? 'Basisnummer / Ziffern' : 'Barcode-Inhalt';
      if($('singleValueLabel')) $('singleValueLabel').textContent = labelText;
      if($('copyValueLabel')) $('copyValueLabel').textContent = copyText;
      if($('seriesStartLabel')) $('seriesStartLabel').textContent = numeric ? 'Start-Basisnummer' : 'Startnummer';
      if($('seriesPadLabel')) $('seriesPadLabel').textContent = numeric ? 'Basisstellen' : 'Stellen';
    }

    function setFieldState(id, state){
      const el = $(id);
      if(!el) return;
      const field = el.closest('.field');
      if(!field) return;
      field.classList.remove('valid','invalid','pending');
      if(state) field.classList.add(state);
    }
    function setFieldLocked(id, locked){
      const el = $(id);
      if(!el) return;
      const field = el.closest('.field');
      if(!field) return;
      field.classList.toggle('locked', !!locked);
      el.readOnly = !!locked;
      el.setAttribute('aria-readonly', locked ? 'true' : 'false');
    }
    function enforceFixedFields(){
      const numeric = isNumericType();
      const info = typeInfo[currentType];

      const fixedPrefixSuffix = numeric;
      ['seriesPrefix','seriesSuffix'].forEach(id=>{
        setFieldLocked(id, fixedPrefixSuffix);
        if(fixedPrefixSuffix) setValue(id, '');
      });

      const fixedPad = numeric;
      setFieldLocked('seriesPad', fixedPad);
      if(fixedPad) setValue('seriesPad', String(info.baseLen));

      // Prefix/Suffix bei EAN/ITF werden ignoriert und sollen deshalb nicht als Eingabefehler wirken.
      if(fixedPrefixSuffix){
        setFieldState('seriesPrefix','');
        setFieldState('seriesSuffix','');
      }
    }

    function barcodeMaxLength(){
      if(currentType === 'EAN13') return 13;
      if(currentType === 'EAN8') return 8;
      if(currentType === 'ITF14') return 14;
      return 80;
    }
    function barcodeBaseLength(){
      if(currentType === 'EAN13') return 12;
      if(currentType === 'EAN8') return 7;
      if(currentType === 'ITF14') return 13;
      return null;
    }
    function setInputMaxLengths(){
      const max = barcodeMaxLength();
      const base = barcodeBaseLength();
      ['barcodeValue','copyValue'].forEach(id=>{
        const el = $(id);
        if(!el) return;
        if(isNumericType()){
          el.maxLength = max;
          el.inputMode = 'numeric';
          el.pattern = '[0-9]*';
        } else {
          el.maxLength = 80;
          el.removeAttribute('inputmode');
          el.removeAttribute('pattern');
        }
      });
      const start = $('seriesStart');
      if(start){
        if(isNumericType()){
          start.maxLength = base;
          start.inputMode = 'numeric';
          start.pattern = '[0-9]*';
        } else {
          start.maxLength = 20;
          start.removeAttribute('inputmode');
          start.removeAttribute('pattern');
        }
      }
      const manual = $('manualList');
      if(manual){
        manual.removeAttribute('maxlength');
      }
    }
    function sanitizeNumericInputs(){
      if(!isNumericType()) return;
      const max = barcodeMaxLength();
      const base = barcodeBaseLength();

      ['barcodeValue','copyValue'].forEach(id=>{
        const el = $(id);
        if(!el) return;
        const clean = String(el.value || '').replace(/\D/g,'').slice(0, max);
        if(el.value !== clean) el.value = clean;
      });

      const start = $('seriesStart');
      if(start){
        const clean = String(start.value || '').replace(/\D/g,'').slice(0, base);
        if(start.value !== clean) start.value = clean;
      }

      const step = $('seriesStep');
      if(step){
        const clean = String(step.value || '').replace(/\D/g,'').slice(0, 6);
        if(elValue(step) !== clean) step.value = clean || '1';
      }
    }
    function elValue(el){ return String(el?.value || ''); }
    function setValidationBox(kind, title, body){
      const box = $('validationBox');
      if(!box) return;
      box.classList.remove('bad','pending');
      if(kind === 'bad') box.classList.add('bad');
      if(kind === 'pending') box.classList.add('pending');
      box.innerHTML = `<strong>${escapeHtml(title)}</strong>${body ? '<br>' + body : ''}`;
    }
    function setValidationList(kind, title, issues){
      const box = $('validationBox');
      if(!box) return;
      box.classList.remove('bad','pending');
      if(kind === 'bad') box.classList.add('bad');
      if(kind === 'pending') box.classList.add('pending');
      box.innerHTML = `<strong>${escapeHtml(title)}</strong><ul>` + issues.map(x=>`<li>${escapeHtml(x)}</li>`).join('') + '</ul>';
    }
    function validateCurrentInputs(rendererError = ''){
      const issues = [];
      ['barcodeValue','copyValue','copyCount','seriesStart','seriesCount','seriesPad','seriesStep','manualList','seriesPrefix','seriesSuffix'].forEach(id=>setFieldState(id,''));

      setInputMaxLengths();
      enforceFixedFields();

      const info = typeInfo[currentType];
      const numeric = isNumericType();
      const baseLen = barcodeBaseLength();
      const fullLen = barcodeMaxLength();

      function activeFieldIds(){
        if(currentMode === 'single') return ['barcodeValue'];
        if(currentMode === 'copies') return ['copyValue','copyCount'];
        if(currentMode === 'series') return ['seriesStart','seriesCount','seriesStep'];
        if(currentMode === 'manual') return ['manualList'];
        return [];
      }

      function checkNumericBarcode(fieldId, value, label, lineNo){
        const raw = String(value || '').trim();
        const suffix = lineNo ? ` in Zeile ${lineNo}` : '';

        if(!raw){
          issues.push(`${label}: Eingabe fehlt${suffix}.`);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        if(!/^\d+$/.test(raw)){
          issues.push(`${label}: Nur Ziffern erlaubt${suffix}.`);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        if(raw.length > fullLen){
          issues.push(`${label}: Maximal ${fullLen} Ziffern erlaubt${suffix}.`);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        if(raw.length !== baseLen && raw.length !== fullLen){
          issues.push(`${label}: ${baseLen} Basisziffern oder ${fullLen} Stellen inkl. Prüfziffer nötig${suffix}.`);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        if(raw.length === fullLen){
          const expected = gs1Checksum(raw.slice(0, baseLen));
          if(raw.slice(-1) !== expected){
            issues.push(`${label}: Die Prüfziffer stimmt nicht${suffix}. Erwartete Prüfziffer: ${expected}.`);
            setFieldState(fieldId, 'invalid');
            return false;
          }
        }
        setFieldState(fieldId, 'valid');
        return true;
      }

      function checkTextBarcode(fieldId, value, label, lineNo){
        const raw = String(value || '').trim();
        const suffix = lineNo ? ` in Zeile ${lineNo}` : '';
        if(!raw){
          issues.push(`${label}: Eingabe fehlt${suffix}.`);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        if(raw.length > 80){
          issues.push(`${label}: Maximal 80 Zeichen erlaubt${suffix}.`);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        if(currentType === 'CODE39' && /[^0-9A-Z \-.$/+%]/.test(raw.toUpperCase())){
          issues.push(`Code39: Ungültige Zeichen${suffix}. Erlaubt sind Großbuchstaben, Zahlen, Leerzeichen und - . $ / + %. `);
          setFieldState(fieldId, 'invalid');
          return false;
        }
        setFieldState(fieldId, 'valid');
        return true;
      }

      if(currentMode === 'single'){
        const v = getValue('barcodeValue');
        if(numeric) checkNumericBarcode('barcodeValue', v, info.label);
        else checkTextBarcode('barcodeValue', v, info.label);
      }

      if(currentMode === 'copies'){
        const v = getValue('copyValue');
        const count = Number(getValue('copyCount') || 0);

        if(numeric) checkNumericBarcode('copyValue', v, info.label);
        else checkTextBarcode('copyValue', v, info.label);

        if(!Number.isInteger(count) || count < 1 || count > 999){
          issues.push('Gleicher Code: Anzahl muss zwischen 1 und 999 liegen.');
          setFieldState('copyCount','invalid');
        } else {
          setFieldState('copyCount','valid');
        }
      }

      if(currentMode === 'manual'){
        const lines = String(getValue('manualList') || '').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
        if(!lines.length){
          issues.push('Manuelle Liste: mindestens eine Zeile eintragen.');
          setFieldState('manualList','invalid');
        } else {
          let ok = true;
          lines.forEach((line, i)=>{
            if(numeric) ok = checkNumericBarcode('manualList', line, info.label, i + 1) && ok;
            else ok = checkTextBarcode('manualList', line, info.label, i + 1) && ok;
          });
          if(ok) setFieldState('manualList','valid');
          else setFieldState('manualList','invalid');
        }
      }

      if(currentMode === 'series'){
        const startRaw = String(getValue('seriesStart') || '').trim();
        const count = Number(getValue('seriesCount') || 0);
        const stepRaw = String(getValue('seriesStep') || '').trim();
        const step = Number(stepRaw);
        const pad = Number(getValue('seriesPad') || 0);

        if(numeric){
          if(!startRaw){
            issues.push(`${info.label}-Serie: Start-Basisnummer fehlt.`);
            setFieldState('seriesStart','invalid');
          } else if(!/^\d+$/.test(startRaw)){
            issues.push(`${info.label}-Serie: Start-Basisnummer darf nur Ziffern enthalten.`);
            setFieldState('seriesStart','invalid');
          } else if(startRaw.length > baseLen){
            issues.push(`${info.label}-Serie: Start-Basisnummer darf maximal ${baseLen} Stellen haben.`);
            setFieldState('seriesStart','invalid');
          } else {
            setFieldState('seriesStart','valid');
          }

          if(pad !== baseLen){
            issues.push(`${info.label}-Serie: Basisstellen sind fest ${baseLen}.`);
            setFieldState('seriesPad','invalid');
          } else {
            setFieldState('seriesPad','');
          }

          if(!/^\d+$/.test(stepRaw) || step < 1 || step > 999999){
            issues.push(`${info.label}-Serie: Schrittweite muss eine ganze Zahl von 1 bis 999999 sein.`);
            setFieldState('seriesStep','invalid');
          } else {
            setFieldState('seriesStep','valid');
          }

          if(Number.isInteger(count) && count >= 1 && count <= 999 && /^\d+$/.test(startRaw) && /^\d+$/.test(stepRaw)){
            const maxBase = BigInt('9'.repeat(baseLen));
            const startVal = BigInt(startRaw || '0');
            const stepVal = BigInt(stepRaw || '1');
            const endVal = startVal + BigInt(count - 1) * stepVal;
            if(endVal > maxBase){
              issues.push(`${info.label}-Serie: Startnummer + Anzahl/Schrittweite überschreitet den ${baseLen}-stelligen Basisbereich.`);
              setFieldState('seriesStart','invalid');
              setFieldState('seriesCount','invalid');
              setFieldState('seriesStep','invalid');
            }
          }
        } else {
          if(!startRaw || !Number.isFinite(Number(startRaw))){
            issues.push('Serie: Startnummer ist ungültig.');
            setFieldState('seriesStart','invalid');
          } else {
            setFieldState('seriesStart','valid');
          }

          if(!Number.isInteger(pad) || pad < 0 || pad > 20){
            issues.push('Serie: Stellen muss zwischen 0 und 20 liegen.');
            setFieldState('seriesPad','invalid');
          } else {
            setFieldState('seriesPad','valid');
          }

          if(!Number.isFinite(step) || step === 0 || Math.abs(step) > 999999){
            issues.push('Serie: Schrittweite fehlt oder ist zu groß.');
            setFieldState('seriesStep','invalid');
          } else {
            setFieldState('seriesStep','valid');
          }
        }

        if(!Number.isInteger(count) || count < 1 || count > 999){
          issues.push('Serie: Anzahl muss zwischen 1 und 999 liegen.');
          setFieldState('seriesCount','invalid');
        } else if(!$('seriesCount')?.closest('.field')?.classList.contains('invalid')){
          setFieldState('seriesCount','valid');
        }
      }

      // Optionale oder gesperrte Felder bleiben neutral.
      setFieldState('seriesPrefix','');
      setFieldState('seriesSuffix','');

      if(rendererError){
        issues.push(friendlyBarcodeError());
      }

      if(issues.length){
        setValidationList('bad', 'Prüfung: Fehler gefunden', issues);
      } else {
        setValidationBox('ok', 'Prüfung: Eingaben passen.', 'Barcode kann erzeugt, exportiert und gedruckt werden.');
      }

      return {ok: issues.length === 0, issues};
    }
    function updatePrintLayoutVars(){
      const margin = Number(getValue('printMargin') || 12);
      const gap = Number(getValue('labelGap') || 8);
      document.documentElement.style.setProperty('--print-padding', margin + 'mm');
      document.documentElement.style.setProperty('--print-gap', gap + 'mm');
    }

    function printLabelMetrics(){
      if(getValue('labelSizePreset') === 'custom'){
        return {width:parseGermanNumber(getValue('customLabelWidthMm')), height:parseGermanNumber(getValue('customLabelHeightMm'))};
      }
      const preset = LABEL_SIZE_PRESETS[getValue('labelSizePreset')] || LABEL_SIZE_PRESETS['70x36'];
      return {width:preset.width, height:preset.height};
    }

    function parseGermanNumber(value){
      const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
      return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
    }

    function customLabelValidation(){
      const custom = getValue('labelSizePreset') === 'custom';
      const fields = $('customLabelSizeFields');
      if(fields) fields.hidden = !custom;
      const error = $('customLabelSizeError');
      if(!custom){
        if(error) error.hidden = true;
        return {ok:true};
      }
      const width = parseGermanNumber(getValue('customLabelWidthMm'));
      const height = parseGermanNumber(getValue('customLabelHeightMm'));
      const limits = PRINT_LAYOUT.customLimits;
      const margin = Number(getValue('printMargin') || 0);
      const availableWidth = PRINT_LAYOUT.pageWidthMm - (2 * margin);
      const availableHeight = PRINT_LAYOUT.pageHeightMm - (2 * margin);
      let message = '';
      if(!Number.isFinite(width) || !Number.isFinite(height)) message = 'Bitte Breite und Höhe als Zahl eingeben, zum Beispiel 70,0.';
      else if(width < limits.minWidth || width > limits.maxWidth || height < limits.minHeight || height > limits.maxHeight) message = `Erlaubt sind ${limits.minWidth}–${limits.maxWidth} mm Breite und ${limits.minHeight}–${limits.maxHeight} mm Höhe.`;
      else if(width > availableWidth || height > availableHeight) message = 'Dieses Etikettenmaß passt mit dem gewählten Rand nicht auf ein A4-Blatt.';
      if(error){ error.textContent = message; error.hidden = !message; }
      ['customLabelWidthMm','customLabelHeightMm'].forEach(id=>$(id)?.closest('.field')?.classList.toggle('invalid', !!message));
      return {ok:!message, width, height, message};
    }

    function sheetColumnCount(labelWidth){
      const margin = Number(getValue('printMargin') || 12);
      const gap = Number(getValue('labelGap') || 8);
      const available = Math.max(0, PRINT_LAYOUT.pageWidthMm - (2 * margin));
      const physical = Math.max(1, Math.floor((available + gap) / (labelWidth + gap)));
      const requested = getValue('labelsPerRow') || 'auto';
      const maximum = requested === 'auto' ? physical : Math.max(1, Number(requested) || physical);
      return {columns:Math.min(physical, maximum), physical, requested};
    }

    function sheetPacking(metrics){
      const horizontal = sheetColumnCount(metrics.width);
      const margin = Number(getValue('printMargin') || 12);
      const gap = Number(getValue('labelGap') || 8);
      const availableHeight = Math.max(0, PRINT_LAYOUT.pageHeightMm - (2 * margin));
      const rows = Math.max(1, Math.floor((availableHeight + gap) / (metrics.height + gap)));
      return {...horizontal, rows, itemsPerPage:horizontal.columns * rows, margin, gap, availableHeight};
    }

    function generate(){
      updatePrintLayoutVars();
      setInputMaxLengths();
      sanitizeNumericInputs();
      enforceFixedFields();

      const raw = activeInputValue();
      const value = normalizeValue(raw) || typeInfo[currentType].sample;
      explainFinalCode(raw);
      $('payloadBox').textContent = value;
      $('typePill').textContent = typeInfo[currentType].label;
      $('modePill').textContent = modeInfo[currentMode].label;
      $('lengthPill').textContent = `${value.length} Zeichen`;

      const inputValidation = validateCurrentInputs();
      let rendererError = '';
      try{
        if(inputValidation.ok) renderBarcodeToSvg('#barcodeSvg', value);
        else $('barcodeSvg').innerHTML = '';
      }catch(err){
        rendererError = friendlyBarcodeError();
        $('barcodeSvg').innerHTML = '';
        $('payloadBox').textContent = rendererError;
      }

      validateCurrentInputs(rendererError);
      renderBarcodeOpticsPreview(value, inputValidation.ok);
      renderSingleLabelPreview();
    }
    function renderBarcodeOpticsPreview(value, isValid){
      const svg = $('barcodeOpticsPreview');
      const empty = $('barcodeOpticsPreviewEmpty');
      if(!svg) return;
      svg.innerHTML = '';
      if(!isValid){
        if(empty) empty.hidden = false;
        return;
      }
      try{
        renderBarcodeToSvg(svg, value);
        if(empty) empty.hidden = true;
      }catch(error){
        svg.innerHTML = '';
        if(empty){
          empty.hidden = false;
          empty.textContent = friendlyBarcodeError();
        }
      }
    }

    function updateNumericFieldState(){
      const numeric = isNumericType();
      ['seriesPrefix','seriesSuffix'].forEach(id => {
        const el = $(id);
        if(!el) return;
        el.disabled = numeric;
        el.style.opacity = numeric ? '.55' : '1';
      });
      const note = $('numericSeriesNote');
      if(note) note.style.display = numeric ? 'inline' : 'none';
    }
    function applyNumericDefaults(){
      const info = typeInfo[currentType];
      if(!info.numericOnly) return;

      const baseSample = String(info.sample || '').replace(/\D/g,'').slice(0, info.baseLen);
      $('barcodeValue').value = baseSample;
      $('copyValue').value = baseSample;
      $('seriesPrefix').value = '';
      $('seriesSuffix').value = '';
      $('seriesStart').value = '1';
      $('seriesPad').value = String(info.baseLen);
      $('seriesStep').value = '1';
      $('manualList').value = [1,2,3,4,5].map(n => String(n).padStart(info.baseLen, '0')).join('\n');
    }
    function applyTextDefaults(){
      if(isNumericType()) return;
      if(currentType === 'CODE128'){
        if(!$('seriesPrefix').value) $('seriesPrefix').value = 'WS-';
        if(!$('seriesSuffix').value) $('seriesSuffix').value = '-A';
      }
    }

    function captureTypeDraft(type = currentType){
      typeDrafts[type] = {
        inputs: {
          single: { value: getValue('barcodeValue') },
          copies: { value: getValue('copyValue'), count: getValue('copyCount'), note: getValue('copyNote') },
          series: {
            prefix: getValue('seriesPrefix'),
            suffix: getValue('seriesSuffix'),
            start: getValue('seriesStart'),
            count: getValue('seriesCount'),
            pad: getValue('seriesPad'),
            step: getValue('seriesStep'),
            note: getValue('seriesNote')
          },
          manual: { list: getValue('manualList') }
        }
      };
    }
    function restoreTypeDraft(type){
      const draft = typeDrafts[type];
      if(!draft || !draft.inputs) return false;

      setValue('barcodeValue', draft.inputs.single?.value || '');
      setValue('copyValue', draft.inputs.copies?.value || '');
      setValue('copyCount', draft.inputs.copies?.count || '1');
      setValue('copyNote', draft.inputs.copies?.note || '');

      setValue('seriesPrefix', draft.inputs.series?.prefix || '');
      setValue('seriesSuffix', draft.inputs.series?.suffix || '');
      setValue('seriesStart', draft.inputs.series?.start || '1');
      setValue('seriesCount', draft.inputs.series?.count || '1');
      setValue('seriesPad', draft.inputs.series?.pad || '4');
      setValue('seriesStep', draft.inputs.series?.step || '1');
      setValue('seriesNote', draft.inputs.series?.note || '');

      setValue('manualList', draft.inputs.manual?.list || '');
      return true;
    }

    function setType(type){
      if(type !== currentType){
        captureTypeDraft(currentType);
      }

      currentType = type;
      document.querySelectorAll('.type-btn').forEach(b=>b.classList.toggle('active', b.dataset.type===type));
      $('typeHint').textContent = typeInfo[type].hint;
      $('inputHelp').textContent = typeInfo[type].help;
      $('inputExample').innerHTML = '<strong>Beispiel:</strong> ' + typeInfo[type].ex;
      $('inputSummary').innerHTML = `<span>${typeInfo[type].label}</span><span>${modeInfo[currentMode].label}</span>`;

      updateNumericFieldState();
      updateDynamicLabels();
      updateStandardWarning();

      const restored = restoreTypeDraft(type);

      if(!restored){
        if(isNumericType()) {
          applyNumericDefaults();
        } else {
          if(currentMode === 'single') $('barcodeValue').value = typeInfo[type].sample;
          if(currentMode === 'copies') $('copyValue').value = typeInfo[type].sample;
          applyTextDefaults();
        }
      }

      buildList();
      generate();
      updateLoadedVersionLiveSoon();
      saveLocalDraftSoon();
    }
    function setMode(mode){
      currentMode = mode;
      document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active', b.dataset.mode===mode));
      document.querySelectorAll('.input-block').forEach(block=>block.classList.toggle('active', block.dataset.input===mode));
      updateNumericFieldState();
      updateDynamicLabels();
      updateStandardWarning();
      $('modeHint').textContent = modeInfo[mode].hint;
      $('inputSummary').innerHTML = `<span>${typeInfo[currentType].label}</span><span>${modeInfo[mode].label}</span>`;
      buildList();
      generate();
      updateLoadedVersionLiveSoon();
      saveLocalDraftSoon();
    }
    function buildList(){
      let list = [];
      if(!validateCurrentInputs().ok){
        generatedCodes = [];
        renderList();
        renderSheet();
        return;
      }
      if(currentMode === 'single'){
        const v = normalizeValue($('barcodeValue').value) || typeInfo[currentType].sample;
        list = [{value:v, qty:1, note:''}];
      }
      if(currentMode === 'copies'){
        const v = normalizeValue($('copyValue').value) || typeInfo[currentType].sample;
        const count = Math.max(1, Math.min(999, Number($('copyCount').value || 1)));
        list = [{value:v, qty:count, note:$('copyNote').value || ''}];
      }
      if(currentMode === 'series'){
        const start = Number($('seriesStart').value || 1);
        const count = Math.max(1, Math.min(999, Number($('seriesCount').value || 1)));
        const pad = isNumericType()
          ? baseLength()
          : Math.max(0, Math.min(12, Number($('seriesPad').value || 0)));
        const step = Number($('seriesStep').value || 1);
        const note = $('seriesNote').value || '';
        const prefix = isNumericType() ? '' : ($('seriesPrefix').value || '');
        const suffix = isNumericType() ? '' : ($('seriesSuffix').value || '');

        for(let i=0;i<count;i++){
          const number = start + (i * step);
          const rawNumber = String(number).padStart(pad, '0');
          const raw = prefix + rawNumber + suffix;
          list.push({value:normalizeValue(raw), qty:1, note, number});
        }
      }
      if(currentMode === 'manual'){
        list = $('manualList').value.split(/\r?\n/).map(x=>normalizeValue(x)).filter(Boolean).map(v=>({value:v, qty:1, note:''}));
      }
      generatedCodes = list.filter(x=>x.value);
      renderList();
      renderSheet();
    }
    function expandedCodes(){
      const perCode = Math.max(1, Math.min(99, Number($('copiesPerCode').value || 1)));
      const out = [];
      generatedCodes.forEach((item, idx)=>{
        const qty = Math.max(1, Number(item.qty || 1)) * perCode;
        for(let i=0;i<qty;i++) out.push({value:item.value, sourceIndex:idx+1, copy:i+1, note:item.note || ''});
      });
      return out;
    }
    function renderList(){
      $('listCount').textContent = `${generatedCodes.length} Codes`;
      $('codeList').innerHTML = generatedCodes.length ? generatedCodes.map((item, idx)=>`
        <div class="code-row"><span>${idx+1}</span><code>${escapeHtml(item.value)}</code><span>×${item.qty || 1}</span></div>
      `).join('') : '<div class="code-row"><span>–</span><code>Keine Codes erzeugt</code><span></span></div>';
    }
    function labelDesign(){
      const v = id => getValue(id);
      const template = v('labelTemplate') || 'plain';
      const showTitle = v('showLabelTitle') === 'true';
      const title = v('labelTitleText') || '';
      const pos = v('labelTitlePosition') || 'top';
      const titleColor = v('labelTitleColorText') || '#102033';
      const titleSize = Number(v('labelTitleSize') || 12);
      const titleStyle = v('labelTitleStyle') || 'plain';
      const titleAlign = v('labelTitleAlign') || 'center';
      const titleJustify = titleAlign === 'left' ? 'flex-start' : titleAlign === 'right' ? 'flex-end' : 'center';
      const titleSelf = titleAlign === 'left' ? 'start' : titleAlign === 'right' ? 'end' : 'center';
      const valueText = v('labelValueText') === 'true';
      const frameEnabled = v('labelFrameEnabled') !== 'false';
      const radius = Number(v('labelFrameRadius') || 16);
      const frameColor = v('labelFrameColorText') || '#102033';
      const frameWidth = frameEnabled ? Number(v('labelFrameWidth') || 2) : 0;
      const bgColor = v('labelBgColorText') || '#ffffff';
      const barcodeTextSize = Number(v('labelBarcodeTextSize') || 11);
      const barcodeSize = v('labelBarcodeSize') || 'balanced';
      const labelFormat = v('labelFormat') || 'normal';
      const labelDensity = v('labelDensity') || 'balanced';
      const manualHeight = v('labelManualHeight') || 'auto';
      const labelShape = v('labelShape') || 'rounded';
      const topBar = v('labelTopBar') === 'true';
      const bottomBar = v('labelBottomBar') === 'true';
      const leftBar = v('labelLeftBar') === 'true';
      const rightBar = v('labelRightBar') === 'true';
      const barHeight = Number(v('labelBarHeight') || 16);
      const sideBarWidth = Number(v('labelSideBarWidth') || 12);
      return {
        template, showTitle, title, pos, titleColor, titleSize, titleStyle, titleAlign, titleJustify, titleSelf, valueText,
        frameEnabled, radius, frameColor, frameWidth, bgColor, barcodeTextSize, barcodeSize, labelFormat, labelDensity, manualHeight, labelShape,
        topBar, bottomBar, leftBar, rightBar, barHeight, sideBarWidth,
        topBarColor: v('labelTopBarColorText') || '#2f8edf',
        bottomBarColor: v('labelBottomBarColorText') || '#f1913e',
        leftBarColor: v('labelLeftBarColorText') || '#102033',
        rightBarColor: v('labelRightBarColorText') || '#102033'
      };
    }
    function templateClass(){
      return 'frame-designer-v83';
    }
    function setDesignValue(id, value){
      const el = $(id);
      if(el) el.value = value ?? '';
    }
    function applyLabelTemplate(){
      const tpl = getValue('labelTemplate') || 'plain';
      const presets = {
        plain:     {show:'false', title:'', titleColor:'#102033', titleStyle:'plain', titleAlign:'center', frame:'true', shape:'rounded', radius:'16', frameColor:'#cbd9e6', frameWidth:'1', bg:'#ffffff', top:'false', bottom:'false', left:'false', right:'false', topColor:'#2f8edf', bottomColor:'#f1913e', leftColor:'#102033', rightColor:'#102033', barcodeSize:'balanced', format:'normal', density:'balanced', barHeight:'16', sideWidth:'12'},
        blue:      {show:'true', title:'SCAN ME', titleColor:'#2f8edf', titleStyle:'pill', titleAlign:'center', frame:'true', shape:'rounded', radius:'16', frameColor:'#2f8edf', frameWidth:'2', bg:'#f7fbff', top:'true', bottom:'false', left:'false', right:'false', topColor:'#2f8edf', bottomColor:'#2f8edf', leftColor:'#2f8edf', rightColor:'#2f8edf', barcodeSize:'balanced', format:'normal', density:'balanced', barHeight:'22', sideWidth:'12'},
        orange:    {show:'true', title:'WARENSCHMIEDE', titleColor:'#f1913e', titleStyle:'pill', titleAlign:'center', frame:'true', shape:'rounded', radius:'16', frameColor:'#f1913e', frameWidth:'2', bg:'#fffaf4', top:'true', bottom:'false', left:'false', right:'false', topColor:'#f1913e', bottomColor:'#cc6f1e', leftColor:'#f1913e', rightColor:'#f1913e', barcodeSize:'balanced', format:'normal', density:'balanced', barHeight:'22', sideWidth:'12'},
        green:     {show:'true', title:'LAGER', titleColor:'#2baa72', titleStyle:'pill', titleAlign:'center', frame:'true', shape:'rounded', radius:'16', frameColor:'#2baa72', frameWidth:'2', bg:'#f8fff9', top:'true', bottom:'false', left:'false', right:'false', topColor:'#2baa72', bottomColor:'#16814f', leftColor:'#2baa72', rightColor:'#2baa72', barcodeSize:'large', format:'normal', density:'scan', barHeight:'22', sideWidth:'12'},
        topBottom: {show:'true', title:'BARCODE', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'center', frame:'true', shape:'rounded', radius:'16', frameColor:'#102033', frameWidth:'2', bg:'#ffffff', top:'true', bottom:'true', left:'false', right:'false', topColor:'#102033', bottomColor:'#102033', leftColor:'#102033', rightColor:'#102033', barcodeSize:'large', format:'compact', density:'scan', barHeight:'16', sideWidth:'12'},
        leftRight: {show:'false', title:'', titleColor:'#102033', titleStyle:'plain', titleAlign:'center', frame:'true', shape:'rounded', radius:'10', frameColor:'#102033', frameWidth:'2', bg:'#ffffff', top:'false', bottom:'false', left:'true', right:'true', topColor:'#102033', bottomColor:'#102033', leftColor:'#f1913e', rightColor:'#2f8edf', barcodeSize:'balanced', format:'normal', density:'balanced', barHeight:'16', sideWidth:'12'},
        fullFrame: {show:'true', title:'ARTIKEL', titleColor:'#102033', titleStyle:'plain', titleAlign:'center', frame:'true', shape:'square', radius:'0', frameColor:'#102033', frameWidth:'4', bg:'#ffffff', top:'false', bottom:'false', left:'false', right:'false', topColor:'#102033', bottomColor:'#102033', leftColor:'#102033', rightColor:'#102033', barcodeSize:'large', format:'normal', density:'scan', barHeight:'16', sideWidth:'12'},
        softCard:  {show:'true', title:'SCAN ME', titleColor:'#5b6f83', titleStyle:'plain', titleAlign:'center', frame:'true', shape:'pill', radius:'24', frameColor:'#9fb2c5', frameWidth:'1', bg:'#f7fbff', top:'false', bottom:'false', left:'false', right:'false', topColor:'#9fb2c5', bottomColor:'#9fb2c5', leftColor:'#9fb2c5', rightColor:'#9fb2c5', barcodeSize:'balanced', format:'normal', density:'comfortable', barHeight:'16', sideWidth:'12'},
        warning:   {show:'true', title:'ACHTUNG', titleColor:'#c2413a', titleStyle:'pill', titleAlign:'center', frame:'true', shape:'rounded', radius:'12', frameColor:'#c2413a', frameWidth:'2', bg:'#fff7f7', top:'true', bottom:'false', left:'false', right:'false', topColor:'#c2413a', bottomColor:'#8f1f1a', leftColor:'#c2413a', rightColor:'#c2413a', barcodeSize:'large', format:'normal', density:'scan', barHeight:'22', sideWidth:'12'},
        dark:      {show:'true', title:'BARCODE', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'center', frame:'true', shape:'rounded', radius:'16', frameColor:'#102033', frameWidth:'3', bg:'#ffffff', top:'true', bottom:'false', left:'false', right:'false', topColor:'#102033', bottomColor:'#102033', leftColor:'#102033', rightColor:'#102033', barcodeSize:'large', format:'normal', density:'scan', barHeight:'22', sideWidth:'12'},
        factory:   {show:'true', title:'WERKSTATT', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'left', frame:'true', shape:'square', radius:'0', frameColor:'#334155', frameWidth:'3', bg:'#f8fafc', top:'true', bottom:'true', left:'false', right:'false', topColor:'#334155', bottomColor:'#94a3b8', leftColor:'#334155', rightColor:'#334155', barcodeSize:'large', format:'wide', density:'scan', barHeight:'22', sideWidth:'12'},
        premium:   {show:'true', title:'PREMIUM', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'center', frame:'true', shape:'rounded', radius:'18', frameColor:'#b7791f', frameWidth:'3', bg:'#fffaf0', top:'true', bottom:'true', left:'false', right:'false', topColor:'#b7791f', bottomColor:'#2d3748', leftColor:'#b7791f', rightColor:'#b7791f', barcodeSize:'balanced', format:'normal', density:'balanced', barHeight:'22', sideWidth:'12'},
        quality:   {show:'true', title:'GEPRÜFT', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'center', frame:'true', shape:'cut', radius:'8', frameColor:'#16814f', frameWidth:'3', bg:'#f0fff4', top:'true', bottom:'false', left:'true', right:'false', topColor:'#16814f', bottomColor:'#16814f', leftColor:'#16814f', rightColor:'#16814f', barcodeSize:'large', format:'compact', density:'scan', barHeight:'20', sideWidth:'10'},
        shipping:  {show:'true', title:'VERSAND', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'left', frame:'true', shape:'file', radius:'10', frameColor:'#7c3aed', frameWidth:'2', bg:'#fbf8ff', top:'true', bottom:'false', left:'false', right:'true', topColor:'#7c3aed', bottomColor:'#7c3aed', leftColor:'#7c3aed', rightColor:'#f1913e', barcodeSize:'large', format:'wide', density:'scan', barHeight:'22', sideWidth:'14'},
        fileTag:   {show:'true', title:'DATEI', titleColor:'#102033', titleStyle:'plain', titleAlign:'left', frame:'true', shape:'file', radius:'8', frameColor:'#64748b', frameWidth:'2', bg:'#f8fafc', top:'false', bottom:'false', left:'true', right:'false', topColor:'#64748b', bottomColor:'#64748b', leftColor:'#64748b', rightColor:'#64748b', barcodeSize:'balanced', format:'wide', density:'balanced', barHeight:'16', sideWidth:'14'},
        serial:    {show:'true', title:'S/N', titleColor:'#102033', titleStyle:'plain', titleAlign:'right', frame:'true', shape:'square', radius:'0', frameColor:'#102033', frameWidth:'2', bg:'#ffffff', top:'false', bottom:'true', left:'false', right:'false', topColor:'#102033', bottomColor:'#102033', leftColor:'#102033', rightColor:'#102033', barcodeSize:'max', format:'compact', density:'many', barHeight:'10', sideWidth:'8'},
        cornerFlag:{show:'true', title:'INFO', titleColor:'#f1913e', titleStyle:'pill', titleAlign:'right', frame:'true', shape:'rounded', radius:'18', frameColor:'#f1913e', frameWidth:'2', bg:'#fffaf4', top:'false', bottom:'false', left:'true', right:'false', topColor:'#f1913e', bottomColor:'#f1913e', leftColor:'#f1913e', rightColor:'#f1913e', barcodeSize:'balanced', format:'normal', density:'balanced', barHeight:'16', sideWidth:'18'},
        ticket:    {show:'true', title:'TICKET', titleColor:'#ffffff', titleStyle:'bar', titleAlign:'center', frame:'true', shape:'ticket', radius:'18', frameColor:'#2563eb', frameWidth:'2', bg:'#ffffff', top:'true', bottom:'true', left:'false', right:'false', topColor:'#2563eb', bottomColor:'#f1913e', leftColor:'#2563eb', rightColor:'#2563eb', barcodeSize:'balanced', format:'wide', density:'balanced', barHeight:'20', sideWidth:'12'}
      };      const p = presets[tpl];
      if(!p) return;
      setDesignValue('showLabelTitle', p.show);
      setDesignValue('labelTitleText', p.title);
      setDesignValue('labelTitleColorText', p.titleColor); setDesignValue('labelTitleColor', p.titleColor);
      setDesignValue('labelTitleStyle', p.titleStyle);
      setDesignValue('labelTitleAlign', p.titleAlign || 'center');
      setDesignValue('labelFrameEnabled', p.frame);
      setDesignValue('labelShape', p.shape || 'rounded');
      setDesignValue('labelFrameRadius', p.radius);
      setDesignValue('labelFrameColorText', p.frameColor); setDesignValue('labelFrameColor', p.frameColor);
      setDesignValue('labelFrameWidth', p.frameWidth);
      setDesignValue('labelBgColorText', p.bg); setDesignValue('labelBgColor', p.bg);
      setDesignValue('labelTopBar', p.top); setDesignValue('labelBottomBar', p.bottom); setDesignValue('labelLeftBar', p.left); setDesignValue('labelRightBar', p.right);
      setDesignValue('labelTopBarColorText', p.topColor); setDesignValue('labelTopBarColor', p.topColor);
      setDesignValue('labelBottomBarColorText', p.bottomColor); setDesignValue('labelBottomBarColor', p.bottomColor);
      setDesignValue('labelLeftBarColorText', p.leftColor); setDesignValue('labelLeftBarColor', p.leftColor);
      setDesignValue('labelRightBarColorText', p.rightColor); setDesignValue('labelRightBarColor', p.rightColor);
      setDesignValue('labelValueText', 'false');
      setDesignValue('labelBarcodeSize', p.barcodeSize || 'balanced');
      setDesignValue('labelFormat', p.format || 'normal');
      setDesignValue('labelDensity', p.density || 'balanced');
      setDesignValue('labelBarHeight', p.barHeight || '16');
      setDesignValue('labelSideBarWidth', p.sideWidth || '12');
      buildList();
      generate();
      updateLoadedVersionLiveSoon();
      saveLocalDraftSoon();
    }
    function createLabelCell(item, design = labelDesign(), preview = false){
      const cell = document.createElement('div');
      cell.className = 'label-cell ' + templateClass(design.template) + ' label-barcode-' + (design.barcodeSize || 'balanced') + ' label-format-' + (design.labelFormat || 'normal') + ' label-density-' + (design.labelDensity || 'balanced') + ' label-shape-' + (design.labelShape || 'rounded');
      if((design.labelShape || 'rounded') === 'square'){
        cell.style.setProperty('border-radius','0px','important');
        cell.style.setProperty('clip-path','none','important');
      }
      cell.style.setProperty('--label-accent', design.titleColor);
      if(design.manualHeight && design.manualHeight !== 'auto') cell.style.minHeight = design.manualHeight + 'px';
      cell.style.setProperty('--label-bg', design.bgColor);
      cell.style.setProperty('--label-radius', design.radius + 'px');
      cell.style.setProperty('--title-align', design.titleAlign);
      cell.style.setProperty('--frame-color', design.frameColor);
      cell.style.setProperty('--frame-width', design.frameWidth + 'px');
      cell.style.setProperty('--bar-top-color', design.topBarColor);
      cell.style.setProperty('--bar-bottom-color', design.bottomBarColor);
      cell.style.setProperty('--bar-left-color', design.leftBarColor);
      cell.style.setProperty('--bar-right-color', design.rightBarColor);

      const wantsBarTitle = !!(design.showTitle && design.title && design.titleStyle === 'bar');
      const effectiveTopBar = design.topBar || (wantsBarTitle && design.pos === 'top');
      const effectiveBottomBar = design.bottomBar || (wantsBarTitle && design.pos === 'bottom');
      cell.style.setProperty('--bar-top-h', (effectiveTopBar ? design.barHeight : 0) + 'px');
      cell.style.setProperty('--bar-bottom-h', (effectiveBottomBar ? design.barHeight : 0) + 'px');
      cell.style.setProperty('--bar-side-w', ((design.leftBar || design.rightBar) ? design.sideBarWidth : 0) + 'px');

      let topBarEl = null;
      let bottomBarEl = null;
      if(effectiveTopBar){ topBarEl=document.createElement('span'); topBarEl.className='label-bar label-bar-top'; topBarEl.style.justifyContent=design.titleJustify; cell.appendChild(topBarEl); }
      if(effectiveBottomBar){ bottomBarEl=document.createElement('span'); bottomBarEl.className='label-bar label-bar-bottom'; bottomBarEl.style.justifyContent=design.titleJustify; cell.appendChild(bottomBarEl); }
      if(design.leftBar){ const b=document.createElement('span'); b.className='label-bar label-bar-left'; cell.appendChild(b); }
      if(design.rightBar){ const b=document.createElement('span'); b.className='label-bar label-bar-right'; cell.appendChild(b); }

      const inner = document.createElement('div');
      inner.className = 'label-inner';
      cell.appendChild(inner);

      function makeTitle(extraClass = ''){
        const title = document.createElement('div');
        let cls = 'label-title-text';
        if(design.titleStyle === 'pill') cls += ' label-title-pill';
        if(design.titleStyle === 'bar') cls += ' label-title-bar';
        if(extraClass) cls += ' ' + extraClass;
        title.className = cls;
        title.style.fontSize = (preview ? Math.max(design.titleSize + 2, 13) : design.titleSize) + 'px';
        title.style.color = design.titleColor;
        title.style.justifySelf = design.titleSelf;
        title.textContent = design.title;
        return title;
      }

      if(design.showTitle && design.title && design.titleStyle === 'bar'){
        const titleEl = makeTitle();
        if(design.pos === 'top' && topBarEl) topBarEl.appendChild(titleEl);
        if(design.pos === 'bottom' && bottomBarEl) bottomBarEl.appendChild(titleEl);
      } else if(design.showTitle && design.title && design.pos === 'top') inner.appendChild(makeTitle());

      const barcodeArea = document.createElement('div');
      barcodeArea.className = 'label-barcode-area';
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      barcodeArea.appendChild(svg);
      inner.appendChild(barcodeArea);

      const label = document.createElement('div');
      label.className = 'label-text';
      label.textContent = item.value;
      if(design.valueText) inner.appendChild(label);

      if(design.showTitle && design.title && design.titleStyle !== 'bar' && design.pos === 'bottom') inner.appendChild(makeTitle('label-title-bottom'));

      return {cell, svg, label};
    }
    function renderSingleLabelPreview(){
      const box = $('labelDesignPreview');
      if(!box) return;
      box.innerHTML = '';
      if(!validateCurrentInputs().ok){
        box.innerHTML = '<p class="field-note">Vorschau verfügbar, sobald die Eingabe gültig ist.</p>';
        return;
      }
      const raw = activeInputValue();
      const value = normalizeValue(raw) || typeInfo[currentType].sample;
      const item = {value, qty:1, note:''};
      const made = createLabelCell(item, labelDesign(), true);
      box.appendChild(made.cell);
      try { renderBarcodeToSvg(made.svg, item.value, true); } catch(e) { made.label.textContent = friendlyBarcodeError(); if(!made.label.parentNode) made.cell.appendChild(made.label); }
    }
    function renderSheet(){
      updatePrintLayoutVars();
      const codes = expandedCodes();
      $('sheetCount').textContent = `${codes.length} Etiketten`;
      const design = labelDesign();
      const pagesBox = $('sheetPages');
      const empty = $('sheetEmpty');
      const navigation = $('sheetNavigation');
      const sizeValidation = customLabelValidation();
      const printButtons = [$('btnPrintSheet'), $('btnPrintSheetBottom')];
      printButtons.forEach(button=>{ if(button) button.disabled = !sizeValidation.ok || !codes.length; });
      pagesBox.innerHTML = '';
      if(!codes.length || !sizeValidation.ok){
        empty.hidden = false;
        empty.textContent = sizeValidation.ok ? 'Keine Etiketten für die Druckvorschau.' : sizeValidation.message;
        navigation.hidden = true;
        $('sheetPageItems').textContent = '';
        return;
      }
      empty.hidden = true;
      const metrics = printLabelMetrics(design);
      const packing = sheetPacking(metrics);
      const density = design.labelDensity || 'balanced';
      const pageCount = Math.ceil(codes.length / packing.itemsPerPage);
      for(let pageIndex=0; pageIndex<pageCount; pageIndex++){
        const page = document.createElement('section');
        page.className = 'sheet-page';
        page.setAttribute('aria-label', `A4-Seite ${pageIndex + 1} von ${pageCount}`);
        const grid = document.createElement('div');
        grid.className = 'sheet-page-grid';
        if(density === 'many') grid.classList.add('label-sheet-compact');
        if(density === 'comfortable') grid.classList.add('label-sheet-comfortable');
        if(density === 'scan') grid.classList.add('label-sheet-scan');
        grid.style.setProperty('--label-print-width', metrics.width + 'mm');
        grid.style.setProperty('--label-print-height', metrics.height + 'mm');
        grid.style.setProperty('--sheet-columns', packing.columns);
        grid.style.setProperty('--sheet-rows', packing.rows);
        grid.style.setProperty('--sheet-margin', packing.margin + 'mm');
        grid.style.left = `${packing.margin / PRINT_LAYOUT.pageWidthMm * 100}%`;
        grid.style.top = `${packing.margin / PRINT_LAYOUT.pageHeightMm * 100}%`;
        grid.style.width = `${(packing.columns * metrics.width + (packing.columns - 1) * packing.gap) / PRINT_LAYOUT.pageWidthMm * 100}%`;
        grid.style.height = `${(packing.rows * metrics.height + (packing.rows - 1) * packing.gap) / PRINT_LAYOUT.pageHeightMm * 100}%`;
        grid.style.gridTemplateColumns = `repeat(${packing.columns}, ${metrics.width / (packing.columns * metrics.width + (packing.columns - 1) * packing.gap) * 100}%)`;
        grid.style.gridTemplateRows = `repeat(${packing.rows}, ${metrics.height / (packing.rows * metrics.height + (packing.rows - 1) * packing.gap) * 100}%)`;
        grid.style.columnGap = `${packing.gap / (packing.columns * metrics.width + (packing.columns - 1) * packing.gap) * 100}%`;
        grid.style.rowGap = `${packing.gap / (packing.rows * metrics.height + (packing.rows - 1) * packing.gap) * 100}%`;
        codes.slice(pageIndex * packing.itemsPerPage, (pageIndex + 1) * packing.itemsPerPage).forEach(item=>{
          const made = createLabelCell(item, design, false);
          grid.appendChild(made.cell);
          try { renderBarcodeToSvg(made.svg, item.value, true); } catch(e) { made.label.textContent = 'Fehler: ' + item.value; }
        });
        page.appendChild(grid);
        pagesBox.appendChild(page);
      }
      currentSheetPage = Math.min(currentSheetPage, pageCount - 1);
      updateSheetPageNavigation();
      const status = $('sheetLayoutStatus');
      if(status){
        status.textContent = `${packing.columns} × ${packing.rows} Etiketten pro Seite · ${packing.itemsPerPage} pro A4 · ${pageCount} ${pageCount === 1 ? 'Seite' : 'Seiten'} · Etikett ${formatMm(metrics.width)} × ${formatMm(metrics.height)} mm`;
      }
      renderSingleLabelPreview();
    }

    function formatMm(value){ return Number(value).toLocaleString('de-DE', {maximumFractionDigits:1}); }

    function formatMigratedMm(value){
      return String(Number(value.toFixed(4))).replace('.', ',');
    }

    function updateSheetPageNavigation(){
      const pages = [...document.querySelectorAll('#sheetPages .sheet-page')];
      pages.forEach((page,index)=>page.hidden = index !== currentSheetPage);
      const count = pages.length;
      $('sheetNavigation').hidden = count === 0;
      $('sheetPrev').disabled = currentSheetPage <= 0;
      $('sheetNext').disabled = currentSheetPage >= count - 1;
      $('sheetPageInfo').textContent = `Seite ${currentSheetPage + 1} von ${count}`;
      const items = pages[currentSheetPage]?.querySelectorAll('.label-cell').length || 0;
      $('sheetPageItems').textContent = `${items} ${items === 1 ? 'Etikett' : 'Etiketten'} auf dieser Seite`;
    }

    function printSheet(){
      const validation = customLabelValidation();
      if(!validation.ok) return;
      buildList();
      const printRoot = $('wsPrintRoot');
      const pages = [...document.querySelectorAll('#sheetPages > .sheet-page')];
      if(!printRoot || !pages.length) return;
      printRoot.replaceChildren(...pages.map(page=>{
        const clone = page.cloneNode(true);
        clone.hidden = false;
        clone.removeAttribute('hidden');
        return clone;
      }));
      window.print();
    }

    function clearPrintRoot(){ $('wsPrintRoot')?.replaceChildren(); }
    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
    function csvEscape(v){ return '"' + String(v ?? '').replace(/"/g,'""') + '"'; }
    function downloadCsv(){
      buildList();
      const rows = [['laufnummer','barcode_typ','barcode_inhalt','menge','modus','beschreibung','datum']];
      generatedCodes.forEach((item, idx)=>{
        rows.push([idx+1,currentType,item.value,item.qty || 1,currentMode,item.note || '',new Date().toISOString()]);
      });
      const csv = rows.map(r=>r.map(csvEscape).join(';')).join('\n');
      const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'barcode-werkstatt-serie.csv'; a.click(); URL.revokeObjectURL(a.href);
    }
    function syncColor(a,b){
      $(a).addEventListener('input',()=>{$(b).value=$(a).value;generate();renderSheet()});
      $(b).addEventListener('input',()=>{if(/^#[0-9a-fA-F]{6}$/.test($(b).value)){ $(a).value=$(b).value; generate(); renderSheet(); }});
    }
    function downloadSvg(){
      generate();
      const svg = $('barcodeSvg').outerHTML;
      const blob = new Blob([svg], {type:'image/svg+xml'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'barcode-werkstatt-plus.svg'; a.click(); URL.revokeObjectURL(a.href);
    }
    function downloadPng(){
      generate();
      const svg = $('barcodeSvg').outerHTML;
      const img = new Image();
      const blob = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 900; canvas.height = img.height || 260;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = $('bgColorText').value || '#ffffff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png'); a.download = 'barcode-werkstatt-plus.png'; a.click();
      };
      img.src = url;
    }

    const LOCAL_DRAFT_KEY = 'warenschmiede.barcodeWerkstatt.autosave.v1';
    let autosaveTimer = null;
    let isRestoringLocalDraft = false;

    function saveLocalDraftSoon(){
      if(isRestoringLocalDraft) return;
      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(saveLocalDraft, 350);
    }
    function saveLocalDraft(){
      try{
        const data = collectProjectState();
        data.localSavedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(data));
        const status = $('autosaveStatus');
        if(status) status.textContent = 'Lokaler Arbeitsstand gespeichert: ' + new Date().toLocaleString('de-DE');
      }catch(err){
        const status = $('autosaveStatus');
        if(status) status.textContent = 'Lokaler Arbeitsstand konnte nicht gespeichert werden.';
      }
    }
    function restoreLocalDraft(){
      const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
      if(!raw) return false;
      try{
        const data = JSON.parse(raw);
        if(!data || data.schema !== 'warenschmiede.barcodeWerkstatt.project') return false;
        isRestoringLocalDraft = true;
        applyProjectState(data);
        isRestoringLocalDraft = false;
        const status = $('autosaveStatus');
        if(status) {
          const saved = data.localSavedAt ? new Date(data.localSavedAt).toLocaleString('de-DE') : 'unbekannt';
          status.textContent = 'Lokaler Arbeitsstand wiederhergestellt: ' + saved;
        }
        return true;
      }catch(err){
        isRestoringLocalDraft = false;
        return false;
      }
    }
    function clearLocalDraft(){
      const ok = confirm('Lokalen Arbeitsstand im Browser wirklich löschen?\\n\\nDie heruntergeladenen JSON-Dateien bleiben natürlich erhalten.');
      if(!ok) return;
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      const status = $('autosaveStatus');
      if(status) status.textContent = 'Lokaler Arbeitsstand gelöscht.';
      toast('Lokaler Stand gelöscht');
    }


    function updateLoadedVersionLive(){
      if(isRestoringLocalDraft || !currentVersionId) return;
      const version = projectVersions.find(v => v.id === currentVersionId);
      if(!version) return;

      captureTypeDraft(currentType);
      const snapshot = snapshotState();
      snapshot.projectText = snapshot.projectText || {};
      snapshot.projectText.description = getValue('projectDescription') || '';

      version.title = getValue('versionTitle') || version.title || ('Version ' + version.number);
      version.note = getValue('versionNote') || '';
      version.projectDescription = getValue('projectDescription') || '';
      version.updatedAt = new Date().toISOString();
      version.barcodeType = currentType;
      version.mode = currentMode;
      version.codeCount = generatedCodes.length;
      version.state = snapshot;

      renderVersions();
    }
    function updateLoadedVersionLiveSoon(){
      if(isRestoringLocalDraft || !currentVersionId) return;
      clearTimeout(window.__wsVersionLiveTimer);
      window.__wsVersionLiveTimer = setTimeout(()=>{
        updateLoadedVersionLive();
        saveLocalDraftSoon();
        const status = $('projectStatus');
        if(status) status.textContent = `Version live aktualisiert. Für eine Datei-Sicherung später Projekt-JSON herunterladen.`;
      }, 350);
    }

    function projectSlug(){
      const raw = ($('projectName')?.value || 'barcode-projekt').trim() || 'barcode-projekt';
      return raw.toLowerCase()
        .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
        .replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'barcode_projekt';
    }
    function getValue(id){
      const el = $(id);
      return el ? el.value : '';
    }
    function setValue(id, value){
      const el = $(id);
      if(el) el.value = value ?? '';
    }
    function snapshotState(){
      captureTypeDraft(currentType);
      buildList();
      return {
        projectText: {
          description: getValue('projectDescription')
        },
        barcode: {
          type: currentType,
          mode: currentMode
        },
        inputs: {
          single: { value: getValue('barcodeValue') },
          copies: { value: getValue('copyValue'), count: getValue('copyCount'), note: getValue('copyNote') },
          series: {
            prefix: getValue('seriesPrefix'),
            suffix: getValue('seriesSuffix'),
            start: getValue('seriesStart'),
            count: getValue('seriesCount'),
            pad: getValue('seriesPad'),
            step: getValue('seriesStep'),
            note: getValue('seriesNote')
          },
          manual: { list: getValue('manualList') }
        },
        style: {
          lineColor: getValue('lineColorText'),
          bgColor: getValue('bgColorText'),
          barWidth: getValue('barWidth'),
          barHeight: getValue('barHeight'),
          showText: getValue('showText'),
          fontSize: getValue('fontSize')
        },
        layout: {
          labelsPerRow: getValue('labelsPerRow'),
          copiesPerCode: getValue('copiesPerCode'),
          labelSizePreset: getValue('labelSizePreset'),
          customLabelWidthMm: getValue('customLabelWidthMm'),
          customLabelHeightMm: getValue('customLabelHeightMm'),
          printMargin: getValue('printMargin'),
          labelGap: getValue('labelGap'),
          labelTemplate: getValue('labelTemplate'),
          showLabelTitle: getValue('showLabelTitle'),
          labelTitlePosition: getValue('labelTitlePosition'),
          labelTitleText: getValue('labelTitleText'),
          labelTitleColor: getValue('labelTitleColorText'),
          labelTitleSize: getValue('labelTitleSize'),
          labelTitleStyle: getValue('labelTitleStyle'),
          labelTitleAlign: getValue('labelTitleAlign'),
          labelValueText: getValue('labelValueText'),
          labelFrameEnabled: getValue('labelFrameEnabled'),
          labelShape: getValue('labelShape'),
          labelFrameRadius: getValue('labelFrameRadius'),
          labelFrameColor: getValue('labelFrameColorText'),
          labelFrameWidth: getValue('labelFrameWidth'),
          labelBgColor: getValue('labelBgColorText'),
          labelBarcodeSize: getValue('labelBarcodeSize'),
          labelFormat: getValue('labelFormat'),
          labelDensity: getValue('labelDensity'),
          labelManualHeight: getValue('labelManualHeight'),
          labelBarcodeTextSize: getValue('labelBarcodeTextSize'),
          labelTopBar: getValue('labelTopBar'),
          labelTopBarColor: getValue('labelTopBarColorText'),
          labelBottomBar: getValue('labelBottomBar'),
          labelBottomBarColor: getValue('labelBottomBarColorText'),
          labelBarHeight: getValue('labelBarHeight'),
          labelLeftBar: getValue('labelLeftBar'),
          labelLeftBarColor: getValue('labelLeftBarColorText'),
          labelRightBar: getValue('labelRightBar'),
          labelRightBarColor: getValue('labelRightBarColorText'),
          labelSideBarWidth: getValue('labelSideBarWidth')
        },
        generatedCodes: generatedCodes,
        typeDrafts: JSON.parse(JSON.stringify(typeDrafts || {}))
      };
    }
    function collectProjectState(){
      const snapshot = snapshotState();
      snapshot.projectText = snapshot.projectText || {};
      snapshot.projectText.description = getValue('projectDescription') || '';
      return {
        schema: 'warenschmiede.barcodeWerkstatt.project',
        schemaVersion: 5,
        tool: 'Barcode-Werkstatt Plus',
        exportedAt: new Date().toISOString(),
        project: {
          name: getValue('projectName'),
          author: getValue('projectAuthor'),
          description: getValue('projectDescription')
        },
        currentVersionId: currentVersionId,
        currentState: snapshot,
        versions: projectVersions
      };
    }
    function applySnapshotState(state, fallbackDescription){
      if(!state) return;

      if(state.projectText && Object.prototype.hasOwnProperty.call(state.projectText, 'description')){
        setValue('projectDescription', state.projectText.description || '');
      } else if(typeof fallbackDescription === 'string') {
        setValue('projectDescription', fallbackDescription);
      } else {
        setValue('projectDescription', '');
      }

      typeDrafts = JSON.parse(JSON.stringify(state.typeDrafts || {}));

      const type = state.barcode?.type || 'CODE128';
      const mode = state.barcode?.mode || 'single';

      setValue('barcodeValue', state.inputs?.single?.value || '');
      setValue('copyValue', state.inputs?.copies?.value || '');
      setValue('copyCount', state.inputs?.copies?.count || '1');
      setValue('copyNote', state.inputs?.copies?.note || '');

      setValue('seriesPrefix', state.inputs?.series?.prefix || '');
      setValue('seriesSuffix', state.inputs?.series?.suffix || '');
      setValue('seriesStart', state.inputs?.series?.start || '1');
      setValue('seriesCount', state.inputs?.series?.count || '1');
      setValue('seriesPad', state.inputs?.series?.pad || '4');
      setValue('seriesStep', state.inputs?.series?.step || '1');
      setValue('seriesNote', state.inputs?.series?.note || '');

      setValue('manualList', state.inputs?.manual?.list || '');

      setValue('lineColorText', state.style?.lineColor || '#102033');
      setValue('lineColor', state.style?.lineColor || '#102033');
      setValue('bgColorText', state.style?.bgColor || '#ffffff');
      setValue('bgColor', state.style?.bgColor || '#ffffff');
      setValue('barWidth', state.style?.barWidth || '2');
      setValue('barHeight', state.style?.barHeight || '100');
      setValue('showText', state.style?.showText || 'true');
      setValue('fontSize', state.style?.fontSize || '18');

      setValue('labelsPerRow', state.layout?.labelsPerRow || 'auto');
      setValue('copiesPerCode', state.layout?.copiesPerCode || '1');
      const savedPreset = state.layout?.labelSizePreset;
      const legacyScale = state.layout?.labelScale;
      let customWidth = state.layout?.customLabelWidthMm || '70,0';
      let customHeight = state.layout?.customLabelHeightMm || '35,0';
      if(savedPreset && (savedPreset === 'custom' || LABEL_SIZE_PRESETS[savedPreset])){
        setValue('labelSizePreset', savedPreset);
      } else if(legacyScale === 'custom'){
        setValue('labelSizePreset', 'custom');
      } else if(legacyScale && PRINT_LAYOUT.scale[legacyScale]){
        const oldFormat = PRINT_LAYOUT.format[state.layout?.labelFormat] || PRINT_LAYOUT.format.normal;
        const oldScale = PRINT_LAYOUT.scale[legacyScale];
        customWidth = formatMigratedMm(oldFormat.width * oldScale);
        customHeight = formatMigratedMm(oldFormat.height * oldScale);
        setValue('labelSizePreset', 'custom');
      } else {
        setValue('labelSizePreset', '70x36');
      }
      setValue('customLabelWidthMm', customWidth);
      setValue('customLabelHeightMm', customHeight);
      setValue('printMargin', state.layout?.printMargin || '12');
      setValue('labelGap', state.layout?.labelGap || '8');
      setValue('labelTemplate', state.layout?.labelTemplate || 'plain');
      setValue('showLabelTitle', state.layout?.showLabelTitle || 'false');
      setValue('labelTitlePosition', state.layout?.labelTitlePosition || 'top');
      setValue('labelTitleText', state.layout?.labelTitleText || 'SCAN ME');
      setValue('labelTitleColorText', state.layout?.labelTitleColor || '#102033'); setValue('labelTitleColor', state.layout?.labelTitleColor || '#102033');
      setValue('labelTitleSize', state.layout?.labelTitleSize || '12');
      setValue('labelTitleStyle', state.layout?.labelTitleStyle || 'plain');
      setValue('labelTitleAlign', state.layout?.labelTitleAlign || 'center');
      setValue('labelValueText', state.layout?.labelValueText || 'false');
      setValue('labelFrameEnabled', state.layout?.labelFrameEnabled || 'true');
      setValue('labelShape', state.layout?.labelShape || 'rounded');
      setValue('labelFrameRadius', state.layout?.labelFrameRadius || '16');
      setValue('labelFrameColorText', state.layout?.labelFrameColor || '#102033'); setValue('labelFrameColor', state.layout?.labelFrameColor || '#102033');
      setValue('labelFrameWidth', state.layout?.labelFrameWidth || '2');
      setValue('labelBgColorText', state.layout?.labelBgColor || '#ffffff'); setValue('labelBgColor', state.layout?.labelBgColor || '#ffffff');
      setValue('labelBarcodeSize', state.layout?.labelBarcodeSize || 'balanced');
      setValue('labelFormat', state.layout?.labelFormat || 'normal');
      setValue('labelDensity', state.layout?.labelDensity || 'balanced');
      setValue('labelManualHeight', state.layout?.labelManualHeight || 'auto');
      setValue('labelBarcodeTextSize', state.layout?.labelBarcodeTextSize || '11');
      setValue('labelTopBar', state.layout?.labelTopBar || 'false');
      setValue('labelTopBarColorText', state.layout?.labelTopBarColor || '#2f8edf'); setValue('labelTopBarColor', state.layout?.labelTopBarColor || '#2f8edf');
      setValue('labelBottomBar', state.layout?.labelBottomBar || 'false');
      setValue('labelBottomBarColorText', state.layout?.labelBottomBarColor || '#f1913e'); setValue('labelBottomBarColor', state.layout?.labelBottomBarColor || '#f1913e');
      setValue('labelBarHeight', state.layout?.labelBarHeight || '16');
      setValue('labelLeftBar', state.layout?.labelLeftBar || 'false');
      setValue('labelLeftBarColorText', state.layout?.labelLeftBarColor || '#102033'); setValue('labelLeftBarColor', state.layout?.labelLeftBarColor || '#102033');
      setValue('labelRightBar', state.layout?.labelRightBar || 'false');
      setValue('labelRightBarColorText', state.layout?.labelRightBarColor || '#102033'); setValue('labelRightBarColor', state.layout?.labelRightBarColor || '#102033');
      setValue('labelSideBarWidth', state.layout?.labelSideBarWidth || '12');

      captureTypeDraft(type);
      setType(type);
      setMode(mode);
      buildList();
      generate();
    }
    function applyProjectState(data){
      if(!data || data.schema !== 'warenschmiede.barcodeWerkstatt.project'){
        toast('Keine gültige Barcode-Projektdatei');
        return;
      }

      setValue('projectName', data.project?.name || 'Geladenes Barcode-Projekt');
      setValue('projectAuthor', data.project?.author || '');
      setValue('projectDescription', data.project?.description || '');

      if(Array.isArray(data.versions)){
        projectVersions = data.versions.map(v => {
          v.state = v.state || {};
          v.state.projectText = v.state.projectText || {};
          if(!Object.prototype.hasOwnProperty.call(v.state.projectText, 'description')){
            v.state.projectText.description = v.projectDescription || '';
          }
          if(!Object.prototype.hasOwnProperty.call(v, 'projectDescription')){
            v.projectDescription = v.state.projectText.description || '';
          }
          return v;
        });
      } else {
        projectVersions = [];
      }

      currentVersionId = data.currentVersionId || null;

      const state = data.currentState || {
        projectText: { description: data.project?.description || getValue('projectDescription') },
        barcode: data.barcode,
        inputs: data.inputs,
        style: data.style,
        layout: data.layout,
        generatedCodes: data.generatedCodes
      };

      applySnapshotState(state, data.project?.description || '');
      const loadedVersion = projectVersions.find(v => v.id === currentVersionId);
      if(loadedVersion){
        setValue('versionTitle', loadedVersion.title || ('Version ' + loadedVersion.number));
        setValue('versionNote', loadedVersion.note || '');
      } else {
        setValue('versionTitle','');
        setValue('versionNote','');
      }
      renderVersions();

      const status = $('projectStatus');
      if(status) status.textContent = `Projekt geladen: ${data.project?.name || 'ohne Namen'} · ${projectVersions.length} Version(en) im Verlauf`;
      saveLocalDraftSoon();
      toast('Projekt geladen');
    }
    function saveNewProjectVersion(){
      const snapshot = snapshotState();
      snapshot.projectText = snapshot.projectText || {};
      snapshot.projectText.description = getValue('projectDescription') || '';
      const maxNumber = projectVersions.reduce((max, v) => Math.max(max, Number(v.number || 0)), 0);
      const nextNumber = maxNumber + 1;
      const version = {
        id: 'v' + String(nextNumber).padStart(3,'0') + '_' + Date.now(),
        number: nextNumber,
        title: getValue('versionTitle') || `Version ${nextNumber}`,
        note: getValue('versionNote') || '',
        projectDescription: getValue('projectDescription') || '',
        createdAt: new Date().toISOString(),
        barcodeType: currentType,
        mode: currentMode,
        codeCount: generatedCodes.length,
        state: snapshot
      };
      projectVersions.push(version);
      currentVersionId = version.id;
      setValue('versionTitle', version.title);
      setValue('versionNote', version.note);
      renderVersions();
      const status = $('projectStatus');
      if(status) status.textContent = `Neue Version gespeichert: Version ${version.number} · ${version.codeCount} Codes. Änderungen daran werden jetzt live gespeichert.`;
      saveLocalDraftSoon();
      toast('Version gespeichert');
    }
    function loadProjectVersion(versionId){
      const version = projectVersions.find(v => v.id === versionId);
      if(!version){
        toast('Version nicht gefunden');
        return;
      }
      currentVersionId = version.id;
      setValue('versionTitle', version.title || ('Version ' + version.number));
      setValue('versionNote', version.note || '');
      applySnapshotState(version.state, version.projectDescription || '');
      renderVersions();
      const status = $('projectStatus');
      if(status) status.textContent = `Version ${version.number} geladen. Änderungen werden live in dieser Version gespeichert.`;
      saveLocalDraftSoon();
      toast('Version geladen');
    }
    function csvEscapeValue(v){
      return '"' + String(v ?? '').replace(/"/g,'""') + '"';
    }

    function excelTextValue(value){
      const raw = String(value ?? '');
      // Excel interpretiert lange reine Zahlen sonst als Zahl oder wissenschaftliche Schreibweise.
      // ="..." zwingt Excel zur Textanzeige und erhält führende Nullen.
      return '="' + raw.replace(/"/g,'""') + '"';
    }
    function csvRowsToText(rows){
      return '\ufeff' + rows.map(row => row.map(csvEscapeValue).join(';')).join('\n');
    }
    function buildCsvRowsFromCodes(codes, meta = {}){
      const rows = [[
        'laufnummer',
        'barcode_typ',
        'barcode_inhalt',
        'barcode_inhalt_excel',
        'menge',
        'modus',
        'beschreibung',
        'version',
        'versionstitel',
        'datum'
      ]];

      (codes || []).forEach((item, idx) => {
        const value = String(item.value ?? '');
        rows.push([
          idx + 1,
          meta.barcodeType || currentType || '',
          value,
          excelTextValue(value),
          item.qty || 1,
          meta.mode || currentMode || '',
          item.note || meta.note || '',
          meta.versionNumber || '',
          meta.versionTitle || '',
          meta.date || ''
        ]);
      });

      return rows;
    }
    function downloadCsvBlob(filename, rows){
      const csv = csvRowsToText(rows);
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    function downloadVersionCsv(versionId){
      const version = projectVersions.find(v => v.id === versionId);
      if(!version){
        toast('Version nicht gefunden');
        return;
      }

      const codes = version.state?.generatedCodes || [];
      const rows = buildCsvRowsFromCodes(codes, {
        barcodeType: version.barcodeType || version.state?.barcode?.type || '',
        mode: version.mode || version.state?.barcode?.mode || '',
        note: version.note || version.projectDescription || '',
        versionNumber: version.number || '',
        versionTitle: version.title || '',
        date: version.createdAt || ''
      });

      const name = (version.title || ('version_' + version.number))
        .toLowerCase()
        .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
        .replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || ('version_' + version.number);

      downloadCsvBlob(`${projectSlug()}_${name}.csv`, rows);
      toast('Excel-sichere Versions-CSV erstellt');
    }
    function deleteProjectVersion(versionId){
      const version = projectVersions.find(v => v.id === versionId);
      if(!version){
        toast('Version nicht gefunden');
        return;
      }

      const title = version.title || ('Version ' + version.number);
      const ok = confirm(`Version ${version.number} wirklich löschen?\n\n${title}\n\nDiese Version wird aus dem Projektverlauf entfernt. Speichere danach die Projekt-JSON erneut, wenn die Löschung dauerhaft sein soll.`);
      if(!ok) return;

      projectVersions = projectVersions.filter(v => v.id !== versionId);

      if(currentVersionId === versionId){
        currentVersionId = null;
        setValue('versionTitle','');
        setValue('versionNote','');
        const status = $('projectStatus');
        if(status) status.textContent = `Geladene Version ${version.number} wurde gelöscht. Der aktuelle Arbeitsstand bleibt im Tool, ist aber keiner Verlaufsversion mehr zugeordnet.`;
      } else {
        const status = $('projectStatus');
        if(status) status.textContent = `Version ${version.number} gelöscht. Projekt-JSON danach neu herunterladen, um die Änderung zu sichern.`;
      }

      renderVersions();
      saveLocalDraftSoon();
      toast('Version gelöscht');
    }
    function renderVersions(){
      const box = $('versionList');
      if(!box) return;
      if(!projectVersions.length){
        box.innerHTML = '<div class="version-empty">Noch keine Version im Projekt gespeichert.</div>';
        return;
      }
      box.innerHTML = projectVersions.slice().reverse().map(version => {
        const active = version.id === currentVersionId ? ' · aktuell geladen' : '';
        const date = version.createdAt ? new Date(version.createdAt).toLocaleString('de-DE') : '-';
        return `
          <div class="version-row">
            <strong>V${version.number}</strong>
            <div>
              <strong>${escapeHtml(version.title || ('Version ' + version.number))}${active}</strong>
              <span>${escapeHtml(version.barcodeType || '')} · ${escapeHtml(version.mode || '')} · ${version.codeCount || 0} Codes · ${date}</span>
              ${version.note ? `<span>${escapeHtml(version.note)}</span>` : ''}
              ${(!version.note && version.projectDescription) ? `<span>${escapeHtml(version.projectDescription).slice(0,120)}${String(version.projectDescription).length > 120 ? '…' : ''}</span>` : ''}
            </div>
            <div class="version-actions">
              <button type="button" onclick="loadProjectVersion('${version.id}')">Laden</button>
              <button class="csv-version" type="button" onclick="downloadVersionCsv('${version.id}')">CSV</button>
              <button class="delete-version" type="button" onclick="deleteProjectVersion('${version.id}')">Löschen</button>
            </div>
          </div>
        `;
      }).join('');
    }
    function downloadProjectJson(){
      const data = collectProjectState();
      const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json;charset=utf-8'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = projectSlug() + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
      const status = $('projectStatus');
      if(status) status.textContent = `Projekt-JSON erstellt: ${a.download} · ${projectVersions.length} Version(en)`;
      saveLocalDraftSoon();
    }
    function openProjectFile(){
      $('projectFileInput')?.click();
    }
    function readProjectFile(file){
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try{
          const data = JSON.parse(reader.result);
          applyProjectState(data);
        }catch(err){
          toast('JSON konnte nicht gelesen werden');
          const status = $('projectStatus');
          if(status) status.textContent = 'Fehler beim Laden: Datei ist keine gültige Barcode-Projekt-JSON.';
        }
      };
      reader.readAsText(file, 'utf-8');
    }
    function escapeHtml(s){
      return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
    }

    function downloadCSV(){ return typeof downloadCsv === 'function' ? downloadCsv() : null; }
    function exportCSV(){ return typeof downloadCsv === 'function' ? downloadCsv() : null; }


    function setupMiniHelp(){
      const pop = document.getElementById('miniHelpPop');
      if(!pop) return;

      function hide(){
        pop.style.display = 'none';
      }

      document.addEventListener('click', (event)=>{
        const btn = event.target.closest('.mini-help');
        if(!btn){
          if(!event.target.closest('.help-pop')) hide();
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const title = btn.dataset.title || 'Hinweis';
        const text = btn.dataset.text || '';
        pop.innerHTML = `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(text)}`;
        pop.style.display = 'block';

        const rect = btn.getBoundingClientRect();
        const margin = 10;
        let left = rect.left;
        let top = rect.bottom + margin;

        pop.style.left = left + 'px';
        pop.style.top = top + 'px';

        const popRect = pop.getBoundingClientRect();
        if(popRect.right > window.innerWidth - 12){
          left = window.innerWidth - popRect.width - 12;
        }
        if(popRect.bottom > window.innerHeight - 12){
          top = rect.top - popRect.height - margin;
        }

        pop.style.left = Math.max(12, left) + 'px';
        pop.style.top = Math.max(12, top) + 'px';
      });

      window.addEventListener('scroll', hide, true);
      window.addEventListener('resize', hide);
      document.addEventListener('keydown', (event)=>{
        if(event.key === 'Escape') hide();
      });
    }

    function organizeWorkspace(){
      const main = document.querySelector('.main');
      const editor = document.querySelector('.editor-panel');
      const input = document.querySelector('.input-panel');
      const preview = document.querySelector('.preview-card');
      const labelDesigner = document.querySelector('.label-design-card');
      const settingsPanel = document.querySelector('.settings-grid');
      const settingCards = settingsPanel ? [...settingsPanel.querySelectorAll(':scope > .settings-card, :scope > details > .advanced-content > .settings-card')] : [];
      const project = [...document.querySelectorAll('.advanced-box')].find(el=>el.querySelector('#projectName'));
      const printSheet = $('printSheet');
      if(!main || !editor || !input || !preview || !labelDesigner || settingCards.length < 3 || !project) return;

      const primary = document.createElement('div');
      primary.className = 'primary-workspace';
      const creator = document.createElement('div');
      creator.className = 'creator-column';
      creator.append(editor, input);
      primary.append(creator, preview);

      const advanced = document.createElement('section');
      advanced.className = 'advanced-sections';
      advanced.setAttribute('aria-label', 'Erweiterte Einstellungen');
      const makeDetails = (title, content, className='')=>{
        const details = document.createElement('details');
        details.className = `advanced-box workspace-accordion ${className}`.trim();
        const summary = document.createElement('summary');
        summary.textContent = title;
        const body = document.createElement('div');
        body.className = 'advanced-content';
        (Array.isArray(content) ? content : [content]).forEach(node=>body.append(node));
        details.append(summary, body);
        return details;
      };

      advanced.append(makeDetails('Etikett gestalten', labelDesigner, 'label-accordion'));
      const opticsControls = document.createElement('div');
      opticsControls.className = 'barcode-optics-controls';
      const opticsHeading = settingCards[0].querySelector('h3');
      if(opticsHeading){
        opticsHeading.innerHTML = 'Barcode-Optik <button class="mini-help" type="button" data-help="barcodeOptics" data-title="Barcode-Optik und Etikett" data-text="Diese Einstellungen betreffen die normale Barcode-Ausgabe. Für Etiketten gibt es unter ‚Etikett gestalten‘ zusätzliche Größen- und Klartext-Einstellungen." aria-label="Info zur Barcode-Optik">?</button>';
      }
      opticsControls.append(settingCards[0], settingCards[1]);

      const opticsPreview = document.createElement('div');
      opticsPreview.className = 'barcode-optics-preview';
      opticsPreview.innerHTML = '<div class="barcode-optics-preview-head"><strong>Barcode-Live-Vorschau</strong><span>Nur die normale Barcode-Ausgabe</span></div><div class="barcode-optics-stage"><svg id="barcodeOpticsPreview" aria-label="Live-Vorschau der Barcode-Optik"></svg><p id="barcodeOpticsPreviewEmpty" class="field-note" hidden>Vorschau verfügbar, sobald die Eingabe gültig ist.</p></div>';

      const opticsLayout = document.createElement('div');
      opticsLayout.className = 'barcode-optics-layout';
      opticsLayout.append(opticsControls, opticsPreview);

      const contrast = document.createElement('div');
      contrast.className = 'contrast-note';
      contrast.innerHTML = '<span id="contrastStatus" role="status"></span><button class="mini-help" type="button" data-help="scanContrast" data-title="Scan-Kontrast" data-text="Für zuverlässiges Scannen sind dunkle Striche auf hellem Hintergrund meist die sicherste Wahl. Farbige Kombinationen können je nach Scanner, Kamera, Drucker und Material schlechter funktionieren. Vor größeren Druckserien bitte einen Testscan durchführen." aria-label="Mehr zum Scan-Kontrast">?</button>';
      advanced.append(makeDetails('Barcode-Optik', [opticsLayout, contrast], 'optics-accordion'));
      advanced.append(makeDetails('Druckbogen & PDF', [settingCards[2], printSheet], 'print-accordion'));
      project.removeAttribute('open');
      project.querySelector('summary').textContent = 'Projekt & Verlauf';
      project.classList.add('workspace-accordion', 'project-accordion');
      advanced.append(project);

      main.replaceChildren(primary, advanced);
    }

    function updateContrastHint(){
      const status = $('contrastStatus');
      if(!status) return;
      const luminance = hex=>{
        const rgb = /^#([0-9a-f]{6})$/i.exec(hex || '');
        if(!rgb) return null;
        const values = [1,3,5].map(i=>parseInt(rgb[1].slice(i-1,i+1),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
        return .2126*values[0]+.7152*values[1]+.0722*values[2];
      };
      const a=luminance(getValue('lineColorText')), b=luminance(getValue('bgColorText'));
      const ratio = a === null || b === null ? 0 : (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const risky = ratio < 4.5 || a > b;
      status.className = risky ? 'contrast-warning' : 'contrast-ok';
      status.textContent = risky ? '! Diese Farbkombination könnte schlecht scannbar sein.' : '✓ Kontrast grundsätzlich günstig – Testscan empfohlen.';
    }

    document.addEventListener('DOMContentLoaded',()=>{
      populateLabelSizePresets();
      organizeWorkspace();
      $('toolMenuBtn').addEventListener('click',()=>window.WSToolMenu?.open());
      document.querySelectorAll('.type-btn').forEach(btn=>btn.addEventListener('click',()=>setType(btn.dataset.type)));
      document.querySelectorAll('.mode-btn').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));
      document.querySelectorAll('input,textarea,select').forEach(el=>{
        el.addEventListener('input',()=>{buildList();generate();updateContrastHint();updateLoadedVersionLiveSoon();saveLocalDraftSoon();});
        el.addEventListener('change',()=>{buildList();generate();updateContrastHint();updateLoadedVersionLiveSoon();saveLocalDraftSoon();});
      });
      syncColor('lineColor','lineColorText'); syncColor('bgColor','bgColorText');
      syncColor('labelTitleColor','labelTitleColorText');
      syncColor('labelFrameColor','labelFrameColorText');
      syncColor('labelBgColor','labelBgColorText');
      syncColor('labelTopBarColor','labelTopBarColorText');
      syncColor('labelBottomBarColor','labelBottomBarColorText');
      syncColor('labelLeftBarColor','labelLeftBarColorText');
      syncColor('labelRightBarColor','labelRightBarColorText');
      $('labelTemplate')?.addEventListener('change', applyLabelTemplate);
      $('btnBuildList').addEventListener('click',()=>{buildList();toast('Liste erzeugt')});
      $('btnCsv').addEventListener('click',downloadCsv);
      $('btnGenerate').addEventListener('click',generate);
      $('btnSvg').addEventListener('click',downloadSvg);
      $('btnPng').addEventListener('click',downloadPng);
      $('btnCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('payloadBox').textContent);toast('Barcode-Inhalt kopiert')}catch{toast('Kopieren nicht möglich')}});
      $('btnPrintSheet').addEventListener('click',printSheet);
      $('btnPrintSheetBottom').addEventListener('click',printSheet);
      $('sheetPrev').addEventListener('click',()=>{ if(currentSheetPage > 0){ currentSheetPage--; updateSheetPageNavigation(); } });
      $('sheetNext').addEventListener('click',()=>{ const count=document.querySelectorAll('#sheetPages .sheet-page').length; if(currentSheetPage < count - 1){ currentSheetPage++; updateSheetPageNavigation(); } });
      window.addEventListener('afterprint', clearPrintRoot);
      $('btnTheme').addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'});
      $('btnVersionSave')?.addEventListener('click',saveNewProjectVersion);
      $('btnProjectExport')?.addEventListener('click',downloadProjectJson);
      $('btnProjectImport')?.addEventListener('click',openProjectFile);
      $('projectFileInput')?.addEventListener('change',event=>readProjectFile(event.target.files?.[0]));
      $('btnLocalClear')?.addEventListener('click',clearLocalDraft);
      const helpDialog = $('helpDialog');
      const unlockHelpScroll = ()=>document.documentElement.classList.remove('dialog-open');
      $('btnHelp').addEventListener('click',()=>{document.documentElement.classList.add('dialog-open');helpDialog.showModal()});
      $('helpClose').addEventListener('click',()=>$('helpDialog').close());
      helpDialog.addEventListener('close', unlockHelpScroll);
      helpDialog.addEventListener('cancel', unlockHelpScroll);
      document.querySelectorAll('[data-help-tab]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const target = btn.dataset.helpTab;
          document.querySelectorAll('[data-help-tab]').forEach(b=>b.classList.toggle('active', b === btn));
          document.querySelectorAll('[data-help-page]').forEach(page=>{
            page.classList.toggle('active', page.dataset.helpPage === target);
          });
        });
      });
      updateNumericFieldState();
      updateDynamicLabels();
      updateStandardWarning();
      setupMiniHelp();
      updateContrastHint();
      const restored = restoreLocalDraft();
      if(!restored){
        buildList();
        generate();
        renderVersions();
        saveLocalDraftSoon();
      }
    });
