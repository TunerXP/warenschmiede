# Design – KI-Musik-Bereich mit Suno-Hörbeispiel

Stand: 28.08.2026

## Ziel

Warenschmiede erhält einen eigenen Hauptbereich **KI-Musik**. Der bestehende Suno-Inhalt bleibt technisch unter `/ki/musik/suno.html`, wird aber aus dem Mega-Menü **Über KI** herausgelöst und dem neuen Hauptmenü **KI-Musik** zugeordnet.

Phase 1 bleibt bewusst klein: Auf Warenschmiede wird nur ein echter Beispielsong eingebunden – **Running Back To You** aus dem Album **The Things That Stay**. Der Song dient als praktisches Hör- und Erklärbeispiel dafür, wie aus Idee, Text, Stilbeschreibung und mehreren Iterationen ein fertiger KI-Musik-Track entstehen kann.

Die komplette Albumwelt mit allen Songs, Bildern, Hintergrundgeschichten und Downloads ist **nicht** Teil dieser Phase. Sie soll später auf `tunerxp.de` entstehen. Die Warenschmiede-Lösung wird so gebaut, dass Player- und Datenkonzept später wiederverwendbar sind.

## Navigationsstruktur

Die globale Hauptnavigation in `assets/js/ws-layout.js` wird erweitert.

Reihenfolge Desktop und Mobile:

1. Start
2. Downloads
3. Online Tools
4. Leistungen
5. Über KI
6. **KI-Musik**
7. Kontakt
8. 3D-Druck

Der bisherige Menüpunkt **KI-Musik mit Suno** wird aus `Über KI → Arbeiten mit KI` entfernt.

Das neue Mega-Menü **KI-Musik** enthält in Phase 1:

### Entdecken
- **KI-Musik im Überblick** → `/ki-musik/`
- **Hörbeispiel: Running Back To You** → `/ki/musik/suno.html#hoerbeispiel`

### Mit Suno arbeiten
- **KI-Musik mit Suno** → `/ki/musik/suno.html`
- **Mein Suno-Profil** → `https://suno.com/@tunerxp`

### Einordnung
- **Nutzung & Transparenz** → `/ki-musik/#rechte`
- **Meine Musik** → `/ki-musik/#meine-musik`; dort wird erklärt, dass vollständige Alben später auf TunerXP.de erscheinen.

Für Pfade unter `/ki-musik/` **und** `/ki/musik/` wird künftig `KI-Musik` als aktiver Hauptmenüpunkt markiert. `Über KI` darf auf der Suno-Seite nicht mehr als aktiver Hauptbereich erscheinen.

## URL-Struktur

Neue Hauptseite:

- `/ki-musik/` → KI-Musik-Übersicht

Bestehende Seite bleibt erhalten:

- `/ki/musik/suno.html` → ausführliche Suno-Erklärung

Dadurch bleiben bestehende Links auf die Suno-Seite gültig. Es wird keine Weiterleitung und keine Umbenennung der bestehenden Suno-Datei benötigt.

## Neue Seite `/ki-musik/`

Die Seite ist eine ruhige, moderne Einstiegsseite und kein Albumarchiv.

### Hero
- Titel: **KI-Musik – vom Gedanken zum fertigen Song**
- kurze Einordnung, dass KI Musik nicht nur „auf Knopfdruck“ bedeutet, sondern Idee, Text, Stil, Auswahl, Iteration und Nachbearbeitung zusammenkommen können
- klare Verlinkung zur bestehenden Suno-Seite

### Bereich „Wie ich damit arbeite“
Kurzer Ablauf:

**Idee → Text/Kernaussage → Stilbeschreibung → Generieren → Vergleichen → Verfeinern → Final auswählen**

Der Bereich erklärt den Workflow praxisnah, ohne ihn als allgemeingültige Methode darzustellen.

### Bereich „Hörbeispiel“
Teaser für **Running Back To You** mit Albumcover bzw. Songbild und Link zum vollständigen Beispielbereich auf der Suno-Seite.

