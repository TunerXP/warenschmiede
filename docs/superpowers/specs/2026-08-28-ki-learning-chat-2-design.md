# Design: KI-Lern-Chat 2.0

Stand: 28.08.2026

## Ziel

Der bisherige WhatsApp-artige „KI-Versteher“ unter `ki/chat.html` wird vollständig durch einen modernen, breiten Warenschmiede-Lern-Chat ersetzt. Die Seite soll Einsteigern nicht nur erklären, was KI ist, sondern anhand kurzer, animierter Praxisgespräche zeigen, wie man moderne KI im Alltag tatsächlich benutzt.

Der Lern-Chat ist ausdrücklich eine **interaktive Simulation** und keine echte KI-Verbindung. Es werden keine Nutzereingaben an einen KI-Dienst gesendet, es entstehen keine API-Kosten und es werden keine echten Dateien verarbeitet.

## Nutzererlebnis

Die Seite nutzt die verfügbare Browserbreite und wirkt wie ein moderner KI-Arbeitsbereich, nicht wie ein Chat in einem Handyrahmen oder ein separates Fenster.

Auf breiten Bildschirmen besteht die Oberfläche aus zwei Bereichen:

- links: Lern-Chat-Navigation mit Themenliste
- rechts: großer Chatbereich mit Gespräch, Anhängen, Lernhinweisen und Eingabezeile

Beim Verkleinern des Browserfensters passt sich das Layout fließend an. Auf kleinen Displays verschwindet die linke Spalte hinter einem kompakten „Lern-Chats“-Schalter und der Chat nutzt die volle Breite.

Oben bleibt die normale Warenschmiede-Navigation erhalten. Direkt im Lern-Chat steht sichtbar, aber dezent:

> Interaktive Lernsimulation · Es werden keine echten Daten übertragen.

## Menüstruktur

Im globalen Bereich „Einsteigen“ werden die bisherigen prominenten Einträge neu geordnet:

- **KI kennenlernen** → `/ki/chat.html`
  - Beschreibung: „Ein interaktiver Lern-Chat zeigt dir KI in der Praxis.“
- **Erste Schritte & Tutorials** → `/ki/tutorials/`
  - Beschreibung: „Screenshots, Dateien und praktische Grundlagen Schritt für Schritt.“

Das **KI-Lexikon** bleibt als Seite bestehen, wird aber aus der prominenten Einstiegsspalte entfernt. Es wird künftig als Nachschlagewerk aus passenden Seiten verlinkt.

Der bestehende Pfad `ki/chat.html` bleibt erhalten. Dadurch funktionieren alte Links weiter; nur Inhalt und Bezeichnung ändern sich.

## Startumfang: sechs Lern-Chats

### Angeheftet

1. **Einstieg – Was kann KI eigentlich?**
   - kurze, freundliche Einführung ohne Fachchinesisch
   - erklärt, dass moderne KI mit Text, Bildern, Dateien und längeren Aufgaben arbeiten kann
   - zeigt, dass normale Alltagssprache genügt und keine „Prompt-Zauberei“ nötig ist
   - Abschlussgedanke: mit einer echten Aufgabe anfangen und im Gespräch weiterarbeiten

2. **Einen Screenshot zeigen**
   - im Eingabefeld wird eine natürliche Frage sichtbar geschrieben
   - ein Screenshot-Anhang wird optisch hinzugefügt
   - die Nachricht wird abgesendet
   - die KI erklärt beispielhaft eine harmlose Fehlermeldung
   - Lernhinweis: nur den relevanten Bereich zeigen und vertrauliche Inhalte vorher prüfen
   - Link zum bestehenden Windows-Screenshot-Tutorial

3. **Eine PDF verstehen**
   - eine PDF-Dateikarte wird als Anhang eingeblendet
   - Beispielanfrage: verständlich zusammenfassen und wichtige Punkte nennen
   - die KI liefert eine kurze strukturierte Zusammenfassung
   - danach folgt eine Rückfrage wie „Erklär mir Punkt 3 nochmal einfacher.“
   - Lernziel: Dateien können Ausgangspunkt eines längeren Gesprächs sein

