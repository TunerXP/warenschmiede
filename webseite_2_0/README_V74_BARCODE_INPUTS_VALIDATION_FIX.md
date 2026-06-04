# v74 Barcode-Werkstatt Plus · Eingaben merken & Prüfung korrigiert

## Wichtig
Diese ZIP enthält bewusst KEINE `assets/js/ws-layout.js`.
Der zentrale Homepage-Header wird nicht überschrieben.

## Datei ersetzen
Kopiere:

`ws_v74_barcode_werkstatt_plus_inputs_validation_fix/tools/BarcodeWerkstattPlus.html`

nach:

`webseite_2_0/tools/BarcodeWerkstattPlus.html`

## Repariert
### 1. Eingaben je Barcode-Art merken
Vorher konnten Eingaben verloren gehen, wenn man z. B. EAN-13 änderte, zu Code128 wechselte und wieder zurückkam.

Jetzt gilt:
- jede Barcode-Art merkt sich ihre aktuellen Eingaben
- Wechsel zwischen Code128 / EAN / ITF / Code39 überschreibt nicht mehr unnötig
- Versionen speichern diese Eingabe-Zwischenstände mit

### 2. Feldprüfung sauberer
Vorher konnte das Infofeld rot sein, aber das Eingabefeld trotzdem grün wirken.

Jetzt gilt:
- konkrete falsche Felder werden rot
- grün nur bei Feldern mit tatsächlich geprüfter Regel
- neutrale Felder bleiben neutral
- EAN/ITF-Längen markieren das betroffene Eingabefeld rot
- Code39-Zeichenfehler markieren das betroffene Eingabefeld rot

## Testempfehlung
1. EAN-13 wählen, Zahl ändern
2. Code128 wählen, Wert ändern
3. zurück zu EAN-13
4. prüfen, ob EAN-13-Wert erhalten blieb
5. ungültige EAN-Länge eingeben
6. prüfen, ob Infofeld UND Eingabefeld rot werden
7. Projekt-JSON speichern/laden
8. prüfen, ob Werte je Barcode-Art erhalten bleiben
