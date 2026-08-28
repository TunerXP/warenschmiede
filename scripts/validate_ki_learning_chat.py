#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    file = ROOT / path
    return file.read_text(encoding="utf-8") if file.exists() else None


def main():
    errors = []
    html = read("ki/chat.html")
    css = read("assets/css/ki-learning-chat.css")
    engine = read("assets/js/ki-learning-chat.js")
    data = read("assets/js/ki-learning-chat-data.js")
    nav = read("assets/js/ws-layout.js")

    if html is None:
        errors.append("ki/chat.html fehlt")
    else:
        for needle in (
            "/assets/css/ki-learning-chat.css",
            "/assets/js/ki-learning-chat-data.js",
            "/assets/js/ki-learning-chat.js",
            'id="learning-chat-sidebar"',
            'id="learning-chat-stream"',
            'id="learning-chat-composer"',
            'id="learning-chat-pause"',
            'id="learning-chat-next"',
            'id="learning-chat-restart"',
            "Interaktive Lernsimulation",
        ):
            if needle not in html:
                errors.append(f"chat.html: fehlt {needle}")
        for legacy in ("chat-container", "persona-overlay", "WhatsApp"):
            if legacy in html:
                errors.append(f"chat.html: Altstruktur noch vorhanden: {legacy}")

    if data is None:
        errors.append("ki-learning-chat-data.js fehlt")
    else:
        for chat_id in (
            "intro",
            "screenshot",
            "pdf",
            "safety",
            "rewrite",
            "research",
        ):
            if f'id: "{chat_id}"' not in data and f"id: '{chat_id}'" not in data:
                errors.append(f"Lern-Chat fehlt: {chat_id}")
        for step_type in ("compose", "attachment", "send", "working", "assistant", "lesson", "link", "checkpoint"):
            if f'type: "{step_type}"' not in data and f"type: '{step_type}'" not in data:
                errors.append(f"Schritttyp fehlt in Daten: {step_type}")

    if engine is None:
        errors.append("ki-learning-chat.js fehlt")
    else:
        for needle in ("sessionStorage", "selectChat", "pausePlayback", "continuePlayback", "restartChat", "toggleSidebar"):
            if needle not in engine:
                errors.append(f"Engine: {needle} fehlt")

    if css is None:
        errors.append("ki-learning-chat.css fehlt")
    else:
        for needle in ("@media", "prefers-reduced-motion", ".learning-chat-layout", ".learning-chat-sidebar"):
            if needle not in css:
                errors.append(f"CSS: {needle} fehlt")

    if nav is None:
        errors.append("ws-layout.js fehlt")
    else:
        if "KI kennenlernen" not in nav:
            errors.append("Navigation: KI kennenlernen fehlt")
        if "Erste Schritte & Tutorials" not in nav:
            errors.append("Navigation: Erste Schritte & Tutorials fehlt")
        einsteigen = re.search(r"label: 'Einsteigen'.*?\]\s*\}", nav, re.S)
        if einsteigen and "KI-Lexikon" in einsteigen.group(0):
            errors.append("Navigation: KI-Lexikon ist noch prominenter Einstiegseintrag")

    if errors:
        print("KI-Lern-Chat-Prüfung: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Lern-Chat-Prüfung: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
