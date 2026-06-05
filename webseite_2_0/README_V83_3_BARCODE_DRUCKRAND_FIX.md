# v83.3 Barcode-Werkstatt Plus · Druckrand-Fix

## Zweck
Bei sehr engem Druckrand konnten die äußeren Etiketten links/rechts in der Browser-Druckvorschau angeschnitten wirken.

## Änderung
- Druckbogen bekommt im Druckmodus einen kleinen Sicherheitsrand.
- Etikettenraster nutzt die verfügbare Breite sauberer.
- Rechteckige Vorlagen bleiben rechteckig; der Fix betrifft nur den Druck-/PDF-Rand.

## Datei ersetzen
`tools/BarcodeWerkstattPlus.html` nach `webseite_2_0/tools/BarcodeWerkstattPlus.html` kopieren.
