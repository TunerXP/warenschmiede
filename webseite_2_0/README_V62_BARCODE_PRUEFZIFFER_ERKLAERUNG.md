# v62 Barcode-Werkstatt Plus · Prüfziffer-Erklärung

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v62_barcode_werkstatt_plus_pruefziffer_erklaerung/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Warum diese Version?
EAN-13, EAN-8 und ITF-14 hängen automatisch eine Prüfziffer an.
Das war fachlich richtig, aber in der Bedienung nicht verständlich genug.

## Neu
Bei EAN-13, EAN-8 und ITF-14 wird nun angezeigt:
- Basisnummer
- Prüfziffer
- endgültiger Barcode-Inhalt

## Beispiel
Startnummer `1` bei EAN-13 wird zu:

Basisnummer:
`000000000001`

Prüfziffer:
`7`

Endgültiger Barcode:
`0000000000017`

Das wirkt wie `17`, ist aber korrekt: die `7` ist die Prüfziffer.

## Außerdem
- Feldnamen werden bei EAN/ITF verständlicher:
  - `Basisnummer / Ziffern`
  - `Start-Basisnummer`
  - `Basisstellen`
- Hinweise erklären, dass Prefix/Suffix bei EAN/ITF ignoriert werden
