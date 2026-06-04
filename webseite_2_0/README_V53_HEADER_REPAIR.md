# v53 Hauptmenü-Reparaturfix

## Problem
Nach v52 wurde auf normalen Homepage-Seiten der zentrale Header nicht mehr angezeigt.

## Ursache
Die zentrale Datei `assets/js/ws-layout.js` war fehleranfällig und konnte die Header-/Footer-Injektion abbrechen.

## Fix
Diese Version ersetzt nur:

`assets/js/ws-layout.js`

## Enthalten
- Hauptmenübar repariert
- Footer bleibt zentral
- alter Zeiterfassung-Hinweis bleibt erhalten:
  `Wird Ende 2026 entfernt.`
- Desktop-Menü und mobiles Menü repariert

## Kopieren

`ws_v53_header_repair/assets/js/ws-layout.js`
nach:

`webseite_2_0/assets/js/ws-layout.js`

Danach Browser hart neu laden:
`Strg + F5`
