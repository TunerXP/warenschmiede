# KI-Chats und Suno Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die KI-Abteilung der Warenschmiede in drei verständliche Wege gliedern, eine kompakte Übersicht aktueller Top-Chat-KIs mit fünf Detailseiten schaffen und Suno als separaten KI-Musikbereich aufbauen.

**Architecture:** `assets/js/ws-layout.js` bleibt die einzige Quelle für Desktop- und Mobilnavigation. `ki/tools.html` wird zur Übersicht „Aktuelle KI-Chats“ umgebaut; Detailseiten liegen unter `ki/chats/`, Suno unter `ki/musik/`. Gemeinsame Darstellung wird über zwei neue, klar isolierte Stylesheets gelöst: `assets/css/ki-chats.css` und `assets/css/ki-music.css`.

**Tech Stack:** statisches HTML5, CSS, bestehendes `ws-layout.js`, keine neue Bibliothek, Python-Standardbibliothek für Strukturprüfung.

**Spec:** `docs/superpowers/specs/2026-08-27-ki-chats-and-suno-design.md`

## Global Constraints

- `ws-layout.js` bleibt zentrale Quelle für Desktop- und Mobilnavigation; keine lokalen Menüduplikate.
- Menüeinträge: `KI im Alltag`, `Aktuelle KI-Chats`, `KI-Musik mit Suno`.
- Top-KIs: ChatGPT, Gemini, Claude, Microsoft Copilot, Perplexity.
- ChatGPT-Seite erklärt Chat, Work, Deep Research, Apps/Plugins und Codex.
- Suno bleibt getrennt von Chat-KIs und erhält eine eigene Seite.
- Keine feste Preistabelle; Tarife, Region, Workspace und Rollouts werden als veränderlich gekennzeichnet.
- Offizielle Anbieterquellen für aktuelle Funktionsbeschreibungen bevorzugen.
- Genau ein `<h1>` pro Seite; Canonical, Meta-Description, Breadcrumbs und `ws-layout.js` auf jeder neuen Seite.
- Keine automatischen Merges oder Deployments.
- `sitemap.xml` wird in diesem Branch nicht geändert, solange PR #457 noch nicht in `main` enthalten ist.

---

### Task 1: Strukturprüfung zuerst anlegen

**Files:**
- Create: `scripts/validate_ki_sections.py`
- Test target: `assets/js/ws-layout.js`, `ki/tools.html`, `ki/chats/*.html`, `ki/musik/suno.html`

**Interfaces:**
- Consumes: statische Repository-Dateien.
- Produces: Exit-Code 0 bei erfüllten Strukturregeln, Exit-Code 1 mit verständlichen Fehlermeldungen sonst.

- [ ] **Step 1: Validierung schreiben**

Die Prüfung muss mindestens verlangen:
- Menü enthält `KI im Alltag`, `Aktuelle KI-Chats`, `KI-Musik mit Suno` und die drei erwarteten URLs.
- `ki/tools.html` verlinkt alle fünf Detailseiten.
- alle fünf Detailseiten und `ki/musik/suno.html` existieren.
- jede neue/ersetzte Seite enthält genau ein `<h1>`, Canonical, `ws-header`, `ws-footer` und `/assets/js/ws-layout.js`.
- ChatGPT-Seite enthält die Begriffe `Work`, `Deep Research`, `Plugins` und `Codex`.
- Suno-Seite enthält `v5.5`, `Studio 2.0`, `MIDI`, `Chat Bar` und `Stem`.

- [ ] **Step 2: Gegen den Ausgangsstand ausführen**

Run: `python scripts/validate_ki_sections.py`
Expected: FAIL, weil Menübezeichnungen und neue Detailseiten noch fehlen.

- [ ] **Step 3: Prüfsystem committen**

Commit message: `test: add KI section structure validator`

### Task 2: Zentrale Navigation verständlich umbenennen

**Files:**
- Modify: `assets/js/ws-layout.js`

**Interfaces:**
- Consumes: bestehende `NAVIGATION`-Struktur.
- Produces: drei Links in der Gruppe `Arbeiten mit KI`, automatisch für Desktop und Mobil wirksam.

- [ ] **Step 1: Menüinhalt ändern**

