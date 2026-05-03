# 🛠️ PROJEKT-STATUS & ARBEITSWEISE: WARENSCHMIEDE

**Projekt-Inhaber:** Marco Hoffmann  
**Stand:** 03.05.2026  
**Projekt:** Warenschmiede – 3D-Druck, CAD, digitale Werkstatt-Tools und KI-Hilfen  
**Live-Domain:** https://www.warenschmiede.com  
**Hosting:** IONOS Webhosting Plus  
**Repository:** GitHub-Repo `TunerXP/warenschmiede` als private Werkstatt / Master-Bestand  

---

## 1. Grundidee der Warenschmiede

Die Warenschmiede ist Marcos digitale Werkstatt für:

- 3D-Druck-Service
- CAD & Prototyping
- PC-Hilfe
- Werkstatt- und Büro-Tools
- KI-Erklärungen und praktische KI-Hilfen
- eigene Downloads und Dokumentationen

Die Seite soll verständlich, ehrlich und nutzbar sein – ohne unnötigen Fachjargon und ohne künstliches Aufblasen.

Wichtig ist der handwerkliche Ansatz:

- pragmatisch statt überkompliziert
- lokal und datensparsam, wo möglich
- offen erklären, wenn etwas Beta, Übergang oder Hilfstool ist
- saubere Struktur statt wildes Datei-Chaos
- manuelle Kontrolle vor Live-Schaltung

---

## 2. Aktuelle technische Infrastruktur

### Live-System

Die Webseite läuft produktiv auf:

`https://www.warenschmiede.com`

Hosting läuft über IONOS Webhosting Plus.

Die Live-Dateien liegen auf dem IONOS-Webspace. Hochgeladen wird manuell per FileZilla/SFTP.

### GitHub / lokale Werkstatt

Das GitHub-Repository dient als Master-Werkstatt für:

- HTML
- CSS
- JavaScript
- Tools
- Dokumentation
- Sitemap
- Inventory
- Python-Hilfsskripte

Änderungen werden normalerweise durch Marco geprüft und anschließend manuell per FileZilla auf IONOS hochgeladen.

---

## 3. Wichtige Grundregel: Werkstatt, Schleuse, Schaufenster

### 1. Werkstatt

Hier wird gebaut:

- GitHub
- VS Code
- Jules
- Codex
- ChatGPT als Planungspartner

In der Werkstatt wird entwickelt, geprüft und dokumentiert.

### 2. Schleuse

Marco prüft die Änderungen und lädt gezielt Dateien per FileZilla auf den IONOS-Server.

Nicht blind ganze Ordner überschreiben.

Wichtig:

- `.git` nicht hochladen
- `.vs` nicht hochladen
- unnötige Arbeitsdateien nicht hochladen
- `/admin/.htaccess` und `/admin/.htpasswd` nicht überschreiben
- keine Passwörter in GitHub oder HTML speichern

### 3. Schaufenster

IONOS ist die Live-Webseite.

Dort liegen nur die produktiven Dateien, Downloads und öffentlich nutzbaren Tools.

---

## 4. Admin Suite

Die Admin Suite liegt live unter:

`/admin/index.html`

Der Admin-Bereich ist serverseitig geschützt über:

- `/admin/.htaccess`
- `/admin/.htpasswd`

Der alte HTML-/JavaScript-Passwortschutz wurde entfernt.

Wichtig:

- Admin bleibt `noindex,nofollow`
- Admin wird nicht öffentlich verlinkt
- Zugriff erfolgt per direktem Lesezeichen / direkter URL
- `.htaccess` und `.htpasswd` bleiben nur auf dem IONOS-Server
- diese Dateien dürfen nicht nach GitHub hochgeladen werden

### Funktionen der Admin Suite

Die Admin Suite kann aktuell:

- Inventory laden
- Dashboard anzeigen
- SEO Scan ausführen
- SEO-Bericht speichern
- Content- und Dokumentdateien anzeigen
- Bilder-Galerie anzeigen
- Download-Dateien anzeigen
- Quick Links bereitstellen
- Workflow-Anleitung für Inventory/Sitemap anzeigen

Die Admin Suite schreibt keine Dateien auf dem Server. Sie liest nur vorhandene Dateien.

---

## 5. Inventory-Workflow

Das Inventory wird über das Python-Skript erzeugt:

`generate_inventory.py`

Das Skript erzeugt:

`site_inventory.json`

Diese Datei wird vom Admin-Dashboard gelesen.

### Standard-Ablauf nach Dateiänderungen

1. Geänderte Dateien per FileZilla auf IONOS hochladen.
2. Per PowerShell/SSH auf IONOS einloggen.
3. Inventory neu erzeugen:

```bash
python3 generate_inventory.py