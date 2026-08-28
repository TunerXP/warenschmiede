# KI-Musik-Bereich Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Einen eigenen Warenschmiede-Hauptbereich „KI-Musik“ mit Übersichtsseite, Suno-Hörbeispiel „Running Back To You“, eigenem Webplayer und sichtbarer Rechte-/Transparenz-Einordnung bauen.

**Architecture:** Die globale Navigation bleibt zentral in `assets/js/ws-layout.js`. Die neue Einstiegsseite `/ki-musik/` nutzt den bestehenden Warenschmiede-Rahmen und einen neuen isolierten Musikbereich in CSS. Die bestehende Suno-Seite bleibt unter `/ki/musik/suno.html` und erhält nur den neuen Beispiel-/Player-Bereich; Audio und Bilder werden ausschließlich über die bereits auf IONOS vorhandenen `/media/...`-Pfade geladen.

**Tech Stack:** Statisches HTML, CSS, Vanilla JavaScript, HTML5 Audio, Python-Validatoren, bestehendes `ws-layout.js`.

**Spec:** `docs/superpowers/specs/2026-08-28-ki-musik-bereich-design.md`

## Global Constraints

- Hauptnavigation: `KI-Musik` zwischen `Über KI` und `Kontakt`.
- `/ki-musik/` und `/ki/musik/` aktivieren den Hauptpunkt `KI-Musik`.
- Bestehende Suno-URL `/ki/musik/suno.html` bleibt bestehen.
- Suno-Breadcrumb wird `Start → KI-Musik → KI-Musik mit Suno`.
- `← Zur Übersicht` auf Suno führt auf `/ki-musik/`.
- Nur `Running Back To You` wird in Phase 1 als vollständiges Hörbeispiel eingebunden.
- Medienpfade sind verbindlich: `/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3`, `/media/ki-musik/the-things-that-stay/images/album-cover.png`, `/media/ki-musik/the-things-that-stay/images/running-back-to-you.png`.
- Keine WAV-Dateien veröffentlichen.
- Kein Autoplay.
- Kein seitenübergreifender globaler Player in Phase 1.
- Bestehende KI-Seiten außerhalb Musik nicht unbeabsichtigt ändern.
- Vollständige Lyrics nicht veröffentlichen.
- Rechte-/Transparenztext ist keine Rechtsberatung und verweist auf offizielle externe Quellen.

---

### Task 1: Akzeptanz-Validator zuerst rot machen

**Files:**
- Create: `scripts/validate_ki_music_area.py`

**Interfaces:**
- Consumes: Repository-Dateien unter `assets/js/`, `ki-musik/`, `ki/musik/`, `assets/css/`, `assets/js/`, `sitemap.xml`.
- Produces: Exitcode `0` bei vollständiger Umsetzung, `1` mit konkreten Fehlermeldungen bei fehlenden Anforderungen.

- [ ] **Step 1: Failing validator schreiben**

