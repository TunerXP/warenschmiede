# Warenschmiede Webseite 2.0 – v32 zentrales Layout

Diese Version korrigiert den wichtigsten Architekturpunkt:

- Header / Menü / Mobile-Menü / Footer werden zentral aus `assets/js/ws-layout.js` erzeugt.
- Die einzelnen HTML-Seiten enthalten nur noch `#ws-header`, den jeweiligen `<main>`-Inhalt und `#ws-footer`.
- Neue Menüpunkte werden ab jetzt nur noch in `assets/js/ws-layout.js` ergänzt.

## Kopieren

Den kompletten Inhalt dieses Ordners in `webseite_2_0/` kopieren bzw. vorhandene Dateien ersetzen.

Wichtig: `assets/js/ws-layout.js` muss mitkopiert werden.
