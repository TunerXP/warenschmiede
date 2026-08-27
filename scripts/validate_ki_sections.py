#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

MENU_EXPECTED = {
    "KI im Alltag": "ki/prompts.html",
    "Aktuelle KI-Chats": "ki/tools.html",
    "KI-Musik mit Suno": "ki/musik/suno.html",
}

DETAILS = {
    "ChatGPT": "ki/chats/chatgpt.html",
    "Gemini": "ki/chats/gemini.html",
    "Claude": "ki/chats/claude.html",
    "Microsoft Copilot": "ki/chats/copilot.html",
    "Perplexity": "ki/chats/perplexity.html",
}

HTML_PAGES = [
    "ki/tools.html",
    *DETAILS.values(),
    "ki/musik/suno.html",
]


def read(path):
    p = ROOT / path
    if not p.exists():
        return None
    return p.read_text(encoding="utf-8")


def main():
    errors = []

    nav = read("assets/js/ws-layout.js")
    if nav is None:
        errors.append("assets/js/ws-layout.js fehlt")
    else:
        for label, href in MENU_EXPECTED.items():
            if label not in nav:
                errors.append(f"Menüeintrag fehlt: {label}")
            if href not in nav:
                errors.append(f"Menü-URL fehlt: {href}")

    overview = read("ki/tools.html")
    if overview is None:
        errors.append("ki/tools.html fehlt")
    else:
        for name, href in DETAILS.items():
            if name not in overview:
                errors.append(f"Übersicht nennt {name} nicht")
            if f"/{href}" not in overview and href not in overview:
                errors.append(f"Übersicht verlinkt {href} nicht")

    for page in HTML_PAGES:
        html = read(page)
        if html is None:
            errors.append(f"{page} fehlt")
            continue
        if len(re.findall(r"<h1(?:\s|>)", html, re.I)) != 1:
            errors.append(f"{page}: erwartet genau ein <h1>")
        if 'rel="canonical"' not in html and "rel='canonical'" not in html:
            errors.append(f"{page}: canonical fehlt")
        if 'id="ws-header"' not in html:
            errors.append(f"{page}: ws-header fehlt")
        if 'id="ws-footer"' not in html:
            errors.append(f"{page}: ws-footer fehlt")
        if "/assets/js/ws-layout.js" not in html:
            errors.append(f"{page}: ws-layout.js fehlt")

    chatgpt = read("ki/chats/chatgpt.html")
    if chatgpt:
        for term in ("Work", "Deep Research", "Plugins", "Codex"):
            if term not in chatgpt:
                errors.append(f"ChatGPT-Seite: {term} fehlt")

    suno = read("ki/musik/suno.html")
    if suno:
        for term in ("v5.5", "Studio 2.0", "MIDI", "Chat Bar", "Stem"):
            if term not in suno:
                errors.append(f"Suno-Seite: {term} fehlt")

    if errors:
        print("KI-Strukturprüfung: FEHLER")
        for err in errors:
            print(f"- {err}")
        return 1

    print("KI-Strukturprüfung: OK")
    print(f"- Navigation: {len(MENU_EXPECTED)} Einträge")
    print(f"- Chat-KIs: {len(DETAILS)} Detailseiten")
    print(f"- HTML-Seiten geprüft: {len(HTML_PAGES)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
