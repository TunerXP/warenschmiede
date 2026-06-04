# v59 Header-Reparatur + Barcode-Menü erhalten

## Problem
Nach v58 war Header/Footer auf normalen Homepage-Seiten wieder weg.

## Ursache
Beim Bauen von v58 wurde sehr wahrscheinlich wieder eine ältere/beschädigte `ws-layout.js` mit ausgeliefert und damit der reparierte v53-Stand überschrieben.

## Fix
Diese Version ersetzt nur:

`assets/js/ws-layout.js`

## Enthalten
- reparierter Header/Footer-Stand aus v53
- Barcode-Werkstatt Plus bleibt im zentralen Hauptmenü erhalten
- QR-Werkstatt Plus bleibt im zentralen Hauptmenü erhalten
- Zeiterfassung/Zeiterfassung Plus bleiben mit Hinweis erhalten

## Kopieren
`ws_v59_header_repair_barcode_keep/assets/js/ws-layout.js`
nach:
`webseite_2_0/assets/js/ws-layout.js`

Danach Browser hart neu laden:
`Strg + F5`

## Regel für nächste Builds
Bei Tool-ZIPs darf `assets/js/ws-layout.js` nur noch mitgenommen werden, wenn das Hauptmenü wirklich geändert wurde.
Sonst bleibt diese zentrale Datei unberührt.
