# v72 Barcode-Werkstatt Plus · CSV Excel-sicher

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v72_barcode_werkstatt_plus_csv_excel_safe/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Problem
Excel interpretiert lange numerische Barcode-Inhalte gern als Zahl.
Dadurch können Werte wie EAN/ITF so aussehen:

`1,2346E+13`

Außerdem können führende Nullen verloren gehen oder falsch wirken.

## Fix
Die CSV enthält jetzt zusätzlich eine Excel-sichere Spalte:

`barcode_inhalt_excel`

Dort wird der Barcode-Inhalt als Excel-Textformel ausgegeben:

`="0000000000017"`

Dadurch zeigt Excel den Wert als Text an und behält führende Nullen sowie lange Nummern.

## CSV-Spalten
- laufnummer
- barcode_typ
- barcode_inhalt
- barcode_inhalt_excel
- menge
- modus
- beschreibung
- version
- versionstitel
- datum

## Hinweis
Die normale Spalte `barcode_inhalt` bleibt erhalten, weil manche externen Programme lieber Rohwerte ohne Excel-Formel lesen.
Für Excel ist `barcode_inhalt_excel` die sichere Spalte.

## Test
1. ITF-14 oder EAN-13 erzeugen
2. CSV exportieren
3. in Excel öffnen
4. prüfen:
   - `barcode_inhalt` kann von Excel noch als Zahl interpretiert werden
   - `barcode_inhalt_excel` muss korrekt als Text erscheinen
   - führende Nullen müssen sichtbar bleiben
