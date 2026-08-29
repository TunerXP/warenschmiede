#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki/tutorials/text-gemeinsam-verbessern.html"
INDEX = ROOT / "ki/tutorials/index.html"
SITEMAP = ROOT / "sitemap.xml"
IMAGE_DIR = ROOT / "assets/img/tutorials/ki/text-gemeinsam-verbessern"

IMAGES = [
    "01-entwurf-und-erster-vorschlag.png",
    "02-zwei-varianten.png",
    "03-variante-anpassen.png",
    "04-info-ergaenzen.png",
    "05-ton-und-rechtschreibung-pruefen.png",
    "06-fertigen-text-uebernehmen.png",
]


def main():
    errors = []
    page = PAGE.read_text(encoding="utf-8") if PAGE.exists() else ""
    index = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
    sitemap = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""

    if not PAGE.exists():
        errors.append("Tutorialseite ki/tutorials/text-gemeinsam-verbessern.html fehlt")

    for image in IMAGES:
        if not (IMAGE_DIR / image).exists():
            errors.append(f"Text-Tutorialbild fehlt: {image}")
        if page and f"/assets/img/tutorials/ki/text-gemeinsam-verbessern/{image}" not in page:
            errors.append(f"Bild fehlt in Tutorialseite: {image}")

    if page:
        for text in [
            "Mit KI einen Text gemeinsam verbessern",
            "nicht blind übernehmen",
            "Verantwortung",
            "Fakten",
            "Alle KI-Tutorials",
        ]:
            if text not in page:
                errors.append(f"Tutorialseite enthält Pflichttext nicht: {text}")
        if page.count('class="tutorial-step"') < 6:
            errors.append("Tutorialseite braucht mindestens sechs nummerierte Schritte")

    if "/ki/tutorials/text-gemeinsam-verbessern.html" not in index:
        errors.append("Tutorial-Übersicht verlinkt text-gemeinsam-verbessern.html noch nicht")
    if "Mit KI einen Text gemeinsam verbessern" not in index:
        errors.append("Tutorial-Übersicht enthält die neue Text-Tutorial-Karte noch nicht")
    if "https://www.warenschmiede.com/ki/tutorials/text-gemeinsam-verbessern.html" not in sitemap:
        errors.append("sitemap.xml enthält die neue Text-Tutorial-URL noch nicht")

    if errors:
        print("KI-Tutorial Text verbessern: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Tutorial Text verbessern: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
