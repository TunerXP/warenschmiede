# v63 Barcode-Werkstatt Plus · Übersicht & Profi-Struktur

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v63_barcode_werkstatt_plus_uebersicht_profi/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Ziel
Das Tool wird weiter ausgebaut, aber nicht überladen.

## Neu
- Bereich `Weitere Barcode-Arten vorbereiten` als Dropdown
  - UPC-A
  - UPC-E
  - ISBN-13
  - GS1-128
  - DataMatrix
  - PDF417
  - PZN/PZN8
  - SSCC-18
- Diese Typen sind noch deaktiviert, aber als Roadmap sichtbar
- Hinweise bei EAN/ITF: offizielle Codes brauchen gültige Nummern
- `Klartext & Druckbogen` als strukturierter Bereich
- `Profi-Einstellungen vorbereitet` als einklappbarer Bereich
- Hilfe erweitert:
  - welche Barcode-Art wofür
  - CSV-Export
  - Übersicht statt Überladung
  - Hinweis zu offiziellen EAN-/Logistikcodes

## Bewusst nicht gemacht
Noch keine neuen Barcode-Typen aktiviert. Erst soll der Kern sauber bleiben.
