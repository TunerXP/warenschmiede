# v78 Barcode-Werkstatt Plus · interaktive Hilfe

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header und das zentrale W-TOOLS-Menü werden nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v78_barcode_werkstatt_plus_hilfe_interaktiv/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Neu in v78
- Hilfe-Fenster nach Vorbild der QR-Werkstatt Plus umgebaut
- linke Hilfenavigation mit Themen
- rechte Inhaltsseiten mit Erklärungen, Beispielen, Warnhinweisen und Tabellen
- Hilfe erklärt Barcode-Arten, Arbeitsmodi, Prüfziffern, CSV/JSON, Druckbogen und Grenzen
- Dropdown „Weitere Barcode-Arten vorbereiten“ verständlicher gemacht
- keine internen Projekt-/KI-/Übergabeberichte im öffentlichen Tool
- kein eigenes internes Menü eingebaut

## Unverändert / bewusst nicht angefasst
- zentrales W-TOOLS-Menü bleibt extern über `assets/js/ws-tool-menu.js`
- `assets/js/ws-layout.js` ist nicht enthalten
- keine neuen Barcode-Typen freigeschaltet
- Projekt-JSON / Versionsverlauf bleibt wie im Stand v77
- Infoblasen bleiben erhalten

## Nächste Tests
1. Hilfe öffnen und alle Hilfethemen durchklicken.
2. Hilfe auf kleiner Fensterbreite prüfen.
3. Zentrales W-TOOLS-Menü testen.
4. Barcode-Erzeugung wie in v77 testen.
5. Dropdown prüfen: weitere Typen sind weiterhin gesperrt und nur vorgemerkt.

## Hinweis
Der Fachtest durch Philipp kommt später. Erst soll das Tool in Bedienung, Hilfe, Validierung und Druckbogen sauber genug sein.
