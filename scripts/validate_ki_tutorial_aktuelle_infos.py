#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki/tutorials/aktuelle-informationen-quellen-pruefen.html"
INDEX = ROOT / "ki/tutorials/index.html"
SITEMAP = ROOT / "sitemap.xml"
IMAGE_DIR = ROOT / "assets/img/tutorials/ki/aktuelle-informationen-quellen-pruefen"

IMAGES = [
    "01-aktuelle-recherche-fragen.png",
    "02-antwort-mit-hinweis.png",
    "03-quellen-verlangen.png",
    "04-quelle-oeffnen.png",
    "05-quelle-pruefen.png",
    "06-ergebnis-verantwortlich-nutzen.png",
]


def main():
    errors = []
    page = PAGE.read_text(encoding="utf-8") if PAGE.exists() else ""
    index = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
    sitemap = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""

    if not PAGE.exists():
        errors.append("Tutorialseite ki/tutorials/aktuelle-informationen-quellen-pruefen.html fehlt")

    for image in IMAGES:
        if not (IMAGE_DIR / image).exists():
            errors.append(f"Recherche-Tutorialbild fehlt: {image}")
        if page and f"/assets/img/tutorials/ki/aktuelle-informationen-quellen-pruefen/{image}" not in page:
            errors.append(f"Bild fehlt in Tutorialseite: {image}")

    if page:
        for text in [
            "Aktuelle Informationen recherchieren und Quellen prüfen",
            "nicht jede KI kann live recherchieren",
            "Originalquelle",
            "nicht blind übernehmen",
            "offizielle Stellen",
            "Alle KI-Tutorials",
        ]:
            if text not in page:
                errors.append(f"Tutorialseite enthält Pflichttext nicht: {text}")
        if page.count('class="tutorial-step"') < 6:
            errors.append("Tutorialseite braucht mindestens sechs nummerierte Schritte")

    if "/ki/tutorials/aktuelle-informationen-quellen-pruefen.html" not in index:
        errors.append("Tutorial-Übersicht verlinkt aktuelle-informationen-quellen-pruefen.html noch nicht")
    if "Aktuelle Informationen recherchieren und Quellen prüfen" not in index:
        errors.append("Tutorial-Übersicht enthält die neue Recherche-Tutorial-Karte noch nicht")
    if "https://www.warenschmiede.com/ki/tutorials/aktuelle-informationen-quellen-pruefen.html" not in sitemap:
        errors.append("sitemap.xml enthält die neue Recherche-Tutorial-URL noch nicht")

    if errors:
        print("KI-Tutorial Aktuelle Informationen: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Tutorial Aktuelle Informationen: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