4. **Sicher mit KI arbeiten**
   - die Simulation beginnt absichtlich mit einer ungeeigneten Eingabe, z. B. einem Passwort
   - vor dem Absenden stoppt die Demo sichtbar
   - erklärt: keine Passwörter, PIN/TAN, API-Schlüssel, unnötigen personenbezogenen Daten, Kunden- oder vertraulichen Firmendaten
   - weist darauf hin, dass Unternehmen eigene KI-Regeln, Freigaben oder Sperren haben können
   - verweist auf die bestehende Sicherheits-/FAQ-Seite

### Praxis

5. **Einen Text gemeinsam verbessern**
   - erste einfache Aufgabe wie „Kannst du das freundlicher schreiben?“
   - danach kurze Folgeanweisungen: „Etwas lockerer bitte.“ und „Jetzt kürzer.“
   - Lernziel: gute Ergebnisse entstehen oft im Gespräch und nicht durch einen einzigen perfekten Prompt

6. **Recherchieren und nach Quellen fragen**
   - zeigt eine Frage, bei der aktuelle Informationen wichtig sind
   - Folgeanweisung: „Bitte prüfe das aktuell und nenne mir Quellen.“
   - Lernziel: zwischen allgemeinem Wissen und aktueller Recherche unterscheiden und wichtige Aussagen kontrollieren

## Ablauf und Animation

Ein Lern-Chat läuft nicht als ununterbrochener Film durch. Er besteht aus kurzen, kontrollierten Schritten.

Unterstützte Schritttypen:

- Nachricht des Nutzers im Chat anzeigen
- Text sichtbar in die Eingabezeile tippen
- Bild-/Screenshot-Anhang einblenden
- PDF-Dateikarte einblenden
- Nachricht absenden
- kurzen Status „KI arbeitet …“ anzeigen
- KI-Antwort abschnittsweise erscheinen lassen
- Lernhinweis anzeigen
- Tutorial-/Infoseiten-Link anzeigen
- an definierten Punkten auf Nutzeraktion warten

Lange KI-Antworten werden nicht vollständig Buchstabe für Buchstabe animiert. Nur kurze Eingaben werden sichtbar getippt; längere Antworten erscheinen abschnittsweise, damit die Demo angenehm schnell bleibt.

## Bedienung

Im Chat stehen folgende Steuerungen bereit:

- **Pause** – hält die laufende Simulation an
- **Weiter** – setzt die nächste Etappe fort
- **Neu starten** – startet den aktuell gewählten Lern-Chat erneut

Beim Wechsel zu einem anderen Lern-Chat startet dessen Ablauf von vorn.

Bereits vollständig angesehene Lern-Chats erhalten in der linken Navigation ein kleines `✓`.

Der Fortschritt wird nur mit `sessionStorage` für die aktuelle Browsersitzung gespeichert. Es gibt keine Datenbank, kein Nutzerkonto und keine dauerhafte Speicherung.

## Technische Aufteilung

Die Umsetzung wird in klar getrennte Dateien aufgeteilt:

- `ki/chat.html`
  - semantisches Grundgerüst der Seite
  - Warenschmiede-Header/Breadcrumbs
  - Chat-Shell und zugängliche Bedienelemente
- `assets/css/ki-learning-chat.css`
  - vollständiges Layout und responsive Darstellung des Lern-Chats
  - keine unnötige Veränderung globaler KI-Stile
- `assets/js/ki-learning-chat.js`
  - Chat-Motor
  - Themenwechsel
  - Animationssteuerung
  - Pause/Weiter/Neustart
  - Fortschrittsstatus
  - Rendern der verschiedenen Schritttypen
