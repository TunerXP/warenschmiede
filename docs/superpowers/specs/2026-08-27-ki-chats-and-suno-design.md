# KI-Chats und Suno – Design

## Ziel

Die KI-Abteilung der Warenschmiede wird verständlicher und aktueller aufgebaut. Statt einer großen gemischten Werkzeugliste gibt es drei klar erkennbare Wege: KI im Alltag, aktuelle Chat-KIs und KI-Musik mit Suno.

## Navigation

Im bestehenden Mega-Menü `Über KI` bleibt die Gruppe `Arbeiten mit KI`, bekommt aber drei verständliche Einträge:

1. **KI im Alltag** → `ki/prompts.html`
   - Beschreibung: Natürlich fragen, Bilder nutzen und gemeinsam zum Ergebnis kommen.
2. **Aktuelle KI-Chats** → `ki/tools.html`
   - Beschreibung: ChatGPT, Gemini, Claude & Co. – Unterschiede und besondere Funktionen.
3. **KI-Musik mit Suno** → `ki/musik/suno.html`
   - Beschreibung: Songs erstellen, Ideen entwickeln und KI-Musik verstehen.

`ws-layout.js` bleibt die zentrale Quelle für Desktop- und Mobilnavigation. Es wird kein lokales Seitenmenü dupliziert.

## Aktuelle KI-Chats – Übersichtsseite

`ki/tools.html` wird nicht mehr als riesiges Dashboard für Chat, Bild, Video, Audio und Büro geführt. Die Seite wird zu einer kompakten Orientierung über die fünf großen Chat-/Allround-KIs:

- ChatGPT
- Gemini
- Claude
- Microsoft Copilot
- Perplexity

Jede KI erhält auf der Übersicht:
- eine kurze Einordnung,
- 3–5 typische Stärken oder besondere Funktionen,
- einen Hinweis, für wen sie interessant sein kann,
- einen Link zur eigenen Detailseite,
- einen Link zur offiziellen Anbieter-Seite.

Oben steht deutlich **Stand: 27. August 2026** mit dem Hinweis, dass Funktionen, Tarife und Verfügbarkeit sich schnell ändern können.

Die Seite soll nicht behaupten, dass eine KI objektiv „die beste“ ist. Sie hilft beim Einordnen und Vergleichen.

## Detailseiten für Top-KIs

Unter `ki/chats/` entstehen fünf Detailseiten:

- `chatgpt.html`
- `gemini.html`
- `claude.html`
- `copilot.html`
- `perplexity.html`

Alle Detailseiten verwenden denselben Aufbau, damit Besucher schnell vergleichen können:

1. **Was ist das?**
2. **Was kann es aktuell besonders gut?**
3. **Besondere Bereiche / Modi**
4. **Verbindungen, Apps oder Arbeitsumgebung** – sofern relevant
5. **Für wen ist es interessant?**
6. **Worauf sollte man achten?** – Datenschutz, Plan-/Region-/Workspace-Abhängigkeit, wichtige Ergebnisse prüfen
7. **Stand der Informationen**
8. Link zur offiziellen Produktseite bzw. offiziellen Dokumentation

### ChatGPT

Besonders hervorheben:
- normaler Chat für Gespräch und schnelle Hilfe,
- Work für längere, mehrstufige Aufgaben und fertige Ergebnisse,
- Deep Research für dokumentierte Recherche,
- Apps/Plugins und verbundene Dienste für externe Daten und Aktionen,
- Codex für Softwareentwicklung,
- Hinweis, dass Funktionsumfang von Tarif, Region und Workspace abhängen kann.

### Gemini

Besonders hervorheben:
- allgemeiner multimodaler Assistent,
- enge Einbindung in Googles Ökosystem,
- aktuelle agentische Entwicklung der Gemini-App,
- Gemini Spark als proaktiver Agent,
- aktuelle Modellgeneration und schnelle Varianten ohne unnötige Modelltabellen.

### Claude

Besonders hervorheben:
- stark bei Text, langen Aufgaben, Coding und professioneller Wissensarbeit,
- Claude Code als Coding-Agent,
- aktuelle Sonnet-/Opus-Generation,
- Fokus auf länger laufende Agenten und professionelle Arbeit.

### Microsoft Copilot

Besonders hervorheben:
- Integration in Microsoft 365,
- Word, Excel, PowerPoint, Outlook und Teams als natürlicher Arbeitskontext,
- Researcher für tiefe Recherche,
- Cowork bzw. agentische Arbeitsabläufe,
- Copilot Tasks nur mit klarer Kennzeichnung, wenn Funktion noch Preview/gestuft verfügbar ist.

