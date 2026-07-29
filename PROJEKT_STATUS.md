# 🛠️ PROJEKT-STATUS & ARBEITSWEISE: WARENSCHMIEDE

**Projekt-Inhaber:** Marco Hoffmann  
**Stand:** 03.05.2026  
**Projekt:** Warenschmiede – 3D-Druck, CAD, digitale Werkstatt-Tools und KI-Hilfen  
**Live-Domain:** https://www.warenschmiede.com  
**Hosting:** IONOS Webhosting Plus  
**Repository:** GitHub-Repo `TunerXP/warenschmiede` als Entwicklungs-/Masterbestand

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

Die Live-Dateien liegen auf dem IONOS-Webspace. Hochgeladen wird ausschließlich der Inhalt des lokal erzeugten `_deploy`-Pakets per FileZilla.

### GitHub / lokale Werkstatt

Das GitHub-Repository dient als Master-Werkstatt für:

- HTML
- CSS
- JavaScript
- Tools
- Dokumentation
- Sitemap
- automatisch beim Deploy erzeugtes Inventory
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

Nach Prüfung und Merge wird `DEPLOY_STARTEN.cmd` ausgeführt. Der erzeugte Inhalt von `_deploy` wird per FileZilla hochgeladen; `/dateien`, `/logs` und der bestehende Serverordner `/admin` bleiben unangetastet.

Wichtig:

- `.git` nicht hochladen
- `.vs` nicht hochladen
- unnötige Arbeitsdateien nicht hochladen
- `/admin` nicht löschen; die ausschließlich serverseitige `/admin/.htaccess` nicht überschreiben
- keine Passwörter in GitHub oder HTML speichern

### 3. Schaufenster

IONOS ist die Live-Webseite.

Dort liegen nur die produktiven Dateien, Downloads und öffentlich nutzbaren Tools.

---

## 4. Admin Suite

Die Admin Suite liegt live unter:

`/admin/index.html`

Der Admin-Bereich ist über IONOS „Geschützte Verzeichnisse“ serverseitig geschützt. Die dabei serverseitig erzeugte `/admin/.htaccess` gehört nicht ins Repository oder Deploy-Paket.

Der alte HTML-/JavaScript-Passwortschutz wurde entfernt.

Wichtig:

- Admin bleibt `noindex,nofollow`
- Admin wird nicht öffentlich verlinkt
- Zugriff erfolgt per direktem Lesezeichen / direkter URL
- die IONOS-`.htaccess` bleibt ausschließlich auf dem Server
- der vorhandene Serverordner `/admin` darf beim Upload nicht gelöscht werden

### Funktionen der Admin Suite

Die Admin Suite kann aktuell:

- das automatisch erzeugte Deploy-Inventar laden und im Dashboard zusammenfassen
- Seiten und SEO-Daten prüfen sowie nach Pfad und Prüfergebnis suchen und filtern
- die Bildergalerie nach Dateiname, Pfad und Format durchsuchen und filtern
- veröffentlichte Downloadlinks auswerten und per HEAD-Anfrage prüfen
- den öffentlichen Zeiterfassung-Plus-Release-Status anzeigen
- einen gefilterten technischen Diagnosebericht erstellen und kopieren
- den aktuellen Wartungs- und Deploy-Ablauf sowie sichere Quick Links anzeigen

Die Admin Suite ist vollständig read-only. Sie schreibt keine Dateien auf den Server
und bietet keine Upload-, Lösch-, Editor- oder Serverzugriffsfunktion.

---

## 5. Inventory-Workflow

`build_deploy.ps1` erzeugt nach dem Kopieren, Bereinigen und Validieren automatisch `_deploy/admin/site_inventory.json`. Das Admin-Dashboard liest diese geschützte Deploy-Datei. Ein Serverzugriff oder Rückkopieren nach GitHub ist nicht mehr Bestandteil des Ablaufs. `generate_inventory.py` dient nur optional lokalen Entwicklungsprüfungen.
