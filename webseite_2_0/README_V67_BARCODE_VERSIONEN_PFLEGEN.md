# v67 Barcode-Werkstatt Plus · Versionen pflegen

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v67_barcode_werkstatt_plus_version_edit_csv/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu
- Versionstitel ändern
- Versionsnotiz ändern
- einzelne Version als CSV exportieren
- geladene Version bleibt weiter markiert
- Version laden / ändern / CSV / löschen direkt in der Versionsliste

## Warum?
Der Verlauf wird sonst schnell unübersichtlich.
Mit Umbenennen und Notizen können Versionen sauber beschrieben werden.
Mit CSV pro Version kann ein alter Stand direkt extern weiterverarbeitet werden.

## Wichtiger Ablauf
Änderungen an Versionstitel/Notiz/Löschung sind erst dauerhaft in der Datei, wenn du danach die Projekt-JSON erneut herunterlädst und bewusst speicherst.

## Nächste mögliche Schritte
- lokale Zuletzt-benutzt-Liste
- Projektbericht erzeugen
- Version duplizieren ohne vorheriges Laden
- JSON-Verlauf kompakter anzeigen
