# KI-Prompts & Screenshot-Tutorial – Design

## Ziel
Die bestehende Seite `ki/prompts.html` wird inhaltlich und optisch grundlegend modernisiert. Sie soll erklären, dass moderne KI heute häufig im Gespräch genutzt wird: natürliche Sprache, Kontext, Rückfragen, Screenshots und Dateien sind wichtiger als starre Prompt-Formeln. Präzise Prompts bleiben dort wichtig, wo reproduzierbare oder professionelle Ergebnisse verlangt werden.

Zusätzlich entsteht eine kleine, erweiterbare KI-Tutorial-Struktur. Das erste Tutorial zeigt unter Windows Schritt für Schritt, wie ein relevanter Bildschirmbereich aufgenommen und in einen KI-Chat eingefügt wird.

## Bestehende Architektur respektieren
- Die URL `ki/prompts.html` bleibt unverändert.
- Globaler Header, Navigation und Footer bleiben Eigentum von `assets/js/ws-layout.js` und werden nicht lokal nachgebaut.
- Das bestehende Warenschmiede-Design aus `assets/css/styles.css` bleibt Grundlage.
- Die allgemeine KI-Optik aus `assets/css/ki-content.css` bleibt bestehen; neue Prompt- und Tutorial-Styles werden isoliert ergänzt, damit andere KI-Seiten nicht unbeabsichtigt verändert werden.
- Kein neuer Hauptmenüpunkt für Tutorials, solange die Sammlung noch klein ist.

## Neue Prompt-Seite
Die Seite arbeitet nicht mehr als Raster aus Copy-&-Paste-Promptkarten. Der Aufbau wird redaktioneller und praxisnäher:

1. Hero: „Prompts heute – gute Ergebnisse entstehen im Gespräch“.
2. „Einfach anfangen“: normale Sprache ist erlaubt; der erste Satz muss nicht perfekt sein.
3. „Kontext schlägt Prompt-Zauberei“: Ziel, Ausgangslage, Beispiele und Grenzen helfen mehr als Rollenfloskeln.
4. „Zeigen statt beschreiben“: Screenshots, Bilder, Dokumente und vorhandene Inhalte können direkt Teil der Unterhaltung sein.
5. CTA „Zeig mir, wie das geht“: öffnet das Windows-Screenshot-Tutorial in einem neuen Tab.
6. „Früher gedacht / Heute praktisch“: klarer Vergleich ohne Tabelle.
7. „Wann genaue Prompts trotzdem Gold wert sind“: reproduzierbare Ausgaben, feste Formate, technische Änderungen, professionelle Workflows und klare Grenzen.
8. Datenschutz und Kontrolle: keine sensiblen Daten unbedacht teilen; Ergebnisse bei wichtigen Themen prüfen.

Die Seite soll zeigen: Ein genauer Prompt kann helfen, ist aber keine Voraussetzung für gute Ergebnisse.

## Tutorial-Struktur
Neu:
- `ki/tutorials/index.html` – kleine Sammlung, die später erweitert werden kann.
- `ki/tutorials/screenshots-windows.html` – erstes Tutorial.

Die Prompt-Seite verlinkt direkt auf `screenshots-windows.html` mit `target="_blank"` und `rel="noopener"`.

Die Tutorial-Übersicht bleibt bewusst schlank und enthält zunächst nur das erste Tutorial sowie einen kurzen Hinweis, dass weitere Anleitungen folgen können.

## Windows-Screenshot-Tutorial
Titel: „Screenshot an eine KI senden – so geht’s unter Windows“.

Ablauf:
1. Problem erkennen: `01_programmfehler.png`.
2. Vor dem Senden prüfen: keine Passwörter, PINs/TANs, Wiederherstellungscodes, API-Schlüssel, unnötigen personenbezogenen Daten, Kunden-/Firmendaten oder vertraulichen Unterlagen zeigen. Auf Arbeit zusätzlich betriebliche Regeln prüfen; externe KI kann eingeschränkt oder verboten sein.
3. Tastenkürzel `Windows + Shift + S` zeigen: `05_shift_windows_s_bereich_markieren.png`; erklären, dass Shift die Großschreibtaste ist.
4. Relevanten Bereich markieren: `02_bereich_markieren.png`; nur den Teil aufnehmen, den die KI wirklich sehen muss.
5. Mit `Strg + V` in den Chat einfügen: `07_strg_v_einfuegen.png`.
6. Eingefügtes Bild zeigen: `03_bild_im_ki_chat_einfuegen.png`.
7. Kurz dazuschreiben, was passiert und was erwartet wurde.
8. Beispiel für KI-Antwort: `04_ki_antwort_und_loesung.png`.

`06_strg_c_kopieren.png` wird in diesem Tutorial nicht benötigt, bleibt aber als wiederverwendbare Tastatur-Grundlage erhalten.

## Vorhandene Bilder
Tutorial-Ablauf:
- `assets/img/tutorials/ki/screenshots-am-pc/01_programmfehler.png`
- `assets/img/tutorials/ki/screenshots-am-pc/02_bereich_markieren.png`
- `assets/img/tutorials/ki/screenshots-am-pc/03_bild_im_ki_chat_einfuegen.png`
- `assets/img/tutorials/ki/screenshots-am-pc/04_ki_antwort_und_loesung.png`

Wiederverwendbare Windows-Tastaturbilder:
- `assets/img/tutorials/grundlagen/tastatur/windows/05_shift_windows_s_bereich_markieren.png`
- `assets/img/tutorials/grundlagen/tastatur/windows/06_strg_c_kopieren.png`
- `assets/img/tutorials/grundlagen/tastatur/windows/07_strg_v_einfuegen.png`
- `assets/img/tutorials/grundlagen/tastatur/windows/08_strg_x_ausschneiden.png`
- `assets/img/tutorials/grundlagen/tastatur/windows/09_strg_a_alles_markieren.png`
- `assets/img/tutorials/grundlagen/tastatur/windows/10_strg_z_rueckgaengig.png`

Alle aktuellen Tutorial-/Tastaturbilder haben 1672 × 941 Pixel.

## Optik
- Hell, sauber und passend zur aktuellen Warenschmiede.
- Große redaktionelle Bereiche statt alter Tabellen-/Kartenwand.
- Klare Schrittzahlen und gut sichtbare Tastenkürzel.
- Bilder groß genug, damit Details erkennbar sind; responsive auf Mobilgeräten.
- Keine separate lokale Navigation; Breadcrumbs und globaler Shell bleiben konsistent.
- Keine unnötige Animation oder Interaktivität.

## Sicherheit & rechtliche Einordnung
Die Seite gibt keine Rechtsberatung. Datenschutz wird praktisch formuliert: vor Uploads prüfen, ob Inhalte personenbezogen, vertraulich oder betrieblich geschützt sind; nur den nötigen Ausschnitt teilen; betriebliche KI-Regeln beachten. Besonders sensible Zugangsdaten gehören nicht in den Chat.

## Erfolgskriterien
- `ki/prompts.html` wirkt modern und erklärt heutige KI-Nutzung ohne Prompt-Mythen.
- Präzise Prompts werden nicht abgewertet, sondern passend eingeordnet.
- Das erste Tutorial ist direkt aus der Prompt-Seite erreichbar und öffnet in neuem Tab.
- Alle sechs im Tutorial verwendeten Bilder laden über die vorhandenen Asset-Pfade.
- Header, Navigation und Footer kommen weiterhin ausschließlich aus `ws-layout.js`.
- Desktop und Mobil bleiben ohne horizontales Überlaufen nutzbar.
- Neue Tutorial-Seiten sind über die Sitemap auffindbar.
