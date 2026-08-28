# KI-Lern-Chat 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den bisherigen WhatsApp-artigen KI-Versteher unter `ki/chat.html` durch einen responsiven, browserbreiten Warenschmiede-Lern-Chat mit sechs interaktiven Praxisgesprächen ersetzen.

**Architecture:** `ki/chat.html` enthält nur die semantische Shell. `assets/js/ki-learning-chat-data.js` liefert reine Inhaltsdaten, `assets/js/ki-learning-chat.js` rendert und steuert die Simulation, `assets/css/ki-learning-chat.css` kapselt Layout und responsive Darstellung. Eine neue statische Python-Prüfung sichert Struktur, Menü, Datenmodell und wichtige Sicherheits-/Responsive-Merkmale ab; reale Browserinteraktionen werden zusätzlich manuell geprüft.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, `sessionStorage`, Python 3 für statische Regressionstests; bestehende Warenschmiede-Navigation über `/assets/js/ws-layout.js`.

**Spec:** `docs/superpowers/specs/2026-08-28-ki-learning-chat-2-design.md`

## Global Constraints

- Der bestehende Pfad `ki/chat.html` bleibt erhalten.
- Keine echte KI/API-Anbindung und keine echten Uploads durch Besucher.
- Die Eingabezeile ist ausschließlich Teil der Simulation und nicht editierbar.
- Keine Konten, Logins, Datenbank oder dauerhafte Fortschrittsspeicherung.
- Fortschritt wird nur in `sessionStorage` für die aktuelle Browsersitzung gespeichert.
- Kein 1:1-Nachbau von ChatGPT; Bedienprinzip vertraut, Gestaltung eindeutig Warenschmiede.
- Desktop nutzt die verfügbare Browserbreite; kleine Displays verwenden eine einklappbare Lern-Chat-Navigation.
- `prefers-reduced-motion` muss berücksichtigt werden.
- Die globale Warenschmiede-Navigation bleibt Eigentümer von Header, Mega-Menü und Footer.
- `ki/lexikon.html` bleibt bestehen, verliert nur die prominente Menüposition unter „Einsteigen“.
- Version 1 enthält genau sechs Lern-Chats: Einstieg, Screenshot, PDF, Sicherheit, Text verbessern, Recherche & Quellen.

---

## File Map

### Neu

- `assets/css/ki-learning-chat.css` — ausschließlich Layout, Zustände und Responsive-Regeln des Lern-Chats.
- `assets/js/ki-learning-chat-data.js` — reine Daten für Gruppen, sechs Lern-Chats und deren Schritte.
- `assets/js/ki-learning-chat.js` — Rendering, Ablaufsteuerung, Animation, Controls, Fortschritt und mobile Sidebar.
- `scripts/validate_ki_learning_chat.py` — statische Regressionstests für neue Struktur und Daten.

### Ändern

- `ki/chat.html` — alte WhatsApp-Simulation vollständig durch neue Shell ersetzen.
- `assets/js/ws-layout.js` — „Einsteigen“ auf `KI kennenlernen` + `Erste Schritte & Tutorials` umstellen; Lexikon aus prominenter Position entfernen.
- `ki/index.html` — nur direkte Altbezeichnungen des alten KI-Verstehers auf `KI kennenlernen` aktualisieren, sofern vorhanden.
- `scripts/validate_ki_sections.py` — bestehende falsche `sticky`-Erwartung auf den aktuellen `fixed`-Rücksprung korrigieren, damit die Gesamtprüfung den bereits eingeführten Navigationsfix nicht fälschlich beanstandet.

---

### Task 1: Regressionstest für den neuen Lern-Chat anlegen

**Files:**
- Create: `scripts/validate_ki_learning_chat.py`

**Interfaces:**
- Consumes: Repository-Dateien als UTF-8-Text.
- Produces: CLI-Validator mit Exit `0` bei Erfolg und Exit `1` bei Verstößen.

- [ ] **Step 1: Schreibe den zunächst fehlschlagenden Strukturtest**

Der Validator liest `ki/chat.html`, `assets/js/ws-layout.js`, die neuen CSS-/JS-Dateien und meldet konkrete Fehler. Die erste Fassung soll bereits alle Zielanforderungen prüfen, obwohl die Ziel-Dateien noch fehlen.

