# Warenschmiede.com

Statische Website für 3D-Druck, CAD, digitale Werkstatt-Tools und KI-Hilfen.
GitHub ist der Entwicklungs- und Masterbestand; die Live-Website wird bei IONOS
betrieben. Die Anwendung bleibt bewusst leichtgewichtig mit HTML, CSS und
Vanilla JavaScript.

## Bereiche

- Leistungen: 3D-Druck, CAD & Prototyping und PC-Hilfe
- Wissensseiten zu KI und 3D-Druck
- Werkstatt-, Büro- und 3D-Druck-Tools
- Downloads und Anleitungen
- geschützte, rein lesende Admin Suite für Inventory, SEO und Diagnose

Produktive Legacy-Tools wie `/tools/Zeiterfassung.html` und
`/tools/Zeiterfassung_Plus.html` bleiben erreichbar.

## Entwicklungs- und Deploy-Workflow

```text
GitHub / Codex → Pull Request → Merge → lokal synchronisieren
→ DEPLOY_STARTEN.cmd → _deploy → FileZilla → IONOS → Admin prüfen
```

`DEPLOY_STARTEN.cmd` startet `build_deploy.ps1`. Dieses Skript erstellt `_deploy`
anhand einer Allowlist neu. Nur dessen Inhalt wird in das IONOS-Root hochgeladen;
das Skript ist ausdrücklich kein Uploader und baut keine Serververbindung auf.

Die serverseitigen Ordner `/dateien` (große Downloads) und `/logs` sind nicht
Teil von GitHub oder `_deploy` und werden separat verwaltet. Ausführliche und
sicherheitskritische Hinweise stehen in [DEPLOYMENT.md](DEPLOYMENT.md).

## Automatisches Inventory

Nach dem Bereinigen des fertigen Uploadpakets erzeugt `build_deploy.ps1`:

```text
_deploy/admin/site_inventory.json
```

Das Inventory enthält Erstellzeit, Generator, deploy-relative HTML-, Bild-,
Dokument- und Downloadlisten sowie die Gesamtzahl der Dateien. Es wird nicht
committed. Es gibt keinen regulären Server-Inventory-Schritt und keine Datei
wird vom Server zurück nach GitHub kopiert. `generate_inventory.py` bleibt nur
als **optionaler lokaler Entwicklerhelfer** erhalten und wird für das Deployment
nicht benötigt.

## Admin Suite

Die Admin Suite unter `/admin/` ist read-only und nicht öffentlich verlinkt. Sie
bietet:

- Übersicht über Deploy-Inventar, Sitemap und SEO-Status
- clientseitigen SEO-Scan (Title, Description, H1, Robots, Open Graph, Sitemap)
- durchsuchbare Bildergalerie
- Analyse der in `downloads.html` veröffentlichten `/dateien/`-Links per `HEAD`
- Anzeige der vorhandenen Zeiterfassung-Plus-Release-Metadaten
- clientseitigen, weitergabefähigen Diagnosebericht ohne Browser- oder
  Zugangsdaten
- aktuellen manuellen Deploy-Ablauf und sichere Schnelllinks

Die Authentifizierung erfolgt ausschließlich über IONOS „Geschützte
Verzeichnisse“. Die von IONOS erzeugte `/admin/.htaccess` existiert nur auf dem
Server, gehört niemals ins Repository oder Uploadpaket und darf nicht gelöscht
werden. Es gibt bewusst kein JavaScript-Login und keine Schreib-, Upload- oder
Löschfunktion.

## Wichtige Pfade

- `/index.html` – Startseite
- `/sitemap.xml` und `/robots.txt` – Suchmaschinensteuerung
- `/assets/css/styles.css` – öffentliches Stylesystem
- `/assets/css/admin.css` und `/assets/js/admin.js` – Admin-Darstellung und Logik
- `/downloads.html` – veröffentlichte Downloadlinks
- `/tools/` – aktuelle und bewusst erhaltene Legacy-Tools
- `/_deploy/` – lokales, nicht versioniertes Uploadpaket

## Sicherheitsregeln

- Keine Passwörter, Konten, Tokens, Hosts oder Zugangsdaten committen.
- Keine Authentifizierung im Client nachbauen.
- `/admin` auf IONOS niemals als ganzen Ordner löschen.
- `/dateien` und `/logs` beim Website-Upload niemals synchronisieren oder löschen.
- Keine Repository-, Entwicklungs- oder Reportdateien auf den Webspace deployen.
- `webseite_2_0` ist kein produktiver Pfad; sein Ausschluss im Build bleibt als
  zusätzliche Schutzregel bestehen.