### Perplexity

Besonders hervorheben:
- Recherche mit Quellen,
- Projects als Arbeitsräume,
- Perplexity Computer für agentische Aufgaben,
- aktuelle Entwicklung hin zu lokaleren/private-first Arbeitsweisen,
- keine pauschale Behauptung, dass Perplexity immer zuverlässiger als andere Dienste sei.

## KI-Musik mit Suno

Neue Seite: `ki/musik/suno.html`.

Sie ist kein Unterpunkt der Chat-KI-Übersicht, weil Suno ein spezialisiertes Musik-KI-System ist.

Inhalt:
1. Was Suno ist und wofür es gedacht ist.
2. Ein einfacher Workflow: Idee → Text/Stil → Generieren → Anhören → Verfeinern.
3. Wie eine Chat-KI beim Vorbereiten von Songideen, Texten und Stilbeschreibungen helfen kann.
4. Aktuelle Suno-Funktionen mit Stand August 2026:
   - v5.5,
   - Voices,
   - Custom Models,
   - My Taste,
   - Stem Separation,
   - Suno Studio 2.0,
   - MIDI,
   - Chat Bar (Beta) in Studio 2.0.
5. Hinweis auf Tarife und mögliche Funktionsunterschiede.
6. Klarer Abschnitt zu Veröffentlichung, Rechten, Nutzungsbedingungen und verantwortlichem Umgang; keine vereinfachten Rechtsversprechen.
7. Platz im Layout für spätere eigene Screenshots, aber noch keine leeren sichtbaren Platzhalter.

## Gestaltung

Die neue Übersicht und Detailseiten sollen sich an der modernen Warenschmiede-Gestaltung orientieren, aber nicht wieder zu einer Wand aus gleich aussehenden Karten werden.

- starke Hero-Bereiche,
- klare Abschnitte und Vergleichbarkeit,
- wenige gezielte Karten/Flächen,
- sichtbare „Stand“-Angabe,
- keine riesigen Tool-Kataloge,
- responsive für Desktop, Tablet und Mobil,
- vorhandene zentrale Header-/Footer-Architektur verwenden.

Neue Styles werden isoliert angelegt:
- `assets/css/ki-chats.css`
- `assets/css/ki-music.css`

Bestehende globale KI-Styles werden nicht großflächig umgebaut.

## Quellen und Aktualität

Für aktuelle Funktionsbeschreibungen werden bevorzugt offizielle Anbieterquellen verwendet. Aussagen werden bewusst vorsichtig formuliert, weil Rollouts, Tarife, Regionen und Workspace-Einstellungen Unterschiede verursachen können.

Die Seiten enthalten keine harte Preisübersicht mit Beträgen, da diese schnell veraltet. Stattdessen wird auf die jeweilige offizielle Preis-/Produktseite verwiesen.

## SEO und Technik

Jede neue Seite erhält:
- eindeutigen `<title>`,
- Meta-Description,
- Canonical URL,
- Open-Graph-/Twitter-Grunddaten,
- genau ein `<h1>`,
- Breadcrumbs,
- globale `ws-layout.js`-Navigation,
- sinnvolle interne Links zurück zur Übersicht.

Die Sitemap wird erst nach Zusammenführung des bereits offenen Prompt-/Tutorial-PRs aktualisiert, damit beide Arbeiten nicht unnötig auf `sitemap.xml` kollidieren. Falls der erste PR vor Abschluss dieses Branches bereits gemerged ist, kann die Sitemap hier noch mitgezogen werden.

## Nicht Teil dieses Schritts

- keine komplette Bild-/Video-KI-Sammlung,
- keine riesige Liste kleiner KI-Anbieter,
- keine Screenshots von Herstelleroberflächen, solange noch keine eigenen passenden Bilder vorliegen,
- keine Tarifvergleichstabelle mit festen Preisen,
- kein automatischer Merge oder Deployment.

## Erfolgskriterien

- Menü ist für Einsteiger ohne Kenntnis des Wortes „Prompt“ verständlich.
- Chat-KIs und Suno sind klar getrennt.
- Die fünf Top-KIs sind auf einer übersichtlichen Seite vergleichbar.
- Jede Top-KI besitzt eine eigene, wartbare Detailseite.
- ChatGPT erklärt auch Work, Deep Research, Apps/Plugins und Codex verständlich.
- Suno hat einen eigenen, ausbaufähigen Einstieg.
- Alle Seiten bleiben mobil gut lesbar und verwenden die zentrale Navigation.
