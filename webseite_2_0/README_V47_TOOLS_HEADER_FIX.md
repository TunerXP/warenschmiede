# v47 Tools Header Fix

## Zweck
Diese Version repariert `webseite_2_0/tools/index.html`.

## Wichtig
In v46 war versehentlich wieder ein statischer/alter Header in `tools/index.html` gelandet.
Dadurch wurde das Logo in der Menüleiste viel zu groß angezeigt.

## Änderung
- statischen Header entfernt
- statischen Footer entfernt
- zentrale Platzhalter gesetzt:
  - `<div id="ws-header"></div>`
  - `<div id="ws-footer"></div>`
- zentrales Layout wird über `../assets/js/ws-layout.js` geladen
- Tool-Übersicht bleibt Verbindungsseite
- Tools öffnen im neuen Tab

## Kopieren
`ws_v47_tools_header_fix/tools/index.html`
nach:
`webseite_2_0/tools/index.html`

Keine zentrale CSS- oder JS-Datei muss ersetzt werden.
