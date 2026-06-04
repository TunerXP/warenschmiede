# Übergabebericht · Barcode-Werkstatt Plus / Webseite 2.0

Stand: 04.06.2026  
Projekt: Warenschmiede Webseite 2.0 / Barcode-Werkstatt Plus  
Arbeitsordner: `webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Aktueller bestätigter Basisstand

Die Barcode-Werkstatt Plus ist inzwischen eine brauchbare neue Basis. Der aktuelle Arbeitsstand basiert auf v76/v77:

- v76: Validierungs-Neustart / harte Prüfung
- v77: kurze Infoblasen als Bedienhilfe

Die Grundlogik wurde mehrfach getestet und deutlich verbessert. Der wichtigste Workflow ist jetzt:

1. Barcode-Art wählen
2. Modus wählen
3. Daten eingeben
4. Prüfung zeigt verständlich grün/rot
5. Barcode erzeugen/exportieren/drucken
6. Projektstand wird lokal im Browser erhalten
7. Projekt kann als JSON gesichert und wieder geladen werden
8. Versionsverlauf kann verschiedene Stände speichern

## Was aktuell funktioniert

### Barcode-Arten
Aktiv im Tool:

- Code128
- EAN-13
- EAN-8
- Code39
- ITF-14

### Arbeitsmodi
Aktiv:

- Einzelcode
- Gleicher Code
- Serie
- Manuelle Liste

### Export / Ausgabe
Vorhanden:

- PNG herunterladen
- SVG herunterladen
- Barcode-Inhalt kopieren
- Druckbogen drucken
- CSV herunterladen
- CSV pro Version
- Projekt-JSON herunterladen
- Projekt-JSON laden

### Projekt- und Versionslogik
Funktioniert:

- Projektname
- Ersteller optional
- Projektbeschreibung / Versionsnotiz
- Versionen speichern
- Versionen laden
- Versionen löschen
- CSV je Version
- Live-Bearbeitung geladener Versionen
- Auto-Wiederherstellung nach Browser-Refresh
- JSON enthält Versionsverlauf und aktuellen Stand

## Wichtige Entscheidungen

### Projektbericht zurückgestellt
Ein Projektbericht wäre möglich, ist aber aktuell nicht die wichtigste Funktion für normale Nutzer. Er soll später als Archiv-/Übergabebericht kommen.

### Erst Stabilität, dann neue Barcode-Arten
Neue Barcode-Typen wie UPC, ISBN, GS1-128, DataMatrix, PDF417 usw. sollen erst später kommen. Vorher müssen Hilfe, Prüfung, Druckbogen und Workflow sauber sitzen.

### Hilfetexte nicht überladen
Die Hauptfläche soll kein Lexikon werden. Sichtbar bleiben nur kurze Hinweise und Prüfmeldungen. Zusatzwissen kommt über:

- kleine `?`-Infoblasen
- Hilfe-Fenster
- spätere externe Hilfeseite falls nötig

## Validierungslogik

Ziel der Farblogik:

- neutral = optional oder nicht aktiv geprüft
- grün = korrekt geprüfte Pflichtangabe
- orange = reserviert für Zwischen-/Prüfzustand
- rot = echter Fehler

Wichtige Regeln:

- Rot darf nur bei echtem Fehler erscheinen.
- Grün darf nur erscheinen, wenn die Pflichtangabe wirklich gültig ist.
- Optionale Felder bleiben neutral.
- EAN/ITF haben feste Basisstellen:
  - EAN-13: 12 Basisziffern + 1 Prüfziffer
  - EAN-8: 7 Basisziffern + 1 Prüfziffer
  - ITF-14: 13 Basisziffern + 1 Prüfziffer
- Prefix/Suffix werden bei EAN/ITF ignoriert/gesperrt.
- Zu lange EAN/ITF-Eingaben werden verhindert bzw. rot gemeldet.
- Renderer-Fehler zählen als echter Fehler.

## CSV-Logik

Excel interpretiert lange Zahlen gerne falsch, z. B. als wissenschaftliche Schreibweise. Deshalb enthält die CSV zusätzlich:

`barcode_inhalt_excel`

Diese Spalte schreibt den Barcode als Excel-sicheren Text:

`="0000000000017"`

Die normale Spalte `barcode_inhalt` bleibt für externe Programme erhalten.

## Druckbogen

Vorhanden:

- Etiketten pro Reihe
- Kopien pro Code
- Größe
- A4-Rand
- Etikettenabstand

Noch später zu prüfen:

- A4-Druck mit verschiedenen Browser-/Druckdialog-Einstellungen
- Skalierung 100 %
- randlos / kleiner Rand / normaler Rand
- Seitenumbruch bei vielen Etiketten
- lange Barcodes auf kleinen Etiketten

## GitHub / Webseite 2.0

Im GitHub-Repo `TunerXP/warenschmiede` existiert der Ordner:

`webseite_2_0`

Dort sind bereits README-Dateien zur Barcode-Werkstatt vorhanden, u. a. bis V76. In einem neuen Chat kann über GitHub schnell wieder eingestiegen werden, wenn angegeben wird:

„Bitte in GitHub `TunerXP/warenschmiede`, Ordner `webseite_2_0`, Barcode-Werkstatt Plus prüfen.“

## Nächste sinnvolle Schritte

### Kurzfristig
1. v77 testen:
   - Infoblasen öffnen/schließen
   - keine Layout-Störung
   - mobile/kleinere Ansicht grob prüfen

2. Hilfe-Fenster finaler machen:
   - Was ist Code128?
   - Was ist EAN?
   - Was ist ITF-14?
   - Was ist Code39?
   - Was ist eine Prüfziffer?
   - Was ist CSV?
   - Was ist JSON?
   - Was bedeutet Projektverlauf?

3. Druckbogen gezielt testen:
   - 2 / 3 / 4 / 5 Etiketten pro Reihe
   - klein / mittel / groß
   - Rand ohne / klein / normal / groß
   - Abstand eng / normal / groß

### Danach
4. kleine Warn-/Statusmeldungen weiter glätten
5. Beispielwerte verbessern
6. ggf. Projektbericht ergänzen
7. erst danach neue Barcode-Typen planen

## Externer Fachtest

Philipp soll später erst testen, wenn die groben Workflow- und Logikfehler entfernt sind. Marco möchte ihm für einen ausführlichen Test 20 € als Dankeschön geben. Ziel: Philipp soll fachlich prüfen, nicht die offensichtlichen Bedienfehler finden.

Für Philipp ist später sinnvoll:

- Link zum Tool
- kurze Testanweisung
- interaktive Prüfliste / Fachtest-Checkliste
- Rückgabe als Markdown und JSON

## Aktuelle Einschätzung

Die Barcode-Werkstatt Plus ist noch nicht final, aber die Basis ist jetzt deutlich belastbarer. Der große Fortschritt war:

- JSON-Projektdatei
- Versionsverlauf
- Live-Speicherung geladener Versionen
- Excel-sichere CSV
- harte Validierungslogik
- kurze Hilfeblasen statt Textüberladung

Dieser Stand ist eine gute neue Basis für den nächsten Chat.
