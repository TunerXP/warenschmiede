(function () {
  'use strict';

  var currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var decimalFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var integerFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  var percentFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var percentIntegerFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = $(id);
    if (!el) {
      return;
    }
    el.textContent = value == null ? '' : String(value);
  }

  function toggleElement(id, show) {
    var el = $(id);
    if (!el) {
      return false;
    }
    var isVisible = !!show;
    el.hidden = !isVisible;
    if (isVisible) {
      el.setAttribute('aria-hidden', 'false');
    } else {
      el.setAttribute('aria-hidden', 'true');
    }
    return isVisible;
  }

  function toggleNode(node, show) {
    if (!node) {
      return false;
    }
    var isVisible = !!show;
    node.hidden = !isVisible;
    if (isVisible) {
      node.setAttribute('aria-hidden', 'false');
    } else {
      node.setAttribute('aria-hidden', 'true');
    }
    return isVisible;
  }

  function formatCurrency(value) {
    var number = typeof value === 'number' ? value : 0;
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return currencyFormatter.format(number);
  }

  function formatDecimal(value) {
    var number = typeof value === 'number' ? value : 0;
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return decimalFormatter.format(number);
  }

  function formatInteger(value) {
    var number = typeof value === 'number' ? value : 0;
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return integerFormatter.format(number);
  }

  function formatPercent(value) {
    var number = typeof value === 'number' ? value : 0;
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return percentFormatter.format(number);
  }

  function formatPercentInteger(value) {
    var number = typeof value === 'number' ? value : 0;
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return percentIntegerFormatter.format(number);
  }

  function formatMinutesDisplay(totalMinutes) {
    var rounded = Math.round(typeof totalMinutes === 'number' ? totalMinutes : 0);
    if (!rounded) {
      return '0\u00A0min';
    }
    var hoursPart = Math.floor(rounded / 60);
    var minutesPart = Math.abs(rounded % 60);
    if (hoursPart > 0) {
      if (minutesPart === 0) {
        return hoursPart + '\u00A0h';
      }
      return hoursPart + '\u00A0h ' + minutesPart + '\u00A0min';
    }
    return minutesPart + '\u00A0min';
  }

  function normalizeString(value) {
    return value == null ? '' : String(value).trim();
  }

  function joinPostal(postal, city, fallback) {
    var postalValue = normalizeString(postal);
    var cityValue = normalizeString(city);
    if (!postalValue && !cityValue) {
      return fallback || '';
    }
    if (!postalValue) {
      return cityValue;
    }
    if (!cityValue) {
      return postalValue;
    }
    return postalValue + ' ' + cityValue;
  }

  var PRINT_STORAGE_PREFIX = 'ws:print:';
  var PRINT_STORAGE_PARAM = 'k';

  function safeStorage(type) {
    try {
      var storage = window[type];
      if (!storage) {
        return null;
      }
      var testKey = '__ws_print_test__' + Math.random().toString(16).slice(2);
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return storage;
    } catch (error) {
      return null;
    }
  }
  function normalizePrintTarget(value) {
    var normalized = normalizeString(value).toLowerCase();
    if (normalized === 'angebot') {
      return 'offer';
    }
    if (normalized === 'rechnung') {
      return 'invoice';
    }
    if (normalized === 'ergebnis') {
      return 'result';
    }
    if (normalized === 'offer' || normalized === 'invoice' || normalized === 'result') {
      return normalized;
    }
    return '';
  }

  function resolvePayloadKeyFromQuery() {
    var search = window.location.search || '';
    if (!search) {
      return '';
    }
    var key = '';
    try {
      var params = new URLSearchParams(search);
      key = params.get(PRINT_STORAGE_PARAM) || '';
    } catch (error) {
      var match = search.match(new RegExp('[?&]' + PRINT_STORAGE_PARAM + '=([^&#]+)'));
      if (match && match[1]) {
        key = decodeURIComponent(match[1]);
      }
    }
    var normalized = normalizeString(key);
    if (!normalized) {
      return '';
    }
    return normalized.replace(/[^a-z0-9_-]/gi, '');
  }

  function loadPayloadByKey(key) {
    return new Promise(function (resolve) {
      if (!key) {
        resolve(null);
        return;
      }
      var storage = safeStorage('sessionStorage');
      if (!storage) {
        resolve(null);
        return;
      }
      var storageKey = PRINT_STORAGE_PREFIX + key;
      var serialized = storage.getItem(storageKey);
      if (!serialized) {
        resolve(null);
        return;
      }
      storage.removeItem(storageKey);
      try {
        resolve(JSON.parse(serialized));
      } catch (error) {
        console.warn('print payload parse error', error);
        resolve(null);
      }
    });
  }

  function setPartName(state) {
    var hasPartName = !!(state && state.hasPartName && state.partName);
    var partText = hasPartName ? state.partName : '';
    var header = $('printHeaderPartName');
    var headerValue = $('printHeaderPartNameValue');
    if (header) {
      header.hidden = !hasPartName;
      header.setAttribute('aria-hidden', hasPartName ? 'false' : 'true');
      if (headerValue) {
        headerValue.textContent = partText;
      }
    }
    var inputsNote = $('printInputsPartName');
    var inputsValue = $('printInputsPartNameValue');
    if (inputsNote) {
      inputsNote.hidden = !hasPartName;
      inputsNote.setAttribute('aria-hidden', hasPartName ? 'false' : 'true');
      if (inputsValue) {
        inputsValue.textContent = partText;
      }
    }
    if (hasPartName) {
      document.title = partText + ' – ' + document.title;
    }
  }

  function resolvePostalCity(entity) {
    if (!entity) {
      return { postal: '', city: '' };
    }
    var postal = normalizeString(entity.plz);
    var city = normalizeString(entity.ort);
    if (!postal && !city && entity.plzOrt) {
      var parts = String(entity.plzOrt).split(/\s+/);
      if (parts.length > 1) {
        postal = parts.shift() || '';
        city = parts.join(' ');
      } else if (parts.length === 1) {
        postal = parts[0];
      }
    }
    return { postal: postal, city: city };
  }

  function renderProviderCustomer(state, snapshot) {
    var offerState = state.offer || {};
    var provider = snapshot.provider || {};
    var customer = snapshot.customer || {};
    var vendorColumn = document.querySelector('[data-print-column="vendor"]');
    var customerColumn = document.querySelector('[data-print-column="customer"]');
    var hasVendor = !!offerState.hasVendor;
    var hasCustomer = !!offerState.hasCustomer;
    if (vendorColumn) {
      toggleNode(vendorColumn, hasVendor);
    }
    if (customerColumn) {
      toggleNode(customerColumn, hasCustomer);
    }
    var container = document.querySelector('[data-print-columns]');
    if (container) {
      toggleNode(container, hasVendor || hasCustomer);
    }

    var providerPostal = resolvePostalCity(provider);
    setText('printOfferVendorName', normalizeString(provider.firma || provider.name));
    setText('printOfferVendorContact', normalizeString(provider.ansprechpartner));
    setText('printOfferVendorStreet', normalizeString(provider.strasse));
    setText('printOfferVendorPostal', joinPostal(providerPostal.postal, providerPostal.city, ''));
    setText('printOfferVendorEmail', normalizeString(provider.email));
    setText('printOfferVendorPhone', normalizeString(provider.telefon));
    renderBankInfo(provider);

    var customerPostal = resolvePostalCity(customer);
    setText('printOfferCustomerName', normalizeString(customer.firma || customer.name));
    setText('printOfferCustomerContact', normalizeString(customer.ansprechpartner));
    setText('printOfferCustomerStreet', normalizeString(customer.strasse));
    setText('printOfferCustomerPostal', joinPostal(customerPostal.postal, customerPostal.city, ''));
    setText('printOfferCustomerEmail', normalizeString(customer.email));
    setText('printOfferCustomerPhone', normalizeString(customer.telefon));
  }

  function renderBankInfo(provider) {
    var bankName = normalizeString(provider.bank);
    var iban = normalizeString(provider.iban);
    var bic = normalizeString(provider.bic);
    var vat = normalizeString(provider.ustId);

    setText('printBankName', bankName);
    setText('printBankIban', iban);
    setText('printBankBic', bic);
    setText('printBankVat', vat);

    var visible = false;
    visible = toggleElement('printBankNameField', !!bankName) || visible;
    visible = toggleElement('printBankIbanField', !!iban) || visible;
    visible = toggleElement('printBankBicField', !!bic) || visible;
    visible = toggleElement('printBankVatField', !!vat) || visible;
    toggleElement('printBankInfo', visible);
  }

  function renderOfferMeta(docs) {
    var hasNumber = normalizeString(docs.angebotsNr).length > 0;
    var hasDate = normalizeString(docs.angebotsdatum).length > 0;
    var hasValid = normalizeString(docs.gueltigBis).length > 0;
    var hasDelivery = normalizeString(docs.lieferzeit).length > 0;
    var hasPayment = normalizeString(docs.zahlungsbedingungen).length > 0;

    setText('printOfferNumber', normalizeString(docs.angebotsNr) || '–');
    setText('printOfferDate', formatDisplayDate(docs.angebotsdatum) || '–');
    setText('printOfferValidUntil', formatDisplayDate(docs.gueltigBis) || '–');
    setText('printOfferDelivery', normalizeString(docs.lieferzeit) || '–');
    setText('printOfferPayment', normalizeString(docs.zahlungsbedingungen) || '–');

    var metaVisible = false;
    metaVisible = toggleElement('printOfferMetaNumber', hasNumber) || metaVisible;
    metaVisible = toggleElement('printOfferMetaDate', hasDate || normalizeString(docs.angebotsdatum).length > 0) || metaVisible;
    metaVisible = toggleElement('printOfferMetaValid', hasValid) || metaVisible;
    metaVisible = toggleElement('printOfferMetaDelivery', hasDelivery) || metaVisible;
    metaVisible = toggleElement('printOfferMetaPayment', hasPayment) || metaVisible;
    toggleElement('printOfferMetaContainer', metaVisible);
  }

  function renderInvoiceMeta(docs) {
    var hasNumber = normalizeString(docs.rechnungsNr).length > 0;
    var hasDate = normalizeString(docs.rechnungsdatum).length > 0;
    var hasService = normalizeString(docs.leistungsdatum).length > 0;
    setText('printInvoiceNumber', normalizeString(docs.rechnungsNr) || '–');
    setText('printInvoiceDateMeta', formatDisplayDate(docs.rechnungsdatum) || '–');
    setText('printInvoiceServiceDate', formatDisplayDate(docs.leistungsdatum) || '–');
    var visible = false;
    visible = toggleElement('printInvoiceMetaNumber', hasNumber) || visible;
    visible = toggleElement('printInvoiceMetaDate', hasDate) || visible;
    visible = toggleElement('printInvoiceMetaService', hasService) || visible;
    toggleElement('printInvoiceMetaContainer', visible);
  }

  function formatDisplayDate(value) {
    var raw = normalizeString(value);
    if (!raw) {
      return '';
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      var parts = raw.split('-');
      if (parts.length === 3) {
        return parts[2] + '.' + parts[1] + '.' + parts[0];
      }
    }
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(raw)) {
      return raw;
    }
    return raw;
  }

  function renderOfferPage(payload) {
    var state = payload.state || {};
    var snapshot = payload.snapshot || {};
    var docs = snapshot.docs || {};
    renderProviderCustomer(state, snapshot);
    renderOfferMeta(docs);

    var vatAmount = payload.computed ? payload.computed.vatAmount : 0;
    var vatIncluded = !!state.vatIncluded && vatAmount > 0.0005;

    var description = state.hasPartName ? state.partName : '3D-Druck gemäß Spezifikation';
    setText('printOfferDescription', description || '–');
    setText('printOfferQuantity', '1');
    setText('printOfferUnitPrice', formatCurrency(state.net));
    setText('printOfferLineTotal', formatCurrency(state.net));
    setText('printOfferSummaryNet', formatCurrency(state.net));
    setText('printOfferSummaryGross', formatCurrency(state.gross));

    var grossRow = $('printOfferGrossRow');
    if (grossRow) {
      var showGross = !!state.vatIncluded && vatAmount > 0.0005;
      grossRow.hidden = !showGross;
      grossRow.setAttribute('aria-hidden', showGross ? 'false' : 'true');
    }
    var summaryNote = $('printOfferSummaryNote');
    if (summaryNote) {
      if (!state.vatIncluded || vatAmount <= 0.0005) {
        summaryNote.textContent = 'Hinweis: §19 UStG – keine Umsatzsteuer.';
        summaryNote.hidden = false;
        summaryNote.setAttribute('aria-hidden', 'false');
      } else {
        summaryNote.textContent = '';
        summaryNote.hidden = true;
        summaryNote.setAttribute('aria-hidden', 'true');
      }
    }

    setText('printOfferPaymentInline', normalizeString(docs.zahlungsbedingungen) || '–');
    renderOfferNote(payload);
  }

  function renderOfferNote(payload) {
    var offerNote = resolvePrintNote(payload, 'offer');
    updateNoteBlock('printOfferNoteBlock', 'printOfferNoteValue', offerNote);
  }

  function renderInvoicePage(payload) {
    var state = payload.state || {};
    var snapshot = payload.snapshot || {};
    var docs = snapshot.docs || {};
    renderProviderCustomer(state, snapshot);
    renderOfferMeta(docs);
    renderInvoiceMeta(docs);

    var vatAmount = payload.computed ? payload.computed.vatAmount : 0;
    var vatIncluded = !!state.vatIncluded && vatAmount > 0.0005;

    var description = state.hasPartName ? state.partName : '3D-Druck gemäß Spezifikation';
    setText('printInvoiceDescription', description || '–');
    setText('printInvoiceQuantity', '1');
    setText('printInvoiceUnitPrice', formatCurrency(state.net));
    setText('printInvoiceNet', formatCurrency(state.net));
    setText('printInvoiceSubtotal', formatCurrency(state.net));
    setText('printInvoiceVat', formatCurrency(vatAmount));
    setText('printInvoiceGross', formatCurrency(state.gross));
    var vatRowVisible = !!state.vatIncluded && vatAmount > 0.0005;
    toggleElement('printInvoiceVatRow', vatRowVisible);
    var vatRateValue = 0;
    if (state.vatIncluded && state.net > 0.0005) {
      vatRateValue = Math.max(((state.gross - state.net) / state.net) * 100, 0);
    }
    setText('printInvoiceVatRate', vatRowVisible ? formatPercentInteger(vatRateValue) + '\u00A0%' : '');

    var vatNote = $('printInvoiceVatNote');
    if (vatNote) {
      if (state.vatIncluded && vatAmount > 0.0005) {
        vatNote.textContent = '';
        vatNote.hidden = true;
        vatNote.setAttribute('aria-hidden', 'true');
      } else {
        vatNote.textContent = 'Gemäß §19 UStG wird keine Umsatzsteuer ausgewiesen.';
        vatNote.hidden = false;
        vatNote.setAttribute('aria-hidden', 'false');
      }
    }

    var computed = payload.computed || {};
    var hasPaidDate = normalizeString(computed.paidDate).length > 0;
    var paid = computed.paid === true && hasPaidDate;
    var paidLine = $('printInvoicePaidLine');
    var paidDate = $('printInvoicePaidDate');
    if (paidLine) {
      if (paid) {
        if (paidDate) {
          paidDate.textContent = formatDisplayDate(computed.paidDate) || '–';
        }
        paidLine.hidden = false;
        paidLine.setAttribute('aria-hidden', 'false');
      } else {
        paidLine.hidden = true;
        paidLine.setAttribute('aria-hidden', 'true');
      }
    }
    var dueLine = $('printInvoiceDueLine');
    var dueDate = $('printInvoiceDueDate');
    if (dueLine) {
      var dueText = !paid ? normalizeString(computed.dueDateText) : '';
      if (dueText) {
        if (dueDate) {
          dueDate.textContent = dueText;
        }
        dueLine.hidden = false;
        dueLine.setAttribute('aria-hidden', 'false');
      } else {
        dueLine.hidden = true;
        dueLine.setAttribute('aria-hidden', 'true');
      }
    }
    var paymentContainer = $('printInvoicePayment');
    if (paymentContainer) {
      var showPayment = (!paidLine || !paidLine.hidden) || (!dueLine || !dueLine.hidden);
      paymentContainer.hidden = !showPayment;
      paymentContainer.setAttribute('aria-hidden', showPayment ? 'false' : 'true');
    }
    var paidStamp = $('printPaidStamp');
    if (paidStamp) {
      paidStamp.hidden = !paid;
      paidStamp.setAttribute('aria-hidden', paid ? 'false' : 'true');
    }

    renderInvoiceNote(payload);
  }

  function renderInvoiceNote(payload) {
    var invoiceNote = resolvePrintNote(payload, 'invoice');
    updateNoteBlock('printInvoiceNoteBlock', 'printInvoiceNoteValue', invoiceNote);
  }

  function resolvePrintNote(payload, type) {
    var computed = (payload && payload.computed) || {};
    var stateNotes = (payload && payload.state && payload.state.notes) || {};
    var raw = '';
    if (type === 'offer') {
      raw = typeof computed.noteOffer === 'string' ? computed.noteOffer : '';
      if (!raw && typeof stateNotes.offer === 'string') {
        raw = stateNotes.offer;
      }
    } else if (type === 'invoice') {
      raw = typeof computed.noteInvoice === 'string' ? computed.noteInvoice : '';
      if (!raw && typeof stateNotes.invoice === 'string') {
        raw = stateNotes.invoice;
      }
    }
    return normalizeString(raw || '');
  }

  function updateNoteBlock(blockId, valueId, noteValue) {
    var block = $(blockId);
    var valueNode = $(valueId);
    if (!block || !valueNode) {
      return;
    }
    var hasText = !!noteValue;
    valueNode.textContent = hasText ? noteValue : '–';
    if (hasText) {
      valueNode.classList.remove('print-note-text--placeholder');
    } else {
      valueNode.classList.add('print-note-text--placeholder');
    }
    block.hidden = false;
    block.setAttribute('aria-hidden', 'false');
  }

  function renderResultPage(payload) {
    var state = payload.state || {};
    var computed = payload.computed || {};
    var snapshot = payload.snapshot || {};
    setPartName(state);

    var vatNote = $('printVatNote');
    if (vatNote) {
      if (state.vatIncluded) {
        vatNote.textContent = '';
        vatNote.hidden = true;
        vatNote.setAttribute('aria-hidden', 'true');
      } else {
        vatNote.textContent = 'Hinweis: §19 UStG – keine Umsatzsteuer.';
        vatNote.hidden = false;
        vatNote.setAttribute('aria-hidden', 'false');
      }
    }

    var materialTotal = state.pro && Number.isFinite(state.pro.materialTotal) ? state.pro.materialTotal : state.materialCost;
    setText('printMaterialTotal', formatCurrency(materialTotal));
    setText('printEnergyCost', formatCurrency(state.energyCost));
    setText('printTimeCost', formatCurrency(state.pro && state.pro.timeCost ? state.pro.timeCost : 0));
    setText('printMachineCost', formatCurrency(state.pro && state.pro.machineCost ? state.pro.machineCost : 0));

    var hasMargin = state.pro && Number.isFinite(state.pro.marginValue) && Math.abs(state.pro.marginValue) > 0.005;
    var hasFixed = state.pro && Number.isFinite(state.pro.fixedCost) && Math.abs(state.pro.fixedCost) > 0.005;
    var hasDiscount = state.pro && Number.isFinite(state.pro.discountValue) && Math.abs(state.pro.discountValue) > 0.005;
    setText('printMargin', '+\u00A0' + formatCurrency(state.pro && state.pro.marginValue ? state.pro.marginValue : 0));
    setText('printFixedCost', '+\u00A0' + formatCurrency(state.pro && state.pro.fixedCost ? state.pro.fixedCost : 0));
    setText('printDiscount', '\u2013\u00A0' + formatCurrency(state.pro && state.pro.discountValue ? state.pro.discountValue : 0));

    var adjustmentsGroup = document.querySelector('[data-print-group="adjustments"]');
    if (adjustmentsGroup) {
      var showAdjustments = (hasMargin || hasFixed || hasDiscount) && state.pro && state.pro.enabled;
      toggleNode(adjustmentsGroup, showAdjustments);
    }
    var separatorAdjustments = document.querySelector('[data-print-separator="after-adjustments"]');
    if (separatorAdjustments) {
      var shouldShowSeparator = adjustmentsGroup ? !adjustmentsGroup.hidden : false;
      toggleNode(separatorAdjustments, shouldShowSeparator);
    }

    var subtotal = state.pro && state.pro.enabled ? state.pro.subtotal : state.standardSubtotal;
    setText('printSubtotal', formatCurrency(subtotal));
    setText('printNet', formatCurrency(state.net));
    setText('printGross', formatCurrency(state.gross));

    var chartData = computed.chart || null;
    var chartEnabled = !!(computed.chartEnabled && chartData && chartData.hasData);
    var chartSection = $('printChartSection');
    if (chartSection) {
      toggleNode(chartSection, chartEnabled);
      if (chartEnabled) {
        renderChart($('printChartBars'), chartData);
        setText('printChartTotal', 'Gesamtkosten (netto): ' + formatCurrency(state.net));
        var chartHint = $('printChartHint');
        if (chartHint) {
          chartHint.hidden = false;
          chartHint.setAttribute('aria-hidden', 'false');
        }
      }
    }
    var resultGrid = $('printResultGrid');
    if (resultGrid) {
      resultGrid.classList.add('calc-print__result-grid--single');
    }

    var noteCard = $('printNoteCard');
    var noteValue = $('printNoteValue');
    var proNote = state.pro && state.pro.note ? normalizeString(state.pro.note) : '';
    if (noteCard && noteValue) {
      if (proNote) {
        noteValue.textContent = proNote;
        noteCard.hidden = false;
        noteCard.setAttribute('aria-hidden', 'false');
      } else {
        noteValue.textContent = '';
        noteCard.hidden = true;
        noteCard.setAttribute('aria-hidden', 'true');
      }
    }

    renderInputsPage(state, snapshot);
  }

  function renderChart(container, data) {
    if (!container) {
      return;
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    if (!data || !Array.isArray(data.items) || !data.items.length) {
      return;
    }
    var total = data.positiveTotal > 0 ? data.positiveTotal : 1;
    data.items.forEach(function (item) {
      var value = Number.isFinite(item.value) ? item.value : 0;
      if (value <= 0) {
        return;
      }
      var share = value / total;
      var width = share > 0 ? Math.max(Math.min(share * 100, 100), 3) : 0;
      var bar = document.createElement('div');
      bar.className = 'calc-print__bar calc-print__bar--' + item.key;
      bar.setAttribute('role', 'listitem');
      var percentText = formatPercentInteger(share * 100) + '\u00A0%';
      bar.setAttribute('aria-label', item.label + ': ' + formatCurrency(value) + ' (' + percentText.replace('\u00A0', ' ') + ')');

      var label = document.createElement('span');
      label.className = 'calc-print__bar-label';
      label.textContent = item.label + ': ' + formatCurrency(value) + ' (' + percentText + ')';

      var track = document.createElement('div');
      track.className = 'calc-print__bar-track';
      var fill = document.createElement('span');
      fill.className = 'calc-print__bar-fill';
      fill.setAttribute('aria-hidden', 'true');
      fill.style.width = width + '%';
      track.appendChild(fill);

      bar.appendChild(label);
      bar.appendChild(track);
      container.appendChild(bar);
    });
    if (data.discountValue > 0) {
      var discountShare = data.positiveTotal > 0 ? data.discountValue / data.positiveTotal : 0;
      var discountWidth = discountShare > 0 ? Math.max(Math.min(discountShare * 100, 100), 3) : 0;
      var discountBar = document.createElement('div');
      discountBar.className = 'calc-print__bar calc-print__bar--discount';
      discountBar.setAttribute('role', 'listitem');
      var discountPercent = formatPercentInteger(discountShare * 100) + '\u00A0%';
      discountBar.setAttribute('aria-label', 'Rabatt: – ' + formatCurrency(data.discountValue) + ' (' + discountPercent.replace('\u00A0', ' ') + ')');
      var discountLabel = document.createElement('span');
      discountLabel.className = 'calc-print__bar-label';
      discountLabel.textContent = 'Rabatt: – ' + formatCurrency(data.discountValue) + ' (' + discountPercent + ')';
      var discountTrack = document.createElement('div');
      discountTrack.className = 'calc-print__bar-track';
      var discountFill = document.createElement('span');
      discountFill.className = 'calc-print__bar-fill';
      discountFill.setAttribute('aria-hidden', 'true');
      discountFill.style.width = discountWidth + '%';
      discountTrack.appendChild(discountFill);
      discountBar.appendChild(discountLabel);
      discountBar.appendChild(discountTrack);
      container.appendChild(discountBar);
    }
  }

  function renderInputsPage(state, snapshot) {
    var pro = state.pro || {};
    var inputs = state.inputs || {};
    setText('printMaterial', normalizeString(state.materialLabel) || '–');
    setText('printMaterialPrice', formatDecimal(state.pricePerKg) + '\u00A0€/kg');
    setText('printMode', normalizeString(state.modeLabel) || '–');
    setText('printWeight', formatInteger(state.weight) + '\u00A0g');
    setText('printLength', formatDecimal(state.length) + '\u00A0m');
    setText('printWastePercent', formatPercentInteger(pro.wastePercent) + '\u00A0%');
    setText('printErrorRate', formatPercentInteger(pro.materialErrorPercent) + '\u00A0%');

    setText('printDuration', formatMinutesDisplay(state.hours * 60));
    setText('printHourlyRate', formatCurrency(pro.hourlyRate) + '/h');
    setText('printSetupMinutes', formatInteger(pro.setupMinutes) + '\u00A0min');
    setText('printProPrintMinutes', formatInteger(pro.printMinutes) + '\u00A0min');
    setText('printFinishingMinutes', formatInteger(pro.finishingMinutes) + '\u00A0min');

    setText('printPower', formatInteger(state.power) + '\u00A0W');
    setText('printEnergyPrice', formatDecimal(state.energyPrice) + '\u00A0€/kWh');
    setText('printLoadFactor', formatInteger(state.loadFactor) + '\u00A0%');
    setText('printMachineHourly', formatCurrency(pro.machineHourly) + '/h');
    setText('printMachinePurchase', formatCurrency(pro.machinePurchase));
    setText('printMachineLifetime', formatInteger(pro.machineLifetime) + '\u00A0h');

    setText('printProfitMargin', formatPercentInteger(pro.profitMargin) + '\u00A0%');
    setText('printDiscountPercent', formatPercentInteger(pro.discountPercent) + '\u00A0%');
    setText('printFixedCostInput', formatCurrency(pro.fixedCostBase));
    setText('printPackagingCost', formatCurrency(pro.packagingCost));
    setText('printShippingCost', formatCurrency(pro.shippingCost));
    setText('printMaterialDensity', formatDecimal(pro.materialDensity) + '\u00A0g/cm³');
    setText('printNozzle', normalizeString(pro.nozzle) || '–');

    toggleInputRow('weight', !!inputs.weight);
    toggleInputRow('length', !!inputs.length);
    toggleInputRow('wastePercent', !!inputs.wastePercent);
    toggleInputRow('errorRate', !!inputs.errorRate);
    toggleInputRow('duration', !!inputs.duration);
    toggleInputRow('hourlyRate', !!inputs.hourlyRate);
    toggleInputRow('setupMinutes', !!inputs.setupMinutes);
    toggleInputRow('printMinutes', !!inputs.printMinutes);
    toggleInputRow('finishingMinutes', !!inputs.finishingMinutes);
    toggleInputRow('power', !!inputs.power);
    toggleInputRow('energyPrice', !!inputs.energyPrice);
    toggleInputRow('loadFactor', !!inputs.loadFactor);
    toggleInputRow('machineHourlyRate', !!inputs.machineHourlyRate);
    toggleInputRow('machinePurchase', !!inputs.machinePurchase);
    toggleInputRow('machineLifetime', !!inputs.machineLifetime);
    toggleInputRow('profitMargin', !!inputs.profitMargin);
    toggleInputRow('discountPercent', !!inputs.discountPercent);
    toggleInputRow('fixedCost', !!inputs.fixedCost);
    toggleInputRow('packagingCost', !!inputs.packagingCost);
    toggleInputRow('shippingCost', !!inputs.shippingCost);
    toggleInputRow('materialDensity', !!inputs.materialDensity);
    toggleInputRow('materialNozzle', !!inputs.materialNozzle);

    var proEnabled = !!(state.pro && state.pro.enabled);
    toggleProSpecificRows(proEnabled);

  }

  function toggleInputRow(key, show) {
    var selector = '[data-input-row="' + key + '"]';
    var rows = document.querySelectorAll(selector);
    if (!rows.length) {
      return;
    }
    rows.forEach(function (row) {
      toggleNode(row, show);
    });
  }

  function toggleProSpecificRows(enabled) {
    var proRows = document.querySelectorAll('[data-pro-row="true"]');
    proRows.forEach(function (row) {
      var shouldShow = enabled && !row.hasAttribute('data-input-row') ? true : enabled;
      toggleNode(row, shouldShow);
    });
    var proWrapper = $('printProParams');
    if (proWrapper) {
      proWrapper.hidden = !enabled;
      proWrapper.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    }
  }

  function renderCommon(payload) {
    var state = payload.state || {};
    setPartName(state);
  }

  function renderPayload(target, payload) {
    renderCommon(payload);
    if (target === 'offer') {
      renderOfferPage(payload);
    } else if (target === 'invoice') {
      renderInvoicePage(payload);
    } else if (target === 'result') {
      renderResultPage(payload);
    } else {
      throw new Error('Unbekannter Druckmodus.');
    }
  }

  function hasRenderableContent(root) {
    if (!root) {
      return false;
    }
    if (root.querySelector('[data-page]')) {
      return true;
    }
    return root.children && root.children.length > 0;
  }

  function renderError(message, headingText) {
    var root = document.getElementById('printRoot');
    if (!root) {
      document.body.textContent = message;
      return;
    }
    if (hasRenderableContent(root)) {
      console.warn('print render warning:', message);
      return;
    }
    root.innerHTML = '';
    var errorWrapper = document.createElement('div');
    errorWrapper.className = 'print-error';
    var heading = document.createElement('h1');
    heading.textContent = headingText || 'Druckdaten nicht verfügbar';
    var paragraph = document.createElement('p');
    paragraph.textContent = message;
    errorWrapper.appendChild(heading);
    errorWrapper.appendChild(paragraph);
    root.appendChild(errorWrapper);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var targetAttr = document.body && document.body.getAttribute('data-print-target');
    var renderTarget = normalizePrintTarget(targetAttr) || 'offer';
    var payloadKey = resolvePayloadKeyFromQuery();
    if (!payloadKey) {
      renderError('Bitte den Rechner neu laden und erneut drucken.', 'Keine Druckdaten gefunden');
      return;
    }
    loadPayloadByKey(payloadKey)
      .then(function (payload) {
        if (!payload) {
          renderError('Bitte den Rechner neu laden und erneut drucken.', 'Keine Druckdaten gefunden');
          return;
        }
        try {
          renderPayload(renderTarget, payload);
        } catch (error) {
          console.error('print render error', error);
          renderError(error && error.message ? error.message : 'Unbekannter Fehler.', 'Fehler beim Rendern');
        }
      })
      .catch(function (error) {
        console.error('print render load error', error);
        renderError('Bitte den Rechner neu laden und erneut drucken.', 'Keine Druckdaten gefunden');
      });
  });
})();
