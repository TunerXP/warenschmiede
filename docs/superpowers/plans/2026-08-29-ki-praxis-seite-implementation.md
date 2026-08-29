# KI-Praxis-Seite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die veraltete Seite `so-arbeitest-du-mit-ki.html` wird zu einem aktuellen, neutralen Einstieg für die praktische und verantwortungsvolle Arbeit mit KI.

**Architecture:** Die bestehende URL, das globale Header/Footer-System und `ki-content.css` bleiben erhalten. Die Seite wird in semantische Abschnitte umgebaut: ein fünfstufiger Ablauf, vier alltagstaugliche Anwendungsfelder, eine ehrliche Einordnung KI-gestützter Softwarearbeit sowie klare Weiterleitungen zur Sicherheits- und Betriebsseite. Ein eigener Python-Validator sichert die inhaltlichen Mindestbausteine dauerhaft ab.

**Tech Stack:** Statisches HTML5, bestehendes CSS (`assets/css/ki-content.css`), Python 3 für Inhaltsvalidatoren, Node.js eingebauter Test Runner für die bestehende Navigation.

**Spec:** `docs/superpowers/specs/2026-08-29-ki-wissensbereich-design.md`

## Global Constraints

- URL, Canonical, Brotkrumen, `#ws-header`, `#ws-footer` und `ws-layout.js` bleiben erhalten.
- Sprache bleibt einfach, neutral und werbefrei; keine realen Betriebe oder Personen nennen.
- Keine Rechts-, Datenschutz-, Medizin- oder Finanzberatung und keine Compliance-Zusage formulieren.
- Alte Suno- und C#-Schritt-für-Schritt-Tutorials entfernen; keine produkt- oder anbietergebundene Anleitung einführen.
- „Fachlich geprüft: August 2026“ sichtbar auf der Seite zeigen.
- Die Links `/ki/faq.html` und `/ki/im-betrieb.html` sind Bestandteil des neuen Leserwegs.
- Kein Editor/Generator für die A4-Betriebsregeln in diesem PR.

---

## File Structure

| Datei | Verantwortung |
| --- | --- |
| `ki/so-arbeitest-du-mit-ki.html` | Vollständiger, semantischer Seiteninhalt und Metadaten der Praxis-Seite |
| `assets/css/ki-content.css` | Wiederverwendbare, responsive Darstellung für Ablaufkarten und Anwendungsfelder |
| `scripts/validate_ki_praxis.py` | Unabhängige Prüfung der Kernstruktur, Leserweg-Links, Standangabe und Ausschlüsse |

## Task 1: Inhaltsvertrag als fehlgeschlagenen Validator festlegen

**Files:**
- Create: `scripts/validate_ki_praxis.py`
- Test: `scripts/validate_ki_praxis.py`

**Interfaces:**
- Consumes: Repository-Wurzel über `Path(__file__).resolve().parents[1]`; bestehende Datei `ki/so-arbeitest-du-mit-ki.html`.
- Produces: Exit-Code `0` nur bei vollständiger Praxis-Seite; bei Fehlern eine Liste mit deutschsprachigen Fehlermeldungen.

- [ ] **Step 1: Validator mit den neuen Mindestanforderungen schreiben**

```python
#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki" / "so-arbeitest-du-mit-ki.html"

REQUIRED = (
    'rel="canonical" href="https://www.warenschmiede.com/ki/so-arbeitest-du-mit-ki.html"',
    'id="ws-header"',
    'id="ws-footer"',
    '/assets/js/ws-layout.js',
    'id="ki-praxis-ablauf"',
    'id="ki-praxis-anwendungen"',
    'id="ki-praxis-software"',
    'Fachlich geprüft: August 2026',
    'href="/ki/faq.html"',
    'href="/ki/im-betrieb.html"',
)

FORBIDDEN = (
    'Dein erster KI-Song mit Suno',
    'Deine erste kleine C#-App',
    'Visual Studio 2022 Community',
)

def main():
    html = PAGE.read_text(encoding="utf-8")
    errors = [f"Pflichtinhalt fehlt: {item}" for item in REQUIRED if item not in html]
    errors.extend(f"Veralteter Inhalt gefunden: {item}" for item in FORBIDDEN if item in html)
    if html.count("<h1") != 1:
        errors.append("Seite braucht genau eine H1")
    if errors:
        print("KI Praxis: FEHLER")
        print("\\n".join(f"- {error}" for error in errors))
        return 1
    print("KI Praxis: OK")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Den Fehlerzustand bestätigen**

Run: `python scripts/validate_ki_praxis.py`

Expected: FAIL. Die aktuelle Altseite enthält weder die neuen Abschnitts-IDs noch die Standangabe oder den Link zu `KI im Betrieb`; die alten Suno/C#-Inhalte werden erkannt.

- [ ] **Step 3: Commit des roten Inhaltsvertrags**

```bash
git add scripts/validate_ki_praxis.py
git commit -m "test: define KI practice page content contract"
```

## Task 2: Moderne Praxis-Seite in semantischen Abschnitten umsetzen

**Files:**
- Modify: `ki/so-arbeitest-du-mit-ki.html`
- Test: `scripts/validate_ki_praxis.py`

**Interfaces:**
- Consumes: Die festen IDs und Link-Anforderungen aus `scripts/validate_ki_praxis.py`.
- Produces: Eine Seite mit `#ki-praxis-ablauf`, `#ki-praxis-anwendungen` und `#ki-praxis-software`.

