#!/usr/bin/env python3
"""Lokales SEO-Monitoring für die Warenschmiede-Seite."""

from __future__ import annotations

import argparse
import datetime as _dt
import os
from html.parser import HTMLParser
from collections import defaultdict
from typing import Dict, Iterable, List, Tuple
from urllib.parse import urlparse

BASE_URL = "https://www.warenschmiede.com"
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
EXCLUDED_SITEMAP_PATHS = {
    "druck/angebot.html",
    "druck/ergebnis.html",
    "druck/rechnung.html",
    "druck/selftest.html",
    "tools/buero/doku-light.html",
}


class SeoParser(HTMLParser):
    """Extrahiert Meta-Informationen und interne Links aus einer HTML-Datei."""

    def __init__(self) -> None:
        super().__init__()
        self._title_buffer: List[str] = []
        self._collect_title = False
        self.meta_description: str | None = None
        self.links: List[str] = []
        self.canonical: str | None = None
        self.is_redirect = False
        self.robots_directives: set[str] = set()

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str | None]]) -> None:
        if tag.lower() == "title":
            self._collect_title = True
            return

        if tag.lower() == "meta":
            attributes = {name.lower(): (value or "") for name, value in attrs}
            name = attributes.get("name", "").lower()
            if name == "description" and "content" in attributes:
                self.meta_description = attributes["content"].strip()
            if name == "robots" and "content" in attributes:
                content = attributes["content"].lower()
                for directive in content.replace(";", ",").split(","):
                    cleaned = directive.strip()
                    if cleaned:
                        self.robots_directives.add(cleaned)
            http_equiv = attributes.get("http-equiv", "").lower()
            if http_equiv == "refresh":
                self.is_redirect = True
            return

        if tag.lower() == "link":
            attributes = {name.lower(): (value or "") for name, value in attrs}
            if attributes.get("rel", "").lower() == "canonical" and "href" in attributes and not self.canonical:
                self.canonical = attributes["href"].strip()
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


def get_lastmod(path: str) -> str:
    full_path = os.path.join(REPO_ROOT, path)
    timestamp = os.path.getmtime(full_path)
    return _dt.datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")


def get_priority(path: str) -> float:
    basename = os.path.basename(path)
    if path == "index.html":
        return 1.0
    if basename in {
        "about.html",
        "leistungen.html",
        "material.html",
        "3ddruck.html",
        "werkstatt-rechner.html",
        "bild-konverter.html",
    }:
        return 0.8
    if path.startswith("ki/"):
        return 0.7
    return 0.5


