# Werkstatt-Rechner Metall Plus – v10 Projektlogik

Änderungen gegenüber v9:

- Werkzeugkorb-Bereich aufgeräumt.
- Links nur noch `Werkzeug speichern` und `Neu +`.
- `Werkzeug speichern` braucht T-Nummer und Werkzeugbeschreibung.
- Neues Werkzeug wird in den Projektkorb übernommen und die Eingabe wird für das nächste Werkzeug geleert.
- Klick auf Werkzeugkarte lädt das Werkzeug zurück in den Editor.
- Geladenes Werkzeug wird bei Änderungen live aktualisiert.
- `Neu +` leert den Editor und startet ein neues Werkzeug.
- Rechts im Werkzeugkorb nur noch Projekt speichern/laden, Werkzeugblatt drucken und CNC-Einrichtblatt-Link.
- JSON-Datenbank speichern/laden liegt oben rechts in der Tab-Leiste, weil es später für mehrere Module genutzt werden kann.
- Keine festen Start-/Tools-Menüs eingebaut; kleines zentrales W-TOOLS-Menü bleibt.

Einbau:

- `tools/werkstatt-rechner.html` nach `webseite_2_0/tools/werkstatt-rechner.html` kopieren.
- Bilder bei Bedarf nach `webseite_2_0/assets/img/` kopieren.
