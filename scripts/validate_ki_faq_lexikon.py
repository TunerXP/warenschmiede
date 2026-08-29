#!/usr/bin/env python3
"""Validate the new KI safety, lexicon and overview content contract."""

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
FAQ = ROOT / "ki" / "faq.html"
LEXICON = ROOT / "ki" / "lexikon.html"
OVERVIEW = ROOT / "ki" / "index.html"
CSS = ROOT / "assets" / "css" / "ki-content.css"
LAYOUT = ROOT / "assets" / "js" / "ws-layout.js"
REFERRERS = (
    ROOT / "ki" / "prompts.html",
    ROOT / "ki" / "im-betrieb.html",
    ROOT / "ki" / "chancen-und-risiken.html",
)


def require(html: str, fragments: tuple[str, ...], label: str, errors: list[str]) -> None:
    for fragment in fragments:
        if fragment not in html:
            errors.append(f"{label}: Pflichtinhalt fehlt: {fragment}")


def main() -> int:
    errors: list[str] = []
    faq = FAQ.read_text(encoding="utf-8")
    lexicon = LEXICON.read_text(encoding="utf-8")
    overview = OVERVIEW.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    layout = LAYOUT.read_text(encoding="utf-8")

    require(faq, (
        'id="ki-sicher-nutzen"',
        'id="ki-arbeit-veraendert"',
        'KI ersetzt selten einen ganzen Beruf auf einmal.',
        'href="/ki/im-betrieb.html"',
        'https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure',
        'https://www.oecd.org/en/publications/oecd-employment-outlook-2025_194a947b-en/full-report/component-7.html',
    ), "KI sicher nutzen", errors)
    if "faq-accordion" in faq or "<details" in faq:
        errors.append("KI sicher nutzen: der alte Aufklapp-FAQ-Aufbau darf nicht mehr enthalten sein")

    require(lexicon, ('id="ki-top-10"', 'KI beim Programmieren', 'KI mit eigenen Unterlagen'), "KI-Lexikon", errors)
    term_cards = re.findall(r'<article class="ki-term(?: ki-term--reverse)?"', lexicon)
    if len(term_cards) != 10:
        errors.append(f"KI-Lexikon: genau zehn Top-Begriff-Karten erwartet (gefunden: {len(term_cards)})")
    image_sources = re.findall(r'src="(/assets/img/ki/begriffe/[^\"]+\.png)"', lexicon)
    expected_images = {f"/assets/img/ki/begriffe/{number:02d}-{name}.png" for number, name in (
        (1, "prompt"), (2, "generative-ki"), (3, "ki-modell"), (4, "halluzination"), (5, "kontext"),
        (6, "multimodale-ki"), (7, "ki-agent"), (8, "rag"), (9, "vibe-coding"), (10, "datenschutz"),
    )}
    if set(image_sources) != expected_images:
        errors.append("KI-Lexikon: alle zehn bereitgestellten Begriffsbilder müssen genau einmal eingebunden sein")

    require(overview, ('id="ki-begriffe-heading"', 'ki-term-teaser', 'href="/ki/lexikon.html"'), "KI-Übersicht", errors)
    if len(re.findall(r'class="ki-term-teaser"', overview)) != 4:
        errors.append("KI-Übersicht: genau vier ruhige Begriff-Teaser erwartet")
    require(overview, ('<h3>KI sicher nutzen</h3>',), "KI-Übersicht", errors)
    require(layout, ("label: 'KI sicher nutzen'",), "KI-Navigation", errors)
    for referrer in REFERRERS:
        referrer_html = referrer.read_text(encoding="utf-8")
        if 'href="/ki/faq.html"' in referrer_html and "KI-FAQ" in referrer_html:
            errors.append(f"{referrer.relative_to(ROOT)}: alter Linktext KI-FAQ muss umbenannt werden")

    for selector in (".ki-term", ".ki-term--reverse", ".ki-work-shift", ".ki-work-shift__item", ".ki-term-teaser"):
        if selector not in css:
            errors.append(f"KI-Stil fehlt: {selector}")
    for fragment in (
        ".ki-term-teaser-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))",
        ".ki-term-teaser img{display:block;width:100%;height:clamp(220px,23vw,330px)",
        "@media(max-width:760px){.ki-term{grid-template-columns:1fr}.ki-term--reverse .ki-term__visual{order:0}.ki-term-teaser-grid{grid-template-columns:1fr}",
    ):
        if fragment not in css:
            errors.append(f"KI-Übersicht: Querformat-Layout fehlt: {fragment}")

    for page, html in (("KI sicher nutzen", faq), ("KI-Lexikon", lexicon), ("KI-Übersicht", overview)):
        if len(re.findall(r"<h1(?:\s|>)", html, flags=re.IGNORECASE)) != 1:
            errors.append(f"{page}: Seite braucht genau eine H1")

    if errors:
        print("KI FAQ & Lexikon: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI FAQ & Lexikon: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