```python
#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LAYOUT = ROOT / "assets/js/ws-layout.js"
OVERVIEW = ROOT / "ki-musik/index.html"
SUNO = ROOT / "ki/musik/suno.html"
PLAYER_JS = ROOT / "assets/js/ki-music-player.js"
MUSIC_CSS = ROOT / "assets/css/ki-music-area.css"
SITEMAP = ROOT / "sitemap.xml"

AUDIO = "/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3"
ALBUM = "/media/ki-musik/the-things-that-stay/images/album-cover.png"
SONG = "/media/ki-musik/the-things-that-stay/images/running-back-to-you.png"


def read(path):
    return path.read_text(encoding="utf-8") if path.exists() else ""


def main():
    errors = []
    layout = read(LAYOUT)
    overview = read(OVERVIEW)
    suno = read(SUNO)
    player = read(PLAYER_JS)
    sitemap = read(SITEMAP)

    if "label: 'KI-Musik'" not in layout:
        errors.append("Hauptnavigation enthält KI-Musik noch nicht")
    if "key: 'ki-musik'" not in layout:
        errors.append("KI-Musik hat keinen eigenen Navigations-Key")
    if "{ label: 'KI-Musik mit Suno', href: 'ki/musik/suno.html'" in layout.split("key: 'ki-musik'")[0]:
        errors.append("Suno hängt noch im Über-KI-Menü")
    if "currentPath.includes('/ki-musik/')" not in layout or "currentPath.includes('/ki/musik/')" not in layout:
        errors.append("Aktivzustand für beide Musik-Pfade fehlt")

    if not OVERVIEW.exists():
        errors.append("ki-musik/index.html fehlt")
    for needle in ("KI-Musik – vom Gedanken zum fertigen Song", "Running Back To You", "Nutzung & Transparenz", ALBUM):
        if needle not in overview:
            errors.append(f"Übersicht fehlt: {needle}")

    for needle in (
        'id="hoerbeispiel"',
        "Running Back To You",
        AUDIO,
        SONG,
        "So wurde der Song aufgebaut",
        "122 BPM",
        "Beispiel: verwendete Stilbeschreibung",
        'href="/ki-musik/"',
    ):
        if needle not in suno:
            errors.append(f"Suno-Seite fehlt: {needle}")

    if "autoplay" in suno.lower():
        errors.append("Autoplay darf nicht gesetzt sein")

    for needle in ("data-music-play", "data-music-progress", "data-music-current", "data-music-duration", "data-music-volume"):
        if needle not in suno:
            errors.append(f"Player-Markup fehlt: {needle}")

    for needle in ("audio.play()", "audio.pause()", "loadedmetadata", "timeupdate", "volume"):
        if needle not in player:
            errors.append(f"Player-JS fehlt: {needle}")

    for needle in (
        "https://help.suno.com/en/articles/9601665",
        "https://help.suno.com/en/articles/2746945",
        "https://suno.com/terms",
        "https://www.gesetze-im-internet.de/urhg/__2.html",
        "https://www.dpma.de/",
        "https://suno.com/@tunerxp",
    ):
        if needle not in overview:
            errors.append(f"Rechte-/Transparenzlink fehlt: {needle}")

    if "https://www.warenschmiede.com/ki-musik/" not in sitemap:
        errors.append("Sitemap enthält /ki-musik/ noch nicht")

    if errors:
        print("KI-Musik-Bereich: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Musik-Bereich: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Validator laufen lassen und RED bestätigen**

Run: `python scripts/validate_ki_music_area.py`

Expected: `KI-Musik-Bereich: FEHLER` mit fehlender Navigation, fehlender `/ki-musik/`-Seite, fehlendem Player und fehlendem Sitemap-Eintrag.

- [ ] **Step 3: Commit**

```bash
git add scripts/validate_ki_music_area.py
git commit -m "test: KI-Musik-Bereich absichern"
```

---

### Task 2: Hauptnavigation und aktive Bereiche umstellen

**Files:**
- Modify: `assets/js/ws-layout.js`

**Interfaces:**
- Consumes: bestehendes `NAVIGATION`-Array und `activeKey`-Ermittlung.
- Produces: neuer Navigationseintrag mit `key: 'ki-musik'`; `/ki-musik/` und `/ki/musik/` liefern `activeKey === 'ki-musik'`.

- [ ] **Step 1: Navigation minimal umbauen**

Im Block `Über KI → Arbeiten mit KI` den Suno-Link entfernen und direkt danach folgenden Hauptpunkt einfügen:

```javascript
{
  key: 'ki-musik', label: 'KI-Musik', type: 'mega',
  description: 'KI-Musik verstehen, Suno kennenlernen und ein echtes Warenschmiede-Hörbeispiel ansehen.',
  sections: [
    { label: 'Entdecken', accent: 'violet', links: [
      { label: 'KI-Musik im Überblick', href: 'ki-musik/', description: 'Vom Gedanken zum fertigen Song – Workflow, Beispiel und Einordnung.' },
      { label: 'Hörbeispiel: Running Back To You', href: 'ki/musik/suno.html#hoerbeispiel', description: 'Song anhören und den dokumentierten Aufbau nachvollziehen.' }
    ] },
    { label: 'Mit Suno arbeiten', accent: 'blue', links: [
      { label: 'KI-Musik mit Suno', href: 'ki/musik/suno.html', description: 'Suno, Studio 2.0 und die wichtigsten Funktionen praxisnah erklärt.' },
      { label: 'Mein Suno-Profil', href: 'https://suno.com/@tunerxp', description: 'Öffentliches TunerXP-Profil bei Suno.' }
    ] },
    { label: 'Einordnung', accent: 'green', links: [
      { label: 'Nutzung & Transparenz', href: 'ki-musik/#rechte', description: 'Paid-Plan-Rechte, Urheberrecht und offizielle Quellen.' },
      { label: 'Meine Musik', href: 'ki-musik/#meine-musik', description: 'The Things That Stay als Vorgeschmack auf den späteren TunerXP-Musikbereich.' }
    ] }
  ]
},
```

Die `activeKey`-Ermittlung in dieser Reihenfolge ergänzen:

```javascript
if (currentPath.includes('/ki-musik/') || currentPath.includes('/ki/musik/')) return 'ki-musik';
if (currentPath.includes('/ki/')) return 'ki';
```

- [ ] **Step 2: Validator laufen lassen**

Run: `python scripts/validate_ki_music_area.py`

Expected: Navigationsfehler verschwinden; Übersicht/Player/Sitemap bleiben noch rot.

- [ ] **Step 3: Commit**

```bash
git add assets/js/ws-layout.js
git commit -m "feat: eigenen KI-Musik-Menübereich anlegen"
```

---

### Task 3: Neue KI-Musik-Übersichtsseite bauen

**Files:**
- Create: `ki-musik/index.html`
- Create: `assets/css/ki-music-area.css`

**Interfaces:**
- Consumes: `styles.css`, `ki-content.css`, zentrale Header-/Footer-Erzeugung aus `ws-layout.js`, Albumcover unter dem verbindlichen `/media/...`-Pfad.
- Produces: Einstiegspunkt `/ki-musik/` mit IDs `#hoerbeispiel-teaser`, `#meine-musik`, `#rechte`.

