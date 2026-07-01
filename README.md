# Taskwall

Eine moderne Aufgabenverwaltung mit zwei Ansichten:

- **Pinnwand** – freie Kacheln (wie Haftnotizen), die man frei per Drag & Drop positionieren und zum initialen Erfassen von Aufgaben nutzen kann.
- **Board** – erreichbar durch Ziehen einer Karte an den rechten Bildrand der Pinnwand (oder über die Navigation). Zeigt die Aufgaben als **Kanban-Board** (Backlog · In Arbeit · Review · Erledigt) oder als **Plan**-Ansicht (Zeitstrahl nach Start-/Enddatum). Von dort führt der linke Bildrand zurück zur Pinnwand.

Jede Aufgabe hat: Titel, Beschreibung, Zuständigkeit, Beginn, Ende, Kategorie und Hashtags. Zuständigkeiten werden über die **Personen verwalten**-Funktion vorab gepflegt.

Alle Daten werden lokal im Browser (`localStorage`) gespeichert.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Produktions-Build
```

## Tech-Stack

React, TypeScript, Vite, Tailwind CSS, [@dnd-kit](https://dndkit.com/) (Drag & Drop), Zustand (State/Persistenz).
