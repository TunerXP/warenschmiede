# Werkstatt-Rechner Metall Plus – v22 Buttons/JS-Fix

Stand: 05.06.2026

## Zweck
Fix für v21, bei dem durch einen JavaScript-Syntaxfehler die Bedienlogik nicht vollständig gestartet ist.

## Behoben
- Buttons/Funktionen werden wieder initialisiert.
- Design, Hilfe, Tab-Wechsel, Projektbuttons und Werkzeugfunktionen laufen wieder.
- Bohrmodus setzt Zähnezahl z wieder korrekt auf 2 und deaktiviert das Feld.
- Fräsmodi aktivieren z wieder.
- `check.js` wurde nicht mehr in den ZIP aufgenommen.

## Einbau
- `tools/werkstatt-rechner.html` nach `webseite_2_0/tools/werkstatt-rechner.html`
- Bilder wie gehabt in `webseite_2_0/assets/img/` belassen/ersetzen.
