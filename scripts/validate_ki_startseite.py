#!/usr/bin/env python3
"""Prüft die KI-Startseite als kompakten Wegweiser ohne alte Medienbeispiele."""
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki" / "index.html"
SITEMAP = ROOT / "sitemap.xml"


def main():
    html = PAGE.read_text(encoding="utf-8")
    visible_text = html.replace("&amp;", "&")
    errors = []

    required = {
        "KI kennenlernen": "/ki/chat.html",
        "Erste Schritte & Tutorials": "/ki/tutorials/",
        "Arbeiten mit KI": "/ki/prompts.html",
        "Chancen, Risiken & Sicherheit": "/ki/chancen-und-risiken.html",
        "KI-Musik": "/ki-musik/",
    }
    for label, href in required.items():
        if label not in visible_text:
            errors.append(f"Einstieg fehlt: {label}")
        if href not in html:
            errors.append(f"Einstieg verlinkt nicht: {href}")

    for obsolete in (
        "ki-song-beispiel",
        "ki-story-beispiel",
        "ki-fuer-anfaenger-easy.mp3",
        "ki-zeitreise-donaueschingen.mp3",
        "Donaueschingen – Fünfzig Jahre später",
    ):
        if obsolete in html:
            errors.append(f"Altes Medienbeispiel ist noch vorhanden: {obsolete}")

    if html.count("<h1") != 1:
        errors.append("Startseite braucht genau eine H1")
    if 'id="ws-header"' not in html or 'id="ws-footer"' not in html:
        errors.append("Gemeinsames Layout fehlt")

    sitemap = SITEMAP.read_text(encoding="utf-8")
    expected_sitemap_entry = (
        "<loc>https://www.warenschmiede.com/ki/</loc>\n"
        "    <lastmod>2026-08-28</lastmod>"
    )
    if expected_sitemap_entry not in sitemap:
        errors.append("Sitemap-Zeitstempel der KI-Startseite ist nicht aktuell")

    if errors:
        print("KI-Startseite: FEHLER")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print("KI-Startseite: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
