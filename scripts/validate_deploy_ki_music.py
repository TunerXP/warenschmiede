#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build_deploy.ps1"


def main():
    errors = []
    text = BUILD.read_text(encoding="utf-8") if BUILD.exists() else ""

    match = re.search(r"\$websiteDirectories\s*=\s*@\((?P<body>.*?)\)\s*\n", text, re.S)
    if not match:
        errors.append("$websiteDirectories-Allowlist konnte nicht gefunden werden")
    else:
        body = match.group("body")
        if re.search(r"['\"]ki-musik['\"]", body) is None:
            errors.append("ki-musik fehlt in der Deploy-Allowlist")

    if errors:
        print("Deploy KI-Musik: FEHLER")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Deploy KI-Musik: OK")
    print("- /ki-musik wird in _deploy übernommen")
    return 0


if __name__ == "__main__":
    sys.exit(main())
