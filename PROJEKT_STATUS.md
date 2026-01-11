# 🛠️ PROJEKT-STATUS & ARBEITSWEISE: WARENSCHMIEDE

**Projekt-Inhaber:** Marco Hoffmann (Donaueschingen)
**Projekt:** Warenschmiede (3D-Druck Service & Software-Entwicklung)
**Stand:** Januar 2026

---

## 1. Die Philosophie ("Der Hoffmann-Code")
* **Handwerk statt Industrie:** Wir machen keine Massenware. Lösungen sind pragmatisch, ehrlich und direkt.
* **Offline First:** Tools (wie der Kostenrechner V3) sollen lokal funktionieren. Datenhoheit liegt beim Nutzer. Keine Cloud-Abhängigkeit, wenn nicht nötig.
* **Transparenz:** Wir verstecken nichts. Wenn Software neu ist, sagen wir das (Beta). Wenn Windows warnt, erklären wir warum.
* **Workflow:** Messen -> Analysieren -> Entscheiden. Kein Blindflug.

---

## 2. Technische Infrastruktur
**Webseite:** `www.warenschmiede.com`
**Hosting:** IONOS Webhosting Plus (Upgrade von reinem Mail-Vertrag).
**Server-Pfad:** `/` (Root) enthält die `index.html`.
**Speicher:** Große Dateien liegen im Ordner `/dateien/` (alias `storage`).

**Tech-Stack:**
* **Frontend:** HTML5, Tailwind CSS, Alpine.js (Leichtgewichtig, kein React/Vue-Overhead).
* **Verwaltung:** Python (`generate_inventory.py`) erstellt `site_inventory.json` für das Admin-Dashboard.
* **Editoren:** VS Code (lokal).
* **Versionierung:** GitHub (Private Repository) als "Werkstatt".

---

## 3. Der "Qualitäts-Workflow"
Wir arbeiten nach dem **3-Phasen-Prinzip**:

1.  **Die Werkstatt (GitHub/VS Code):**
    * Hier arbeiten die KI-Agenten (Jules, Codex).
    * Hier wird getestet. Nichts verlässt die Werkstatt ungeprüft.
    * Hier liegt der Master-Code (inkl. `.git` Ordner).

2.  **Die Schleuse (Der User):**
    * Marco prüft die Änderungen.
    * Marco synchronisiert manuell via **FileZilla** (SFTP).
    * *Wichtige Regel:* `.git`, `.vs` und Arbeitsdateien werden **NICHT** auf den Server geladen.

3.  **Das Schaufenster (IONOS):**
    * Hier liegt nur die "Production"-Version.
    * Downloads werden über relative Pfade (`/dateien/...`) verlinkt.
    * SSL (HTTPS) ist erzwungen.

---

## 4. Erreichte Meilensteine & Features

### A. Admin Dashboard (Lokal)
* Eine `admin.html`, die nur lokal läuft.
* Zeigt Inventar, SEO-Status und "Quick Links" (IONOS, GitHub, Search Console).
* Basiert auf einer JSON-Datenbank, die per Python-Skript aktualisiert wird.

### B. SEO & Sauberkeit
* **Scanner:** Ein Tool prüft Meta-Tags, H1 und Links.
* **Noindex-Strategie:** Technische Seiten (Vorlagen, `druck/angebot`, `404`, `impressum`) sind bewusst auf `noindex` gesetzt.
* **404-Handling:** Alte Test-Dateien wurden rigoros gelöscht und aus der Sitemap entfernt.

### C. Software-Entwicklung
1.  **Kostenrechner V2 (Online):** Schnelle Kalkulation für Browser.
2.  **Warenschmiede Suite V3 (Desktop):**
    * Offline-Applikation (basiert auf Web-Technologie).
    * Features: Kundenverwaltung, Materialdatenbank, PDF-Erstellung, Re-Kalkulation (JSON-Import).
    * Download-Strategie: Zip-Datei liegt auf IONOS High-Speed Storage.

### D. Server-Migration (Der große Umzug)
* Wechsel von GitHub Pages zu IONOS Webspace.
* DNS angepasst (CNAME/A-Records korrigiert).
* SSL-Zertifikate aktiviert.
* Download-Probleme (404) durch korrekte Ordnerstruktur (`/dateien/`) gelöst.

---

## 5. Umgang mit Hindernissen (Lessons Learned)

* **Antivirus-Blockaden (Norton/Windows):**
    * Problem: Neue .exe Dateien werden als "unbekannt" blockiert.
    * Lösung 1 (Sofort): Grüner Hinweis-Kasten auf der Webseite ("Fehlalarm", "Trotzdem ausführen").
    * Lösung 2 (Langfristig): Whitelisting bei Symantec/Microsoft beantragen.
    * Beta-Tester Philipp ("Der Genaue") prüft die Funktionalität vor Release.

* **Download-Design:**
    * Weg von "Kachel-Optik" hin zu **Full-Width Listen** mit Akkordeon-Details (<details>).
    * Bessere Übersicht bei komplexen Tools.

---

## 6. Offene Punkte / Vision
* **Kategorien:** Sobald 3D-Druck-Modelle (STLs/G-Codes) angeboten werden, wird der Download-Bereich kategorisiert.
* **Automatisierung:** Eventuell später GitHub Actions für Auto-Deploy (aktuell ist manuell bevorzugt wegen Kontrolle).
* **Bilder:** Vorschaubilder für die Suite V3 erstellen.

---
*Dokument erstellt am 11.01.2026 – Zusammenfassung der Session mit Gemini.*