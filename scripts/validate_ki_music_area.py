#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LAYOUT = ROOT / "assets/js/ws-layout.js"
OVERVIEW = ROOT / "ki-musik/index.html"
SUNO = ROOT / "ki/musik/suno.html"
PLAYER_JS = ROOT / "assets/js/ki-music-player.js"
GLOBAL_PLAYER_JS = ROOT / "assets/js/ws-global-music-player.js"
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
    global_player = read(GLOBAL_PLAYER_JS)
    sitemap = read(SITEMAP)

    if "label: 'KI-Musik'" not in layout:
        errors.append("Hauptnavigation enthält KI-Musik noch nicht")
    if "key: 'ki-musik'" not in layout:
        errors.append("KI-Musik hat keinen eigenen Navigations-Key")
    if "{ label: 'KI-Musik mit Suno', href: 'ki/musik/suno.html'" in layout.split("key: 'ki-musik'")[0]:
        errors.append("Suno hängt noch im Über-KI-Menü")
    if "currentPath.includes('/ki-musik/')" not in layout or "currentPath.includes('/ki/musik/')" not in layout:
        errors.append("Aktivzustand für beide Musik-Pfade fehlt")
    if "{ label: 'Mein Suno-Profil', href: 'https://suno.com/@tunerxp', newTab: true" not in layout:
        errors.append("Suno-Profil ist nicht als neuer Tab markiert")
    if "item.newTab ? ' target=\"_blank\" rel=\"noopener noreferrer\"' : ''" not in layout:
        errors.append("Navigation rendert neue Tabs nicht sicher")

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

    if "window.WSGlobalMusicPlayer" not in player:
        errors.append("Suno-Player ist nicht an den globalen Audiokanal angebunden")

    for needle in ("audio.play()", "audio.pause()", "loadedmetadata", "timeupdate", "volume"):
        if needle not in global_player:
            errors.append(f"Globaler Player-JS fehlt: {needle}")

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
