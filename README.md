# Warenschmiede.com – Website & Tools (GitHub Pages)

Statische Website für **www.warenschmiede.com** (GitHub Pages) mit:
- Leistungsseiten (3D-Druck, CAD & Prototyping, PC-Hilfe)
- Wissensbereich (u. a. 3D-Druck-Know-how)
- KI-Bereich für Einsteiger
- Eigene kleine Tools/Rechner

**Live:** https://www.warenschmiede.com

---

## Was die Website aktuell bietet (Überblick)

### Leistungen (Website-Inhalte)
- **3D-Druck** (Infos + Einstieg + Hilfen)
- **CAD & Prototyping**
- **PC-Hilfe**

### KI-Bereich (für Einsteiger)
Ziel: KI verständlich erklären (ohne Fachchinesisch), mit Beispielen und fairen Hinweisen zu Grenzen & Sicherheit.

Wichtige Seiten:
- **KI Übersicht / Grundlagen:** `/ki/index.html`
- **Prompts für den Alltag:** `/ki/prompts.html`
- **KI-Werkzeuge:** `/ki/tools.html`
- **Chancen & Risiken:** `/ki/chancen-und-risiken.html`
- **KI-FAQ & Sicherheit:** `/ki/faq.html`
- **KI-Lexikon:** `/ki/lexikon.html`
- **KI Trainer (interaktiv):** `/ki/promt-trainer.html`
- **Warenschmiede KI-Finder (interaktiv):** `/ki/ki-finder.html`

### Tools & Rechner (Highlights)
- **Warenschmiede 3D-Druck Suite**  
  URL/Datei (historisch): `/tools/kostenrechner-v2.html`  
  (Name im Menü/auf der Seite: „Warenschmiede 3D-Druck Suite“)

- **Warenschmiede METALL**  
  `/werkstatt-rechner.html`

- **Dokumenten-Tool Light**  
  `/tools/buero/doku-light/`

- **Warenschmiede QR-Master ULTRA**  
  `/tools/buero/doku-light/QRCodeMasterPro.html`

- **Quittungs-Generator**  
  `/tools/buero/doku-light/ReceiptWriterPro.html`

- **CNCMasterCalc**  
  `/tools/buero/doku-light/CNCMasterCalc.html`

Hinweis: Viele Tool-Seiten sind absichtlich **nicht** für Google gedacht (noindex / nicht in Sitemap), damit keine internen Tool-Varianten „wild“ indexiert werden.

---

## Technik (kurz)
- **Statisch:** HTML/CSS/JS
- **Dark/Light/System Theme:** per Toggle + localStorage
- **SEO Monitoring & Sitemap:** `seo_monitor.py` erzeugt Report + optional `sitemap.xml`

---

## Lokal testen (ohne Build-Tool)
Im Repo-Root:

```bash
python -m http.server 8000
