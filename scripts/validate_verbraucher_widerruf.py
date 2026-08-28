#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "kontakt/verbraucherinformationen-widerruf.html"
ABLAUF = ROOT / "kontakt/ablauf-anfrage.html"
KONTAKT = ROOT / "kontakt/kontakt.html"
SITEMAP = ROOT / "sitemap.xml"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def main() -> int:
    errors = []
    page = read(PAGE)
    ablauf = read(ABLAUF)
    kontakt = read(KONTAKT)
    sitemap = read(SITEMAP)

    if not PAGE.exists():
        errors.append("Verbraucher-/Widerrufsseite fehlt")

    required_page = (
        "Verbraucherinformationen &amp; Widerruf",
        "§ 312g Abs. 2 Nr. 1 BGB",
        "14 Tage",
        "§ 356 Abs. 5 BGB",
        "§ 357a Abs. 2 BGB",
        "Muster-Widerrufsformular",
        "Ja, bitte beginnen",
        "info@warenschmiede.com",
        "Im Bohrer 7",
        "78166 Donaueschingen",
        "https://www.gesetze-im-internet.de/bgb/__312g.html",
        "https://www.gesetze-im-internet.de/bgb/__356.html",
        "https://www.gesetze-im-internet.de/bgb/__357a.html",
        "https://www.gesetze-im-internet.de/bgbeg/art_253anlage_2.html",
    )
    for needle in required_page:
        if needle not in page:
            errors.append(f"Verbraucherseite fehlt: {needle}")

    page_href = "verbraucherinformationen-widerruf.html"
    if page_href not in ablauf:
        errors.append("Ablauf-Seite verlinkt Verbraucherinformationen nicht")
    if page_href not in kontakt:
        errors.append("Kontaktseite verlinkt Verbraucherinformationen nicht")

    if "Privatkunden" not in ablauf or "Widerruf" not in ablauf:
        errors.append("Ablauf-Seite erklärt den Privatkunden-/Widerrufshinweis nicht sichtbar")

    sitemap_url = "https://www.warenschmiede.com/kontakt/verbraucherinformationen-widerruf.html"
    if sitemap_url not in sitemap:
        errors.append("Sitemap enthält Verbraucher-/Widerrufsseite nicht")

    if errors:
        print("Verbraucherinformationen & Widerruf: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Verbraucherinformationen & Widerruf: OK")
    print("- eigene Informationsseite vorhanden")
    print("- individuelle Waren und Dienstleistungen getrennt erklärt")
    print("- vorzeitiger Dienstleistungsbeginn und Wertersatz erwähnt")
    print("- Muster-Widerrufsformular vorhanden")
    print("- Ablauf, Kontakt und Sitemap verlinken die Seite")
    return 0


if __name__ == "__main__":
    sys.exit(main())
