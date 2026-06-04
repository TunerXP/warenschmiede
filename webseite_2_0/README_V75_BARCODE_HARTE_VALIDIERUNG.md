# v75 Barcode-Werkstatt Plus · harte Validierung

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v75_barcode_werkstatt_plus_harte_validierung/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Warum v75?
v74 war visuell und fachlich noch nicht sauber genug:
- Prefix/Suffix konnten beim Fokus wie Fehler wirken
- EAN/ITF-Basisstellen waren editierbar, obwohl sie fest sind
- Felder konnten grün sein, obwohl der Wert fachlich sinnlos war
- Vorschau konnte Fehler melden, während die Prüfung grün blieb

## Neu / Fix
- Rot nur bei echtem Fehler
- Grün nur bei geprüften Pflichtfeldern
- optionale Felder bleiben neutral
- Prefix/Suffix bei EAN/ITF werden gesperrt und geleert
- EAN-13 Basisstellen fest 12
- EAN-8 Basisstellen fest 7
- ITF-14 Basisstellen fest 13
- Serien-Anzahl begrenzt 1 bis 999
- numerische Schrittweite begrenzt
- EAN/ITF-Serie prüft, ob Basisbereich überschritten wird
- Barcode-Renderer-Fehler färbt die Statusbox rot

## Test
1. EAN-13 Serie wählen
2. Basisstellen darf nicht frei veränderbar sein
3. ungültige Startnummer eingeben
4. Feld und Statusbox müssen rot werden
5. gültige Startnummer eingeben
6. Statusbox grün, Pflichtfelder passend
7. Prefix/Suffix müssen bei EAN/ITF neutral/gesperrt sein
8. ITF zu große Serienwerte testen
