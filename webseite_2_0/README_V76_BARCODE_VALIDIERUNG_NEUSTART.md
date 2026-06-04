# v76 Barcode-Werkstatt Plus · Validierungs-Neustart

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v76_barcode_werkstatt_plus_validierung_neustart/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Warum v76?
v75 war immer noch missverständlich:
- Felder wirkten orange/rot nur wegen Fokus
- Eingaben konnten zu lang werden
- Statusbox und Vorschau waren nicht zuverlässig gekoppelt
- grün/rot wirkte nicht vertrauenswürdig

## Neue Farblogik
- neutral: optional oder nicht aktiv geprüft
- grün: korrekt geprüfte Pflichtangabe
- orange: reserviert für Prüf-/Zwischenzustand
- rot: echter Fehler

## Neue harte Regeln
- EAN-13 Einzelcode: maximal 13 Ziffern
  - 12 Ziffern = Prüfziffer wird ergänzt
  - 13 Ziffern = Prüfziffer wird geprüft
- EAN-8 Einzelcode: maximal 8 Ziffern
  - 7 Ziffern = Prüfziffer wird ergänzt
  - 8 Ziffern = Prüfziffer wird geprüft
- ITF-14 Einzelcode: maximal 14 Ziffern
  - 13 Ziffern = Prüfziffer wird ergänzt
  - 14 Ziffern = Prüfziffer wird geprüft
- Serie:
  - EAN-13 Start-Basisnummer maximal 12 Stellen
  - EAN-8 Start-Basisnummer maximal 7 Stellen
  - ITF-14 Start-Basisnummer maximal 13 Stellen
  - Anzahl 1 bis 999
  - Schrittweite 1 bis 999999
  - Bereichsüberschreitung wird rot gemeldet

## Wichtig
Wenn die Barcode-Vorschau einen Fehler meldet, wird auch die Statusbox rot.