def generate_sitemap(html_files: Iterable[str]) -> None:
    lines = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ]

    for path in html_files:
        url = html_path_to_url(path)
        lastmod = get_lastmod(path)
        priority = get_priority(path)
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <priority>{priority:.1f}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")

    sitemap_path = os.path.join(REPO_ROOT, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as sitemap_file:
        sitemap_file.write("\n".join(lines) + "\n")


def should_exclude_from_sitemap(path: str, robots_directives: set[str]) -> bool:
    if path in EXCLUDED_SITEMAP_PATHS:
        return True
    normalized_directives = {directive.lower() for directive in robots_directives}
    if "noindex" in normalized_directives:
        return True
    return False


def collect_sitemap_candidates(
    html_files: Iterable[str], robots_index_map: Dict[str, set[str]]
) -> List[str]:
    sitemap_candidates: List[str] = []
    for path in html_files:
        robots_directives = robots_index_map.get(path, set())
        if should_exclude_from_sitemap(path, robots_directives):
            continue
        sitemap_candidates.append(path)
    return sitemap_candidates


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


def analyse_file(
    path: str,
) -> Tuple[str, str | None, List[str], str | None, bool, set[str]]:
    full_path = os.path.join(REPO_ROOT, path)
    with open(full_path, "r", encoding="utf-8") as handle:
        content = handle.read()

    parser = SeoParser()
    parser.feed(content)
    parser.close()

    return (
        parser.title,
        parser.meta_description,
        parser.links,
        parser.canonical,
        parser.is_redirect,
        parser.robots_directives,
    )


def analyse_html_files(html_files: Iterable[str]):
    title_issues: List[str] = []
    description_issues: List[str] = []
    broken_links: List[str] = []
    canonical_issues: List[str] = []
    title_map: Dict[str, List[str]] = defaultdict(list)
    description_map: Dict[str, List[str]] = defaultdict(list)
    robots_index_map: Dict[str, set[str]] = {}

    for path in html_files:
        title, description, links, canonical, is_redirect, robots_directives = analyse_file(path)
        robots_index_map[path] = robots_directives

        if not title:
            title_issues.append(f"{path}: fehlender <title>")
        elif len(title) > 60:
            title_issues.append(f"{path}: Titel zu lang ({len(title)} Zeichen)")
        elif not is_redirect:
            title_map[title].append(path)

        if not description:
            description_issues.append(f"{path}: fehlende Meta-Description")
        elif len(description) > 160:
            description_issues.append(f"{path}: Description zu lang ({len(description)} Zeichen)")
        elif not is_redirect:
            description_map[description].append(path)

        if not canonical:
            canonical_issues.append(f"{path}: fehlender Canonical-Link")
        elif not canonical.startswith(BASE_URL):
            canonical_issues.append(f"{path}: Canonical zeigt auf {canonical}")

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

    duplicate_title_issues = [
        f"{', '.join(sorted(paths))} teilen sich den Titel \"{title}\""
        for title, paths in title_map.items()
        if len(paths) > 1
    ]

    duplicate_description_issues = [
        f"{', '.join(sorted(paths))} teilen sich die Description \"{description}\""
        for description, paths in description_map.items()
        if len(paths) > 1
    ]

    return (
        title_issues,
        description_issues,
        broken_links,
        canonical_issues,
        duplicate_title_issues,
        duplicate_description_issues,
        robots_index_map,
    )


def write_report(
    timestamp: str,
    title_issues,
    description_issues,
    broken_links,
    canonical_issues,
    duplicate_title_issues,
    duplicate_description_issues,
) -> None:
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
    lines.append("Doppelte Titles:")
    if duplicate_title_issues:
        lines.extend(f"- {issue}" for issue in duplicate_title_issues)
    else:
        lines.append("- Keine mehrfach verwendeten Titles gefunden.")

    lines.append("")
    lines.append("Doppelte Descriptions:")
    if duplicate_description_issues:
        lines.extend(f"- {issue}" for issue in duplicate_description_issues)
    else:
        lines.append("- Keine mehrfach verwendeten Meta-Descriptions gefunden.")

    lines.append("")
    lines.append("Canonical-Prüfung:")
    if canonical_issues:
        lines.extend(f"- {issue}" for issue in canonical_issues)
    else:
        lines.append("- Alle Seiten besitzen einen Canonical auf https://www.warenschmiede.com.")

    lines.append("")
    lines.append("Interne Link-Prüfung (*.html):")
    if broken_links:
        lines.extend(f"- {issue}" for issue in broken_links)
    else:
        lines.append("- Keine defekten internen HTML-Links gefunden.")

    report_path = os.path.join(REPO_ROOT, "seo-report.txt")
    report_entry = "\n".join(lines) + "\n"
    if os.path.exists(report_path) and os.path.getsize(report_path) > 0:
        report_entry = "\n" + report_entry

    with open(report_path, "a", encoding="utf-8") as report_file:
        report_file.write(report_entry)


def main() -> None:
    parser = argparse.ArgumentParser(description="Lokales SEO-Monitoring")
    parser.add_argument(
        "--write-sitemap",
        action="store_true",
        help="aktualisiert sitemap.xml zusätzlich zur Analyse",
    )
    args = parser.parse_args()

    html_files = collect_html_files()
    timestamp = _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    (
        title_issues,
        description_issues,
        broken_links,
        canonical_issues,
        duplicate_title_issues,
        duplicate_description_issues,
        robots_index_map,
    ) = analyse_html_files(html_files)
    write_report(
        timestamp,
        title_issues,
        description_issues,
        broken_links,
        canonical_issues,
        duplicate_title_issues,
        duplicate_description_issues,
    )
    sitemap_entries: List[str] = []
    if args.write_sitemap:
        sitemap_entries = collect_sitemap_candidates(html_files, robots_index_map)
        generate_sitemap(sitemap_entries)

    seo_issue_count = (
        len(title_issues)
        + len(description_issues)
        + len(duplicate_title_issues)
        + len(duplicate_description_issues)
    )
    print(
        f"Zusammenfassung: {len(html_files)} Seiten geprüft, {seo_issue_count} Title/Description-Probleme, {len(broken_links)} defekte interne Links."
    )
    if args.write_sitemap:
        print(f"Sitemap.xml neu erstellt ({len(sitemap_entries)} Seiten) – {timestamp}")
    else:
        print("Sitemap.xml unverändert (Analyse-Modus).")


if __name__ == "__main__":
    main()
