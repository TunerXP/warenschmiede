const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const P = require('../tools/qr-werkstatt/payloads.js');
const build = (mode, values, options) => P.build(mode, values, options);

test('leere und ungültige URL-Zustände bleiben sicher', () => {
  assert.equal(build('url', {}).status, 'empty');
  for (const value of ['example.de', 'http://example.de', 'javascript:alert(1)', 'data:text/plain,x', 'https://exam ple.de']) assert.equal(build('url', { urlValue: value }).status, 'invalid');
  assert.deepEqual(build('url', { urlValue: 'https://example.de/a' }), { status:'valid', payload:'https://example.de/a', message:'' });
  for (const [mode,id] of [['review','reviewUrl'],['paymentlink','paymentUrl']]) assert.equal(build(mode, {[id]:'https://example.de'}).status, 'valid');
});

test('HTTPS- und PayPal-Links lehnen Zugangsdaten und fremde Hosts ab', () => {
  assert.equal(P.validateHttpsUrl('https://example.de'), true);
  assert.equal(P.validateHttpsUrl('https://name:pass@example.de'), false);
  assert.equal(P.validateHttpsUrl('https://paypal.com@evil.example'), false);
  for (const url of ['https://paypal.me/test', 'https://www.paypal.com/paypalme/test', 'https://www.paypal.com/checkoutnow?token=test']) {
    assert.equal(P.validatePaypalUrl(url), true);
    assert.equal(build('paypal', {paypalUrl:url}).status, 'valid');
  }
  for (const url of ['https://example.de', 'http://paypal.me/test', 'https://evilpaypal.com/test', 'https://paypal.com.evil.example/test', 'https://paypal.com@evil.example/test']) {
    assert.equal(P.validatePaypalUrl(url), false);
    assert.equal(build('paypal', {paypalUrl:url}).status, 'invalid');
  }
  assert.equal(build('paymentlink', {paymentUrl:'https://example.de'}).status, 'valid');
});

