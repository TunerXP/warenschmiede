# Werkstatt-Rechner Metall Plus v26 – ISO 2768 kompakt & live

## Stand
Diese Version baut auf v25 auf. Der Schnittdatenbereich bleibt unverändert. Schwerpunkt dieser Version ist der Tab **ISO 2768 / Allgemeintoleranzen**.

## Änderungen
- ISO-Tab als 3 Karten nebeneinander aufgebaut:
  1. Eingabe / Auswahl
  2. Live-Ergebnis / Ist-Maß-Prüfung
  3. Merker / Schnellübersicht
- Toleranzklasse erweitert um `v · sehr grob`.
- Optionales Ist-Maß ergänzt.
- Direkte Prüfung: i.O. / n.i.O. gegen Unter- und Obergrenze.
- Toleranz wird in mm und µm angezeigt.
- Maßbereich wird automatisch erkannt.
- Tabelle kompakter und lesbarer eingebunden.
- Wichtiger Praxis-Hinweis: ISO 2768 gilt nur, wenn sie auf der Zeichnung angegeben ist.

## Unverändert
- Schnittdaten-Konsole, Werkzeugkorb, Projekt-Aktenordner, JSON und Werkzeugblatt bleiben aus v25 erhalten.
- Kein fest verbautes Menü.
- Kleines zentrales W-TOOLS-Menü bleibt.

## Einbau
`tools/werkstatt-rechner.html` nach `webseite_2_0/tools/werkstatt-rechner.html` kopieren.

Bilder wie gehabt behalten:
- `assets/img/werkstatt_rechner01.png`
- `assets/img/passungen01.png`
