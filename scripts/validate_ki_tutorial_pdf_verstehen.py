#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki/tutorials/pdf-verstehen.html"
INDEX = ROOT / "ki/tutorials/index.html"
SITEMAP = ROOT / "sitemap.xml"
IMAGE_DIR = ROOT / "assets/img/tutorials/ki/pdf-verstehen"

IMAGES = [
    "01_pdf_bereithalten.png",
    "02_pdf_anhaengen.png",
    "03_zusammenfassung_anfordern.png",
    "04_zusammenfassung_lesen.png",
    "05_wichtige_stelle_erklaeren.png",
    "06_weiter_nachfragen.png",
]

STALE_IMAGES = [
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
        errors.append("Tutorialseite ki/tutorials/pdf-verstehen.html fehlt")
        page = ""
    else:
        page = PAGE.read_text(encoding="utf-8")

    index = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
    sitemap = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""

    for image in IMAGES:
        image_path = IMAGE_DIR / image
        if not image_path.exists():
            errors.append(f"PDF-Tutorialbild fehlt: {image}")
        if page:
            expected = f"/assets/img/tutorials/ki/pdf-verstehen/{image}"
            if expected not in page:
                errors.append(f"Bild fehlt in Tutorialseite: {image}")

    for stale in STALE_IMAGES:
        if (IMAGE_DIR / stale).exists():
            errors.append(f"Falsches Bild aus vorherigem Tutorial liegt noch im PDF-Ordner: {stale}")

    if page:
        required_text = [
            "Eine PDF mit KI verstehen",
            "Zusammenfassung",
            "wichtige Stelle",
            "Keine Passwörter",
            "vertraulichen Firmenunterlagen",
            "personenbezogenen Daten",
            "Alle KI-Tutorials",
        ]
        for text in required_text:
            if text not in page:
                errors.append(f"Tutorialseite enthält Pflichttext nicht: {text}")

        if page.count('class="tutorial-step"') < 6:
            errors.append("Tutorialseite braucht mindestens sechs nummerierte Schritte")

    if '/ki/tutorials/pdf-verstehen.html' not in index:
        errors.append("Tutorial-Übersicht verlinkt pdf-verstehen.html noch nicht")

    if "Eine PDF mit KI verstehen" not in index:
        errors.append("Tutorial-Übersicht enthält die neue PDF-Tutorial-Karte noch nicht")

    if "https://www.warenschmiede.com/ki/tutorials/pdf-verstehen.html" not in sitemap:
        errors.append("sitemap.xml enthält die neue PDF-Tutorial-URL noch nicht")

    if errors:
        print("KI-Tutorial PDF-verstehen: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Tutorial PDF-verstehen: OK")
    print("- sechs korrekte PDF-Bilder vorhanden")
    print("- alte falsche Bilder entfernt")
    print("- Tutorialseite mit sechs Schritten vorhanden")
    print("- Sicherheits-Hinweise vorhanden")
    print("- Tutorial-Übersicht verlinkt")
    print("- Sitemap ergänzt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