```python
#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    file = ROOT / path
    return file.read_text(encoding="utf-8") if file.exists() else None


def main():
    errors = []
    html = read("ki/chat.html")
    css = read("assets/css/ki-learning-chat.css")
    engine = read("assets/js/ki-learning-chat.js")
    data = read("assets/js/ki-learning-chat-data.js")
    nav = read("assets/js/ws-layout.js")

    if html is None:
        errors.append("ki/chat.html fehlt")
    else:
        for needle in (
            "/assets/css/ki-learning-chat.css",
            "/assets/js/ki-learning-chat-data.js",
            "/assets/js/ki-learning-chat.js",
            'id="learning-chat-sidebar"',
            'id="learning-chat-stream"',
            'id="learning-chat-composer"',
            'id="learning-chat-pause"',
            'id="learning-chat-next"',
            'id="learning-chat-restart"',
            "Interaktive Lernsimulation",
        ):
            if needle not in html:
                errors.append(f"chat.html: fehlt {needle}")
        for legacy in ("chat-container", "persona-overlay", "WhatsApp"):
            if legacy in html:
                errors.append(f"chat.html: Altstruktur noch vorhanden: {legacy}")

    if data is None:
        errors.append("ki-learning-chat-data.js fehlt")
    else:
        for chat_id in (
            "intro",
            "screenshot",
            "pdf",
            "safety",
            "rewrite",
            "research",
        ):
            if f'id: "{chat_id}"' not in data and f"id: '{chat_id}'" not in data:
                errors.append(f"Lern-Chat fehlt: {chat_id}")
        for step_type in ("compose", "attachment", "send", "working", "assistant", "lesson", "link", "checkpoint"):
            if f'type: "{step_type}"' not in data and f"type: '{step_type}'" not in data:
                errors.append(f"Schritttyp fehlt in Daten: {step_type}")

    if engine is None:
        errors.append("ki-learning-chat.js fehlt")
    else:
        for needle in ("sessionStorage", "selectChat", "pausePlayback", "continuePlayback", "restartChat", "toggleSidebar"):
            if needle not in engine:
                errors.append(f"Engine: {needle} fehlt")

    if css is None:
        errors.append("ki-learning-chat.css fehlt")
    else:
        for needle in ("@media", "prefers-reduced-motion", ".learning-chat-layout", ".learning-chat-sidebar"):
            if needle not in css:
                errors.append(f"CSS: {needle} fehlt")

    if nav is None:
        errors.append("ws-layout.js fehlt")
    else:
        if "KI kennenlernen" not in nav:
            errors.append("Navigation: KI kennenlernen fehlt")
        if "Erste Schritte & Tutorials" not in nav:
            errors.append("Navigation: Erste Schritte & Tutorials fehlt")
        einsteigen = re.search(r"label: 'Einsteigen'.*?\]\s*\}", nav, re.S)
        if einsteigen and "KI-Lexikon" in einsteigen.group(0):
            errors.append("Navigation: KI-Lexikon ist noch prominenter Einstiegseintrag")

    if errors:
        print("KI-Lern-Chat-Prüfung: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Lern-Chat-Prüfung: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Test ausführen und roten Zustand bestätigen**

Run:

```bash
python scripts/validate_ki_learning_chat.py
```

Expected: `KI-Lern-Chat-Prüfung: FEHLER`, unter anderem weil `ki-learning-chat.css`, `ki-learning-chat.js` und `ki-learning-chat-data.js` noch fehlen.

- [ ] **Step 3: Test committen**

```bash
git add scripts/validate_ki_learning_chat.py
git commit -m "test: define KI learning chat requirements"
```

---

### Task 2: Datenmodell und sechs Lern-Chats anlegen

**Files:**
- Create: `assets/js/ki-learning-chat-data.js`
- Test: `scripts/validate_ki_learning_chat.py`

**Interfaces:**
- Produces: `window.WSLearningChatData` mit `groups`, `chats` und `defaultChatId`.
- Jeder Chat: `{ id, title, group, description, steps }`.
- Jeder Schritt nutzt einen der Typen `assistant`, `compose`, `attachment`, `send`, `working`, `lesson`, `link`, `checkpoint`.

- [ ] **Step 1: Erweitere den Validator um exakte Datenmodellprüfungen**

Zusätzlich prüfen:

```python
for needle in (
    'defaultChatId: "intro"',
    'group: "pinned"',
    'group: "practice"',
    'kind: "image"',
    'kind: "pdf"',
    "/ki/tutorials/screenshots-windows.html",
    "/ki/faq.html",
):
    if needle not in data:
        errors.append(f"Datenmodell: fehlt {needle}")
