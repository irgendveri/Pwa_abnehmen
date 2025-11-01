import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import type { Basisdaten, Messungen, BasisdatenInsert, MessungenInsert } from '../types/database'

// Interface für Messwerte aus dem Formular
export interface MesswertFormData {
  fvc: number | null | string
  fev1: number | null | string
  fev1_fvc: number | null | string
  fef25_75: number | null | string
  mef75: number | null | string
  mef50: number | null | string
  mef25: number | null | string
  pef: number | null | string
  fet: number | null | string
  fivc: number | null | string
  pif: number | null | string
}

export function useLufu() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { user } = useAuthStore()

  // Basisdaten speichern
  const saveBasisdaten = async (data: {
    datum: string
    groesse: number | null
    gewicht: number | null
    gesamtergebnis: number | null
    messungKh: boolean
  }) => {
    if (!user.value?.id) {
      error.value = 'Benutzer nicht authentifiziert'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const basisdatenInsert: BasisdatenInsert = {
        datum: data.datum,
        groesse_cm: data.groesse,
        gewicht_kg: data.gewicht,
        gesamt_soll_prozent: data.gesamtergebnis,
        messung_kh: data.messungKh,
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('basisdaten')
        .insert(basisdatenInsert)
        .select()
        .single()

      if (insertError) throw insertError

      return insertedData as Basisdaten
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      error.value = errorMessage
      console.error('Fehler beim Speichern der Basisdaten:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Erweiterte Messungen speichern
  const saveMessungen = async (basisdatenId: number, isKhMessung: boolean, data: {
    messwerte: MesswertFormData[]
    sollwerte?: MesswertFormData[]
    sollProzentWerte?: MesswertFormData[]
    ugwWerte?: MesswertFormData[]
  }) => {
    loading.value = true
    error.value = null

    try {
      const messungenToInsert: MessungenInsert[] = []

      // Parameter definieren abhängig von KH-Messung
      let parameters: string[]
      let parameterKeys: string[]

      if (isKhMessung) {
        parameters = ['FVC', 'FEV1', 'FEV1/FVC', 'PEF', 'MEF75', 'MEF50', 'MEF25']
        parameterKeys = ['fvc', 'fev1', 'fev1_fvc', 'pef', 'mef75', 'mef50', 'mef25']
      } else {
        parameters = ['FVC', 'FEV1', 'FEV1/FVC', 'FEF25-75%', 'MEF75', 'MEF50', 'MEF25', 'PEF', 'FET', 'FIVC', 'PIF']
        parameterKeys = ['fvc', 'fev1', 'fev1_fvc', 'fef25_75', 'mef75', 'mef50', 'mef25', 'pef', 'fet', 'fivc', 'pif']
      }

      parameters.forEach((parameter, index) => {
        const key = parameterKeys[index] as keyof MesswertFormData
        const versuche: number[] = []
        let sollWert: number | null = null
        let sollProzentWert: number | null = null
        let ugwWert: number | null = null

        // Sammle Messwerte
        data.messwerte.forEach(messwert => {
          const value = messwert[key]
          if (value !== null && value !== '') {
            versuche.push(Number(value))
          }
        })

        // Berechne besten Wert (höchster Wert für die meisten Parameter)
        let besterWert: number | null = null
        if (versuche.length > 0) {
          besterWert = Math.max(...versuche)
        }

        // Sammle Soll-Werte
        if (data.sollwerte && data.sollwerte[0]) {
          const value = data.sollwerte[0][key]
          if (value !== null && value !== '') {
            sollWert = Number(value)
          }
        }

        // Sammle Soll-Prozent-Werte
        if (data.sollProzentWerte && data.sollProzentWerte[0]) {
          const value = data.sollProzentWerte[0][key]
          if (value !== null && value !== '') {
            sollProzentWert = Number(value)
          }
        }

        // Sammle UGW-Werte
        if (data.ugwWerte && data.ugwWerte[0]) {
          const value = data.ugwWerte[0][key]
          if (value !== null && value !== '') {
            ugwWert = Number(value)
          }
        }



        // Erstelle Eintrag wenn Werte vorhanden
        if (versuche.length > 0 || sollWert !== null || sollProzentWert !== null || ugwWert !== null) {
          messungenToInsert.push({
            basisdaten_id: basisdatenId,
            parameter: parameter,
            versuch_1: versuche[0] || null,
            versuch_2: versuche[1] || null,
            versuch_3: versuche[2] || null,
            bester_versuch: besterWert,
            soll: sollWert,
            ugw: ugwWert,
            soll_prozent: sollProzentWert,
            bemerkung: versuche.length > 0 ? `${versuche.length} Versuch${versuche.length > 1 ? 'e' : ''}` : 'Referenzwerte'
          })
        }
      })

      if (messungenToInsert.length === 0) {
        return []
      }

      const { data: insertedMessungen, error: insertError } = await supabase
        .from('messungen')
        .insert(messungenToInsert)
        .select()

      if (insertError) throw insertError

      return insertedMessungen as Messungen[]
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      error.value = errorMessage
      console.error('Fehler beim Speichern der Messungen:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Alle Basisdaten laden (nach Datum sortiert, neueste zuerst)
  const loadBasisdaten = async () => {
    if (!user.value?.id) {
      error.value = 'Benutzer nicht authentifiziert'
      return []
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await supabase
        .from('basisdaten')
        .select(`
          *,
          messungen (
            id,
            parameter,
            soll,
            ugw,
            versuch_1,
            versuch_2,
            versuch_3,
            bester_versuch,
            soll_prozent
          )
        `)
        .order('datum', { ascending: false })

      if (loadError) throw loadError

      return data as (Basisdaten & {
        messungen: {
          id: number;
          parameter: string;
          soll: number | null;
          ugw: number | null;
          versuch_1: number | null;
          versuch_2: number | null;
          versuch_3: number | null;
          bester_versuch: number | null;
          soll_prozent: number | null;
        }[]
      })[]
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      error.value = errorMessage
      console.error('Fehler beim Laden der Basisdaten:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Einzelne Messung aktualisieren
  const updateMessung = async (messungId: number, updateData: {
    soll?: number | null
    ugw?: number | null
    versuch_1?: number | null
    versuch_2?: number | null
    versuch_3?: number | null
    soll_prozent?: number | null
  }) => {
    loading.value = true
    error.value = null

    try {
      // Berechne besten Wert neu, wenn Versuche geändert wurden
      const versuche = [updateData.versuch_1, updateData.versuch_2, updateData.versuch_3]
        .filter(v => v !== null && v !== undefined) as number[]

      const besterVersuch = versuche.length > 0 ? Math.max(...versuche) : null

      const { data: updatedMessung, error: updateError } = await supabase
        .from('messungen')
        .update({
          ...updateData,
          bester_versuch: besterVersuch
        })
        .eq('id', messungId)
        .select()
        .single()

      if (updateError) throw updateError

      return updatedMessung as Messungen
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      error.value = errorMessage
      console.error('Fehler beim Aktualisieren der Messung:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Komplette Lufu-Daten speichern
  const saveLufuData = async (data: {
    datum: string
    groesse: number | null
    gewicht: number | null
    gesamtergebnis: number | null
    messungKh: boolean
    messwerte: MesswertFormData[]
    sollwerte?: MesswertFormData[]
    sollProzentWerte?: MesswertFormData[]
    ugwWerte?: MesswertFormData[]
  }) => {
    try {
      // Zuerst Basisdaten speichern
      const basisdaten = await saveBasisdaten({
        datum: data.datum,
        groesse: data.groesse,
        gewicht: data.gewicht,
        gesamtergebnis: data.gesamtergebnis,
        messungKh: data.messungKh
      })

      if (!basisdaten) {
        throw new Error('Fehler beim Speichern der Basisdaten')
      }

      // Dann Messungen speichern
      const messungen = await saveMessungen(basisdaten.id, data.messungKh, {
        messwerte: data.messwerte,
        sollwerte: data.sollwerte,
        sollProzentWerte: data.sollProzentWerte,
        ugwWerte: data.ugwWerte
      })

      if (messungen === null) {
        throw new Error('Fehler beim Speichern der Messungen')
      }

      return {
        basisdaten,
        messungen
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      error.value = errorMessage
      console.error('Fehler beim Speichern der kompletten Lufu-Daten:', err)
      return null
    }
  }

  return {
    loading,
    error,
    saveBasisdaten,
    saveMessungen,
    saveLufuData,
    loadBasisdaten,
    updateMessung
  }
}
