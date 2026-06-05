# Warenschmiede Werkstatt-Rechner Metall Plus – v19 Druck/UI-Feinschliff

Stand: 05.06.2026

## Änderung gegenüber v18

- Werkzeugblatt druckerfreundlicher und lesbarer aufgebaut.
- Werkzeugkarte im PDF mit fester Zellstruktur:
  - links kompakter Toolblock mit T-Nummer
  - daneben S oben und F unten
  - rechts feste Bereiche für Werkzeug/Art, Maße, Schnittwerte und Beschichtung
- AP/AE bzw. Eingriffswerte vollständig aus Schnittdaten-Eingabe, Werkzeugblatt und Merker entfernt.
- Große zusätzliche Drehzahlanzeige bleibt entfernt; die kompakte Schnittdaten-/CNC-Anzeige ist maßgebend.
- Doppelte Vorschubanzeige bleibt entfernt.
- Fragezeichen-Hilfen im Schnittdatenbereich erscheinen jetzt als feste, gut lesbare Hinweisbox oben mittig, damit sie nicht mehr über Eingabefelder oder den Browserrand laufen.
- Schnittdaten-Eingabezellen stehen ruhiger und gleichmäßiger.

## Ziel

Das Schnittdatenblatt soll als kompakte Maschinen-/Werkstattübersicht funktionieren: T-Nummer, S, F, Werkzeug, Maße und relevante Schnittwerte – ohne CAM-Zeitberechnung, Volumenberechnung oder Eingriffsdaten.

## Einbau

`tools/werkstatt-rechner.html` nach `webseite_2_0/tools/werkstatt-rechner.html` kopieren.

Die Bilder bleiben wie bisher:

- `assets/img/werkstatt_rechner01.png`
- `assets/img/passungen01.png`
