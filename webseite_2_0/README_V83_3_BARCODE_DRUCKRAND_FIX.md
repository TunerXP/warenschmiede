# v83.3 Barcode-Werkstatt Plus · Druckrand-Fix

Stand: 05.06.2026  
Projekt: Warenschmiede Webseite 2.0 / Barcode-Werkstatt Plus  
Arbeitsdatei: `webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Wichtig

Diese Version ist eine kleine Stabilitäts-/Druckrunde nach dem Etiketten-Designer-Ausbau.

Die ZIP/Änderung betrifft nur das Barcode-Tool bzw. die begleitende Doku.  
Das zentrale Tool-Menü bleibt unverändert.

## Ausgangslage

Nach v83/v83.1/v83.2 war die Barcode-Werkstatt Plus funktional stark erweitert:

- interaktive Barcode-Hilfe
- Etiketten-Designer
- Barcode-Größe
- Etikettenformate
- A4-Ausnutzung
- mehr Vorlagen / Presets
- neue Etikettenformen
- breiteres Layout

Beim PDF-/Drucktest fiel aber auf:

- Bei 3 Etiketten pro Reihe wurden äußere Etiketten links/rechts teilweise angeschnitten.
- Dadurch wirkten eigentlich eckige Vorlagen außen gerundet oder beschädigt.
- Das mittlere Etikett war korrekt, wodurch klar wurde: Problem liegt am Druckrand / Druckraster, nicht an der Vorlage selbst.

## Änderung in v83.3

- Druckbogen bekommt im Druckmodus einen kleinen Sicherheitsrand.
- Raster nutzt die verfügbare A4-Breite stabiler.
- Äußere Etiketten werden nicht mehr an der Seitenkante abgeschnitten.
- Eckige Formen bleiben in der PDF-/Druckausgabe eckig.
- Keine neuen Barcodearten.
- Keine neuen sichtbaren Entwickler-/Bauhinweise im Tool.
- Keine Änderung am zentralen Tool-Menü.

## Getesteter Stand

Marco hat nach v83.3 zwei PDF-Ausgaben geprüft:

1. Vorlage „Werkstatt Blau/Grau“  
   - drei Etiketten in einer Reihe
   - alle drei Etiketten rechteckig
   - Rahmen links/rechts nicht mehr angeschnitten

2. Vorlage „S/N“ / Seriennummer-artiges Etikett  
   - drei Etiketten in einer Reihe
   - alle drei Etiketten sauber und rechteckig
   - Linien und Balken wirken durchgehend

Ergebnis: Druckrand-Fix passt.

## Einbau

`ws_v83_3_barcode_werkstatt_plus_druckrand_fix/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

kopieren.

## Wichtige Design-Regel

Im Tool selbst sollen nur öffentliche Anwenderinformationen stehen.

Nicht ins Tool gehören:

- Versionsnotizen
- Bau-/Entwicklerhinweise
- Erklärungen, warum etwas gefixt wurde
- interne KI-/Übergabe-Texte
- Hinweise wie „v80 wurde geändert“ oder „doppelte Zahl entfernt“

Solche Informationen gehören in README, Übergabebericht oder Chat-Protokoll.

## Aktuelle Einschätzung

v83.3 ist ein guter stabiler Zwischenstand für den Barcode-Werkstatt-Ausbau.

Der Etiketten-Designer ist jetzt deutlich flexibler und druckbarer:

- Presets / Vorlagen
- Formen
- Rahmen
- Balken
- Titel
- Barcode-Größe
- Etikettenformat
- A4-Ausnutzung
- Projekt-JSON speichert Layoutwerte

Der große Fachtest durch Philipp soll später erfolgen, wenn Marco entscheidet, dass das Tool insgesamt reif genug ist.