- `assets/js/ki-learning-chat-data.js`
  - ausschließlich Inhalte und Ablaufdaten der Lern-Chats
  - keine DOM- oder Animationslogik

Diese Trennung ist bewusst gewählt, damit neue Lern-Chats später überwiegend als neue Datenblöcke ergänzt werden können, ohne den Chat-Motor umzubauen.

## Datenmodell

Jeder Lern-Chat besitzt mindestens:

- eindeutige ID
- Titel
- Gruppe (`pinned` oder `practice`)
- kurze Beschreibung
- geordnete Liste von Schritten

Ein Schritt enthält einen Typ und die dafür nötigen Daten, zum Beispiel Text, Anhangerkennung, Dateiname, optionale Vorschau, Lernhinweis oder Ziel-Link.

Der Chat-Motor kennt nur die unterstützten Schritttypen. Inhalte werden nicht fest in den Motor programmiert.

## Anhänge und spätere Assets

Der erste Release muss nicht von echten PDF-Dateien oder Screenshot-Vorschauen abhängen. Anhänge können zunächst als neutrale, hochwertige Demo-Karten gerendert werden.

Für spätere echte Assets werden folgende Verzeichnisse vorgesehen:

- Bilder/Screenshots/Vorschauen: `assets/img/tutorials/ki/lern-chat/`
- harmlose Demo-Dateien: `assets/files/ki/lern-chat/`

Wenn später echte Beispiele ergänzt werden, sollen sie keine vertraulichen oder personenbezogenen Daten enthalten.

Geplante Erweiterungsmöglichkeiten:

- echtes Beispielbild für „Screenshot zeigen“
- harmlose fiktive Beispiel-PDF für „PDF verstehen“
- Foto-/Bildanalyse als weiterer Lern-Chat
- zusätzliche Lern-Chats ohne Änderung am Grundlayout

## Responsive Verhalten

Desktop / große Tablets:

- linke Lern-Chat-Spalte sichtbar
- rechter Chatbereich nutzt den verbleibenden Platz
- Oberfläche darf die Browserbreite ausnutzen und wird nicht künstlich auf einen schmalen Kartenbereich begrenzt

Mittlere Breiten:

- linke Spalte wird kompakter
- Chat bleibt Hauptbereich
- keine horizontale Scrollleiste

Kleine Displays:

- linke Navigation ist standardmäßig eingeklappt
- „Lern-Chats“-Schalter öffnet eine seitlich einblendende Themenliste
- Chat nutzt die volle Breite
- Bedienelemente bleiben erreichbar und verdecken keine Nachrichten

## Barrierefreiheit

Die Lern-Chat-Navigation und alle Steuerungen müssen mit Tastatur bedienbar sein.

Zusätzlich:

- sichtbare Fokuszustände
- sinnvolle ARIA-Bezeichnungen für Themenwechsel, Chatstatus und Bedienelemente
- Statusmeldungen werden so umgesetzt, dass Screenreader nicht mit jeder animierten Zwischenstufe überflutet werden
- `prefers-reduced-motion` wird berücksichtigt; bei reduzierter Bewegung werden Tipp- und Übergangsanimationen stark verkürzt oder übersprungen
- ausreichende Kontraste im Warenschmiede-Design

## Sicherheit und Datenschutz

Die Simulation darf keine echte Dateiannahme und keine echte KI-Schnittstelle anbieten.

Es werden keine Chattexte oder Anhänge an externe Dienste gesendet. Die Eingabezeile ist Teil der Demo und wird nicht als echter Chat beworben.

Der Sicherheits-Lern-Chat zeigt ausdrücklich, dass sensible Informationen nicht ungeprüft in KI-Dienste gehören und dass am Arbeitsplatz betriebliche Vorgaben gelten können.

## Umgang mit bestehenden Seiten

### `ki/chat.html`

Wird vollständig ersetzt, Pfad bleibt erhalten.

### `ki/lexikon.html`