- [ ] **Step 1: Metadaten und Hero austauschen**

Ersetze Titel, Description, OpenGraph- und Twitter-Beschreibungen durch den neutralen Fokus „Mit KI arbeiten – klar fragen, sinnvoll prüfen“. Behalte Canonical, Favicons, Stylesheets, Header, Brotkrumen und Footer unverändert. Verwende genau eine H1:

```html
<p class="section-eyebrow">Praxis für Einsteiger</p>
<h1 id="ki-praxis-heading">Mit KI arbeiten – klar fragen, sinnvoll prüfen</h1>
<p class="ki-hero__lede">KI kann beim Denken, Entwerfen und Überarbeiten helfen. Du gibst Ziel und Grenzen vor, prüfst das Ergebnis und entscheidest selbst, was du damit machst.</p>
```

- [ ] **Step 2: Fünf-Schritte-Ablauf erstellen**

Baue einen Abschnitt `id="ki-praxis-ablauf"` mit fünf nummerierten Karten oder Listenelementen in dieser Reihenfolge:

1. Ziel klar machen
2. Kontext und Grenzen mitgeben
3. Gewünschtes Ergebnis beschreiben
4. Nachfragen und verbessern
5. Ergebnis prüfen

Jeder Schritt bekommt eine kurze Erklärung in Alltagssprache. Bei Schritt 2 nennen: keine Passwörter, keine Zugangsdaten und keine vertraulichen Daten. Bei Schritt 5 nennen: Quellen, Zahlen, Fakten und fachliche Eignung prüfen.

- [ ] **Step 3: Vier Anwendungsfelder erstellen**

Baue einen Abschnitt `id="ki-praxis-anwendungen"` mit vier gleichartigen Karten:

```html
<article class="card ki-praxis-card">
  <h3>Texte &amp; Erklärungen</h3>
  <p>Entwürfe, Zusammenfassungen und verständliche Erklärungen vorbereiten – danach selbst prüfen und anpassen.</p>
</article>
```

Die drei weiteren Karten heißen „Planen &amp; Strukturieren“, „Bilder &amp; Ideen“ und „Software &amp; Automatisierung“. Jede Karte enthält einen konkreten Nutzen und einen Satz zur Prüfung bzw. zum verantwortungsvollen Umgang.

- [ ] **Step 4: KI-gestützte Softwarearbeit korrekt einordnen**

Baue einen Abschnitt `id="ki-praxis-software"` mit der Überschrift „Wenn KI bei Software hilft“. Er muss klar unterscheiden:

- Schnelles Ausprobieren ist für Ideen und Prototypen sinnvoll.
- Für veröffentlichte, wichtige oder datenverarbeitende Anwendungen braucht es Anforderungen, Tests, Datenschutz, Sicherheitsprüfung und Verständnis der Lösung.
- „Vibe Coding“ darf in diesem PR nur als verlinkbarer künftiger Lexikonbegriff erscheinen, nicht als Werbeversprechen oder Ersatz für Kontrolle.

- [ ] **Step 5: Leserweg und Standangabe ergänzen**

Schließe die Seite mit einer Callout-Sektion ab:

```html
<h2>Nächster Schritt</h2>
<p>Für einen sicheren Umgang mit Daten und Ergebnissen lies <a href="/ki/faq.html">KI sicher nutzen</a>. Für Regeln und Verantwortung im Arbeitsalltag geht es weiter zu <a href="/ki/im-betrieb.html">KI im Betrieb</a>.</p>
<p class="ki-content-status">Fachlich geprüft: August 2026</p>
```

- [ ] **Step 6: Den grünen Validator-Lauf bestätigen**

Run: `python scripts/validate_ki_praxis.py`

Expected: PASS mit `KI Praxis: OK`.

- [ ] **Step 7: Commit der Seiteninhalte**

```bash
git add ki/so-arbeitest-du-mit-ki.html
git commit -m "feat: modernize KI practice page"
```

## Task 3: Wiederverwendbare Darstellung für Ablauf und Praxisfelder ergänzen

**Files:**
- Modify: `assets/css/ki-content.css`
- Test: `scripts/validate_ki_praxis.py`

**Interfaces:**
- Consumes: Klassen `ki-praxis-steps`, `ki-praxis-step`, `ki-praxis-grid`, `ki-praxis-card` und `ki-content-status` aus dem neuen HTML.
- Produces: Responsives Raster mit lesbaren Karten bei Desktop und einspaltiger Darstellung auf kleinen Bildschirmen.