test('vCard nutzt echte CRLF, TYPE-Angaben und maskierte Sonderzeichen', () => {
  const result = build('vcard', { vcFirst:'Jörg', vcLast:'Müller, Test; \\', vcOrg:'Ähre', vcPhone:'+49 (151) 413-82732', vcEmail:'mail@example.de', vcUrl:'https://example.de', vcAddress:'Straße 1, Ort' });
  assert.equal(result.status, 'valid');
  assert.match(result.payload, /BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  assert.doesNotMatch(result.payload, /\\nVERSION/);
  assert.match(result.payload, /Müller\\, Test\\; \\\\/);
  assert.match(result.payload, /TEL;TYPE=CELL:\+4915141382732/);
  assert.match(result.payload, /EMAIL;TYPE=INTERNET:mail@example.de/);
  assert.match(result.payload, /URL:https:\/\/example.de/);
  assert.doesNotMatch(build('vcard', {vcOrg:'Firma'}).payload, /TEL|EMAIL|URL|ADR/);
});

test('Kommunikations-URIs werden normalisiert und encodiert', () => {
  assert.equal(build('email',{emailTo:'a@example.de',emailSubject:'Grüße & Test',emailBody:'Zeile 1\nZeile 2'}).payload, 'mailto:a@example.de?subject=Gr%C3%BC%C3%9Fe%20%26%20Test&body=Zeile%201%0D%0AZeile%202');
  assert.equal(build('phone',{phoneValue:'+49 (151) 413-82732'}).payload, 'tel:+4915141382732');
  assert.equal(build('whatsapp',{waPhone:'+49 151 41382732',waText:'Hallo Marco'}).payload, 'https://wa.me/4915141382732?text=Hallo%20Marco');
  assert.equal(build('sms',{smsPhone:'+49 151 41382732',smsText:'Hallo Marco'}).payload, 'sms:+4915141382732?body=Hallo%20Marco');
});

test('WhatsApp verlangt eine internationale Nummer ohne führende Null', () => {
  for (const value of ['+49 151 41382732', '+49 (151) 413-82732', '4915141382732']) {
    assert.equal(P.normalizeWhatsAppPhone(value), '4915141382732');
    assert.equal(build('whatsapp', {waPhone:value}).payload, 'https://wa.me/4915141382732');
  }
  for (const value of ['015141382732', '004915141382732', '+012345678', '123', 'abc', 'https://wa.me/49']) {
    assert.equal(P.normalizeWhatsAppPhone(value), '');
    assert.equal(build('whatsapp', {waPhone:value}).status, 'invalid');
  }
});

test('WLAN behandelt Pflichten, nopass, Sonderzeichen und Abschluss', () => {
  assert.equal(build('wifi',{}).status, 'empty');
  assert.equal(build('wifi',{wifiSsid:'Gast',wifiType:'WPA'}).status, 'invalid');
  assert.equal(build('wifi',{wifiSsid:'Werkstatt;Gast, A:B"\\',wifiType:'WPA',wifiPass:'Test,Netz',wifiHidden:'true'}).payload, 'WIFI:T:WPA;S:Werkstatt\\;Gast\\, A\\:B\\"\\\\;P:Test\\,Netz;H:true;;');
  assert.equal(build('wifi',{wifiSsid:'Gast',wifiType:'nopass'}).payload, 'WIFI:T:nopass;S:Gast;H:false;;');
});

test('Termin ist stabiles, UTC-basiertes iCalendar mit CRLF', () => {
  const values={eventUid:'stabil@example',eventTitle:'Prüfung, A;B',eventStart:'2026-08-02T10:00:00Z',eventEnd:'2026-08-02T11:00:00Z',eventLocation:'Ort',eventDesc:'Ä\nB'};
  const result=build('event',values,{now:'2026-08-01T09:00:00Z'});
  assert.equal(result.status,'valid'); assert.match(result.payload,/VERSION:2\.0\r\nPRODID:-\/\/Warenschmiede/);
  assert.match(result.payload,/UID:stabil@example/); assert.match(result.payload,/DTSTAMP:20260801T090000Z/); assert.match(result.payload,/DTSTART:20260802T100000Z/); assert.match(result.payload,/DTEND:20260802T110000Z/); assert.match(result.payload,/SUMMARY:Prüfung\\, A\\;B/);
  assert.equal(build('event',{...values,eventEnd:'2026-08-02T09:00:00Z'}).status,'invalid');
});

test('SEPA erhält interne Leerfelder, entfernt leere Endfelder und validiert EPC-Daten', () => {
  const base={sepaName:'Max Mustermann',sepaIban:'DE89 3704 0044 0532 0130 00',sepaPurpose:'Rechnung 1'};
  const result=build('sepa',{...base,sepaBic:'COBADEFF',sepaAmount:'12,5'});
  const fields=result.payload.split('\n');
  assert.equal(result.status,'valid'); assert.match(result.payload,/^BCD\n002\n1\nSCT\n/); assert.equal(fields[7],'EUR12.50');
  assert.equal(fields[8],''); assert.equal(fields[9],''); assert.equal(fields[10],'Rechnung 1');
  assert.equal(result.payload.endsWith('Rechnung 1'),true); assert.doesNotMatch(result.payload,/[\r\n]$/);
  const withoutPurpose=build('sepa',{...base,sepaPurpose:'',sepaBic:'',sepaAmount:''});
  assert.equal(withoutPurpose.status,'valid'); assert.equal(withoutPurpose.payload.endsWith('DE89370400440532013000'),true); assert.doesNotMatch(withoutPurpose.payload,/[\r\n]$/);
  assert.equal(build('sepa',{...base,sepaIban:'DE88 3704 0044 0532 0130 00'}).status,'invalid');
  assert.equal(build('sepa',{...base,sepaBic:'DEUTDEFF500'}).status,'valid');
  assert.equal(build('sepa',{...base,sepaAmount:'1.234'}).status,'invalid');
  assert.equal(build('sepa',{...base,sepaPurpose:'ä'.repeat(141)}).status,'invalid');
});

test('Terminzeiten belegen untereinander die Kartenbreite', () => {
  const html=fs.readFileSync('tools/QRCodeMasterPro.html','utf8');
  const eventForm=html.match(/<section class="form-section" data-form="event">([\s\S]*?)<\/section>/)[1];
  assert.match(eventForm,/<div class="row event-time-row">\s*<div class="field">[^<]*<label for="eventStart">[\s\S]*?id="eventStart"[\s\S]*?<div class="field">[^<]*<label for="eventEnd">[\s\S]*?id="eventEnd"[\s\S]*?<\/div>\s*<\/div>/);
  assert.equal((html.match(/class="row event-time-row"/g) || []).length,1);
  assert.match(html,/\.event-time-row\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(html,/\.event-time-row > \.field\{min-width:0\}/);
  assert.match(html,/\.event-time-row input\[type="datetime-local"\]\{width:100%;min-width:0;max-width:100%;box-sizing:border-box\}/);
  assert.match(html,/\.row\{display:grid;grid-template-columns:1fr 1fr;gap:10px\}/);
});

test('App- und Kartenlinks erlauben nur definierte Strukturen', () => {
  for(const url of ['https://example.de','market://details?id=x','itms-apps://apps.apple.com/app/x','ms-windows-store://pdp/?id=x']) assert.equal(build('app',{appUrl:url}).status,'valid');
  assert.equal(build('app',{appUrl:'file:///tmp/a'}).status,'invalid');
  assert.equal(build('maps',{}).status,'empty');
  assert.equal(build('maps',{mapsQuery:'Straße & Ort'}).payload,'https://www.google.com/maps/search/?api=1&query=Stra%C3%9Fe%20%26%20Ort');
});

test('V1-Migration erhält Zahlungslink und Crypto-URI als normalen Text', () => {
  const w=P.migrateLegacyState({mode:'wero',values:{weroFallbackUrl:'https://pay.example'}});
  assert.equal(w.mode,'paymentlink'); assert.equal(w.values.paymentUrl,'https://pay.example');
  const c=P.migrateLegacyState({mode:'crypto',values:{cryptoType:'bitcoin',cryptoAddress:'abc',cryptoAmount:'1.2',cryptoLabel:'Alt'}});
  assert.equal(c.mode,'text'); assert.equal(c.values.textValue,'bitcoin:abc?amount=1.2&label=Alt');
});

test('unterstützte Modi sind zentral unveränderlich und entfernte Modi ungültig', () => {
  assert.equal(Object.isFrozen(P.SUPPORTED_MODES), true);
  assert.deepEqual(P.SUPPORTED_MODES, ['url','text','maps','review','vcard','email','phone','whatsapp','sms','sepa','paypal','paymentlink','wifi','event','app']);
  for (const mode of ['wero', 'crypto', 'unbekannt']) assert.equal(build(mode, {}).status, 'invalid');
});

test('Oberfläche und Hilfe bieten nur aktuelle QR-Arten', () => {
  const html=fs.readFileSync('tools/QRCodeMasterPro.html','utf8'); const help=fs.readFileSync('tools/qr-werkstatt/hilfe.html','utf8');
  assert.doesNotMatch(html,/data-mode="(?:wero|crypto)"|data-form="(?:wero|crypto)"/);
  assert.doesNotMatch(help,/Wero|Crypto|Wallet|Seed-Phrasen/i);
  assert.match(html,/App-\/Download-Link/); assert.match(help,/SEPA \/ GiroCode[\s\S]*Banking-App/);
});

test('SEPA / GiroCode erklärt den Scanweg einheitlich, ohne den technischen Modus umzubenennen', () => {
  const html=fs.readFileSync('tools/QRCodeMasterPro.html','utf8');
  const help=fs.readFileSync('tools/qr-werkstatt/hilfe.html','utf8');
  assert.match(html, /data-mode="sepa"[^>]*>[\s\S]*?SEPA \/ GiroCode/);
  assert.match(html, /sepa:'SEPA \/ GiroCode'/);
  assert.match(html, /sepa:\['SEPA \/ GiroCode','Empfänger, IBAN, Betrag, Verwendungszweck'\]/);
  for(const term of ['Banking-App','Fotoüberweisung','GiroCode','QR-Code','Scan2Bank','BCD-Rohdaten','Empfänger','IBAN','Betrag','Verwendungszweck']) {
    assert.match(html, new RegExp(term));
    assert.match(help, new RegExp(term));
  }
  assert.match(html, /normaler Kamera- oder QR-Scanner[\s\S]*Das ist kein Fehler/);
  assert.match(html, /nicht mit dem normalen Kamera-Scanner/);
  assert.match(help, /normaler QR-Scanner[\s\S]*nicht[^.]*fehlerhaft/);
  assert.doesNotMatch(`${html}\n${help}`, /VR Banking App|Volksbank/i);
});
