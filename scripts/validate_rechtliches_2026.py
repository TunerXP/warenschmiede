#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
IMPRESSUM = ROOT / "kontakt/impressum.html"
DATENSCHUTZ = ROOT / "datenschutz.html"
KONTAKT = ROOT / "kontakt/kontakt.html"


def main():
    errors = []
    impressum = IMPRESSUM.read_text(encoding="utf-8")
    datenschutz = DATENSCHUTZ.read_text(encoding="utf-8")
    kontakt = KONTAKT.read_text(encoding="utf-8")

    required_impressum = (
        "§ 5 DDG",
        "Verbraucherstreitbeilegung",
        "nicht verpflichtet und nicht bereit",
        "Stand: 28. August 2026",
    )
    for text in required_impressum:
        if text not in impressum:
            errors.append(f"Impressum fehlt: {text}")

    forbidden_impressum = (
        "§ 5 TMG",
        "ODR-VO",
        "ec.europa.eu/consumers/odr",
        "Online-Streitbeilegung",
    )
    for text in forbidden_impressum:
        if text in impressum:
            errors.append(f"Impressum enthält veralteten Hinweis: {text}")

    required_privacy = (
        "IONOS SE",
        "Elgendorfer Str. 57",
        "56410 Montabaur",
        "IONOS WebAnalytics",
        "anonymisierter Form",
        "8 Wochen",
        "WhatsApp Ireland Limited",
        "WhatsApp-Datenschutzrichtlinie",
        "sessionStorage",
        "localStorage",
        "Stand: 28. August 2026",
    )
    for text in required_privacy:
        if text not in datenschutz:
            errors.append(f"Datenschutz fehlt: {text}")

    forbidden_privacy = (
        "GitHub Pages",
        "Keine Cookies &amp; kein Tracking",
        "Keine Cookies & kein Tracking",
    )
    for text in forbidden_privacy:
        if text in datenschutz:
            errors.append(f"Datenschutz enthält veraltete Aussage: {text}")

    if "Keine Weitergabe an Dritte, kein Tracking und keine Werbelisten." in kontakt:
        errors.append("Kontaktseite enthält weiterhin die zu pauschale Drittanbieter-Aussage")
    if "WhatsApp" not in kontakt or "Datenschutzerklärung" not in kontakt:
        errors.append("Kontaktseite weist bei WhatsApp nicht transparent auf Datenschutz hin")

    if errors:
        print("Rechtliches 2026: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Rechtliches 2026: OK")
    print("- Impressum auf DDG und aktuelle Streitbeilegung aktualisiert")
    print("- IONOS Webhosting/WebAnalytics transparent beschrieben")
    print("- WhatsApp und lokale Browser-Speicherung ergänzt")
    print("- pauschale Drittanbieter-Aussage auf Kontaktseite korrigiert")
    return 0


if __name__ == "__main__":
    sys.exit(main())
