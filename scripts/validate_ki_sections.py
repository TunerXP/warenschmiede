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
    "ChatGPT": ("ki/chats/chatgpt.html", "chatgpt"),
    "Gemini": ("ki/chats/gemini.html", "gemini"),
    "Claude": ("ki/chats/claude.html", "claude"),
    "Microsoft Copilot": ("ki/chats/copilot.html", "copilot"),
    "Perplexity": ("ki/chats/perplexity.html", "perplexity"),
}

HTML_PAGES = [
    "ki/tools.html",
    *(path for path, _ in DETAILS.values()),
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
        for name, (href, anchor) in DETAILS.items():
            if name not in overview:
                errors.append(f"Übersicht nennt {name} nicht")
            if f"/{href}" not in overview and href not in overview:
                errors.append(f"Übersicht verlinkt {href} nicht")
            if f'id="{anchor}"' not in overview:
                errors.append(f"Übersicht: Sprungziel #{anchor} fehlt")
        if 'id="suno"' not in overview:
            errors.append("Übersicht: Sprungziel #suno fehlt")

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

    for name, (page, anchor) in DETAILS.items():
        html = read(page)
        if html:
            if 'class="ki-detail-back"' not in html:
                errors.append(f"{name}: mitlaufender Zurück-Button fehlt")
            if f'href="/ki/tools.html#{anchor}"' not in html:
                errors.append(f"{name}: Rücksprung zu #{anchor} fehlt")

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
        if 'class="ki-detail-back"' not in suno:
            errors.append("Suno: mitlaufender Zurück-Button fehlt")
        if 'href="/ki-musik/"' not in suno:
            errors.append("Suno: Rücksprung zur KI-Musik-Übersicht fehlt")

    ki_css = read("assets/css/ki-content.css")
    if ki_css is None or ".ki-detail-back" not in ki_css:
        errors.append("ki-content.css: Stil für .ki-detail-back fehlt")
    elif "position: fixed" not in ki_css:
        errors.append("ki-content.css: Zurück-Button ist nicht fixed")

    chat_css = read("assets/css/ki-chats.css")
    if chat_css is None or "scroll-margin-top" not in chat_css:
        errors.append("ki-chats.css: scroll-margin-top für Rücksprung fehlt")

    if errors:
        print("KI-Strukturprüfung: FEHLER")
        for err in errors:
            print(f"- {err}")
        return 1

    print("KI-Strukturprüfung: OK")
    print(f"- Navigation: {len(MENU_EXPECTED)} Einträge")
    print(f"- Chat-KIs: {len(DETAILS)} Detailseiten")
    print(f"- HTML-Seiten geprüft: {len(HTML_PAGES)}")
    print("- Rücksprung-Navigation: Chat-KIs + Suno")
    return 0


if __name__ == "__main__":
    sys.exit(main())
