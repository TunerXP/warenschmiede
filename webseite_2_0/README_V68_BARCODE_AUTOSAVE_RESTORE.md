# v68 Barcode-Werkstatt Plus · Auto-Wiederherstellung

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v68_barcode_werkstatt_plus_autosave_restore/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu
- aktueller Arbeitsstand wird automatisch im Browser gespeichert
- nach Browser-Aktualisierung bleibt erhalten:
  - Projektname
  - Projektbeschreibung
  - Barcode-Art
  - Modus
  - Eingaben
  - Layout
  - Versionsverlauf
  - aktuell geladene Version
- Button `Lokalen Arbeitsstand löschen`
- Version ändern ist robuster:
  - leerer Versionstitel überschreibt nicht mehr versehentlich
  - wenn nichts Neues eingegeben wird, bleibt der alte Titel erhalten

## Wichtig zur Speicherung
Der lokale Arbeitsstand ist Komfort im Browser.
Die echte Sicherungsdatei bleibt weiterhin die heruntergeladene Projekt-JSON.

## Empfohlener Ablauf
- während der Arbeit: Auto-Wiederherstellung hilft bei Refresh
- nach wichtigen Änderungen: Projekt-JSON herunterladen
- für echte Sicherung: JSON-Datei bewusst ablegen/ersetzen