```

- [ ] **Step 2: Test ausführen und Fehler wegen fehlender Daten bestätigen**

```bash
python scripts/validate_ki_learning_chat.py
```

Expected: FAIL wegen fehlender Daten-Datei bzw. fehlender Chat-Inhalte.

- [ ] **Step 3: Implementiere `window.WSLearningChatData`**

Grundform:

```javascript
window.WSLearningChatData = {
  defaultChatId: "intro",
  groups: [
    { id: "pinned", label: "Angeheftet" },
    { id: "practice", label: "Praxis" }
  ],
  chats: [
    {
      id: "intro",
      title: "Einstieg – Was kann KI?",
      group: "pinned",
      description: "Ein kurzer Rundgang durch moderne KI.",
      steps: [
        { type: "assistant", text: "Hallo 👋 Wenn KI für dich noch neu ist, reicht für den Anfang etwas ganz Einfaches: Du kannst ganz normal mit ihr sprechen." },
        { type: "assistant", text: "Moderne KI kann dir Texte erklären, Bilder ansehen, Dateien zusammenfassen, Ideen entwickeln und bei vielen Aufgaben Schritt für Schritt mitarbeiten." },
        { type: "checkpoint", label: "Zeig mir ein Beispiel" },
        { type: "compose", text: "Ich habe noch nie mit KI gearbeitet. Was wäre eine gute erste Aufgabe?" },
        { type: "send" },
        { type: "working", text: "KI arbeitet …" },
        { type: "assistant", text: "Nimm etwas Echtes aus deinem Alltag: einen Text, den du besser formulieren willst, eine Frage, die du verstehen möchtest, oder einen Screenshot mit einer Fehlermeldung." },
        { type: "lesson", title: "Das hast du gerade gelernt", text: "Du brauchst keinen perfekten Zauberspruch. Starte natürlich und arbeite im Gespräch weiter." }
      ]
    },
    {
      id: "screenshot",
      title: "Einen Screenshot zeigen",
      group: "pinned",
      description: "Fehlermeldungen direkt als Bild erklären lassen.",
      steps: [
        { type: "compose", text: "Beim Speichern kommt diese Fehlermeldung. Was bedeutet sie und was kann ich prüfen?" },
        { type: "attachment", kind: "image", name: "fehlermeldung-beispiel.png", meta: "Screenshot" },
        { type: "send" },
        { type: "working", text: "Bild wird betrachtet …" },
        { type: "assistant", text: "Auf dem Screenshot ist eine Fehlermeldung beim Speichern zu sehen. Ich würde zuerst prüfen, ob der Zielordner erreichbar ist und ob du dort Schreibrechte hast." },
        { type: "lesson", title: "Wichtig vor dem Senden", text: "Zeige nur den relevanten Bereich und prüfe, ob Namen, E-Mail-Adressen, Kundendaten oder andere vertrauliche Informationen sichtbar sind." },
        { type: "link", label: "Screenshot unter Windows erstellen", href: "/ki/tutorials/screenshots-windows.html" }
      ]
    },
    {
      id: "pdf",
      title: "Eine PDF verstehen",
      group: "pinned",
      description: "Dokumente zusammenfassen und danach weiterfragen.",
      steps: [
        { type: "attachment", kind: "pdf", name: "beispiel-dokument.pdf", meta: "6 Seiten" },
        { type: "compose", text: "Fass mir diese PDF bitte verständlich zusammen und sag mir, was besonders wichtig ist." },
        { type: "send" },
        { type: "working", text: "Dokument wird gelesen …" },
        { type: "assistant", text: "Kurz zusammengefasst: Das Dokument beschreibt drei Hauptpunkte. Erstens die Laufzeit, zweitens wichtige Fristen und drittens die Bedingungen für Änderungen." },
        { type: "compose", text: "Erklär mir Punkt 3 nochmal einfacher." },
        { type: "send" },
        { type: "assistant", text: "Klar: Änderungen sind möglich, aber nur unter den im Dokument genannten Voraussetzungen. Genau diese Stelle solltest du im Original noch einmal prüfen." },
        { type: "lesson", title: "Dateien sind Gesprächskontext", text: "Nach der ersten Zusammenfassung kannst du gezielt zu einzelnen Stellen weiterfragen." }
      ]
    },
    {
      id: "safety",
      title: "Sicher mit KI arbeiten",
      group: "pinned",
      description: "Was nicht ungeprüft in einen KI-Chat gehört.",
      steps: [
        { type: "compose", text: "Mein Passwort ist …" },
        { type: "checkpoint", label: "Stopp – das lieber nicht senden", tone: "warning" },
        { type: "assistant", text: "Passwörter, PINs, TANs, Wiederherstellungscodes oder API-Schlüssel gehören nicht in einen KI-Chat." },
        { type: "assistant", text: "Auch bei personenbezogenen Daten, Kundendaten und vertraulichen Firmendokumenten solltest du vorher prüfen, ob du sie überhaupt verwenden darfst." },
        { type: "lesson", title: "Besser mit Platzhaltern", text: "Schreibe zum Beispiel [KUNDENNAME] oder [PASSWORT] statt echter vertraulicher Werte." },
        { type: "link", label: "KI-FAQ & Sicherheit öffnen", href: "/ki/faq.html" }
      ]
    },
    {
      id: "rewrite",
      title: "Einen Text gemeinsam verbessern",
      group: "practice",
      description: "Im Gespräch Schritt für Schritt zum passenden Ton.",
      steps: [
        { type: "compose", text: "Kannst du das freundlicher schreiben? Ich schaffe den Termin heute nicht und melde mich morgen." },
        { type: "send" },
        { type: "assistant", text: "Natürlich: Ich schaffe den Termin heute leider nicht. Ich melde mich morgen nochmal bei dir. Danke für dein Verständnis!" },
        { type: "compose", text: "Etwas lockerer bitte." },
        { type: "send" },
        { type: "assistant", text: "Klar: Heute klappt es bei mir leider nicht mehr. Ich melde mich morgen nochmal 🙂" },
        { type: "compose", text: "Jetzt noch kürzer." },
        { type: "send" },
        { type: "assistant", text: "Heute klappt’s leider nicht. Ich melde mich morgen 🙂" },
        { type: "lesson", title: "Gespräch statt Einmal-Prompt", text: "Du kannst Ton, Länge und Inhalt nach jeder Antwort weiter anpassen." }
      ]
    },
    {
      id: "research",
      title: "Recherchieren & Quellen",
      group: "practice",
      description: "Aktuelle Informationen bewusst prüfen lassen.",
      steps: [
        { type: "compose", text: "Welche wichtigen Änderungen gab es dieses Jahr bei einem Thema, das mich interessiert?" },
        { type: "send" },
        { type: "assistant", text: "Bei aktuellen Themen ist wichtig, dass die verwendete KI tatsächlich recherchieren kann und nicht nur aus älterem Modellwissen antwortet." },
        { type: "compose", text: "Bitte prüfe das aktuell und nenne mir Quellen." },
        { type: "send" },
        { type: "working", text: "Aktuelle Quellen werden geprüft …" },
        { type: "assistant", text: "So ist die Aufgabe besser gestellt: aktuelle Recherche, nachvollziehbare Quellen und anschließend ein eigener Plausibilitätscheck bei wichtigen Aussagen." },
        { type: "lesson", title: "Quellen helfen beim Prüfen", text: "Auch mit Quellen bleibt dein eigener Blick wichtig – besonders bei schnell veränderlichen oder wichtigen Themen." }
      ]
    }
  ]
};
```

- [ ] **Step 4: Validator erneut ausführen**

Expected: Datenmodell-Prüfungen sind grün; andere Anforderungen dürfen noch fehlschlagen.

- [ ] **Step 5: Commit**

```bash
git add assets/js/ki-learning-chat-data.js scripts/validate_ki_learning_chat.py
git commit -m "feat: add KI learning chat scenarios"
```

---

### Task 3: Neue HTML-Shell und globale Navigation bauen

**Files:**
- Modify: `ki/chat.html`
- Modify: `assets/js/ws-layout.js`
- Modify: `ki/index.html`
- Test: `scripts/validate_ki_learning_chat.py`

**Interfaces:**
- `ki/chat.html` stellt alle DOM-Ziele bereit, die `ki-learning-chat.js` per ID verwendet.
- `ws-layout.js` verweist unter „Einsteigen“ auf `/ki/chat.html` und `/ki/tutorials/`.

- [ ] **Step 1: Ergänze Validatorprüfungen für Shell und Menü**

Prüfe zusätzlich:

```python
for needle in (
    'aria-label="Lern-Chats"',
    'id="learning-chat-sidebar-toggle"',
    'id="learning-chat-title"',
    'id="learning-chat-status"',
    'aria-live="polite"',
    'readonly',
):
    if needle not in html:
        errors.append(f"chat.html: fehlt {needle}")
