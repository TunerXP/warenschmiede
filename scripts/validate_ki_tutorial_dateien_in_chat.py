#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki/tutorials/dateien-in-chat.html"
INDEX = ROOT / "ki/tutorials/index.html"
SITEMAP = ROOT / "sitemap.xml"

IMAGES = [
    "01_datei_bereithalten.png",
    "02_ki_chat_oeffnen.png",
    "03_datei_in_den_chat_ziehen.png",
    "04_datei_ist_angehaengt.png",
    "05_aufgabe_dazuschreiben.png",
    "06_antwort_lesen_und_nachfragen.png",
]


def main():
    errors = []

    if not PAGE.exists():
        errors.append("Tutorialseite ki/tutorials/dateien-in-chat.html fehlt")
        page = ""
    else:
        page = PAGE.read_text(encoding="utf-8")

    index = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
    sitemap = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""

    if page:
        required_text = [
            "Dateien in einen KI-Chat einfügen",
            "Drag & Drop",
            "Keine Passwörter",
            "vertrauliche Firmenunterlagen",
            "personenbezogenen Daten",
            "Alle KI-Tutorials",
        ]
        for text in required_text:
            if text not in page:
                errors.append(f"Tutorialseite enthält Pflichttext nicht: {text}")

        if page.count('class="tutorial-step"') < 6:
            errors.append("Tutorialseite braucht mindestens sechs nummerierte Schritte")

        for image in IMAGES:
            expected = f"/assets/img/tutorials/ki/dateien-in-chat/{image}"
            if expected not in page:
                errors.append(f"Bild fehlt in Tutorialseite: {image}")

    if '/ki/tutorials/dateien-in-chat.html' not in index:
        errors.append("Tutorial-Übersicht verlinkt dateien-in-chat.html noch nicht")

    if "Dateien in einen KI-Chat einfügen" not in index:
        errors.append("Tutorial-Übersicht enthält die neue Tutorial-Karte noch nicht")

    if "https://www.warenschmiede.com/ki/tutorials/dateien-in-chat.html" not in sitemap:
        errors.append("sitemap.xml enthält die neue Tutorial-URL noch nicht")

    if errors:
        print("KI-Tutorial Dateien-in-Chat: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Tutorial Dateien-in-Chat: OK")
    print("- Tutorialseite vorhanden")
    print("- sechs Bilder eingebunden")
    print("- Sicherheits- und Drag-&-Drop-Hinweise vorhanden")
    print("- Tutorial-Übersicht verlinkt")
    print("- Sitemap ergänzt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
