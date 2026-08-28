window.WSLearningChatData = {
  defaultChatId: "intro",
  groups: [
    { id: "pinned", label: "Angeheftet" },
    { id: "practice", label: "Praxis" }
  ],
  chats: [
    {
      id: "intro",
      title: "Einstieg – Was kann KI?",
      group: "pinned",
      description: "Ein kurzer Rundgang durch moderne KI.",
      steps: [
        { type: "assistant", text: "Hallo 👋 Wenn KI für dich noch neu ist, reicht für den Anfang etwas ganz Einfaches: Du kannst ganz normal mit ihr sprechen." },
        { type: "assistant", text: "Moderne KI kann dir Texte erklären, Bilder ansehen, Dateien zusammenfassen, Ideen entwickeln und bei vielen Aufgaben Schritt für Schritt mitarbeiten." },
        { type: "assistant", text: "Du musst dafür weder programmieren können noch einen perfekten Prompt auswendig lernen. Wichtig ist vor allem, dass du sagst, was du gerade erreichen möchtest." },
        { type: "checkpoint", label: "Zeig mir ein Beispiel" },
        { type: "compose", text: "Ich habe noch nie mit KI gearbeitet. Was wäre eine gute erste Aufgabe?" },
        { type: "send" },
        { type: "working", text: "KI arbeitet …" },
        { type: "assistant", text: "Nimm etwas Echtes aus deinem Alltag: einen Text, den du besser formulieren willst, eine Frage, die du verstehen möchtest, oder einen Screenshot mit einer Fehlermeldung." },
        { type: "assistant", text: "Und wenn die erste Antwort noch nicht passt, frag einfach weiter. Genau dieses Hin und Her macht einen KI-Chat praktisch." },
        { type: "lesson", title: "Das hast du gerade gelernt", text: "Du brauchst keinen perfekten Zauberspruch. Starte natürlich und arbeite im Gespräch weiter." }
      ]
    },
    {
      id: "screenshot",
      title: "Einen Screenshot zeigen",
      group: "pinned",
      description: "Fehlermeldungen direkt als Bild erklären lassen.",
      steps: [
        { type: "assistant", text: "Ein Bild spart oft viel Tipparbeit. Wenn eine Fehlermeldung auf dem Bildschirm steht, kannst du der KI einfach den relevanten Ausschnitt zeigen." },
        { type: "compose", text: "Beim Speichern kommt diese Fehlermeldung. Was bedeutet sie und was kann ich prüfen?" },
        { type: "attachment", kind: "image", name: "fehlermeldung-beispiel.png", meta: "Screenshot" },
        { type: "send" },
        { type: "working", text: "Bild wird betrachtet …" },
        { type: "assistant", text: "Auf dem Screenshot ist eine Fehlermeldung beim Speichern zu sehen. Ich würde zuerst prüfen, ob der Zielordner erreichbar ist und ob du dort Schreibrechte hast." },
        { type: "assistant", text: "Falls das nicht hilft, wäre die nächste gute Rückfrage: Was genau wurde kurz vor dem Fehler geändert?" },
        { type: "lesson", title: "Wichtig vor dem Senden", text: "Zeige nur den relevanten Bereich und prüfe, ob Namen, E-Mail-Adressen, Kundendaten oder andere vertrauliche Informationen sichtbar sind." },
        { type: "link", label: "Screenshot unter Windows erstellen", href: "/ki/tutorials/screenshots-windows.html" }
      ]
    },
    {
      id: "pdf",
      title: "Eine PDF verstehen",
      group: "pinned",
      description: "Dokumente zusammenfassen und danach weiterfragen.",
      steps: [
        { type: "assistant", text: "Bei längeren Dokumenten musst du nicht jede Seite erst selbst durchsuchen. Wenn dein verwendeter KI-Dienst PDF-Dateien unterstützt, kannst du die Datei anhängen und direkt Fragen dazu stellen." },
        { type: "attachment", kind: "pdf", name: "beispiel-dokument.pdf", meta: "6 Seiten" },
        { type: "compose", text: "Fass mir diese PDF bitte verständlich zusammen und sag mir, was besonders wichtig ist." },
        { type: "send" },
        { type: "working", text: "Dokument wird gelesen …" },
        { type: "assistant", text: "Kurz zusammengefasst: Das Dokument beschreibt drei Hauptpunkte. Erstens die Laufzeit, zweitens wichtige Fristen und drittens die Bedingungen für Änderungen." },
        { type: "assistant", text: "Bei wichtigen Dokumenten solltest du die entscheidenden Stellen anschließend im Original gegenprüfen – eine Zusammenfassung ersetzt nicht das Dokument selbst." },
        { type: "compose", text: "Erklär mir Punkt 3 nochmal einfacher." },
        { type: "send" },
        { type: "working", text: "KI arbeitet …" },
        { type: "assistant", text: "Klar: Änderungen sind möglich, aber nur unter den im Dokument genannten Voraussetzungen. Genau diese Stelle solltest du im Original noch einmal prüfen." },
        { type: "lesson", title: "Dateien sind Gesprächskontext", text: "Nach der ersten Zusammenfassung kannst du gezielt zu einzelnen Stellen weiterfragen." }
      ]
    },
    {
      id: "safety",
      title: "Sicher mit KI arbeiten",
      group: "pinned",
      description: "Was nicht ungeprüft in einen KI-Chat gehört.",
      steps: [
        { type: "assistant", text: "KI kann viel helfen – aber nicht jede Information gehört in einen Chat. Schauen wir uns einen typischen Fehler an." },
        { type: "compose", text: "Mein Passwort ist …" },
        { type: "checkpoint", label: "Stopp – das lieber nicht senden", tone: "warning" },
        { type: "assistant", text: "Passwörter, PINs, TANs, Wiederherstellungscodes oder API-Schlüssel gehören nicht in einen KI-Chat." },
        { type: "assistant", text: "Auch bei personenbezogenen Daten, Kundendaten und vertraulichen Firmendokumenten solltest du vorher prüfen, ob du sie überhaupt verwenden darfst." },
        { type: "assistant", text: "Am Arbeitsplatz können zusätzlich eigene Regeln gelten: Manche Firmen erlauben nur bestimmte KI-Dienste oder sperren externe Angebote vollständig." },
        { type: "lesson", title: "Besser mit Platzhaltern", text: "Schreibe zum Beispiel [KUNDENNAME] oder [PASSWORT] statt echter vertraulicher Werte." },
        { type: "link", label: "KI-FAQ & Sicherheit öffnen", href: "/ki/faq.html" }
      ]
    },
    {
      id: "rewrite",
      title: "Einen Text gemeinsam verbessern",
      group: "practice",
      description: "Im Gespräch Schritt für Schritt zum passenden Ton.",
      steps: [
        { type: "compose", text: "Kannst du das freundlicher schreiben? Ich schaffe den Termin heute nicht und melde mich morgen." },
        { type: "send" },
        { type: "working", text: "KI formuliert …" },
        { type: "assistant", text: "Natürlich: Ich schaffe den Termin heute leider nicht. Ich melde mich morgen nochmal bei dir. Danke für dein Verständnis!" },
        { type: "compose", text: "Etwas lockerer bitte." },
        { type: "send" },
        { type: "assistant", text: "Klar: Heute klappt es bei mir leider nicht mehr. Ich melde mich morgen nochmal 🙂" },
        { type: "compose", text: "Jetzt noch kürzer." },
        { type: "send" },
        { type: "assistant", text: "Heute klappt’s leider nicht. Ich melde mich morgen 🙂" },
        { type: "lesson", title: "Gespräch statt Einmal-Prompt", text: "Du kannst Ton, Länge und Inhalt nach jeder Antwort weiter anpassen." }
      ]
    },
    {
      id: "research",
      title: "Recherchieren & Quellen",
      group: "practice",
      description: "Aktuelle Informationen bewusst prüfen lassen.",
      steps: [
        { type: "compose", text: "Welche wichtigen Änderungen gab es dieses Jahr bei einem Thema, das mich interessiert?" },
        { type: "send" },
        { type: "assistant", text: "Bei aktuellen Themen ist wichtig, dass die verwendete KI tatsächlich recherchieren kann und nicht nur aus älterem Modellwissen antwortet." },
        { type: "compose", text: "Bitte prüfe das aktuell und nenne mir Quellen." },
        { type: "send" },
        { type: "working", text: "Aktuelle Quellen werden geprüft …" },
        { type: "assistant", text: "So ist die Aufgabe besser gestellt: aktuelle Recherche, nachvollziehbare Quellen und anschließend ein eigener Plausibilitätscheck bei wichtigen Aussagen." },
        { type: "lesson", title: "Quellen helfen beim Prüfen", text: "Auch mit Quellen bleibt dein eigener Blick wichtig – besonders bei schnell veränderlichen oder wichtigen Themen." }
      ]
    }
  ]
};
