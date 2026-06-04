# v69 Barcode-Werkstatt Plus · Versionstexte & Nummerierung-Fix

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v69_barcode_werkstatt_plus_version_text_fix/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Problem aus v68
Beim Laden alter Versionen wurden Barcode-Art, Modus und Eingaben korrekt wiederhergestellt,
aber die Projektbeschreibung/Notiz blieb global gleich.

Dadurch wirkte es so, als hätten Version 2, 3 und 4 denselben Text.

## Neu / repariert
- Projektbeschreibung / Versionsnotiz wird jetzt in jedem Versions-Snapshot gespeichert
- Beim Laden einer Version wird auch die passende Beschreibung/Notiz wiederhergestellt
- neue Versionen bekommen jetzt die nächste freie Versionsnummer:
  - nicht mehr `Anzahl der Versionen + 1`
  - sondern `höchste vorhandene Versionsnummer + 1`
- dadurch keine doppelten Versionsnummern nach Löschen oder alten Importen
- SchemaVersion wurde auf 3 erhöht
- alte Projektdateien werden weiterhin gelesen

## Testempfehlung
1. Version 1 mit Beschreibung A speichern
2. Beschreibung ändern
3. Version 2 speichern
4. Beschreibung ändern
5. Version 3 speichern
6. Version 1/2/3 laden
7. prüfen, ob die Beschreibung jeweils passend zurückspringt
8. Version löschen und neue Version speichern
9. prüfen, ob keine doppelte Versionsnummer entsteht
