# Batch 16 – Pro-Toggle: Sichtbarkeit & Ergebnisbereich

## Manuelle Tests

1. **Initialzustand**
   - Seite `druck-kosten.html` neu laden.
   - Prüfen, dass der Toggle „Pro-Optionen“ deaktiviert ist.
   - Verifizieren, dass der Block mit den Pro-Feldern unsichtbar ist und sich nicht per Tab-Fokus erreichen lässt.
   - In der Ergebnisliste müssen nur folgende Zeilen erscheinen: Material (Basis), Verschnitt, Material (inkl. Verschnitt), Energiekosten, Zwischensumme sowie Gesamtkosten (netto/brutto).

2. **Pro-Modus aktivieren**
   - Toggle aktivieren und sicherstellen, dass der Pro-Block sichtbar ist (ohne `hidden`, `aria-hidden="false"`, kein `inert`).
   - Ergebnisliste erweitert sich um Arbeitszeitkosten, Maschinenkosten, Fixkosten (inkl. Verpackung/Versand), Marge, Rabatt und den Hinweistext „Pro-Optionen aktiv …“.

3. **Kein Persistieren**
   - Seite aktualisieren und bestätigen, dass der Toggle wieder deaktiviert ist und die Pro-Felder sowie Ergebniszeilen ausgeblendet bleiben.

4. **Berechnung & Anzeige**
   - Beispielwerte eintragen (Materialpreis, Gewicht, Stromkosten usw.).
   - Pro-Felder (z. B. Stundenlohn, Rüstzeit, Maschinenkosten €/h, Fehlerrate, Verpackung/Versand, Marge, Rabatt) mit Werten befüllen und sicherstellen, dass die Summen korrekt aktualisiert werden. Marge darf nur auf Material (inkl. Fehlerrate), Energie, Arbeitszeit und Maschinenkosten wirken; Fixkosten bleiben unverändert.
   - Optional: Anschaffungswert + Lebensdauer eintragen und prüfen, dass daraus ein €/h-Wert entsteht und im Ergebnis als Maschinenkosten geführt wird.
   - Filamentlänge ohne Gewicht nutzen, Dichte anpassen und verifizieren, dass das Gewicht daraus abgeleitet wird.

5. **Print-Ansicht**
   - `Speichern / Drucken` klicken und vor dem Druckdialog kontrollieren, dass die Druckzusammenfassung exakt die aktuell sichtbaren Zeilen enthält (Standard vs. Pro).
   - Prüfen, dass die erweiterten Eingaben nur im Pro-Modus in der Drucksektion „Pro-Optionen – Eingaben“ erscheinen (inkl. Maschinenkosten, Verpackung/Versand, Fehlerrate, Dichte).

6. **Keyboard-Navigation**
   - Bei deaktiviertem Pro-Modus per Tab-Taste durch das Formular navigieren und verifizieren, dass Pro-Eingabefelder nicht fokussiert werden.
   - Bei aktiviertem Pro-Modus muss die Tastaturnavigation alle Zusatzfelder erreichen.
