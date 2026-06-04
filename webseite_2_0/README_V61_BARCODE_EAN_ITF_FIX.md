# v61 Barcode-Werkstatt Plus · EAN/ITF-Fix

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v61_barcode_werkstatt_plus_ean_fix/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Was wurde repariert?
- EAN-13 erzeugt jetzt auch in Vorschau und Druckbogen Barcodes
- EAN-8 erzeugt jetzt auch in Vorschau und Druckbogen Barcodes
- ITF-14 erzeugt jetzt auch in Vorschau und Druckbogen Barcodes
- Prüfziffer wird für EAN-13, EAN-8 und ITF-14 automatisch ergänzt
- Bei numerischen Barcode-Arten werden Prefix/Suffix in der Serie ignoriert/deaktiviert
- numerische Serien werden automatisch passend aufgefüllt:
  - EAN-13: 12 Basisziffern + Prüfziffer
  - EAN-8: 7 Basisziffern + Prüfziffer
  - ITF-14: 13 Basisziffern + Prüfziffer

## Warum?
EAN und ITF erlauben nur Zahlen und feste Längen.
Vorher konnten noch Werte wie `WS-0001-A` in EAN/ITF geraten, wodurch JsBarcode Fehler angezeigt hat.

## Code128 / Code39
Diese bleiben für freie interne Werkstattcodes mit Buchstaben, Prefix und Suffix geeignet.
