# v64 Barcode-Werkstatt Plus · Projekt-JSON Grundsystem

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v64_barcode_werkstatt_plus_project_json/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu
- Bereich `Projekt & JSON`
- Projektname
- Ersteller optional
- Projektbeschreibung / Notiz
- Projekt als JSON speichern
- Projekt aus JSON laden

## Was wird gespeichert?
- Projektname / Autor / Beschreibung
- Barcode-Art
- Arbeitsmodus
- Einzelcode-Eingabe
- Gleicher-Code-Eingaben
- Serien-Eingaben
- Manuelle Liste
- Farben
- Barcode-Größe
- Klartext-Optionen
- Druckbogen-Layout
- erzeugte Codes

## Wichtig
CSV bleibt für Excel und externe Programme.
JSON ist für die Barcode-Werkstatt selbst gedacht, damit Projekte später wieder geladen und weiterbearbeitet werden können.

## Noch nicht enthalten
- Versionsverlauf innerhalb der JSON
- alte Version laden / als neue Version weiterbearbeiten
- lokale Browser-History

Das kommt als nächster Schritt.
