# Warenschmiede – Starterseite

Dies ist eine minimalistische Visitenkarten‑Website für GitHub Pages.

## Schnellstart
1. Neues öffentliches Repository bei GitHub anlegen (z. B. `warenschmiede`).
2. Diese Dateien hochladen (oder mit VS2022 committen & pushen).
3. In den Repository‑Settings unter **Pages** `Deploy from branch` wählen und `main / root` einstellen.
4. Unter **Custom domain** `www.warenschmiede.com` eintragen. GitHub erzeugt/aktualisiert die Datei `CNAME` automatisch.
5. Bei IONOS DNS: `www` als **CNAME** auf `<username>.github.io` setzen. Root‑Domain `warenschmiede.com` per Weiterleitung auf `https://www.warenschmiede.com` zeigen lassen.

## Profilfoto nachreichen

Lade das echte Profilfoto nach dem Merge direkt auf `main` hoch (`/assets/img/marco.jpg`). Dafür in GitHub auf **Add file → Upload files** gehen und das Bild in den Ordner `assets/img/` legen.

## Service-Icons anpassen

Die Leistungskacheln auf der Startseite nutzen inline eingebettete SVG-Icons. Die jeweiligen Quelldateien liegen im Ordner `assets/icons/` (`cube.svg`, `ruler.svg`, `laptop.svg`).

Um ein Icon auszutauschen, die gewünschte Datei dort ersetzen und den Dateinamen unverändert lassen. Die Icons werden mit `currentColor` gezeichnet und übernehmen dadurch die Farben aus den CSS-Regeln.

## SEO-Monitoring & Sitemap

Das Skript `seo_monitor.py` prüft alle HTML-Seiten auf fehlende oder zu lange Titles/Descriptions, erkennt doppelte Inhalte, kontrolliert interne Links und schreibt die Ergebnisse in `seo-report.txt` (mit Zeitstempel). Interne Tool-Seiten bleiben dabei zwar analysiert, aber absichtlich aus der Sitemap herausgehalten, damit sie nicht öffentlich indexiert werden.

**Nur Analyse ausführen (sitemap.xml bleibt unverändert):**

```bash
python seo_monitor.py
```

**Analyse + Sitemap aktualisieren:**

```bash
python seo_monitor.py --write-sitemap
```

Im ersten Fall wird ausschließlich `seo-report.txt` ergänzt und eine kurze Zusammenfassung in der Konsole ausgegeben. Im zweiten Fall wird zusätzlich eine neue `sitemap.xml` im Projektroot erzeugt, die alle öffentlichen Seiten inkl. `lastmod`- und `priority`-Angaben enthält.
