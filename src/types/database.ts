// Datenbank-Types basierend auf der Supabase-Struktur

export interface Werte {
  id: number
  wert_datum: string
  wert_gewicht: number
  wert_taille: number
  wert_bauch: number
  wert_po: number
  wert_oberschenkel: number
  created_at: string
  Userid: string
}

export interface Wochenplan {
  id: number
  plan_datum: string
  plan_frueh: string
  plan_mittag: string
  plan_abend: string
  created_at: string
  Userid: string
}

// Input Types für neue Einträge
export type WerteInsert = Omit<Werte, 'id' | 'created_at'>
export type WerteUpdate = Partial<Omit<Werte, 'id' | 'created_at' | 'Userid'>>

export type WochenplanInsert = Omit<Wochenplan, 'id' | 'created_at'>
export type WochenplanUpdate = Partial<Omit<Wochenplan, 'id' | 'created_at' | 'Userid'>>

// Supabase Database Schema Type
export interface Database {
  public: {
    Tables: {
      werte: {
        Row: Werte
        Insert: WerteInsert
        Update: WerteUpdate
      }
      wochenplan: {
        Row: Wochenplan
        Insert: WochenplanInsert
        Update: WochenplanUpdate
      }
    }
  }
}
