# Werkstatt-Rechner Metall Plus · v8 Schnittdaten-Bohrlogik

Stand: 2026-06-05

## Änderungen
- Schnittdaten-Bereich fachlich klarer getrennt nach Bohren, Fräsen und Drehen.
- Beim Bohren wird die Schneidenzahl z fest auf 2 gesetzt und deaktiviert.
- Beim Bohren wird Schnittbreite ae deaktiviert, weil sie für den Bohrvorgang nicht benötigt wird.
- Vorschubfeld passt sich an: Bohren/Drehen = f in mm/U, Fräsen = fz in mm/Zahn.
- Bohrmodus berechnet Vorschub mit vf = n × f statt n × z × fz.
- Bohrmodus zeigt grobes Spanvolumen aus Kreisfläche × Vorschub sowie grobe Bohrzeit, wenn Bohrtiefe eingetragen ist.
- Merker/Formeln rechts erklären deutlicher, was Materialauswahl und Richtwerte bedeuten.

## Nicht geändert
- Zentrales kleines W-TOOLS-Menü bleibt.
- Keine feste Start-/Tools-Navigation eingebaut.
- Andere Module wurden nicht bewusst erweitert.