- [ ] **Step 1: Seite mit semantischen Bereichen erstellen**

Die Seite muss mindestens enthalten:

```html
<main class="site-main ki-music-area" id="ki-musik" tabindex="-1">
  <section class="container ki-music-area__hero">
    <p class="section-eyebrow">KI-Musik</p>
    <h1>KI-Musik – vom Gedanken zum fertigen Song</h1>
    <p>Ein Song entsteht nicht nur durch einen Knopfdruck. Idee, Kernaussage, Stilbeschreibung, Auswahl, mehrere Versuche und Feinarbeit gehören für mich zusammen.</p>
    <a class="ki-music-area__cta" href="/ki/musik/suno.html">KI-Musik mit Suno ansehen →</a>
  </section>

  <section class="ki-music-area__section" aria-labelledby="workflow-heading">
    <div class="container">
      <h2 id="workflow-heading">Wie ich damit arbeite</h2>
      <ol class="ki-music-area__flow">
        <li>Idee</li><li>Text / Kernaussage</li><li>Stilbeschreibung</li><li>Generieren</li><li>Vergleichen</li><li>Verfeinern</li><li>Final auswählen</li>
      </ol>
    </div>
  </section>

  <section class="ki-music-area__section" id="hoerbeispiel-teaser">
    <div class="container ki-music-area__teaser">
      <img src="/media/ki-musik/the-things-that-stay/images/album-cover.png" alt="Albumcover The Things That Stay von TunerXP">
      <div>
        <p class="section-eyebrow">Echtes Beispiel</p>
        <h2>Running Back To You</h2>
        <p>Track 08 aus The Things That Stay zeigt, wie ein Duett aus Story, Rollenverteilung, Stilbeschreibung und mehreren Versuchen wachsen kann.</p>
        <a href="/ki/musik/suno.html#hoerbeispiel">Song anhören und Aufbau ansehen →</a>
      </div>
    </div>
  </section>

  <section class="ki-music-area__section" id="meine-musik">
    <div class="container">
      <p class="section-eyebrow">Meine Musik</p>
      <h2>The Things That Stay</h2>
      <p>Ein englischsprachiges Piano-Pop/Rock-Album mit 70s/80s-inspirierter DNA, Soul-/Gospel-Einflüssen und Klavier als Herzstück. Die vollständigen Alben sollen später ihren eigenen Bereich auf TunerXP.de bekommen.</p>
    </div>
  </section>

  <section class="ki-music-area__section" id="rechte">
    <div class="container ki-music-area__rights">
      <p class="section-eyebrow">Nutzung & Transparenz</p>
      <h2>KI-Musik, Nutzungsrechte und Urheberrecht</h2>
      <p>Die hier veröffentlichten Songs wurden während eines bezahlten Suno-Pro-Abos erstellt. Vertragliche Nutzungsrechte und die urheberrechtliche Schutzfähigkeit eines KI-unterstützten Ergebnisses sind unterschiedliche Fragen. Diese Einordnung ist keine Rechtsberatung.</p>
    </div>
  </section>
</main>
```

