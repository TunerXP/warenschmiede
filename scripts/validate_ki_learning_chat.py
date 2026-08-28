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
            'id="learning-chat-sidebar-toggle"',
            'id="learning-chat-nav"',
            'id="learning-chat-title"',
            'id="learning-chat-status"',
            'id="learning-chat-stream"',
            'id="learning-chat-attachment-slot"',
            'id="learning-chat-composer"',
            'id="learning-chat-pause"',
            'id="learning-chat-next"',
            'id="learning-chat-restart"',
            'aria-live="polite"',
            "readonly",
            "nichts wirklich gesendet oder hochgeladen",
        ):
            if needle not in html:
                errors.append(f"chat.html: fehlt {needle}")
        for legacy in (
            "chat-container",
            "persona-overlay",
            "WhatsApp",
            "Marco (KI-Guide)",
            "Senior / Einsteiger",
        ):
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
        for step_type in (
            "compose",
            "attachment",
            "send",
            "working",
            "assistant",
            "lesson",
            "link",
            "checkpoint",
        ):
            if f'type: "{step_type}"' not in data and f"type: '{step_type}'" not in data:
                errors.append(f"Schritttyp fehlt in Daten: {step_type}")
        for needle in (
            'defaultChatId: "intro"',
            'group: "pinned"',
            'group: "practice"',
            'kind: "image"',
            'kind: "pdf"',
            "/ki/tutorials/screenshots-windows.html",
            "/ki/faq.html",
            "Etwas lockerer bitte.",
            "Jetzt noch kürzer.",
            "Bitte prüfe das aktuell und nenne mir Quellen.",
            "Mein Passwort ist …",
            'tone: "warning"',
        ):
            if needle not in data:
                errors.append(f"Datenmodell: fehlt {needle}")

        safety_match = re.search(
            r'id:\s*["\']safety["\'](?P<body>.*?)id:\s*["\']rewrite["\']',
            data,
            re.S,
        )
        if not safety_match:
            errors.append("Datenmodell: Sicherheits-Chat konnte nicht abgegrenzt werden")
        else:
            safety = safety_match.group("body")
            warning_pos = safety.find('tone: "warning"')
            send_pos = safety.find('type: "send"')
            if warning_pos < 0:
                errors.append("Sicherheits-Chat: Warn-Checkpoint fehlt")
            if 0 <= send_pos < warning_pos:
                errors.append("Sicherheits-Chat: sensible Demo-Eingabe würde vor der Warnung gesendet")

    if engine is None:
        errors.append("ki-learning-chat.js fehlt")
    else:
        for needle in (
            'const STORAGE_KEY = "wsKiLearningChatCompleted"',
            "sessionStorage",
            "window.WSLearningChatData",
            "selectChat",
            "pausePlayback",
            "continuePlayback",
            "restartChat",
            "toggleSidebar",
            "requestAnimationFrame",
            'matchMedia("(prefers-reduced-motion: reduce)")',
            "renderAttachment",
            "renderLesson",
            "renderCheckpoint",
            "markChatComplete",
            "textContent",
        ):
            if needle not in engine:
                errors.append(f"Engine: {needle} fehlt")

    if css is None:
        errors.append("ki-learning-chat.css fehlt")
    else:
        for needle in (
            "overflow-x: hidden",
            ".learning-chat-layout",
            "grid-template-columns: minmax(230px, 290px) minmax(0, 1fr)",
            ".learning-chat-sidebar",
            ".learning-chat-sidebar.is-open",
            "@media (max-width: 860px)",
            "@media (prefers-reduced-motion: reduce)",
            ".learning-chat-attachment--pdf",
            ".learning-chat-attachment--image",
            ".learning-chat-checkpoint--warning",
            ":focus-visible",
        ):
            if needle not in css:
                errors.append(f"CSS: fehlt {needle}")

    if nav is None:
        errors.append("ws-layout.js fehlt")
    else:
        expected_nav = (
            "{ label: 'KI kennenlernen', href: 'ki/chat.html', description: 'Ein interaktiver Lern-Chat zeigt dir KI in der Praxis.' }",
            "{ label: 'Erste Schritte & Tutorials', href: 'ki/tutorials/', description: 'Screenshots, Dateien und praktische Grundlagen Schritt für Schritt.' }",
        )
        for needle in expected_nav:
            if needle not in nav:
                errors.append(f"Navigation: exakter Einstieg fehlt: {needle}")

        einsteigen = re.search(
            r"\{ label: 'Einsteigen', accent: 'violet', links: \[(?P<body>.*?)\]\s*\}",
            nav,
            re.S,
        )
        if not einsteigen:
            errors.append("Navigation: Abschnitt Einsteigen konnte nicht gefunden werden")
        else:
            body = einsteigen.group("body")
            if "KI-Lexikon" in body:
                errors.append("Navigation: KI-Lexikon ist noch prominenter Einstiegseintrag")
            if body.count("href:") != 2:
                errors.append("Navigation: Einsteigen soll genau zwei direkte Ziele enthalten")

    if errors:
        print("KI-Lern-Chat-Prüfung: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Lern-Chat-Prüfung: OK")
    print("- Neue Chat-Shell ohne WhatsApp-Altstruktur")
    print("- 6 Lern-Chats mit Screenshot/PDF/Sicherheit/Praxis")
    print("- Playback, Session-Fortschritt und Reduced Motion")
    print("- Responsiver Drawer und neue Einstieg-Navigation")
    return 0


if __name__ == "__main__":
    sys.exit(main())