```

und im Navigationsteil exakt:

```python
if "label: 'KI kennenlernen', href: 'ki/chat.html'" not in nav:
    errors.append("Navigation: KI kennenlernen zeigt nicht auf ki/chat.html")
if "label: 'Erste Schritte & Tutorials', href: 'ki/tutorials/'" not in nav:
    errors.append("Navigation: Tutorials-Einstieg fehlt")
```

- [ ] **Step 2: Test ausführen und roten Zustand bestätigen**

```bash
python scripts/validate_ki_learning_chat.py
```

Expected: FAIL wegen alter Chat-Shell und alter Menülabels.

- [ ] **Step 3: Ersetze `ki/chat.html` vollständig durch die neue Shell**

Die Seite verwendet weiter `styles.css`, `ki-content.css` und `ws-layout.js`, ergänzt aber die neuen Lern-Chat-Assets.

Kernstruktur:

```html
<body class="ki-page theme-light learning-chat-page">
  <div id="ws-header"></div>
  <nav aria-label="Brotkrumen" class="breadcrumbs">...</nav>

  <main class="learning-chat-main" id="main-content">
    <section class="learning-chat-intro" aria-labelledby="learning-chat-page-title">
      <div>
        <p class="section-eyebrow">KI kennenlernen</p>
        <h1 id="learning-chat-page-title">KI kennenlernen – direkt im Gespräch</h1>
        <p>Schau dir kurze Praxisgespräche an und lerne dabei, wie moderne KI im Alltag benutzt wird.</p>
      </div>
      <p class="learning-chat-simulation-note">Interaktive Lernsimulation · Es werden keine echten Daten übertragen.</p>
    </section>

    <section class="learning-chat-layout" aria-label="Interaktiver KI-Lern-Chat">
      <aside class="learning-chat-sidebar" id="learning-chat-sidebar" aria-label="Lern-Chats">
        <div class="learning-chat-sidebar__head">
          <strong>Lern-Chats</strong>
          <button type="button" id="learning-chat-sidebar-close" aria-label="Lern-Chats schließen">×</button>
        </div>
        <nav id="learning-chat-nav" aria-label="Lern-Chats"></nav>
      </aside>

      <div class="learning-chat-panel">
        <header class="learning-chat-panel__head">
          <button type="button" id="learning-chat-sidebar-toggle" aria-controls="learning-chat-sidebar" aria-expanded="false">☰ Lern-Chats</button>
          <div>
            <h2 id="learning-chat-title">KI kennenlernen</h2>
            <p id="learning-chat-description"></p>
          </div>
          <span class="learning-chat-status" id="learning-chat-status" aria-live="polite">Bereit</span>
        </header>

        <div class="learning-chat-stream" id="learning-chat-stream" aria-live="polite" aria-relevant="additions"></div>

        <div class="learning-chat-controls" aria-label="Simulation steuern">
          <button type="button" id="learning-chat-pause">⏸ Pause</button>
          <button type="button" id="learning-chat-next">▶ Weiter</button>
          <button type="button" id="learning-chat-restart">↻ Neu starten</button>
        </div>

        <div class="learning-chat-composer-wrap">
          <div id="learning-chat-attachment-slot"></div>
          <div class="learning-chat-composer-row">
            <span aria-hidden="true" class="learning-chat-plus">＋</span>
            <textarea id="learning-chat-composer" rows="1" readonly aria-label="Simulierte Eingabe" placeholder="Hier erscheint die Beispiel-Eingabe …"></textarea>
            <span aria-hidden="true" class="learning-chat-send">↑</span>
          </div>
          <p class="learning-chat-composer-note">Nur Demo – hier kann nichts wirklich gesendet oder hochgeladen werden.</p>
        </div>
      </div>
    </section>
  </main>

  <div id="ws-footer"></div>
  <script defer src="/assets/js/ki-learning-chat-data.js"></script>
  <script defer src="/assets/js/ki-learning-chat.js"></script>
  <script defer src="/assets/js/ws-layout.js"></script>
