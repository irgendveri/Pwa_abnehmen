-- Erstelle die ziele Tabelle in Supabase
CREATE TABLE IF NOT EXISTS public.ziele (
    id BIGSERIAL PRIMARY KEY,
    ziel_typ INTEGER NOT NULL CHECK (ziel_typ IN (1, 2)), -- 1 = Zwischenziel, 2 = Hauptziel
    ziel_ziel DECIMAL(5,2) NOT NULL CHECK (ziel_ziel > 0), -- Gewichtsziel (z.B. 75.50 kg)
    ziel_datum DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "Userid" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS (Row Level Security) aktivieren
ALTER TABLE public.ziele ENABLE ROW LEVEL SECURITY;

-- RLS Policy für SELECT (Benutzer können nur ihre eigenen Ziele sehen)
CREATE POLICY "Users can view own ziele" ON public.ziele
    FOR SELECT USING (auth.uid() = "Userid");

-- RLS Policy für INSERT (Benutzer können nur Ziele für sich selbst erstellen)
CREATE POLICY "Users can insert own ziele" ON public.ziele
    FOR INSERT WITH CHECK (auth.uid() = "Userid");

-- RLS Policy für UPDATE (Benutzer können nur ihre eigenen Ziele aktualisieren)
CREATE POLICY "Users can update own ziele" ON public.ziele
    FOR UPDATE USING (auth.uid() = "Userid");

-- RLS Policy für DELETE (Benutzer können nur ihre eigenen Ziele löschen)
CREATE POLICY "Users can delete own ziele" ON public.ziele
    FOR DELETE USING (auth.uid() = "Userid");

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_ziele_userid ON public.ziele("Userid");
CREATE INDEX IF NOT EXISTS idx_ziele_typ ON public.ziele(ziel_typ);

-- Constraint: Nur ein Hauptziel pro Benutzer
CREATE UNIQUE INDEX IF NOT EXISTS idx_ziele_unique_hauptziel 
ON public.ziele("Userid") 
WHERE ziel_typ = 2;

-- Kommentare für Dokumentation
COMMENT ON TABLE public.ziele IS 'Tabelle für Gewichtsziele der Benutzer';
COMMENT ON COLUMN public.ziele.ziel_typ IS '1 = Zwischenziel, 2 = Hauptziel';
COMMENT ON COLUMN public.ziele.ziel_ziel IS 'Gewichtsziel in kg';
COMMENT ON COLUMN public.ziele.ziel_datum IS 'Datum bis wann das Ziel erreicht werden soll';