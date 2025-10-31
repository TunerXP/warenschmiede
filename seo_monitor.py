#!/usr/bin/env python3
"""Lokales SEO-Monitoring für die Warenschmiede-Seite."""

from __future__ import annotations

import datetime as _dt
import os
from html.parser import HTMLParser
from typing import Iterable, List, Tuple
from urllib.parse import urlparse

BASE_URL = "https://www.warenschmiede.com"
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))


class SeoParser(HTMLParser):
    """Extrahiert Meta-Informationen und interne Links aus einer HTML-Datei."""

    def __init__(self) -> None:
        super().__init__()
        self._title_buffer: List[str] = []
        self._collect_title = False
        self.meta_description: str | None = None
        self.links: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str | None]]) -> None:
        if tag.lower() == "title":
            self._collect_title = True
            return

        if tag.lower() == "meta":
            attributes = {name.lower(): (value or "") for name, value in attrs}
            name = attributes.get("name", "").lower()
            if name == "description" and "content" in attributes:
                self.meta_description = attributes["content"].strip()
            return

        if tag.lower() == "a":
            for name, value in attrs:
                if name.lower() == "href" and value:
                    self.links.append(value.strip())
                    break

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._collect_title = False

    def handle_data(self, data: str) -> None:
        if self._collect_title:
            self._title_buffer.append(data)

    @property
    def title(self) -> str:
        return "".join(self._title_buffer).strip()


def collect_html_files() -> List[str]:
    html_files: List[str] = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for filename in files:
            if not filename.lower().endswith(".html"):
                continue
            absolute_path = os.path.join(root, filename)
            relative_path = os.path.relpath(absolute_path, REPO_ROOT)
            html_files.append(relative_path.replace(os.sep, "/"))
    html_files.sort()
    return html_files


def html_path_to_url(path: str) -> str:
    if path == "index.html":
        return f"{BASE_URL}/"
    if path.endswith("/index.html"):
        clean = path[:-10].rstrip("/")
        if not clean:
            return f"{BASE_URL}/"
        return f"{BASE_URL}/{clean}/"
    return f"{BASE_URL}/{path}"


def generate_sitemap(html_files: Iterable[str]) -> None:
    lines = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ]

    for path in html_files:
        url = html_path_to_url(path)
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append("  </url>")

    lines.append("</urlset>")

    sitemap_path = os.path.join(REPO_ROOT, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as sitemap_file:
        sitemap_file.write("\n".join(lines) + "\n")


def normalize_href(href: str) -> str | None:
    href = href.strip()
    if not href or href.startswith("#"):
        return None
    if href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
        return None

    parsed = urlparse(href)
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        return None

    if parsed.scheme in {"http", "https"}:
        if parsed.netloc and parsed.netloc not in {"www.warenschmiede.com", "warenschmiede.com"}:
            return None
        path = parsed.path or ""
    else:
        path = href

    path = path.split("#", 1)[0].split("?", 1)[0]
    return path or None


def resolve_local_path(source: str, target: str) -> str | None:
    if target.startswith("/"):
        candidate = target.lstrip("/")
    else:
        candidate = os.path.normpath(os.path.join(os.path.dirname(source), target))

    candidate = candidate.replace("\\", "/")
    if candidate.startswith("../"):
        return None
    return candidate


def analyse_file(path: str) -> Tuple[str, str | None, List[str]]:
    full_path = os.path.join(REPO_ROOT, path)
    with open(full_path, "r", encoding="utf-8") as handle:
        content = handle.read()

    parser = SeoParser()
    parser.feed(content)
    parser.close()

    return parser.title, parser.meta_description, parser.links


def analyse_html_files(html_files: Iterable[str]):
    title_issues: List[str] = []
    description_issues: List[str] = []
    broken_links: List[str] = []

    for path in html_files:
        title, description, links = analyse_file(path)

        if not title:
            title_issues.append(f"{path}: fehlender <title>")
        elif len(title) > 60:
            title_issues.append(f"{path}: Titel zu lang ({len(title)} Zeichen)")

        if not description:
            description_issues.append(f"{path}: fehlende Meta-Description")
        elif len(description) > 160:
            description_issues.append(f"{path}: Description zu lang ({len(description)} Zeichen)")

        for href in links:
            normalized = normalize_href(href)
            if not normalized or ".html" not in normalized.lower():
                continue

            candidate = resolve_local_path(path, normalized)
            if not candidate:
                continue

            target_path = os.path.join(REPO_ROOT, candidate)
            if not os.path.exists(target_path):
                broken_links.append(f"{path} → {href}")

    return title_issues, description_issues, broken_links


def write_report(timestamp: str, title_issues, description_issues, broken_links) -> None:
    lines = [
        f"Warenschmiede SEO Report – {timestamp}",
        "=" * 40,
        "",
        "Title-Prüfung:",
    ]

    if title_issues:
        lines.extend(f"- {issue}" for issue in title_issues)
    else:
        lines.append("- Alle Titel sind vorhanden und maximal 60 Zeichen lang.")

    lines.append("")
    lines.append("Meta-Description-Prüfung:")
    if description_issues:
        lines.extend(f"- {issue}" for issue in description_issues)
    else:
        lines.append("- Alle Meta-Descriptions sind vorhanden und maximal 160 Zeichen lang.")

    lines.append("")
    lines.append("Interne Link-Prüfung (*.html):")
    if broken_links:
        lines.extend(f"- {issue}" for issue in broken_links)
    else:
        lines.append("- Keine defekten internen HTML-Links gefunden.")

    report_path = os.path.join(REPO_ROOT, "seo-report.txt")
    with open(report_path, "w", encoding="utf-8") as report_file:
        report_file.write("\n".join(lines) + "\n")


def main() -> None:
    html_files = collect_html_files()
    generate_sitemap(html_files)
    timestamp = _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    title_issues, description_issues, broken_links = analyse_html_files(html_files)
    write_report(timestamp, title_issues, description_issues, broken_links)
    print(f"Sitemap.xml neu erstellt ({len(html_files)} Seiten) – {timestamp}")


if __name__ == "__main__":
    main()