Unter `#rechte` diese offiziellen Links als sichtbare Linkliste ergänzen:

```html
<a href="https://help.suno.com/en/articles/9601665" target="_blank" rel="noopener noreferrer">Suno: Rechte bei bezahlten Plänen ↗</a>
<a href="https://help.suno.com/en/articles/2746945" target="_blank" rel="noopener noreferrer">Suno: Copyright & Ownership ↗</a>
<a href="https://suno.com/terms" target="_blank" rel="noopener noreferrer">Suno Nutzungsbedingungen ↗</a>
<a href="https://suno.com/terms-september-2026" target="_blank" rel="noopener noreferrer">Suno Bedingungen ab September 2026 ↗</a>
<a href="https://www.gesetze-im-internet.de/urhg/__2.html?lang=de" target="_blank" rel="noopener noreferrer">Urheberrechtsgesetz § 2 ↗</a>
<a href="https://www.dpma.de/service/schutzrechte_kurz_erklaert/geistigeseigentumdigital/index.html" target="_blank" rel="noopener noreferrer">DPMA: Geistiges Eigentum digital ↗</a>
<a href="https://suno.com/@tunerxp" target="_blank" rel="noopener noreferrer">TunerXP bei Suno ↗</a>
```

- [ ] **Step 2: Isoliertes CSS erstellen**

`assets/css/ki-music-area.css` soll ausschließlich `.ki-music-area...`-Selektoren verwenden. Mindestlayout:

```css
.ki-music-area { --music-violet:#7356bf; --music-magenta:#b64c97; --music-line:rgba(91,74,122,.18); }
.ki-music-area__hero { padding:clamp(42px,6vw,84px) 0; }
.ki-music-area__hero h1 { max-width:920px; margin:.2rem 0 1rem; font-size:clamp(2.5rem,5vw,4.8rem); line-height:1.03; letter-spacing:-.045em; }
.ki-music-area__section { padding:clamp(42px,6vw,76px) 0; border-top:1px solid var(--music-line); }
.ki-music-area__flow { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); margin:24px 0 0; padding:0; list-style:none; border-top:1px solid var(--music-line); border-bottom:1px solid var(--music-line); }
.ki-music-area__flow li { padding:18px 12px; border-left:1px solid var(--music-line); font-weight:800; }
.ki-music-area__flow li:first-child { border-left:0; }
.ki-music-area__teaser { display:grid; grid-template-columns:minmax(260px,.7fr) minmax(0,1.3fr); gap:clamp(28px,5vw,64px); align-items:center; }
.ki-music-area__teaser img { width:100%; display:block; box-shadow:0 20px 50px rgba(34,29,50,.12); }
.ki-music-area__rights { border-left:5px solid var(--music-magenta); padding-left:clamp(20px,3vw,34px); }
@media(max-width:900px){ .ki-music-area__flow{grid-template-columns:repeat(2,minmax(0,1fr));} .ki-music-area__teaser{grid-template-columns:1fr;} }
@media(max-width:620px){ .ki-music-area__flow{grid-template-columns:1fr;} .ki-music-area__flow li{border-left:0;border-top:1px solid var(--music-line);} }
```

- [ ] **Step 3: Validator laufen lassen**

Run: `python scripts/validate_ki_music_area.py`

Expected: Übersichtsfehler und Rechte-Link-Fehler verschwinden; Suno/Player/Sitemap bleiben rot.

- [ ] **Step 4: Commit**

```bash
git add ki-musik/index.html assets/css/ki-music-area.css
git commit -m "feat: KI-Musik-Übersicht anlegen"
```

