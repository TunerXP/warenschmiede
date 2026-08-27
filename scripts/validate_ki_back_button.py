#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "assets/css/ki-content.css"
MIN_DESKTOP_TOP_PX = 138


def main():
    css = CSS.read_text(encoding="utf-8")
    match = re.search(r"body\.ki-page \.ki-detail-back\s*\{(?P<body>.*?)\}", css, re.S)
    if not match:
        print("KI-Rücksprungprüfung: FEHLER – .ki-detail-back fehlt")
        return 1

    block = match.group("body")
    errors = []
    if not re.search(r"position\s*:\s*fixed\s*;", block):
        errors.append(".ki-detail-back muss position: fixed verwenden")
    if re.search(r"position\s*:\s*sticky\s*;", block):
        errors.append(".ki-detail-back darf nicht mehr position: sticky verwenden")

    top_match = re.search(r"top\s*:\s*(\d+)px\s*;", block)
    if not top_match:
        errors.append(".ki-detail-back braucht einen festen Pixel-Abstand nach oben")
    elif int(top_match.group(1)) < MIN_DESKTOP_TOP_PX:
        errors.append(
            f".ki-detail-back muss unterhalb von Kopfzeile und Breadcrumbs beginnen "
            f"(mindestens {MIN_DESKTOP_TOP_PX}px)"
        )

    if not re.search(r"left\s*:", block):
        errors.append(".ki-detail-back braucht eine feste horizontale Position")

    if errors:
        print("KI-Rücksprungprüfung: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("KI-Rücksprungprüfung: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
