# Deployment auf IONOS

GitHub ist der Entwicklungs- und Masterbestand. Hochgeladen wird ausschließlich
der lokal erzeugte Inhalt von `_deploy`; das Repository selbst ist kein Uploadpaket.

## Standardablauf

1. Pull Request prüfen und mergen.
2. Den Zielbranch lokal in VS Code synchronisieren (`git pull`).
3. `DEPLOY_STARTEN.cmd` ausführen. Das Kommando startet `build_deploy.ps1`.
4. Den neu erzeugten Ordner `_deploy` kontrollieren.
5. **Den Inhalt** von `_deploy` mit FileZilla in das IONOS-Root hochladen und
   vorhandene Website-Dateien ersetzen.
6. Admin öffnen und Website, SEO, Downloads und Release-Metadaten prüfen.

Das Build-Skript arbeitet mit einer festen Allowlist, entfernt Entwicklungs- und
Reportdateien und validiert verbotene Ordner. Es stellt keine Serververbindung
her und enthält keine Zugangsdaten.

Der öffentliche Website-Bereich `/ki-musik/` gehört zur Deploy-Allowlist und wird
bei jedem Build nach `_deploy/ki-musik/` übernommen. Die großen Musikdateien unter
`/media/ki-musik/` werden dagegen separat auf IONOS verwaltet und sind nicht Teil
des Repository-Deploys.

## Automatisches Deploy-Inventar

Nach Kopieren, Bereinigen und Validieren erstellt `build_deploy.ps1` das
Inventar aus dem **tatsächlichen Uploadpaket** unter:

```text
_deploy/admin/site_inventory.json
```

Produktiv ist es damit nur unter `/admin/site_inventory.json` erreichbar. Das
generierte JSON und `_deploy` werden nicht versioniert. Es ist kein Server-Schritt
nötig und keine Inventory-Datei wird nach GitHub zurückkopiert.
`generate_inventory.py` ist lediglich ein optionaler lokaler Entwicklerhelfer.

## Serverordner unbedingt erhalten

> **NIEMALS den kompletten IONOS-Ordner `/admin` löschen und anschließend neu
> hochladen.** IONOS erzeugt und verwaltet darin serverseitig
> `/admin/.htaccess` für „Geschützte Verzeichnisse“. Diese Datei existiert
> ausschließlich auf IONOS, gehört weder ins Repository noch nach `_deploy`
> und darf nicht ersetzt werden.

Richtig ist: Den Inhalt von `_deploy/admin` in den **bestehenden** Serverordner
`/admin` hochladen und vorhandene Website-Dateien überschreiben. Die
serverseitige `.htaccess` bleibt unangetastet. Es wird keine eigene Passwortdatei
oder Login-Logik bereitgestellt.

Auch `/dateien` (große Download-Dateien) und `/logs` werden separat auf IONOS
verwaltet. Beide Ordner niemals durch `_deploy` löschen oder synchronisieren.
Der Ordner `webseite_2_0` ist als Defense-in-Depth vom Build ausgeschlossen und
kein produktiver Websitepfad.
