# v70 Barcode-Werkstatt Plus · Versionsbeschreibung-Fix

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v70_barcode_werkstatt_plus_version_description_fix/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Repariert
In v69 wurde der Beschreibungstext noch nicht zuverlässig je Version geladen.
Barcode-Art, Modus und Eingaben sprangen korrekt um, aber die große Projektbeschreibung blieb teilweise vom vorherigen Stand stehen.

## Neu / Fix
- Beschreibung wird beim Speichern einer Version hart in der Version selbst gespeichert
- Beschreibung wird zusätzlich im Versions-Snapshot gespeichert
- beim Laden einer Version wird die Beschreibung aus der Version/Snapshot wiederhergestellt
- wenn eine alte Version keine Beschreibung im Snapshot hat, wird die Versionsbeschreibung als Fallback genutzt
- wenn gar keine Beschreibung vorhanden ist, wird das Feld geleert statt falsch von der letzten Version stehenzubleiben
- beim Ändern einer Version kann jetzt auch die große Beschreibung/Versionsnotiz angepasst werden
- SchemaVersion wurde auf 4 erhöht
- ältere Projektdateien werden beim Laden nachgerüstet

## Test
1. Version 1 speichern mit Text `v1`
2. Text ändern auf `v2`, Version 2 speichern
3. Text ändern auf `v3`, Version 3 speichern
4. Version 1 / 2 / 3 laden
5. prüfen, ob der große Text jeweils passend springt
6. Version ändern öffnen und Beschreibung dort ändern
7. erneut laden und prüfen
