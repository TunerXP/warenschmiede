#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE_CSS = ROOT / "assets/css/ki-learning-chat.css"
GLASS_CSS = ROOT / "assets/css/ki-learning-chat-glass.css"
CHAT_HTML = ROOT / "ki/chat.html"


def block(css: str, selector: str):
    matches = list(re.finditer(re.escape(selector) + r"\s*\{(?P<body>.*?)\}", css, re.S))
    return matches[-1].group("body") if matches else None


def has_radius(body: str | None, minimum: int):
    if body is None:
        return False
    match = re.search(r"border-radius\s*:\s*(\d+)px", body)
    return bool(match and int(match.group(1)) >= minimum)


def main():
    errors = []

    if not GLASS_CSS.exists():
        print("KI-Lern-Chat-Glasstil: FEHLER")
        print("- assets/css/ki-learning-chat-glass.css fehlt")
        return 1

    html = CHAT_HTML.read_text(encoding="utf-8")
    if "/assets/css/ki-learning-chat-glass.css" not in html:
        errors.append("chat.html bindet die Glasstil-Schicht nicht ein")

    base_css = BASE_CSS.read_text(encoding="utf-8")
    glass_css = GLASS_CSS.read_text(encoding="utf-8")
    css = base_css + "\n" + glass_css

    layout = block(css, ".learning-chat-layout")
    sidebar = block(css, ".learning-chat-sidebar")
    nav = block(css, ".learning-chat-nav-item")
    active = block(css, ".learning-chat-nav-item.is-active")
    bubble = block(css, ".learning-chat-bubble")
    assistant = block(css, ".learning-chat-bubble--assistant")
    user = block(css, ".learning-chat-bubble--user")
    attachment = block(css, ".learning-chat-attachment")
    composer = block(css, ".learning-chat-composer-row")
    stream = block(css, ".learning-chat-stream")

    if not has_radius(layout, 24):
        errors.append("Chat-Arbeitsfläche braucht weiche Rundung (>= 24px)")
    if sidebar is None or "backdrop-filter" not in sidebar:
        errors.append("Sidebar braucht Glas-Effekt via backdrop-filter")

    if not has_radius(nav, 18):
        errors.append("Lern-Chat-Auswahl braucht Karten-Rundung (>= 18px)")
    if nav is None or "linear-gradient" not in nav or "box-shadow" not in nav:
        errors.append("Lern-Chat-Auswahl braucht weiche Verlaufsfläche und Schatten")
    if active is None or "linear-gradient" not in active or "box-shadow" not in active:
        errors.append("Aktiver Lern-Chat braucht hervorgehobenen Glas-Kartenstil")

    if not has_radius(bubble, 22):
        errors.append("Sprechblasen brauchen Rundung (>= 22px)")
    if bubble is None or "backdrop-filter" not in bubble or "box-shadow" not in bubble:
        errors.append("Sprechblasen brauchen Glas-Effekt und weichen Schatten")
    if assistant is None or "linear-gradient" not in assistant or "border-top-left-radius" not in assistant:
        errors.append("KI-Sprechblase braucht eigenen Glasverlauf und Sprechblasen-Ecke")
    if user is None or "linear-gradient" not in user or "border-top-right-radius" not in user:
        errors.append("Nutzer-Sprechblase braucht eigenen Glasverlauf und Sprechblasen-Ecke")

    if not has_radius(attachment, 16):
        errors.append("Anhänge sollen in den weichen Stil integriert sein")
    if not has_radius(composer, 18):
        errors.append("Simuliertes Eingabefeld soll weich gerundet sein")

    # Scroll-Verhalten aus PR #463 darf beim Styling nicht verloren gehen.
    if layout is None or not re.search(r"height\s*:\s*clamp\(", base_css):
        errors.append("Feste viewportabhängige Chat-Höhe fehlt")
    if stream is None or not re.search(r"overflow-y\s*:\s*auto", stream):
        errors.append("Innerer Scrollbereich des Nachrichtenverlaufs fehlt")

    if errors:
        print("KI-Lern-Chat-Glasstil: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Lern-Chat-Glasstil: OK")
    print("- glasige Sprechblasen")
    print("- weichere Lern-Chat-Karten")
    print("- Anhänge und Eingabe integriert")
    print("- inneres Scrollen erhalten")
    return 0


if __name__ == "__main__":
    sys.exit(main())
