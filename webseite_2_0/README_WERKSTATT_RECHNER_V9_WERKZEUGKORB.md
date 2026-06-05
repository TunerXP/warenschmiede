# Warenschmiede Werkstatt-Rechner Metall Plus – v9 Werkzeugkorb

Stand: 2026-06-05

## Ziel
Der Schnittdatenbereich wurde um einen projektbezogenen Werkzeugkorb erweitert. Damit können berechnete Schnittdaten als Werkzeugliste gesammelt, geladen, live bearbeitet, gedruckt und als JSON-Aktenordner gesichert werden.

## Neu
- Pflichtfelder für `T-Nummer` und `Werkzeug / Beschreibung` im Schnittdaten-Editor.
- Zusatzfelder: Werkzeuglänge und Beschichtung.
- Rechter Bereich `Werkzeugkorb` mit kompakten Karten.
- Karten zeigen bewusst nur Kurzinfos: T-Nummer, Werkzeugname, Durchmesser, Länge, Beschichtung und Bearbeitung.
- Klick auf eine Karte lädt das Werkzeug wieder in den Editor.
- Aktives Werkzeug wird bei Änderungen live aktualisiert.
- Löschen nur mit Warnmeldung.
- Projektname, Projektreferenz und Projektbeschreibung.
- Projekte können lokal gespeichert und über ein großes Such-/Ladefenster geladen werden.
- Ein JSON-Aktenordner kann heruntergeladen und wieder geladen werden.
- Werkzeug-Schnittdatenblatt kann gedruckt bzw. als PDF gespeichert werden.
- Link zum CNC Fräsen-Einrichtsblatt Plus ergänzt.

## Nicht geändert
- Keine festen Start-/Tools-Menüs eingebaut.
- Kleines zentrales W-TOOLS-Menü bleibt erhalten.
- Grundformeln und bestehende Tabs bleiben erhalten.

## Einbau
`tools/werkstatt-rechner.html` nach `webseite_2_0/tools/werkstatt-rechner.html` kopieren.

Bilder wie bisher:
- `assets/img/werkstatt_rechner01.png`
- `assets/img/passungen01.png`
