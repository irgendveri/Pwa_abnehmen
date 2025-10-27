import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import type { Werte } from '../types/database'
import { useAuth } from './useAuth'

export function useWerte() {
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const werte = ref<Werte[]>([])

  // Alle Werte für den aktuellen Benutzer abrufen
  const fetchWerte = async () => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('werte')
        .select('*')
        .eq('Userid', user.value.id)
        .order('wert_datum', { ascending: false })

      if (fetchError) throw fetchError

      werte.value = data as Werte[] || []
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Abrufen der Werte:', err)
    } finally {
      loading.value = false
    }
  }

  // Neue Werte hinzufügen
  const addWert = async (wertData: {
    wert_datum: string
    wert_gewicht: number
    wert_taille: number
    wert_bauch: number
    wert_po: number
    wert_oberschenkel: number
  }) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const insertData = {
        ...wertData,
        Userid: user.value.id
      }

      const { data, error: insertError } = await supabase
        .from('werte')
        .insert(insertData)
        .select()
        .single()

      if (insertError) throw insertError

      const newWert = data as Werte
      werte.value.unshift(newWert)
      return newWert
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Hinzufügen der Werte:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Werte aktualisieren
  const updateWert = async (id: number, updates: {
    wert_datum?: string
    wert_gewicht?: number
    wert_taille?: number
    wert_bauch?: number
    wert_po?: number
    wert_oberschenkel?: number
  }) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('werte')
        .update(updates)
        .eq('id', id)
        .eq('Userid', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      const updatedWert = data as Werte
      const index = werte.value.findIndex(w => w.id === id)
      if (index !== -1) {
        werte.value[index] = updatedWert
      }

      return updatedWert
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Aktualisieren der Werte:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Werte löschen
  const deleteWert = async (id: number) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('werte')
        .delete()
        .eq('id', id)
        .eq('Userid', user.value.id)

      if (deleteError) throw deleteError

      werte.value = werte.value.filter(w => w.id !== id)
      return true
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Löschen der Werte:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Computed: Letzter Wert
  const latestWert = computed(() => {
    return werte.value.length > 0 ? werte.value[0] : null
  })

  // Computed: Gewichtsverlauf für Diagramm
  const gewichtsverlauf = computed(() => {
    return werte.value
      .slice()
      .reverse()
      .map(w => ({
        datum: w.wert_datum,
        gewicht: w.wert_gewicht
      }))
  })

  return {
    loading,
    error,
    werte,
    latestWert,
    gewichtsverlauf,
    fetchWerte,
    addWert,
    updateWert,
    deleteWert
  }
}
