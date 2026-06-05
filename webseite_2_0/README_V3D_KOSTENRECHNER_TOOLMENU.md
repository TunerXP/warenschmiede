# 3D-Druck Kostenrechner Plus · zentrales Tool-Menü

## Änderung

Diese Version ergänzt im bestehenden Tool das kleine zentrale Warenschmiede-Tool-Menü.

## Datei ersetzen

Kopiere:

`ws_v3d_print_kostenrechner_toolmenu_v1/tools/ws_3d_print_kostenrechner.html`

nach:

`webseite_2_0/tools/ws_3d_print_kostenrechner.html`

## Wichtig

- Die Kalkulationslogik wurde nicht verändert.
- Angebot/Rechnung/Lieferschein bleiben unverändert.
- Der bisherige Link `← Zurück zur Homepage` oben links wurde entfernt.
- Stattdessen sitzt dort jetzt der Button `☰ Warenschmiede Tools`.
- `Anleitung öffnen` bleibt daneben erhalten.
- Das Tool nutzt das vorhandene zentrale Menü aus:
  - `webseite_2_0/assets/css/ws-tool-menu.css`
  - `webseite_2_0/assets/js/ws-tool-menu.js`

## Nicht enthalten

Diese ZIP enthält bewusst keine `assets/js/ws-layout.js` und überschreibt nicht das zentrale Homepage-Layout.
