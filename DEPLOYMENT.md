# Deployment auf IONOS

GitHub beziehungsweise die Arbeitskopie enthalten die Website-Quellen. Für ein
Website-Deployment wird ausschließlich der automatisch erzeugte Ordner
`_deploy` verwendet.

## Ablauf

1. Den Branch `main` lokal aktualisieren.
2. Im Repository-Root `./build_deploy.ps1` in PowerShell ausführen.
3. Den frisch erzeugten Inhalt von `_deploy` prüfen.
4. **Den Inhalt** von `_deploy` mit FileZilla nach IONOS `/` hochladen.
5. IONOS `/dateien` bei Bedarf separat mit FileZilla verwalten.

Das Skript löscht einen lokal vorhandenen `_deploy`-Ordner vor jedem Build und
legt ihn anhand einer festen Allowlist neu an. Es stellt keine FTP- oder
SFTP-Verbindung her und enthält keine Zugangsdaten.

> **Wichtig:** IONOS `/dateien` und `/logs` beim Website-Deployment niemals
> löschen oder synchronisieren. Beide Serverordner werden separat verwaltet.
> Das Deploy-Skript erzeugt, löscht oder verändert diese Ordner nicht.

`_deploy` ist ein lokales Build-Artefakt und wird nicht versioniert. Es enthält
weder Repository- und Wartungsdateien noch Server-Downloads, Server-Logs oder
Visual-Studio-Daten.
