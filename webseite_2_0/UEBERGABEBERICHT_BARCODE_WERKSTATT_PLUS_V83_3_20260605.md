# Übergabebericht · Barcode-Werkstatt Plus v83.3

Stand: 05.06.2026  
Projekt: Warenschmiede Webseite 2.0  
Pfad: `webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Kurzstatus

Die Barcode-Werkstatt Plus wurde seit v77 stark weiterentwickelt.

Der aktuelle bestätigte Stand ist **v83.3 Druckrand-Fix**.

v83.3 ist kein großer Feature-Ausbau, sondern eine Stabilitätsversion nach dem Etiketten-Designer-Block. Der wichtigste Fix: In der PDF-/Druckausgabe werden äußere Etiketten bei 3 Etiketten pro Reihe nicht mehr angeschnitten.

## Aktiver Funktionsumfang

### Barcode-Arten

Aktiv im Tool:

- Code128
- EAN-13
- EAN-8
- Code39
- ITF-14

Nicht aktive oder nur geplante Barcodearten wurden aus der sichtbaren Oberfläche entfernt. Neue Barcodearten sollen später bewusst als eigener Ausbau ergänzt werden.

### Arbeitsmodi

Aktiv:

- Einzelcode
- Gleicher Code
- Serie
- Manuelle Liste

### Ausgabe / Export

Vorhanden:

- PNG
- SVG
- Barcode-Inhalt kopieren
- Druckbogen / PDF über Browserdruck
- CSV
- CSV pro Version
- Projekt-JSON
- Projekt-JSON laden
- lokaler Arbeitsstand im Browser
- Versionen speichern/laden/löschen

### Etiketten-Designer

Der Designer ist inzwischen ein zentraler Bestandteil des Tools:

- Vorlagen / Presets
- Etikettenformen
- Rahmen an/aus
- Rahmenfarbe
- Rahmenstärke
- Eckenradius / Formlogik
- Hintergrundfarbe
- Balken oben/unten/links/rechts
- Balkenfarben
- Balkenhöhe und Seitenbalkenbreite
- Titel an/aus
- Titeltext
- Titelposition
- Titelausrichtung
- Titelstil
- Titelfarbe
- Titelgröße
- Zusatz-Zahl unter Barcode optional
- Barcode-Größe
- Etikettenformat
- A4-Ausnutzung
- manuelle Etikettenhöhe

## Öffentliche UI-Regel

Marco hat klargestellt:

Die sichtbare Tool-Oberfläche darf keine internen Bauhinweise enthalten.

Nicht sichtbar ins Tool:

- „v80: ...“
- „wurde gefixt“
- „wird nicht mehr doppelt angezeigt“
- „zeigt immer nur ein Beispiel“
- technische Bau-/KI-Hinweise
- Übergabeberichte
- interne Entwicklungslogik

Sichtbar erlaubt:

- echte Bedienhilfe
- fachliche Hinweise
- Warnungen für Anwender
- kurze Tool-Erklärungen, die beim Nutzen helfen

## Zentrales Menü

Wichtig:

- Kein eigenes internes Tool-Menü einbauen.
- Das kleine W-TOOLS-Menü bleibt zentral über `assets/js/ws-tool-menu.js`.
- Das große Homepage-Menü bleibt zentral über die Webseite-2.0-Struktur.
- Im W-TOOLS-Menü stehen Impressum und Datenschutz statt interner Hinweistext.

## Getestete Druck-/PDF-Erkenntnisse

### Vor v83.3

Bei bestimmten Etikettenformen und 3 Etiketten pro Reihe wurden äußere Etiketten in Chrome/PDF seitlich angeschnitten. Dadurch wirkten eckige Etiketten links/rechts abgerundet oder beschädigt.

### Nach v83.3

Marco hat zwei PDF-Ausgaben geprüft:

- Werkstatt-Blau/Grau: drei Etiketten sauber rechteckig.
- S/N-/Seriennummer-Variante: drei Etiketten sauber rechteckig.

Bewertung von Marco: **„jetzt passt es“**.

## Noch wichtig für späteren Philipp-Test

Philipp soll später nicht jetzt sofort testen, sondern erst wenn Marco sagt, dass der Stand reif ist.

Die Fachtest-Checkliste wurde bereits erweitert und soll später prüfen:

- Barcode-Art passend?
- Modus passend?
- Eingaben / Validierung verständlich?
- CSV / JSON brauchbar?
- Druckbogen / PDF sauber?
- Etiketten-Designer optisch und funktional brauchbar?
- Presets und Formen sinnvoll?
- keine internen Entwicklertexte sichtbar?
- Notizen je Prüfpunkt möglich?
- Markdown und JSON sollen beide zurückgegeben werden.

## Aktueller sinnvoller nächster Schritt

Nicht sofort neue Barcodearten.

Empfohlene nächste Reihenfolge:

1. v83.3 als stabile Basis behalten.
2. Bei Bedarf kleine UI-/Hilfe-Fehler glätten.
3. Projekt-JSON mit alten und neuen Ständen prüfen.
4. Danach entscheiden:
   - neue Barcodearten, oder
   - weitere Export-/Druckkomfort-Funktionen, oder
   - Tool erstmal parken und Webseite 2.0 weiterbauen.

## Merksatz für nächsten Chat

Wenn im neuen Chat weitergebaut wird, Einstieg:

> Bitte in GitHub `TunerXP/warenschmiede`, Ordner `webseite_2_0`, Datei `tools/BarcodeWerkstattPlus.html` prüfen. Letzter bestätigter Stand war v83.3 Druckrand-Fix. Etiketten-Designer, Presets, Formen, Barcode-Größe, Etikettenformate und A4-Ausnutzung sind aktiv. Keine internen Bauhinweise sichtbar im Tool. Zentrales Tool-Menü nicht ersetzen.
