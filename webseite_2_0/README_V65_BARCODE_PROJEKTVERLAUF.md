# v65 Barcode-Werkstatt Plus · Projektverlauf / Versionen

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v65_barcode_werkstatt_plus_project_versions/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu
- Bereich `Projekt & Verlauf`
- Versionstitel
- Versionsnotiz
- Button `Neue Version im Projekt speichern`
- Versionsliste
- alte Version laden
- Projekt-JSON exportiert aktuellen Stand + Verlauf
- Projekt-JSON importiert aktuellen Stand + Verlauf

## Logik
Wenn du eine alte Version lädst und bearbeitest, wird diese alte Version nicht überschrieben.
Beim Klick auf `Neue Version im Projekt speichern` entsteht eine neue Version am Ende des Verlaufs.

## Wichtig
Browser-Tools können aus Sicherheitsgründen nicht automatisch die Originaldatei überschreiben.
Ablauf:
1. Projekt-JSON laden
2. bearbeiten
3. neue Version speichern
4. Projekt-JSON herunterladen
5. alte Datei bewusst ersetzen oder neue Datei ablegen

## Nächste mögliche Schritte
- Version löschen / umbenennen
- lokale Zuletzt-benutzt-Liste
- Version als CSV exportieren
- Projektbericht erzeugen
