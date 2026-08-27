# KI-Prompts & Screenshot-Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernisiere `ki/prompts.html` vollständig und ergänze eine erweiterbare KI-Tutorial-Struktur mit einem ersten Windows-Screenshot-Tutorial.

**Architecture:** Die globale Warenschmiede-Shell bleibt unverändert und wird weiter über `assets/js/ws-layout.js` geladen. Die Prompt-Seite erhält eine isolierte Stylesheet-Datei; die Tutorial-Seiten erhalten ein eigenes Stylesheet. Neue Seiten nutzen ausschließlich bestehende globale Header-/Footer-Platzhalter und die vorhandenen Asset-Pfade.

**Tech Stack:** Statisches HTML5, CSS, bestehendes Vanilla-JavaScript-Shell-Script `assets/js/ws-layout.js`.

**Spec:** `docs/superpowers/specs/2026-08-27-ki-prompts-and-screenshot-tutorial-design.md`

## Global Constraints

- `ki/prompts.html` behält seine URL.
- Globaler Header, Navigation und Footer werden nicht lokal nachgebaut.
- Kein neuer Hauptmenüpunkt für Tutorials.
- Prompting wird modern eingeordnet: natürliche Sprache reicht oft; präzise Prompts bleiben für genaue/professionelle Aufgaben sinnvoll.
- Datenschutz praktisch erklären, ohne Rechtsberatung zu behaupten.
- Tutorial-Bilder werden aus den bereits hochgeladenen Pfaden verwendet.
- Alle aktuellen Tutorialbilder besitzen `width="1672"` und `height="941"`.

---

### Task 1: Prompt-Seite modernisieren

**Files:**
- Modify: `ki/prompts.html`
- Create: `assets/css/ki-prompts.css`

**Interfaces:**
- Consumes: globale Shell aus `/assets/js/ws-layout.js`, Basisdesign aus `/assets/css/styles.css`, KI-Grunddesign aus `/assets/css/ki-content.css`.
- Produces: Link `ki/tutorials/screenshots-windows.html` mit `target="_blank" rel="noopener"`.

- [ ] **Step 1: Alte Copy-&-Paste-Promptstruktur entfernen**

Ersetze die bisherige Seite vollständig durch semantische Abschnitte: Hero, „Einfach anfangen“, „Kontext“, „Zeigen statt beschreiben“, „Früher/Heute“, „Wann genaue Prompts helfen“, „Sicherheit & Prüfen“.

- [ ] **Step 2: Tutorial-CTA integrieren**

Im Abschnitt „Zeigen statt beschreiben“ wird auf `/ki/tutorials/screenshots-windows.html` verlinkt. Der Link öffnet einen neuen Tab und verwendet `rel="noopener"`.

- [ ] **Step 3: Isolierte Prompt-Styles erstellen**

`assets/css/ki-prompts.css` definiert ausschließlich `.prompt-modern-*`-Klassen: großer zweispaltiger Hero, redaktionelle Inhaltszeilen, Vergleichsflächen, Präzisionsbereich, Warnhinweis, responsive Darstellung. Keine Änderungen an globalen `.card`, `.btn` oder Navigationsklassen.

- [ ] **Step 4: Statische Prüfung**

Prüfe:
- genau ein `<h1>`;
- alle Abschnittsüberschriften mit sinnvollen IDs;
- Tutorial-Link besitzt `_blank` + `noopener`;
- `ws-header`, `ws-footer` und `ws-layout.js` bleiben vorhanden;
- keine lokalen Header-/Footer-Markups.

### Task 2: Tutorial-Sammlung und Windows-Screenshot-Tutorial anlegen

**Files:**
- Create: `ki/tutorials/index.html`
- Create: `ki/tutorials/screenshots-windows.html`
- Create: `assets/css/ki-tutorials.css`

**Interfaces:**
- Consumes: globale Shell, Basisdesign, KI-Grunddesign, vorhandene Bilder unter `/assets/img/tutorials/...`.
- Produces: erweiterbare Tutorial-Übersicht und erstes Tutorial.

- [ ] **Step 1: Tutorial-Übersicht anlegen**

`ki/tutorials/index.html` enthält einen kurzen Hero und genau einen aktiven Tutorial-Eintrag: „Screenshot an eine KI senden – Windows“. Keine leeren Dummy-Karten.

- [ ] **Step 2: Screenshot-Tutorial anlegen**

Die Seite enthält in Reihenfolge:
1. Problem zeigen (`01_programmfehler.png`)
2. Sicherheits-/Datenschutzcheck
3. `Windows + Shift + S` (`05_shift_windows_s_bereich_markieren.png`)
4. Bereich markieren (`02_bereich_markieren.png`)
5. `Strg + V` (`07_strg_v_einfuegen.png`)
6. Bild im Chat (`03_bild_im_ki_chat_einfuegen.png`)
7. kurze Problem-Beschreibung als Textbeispiel
8. mögliche KI-Antwort (`04_ki_antwort_und_loesung.png`)

`06_strg_c_kopieren.png` wird nicht eingebaut.

- [ ] **Step 3: Tutorial-Styles erstellen**

`assets/css/ki-tutorials.css` definiert `.tutorial-*`-Klassen: Hero, Schrittblöcke, große Schrittzahl, Bildrahmen, Tastenkürzel-Hinweise, Sicherheitswarnung und responsive Einspaltigkeit unter ca. 800 px.

- [ ] **Step 4: Barrierearme Bildtexte setzen**

Jedes `<img>` bekommt einen konkreten `alt`-Text, `width="1672" height="941" loading="lazy" decoding="async"`. Das erste sichtbare Beispielbild darf `loading="eager"` nutzen.

- [ ] **Step 5: Statische Prüfung**

Prüfe, dass alle sechs verwendeten Bildpfade exakt den vorhandenen Repository-Dateien entsprechen und dass beide Seiten `ws-layout.js` laden.

### Task 3: Sitemap aktualisieren und Gesamtprüfung

**Files:**
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: neue öffentliche URLs.
- Produces: auffindbare Tutorial-Seiten für Suchmaschinen.

- [ ] **Step 1: Prompt-Lastmod aktualisieren**

Setze `https://www.warenschmiede.com/ki/prompts.html` auf `<lastmod>2026-08-27</lastmod>`.

- [ ] **Step 2: Tutorial-URLs ergänzen**

Füge ein:
- `https://www.warenschmiede.com/ki/tutorials/`
- `https://www.warenschmiede.com/ki/tutorials/screenshots-windows.html`

Beide mit `lastmod 2026-08-27`, `changefreq monthly`, `priority 0.7`.

- [ ] **Step 3: Gesamtprüfung**

Prüfe den Branch-Diff auf:
- ausschließlich geplante Dateien;
- keine Änderungen an `ws-layout.js`;
- keine kaputten relativen/absoluten Asset-Pfade;
- keine sensitiven Beispielwerte im Seitentext;
- keine Aussage, die externe KI am Arbeitsplatz pauschal erlaubt;
- keine Behauptung, dass unpräzise Prompts immer bessere Ergebnisse liefern.

- [ ] **Step 4: Pull Request öffnen**

PR gegen `main` mit Zusammenfassung der neuen Prompt-Seite, Tutorial-Struktur, Datenschutz-Hinweisen und verwendeten Bildern. Nicht automatisch mergen.
