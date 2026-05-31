# Warenschmiede.com

**Projekt:** Warenschmiede – 3D-Druck, CAD, digitale Werkstatt-Tools und KI-Hilfen  
**Inhaber:** Marco Hoffmann  
**Live-Domain:** https://www.warenschmiede.com  
**Hosting:** IONOS Webhosting Plus  
**Repository:** GitHub-Repo als private Werkstatt / Master-Bestand  
**Stand:** 03.05.2026  

---

## 1. Kurzbeschreibung

Warenschmiede.com ist eine statische Webseite mit mehreren Bereichen:

- 3D-Druck-Service
- CAD & Prototyping
- PC-Hilfe
- KI-Erklärungen und KI-Hilfen
- Online-Tools für Werkstatt, Büro und 3D-Druck
- Downloads und Anleitungen
- geschützte Admin Suite zur Inventar- und SEO-Prüfung

Die Seite ist bewusst leichtgewichtig aufgebaut: statisches HTML, CSS, JavaScript und kleine Python-Hilfsskripte für Inventory und SEO.

---

## 2. Live-System und Arbeitsweise

Die Webseite läuft live auf IONOS:

```text
https://www.warenschmiede.com

GitHub ist die Werkstatt. Änderungen werden dort vorbereitet, geprüft und anschließend manuell per FileZilla/SFTP auf IONOS hochgeladen.

Der Workflow:

GitHub / VS Code / KI-Agent
→ Änderung prüfen
→ gezielt per FileZilla auf IONOS hochladen
→ Inventory/Sitemap bei Bedarf aktualisieren
→ Admin prüfen
→ SEO Scan ausführen

Wichtig:

Nicht blind ganze Ordner überschreiben.
.git und .vs nicht hochladen.
/admin/.htaccess und /admin/.htpasswd niemals überschreiben oder nach GitHub laden.
Keine Passwörter oder Zugangsdaten in HTML, JS oder Markdown speichern.
3. Wichtige Dateien im Root
index.html
sitemap.xml
robots.txt
site_inventory.json
generate_inventory.py
seo_monitor.py
styles.css
generate_inventory.py

Erzeugt die Datei:

site_inventory.json

Diese wird von der Admin Suite gelesen.

Ausführen auf dem IONOS-Server per SSH:

python3 generate_inventory.py
seo_monitor.py

Lokales/serverseitiges SEO-Hilfsskript.

Optional mit Sitemap-Neuerzeugung:

python3 seo_monitor.py --write-sitemap
robots.txt

Verweist auf die aktuelle Sitemap:

Sitemap: https://www.warenschmiede.com/sitemap.xml
4. Admin Suite

Die Admin Suite liegt unter:

/admin/index.html

Der Admin-Bereich ist serverseitig geschützt durch:

/admin/.htaccess
/admin/.htpasswd

Die Admin Suite ist nicht öffentlich verlinkt und steht auf:

<meta name="robots" content="noindex, nofollow">

Funktionen:

Dashboard
Inventory laden
SEO Scan
SEO-Bericht speichern
Content & Docs ansehen
Bilder-Galerie
Downloads anzeigen
Workflow-Hilfe für Inventory/Sitemap

Die Admin Suite schreibt keine Dateien auf dem Server. Sie liest nur vorhandene Dateien.

5. Inventory-Workflow

Nach Dateiänderungen auf IONOS:

Per PowerShell/SSH einloggen:
ssh u122508312@access1079920426.webspace-data.io
Inventory neu erzeugen:
python3 generate_inventory.py
Prüfen:
ls -l site_inventory.json
site_inventory.json vom IONOS-Server zurück ins lokale Projekt/GitHub sichern.
Falls die Sitemap neu erzeugt wurde, zusätzlich sitemap.xml zurück ins lokale Projekt/GitHub sichern.
Admin öffnen, „Reload Inventory“ klicken und SEO Scan starten.
6. Aktuelle Hauptbereiche
Startseite
/index.html
Leistungen
/leistungen/3d-druck.html
/leistungen/cad-prototyping.html
/leistungen/pc-hilfe.html
KI-Bereich
/ki/index.html
/ki/prompts.html
/ki/tools.html
/ki/lexikon.html
Tools
/tools/index.html

Wichtige Tools:

/tools/ws_3d_print_kostenrechner.html
/tools/ws_3d_print_kostenrechner_anleitung.html
/tools/Zeiterfassung_Plus.html
/tools/quittungs_generator.html
/werkstatt-rechner.html
Downloads
/downloads.html
/dateien/
 /download/
Dokumentation
/docs/anleitung.html
PROJEKT_STATUS.md
README.md
7. Aktuelle wichtige Tools
Warenschmiede 3D-Druck Suite Plus
/tools/ws_3d_print_kostenrechner.html

Anleitung:

/tools/ws_3d_print_kostenrechner_anleitung.html

Status: online und aktiv.

Funktionen:

Angebote
Rechnungen
Lieferscheine
3D-Druck-Kalkulation
Presets
Logo
QR-Code
History
JSON-Speicherung
PDF-/Druckausgabe
transparente oder kompakte Kalkulationsansicht
Zeiterfassung Plus
/tools/Zeiterfassung_Plus.html

Status: online und aktiv.

Quittungs-Schmied Plus
/tools/quittungs_generator.html

Status: online und aktiv.

Warenschmiede METALL
/werkstatt-rechner.html

Status: online und aktiv.

8. Alte Tools und Übergang

Folgende alte Tools bleiben während der Übergangsphase erreichbar:

/tools/kostenrechner-v2.html
/tools/Zeiterfassung.html

Geplante Ablösung:

bis spätestens Ende 2026

Danach sollen alte Versionen entfernt, weitergeleitet oder archiviert werden.

9. SEO-Grundsätze

Kanonische Domain:

https://www.warenschmiede.com

Sitemap:

https://www.warenschmiede.com/sitemap.xml

Indexiert werden sollen:

öffentliche Hauptseiten
Leistungsseiten
wichtige KI-Seiten
wichtige 3D-Druck-Seiten
Tool-Übersicht
öffentliche Tools
Downloads
öffentliche Anleitungen

Nicht indexiert werden sollen:

Admin
interne Druck-/Rechnungs-/Angebotsansichten
technische Testseiten
Weiterleitungsseiten
404
Datenschutz/Impressum nach aktueller Strategie
10. Zusammenarbeit mit KI-Agenten
ChatGPT

Wird genutzt für:

Planung
Analyse
technische Erklärung
Prompt-/Auftragsformulierung
SEO- und Strukturentscheidungen
Jules

Wird genutzt für:

GitHub-Änderungen
PRs
HTML/CSS/JS-Feinschliff
SEO-/Sitemap-/Admin-Anpassungen
Codex

Wird genutzt für:

größere Code- und Website-Aufgaben
strukturierte PRs
komplexere Umbauten

Grundregel:

Ein Auftrag = ein klarer, prüfbarer Schritt.

Keine unklaren Aufträge wie:

Mach die Webseite besser.

Besser:

Ändere nur Datei X, ergänze Y, entferne Z, keine anderen Funktionen ändern.
11. Sicherheitsregeln

Nie speichern oder hochladen:

Passwörter
SSH-Passwörter
.htpasswd
private Zugangsdaten
Zugangscodes im HTML/JS

Besonders schützen:

/admin/.htaccess
/admin/.htpasswd

Beim Upload mit FileZilla:

Admin-Ordner nicht komplett überschreiben.
Schutzdateien nicht anfassen.
Nur gezielt geänderte Dateien hochladen.
12. Weitere Dokumentation

Ausführlicher Projektstatus:

PROJEKT_STATUS.md

Diese README ist die kurze technische Übersicht.
PROJEKT_STATUS.md enthält den ausführlicheren Arbeitsstand, Regeln, Meilensteine und offene Punkte.

13. Aktueller Stand

Stand 03.05.2026:

Live-System ist IONOS.
Admin Suite ist serverseitig geschützt.
HTML-Passwortschutz wurde entfernt.
Sitemap und SEO-Scanner wurden auf https://www.warenschmiede.com vereinheitlicht.
Logs werden aus Inventory/SEO ausgeschlossen.
Warenschmiede 3D-Druck Suite Plus ist online.
Zeiterfassung Plus ist online.
Quittungs-Schmied Plus ist online.
Alte Tools bleiben während der Übergangsphase erreichbar.

Danach wieder dein Ablauf:

```text
README.md lokal ersetzen
→ GitHub hochladen
→ per FileZilla nach IONOS hochladen
→ python3 generate_inventory.py
→ Admin Reload Inventory
→ Content & Docs prüfen