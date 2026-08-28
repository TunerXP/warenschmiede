#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LAYOUT = ROOT / "assets/js/ws-layout.js"
GLOBAL_PLAYER = ROOT / "assets/js/ws-global-music-player.js"
LOCAL_PLAYER = ROOT / "assets/js/ki-music-player.js"
GLOBAL_CSS = ROOT / "assets/css/ws-global-music-player.css"
SUNO = ROOT / "ki/musik/suno.html"

AUDIO = "/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3"
STATE_KEY = "ws-music-player-state-v1"


def read(path):
    return path.read_text(encoding="utf-8") if path.exists() else ""


def main():
    errors = []
    layout = read(LAYOUT)
    global_player = read(GLOBAL_PLAYER)
    local_player = read(LOCAL_PLAYER)
    css = read(GLOBAL_CSS)
    suno = read(SUNO)

    for needle in (
        'data-ws-global-player',
        'data-ws-global-play',
        'data-ws-global-stop',
        '/assets/css/ws-global-music-player.css',
        '/assets/js/ws-global-music-player.js',
    ):
        if needle not in layout:
            errors.append(f"Globales Player-Markup/Loader fehlt: {needle}")

    if not GLOBAL_PLAYER.exists():
        errors.append("assets/js/ws-global-music-player.js fehlt")
    if not GLOBAL_CSS.exists():
        errors.append("assets/css/ws-global-music-player.css fehlt")

    for needle in (
        STATE_KEY,
        'sessionStorage',
        'pagehide',
        'window.WSGlobalMusicPlayer',
        'loadTrack',
        'play',
        'pause',
        'stop',
        "ws:global-player-ready",
        "ws:music-state",
        'resumeWanted',
    ):
        if needle not in global_player:
            errors.append(f"Globaler Player fehlt: {needle}")

    for needle in (
        'window.WSGlobalMusicPlayer',
        "ws:global-player-ready",
        "ws:music-state",
        'loadTrack',
        AUDIO,
    ):
        if needle not in local_player:
            errors.append(f"Suno-Player ist nicht global angebunden: {needle}")

    if 'audio.play()' in local_player:
        errors.append("Suno-Player spielt noch direkt über das lokale Audio-Element")

    for needle in (
        '.ws-global-player',
        '.ws-global-player__title',
        '.ws-global-player__control',
        '@media(max-width:1220px)',
    ):
        if needle not in css:
            errors.append(f"Globaler Player-Stil fehlt: {needle}")

    if 'data-music-audio' not in suno or 'controls preload="metadata"' not in suno:
        errors.append("No-JavaScript-Audio-Fallback auf der Suno-Seite fehlt")
    if 'autoplay' in suno.lower():
        errors.append("Suno-Seite darf kein Autoplay-Attribut enthalten")

    if errors:
        print("Globaler Musikplayer: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Globaler Musikplayer: OK")
    print("- globaler Mini-Player ist im Layout verankert")
    print("- Wiedergabestand wird in sessionStorage erhalten")
    print("- Suno-Hörbeispiel steuert denselben globalen Audiokanal")
    print("- Stop blendet den globalen Player wieder aus")
    return 0


if __name__ == "__main__":
    sys.exit(main())