### Bereich „Meine Musik“
- kurze Vorstellung von **The Things That Stay**
- Hinweis, dass komplette Alben später auf `tunerxp.de` als persönlicher Musikbereich erscheinen
- keine vollständige Trackliste in Phase 1

### Bereich „Nutzung & Transparenz“
Eigener sichtbarer Abschnitt mit Links zu offiziellen Quellen. Die Seite formuliert keine Rechtsberatung und behauptet keinen pauschalen urheberrechtlichen Schutz.

## Medienablage auf IONOS

Die Audiodatei und Bilder werden **nicht** ins GitHub-Repository gelegt. Sie liegen dauerhaft auf dem IONOS-Webspace unter:

```text
/media/
└── ki-musik/
    └── the-things-that-stay/
        ├── audio/
        │   └── 08-running-back-to-you.mp3
        └── images/
            ├── album-cover.png
            └── running-back-to-you.png
```

Diese Struktur ist für Phase 1 verbindlich.

Root-relative Webpfade:

- `/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3`
- `/media/ki-musik/the-things-that-stay/images/album-cover.png`
- `/media/ki-musik/the-things-that-stay/images/running-back-to-you.png`

WAV-Dateien werden **nicht** veröffentlicht. Sie bleiben private Original-/Masterdateien.

Der Ordner `/media/` gilt als webspaceverwalteter Medienbereich und darf von späteren Deploy-/Cleanup-Abläufen nicht gelöscht werden.

## Hörbeispiel auf der Suno-Seite

Die bestehende Seite `/ki/musik/suno.html` erhält einen neuen Abschnitt mit `id="hoerbeispiel"`.

Überschrift:

**So kann ein Ergebnis klingen**

Gezeigt wird ausschließlich:

- Titel: **Running Back To You**
- Artist: **TunerXP**
- Album: **The Things That Stay**
- Track: **08**
- Jahr: **2026**
- Sprache: Englisch
- Vocal-Typ: Duett / zwei Stimmen
- Stil: 70s/80s inspired Piano Pop Rock Duet / Road-Song Duett

Der Songbericht beschreibt den Track als treibendes, emotionales, hoffnungsvolles und sehnsüchtiges Duett. Inhaltlich geht es um zwei Menschen, die Abstand gewinnen wollten, aber immer wieder zueinander zurückfinden. Im Album bringt Track 08 nach dem melancholischeren „Far From Home Tonight“ wieder mehr Tempo und Duett-Chemie.

## Player

Der Browser nutzt technisch ein HTML-`audio`-Element, die sichtbare Bedienung wird aber im Warenschmiede-Stil umgesetzt.

### Funktionen Phase 1
- Play / Pause
- Fortschrittsbalken
- aktuelle Zeit / Gesamtdauer
- Lautstärke
- direkter MP3-Download
- Tastaturbedienbarkeit
- klarer Focus-State
- kein Autoplay
- kein automatischer Start beim Laden der Seite

### Verhalten
- Beim Start wird nur dieser eine Titel abgespielt.
- Player bleibt innerhalb des Beispielbereichs; kein seitenübergreifender globaler Player in Phase 1.
- Bei Audiofehlern wird eine verständliche Meldung angezeigt und der Downloadlink bleibt verfügbar.
- Der Browser darf die MP3 direkt streamen. Ein technischer Kopierschutz wird nicht versprochen.

## Songbild und Darstellung

Das hochauflösende Bild `running-back-to-you.png` ist die primäre visuelle Darstellung des Songs. Das eingebettete MP3-Cover bleibt unangetastet, wird für die Webdarstellung aber nicht benötigt.

Das Albumcover `album-cover.png` wird für Albumkontext und die KI-Musik-Übersicht verwendet.

## Bereich „So wurde der Song aufgebaut“

Der Beispielbereich erklärt nicht nur das Ergebnis, sondern den dokumentierten Aufbau.

