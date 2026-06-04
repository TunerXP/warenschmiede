# v71 Barcode-Werkstatt Plus · Live-Versionen / einfacher Workflow

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v71_barcode_werkstatt_plus_live_versionen/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Warum diese Version?
Der bisherige Ablauf mit `Ändern`-Dialog war zu umständlich.
Der bessere Workflow ist:

1. Version unten laden
2. Einstellungen, Texte und Barcode-Daten direkt ändern
3. Änderungen bleiben live in dieser geladenen Version gespeichert
4. bei Bedarf Projekt-JSON als Backup herunterladen

## Neu
- geladene Version wird live bearbeitet
- Projektbeschreibung/Versionsnotiz wird live gespeichert
- Barcode-Art, Modus, Eingaben und Layout werden live in der geladenen Version gespeichert
- Versionstitel und Versionsnotiz werden live gespeichert
- der `Ändern`-Button/Prompt wurde aus der Versionsliste entfernt
- Versionsliste zeigt jetzt:
  - Laden
  - CSV
  - Löschen
- `Neue Version im Projekt speichern` bleibt als bewusster Snapshot-Button

## Wichtig
Live-Speichern bedeutet:
- im Browser bleibt alles erhalten
- im Projektverlauf bleibt es aktuell
- für echte Datei-Sicherung trotzdem `Projekt-JSON herunterladen` klicken

## Test
1. Version 1 anlegen
2. Version 2 anlegen
3. Version 1 laden
4. Beschreibung, Barcode-Art, Anzahl oder Layout ändern
5. F5 drücken
6. prüfen, ob Version 1 die Änderung behalten hat
7. JSON herunterladen und neu laden
8. prüfen, ob Verlauf und Texte passen