---

### Task 4: Suno-Seite als Heimat im KI-Musik-Bereich und Hörbeispiel erweitern

**Files:**
- Modify: `ki/musik/suno.html`
- Modify: `assets/css/ki-music.css`

**Interfaces:**
- Consumes: vorhandene Suno-Seite und die drei `/media/...`-Ressourcen.
- Produces: `#hoerbeispiel` mit Datenattributen für `assets/js/ki-music-player.js`.

- [ ] **Step 1: Breadcrumb und Zurück-Link umstellen**

Breadcrumb:

```html
<li class="breadcrumbs__item"><a href="/ki-musik/">KI-Musik</a></li>
<li class="breadcrumbs__item" aria-current="page">KI-Musik mit Suno</li>
```

Zurück-Link:

```html
<a class="ki-detail-back" href="/ki-musik/">← Zur Übersicht</a>
```

- [ ] **Step 2: Hörbeispiel zwischen Einstieg/Workflow und späteren Funktionsblöcken einfügen**

```html
<section class="ki-music-section" id="hoerbeispiel" aria-labelledby="hoerbeispiel-heading">
  <div class="container">
    <header class="ki-music-heading">
      <p class="section-eyebrow">Echtes Hörbeispiel</p>
      <h2 id="hoerbeispiel-heading">So kann ein Ergebnis klingen</h2>
      <p>Running Back To You ist Track 08 aus The Things That Stay und dient hier als praktisches Beispiel dafür, wie Story, Stimmenrollen, Stilbeschreibung und mehrere Versuche zusammenkommen.</p>
    </header>

    <div class="ki-music-song-example">
      <figure class="ki-music-song-example__visual">
        <img src="/media/ki-musik/the-things-that-stay/images/running-back-to-you.png" alt="Songbild zu Running Back To You von TunerXP">
      </figure>
      <div class="ki-music-song-example__content">
        <p class="section-eyebrow">TunerXP · The Things That Stay · Track 08 · 2026</p>
        <h3>Running Back To You</h3>
        <p>Ein schnelleres emotionales Duett über zwei Menschen, die Abstand gewinnen wollten und trotzdem immer wieder zueinander zurückfinden.</p>

        <div class="ki-music-player" data-music-player>
          <audio preload="metadata" data-music-audio src="/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3">
            <a href="/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3">MP3 direkt öffnen</a>
          </audio>
          <div class="ki-music-player__controls">
            <button type="button" data-music-play aria-label="Running Back To You abspielen">▶ Abspielen</button>
            <input data-music-progress type="range" min="0" max="100" value="0" step="0.1" aria-label="Wiedergabeposition">
            <span><span data-music-current>0:00</span> / <span data-music-duration>–:––</span></span>
            <label>Lautstärke <input data-music-volume type="range" min="0" max="1" value="1" step="0.05"></label>
          </div>
          <p class="ki-music-player__status" data-music-status aria-live="polite"></p>
          <a class="ki-music-player__download" href="/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3" download>MP3 herunterladen ↓</a>
        </div>
      </div>
    </div>

    <div class="ki-music-song-build">
      <h3>So wurde der Song aufgebaut</h3>
      <ol class="ki-music-song-structure" aria-label="Songstruktur">
        <li>Intro</li><li>Verse</li><li>Pre-Chorus</li><li>Chorus</li><li>Verse</li><li>Pre-Chorus</li><li>Chorus</li><li>Bridge</li><li>Final Chorus</li><li>Outro</li>
      </ol>
      <p><strong>Rollen:</strong> männliche und weibliche Stimme zunächst getrennt, Call-and-Response, gemeinsamer Refrain und gemeinsames Finale.</p>
      <p><strong>122 BPM:</strong> treibendes Grand Piano, melodischer Bass, lebendige Drums, Handclap-Backbeat, warme E-Gitarren und Gospel-inspirierte Background-Vocals.</p>
    </div>

    <details class="ki-music-style-example">
      <summary>Beispiel: verwendete Stilbeschreibung</summary>
      <p>70s/80s inspired piano pop rock duet, 122 BPM, mature baritone-tenor male vocals, deep rich warm singing voice, husky soulful male vocals, raspy soulful female alto vocal, warm authentic female voice, slight vocal tremor, clear male and female vocal separation, call and response verses, shared chorus harmonies, driving grand piano rhythm, strong acoustic piano chords, melodic bass guitar, tight upbeat drums, handclap backbeat, warm electric guitar riffs, gospel-influenced backing vocals, vintage analog warmth, emotional road-song energy, romantic tension, uplifting singalong chorus, no rap, no metal, no punk, no disco.</p>
    </details>
  </div>
</section>
```

