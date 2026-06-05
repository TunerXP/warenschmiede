# Werkstatt-Rechner Metall Plus – v24 JSON & Merker Feinschliff

## Stand
Basis: v23 Schnittdaten-Konsole.

## Änderungen v24
- JSON-Projektstand wird beim Speichern/Export auf aktuelle Tool-Version `Werkstatt-Rechner Metall Plus v24` gesetzt.
- Export enthält jetzt zusätzlich eine globale `version` im Aktenordner.
- Neue und importierte Werkzeugdaten werden normalisiert und von alten Legacy-Feldern bereinigt.
- Alte Felder wie `ap`, `ae`, `q`, `time` werden für neue Exporte nicht mehr neu ausgegeben.
- Werkzeugname kommt konsequent aus `Werkzeug / Beschreibung`, nicht aus dem Bearbeitungs-Dropdown.
- Merker/Formeln-Fenster wurde optisch und inhaltlich erweitert.
- PDF/Werkzeugblatt wurde nicht bewusst verändert.

## Hinweis
Alte JSON-Dateien können weiterhin geladen werden. Beim erneuten Speichern/Export werden die Projekt- und Werkzeugdaten sauberer geschrieben.
