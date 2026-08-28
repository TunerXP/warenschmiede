#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "ki/chat.html"
CSS = ROOT / "assets/css/ki-learning-chat-direct.css"


def main():
    errors = []
    html = HTML.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8") if CSS.exists() else ""

    for legacy in (
        'class="learning-chat-intro"',
        'id="learning-chat-page-title"',
        "KI kennenlernen – direkt im Gespräch",
        "Interaktive Lernsimulation",
    ):
        if legacy in html:
            errors.append(f"Einleitungsblock noch vorhanden: {legacy}")

    if '/assets/css/ki-learning-chat-direct.css' not in html:
        errors.append("Direkteinstieg-CSS ist nicht eingebunden")

    breadcrumb_pos = html.find('class="breadcrumbs"')
    main_pos = html.find('class="learning-chat-main"')
    layout_pos = html.find('class="learning-chat-layout"')
    if min(breadcrumb_pos, main_pos, layout_pos) < 0 or not (breadcrumb_pos < main_pos < layout_pos):
        errors.append("Breadcrumb, Main und Lern-Chat stehen nicht direkt in sinnvoller Reihenfolge")

    if not re.search(r"\.learning-chat-main\s*\{[^}]*padding-top\s*:\s*(?:8|10|12|14)px", css, re.S):
        errors.append("Oberer Abstand des Lern-Chats ist nicht kompakt gesetzt")

    layout = re.search(r"\.learning-chat-layout\s*\{(?P<body>.*?)\}", css, re.S)
    if not layout or not re.search(r"height\s*:\s*clamp\(", layout.group("body")):
        errors.append("Chat-Höhe nutzt den gewonnenen Platz nicht viewportabhängig")

    if errors:
        print("KI-Lern-Chat-Direkteinstieg: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Lern-Chat-Direkteinstieg: OK")
    print("- großer Einleitungsblock entfernt")
    print("- Breadcrumb bleibt erhalten")
    print("- Chat beginnt direkt darunter")
    print("- mehr Browserhöhe steht dem Chat zur Verfügung")
    return 0


if __name__ == "__main__":
    sys.exit(main())
