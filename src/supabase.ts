import { createClient } from '@supabase/supabase-js'

// Supabase Konfiguration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL und Key müssen in der .env Datei definiert werden')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
