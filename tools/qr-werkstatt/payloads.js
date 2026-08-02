(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WSQRPayloads = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const result = (status, payload = '', message = '') => ({ status, payload, message });
  const SUPPORTED_MODES = Object.freeze(['url', 'text', 'maps', 'review', 'vcard', 'email', 'phone', 'whatsapp', 'sms', 'sepa', 'paypal', 'paymentlink', 'wifi', 'event', 'app']);
  const empty = () => result('empty', '', 'Bitte zuerst die benötigten Daten eingeben.');
  const invalid = message => result('invalid', '', message);
  const valid = payload => result('valid', payload, '');
  const clean = value => String(value ?? '').trim();
  const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);

  function normalizePhone(value) {
    const input = clean(value);
    if (!input || !/^\+?[\d\s()\-]+$/.test(input)) return '';
    const normalized = (input.startsWith('+') ? '+' : '') + input.replace(/\D/g, '');
    return /^\+?\d{6,15}$/.test(normalized) ? normalized : '';
  }

  function normalizeWhatsAppPhone(value) {
    const input = clean(value);
    if (!input || !/^\+?[\d\s()\-]+$/.test(input) || input.startsWith('00')) return '';
    const digits = input.replace(/\D/g, '');
    return /^[1-9]\d{6,14}$/.test(digits) ? digits : '';
  }

  function validateHttpsUrl(value) {
    const input = clean(value);
    if (!input || /\s/.test(input)) return false;
    try {
      const parsed = new URL(input);
      return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
    } catch { return false; }
  }

  function validatePaypalUrl(value) {
    if (!validateHttpsUrl(value)) return false;
    const hostname = new URL(clean(value)).hostname.toLowerCase();
    return hostname === 'paypal.me' || hostname === 'www.paypal.me' || hostname === 'paypal.com' || hostname.endsWith('.paypal.com');
  }

  function escapeVCardText(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }
  function escapeICalText(value) { return escapeVCardText(value); }
  function escapeWifiValue(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/([;,":])/g, '\\$1');
  }

  function validateIban(value) {
    const iban = clean(value).replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    let remainder = 0;
    for (const char of rearranged) {
      const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
      for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
    }
    return remainder === 1;
  }

  function normalizeSepaAmount(value) {
    const input = clean(value);
    if (!input) return '';
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(input)) return null;
    const amount = Number(input.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999.99) return null;
    return `EUR${amount.toFixed(2)}`;
  }

  const utc = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  };
  const utf8Length = value => typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(value).length : unescape(encodeURIComponent(value)).length;
  function foldICalLine(line) {
    const parts = []; let current = '';
    for (const char of line) {
      if (utf8Length(current + char) > (parts.length ? 74 : 75)) { parts.push(current); current = char; }
      else current += char;
    }
    parts.push(current);
    return parts.join('\r\n ');
  }

  function build(mode, values = {}, options = {}) {
    if (!SUPPORTED_MODES.includes(mode)) return invalid('Diese QR-Art wird nicht unterstützt.');
    const v = id => clean(values[id]);
    const httpsModes = { url: 'urlValue', review: 'reviewUrl', paymentlink: 'paymentUrl' };
    if (httpsModes[mode]) {
      const value = v(httpsModes[mode]);
      if (!value) return empty();
      return validateHttpsUrl(value) ? valid(value) : invalid('Bitte eine vollständige Webadresse mit https:// eingeben.');
    }
    if (mode === 'paypal') {
      const value = v('paypalUrl');
      if (!value) return empty();
      return validatePaypalUrl(value) ? valid(value) : invalid('Bitte einen vollständigen offiziellen PayPal-Link eingeben.');
    }
    if (mode === 'text') return v('textValue') ? valid(v('textValue')) : empty();
    if (mode === 'maps') return v('mapsQuery') ? valid(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v('mapsQuery'))}`) : empty();
    if (mode === 'app') {
      const value = v('appUrl');
      if (!value) return empty();
      if (/\s/.test(value)) return invalid('Bitte einen vollständigen App- oder Download-Link eingeben.');
      try {
        const parsed = new URL(value);
        return ['https:', 'market:', 'itms-apps:', 'ms-windows-store:'].includes(parsed.protocol) ? valid(value) : invalid('Erlaubt sind https:// sowie unterstützte App-Store-Links.');
      } catch { return invalid('Bitte einen vollständigen App- oder Download-Link eingeben.'); }
    }
    if (mode === 'vcard') {
      const first = v('vcFirst'), last = v('vcLast'), org = v('vcOrg');
      if (!first && !last && !org) return empty();
      const phone = v('vcPhone') ? normalizePhone(v('vcPhone')) : '';
      if (v('vcPhone') && !phone) return invalid('Bitte eine gültige Telefonnummer eingeben.');
      if (v('vcEmail') && !emailValid(v('vcEmail'))) return invalid('Bitte eine gültige E-Mail-Adresse eingeben.');
      if (v('vcUrl') && !validateHttpsUrl(v('vcUrl'))) return invalid('Bitte für die Website eine vollständige HTTPS-Adresse eingeben.');
      const display = clean(`${first} ${last}`) || org;
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeVCardText(last)};${escapeVCardText(first)};;;`, `FN:${escapeVCardText(display)}`];
      if (org) lines.push(`ORG:${escapeVCardText(org)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (v('vcEmail')) lines.push(`EMAIL;TYPE=INTERNET:${v('vcEmail')}`);
      if (v('vcUrl')) lines.push(`URL:${v('vcUrl')}`);
      if (v('vcAddress')) lines.push(`ADR;TYPE=WORK:;;${escapeVCardText(v('vcAddress'))};;;;`);
      lines.push('END:VCARD'); return valid(lines.join('\r\n'));
    }
    if (mode === 'email') {
      const to = v('emailTo'); if (!to) return empty();
      if (!emailValid(to)) return invalid('Bitte eine gültige E-Mail-Adresse eingeben.');
      const params = [];
      if (v('emailSubject')) params.push(`subject=${encodeURIComponent(v('emailSubject'))}`);
      if (v('emailBody')) params.push(`body=${encodeURIComponent(v('emailBody').replace(/\r\n|\r|\n/g, '\r\n'))}`);
      return valid(`mailto:${to}${params.length ? `?${params.join('&')}` : ''}`);
    }
    if (['phone', 'whatsapp', 'sms'].includes(mode)) {
      const id = mode === 'phone' ? 'phoneValue' : mode === 'whatsapp' ? 'waPhone' : 'smsPhone';
      if (!v(id)) return empty();
      const phone = mode === 'whatsapp' ? normalizeWhatsAppPhone(v(id)) : normalizePhone(v(id));
      if (mode === 'whatsapp' && !phone) return invalid('Bitte die WhatsApp-Nummer international mit Ländervorwahl eingeben, zum Beispiel +49 …');
      if (!phone) return invalid('Bitte eine gültige internationale Telefonnummer eingeben.');
      if (mode === 'phone') return valid(`tel:${phone}`);
      if (mode === 'whatsapp') return valid(`https://wa.me/${phone}${v('waText') ? `?text=${encodeURIComponent(v('waText'))}` : ''}`);
      return valid(`sms:${phone}${v('smsText') ? `?body=${encodeURIComponent(v('smsText'))}` : ''}`);
    }
    if (mode === 'wifi') {
      if (!v('wifiSsid')) return empty();
      const type = v('wifiType') || 'WPA';
      if (!['WPA', 'WEP', 'nopass'].includes(type)) return invalid('Bitte eine unterstützte WLAN-Sicherheit wählen.');
      if (type !== 'nopass' && !v('wifiPass')) return invalid('Bitte das WLAN-Passwort eingeben.');
      const password = type === 'nopass' ? '' : `P:${escapeWifiValue(v('wifiPass'))};`;
      return valid(`WIFI:T:${type};S:${escapeWifiValue(v('wifiSsid'))};${password}H:${v('wifiHidden') === 'true'};;`);
    }
    if (mode === 'event') {
      if (!v('eventTitle') && !v('eventStart')) return empty();
      if (!v('eventTitle') || !v('eventStart')) return invalid('Bitte Titel und Startzeit des Termins eingeben.');
      const start = utc(v('eventStart')), end = v('eventEnd') ? utc(v('eventEnd')) : '';
      if (!start) return invalid('Bitte eine gültige Startzeit eingeben.');
      if (v('eventEnd') && (!end || new Date(v('eventEnd')) <= new Date(v('eventStart')))) return invalid('Die Endzeit muss nach der Startzeit liegen.');
      const uid = v('eventUid') || options.uid;
      if (!uid) return invalid('Für den Termin konnte keine Ereignis-ID erzeugt werden.');
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Warenschmiede//QR-Werkstatt Plus//DE', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${options.now ? utc(options.now) : utc(new Date())}`, `DTSTART:${start}`];
      if (end) lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${escapeICalText(v('eventTitle'))}`);
      if (v('eventLocation')) lines.push(`LOCATION:${escapeICalText(v('eventLocation'))}`);
      if (v('eventDesc')) lines.push(`DESCRIPTION:${escapeICalText(v('eventDesc'))}`);
      lines.push('END:VEVENT', 'END:VCALENDAR'); return valid(lines.map(foldICalLine).join('\r\n'));
    }
    if (mode === 'sepa') {
      if (!v('sepaName') && !v('sepaIban')) return empty();
      if (!v('sepaName')) return invalid('Bitte den Namen des Zahlungsempfängers eingeben.');
      const iban = v('sepaIban').replace(/\s/g, '').toUpperCase();
      if (!validateIban(iban)) return invalid('Bitte eine gültige IBAN eingeben.');
      const bic = v('sepaBic').toUpperCase();
      if (bic && !/^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(bic)) return invalid('Die BIC muss 8 oder 11 gültige Zeichen enthalten.');
      const amount = normalizeSepaAmount(v('sepaAmount'));
      if (amount === null) return invalid('Bitte einen positiven Betrag mit höchstens zwei Nachkommastellen eingeben.');
      if (v('sepaName').length > 70) return invalid('Der Empfängername darf höchstens 70 Zeichen lang sein.');
      if (/\r|\n/.test(values.sepaPurpose || '') || v('sepaPurpose').length > 140) return invalid('Der Verwendungszweck darf höchstens 140 Zeichen und keine Zeilenumbrüche enthalten.');
      const fields = ['BCD', '002', '1', 'SCT', bic, v('sepaName'), iban, amount, '', '', v('sepaPurpose'), ''];
      while (fields.length && fields[fields.length - 1] === '') fields.pop();
      const payload = fields.join('\n');
      if (utf8Length(payload) > 331) return invalid('Die SEPA-Daten überschreiten die zulässige Gesamtlänge.');
      return valid(payload);
    }
    return invalid('Diese QR-Art wird nicht unterstützt.');
  }

  function migrateLegacyState(state) {
    if (!state || typeof state !== 'object') return state;
    const migrated = { ...state, values: { ...(state.values || {}) } };
    if (migrated.mode === 'wero') {
      migrated.mode = 'paymentlink';
      if (!migrated.values.paymentUrl && migrated.values.weroFallbackUrl) migrated.values.paymentUrl = migrated.values.weroFallbackUrl;
    } else if (migrated.mode === 'crypto') {
      migrated.mode = 'text';
      const address = clean(migrated.values.cryptoAddress);
      if (address) {
        const params = [];
        if (clean(migrated.values.cryptoAmount)) params.push(`amount=${encodeURIComponent(clean(migrated.values.cryptoAmount))}`);
        if (clean(migrated.values.cryptoLabel)) params.push(`label=${encodeURIComponent(clean(migrated.values.cryptoLabel))}`);
        migrated.values.textValue = `${clean(migrated.values.cryptoType) || 'bitcoin'}:${address}${params.length ? `?${params.join('&')}` : ''}`;
      } else migrated.values.textValue = '';
    }
    return migrated;
  }

  return { SUPPORTED_MODES, build, normalizePhone, normalizeWhatsAppPhone, validateHttpsUrl, validatePaypalUrl, escapeVCardText, escapeICalText, escapeWifiValue, validateIban, normalizeSepaAmount, migrateLegacyState };
});