- [ ] **Step 1: CSS-Prüfung zum Validator hinzufügen und den Fehlerzustand sehen**

Ergänze im Validator die CSS-Datei und prüfe fünf Selektoren:

```python
CSS = ROOT / "assets" / "css" / "ki-content.css"
css = CSS.read_text(encoding="utf-8")
for selector in (".ki-praxis-steps", ".ki-praxis-step", ".ki-praxis-grid", ".ki-praxis-card", ".ki-content-status"):
    if selector not in css:
        errors.append(f"Praxis-Stil fehlt: {selector}")
```

Run: `python scripts/validate_ki_praxis.py`

Expected: FAIL mit mindestens `Praxis-Stil fehlt: .ki-praxis-steps`.

- [ ] **Step 2: Minimale responsive Styles ergänzen**

Füge ans Ende von `assets/css/ki-content.css` zielgerichtete Regeln hinzu:

```css
.ki-praxis-steps,.ki-praxis-grid{display:grid;gap:var(--space-4);grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.ki-praxis-step,.ki-praxis-card{height:100%;display:flex;flex-direction:column;gap:var(--space-3)}
.ki-praxis-step{padding:var(--space-4);border-left:4px solid var(--accent);background:var(--card);border-top:1px solid var(--border);border-right:1px solid var(--border);border-bottom:1px solid var(--border)}
.ki-praxis-step h3,.ki-praxis-step p,.ki-praxis-card h3,.ki-praxis-card p{margin:0}
.ki-content-status{margin:0;color:var(--text-muted);font-size:.9rem}
```

Die bestehenden globalen Karten-Stile bleiben maßgeblich; die Ergänzung darf keine Header-, Footer- oder Navigationsstile verändern.

- [ ] **Step 3: Grünen Validator-Lauf bestätigen**

Run: `python scripts/validate_ki_praxis.py`

Expected: PASS mit `KI Praxis: OK`.

- [ ] **Step 4: Commit der Styles und Validator-Erweiterung**

```bash
git add assets/css/ki-content.css scripts/validate_ki_praxis.py
git commit -m "style: add KI practice content components"
```

## Task 4: Vollständige Regression und PR-Vorbereitung

**Files:**
- Test: `scripts/validate_ki_praxis.py`
- Test: `scripts/validate_ki_sections.py`
- Test: `tests/ws-layout.test.js`
- Test: `sitemap.xml`

**Interfaces:**
- Consumes: Fertige Praxis-Seite, bestehende KI-Struktur und globale Navigation.
- Produces: Frische Nachweise für inhaltliche Struktur, Navigation, XML und fehlerfreie Diff-Formatierung.

- [ ] **Step 1: Alle fachlichen und technischen Prüfungen ausführen**

Run:

```bash
python scripts/validate_ki_praxis.py
python scripts/validate_ki_sections.py
node --test tests/ws-layout.test.js
python -c "import xml.etree.ElementTree as ET; ET.parse('sitemap.xml'); print('Sitemap XML: OK')"
git diff --check
```

Expected: Jeder Befehl liefert Exit-Code `0`; der Node-Test meldet alle Tests erfolgreich; XML-Ausgabe lautet `Sitemap XML: OK`; `git diff --check` bleibt leer.

- [ ] **Step 2: Sichtprüfung im Browser durchführen**

Prüfe Desktop und schmale Ansicht: Hero, fünf Schritte, vier Karten, Software-Hinweis, Leserweg und Footer. Prüfe dabei insbesondere, dass die Karten nicht überlappen und dass die Seite keine alten Suno-, C#- oder Visual-Studio-Texte mehr zeigt.

- [ ] **Step 3: Letzten Commit und Pull Request erstellen**

```bash
git status --short
git log --oneline -3
```

Erstelle danach einen PR mit dem Titel `KI: Praxis-Seite modernisieren`. Im PR-Text kurz erklären: alter Suno/C#-Einstieg entfernt, fünf-Schritte-Ablauf ergänzt, vier Anwendungsfelder, Softwarearbeit realistisch eingeordnet und Links zu Sicherheit/Betrieb gesetzt. Die durchgeführten Prüfungen einzeln aufführen. Falls `pwsh` in der Laufzeit fehlt, diesen fehlenden Deployment-Build transparent nennen.

## Plan Self-Review

- **Spec coverage:** Ziel, Leserweg, neue Praxis-Seite, Entfernen der Alt-Tutorials, Software-Einordnung, Neutralität, Standangabe, Links, CSS und getrennte Tests sind durch Tasks 1–4 abgedeckt. FAQ, Lexikon und der A4-Editor sind bewusst nicht Bestandteil dieses Plans.
- **Placeholder scan:** Keine Platzhalter, offenen Aufgaben oder unbestimmten Testschritte enthalten.
- **Interface consistency:** Der Validator erwartet `ki-praxis-ablauf`, `ki-praxis-anwendungen`, `ki-praxis-software`, die zwei Links, die Standangabe und die CSS-Selektoren, welche in den Umsetzungsaufgaben mit denselben Namen erzeugt werden.