Visualisierte Songstruktur:

**Intro → Verse → Pre-Chorus → Chorus → Verse → Pre-Chorus → Chorus → Bridge → Final Chorus → Outro**

Die Rollenverteilung wird erklärt:
- männliche und weibliche Stimme zunächst klar getrennt
- Call-and-Response
- gemeinsamer Refrain
- gemeinsames Finale

### Musikalische Eckdaten
- BPM: 122
- Grand Piano / akustisches Klavier als treibendes Kernelement
- melodischer Bass
- straffe, lebendige Drums
- Handclap-Backbeat
- warme E-Gitarren
- Gospel-inspirierte Background-Vocals
- männliche Stimme: mature baritone-tenor, deep/rich/warm, husky soulful
- weibliche Stimme: raspy soulful female alto, warm/authentic, slight vocal tremor

## Stilbeschreibung / Prompt-Beispiel

Der dokumentierte Suno-Style-Prompt kann in einem aufklappbaren Bereich **„Beispiel: verwendete Stilbeschreibung“** gezeigt werden.

Ziel ist nicht, einen „magischen Prompt“ zu verkaufen, sondern sichtbar zu machen, wie konkret Instrumentierung, Stimmen, Stimmung, Vocal-Trennung und unerwünschte Stilrichtungen beschrieben werden können.

Es werden keine Künstler- oder Bandnamen ergänzt.

## Lyrics

Die vollständigen Lyrics werden in Phase 1 **nicht** großflächig auf Warenschmiede veröffentlicht.

Die Seite nutzt stattdessen:
- Kernaussage des Songs
- Songstruktur
- Rollen der Stimmen
- musikalische Eckdaten
- Stilbeschreibung

Ein späterer vollständiger Lyrics-Bereich ist für TunerXP.de vorgesehen.

## Albumkontext

**The Things That Stay** wird auf Warenschmiede nur kurz eingeordnet.

Dokumentierter Albumkern:
- englischsprachiges Piano-Pop/Rock-Album
- 70s/80s-inspirierte DNA
- Soul-/Gospel-Einflüsse
- warm, emotional, hoffnungsvoll, nostalgisch und resilient
- Klavier als Herzstück
- bewusster Wechsel zwischen Balladen, schnelleren Songs, Soul-Groove, Comeback-Anthem, Duetten und cinematic Finale

Die komplette Trackliste und ausführliche Albumdarstellung bleiben für TunerXP.de reserviert.

## Rechte, Nutzung und Transparenz

Der Abschnitt macht drei Ebenen klar:

1. **Suno-Vertragsrechte:** Die veröffentlichten Songs wurden während eines bezahlten Suno-Pro-Abos erstellt. Suno beschreibt für Songs, die während Pro/Premier erstellt wurden, kommerzielle Nutzungsrechte; die aktuellen Bedingungen sind maßgeblich.
2. **Urheberrecht:** Nutzungsrechte aus einem Vertrag sind nicht dasselbe wie die Frage, ob ein KI-unterstütztes Ergebnis in Deutschland urheberrechtlich als Werk geschützt ist.
3. **Transparenz:** Die Musik wird hier kostenlos zum Anhören bzw. Download bereitgestellt und als KI-unterstützte Musik gekennzeichnet.

### Offizielle externe Quellen

- Suno Paid-Plan-Rechte: `https://help.suno.com/en/articles/9601665`
- Suno Copyright/Ownership: `https://help.suno.com/en/articles/2746945`
- Suno Terms aktuell: `https://suno.com/terms`
- Suno Terms September 2026: `https://suno.com/terms-september-2026`
- Deutsches Urheberrechtsgesetz § 2: `https://www.gesetze-im-internet.de/urhg/__2.html?lang=de`
- DPMA – Geistiges Eigentum digital / KI und Urheberrecht: `https://www.dpma.de/service/schutzrechte_kurz_erklaert/geistigeseigentumdigital/index.html`
- Öffentliches Suno-Profil: `https://suno.com/@tunerxp`

