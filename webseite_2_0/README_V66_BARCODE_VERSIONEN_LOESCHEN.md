# v66 Barcode-Werkstatt Plus · Versionen löschen

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v66_barcode_werkstatt_plus_version_delete/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu
- Versionen im Projektverlauf können gelöscht werden
- Sicherheitsabfrage vor dem Löschen
- wenn die aktuell geladene Version gelöscht wird:
  - der Arbeitsstand bleibt im Tool sichtbar
  - die Versionszuordnung wird zurückgesetzt
- JSON-Export enthält danach nur noch die verbleibenden Versionen

## Wichtiger Ablauf
Wenn du eine Version löschst, ist das erstmal nur im aktuell geöffneten Toolstand geändert.
Damit die Löschung dauerhaft in der Datei landet:

1. Version löschen
2. Projekt-JSON herunterladen
3. alte JSON bewusst ersetzen oder neue Datei ablegen

## Nächste sinnvolle Schritte
- Version umbenennen / Notiz ändern
- Version als CSV exportieren
- lokale Zuletzt-benutzt-Liste
- Projektbericht erzeugen
