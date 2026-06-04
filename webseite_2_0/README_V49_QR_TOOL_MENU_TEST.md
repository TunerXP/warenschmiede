# v49 QR-Werkstatt Plus · W-TOOLS-Menü Test

## Ziel
Erster Test für ein kleines zentrales Tool-Menü in einem bestehenden Tool.

Test-Tool:
`webseite_2_0/tools/QRCodeMasterPro.html`

## Was passiert?
Der Patch lässt die Tool-Funktion selbst unangetastet und ergänzt nur zentral ladbare Dateien:

- `assets/css/ws-tool-menu.css`
- `assets/js/ws-tool-menu.js`
- `assets/js/ws-qr-tool-patch.js`
- `assets/img/w-tools-menu.png`

Im QR-Tool wird per Laufzeit-Patch:
- Titel oben auf `QR-Werkstatt Plus` geändert
- Untertitel/Version im Tool-Header entfernt
- rechte Header-Buttons reduziert:
  - W-TOOLS-Menü
  - Hell/Dunkel
  - Hilfe
- das W-TOOLS-Menü als seitliches Panel ergänzt

## Anwendung

1. ZIP-Inhalt in `webseite_2_0/` kopieren und vorhandene Dateien zusammenführen.
2. Danach im Ordner `webseite_2_0/tools/` die Datei starten:
   `PATCH_QR_TOOL_MENU_V49.cmd`
3. Der Patch erstellt automatisch ein Backup:
   `QRCodeMasterPro_backup_vor_tool_menu_v49.html`

## Warum als Patch?
Damit die komplette QR-Code-Logik nicht neu gebaut oder beschädigt wird. Der Patch ergänzt nur Menü/Optik.