</body>
```

- [ ] **Step 4: Aktualisiere `ws-layout.js` nur im Abschnitt „Einsteigen“**

Ziel:

```javascript
{ label: 'Einsteigen', accent: 'violet', links: [
  { label: 'KI kennenlernen', href: 'ki/chat.html', description: 'Ein interaktiver Lern-Chat zeigt dir KI in der Praxis.' },
  { label: 'Erste Schritte & Tutorials', href: 'ki/tutorials/', description: 'Screenshots, Dateien und praktische Grundlagen Schritt für Schritt.' }
] },
```

- [ ] **Step 5: Aktualisiere direkte Altbezeichnung in `ki/index.html`**

Nur dort, wo aktuell direkt zum alten `/ki/chat.html` als „KI-Versteher“ verlinkt wird, Text auf `KI kennenlernen` ändern. Keine weitere Modernisierung der alten Startseite in diesem Task.

- [ ] **Step 6: Test erneut ausführen**

Expected: Shell-/Menüprüfungen grün; CSS/Engine dürfen noch fehlschlagen.

- [ ] **Step 7: Commit**

```bash
git add ki/chat.html assets/js/ws-layout.js ki/index.html scripts/validate_ki_learning_chat.py
git commit -m "feat: add KI learning chat shell"
```

---

### Task 4: Responsives Lern-Chat-Layout bauen

**Files:**
- Create: `assets/css/ki-learning-chat.css`
- Test: `scripts/validate_ki_learning_chat.py`

**Interfaces:**
- Styles greifen ausschließlich über `.learning-chat-*` und `.learning-chat-page` an.
- Mobile Sidebar wird durch `.is-open` gesteuert.

- [ ] **Step 1: Ergänze CSS-Regressionsprüfungen**

Prüfe mindestens:

```python
for needle in (
    "grid-template-columns",
    "minmax(0, 1fr)",
    ".learning-chat-sidebar.is-open",
    "@media (max-width: 860px)",
    "@media (prefers-reduced-motion: reduce)",
    "overflow-x: hidden",
):
    if needle not in css:
        errors.append(f"CSS: fehlt {needle}")
```

- [ ] **Step 2: Test ausführen und roten CSS-Zustand bestätigen**

```bash
python scripts/validate_ki_learning_chat.py
```

Expected: FAIL wegen fehlender CSS-Datei.

- [ ] **Step 3: Implementiere Desktop-Layout**

Kernregeln:

```css
.learning-chat-page {
  overflow-x: hidden;
}

.learning-chat-main {
  width: 100%;
  padding: 18px clamp(14px, 2vw, 28px) 32px;
}

.learning-chat-intro {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin: 0 auto 16px;
}

.learning-chat-layout {
  display: grid;
  grid-template-columns: minmax(230px, 290px) minmax(0, 1fr);
  min-height: calc(100vh - 210px);
  border: 1px solid rgba(15, 23, 42, .12);
  background: #fff;
  box-shadow: 0 18px 50px rgba(31, 58, 85, .10);
}

.learning-chat-sidebar {
  min-width: 0;
  border-right: 1px solid rgba(15, 23, 42, .10);
  background: #f7f9fc;
  overflow-y: auto;
}

.learning-chat-panel {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  background: #fff;
}

.learning-chat-stream {
  min-height: 360px;
  overflow-y: auto;
  padding: clamp(18px, 3vw, 40px);
}
```

Die Nachrichtenbreite bleibt lesbar, aber der Chatbereich selbst darf breit werden:

```css
.learning-chat-message {
  width: min(900px, 100%);
  margin-inline: auto;
}

