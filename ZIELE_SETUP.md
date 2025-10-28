# Ziele-Tabelle in Supabase einrichten

## Problem
Die Fehlermeldung `"Could not find the 'userid' column of 'ziele' in the schema cache"` bedeutet, dass die `ziele` Tabelle in der Supabase-Datenbank noch nicht existiert.

## Lösung

### 1. Supabase Dashboard öffnen
- Gehen Sie zu [supabase.com](https://supabase.com)
- Loggen Sie sich ein und öffnen Sie Ihr Projekt

### 2. SQL Editor öffnen
- Klicken Sie im linken Menü auf "SQL Editor"
- Erstellen Sie eine neue Query

### 3. SQL Script ausführen
Kopieren Sie den Inhalt der Datei `create_ziele_table.sql` und führen Sie ihn aus.

Das Script erstellt:
- ✅ Die `ziele` Tabelle mit korrekter Struktur
- ✅ RLS (Row Level Security) Policies
- ✅ Indizes für bessere Performance
- ✅ Constraint für nur ein Hauptziel pro Benutzer

### 4. Tabelle überprüfen
Nach der Ausführung sollten Sie die neue Tabelle im "Table Editor" sehen können.

## Tabellenstruktur

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | BIGSERIAL | Primärschlüssel |
| ziel_typ | INTEGER | 1 = Zwischenziel, 2 = Hauptziel |
| ziel_ziel | DECIMAL(5,2) | Gewichtsziel in kg |
| ziel_datum | DATE | Zieldatum |
| created_at | TIMESTAMP | Erstellungszeitpunkt |
| Userid | UUID | Benutzer-ID (FK zu auth.users) |

## RLS Policies
- Benutzer können nur ihre eigenen Ziele sehen, erstellen, bearbeiten und löschen
- Ein Benutzer kann nur ein Hauptziel (ziel_typ = 2) haben

## Nach der Erstellung
Die Ziele-Funktionalität in der App sollte dann funktionieren:
- Button "Ziele definieren" öffnet das Modal
- Hauptziel und Zwischenziele können erstellt werden
- Ziele werden korrekt gespeichert und angezeigt