Bleibt erhalten. Nur die prominente Menüposition wird entfernt. Inhaltliche Modernisierung des Lexikons ist ein separates späteres Vorhaben.

### `ki/tutorials/`

Bleibt der praktische Tutorial-Bereich. Der Lern-Chat verweist gezielt auf passende Tutorials, insbesondere auf das Windows-Screenshot-Tutorial.

### `ki/index.html`

Die komplette Modernisierung dieser Seite ist nicht Bestandteil dieses ersten Lern-Chat-Projekts. Veraltete direkte Bezeichnungen oder Links zum alten „KI-Versteher“ dürfen im Zuge der Umsetzung gezielt auf „KI kennenlernen“ aktualisiert werden, sofern sie sonst inkonsistent wären.

## Nicht-Ziele für Version 1

- keine echte KI/API-Anbindung
- keine echten Uploads durch Besucher
- keine Konten oder Logins
- keine dauerhafte Fortschrittsspeicherung
- keine Gamification mit Punkten, Abzeichen oder Ranglisten
- kein 1:1-Nachbau der ChatGPT-Oberfläche
- keine komplette Überarbeitung des KI-Lexikons oder der KI-Startseite

## Teststrategie

Vor der Implementierung werden automatisierte Struktur-/Verhaltensprüfungen ergänzt, die zunächst gegen den alten Stand fehlschlagen und nach der Umsetzung bestehen.

Zu prüfen sind mindestens:

- `ki/chat.html` lädt die neue CSS- und JS-Struktur
- alte WhatsApp-spezifische Hauptstruktur ist entfernt
- sechs definierte Lern-Chats sind in den Daten vorhanden
- Screenshot- und PDF-Schritttypen sind vorhanden
- Pause/Weiter/Neustart sind im UI vorhanden
- Fortschrittslogik nutzt `sessionStorage`
- Menü enthält „KI kennenlernen“ und „Erste Schritte & Tutorials“
- `KI-Lexikon` ist nicht mehr prominenter Einstiegseintrag
- responsive CSS enthält Desktop- und Mobile-Zustände
- `prefers-reduced-motion` wird berücksichtigt

Zusätzlich erfolgt ein manueller Browsertest auf breitem Desktop, verkleinertem Browserfenster und schmalem Mobil-Viewport.

## Akzeptanzkriterien

Die Umsetzung gilt als gelungen, wenn:

1. `ki/chat.html` wie ein breiter moderner KI-Arbeitsbereich wirkt und nicht mehr wie WhatsApp.
2. Die sechs Lern-Chats links auswählbar sind und jeweils einen nachvollziehbaren Ablauf starten.
3. Eingaben, Anhänge und KI-Antworten sichtbar simuliert werden, ohne echte Daten zu übertragen.
4. PDF- und Screenshot-Nutzung praktisch verständlich demonstriert werden.
5. Sicherheitsregeln als eigener Lern-Chat verständlich vermittelt werden.
6. Pause, Weiter und Neustart zuverlässig funktionieren.
7. erledigte Lern-Chats während der Sitzung ein `✓` erhalten.
8. das Layout beim Ändern der Browserbreite ohne horizontales Überlaufen mitwächst bzw. zusammenklappt.
9. die mobile Navigation nutzbar bleibt.
10. die globale KI-Navigation unter „Einsteigen“ die neue Lernlogik widerspiegelt.
11. bestehende Tutorial-, Chat-KI- und Suno-Bereiche unverändert weiter funktionieren.

## Erweiterbarkeit

Neue Lern-Chats sollen später überwiegend durch Ergänzen eines neuen Datenblocks in `ki-learning-chat-data.js` möglich sein. Der Chat-Motor darf dafür keine themenspezifischen Sonderfälle benötigen, solange vorhandene Schritttypen ausreichen.

Neue Schritttypen werden nur eingeführt, wenn ein späteres Tutorial eine tatsächlich neue Interaktion benötigt. Dadurch bleibt das System übersichtlich und wartbar.