.learning-chat-message--user {
  display: flex;
  justify-content: flex-end;
}

.learning-chat-bubble--user {
  max-width: min(720px, 88%);
}
```

- [ ] **Step 4: Implementiere Sidebar-/Button-/Attachment-/Lesson-Zustände**

Benötigte Klassen:

```css
.learning-chat-nav-group {}
.learning-chat-nav-item {}
.learning-chat-nav-item.is-active {}
.learning-chat-nav-item.is-complete {}
.learning-chat-attachment {}
.learning-chat-attachment--pdf {}
.learning-chat-attachment--image {}
.learning-chat-working {}
.learning-chat-lesson {}
.learning-chat-checkpoint {}
.learning-chat-checkpoint--warning {}
```

- [ ] **Step 5: Implementiere responsive Sidebar**

```css
#learning-chat-sidebar-toggle,
#learning-chat-sidebar-close {
  display: none;
}

@media (max-width: 860px) {
  .learning-chat-layout {
    grid-template-columns: minmax(0, 1fr);
    position: relative;
  }

  #learning-chat-sidebar-toggle,
  #learning-chat-sidebar-close {
    display: inline-flex;
  }

  .learning-chat-sidebar {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(330px, calc(100vw - 38px));
    z-index: 20;
    transform: translateX(-105%);
    transition: transform .2s ease;
    box-shadow: 18px 0 40px rgba(15, 23, 42, .18);
  }

  .learning-chat-sidebar.is-open {
    transform: translateX(0);
  }

  .learning-chat-intro {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 6: Reduced-Motion-Regel ergänzen**

```css
@media (prefers-reduced-motion: reduce) {
  .learning-chat-page *,
  .learning-chat-page *::before,
  .learning-chat-page *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 7: Validator ausführen**

Expected: CSS-Prüfungen grün; Engine-Prüfungen dürfen noch fehlschlagen.

- [ ] **Step 8: Commit**

```bash
git add assets/css/ki-learning-chat.css scripts/validate_ki_learning_chat.py
git commit -m "feat: style responsive KI learning chat"
```

---

### Task 5: Chat-Motor, Playback und Rendering implementieren

**Files:**
- Create: `assets/js/ki-learning-chat.js`
- Test: `scripts/validate_ki_learning_chat.py`

**Interfaces:**
- Consumes: `window.WSLearningChatData`.
- Exposed module-level functions used by event handlers: `selectChat(id)`, `pausePlayback()`, `continuePlayback()`, `restartChat()`, `toggleSidebar(force)`.
- State: `activeChatId`, `stepIndex`, `paused`, `waitingForContinue`, `runToken`, `draftText`, `draftAttachment`.

- [ ] **Step 1: Ergänze Engine-Regressionsprüfungen**

Validator soll zusätzlich verlangen:

```python
for needle in (
    "const STORAGE_KEY = \"wsKiLearningChatCompleted\"",
    "window.WSLearningChatData",
    "requestAnimationFrame",
    "matchMedia(\"(prefers-reduced-motion: reduce)\")",
    "scrollToLatest",
    "renderAttachment",
    "renderLesson",
    "markChatComplete",
):
    if needle not in engine:
        errors.append(f"Engine: fehlt {needle}")
```

- [ ] **Step 2: Test ausführen und roten Engine-Zustand bestätigen**

```bash
python scripts/validate_ki_learning_chat.py
```

Expected: FAIL wegen fehlender Engine.

- [ ] **Step 3: Implementiere Initialisierung und Zustandsmodell**

```javascript
(() => {
  "use strict";

  const STORAGE_KEY = "wsKiLearningChatCompleted";
  const model = window.WSLearningChatData;
  if (!model || !Array.isArray(model.chats)) return;

  const state = {
    activeChatId: model.defaultChatId,
    stepIndex: 0,
    paused: false,
    waitingForContinue: false,
    runToken: 0,
    draftText: "",
    draftAttachment: null
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // DOM-Referenzen einmalig cachen.
})();
```

- [ ] **Step 4: Implementiere Sidebar aus den Daten**

`renderNavigation()` iteriert `model.groups`, filtert Chats pro Gruppe und erzeugt echte `<button type="button">`-Elemente. Aktiver Chat erhält `is-active` und `aria-current="true"`; abgeschlossene Chats `is-complete` plus sichtbares `✓`.

Event:

```javascript
button.addEventListener("click", () => selectChat(chat.id));
```

- [ ] **Step 5: Implementiere sichere DOM-Renderer ohne HTML aus Inhaltsdaten**

Für Text ausschließlich `textContent` verwenden.

```javascript
function createMessage(role, text) {
  const row = document.createElement("article");
  row.className = `learning-chat-message learning-chat-message--${role}`;
  const bubble = document.createElement("div");
  bubble.className = `learning-chat-bubble learning-chat-bubble--${role}`;
  bubble.textContent = text;
  row.append(bubble);
  return row;
}
```

Analog: `renderAttachment(step)`, `renderLesson(step)`, `renderLink(step)`, `renderCheckpoint(step)`.

`renderLink` erzeugt den Link per DOM-API:

```javascript
const a = document.createElement("a");
a.className = "learning-chat-link";
a.href = step.href;
a.textContent = step.label;
```

- [ ] **Step 6: Implementiere Composer und Senden**

`compose` tippt kurze Texte in das `readonly`-Textarea. Bei Reduced Motion wird der ganze Text sofort gesetzt.

```javascript
async function typeComposer(text, token) {
  state.draftText = "";
  composer.value = "";
  if (reduceMotion.matches) {
    composer.value = text;
    state.draftText = text;
    return;
  }
  for (const char of text) {
    if (token !== state.runToken) return;
    await wait(18);
    state.draftText += char;
    composer.value = state.draftText;
  }
}
```

`attachment` setzt `state.draftAttachment` und rendert die Karte im Attachment-Slot. `send` erstellt daraus eine Nutzer-Nachricht im Stream, räumt Composer und Slot leer und scrollt nach unten.

- [ ] **Step 7: Implementiere Playback-Loop**

```javascript
async function playFromCurrentStep() {
  const chat = getActiveChat();
  const token = ++state.runToken;

  while (state.stepIndex < chat.steps.length && token === state.runToken) {
    if (state.paused || state.waitingForContinue) return;
    const step = chat.steps[state.stepIndex];
    await runStep(step, token);
    if (token !== state.runToken) return;
    state.stepIndex += 1;
  }

  if (state.stepIndex >= chat.steps.length) {
    markChatComplete(chat.id);
    status.textContent = "Lern-Chat abgeschlossen ✓";
  }
}
```

`runStep` schaltet über `step.type` und ruft genau die spezialisierten Renderer/Funktionen auf. Unbekannte Typen werden übersprungen und mit `console.warn` protokolliert, statt den Ablauf komplett abzubrechen.

- [ ] **Step 8: Implementiere Pause, Weiter, Neustart und Chatwechsel**

```javascript
function pausePlayback() {
  state.paused = true;
  state.runToken += 1;
  status.textContent = "Pausiert";
}

function continuePlayback() {
  state.paused = false;
  state.waitingForContinue = false;
  status.textContent = "Läuft";
  playFromCurrentStep();
}

function restartChat() {
  state.runToken += 1;
  state.stepIndex = 0;
  state.paused = false;
  state.waitingForContinue = false;
  state.draftText = "";
  state.draftAttachment = null;
  stream.replaceChildren();
  composer.value = "";
  attachmentSlot.replaceChildren();
  playFromCurrentStep();
}

function selectChat(id) {
  if (!model.chats.some(chat => chat.id === id)) return;
  state.activeChatId = id;
  updateHeader();
  renderNavigation();
  restartChat();
  toggleSidebar(false);
}
```

`checkpoint` setzt `waitingForContinue = true`, rendert seinen Hinweis und beendet den Loop. `Weiter` setzt danach fort.

- [ ] **Step 9: Implementiere Fortschritt mit `sessionStorage` defensiv**

```javascript
function getCompletedChats() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markChatComplete(id) {
  const completed = getCompletedChats();
  completed.add(id);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // Die Lernsimulation funktioniert auch ohne verfügbaren Storage.
  }
  renderNavigation();
}
```

- [ ] **Step 10: Implementiere Sidebar-Toggle und Event Wiring**

```javascript
function toggleSidebar(force) {
  const open = typeof force === "boolean"
    ? force
    : !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
}

pauseButton.addEventListener("click", pausePlayback);
nextButton.addEventListener("click", continuePlayback);
restartButton.addEventListener("click", restartChat);
sidebarToggle.addEventListener("click", () => toggleSidebar());
sidebarClose.addEventListener("click", () => toggleSidebar(false));
```

Initialisierung endet mit:

```javascript
renderNavigation();
updateHeader();
selectChat(model.defaultChatId);
```

- [ ] **Step 11: Validator ausführen**

```bash
python scripts/validate_ki_learning_chat.py
```

Expected: `KI-Lern-Chat-Prüfung: OK`.

- [ ] **Step 12: Commit**

```bash
git add assets/js/ki-learning-chat.js scripts/validate_ki_learning_chat.py
git commit -m "feat: implement KI learning chat playback"
```

---

### Task 6: Bestehenden KI-Gesamtvalidator auf aktuellen Rücksprungstand bringen

**Files:**
- Modify: `scripts/validate_ki_sections.py`
- Test: `scripts/validate_ki_sections.py`

**Interfaces:**
- Keine Produktionslogik; nur bestehende Regressionserwartung korrigieren.

- [ ] **Step 1: Bestehenden Fehler reproduzieren**

Run:

```bash
python scripts/validate_ki_sections.py
```

Wenn der aktuelle CSS-Stand bereits `position: fixed` nutzt, ist ein Fehler wie `Zurück-Button ist nicht sticky` zu erwarten. Dieser Fehler ist veraltet und widerspricht dem bereits eingeführten Fix.

- [ ] **Step 2: Ersetze nur die veraltete Sticky-Prüfung**

Vorher:

```python
elif "position: sticky" not in ki_css:
    errors.append("ki-content.css: Zurück-Button ist nicht sticky")
```

Nachher:

```python
elif "position: fixed" not in ki_css:
    errors.append("ki-content.css: Zurück-Button ist nicht fixed")
```

- [ ] **Step 3: Gesamtvalidator erneut ausführen**

```bash
python scripts/validate_ki_sections.py
```

Expected: kein Fehler mehr aufgrund der alten Sticky-Erwartung.

- [ ] **Step 4: Commit**

```bash
git add scripts/validate_ki_sections.py
git commit -m "test: align KI navigation validator with fixed back button"
```

---

### Task 7: Gesamtabnahme und Browser-Check vorbereiten

**Files:**
- Modify only if verification reveals a defect in files already touched by Tasks 1–6.

**Interfaces:**
- Liefert einen verifizierten Branch, der als PR gegen `main` geöffnet werden kann.

- [ ] **Step 1: Alle relevanten statischen Prüfungen ausführen**

```bash
python scripts/validate_ki_learning_chat.py
python scripts/validate_ki_sections.py
python scripts/validate_ki_back_button.py
```

Expected: alle Exit `0`.

- [ ] **Step 2: Diff gegen `main` prüfen**

```bash
git diff --check main...HEAD
git diff --stat main...HEAD
```

Erwarteter Scope:

```text
ki/chat.html
ki/index.html
assets/js/ws-layout.js
assets/css/ki-learning-chat.css
assets/js/ki-learning-chat-data.js
assets/js/ki-learning-chat.js
scripts/validate_ki_learning_chat.py
scripts/validate_ki_sections.py
```

plus Spec/Plan-Dokumente, sofern sie im selben PR mitgeführt werden.

- [ ] **Step 3: Manueller Desktop-Browsertest**

Prüfen:

1. Seite lädt mit Warenschmiede-Header und ohne alte WhatsApp-Optik.
2. „Einstieg – Was kann KI?“ startet automatisch.
3. Links sind alle sechs Chats sichtbar, gruppiert in „Angeheftet“ und „Praxis“.
4. `Pause` hält den Ablauf an.
5. `Weiter` setzt einen pausierten oder am Checkpoint wartenden Ablauf fort.
6. `Neu starten` leert den Chat und startet das aktive Thema von vorn.
7. Screenshot-Thema zeigt eine Bildkarte und den Tutorial-Link.
8. PDF-Thema zeigt eine PDF-Karte und eine echte Folgefrage im selben Chat.
9. Sicherheitsthema stoppt vor der sensiblen Eingabe und sendet das Beispielpasswort nicht als Nutzer-Bubble ab.
10. Nach vollständigem Ablauf erscheint links `✓`.

- [ ] **Step 4: Responsive Browsertest**

Browserbreite langsam von Desktop bis schmal ziehen:

1. Keine horizontale Scrollleiste.
2. Chatbereich schrumpft fließend.
3. Unter 860px verschwindet die permanente Sidebar.
4. `☰ Lern-Chats` öffnet die Sidebar als Overlay.
5. Auswahl eines Chats schließt die mobile Sidebar wieder.
6. Composer und Controls bleiben sichtbar und überdecken keine Nachrichten.

- [ ] **Step 5: Reduced-Motion-Check**

Mit aktivierter Betriebssystem-/Browser-Einstellung „Bewegungen reduzieren“ Seite neu laden. Erwartung: Eingaben erscheinen ohne langsames Buchstaben-Tippen; Übergänge sind praktisch sofort.

- [ ] **Step 6: Tastatur-Check**

Mit `Tab` durch Seite navigieren. Erwartung:

- Lern-Chat-Themen erreichbar
- Pause/Weiter/Neustart erreichbar
- mobiler Sidebar-Schalter erreichbar
- Links in Lernhinweisen erreichbar
- sichtbarer Fokuszustand

- [ ] **Step 7: Finalen Verifikationscommit nur bei nötigen Korrekturen erstellen**

Falls während der Abnahme ein echter Defekt gefunden und behoben wurde:

```bash
git add <betroffene-dateien>
git commit -m "fix: polish KI learning chat verification issues"
```

Wenn kein Defekt gefunden wurde, keinen künstlichen Leer-Commit erzeugen.

- [ ] **Step 8: PR gegen `main` öffnen**

PR-Titel:

```text
KI-Einstieg als interaktiven Lern-Chat neu bauen
```

PR-Beschreibung soll mindestens enthalten:

- alter WhatsApp-KI-Versteher vollständig ersetzt
- sechs Lern-Chats
- responsive Sidebar
- simulierte Screenshot-/PDF-Anhänge
- Pause/Weiter/Neustart
- Sitzungsfortschritt via `sessionStorage`
- keine echte KI/API/Uploads
- Menü „Einsteigen“ aktualisiert
- ausgeführte Validatoren und manueller Browsercheck
