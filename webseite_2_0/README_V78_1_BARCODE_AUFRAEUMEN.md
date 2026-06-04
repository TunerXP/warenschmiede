# v78.1 Barcode-Werkstatt Plus · aufgeräumte Barcode-Arten und Tool-Menü-Fuß

## Wichtig
Diese Version arbeitet im Ordner `webseite_2_0` weiter.
Der zentrale Homepage-Aufbau bleibt erhalten.

## Dateien ersetzen
Kopiere:

`ws_v78_1_barcode_werkstatt_plus_aufraeumen/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

Optional zusätzlich ersetzen, wenn der Fußtext im kleinen W-TOOLS-Menü geändert werden soll:

`ws_v78_1_barcode_werkstatt_plus_aufraeumen/assets/js/ws-tool-menu.js`

nach:

`webseite_2_0/assets/js/ws-tool-menu.js`

## Änderungen
- Dropdown „Weitere Barcode-Arten vorbereiten“ aus der Barcode-Werkstatt entfernt.
- Hilfe-Tab „Weitere Typen“ entfernt.
- Im Tool werden nur noch aktive Barcode-Arten gezeigt:
  - Code128
  - EAN-13
  - EAN-8
  - Code39
  - ITF-14
- Kleine W-TOOLS-Menü-Fußzeile geändert:
  - vorher interner Hinweis zur zentralen Pflege
  - jetzt nur noch `Impressum · Datenschutz`

## Grundsatz
Neue Barcode-Arten werden später nicht als gesperrte Platzhalter angezeigt, sondern erst dann sauber eingebaut, wenn sie fachlich und technisch wirklich aktiv sind.
