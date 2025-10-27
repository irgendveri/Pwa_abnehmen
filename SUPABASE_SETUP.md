# PWA Abnehmen - Supabase Integration

Eine Vue.js PWA-Anwendung mit Supabase-Backend für eine Abnehm-App.

## Supabase Einrichtung

### 1. Umgebungsvariablen konfigurieren

Bearbeiten Sie die `.env` Datei und ersetzen Sie `YOUR_SUPABASE_ANON_KEY` mit Ihrem echten Supabase anon/public API Key:

```env
VITE_SUPABASE_URL=https://ivibuchtbqvnzixhlduf.supabase.co
VITE_SUPABASE_ANON_KEY=IHR_ECHTER_SUPABASE_ANON_KEY
```

### 2. Supabase API Key finden

1. Gehen Sie zu Ihrem Supabase Dashboard: https://app.supabase.com
2. Wählen Sie Ihr Projekt aus
3. Navigieren Sie zu **Settings** → **API**
4. Kopieren Sie den **anon/public** Key (nicht den service_role Key!)

### 3. Authentifizierung einrichten

Die App ist bereits für E-Mail/Passwort-Authentifizierung konfiguriert. In Ihrem Supabase Dashboard:

1. Gehen Sie zu **Authentication** → **Settings**
2. Stellen Sie sicher, dass "Enable email confirmations" aktiviert ist
3. Konfigurieren Sie die E-Mail-Vorlagen nach Bedarf

### 4. Datenbank-Tabellen (Beispiel)

Hier ist ein Beispiel-Schema für eine Abnehm-App:

```sql
-- Benutzerprofile
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Gewichtsverlauf
CREATE TABLE weight_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mahlzeiten
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security aktivieren
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policies erstellen
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own weight entries" ON weight_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight entries" ON weight_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight entries" ON weight_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight entries" ON weight_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON meals FOR DELETE USING (auth.uid() = user_id);
```

## Verwendung

### Authentifizierung

```typescript
import { useAuth } from './composables/useAuth'

const { user, signIn, signUp, signOut } = useAuth()

// Anmelden
await signIn('email@example.com', 'password')

// Registrieren
await signUp('email@example.com', 'password')

// Abmelden
await signOut()
```

### Datenbankoperationen

```typescript
import { useDatabase } from './composables/useDatabase'

const { fetchData, insertData, updateData, deleteData } = useDatabase()

// Daten abrufen
const weightEntries = await fetchData('weight_entries', { user_id: user.value?.id })

// Daten einfügen
const newEntry = await insertData('weight_entries', {
  user_id: user.value?.id,
  weight: 75.5,
  date: '2023-12-01'
})

// Daten aktualisieren
const updated = await updateData('weight_entries', entryId, { weight: 74.8 })

// Daten löschen
await deleteData('weight_entries', entryId)
```

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build
```

## Wichtige Sicherheitshinweise

1. **Niemals** den `service_role` Key in Frontend-Code verwenden
2. Verwenden Sie immer Row Level Security (RLS) für Ihre Tabellen
3. Testen Sie Ihre Policies gründlich
4. Halten Sie Ihre Supabase-Projekteinstellungen sicher

## Nächste Schritte

1. API Key in der `.env` Datei konfigurieren
2. Datenbank-Schema in Supabase erstellen
3. Authentifizierung testen
4. Spezifische Features für die Abnehm-App implementieren

## Support

Bei Problemen konsultieren Sie die [Supabase Dokumentation](https://supabase.com/docs) oder das [Vue.js Guide](https://vuejs.org/guide/).