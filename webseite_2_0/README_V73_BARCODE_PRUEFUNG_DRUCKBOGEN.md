# v73 Barcode-Werkstatt Plus · Prüfung & Druckbogen

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v73_barcode_werkstatt_plus_pruefung_druckbogen/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu
- Eingabeprüfung mit grün/rot Status
- Pflichtfelder werden je Modus geprüft
- EAN/ITF: Zahlenlänge wird geprüft
- Code39: erlaubte Zeichen werden geprüft
- Code128: leerer Inhalt wird bemängelt
- Statusbox erklärt, was fehlt oder falsch ist

## Druckbogen
- A4-Rand:
  - ohne Rand
  - klein
  - normal
  - groß
- Etikettenabstand:
  - eng
  - normal
  - groß
- A4-Hinweis im Tool

## JSON
Die neuen Druckbogenwerte werden mitgespeichert:
- printMargin
- labelGap

## Bewusst zurückgestellt
- Projektbericht
- neue Barcode-Typen

Erst sollen Prüfung, Hilfe und Druckbogen sauber sitzen.
