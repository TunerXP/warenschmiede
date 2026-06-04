# Warenschmiede CNC Fräsen-Einrichtsblatt Plus v1.0.35.0

HTML-Tool für digitale CNC-Fräsen-Einrichtsblätter mit Fräsmaschinen-/Projekt-Datenbank, Aufspannskizze, Nullpunkten, Werkzeugliste, JSON-Backup und Druckausgabe.

## Fokus

Diese Version ist bewusst auf Fräsmaschinen ausgerichtet:

- normale 3-Achs-Fräsmaschinen
- Langbett-Fräsmaschinen
- Wechseltisch-Fräsmaschinen
- 4-/5-/6-Achs-Fräsmaschinen bzw. Bearbeitungszentren

Drehmaschinen sind nicht Teil dieser Hauptversion. Dafür ist später ein eigenes Modul oder ein separates Tool sinnvoll, weil Drehmaschinen eine andere Logik haben: Spannfutter, Backen, Revolver, X/Z, Reitstock, Lünette, Gegenspindel usw.

## Enthalten

- Maschinenverwaltung für Fräsmaschinen
- Projektverwaltung je Maschine
- Aufspannskizze mit Bausteinen, Gruppen, Kantenmaß und Farben
- Nullpunktverwaltung G54-G59
- Werkzeugliste mit Fräs-/Bohrwerkzeugen
- Blanko-Druck mit wählbarer Werkzeuganzahl
- JSON Export / Import

## Nutzung

`index.html` im Browser öffnen. Daten werden lokal im Browser gespeichert. Für Sicherung und Weitergabe regelmäßig JSON Export / Backup speichern.


## v1.0.35.0

- Projektverwaltung erweitert: Dropdown kann jetzt alle Maschinen durchsuchen.
- Suchergebnisse werden bei Alle-Suche nach Maschine gruppiert.
- Projektkarten zeigen weiterhin Maschine, Zeichnungsnummer und Datum.


## v1.0.35.0

- Projektstatus/Ampel ergänzt: Entwurf, Muster, Aktiv.
- Status erscheint im Einrichtblatt-Kopf, in der Übersicht und in der Projektverwaltung.
- Kurze Projekt-Verwaltungsnotiz ergänzt.


## v1.0.35.0

- Maschinenverwaltung erweitert: Suche nach Maschine, Steuerung und Aufnahme.
- Achsfilter für 3/4/5/6 Achsen ergänzt.
- Maschinenliste links ist am Desktop separat scrollbar, Bearbeitung rechts bleibt stehen.


## v1.0.35.0

- Übersicht als Info-Cockpit umgebaut.
- Statistik-Karten für Maschinen, Projekte, Werkzeuge und aktive Maschine ergänzt.
- Automatische Historie für neue, kopierte, bearbeitete und gelöschte Maschinen/Projekte ergänzt.
- Schnellzugriff zeigt letzte Projekte mit Status.


## v1.0.35.0

- Übersicht kompakter gemacht: Werkzeuge/aktive Maschine aus den Statistik-Karten entfernt.
- Achsen werden ausgeschrieben angezeigt, z. B. `Achse 3: 4 Stück`.
- Historien-Einträge sind klickbar und öffnen Projekt oder Maschine direkt.


## v1.0.35.0

- Einrichtblatt-Kopf erweitert: Maschine kann direkt gesucht/gefiltert werden.
- Projektbezogener Maschinenmodus ergänzt.
- Bei Langbett-Maschinen mit Trennwand-Möglichkeit kann je Projekt `Trennwand aktiv` ein-/ausgeschaltet werden.
- Druckausgabe zeigt den Maschinenmodus mit an.