In `Arbeiten mit KI` exakt diese Einträge verwenden:
- `KI im Alltag` → `ki/prompts.html` → `Natürlich fragen, Bilder nutzen und gemeinsam zum Ergebnis kommen.`
- `Aktuelle KI-Chats` → `ki/tools.html` → `ChatGPT, Gemini, Claude & Co. – Unterschiede und besondere Funktionen.`
- `KI-Musik mit Suno` → `ki/musik/suno.html` → `Songs erstellen, Ideen entwickeln und KI-Musik verstehen.`

- [ ] **Step 2: Validierung ausführen**

Run: `python scripts/validate_ki_sections.py`
Expected: weiterhin FAIL wegen fehlender Detailseiten, aber keine Menüfehler mehr.

- [ ] **Step 3: Committen**

Commit message: `feat: clarify KI navigation`

### Task 3: Übersicht „Aktuelle KI-Chats“ und gemeinsames Design bauen

**Files:**
- Replace: `ki/tools.html`
- Create: `assets/css/ki-chats.css`

**Interfaces:**
- Consumes: globale `styles.css`, `ki-content.css`, zentrale Navigation.
- Produces: kompakte Top-5-Übersicht und Styles, die auch die Detailseiten verwenden.

- [ ] **Step 1: `ki/tools.html` neu aufbauen**

Die Seite enthält:
- Hero mit Titel `Aktuelle KI-Chats im Überblick`.
- sichtbaren Aktualitätshinweis `Stand: 28. August 2026`.
- Erklärung, dass es keine objektiv beste KI gibt.
- fünf deutlich unterscheidbare Bereiche für ChatGPT, Gemini, Claude, Microsoft Copilot und Perplexity.
- je System kurze Einordnung, 3–5 Stärken/Funktionen, `Mehr erfahren` zur Detailseite und offiziellen Anbieter-Link.
- Abschnitt `Was passt zu mir?` mit anwendungsbezogener Orientierung statt Rangliste.

- [ ] **Step 2: `ki-chats.css` erstellen**

Styles:
- großer Hero, ruhige Vergleichszeilen statt dichtem Kachelteppich.
- responsive Desktop/Tablet/Mobil.
- sichtbare Fokuszustände.
- Klassen ausschließlich mit Präfix `ki-chat-` bzw. unter `.ki-chats-page`.

- [ ] **Step 3: Validierung ausführen**

Run: `python scripts/validate_ki_sections.py`
Expected: FAIL nur noch wegen fehlender Detailseiten und Suno-Seite.

- [ ] **Step 4: Committen**

Commit message: `feat: rebuild current AI chat overview`

### Task 4: Fünf Top-KI-Detailseiten anlegen

**Files:**
- Create: `ki/chats/chatgpt.html`
- Create: `ki/chats/gemini.html`
- Create: `ki/chats/claude.html`
- Create: `ki/chats/copilot.html`
- Create: `ki/chats/perplexity.html`

**Interfaces:**
- Consumes: `assets/css/ki-chats.css`, `ws-layout.js`.
- Produces: wartbare Detailseiten mit identischem Informationsmuster.

- [ ] **Step 1: ChatGPT-Seite**

Erklären:
- Chat für schnelle Gesprächshilfe.
- Work als Agent für längere, mehrstufige Aufgaben und fertige Ergebnisse.
- Deep Research für umfangreiche Recherche mit Quellen.
- Plugins als Workflow-Pakete; Apps als Verbindungen zu externen Daten/Aktionen; Verfügbarkeit abhängig von Tarif, Workspace, Rolle, Region und App.
- Codex für Softwareentwicklung und Repository-Arbeit.
- klare Sicherheits-/Berechtigungshinweise.

- [ ] **Step 2: Gemini-Seite**

Erklären:
- multimodaler Allround-Assistent.
- Gemini 3.5 als aktuelle agentische Modellgeneration; Gemini 3.5 Flash als schnelle Variante.
- enge Google-Integration.
- Gemini Spark und proaktive Agenten-Funktionen mit vorsichtigem Rollout-Hinweis.

- [ ] **Step 3: Claude-Seite**

