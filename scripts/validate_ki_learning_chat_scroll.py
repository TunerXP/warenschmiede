#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "assets/css/ki-learning-chat.css"


def css_block(css, selector):
    match = re.search(rf"{re.escape(selector)}\s*\{{(?P<body>.*?)\}}", css, re.S)
    return match.group("body") if match else None


def has_rule(block, property_name, value_pattern):
    if block is None:
        return False
    return re.search(
        rf"(?m)^\s*{re.escape(property_name)}\s*:\s*{value_pattern}\s*;",
        block,
    ) is not None


def main():
    css = CSS.read_text(encoding="utf-8")
    errors = []

    layout = css_block(css, ".learning-chat-layout")
    panel = css_block(css, ".learning-chat-panel")
    stream = css_block(css, ".learning-chat-stream")

    if layout is None:
        errors.append(".learning-chat-layout fehlt")
    else:
        if not has_rule(
            layout,
            "height",
            r"clamp\(640px,\s*calc\(100vh\s*-\s*210px\),\s*900px\)",
        ):
            errors.append("Lern-Chat braucht eine feste, viewportabhängige Höhe")
        if has_rule(
            layout,
            "min-height",
            r"clamp\(640px,\s*calc\(100vh\s*-\s*210px\),\s*900px\)",
        ):
            errors.append("Die alte mitwachsende min-height-Regel darf nicht mehr verwendet werden")

    if panel is None:
        errors.append(".learning-chat-panel fehlt")
    else:
        if not has_rule(panel, "min-height", r"0"):
            errors.append("Chat-Panel braucht min-height: 0 für internes Grid-Scrolling")
        if not has_rule(panel, "overflow", r"hidden"):
            errors.append("Chat-Panel muss überlaufenden Seiteninhalt begrenzen")

    if stream is None:
        errors.append(".learning-chat-stream fehlt")
    else:
        if not has_rule(stream, "min-height", r"0"):
            errors.append("Nachrichtenstrom braucht min-height: 0")
        if not has_rule(stream, "overflow-y", r"auto"):
            errors.append("Nachrichtenstrom muss vertikal scrollbar bleiben")
        if not has_rule(stream, "overscroll-behavior", r"contain"):
            errors.append("Nachrichtenstrom soll Scrollen innerhalb des Chats halten")

    if errors:
        print("KI-Lern-Chat-Scrollprüfung: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Lern-Chat-Scrollprüfung: OK")
    print("- Chat-Arbeitsfläche hat feste viewportabhängige Höhe")
    print("- Nur der Nachrichtenstrom scrollt innerhalb des Panels")
    return 0


if __name__ == "__main__":
    sys.exit(main())
