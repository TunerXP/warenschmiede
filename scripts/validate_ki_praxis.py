#!/usr/bin/env python3
"""Validate the content contract for the KI Praxis page."""

from pathlib import Path
from html.parser import HTMLParser
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ki" / "so-arbeitest-du-mit-ki.html"
CSS = ROOT / "assets" / "css" / "ki-content.css"

REQUIRED_FRAGMENTS = (
    'rel="canonical" href="https://www.warenschmiede.com/ki/so-arbeitest-du-mit-ki.html"',
    'id="ws-header"',
    'id="ws-footer"',
    "/assets/js/ws-layout.js",
    'id="ki-praxis-ablauf"',
    'id="ki-praxis-anwendungen"',
    'id="ki-praxis-software"',
    "Fachlich geprüft: August 2026",
    'href="/ki/faq.html"',
    'href="/ki/im-betrieb.html"',
)

FORBIDDEN_FRAGMENTS = (
    "Dein erster KI-Song mit Suno",
    "Deine erste kleine C#-App",
    "Visual Studio 2022 Community",
)


class Element:
    """Small HTML tree used for validating the page's component contract."""

    def __init__(self, tag: str, attrs: dict[str, str]) -> None:
        self.tag = tag
        self.attrs = attrs
        self.children: list[Element] = []


class ElementParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Element("document", {})
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        element = Element(tag.lower(), {key: value or "" for key, value in attrs})
        self.stack[-1].children.append(element)
        if tag.lower() not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(element)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        element = Element(tag.lower(), {key: value or "" for key, value in attrs})
        self.stack[-1].children.append(element)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break


def descendants(element: Element) -> list[Element]:
    found = []
    for child in element.children:
        found.append(child)
        found.extend(descendants(child))
    return found


def classes(element: Element) -> set[str]:
    return set(element.attrs.get("class", "").split())


def main() -> int:
    errors = []
    if not PAGE.exists():
        errors.append("Seite fehlt: ki/so-arbeitest-du-mit-ki.html")
        html = ""
    else:
        html = PAGE.read_text(encoding="utf-8")

    for fragment in REQUIRED_FRAGMENTS:
        if fragment not in html:
            errors.append(f"Pflichtinhalt fehlt: {fragment}")

    for fragment in FORBIDDEN_FRAGMENTS:
        if fragment in html:
            errors.append(f"Veralteter Inhalt gefunden: {fragment}")

    css = CSS.read_text(encoding="utf-8")
    for selector in (".ki-praxis-steps", ".ki-praxis-step", ".ki-praxis-grid", ".ki-praxis-card", ".ki-content-status"):
        if selector not in css:
            errors.append(f"Praxis-Stil fehlt: {selector}")

    h1_count = len(re.findall(r"<h1(?:\s|>)", html, flags=re.IGNORECASE))
    if h1_count != 1:
        errors.append(f"Seite braucht genau eine H1 (gefunden: {h1_count})")

    parser = ElementParser()
    parser.feed(html)
    elements = descendants(parser.root)

    praxis_lists = [
        element for element in elements
        if element.tag == "ol" and "ki-praxis-steps" in classes(element)
    ]
    if len(praxis_lists) != 1:
        errors.append(
            "Praxis-Ablauf braucht genau eine geordnete Liste mit .ki-praxis-steps "
            f"(gefunden: {len(praxis_lists)})"
        )
    else:
        step_markers = [
            element for element in elements if "ki-praxis-step" in classes(element)
        ]
        direct_steps = [
            element for element in praxis_lists[0].children
            if element.tag == "li" and "ki-praxis-step" in classes(element)
        ]
        if len(step_markers) != 5 or len(direct_steps) != 5:
            errors.append(
                "Praxis-Ablauf braucht genau fünf direkte .ki-praxis-step-Listeneinträge "
                f"(gefunden: {len(direct_steps)} direkt, {len(step_markers)} insgesamt)"
            )

    praxis_grids = [element for element in elements if "ki-praxis-grid" in classes(element)]
    if len(praxis_grids) != 1:
        errors.append(f"Praxis-Anwendungen brauchen genau ein .ki-praxis-grid (gefunden: {len(praxis_grids)})")

    card_markers = [element for element in elements if "ki-praxis-card" in classes(element)]
    application_cards = [
        element for element in card_markers
        if element.tag == "article" and "card" in classes(element)
    ]
    if len(card_markers) != 4 or len(application_cards) != 4:
        errors.append(
            "Praxis-Anwendungen brauchen genau vier .ki-praxis-card-Artikel mit .card "
            f"(gefunden: {len(application_cards)} gültig, {len(card_markers)} markiert)"
        )

    if errors:
        print("KI Praxis: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI Praxis: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
