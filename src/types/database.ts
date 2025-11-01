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

export interface Ziele {
  id: number
  ziel_typ: number // 2 = Hauptziel, 1 = Zwischenziel
  ziel_ziel: number // Gewichtsziel
  ziel_datum: string // Zieldatum
  created_at: string
  Userid: string
}

// Lungenfunktions-Tabellen
export interface Basisdaten {
  id: number
  datum: string
  groesse_cm: number | null
  gewicht_kg: number | null
  gesamt_soll_prozent: number | null
  messung_kh: boolean
  created_at: string
}

export interface Messungen {
  id: number
  basisdaten_id: number
  parameter: string
  soll: number | null
  ugw: number | null
  versuch_1: number | null
  versuch_2: number | null
  versuch_3: number | null
  bester_versuch: number | null
  soll_prozent: number | null
  bemerkung: string | null
  created_at: string
}

// Input Types für neue Einträge
export type WerteInsert = Omit<Werte, 'id' | 'created_at'>
export type WerteUpdate = Partial<Omit<Werte, 'id' | 'created_at' | 'Userid'>>

export type WochenplanInsert = Omit<Wochenplan, 'id' | 'created_at'>
export type WochenplanUpdate = Partial<Omit<Wochenplan, 'id' | 'created_at' | 'Userid'>>

export type ZieleInsert = Omit<Ziele, 'id' | 'created_at'>
export type ZieleUpdate = Partial<Omit<Ziele, 'id' | 'created_at' | 'Userid'>>

export type BasisdatenInsert = Omit<Basisdaten, 'id' | 'created_at'>
export type BasisdatenUpdate = Partial<Omit<Basisdaten, 'id' | 'created_at'>>

export type MessungenInsert = Omit<Messungen, 'id' | 'created_at'>
export type MessungenUpdate = Partial<Omit<Messungen, 'id' | 'created_at'>>

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
      ziele: {
        Row: Ziele
        Insert: ZieleInsert
        Update: ZieleUpdate
      }
      basisdaten: {
        Row: Basisdaten
        Insert: BasisdatenInsert
        Update: BasisdatenUpdate
      }
      messungen: {
        Row: Messungen
        Insert: MessungenInsert
        Update: MessungenUpdate
      }
    }
  }
}
