#!/usr/bin/env python3
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki" / "im-betrieb.html"
NAVIGATION = ROOT / "assets" / "js" / "ws-layout.js"
SITEMAP = ROOT / "sitemap.xml"


def main():
    errors = []
    if not PAGE.exists():
        errors.append("Seite fehlt: ki/im-betrieb.html")
        html = ""
    else:
        html = PAGE.read_text(encoding="utf-8")
    navigation = NAVIGATION.read_text(encoding="utf-8")
    sitemap = SITEMAP.read_text(encoding="utf-8")
    if "KI im Betrieb" not in navigation or "ki/im-betrieb.html" not in navigation:
        errors.append("Menülink fehlt: KI im Betrieb")
    if "https://www.warenschmiede.com/ki/im-betrieb.html" not in sitemap:
        errors.append("Sitemap-Eintrag fehlt: KI im Betrieb")
    for required in (
        'rel="canonical" href="https://www.warenschmiede.com/ki/im-betrieb.html"',
        'id="ws-header"', 'id="ws-footer"', '/assets/js/ws-layout.js',
        'ki-workplace-print', 'class="ki-workplace-rules"',
        'Fachlich geprüft: August 2026',
        'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4',
        'https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3',
        'https://www.bfdi.bund.de/DE/BfDI/Konsultationsverfahren/KI-Modelle-pbD/KI-Modelle-pbD_node.html',
    ):
        if required not in html:
            errors.append(f"Pflichtinhalt fehlt: {required}")
    if html.count("<h1") != 1:
        errors.append("Seite braucht genau eine H1")
    rules_match = re.search(r'<ol class="ki-workplace-rules">(.*?)</ol>', html, re.DOTALL)
    rules = re.findall(r'<li>(.*?)</li>', rules_match.group(1), re.DOTALL) if rules_match else []
    if len(rules) != 10:
        errors.append("Druckvorlage enthält nicht genau zehn Regeln")
    for forbidden in ("WESTA", "rechtssicher", "zertifiziert", "Compliance-Garantie"):
        if forbidden.lower() in html.lower():
            errors.append(f"Nicht neutrale Aussage gefunden: {forbidden}")
    css = (ROOT / "assets" / "css" / "ki-workplace.css").read_text(encoding="utf-8")
    if "@media print" not in css or ".ki-workplace-print" not in css:
        errors.append("Druckstil fehlt")
    if ".site-main > :not(.ki-workplace-print)" not in css:
        errors.append("Druckansicht blendet nicht alle Nicht-Vorlagenbereiche aus")

    if errors:
        print("KI im Betrieb: FEHLER")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print("KI im Betrieb: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
