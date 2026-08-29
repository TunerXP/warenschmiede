# KI-Wissensbereich: Modernisierung von Praxis, Sicherheit und Lexikon

## Ziel

Die drei bestehenden KI-Seiten werden zu einem zusammenhängenden, leicht verständlichen Wissensbereich überarbeitet. Er soll dauerhaft nützlich bleiben, ohne jeder Produktmeldung oder jedem Modewort hinterherzulaufen.

Die Inhalte bleiben neutral, werbefrei und ohne Nennung realer Betriebe oder Personen. Sie sind Orientierung, keine Rechtsberatung, keine individuelle Datenschutzberatung und keine Zusage rechtlicher Compliance.

## Seitenrollen und Leserweg

| Seite | Aufgabe | Ziel nach dem Lesen |
| --- | --- | --- |
| `ki/so-arbeitest-du-mit-ki.html` | Einstieg in die praktische Arbeit mit KI | Eine Aufgabe klar und verantwortungsvoll mit KI bearbeiten können |
| `ki/faq.html` | Schnelle, lesbare Sicherheitseinordnung | Wissen, welche Daten tabu sind und wann Ergebnisse geprüft werden müssen |
| `ki/lexikon.html` | Begriffe nachschlagen | Wichtige aktuelle Begriffe ohne Fachsprache verstehen |

Leserweg: **Mit KI arbeiten → KI sicher nutzen → Begriffe nachschlagen → KI im Betrieb**. Die betriebliche Seite bleibt der einzige Ort für betriebliche Regeln, Freigaben und den Bezug zur KI-Kompetenz.

## Seite 1: Mit KI arbeiten

Die bestehende Seite `so-arbeitest-du-mit-ki.html` wird inhaltlich neu aufgebaut, die URL bleibt erhalten.

### Kernaussage

KI ist ein Werkzeug für Entwürfe, Struktur und Ideen. Der Mensch setzt Ziel und Grenzen, prüft das Ergebnis und trägt die Verantwortung.

### Aufbau

1. Hero: „Mit KI arbeiten – klar fragen, sinnvoll prüfen“.
2. Fünf-Schritte-Ablauf: Ziel, Kontext, gewünschtes Ergebnis, verbessern, prüfen.
3. Vier praxisnahe Karten: Texte & Erklärungen, Planen & Strukturieren, Bilder & Ideen, Software & Automatisierung.
4. Eigene Sektion „Wenn KI beim Programmieren hilft“:
   - Natürlichsprachliche Beschreibung kann Software, Änderungen und Tests anstoßen.
   - Für Prototypen ist schnelles Ausprobieren sinnvoll.
   - Für veröffentlichte oder wichtige Anwendungen: Anforderungen, Testen, Datenschutz, Sicherheitsprüfung und Verständnis der Lösung bleiben nötig.
5. Weiterführende Links zur Sicherheitsseite und zu „KI im Betrieb“.

Das alte Suno- und C#-Tutorial wird entfernt. Es ist zu produktbezogen und beschreibt nicht mehr den heutigen Schwerpunkt der Seite.

## Seite 2: KI sicher nutzen

`faq.html` behält ihre URL, wird aber nicht mehr als lange Akkordeon-FAQ aufgebaut. Sie wird eine direkt lesbare Sicherheitsseite mit kurzen, klaren Abschnitten.

### Aufbau

1. Hero: „KI sicher nutzen – Daten schützen, Ergebnisse prüfen“.
2. Was KI gut kann – und was nicht.
3. Was nicht in einen KI-Chat gehört: Passwörter, Zugangsdaten, personenbezogene Daten, vertrauliche Unterlagen und interne Kalkulationen.
4. Wichtige Ergebnisse prüfen: Quellen, Zahlen, Fakten, Bilder und Code.
5. KI-Inhalte erkennen und einordnen: KI kann täuschend echte Texte, Bilder, Stimmen und Videos erzeugen; nicht jede KI-Nutzung oder jeder KI-Inhalt muss gleich behandelt werden.
6. Wann Originalquellen oder Fachleute nötig sind: Medizin, Recht, Finanzen, Sicherheitsfragen und verbindliche Entscheidungen.
7. Weiterleitung zu „KI im Betrieb“ für betriebliche Nutzung.