Erklären:
- Stärken bei langen Aufgaben, Text, Coding und Wissensarbeit.
- Sonnet 5 und Opus 5 als aktuelle relevante Modellgenerationen.
- Claude Code als Coding-Agent.
- agentische/länger laufende Arbeit und Werkzeugnutzung ohne pauschale „beste KI“-Behauptungen.

- [ ] **Step 4: Copilot-Seite**

Erklären:
- Microsoft-365-Kontext mit Word, Excel, PowerPoint, Outlook und Teams.
- Researcher für tiefe Recherche.
- Copilot Cowork als allgemein verfügbarer Modus für länger laufende, mehrstufige Aufgaben.
- Work IQ, Plugins/Connectors und Unternehmensberechtigungen.

- [ ] **Step 5: Perplexity-Seite**

Erklären:
- quellenorientierte Recherche.
- Projects als persistente Arbeitsräume.
- Perplexity Computer für agentische Aufgaben.
- aktuelle Local-/Portable-Computer-Richtung nur als neue Entwicklung kennzeichnen, nicht als überall verfügbare Standardfunktion.

- [ ] **Step 6: Validierung ausführen**

Run: `python scripts/validate_ki_sections.py`
Expected: FAIL nur noch wegen fehlender Suno-Seite.

- [ ] **Step 7: Committen**

Commit message: `feat: add top AI chat detail pages`

### Task 5: Suno als eigenen KI-Musikbereich bauen

**Files:**
- Create: `ki/musik/suno.html`
- Create: `assets/css/ki-music.css`

**Interfaces:**
- Consumes: globale Styles und `ws-layout.js`.
- Produces: eigenständiger Suno-Einstieg mit Platz für spätere eigene Screenshots.

- [ ] **Step 1: Suno-Seite erstellen**

Die Seite enthält:
- Hero `KI-Musik mit Suno`.
- einfacher Workflow `Idee → Text/Stil → Generieren → Anhören → Verfeinern`.
- Abschnitt `Wo eine Chat-KI hilft` für Songidee, Text, Stilbeschreibung und Varianten.
- aktuelle Funktionen: v5.5, Voices, Custom Models, My Taste, Advanced Stem Separation, Studio 2.0, MIDI, Chat Bar (Beta), Automation/Plugins im Studio.
- Hinweis, dass Studio 2.0 laut Suno Premier voraussetzt und andere Funktionen je nach Tarif variieren können.
- vorsichtiger Rechte-/Veröffentlichungshinweis ohne Rechtsberatung.
- interne Links zurück zu `Aktuelle KI-Chats` und späteren Tutorials.

- [ ] **Step 2: `ki-music.css` erstellen**

Styles:
- eigenständige musikalische Akzente, aber weiterhin Warenschmiede-Design.
- keine sichtbaren leeren Screenshot-Platzhalter.
- responsive Workflow-Darstellung.

- [ ] **Step 3: Vollständige Validierung ausführen**

Run: `python scripts/validate_ki_sections.py`
Expected: PASS, 0 Fehler.

- [ ] **Step 4: Committen**

Commit message: `feat: add Suno AI music guide`

### Task 6: Abschlussprüfung und PR

**Files:**
- Verify all changed files; no sitemap change in this branch.

**Interfaces:**
- Consumes: vollständiger Branch.
- Produces: reviewbarer Pull Request gegen `main`.

- [ ] **Step 1: HTML-/Strukturprüfung erneut ausführen**

Run: `python scripts/validate_ki_sections.py`
Expected: PASS.

- [ ] **Step 2: Diff gegen `main` prüfen**

Prüfen:
- nur geplante Dateien geändert.
- `sitemap.xml` unverändert.
- keine Hersteller-Screenshots oder fremden Bildassets hinzugefügt.
- keine festen Preisbeträge in Vergleichstabellen.

- [ ] **Step 3: Pull Request erstellen**

Titel: `KI-Bereich mit aktuellen Chat-KIs und Suno neu strukturieren`

PR-Text nennt ausdrücklich:
- verständlichere Navigation,
- neue Top-5-Chatübersicht,
- fünf Detailseiten,
- Suno als separaten Musikbereich,
- Stand 28.08.2026 und offizielle Quellen,
- Merge-Reihenfolge: PR #457 zuerst, danach dieser PR bzw. Branch bei Bedarf aktualisieren.