- [ ] **Step 3: CSS für Beispiel und Player-Markup ergänzen**

Nur `.ki-music-page ...` verwenden. Mindestens:

```css
.ki-music-page .ki-music-song-example { display:grid; grid-template-columns:minmax(300px,.85fr) minmax(0,1.15fr); gap:clamp(28px,5vw,60px); align-items:center; }
.ki-music-page .ki-music-song-example__visual img { width:100%; display:block; box-shadow:0 22px 54px rgba(38,30,61,.14); }
.ki-music-page .ki-music-player { margin-top:24px; padding:20px; border-left:5px solid var(--music-magenta); background:rgba(255,255,255,.74); }
.ki-music-page .ki-music-player audio { width:100%; }
.ki-music-page .ki-music-player__controls { display:grid; grid-template-columns:auto minmax(150px,1fr) auto auto; gap:14px; align-items:center; }
.ki-music-page .ki-music-player__controls button { min-height:44px; font-weight:900; }
.ki-music-page .ki-music-player__controls input[type="range"] { width:100%; }
.ki-music-page .ki-music-song-build { margin-top:40px; }
.ki-music-page .ki-music-song-structure { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); margin:18px 0; padding:0; list-style:none; border-top:1px solid var(--music-line); border-bottom:1px solid var(--music-line); }
.ki-music-page .ki-music-song-structure li { padding:14px 10px; border-left:1px solid var(--music-line); text-align:center; font-weight:800; }
.ki-music-page .ki-music-style-example { margin-top:28px; border-left:5px solid var(--music-violet); padding:18px 22px; background:rgba(245,241,253,.72); }
@media(max-width:900px){ .ki-music-page .ki-music-song-example{grid-template-columns:1fr;} .ki-music-page .ki-music-player__controls{grid-template-columns:1fr;} .ki-music-page .ki-music-song-structure{grid-template-columns:repeat(2,minmax(0,1fr));} }
@media(max-width:620px){ .ki-music-page .ki-music-song-structure{grid-template-columns:1fr;} }
```

- [ ] **Step 4: Player-Script einbinden**

Vor `</body>`:

```html
<script defer src="/assets/js/ws-layout.js"></script>
<script defer src="/assets/js/ki-music-player.js"></script>
```

- [ ] **Step 5: Validator laufen lassen**

Run: `python scripts/validate_ki_music_area.py`

Expected: Suno-Markup- und Medienpfadfehler verschwinden; Player-JS/Sitemap bleiben rot.

- [ ] **Step 6: Commit**

```bash
git add ki/musik/suno.html assets/css/ki-music.css
git commit -m "feat: Suno-Hörbeispiel mit Songaufbau ergänzen"
```

---

### Task 5: Eigenen zugänglichen Webplayer implementieren

**Files:**
- Create: `assets/js/ki-music-player.js`

**Interfaces:**
- Consumes: `[data-music-player]` mit `audio`, Playbutton, Progress, Zeit, Lautstärke und Status.
- Produces: lokale Wiedergabesteuerung ohne Autoplay; bei Fehler bleibt Direktdownload nutzbar.

- [ ] **Step 1: Player-JS implementieren**