Die Aussage „Du selbst haftest“ wird nicht verwendet. Verantwortung und mögliche rechtliche Folgen hängen vom Kontext ab.

## Seite 3: KI-Lexikon

`lexikon.html` bleibt das Nachschlagewerk, wird jedoch neu sortiert und von schnell alternden Produkt- und Anbieterbezügen befreit.

### Oben: Die 10 wichtigsten Begriffe

1. Prompt
2. Generative KI
3. KI-Modell
4. Halluzination
5. Kontext
6. Multimodale KI
7. KI-Agent
8. RAG
9. Vibe Coding
10. Datenschutz

Jeder Begriff erhält eine kurze Erklärung in Alltagssprache und einen Satz dazu, warum er praktisch wichtig ist.

### Darunter: vertiefendes Lexikon

- **Verstehen:** maschinelles Lernen, neuronales Netz, Training, Inferenz, Tokens.
- **Arbeiten:** Prompt, Systemanweisung, Kontextfenster, multimodal, RAG, API, KI-Agent, Vibe Coding.
- **Qualität & Sicherheit:** Halluzination, Bias, Quellenprüfung, personenbezogene Daten, sensible Daten, Erklärbarkeit.

„Agentische KI“ wird zusammen mit „KI-Agent“ erklärt: Ein Agent kann ein Ziel in Schritte zerlegen und Werkzeuge nutzen; er bleibt nur innerhalb seiner Freigaben und Kontrolle sinnvoll.

„Vibe Coding“ wird als aktueller, aber bewusst einzuordnender Begriff erklärt: schnelle Entwicklung mit natürlicher Sprache und KI-Unterstützung. Für ernsthafte Software ersetzt er keine Tests, Sicherheitsprüfung oder Verantwortung.

## Gestaltung und Technik

- Bestehende URLs, Canonicals, Brotkrumen, Header/Footer und Sitemap bleiben erhalten.
- Gemeinsame visuelle Sprache über `assets/css/ki-content.css`; nur bei echtem Bedarf eine kleine ergänzende KI-CSS-Datei.
- Keine Produktlogos, keine Anbieterempfehlungen und keine künstlich erzeugten „Beweisbilder“.
- Keine Akkordeon-Pflicht für Kernwissen. Inhalte bleiben beim Scrollen erfassbar.
- Jede Seite erhält „Fachlich geprüft: August 2026“ und verlinkt nur dort auf Quellen, wo eine rechtliche oder sicherheitsrelevante Aussage erklärt wird.

## Fachliche Leitplanken und Quellen

- KI-Kompetenz: [EU AI Act, Artikel 4](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4).
- Datenschutz und KI-Modelle: [BfDI](https://www.bfdi.bund.de/DE/BfDI/Konsultationsverfahren/KI-Modelle-pbD/KI-Modelle-pbD_node.html).
- Transparenzpflichten für bestimmte KI-Inhalte: [EU AI Act, Artikel 50](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50).
- Einordnung von KI-Agenten: [Google Cloud](https://cloud.google.com/discover/what-is-agentic-ai).
- Einordnung von Vibe Coding: [GitHub](https://github.com/resources/articles/what-is-vibe-coding).

Rechtliche Aussagen werden als Orientierung formuliert. Bei individuellen Fällen und betrieblichen Entscheidungen gehen eigene Regeln, zuständige Stellen und fachliche Beratung vor.

## Umsetzungsreihenfolge

1. `so-arbeitest-du-mit-ki.html` modernisieren.
2. `faq.html` zur Sicherheitsseite umbauen.
3. `lexikon.html` mit Top-10-Start und vertiefenden Gruppen umbauen.

Jede Stufe erhält einen eigenen PR mit HTML-Prüfung, Navigations-/Link-Checks, Sitemap-XML-Prüfung und einer inhaltlichen Validator-Erweiterung.

## Ausgeschlossen

- Kein Editor oder Generator für die A4-Betriebsregeln in dieser Stufe.
- Keine individuelle Rechts-, Datenschutz-, Medizin- oder Finanzberatung.
- Keine ausführlichen Anleitungen zu einzelnen KI-Anbietern; diese würden zu schnell altern.