Der Text enthält einen klaren Hinweis: **keine Rechtsberatung; maßgeblich sind die jeweils aktuellen Bedingungen und die konkrete Einzelfallbewertung.**

## Gestaltung

Der vorhandene Stil aus `assets/css/ki-music.css` wird weitergeführt:
- helles Warenschmiede-Layout
- Violett/Magenta als Musikakzent
- klare Typografie
- keine verspielte Streaming-App-Optik
- große Bilder, ruhige Flächen, gut lesbare Erklärung
- keine unnötigen Rundungen oder Glows

Für neue Komponenten wird ein eigener, klar abgegrenzter CSS-Bereich ergänzt; bestehende KI-Seiten sollen nicht unbeabsichtigt verändert werden.

## Barrierefreiheit / Responsive

- vollständige Bedienbarkeit mit Tastatur
- sichtbare Focus-States
- Buttons mit verständlichen `aria-label`s
- Playerzustände nicht nur über Farbe vermitteln
- Bilder mit sinnvollen Alt-Texten
- mobile Darstellung ohne horizontales Scrollen
- Songstruktur bricht auf schmalen Displays sauber um
- `prefers-reduced-motion` respektieren, falls Animationen verwendet werden

## Fehlerfälle

- MP3 nicht erreichbar: klare Meldung statt leerem Player
- Bild nicht erreichbar: Layout bleibt stabil; Alt-Text bzw. Fallbackfläche
- Audio-Metadaten noch nicht geladen: Dauer zeigt zunächst neutralen Platzhalter
- JavaScript deaktiviert: natives Audioelement bzw. einfacher Direktlink bleibt als funktionaler Fallback zugänglich

## Sitemap / SEO

- `/ki-musik/` wird in `sitemap.xml` ergänzt
- Suno-Seite behält ihre bestehende kanonische URL
- neue KI-Musik-Übersicht erhält eigene Meta-/OpenGraph-Daten
- OpenGraph-Bild nutzt das Albumcover

## Tests / Validatoren

Neue automatisierbare Prüfungen sollen mindestens sicherstellen:
- Hauptnavigation enthält `KI-Musik`
- Suno-Link wurde aus `Über KI` entfernt
- `/ki-musik/` existiert
- Suno-Seite enthält `#hoerbeispiel`
- alle drei erwarteten Medienpfade sind im Markup korrekt referenziert
- Rechte-Links sind vorhanden
- Sitemap enthält `/ki-musik/`
- Player enthält Play/Pause, Fortschritt, Zeit, Lautstärke und Download-Funktion
- kein Autoplay
- aktive Navigation erkennt `/ki-musik/` und `/ki/musik/` als `KI-Musik`

Zusätzlich visueller Test nach Deployment:
- Desktop
- schmaleres Browserfenster
- Smartphone
- MP3-Start, Pause, Seek, Lautstärke und Download
- Fehlersituation bei nicht erreichbarer MP3

## Nicht Teil von Phase 1

- vollständiges Album auf Warenschmiede
- alle 11 Tracks als Playerliste
- WAV-Downloads
- seitenübergreifender globaler Musikplayer
- einzelne Suno-Links pro Track
- automatische Suno-API-Anbindung
- Benutzerkonten, Playlists oder Favoriten
- TunerXP.de-Albumseiten

## Wiederverwendung für TunerXP.de

Die Phase-1-Komponenten sollen später als Ausgangspunkt dienen für:
- Albumübersicht
- Albumdetailseite
- mehrere Songs pro Album
- Songbilder
- MP3-Player je Track
- „Album abspielen“
- Downloads
- Hintergrundtexte / Lyrics

Die Warenschmiede-Seite bleibt dabei Wissens- und Erklärbereich; TunerXP.de wird später der eigentliche persönliche Musik-/Album-Bereich.