```javascript
(function () {
  const root = document.querySelector('[data-music-player]');
  if (!root) return;

  const audio = root.querySelector('[data-music-audio]');
  const play = root.querySelector('[data-music-play]');
  const progress = root.querySelector('[data-music-progress]');
  const current = root.querySelector('[data-music-current]');
  const duration = root.querySelector('[data-music-duration]');
  const volume = root.querySelector('[data-music-volume]');
  const status = root.querySelector('[data-music-status]');

  if (!audio || !play || !progress || !current || !duration || !volume || !status) return;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return '–:––';
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
  };

  const syncPlayState = () => {
    const playing = !audio.paused && !audio.ended;
    play.textContent = playing ? '❚❚ Pause' : '▶ Abspielen';
    play.setAttribute('aria-label', playing ? 'Running Back To You pausieren' : 'Running Back To You abspielen');
  };

  play.addEventListener('click', async () => {
    try {
      if (audio.paused || audio.ended) await audio.play();
      else audio.pause();
    } catch (error) {
      status.textContent = 'Die Audiodatei konnte nicht gestartet werden. Der MP3-Download bleibt verfügbar.';
    }
    syncPlayState();
  });

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    current.textContent = formatTime(audio.currentTime);
    progress.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : '0';
  });

  progress.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
  });

  audio.addEventListener('play', syncPlayState);
  audio.addEventListener('pause', syncPlayState);
  audio.addEventListener('ended', syncPlayState);
  audio.addEventListener('error', () => {
    status.textContent = 'Die Audiodatei ist gerade nicht erreichbar. Du kannst es später erneut versuchen oder den Downloadlink verwenden.';
    syncPlayState();
  });

  syncPlayState();
})();
```

- [ ] **Step 2: Validator laufen lassen**

Run: `python scripts/validate_ki_music_area.py`

Expected: Player-JS-Fehler verschwinden; Sitemap bleibt noch rot.

- [ ] **Step 3: Commit**

```bash
git add assets/js/ki-music-player.js
git commit -m "feat: Webplayer für KI-Musik-Hörbeispiel ergänzen"
```

---

### Task 6: Sitemap ergänzen und vollständige Verifikation

**Files:**
- Modify: `sitemap.xml`
- Test: `scripts/validate_ki_music_area.py`

**Interfaces:**
- Consumes: alle vorherigen Tasks.
- Produces: vollständig grüne statische Akzeptanzprüfung und PR-fertiger Branch.

- [ ] **Step 1: Sitemap-Eintrag ergänzen**

Direkt bei den KI-/Tutorial-Seiten:

```xml
  <url>
    <loc>https://www.warenschmiede.com/ki-musik/</loc>
    <lastmod>2026-08-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 2: Validator vollständig GREEN laufen lassen**

Run: `python scripts/validate_ki_music_area.py`

Expected:

```text
KI-Musik-Bereich: OK
```

- [ ] **Step 3: Bestehende relevante Validatoren laufen lassen**

Run:

```bash
python scripts/validate_ki_sections.py
python scripts/validate_ki_learning_chat.py
python scripts/validate_ki_tutorial_pdf_verstehen.py
```

Expected: Alle vorhandenen Validatoren, die im aktuellen Branch existieren, enden mit `OK`. Falls ein Script im Repository nicht existiert, dies dokumentieren statt einen Erfolg zu behaupten.

- [ ] **Step 4: Struktureller Gegencheck**

Prüfen:
- kein `autoplay` im Suno-Markup
- `Running Back To You` genau als Phase-1-Hörbeispiel eingebunden
- keine WAV-Referenz
- keine vollständige Trackliste des Albums auf `/ki-musik/`
- keine vollständigen Lyrics auf Warenschmiede
- alle externen Links mit `target="_blank" rel="noopener noreferrer"`
- `ws-layout.js` aktiviert Musikpfade vor dem allgemeinen `/ki/`-Fall

- [ ] **Step 5: Commit**

```bash
git add sitemap.xml
git commit -m "chore: KI-Musik-Bereich in Sitemap aufnehmen"
```

- [ ] **Step 6: PR vorbereiten**

PR-Titel:

```text
KI-Musik als eigenen Bereich mit Suno-Hörbeispiel aufbauen
```

PR-Beschreibung muss nennen:
- neuer Hauptmenüpunkt `KI-Musik`
- neue `/ki-musik/`-Übersichtsseite
- Suno-Breadcrumb/Zurück-Link auf neuen Bereich umgestellt
- `Running Back To You` mit eigenem Player, Songstruktur und Stilbeispiel
- IONOS-Medienpfade, keine Binärdateien im Repo
- Rechte-/Transparenzbereich mit offiziellen Quellen
- keine WAVs, keine komplette Albumseite in Phase 1
- ausgeführte Validatoren mit tatsächlichem Ergebnis

