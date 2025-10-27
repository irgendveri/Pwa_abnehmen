import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import type { Wochenplan } from '../types/database'
import { useAuth } from './useAuth'

export function useWochenplan() {
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const wochenplaene = ref<Wochenplan[]>([])

  // Alle Wochenpläne für den aktuellen Benutzer abrufen
  const fetchWochenplaene = async () => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('wochenplan')
        .select('*')
        .eq('Userid', user.value.id)
        .order('plan_datum', { ascending: false })

      if (fetchError) throw fetchError

      wochenplaene.value = data as Wochenplan[] || []
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Abrufen der Wochenpläne:', err)
    } finally {
      loading.value = false
    }
  }

  // Wochenplan für ein bestimmtes Datum abrufen
  const fetchWochenplanByDate = async (datum: string) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('wochenplan')
        .select('*')
        .eq('Userid', user.value.id)
        .eq('plan_datum', datum)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      return data as Wochenplan | null
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Abrufen des Wochenplans:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Neuen Wochenplan hinzufügen
  const addWochenplan = async (planData: {
    plan_datum: string
    plan_frueh: string
    plan_mittag: string
    plan_abend: string
  }) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const insertData = {
        ...planData,
        Userid: user.value.id
      }

      const { data, error: insertError } = await supabase
        .from('wochenplan')
        .insert(insertData)
        .select()
        .single()

      if (insertError) throw insertError

      const newPlan = data as Wochenplan
      wochenplaene.value.unshift(newPlan)
      return newPlan
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Hinzufügen des Wochenplans:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Wochenplan aktualisieren
  const updateWochenplan = async (id: number, updates: {
    plan_datum?: string
    plan_frueh?: string
    plan_mittag?: string
    plan_abend?: string
  }) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('wochenplan')
        .update(updates)
        .eq('id', id)
        .eq('Userid', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      const updatedPlan = data as Wochenplan
      const index = wochenplaene.value.findIndex(w => w.id === id)
      if (index !== -1) {
        wochenplaene.value[index] = updatedPlan
      }

      return updatedPlan
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Aktualisieren des Wochenplans:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Wochenplan löschen
  const deleteWochenplan = async (id: number) => {
    if (!user.value) {
      error.value = 'Benutzer nicht angemeldet'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('wochenplan')
        .delete()
        .eq('id', id)
        .eq('Userid', user.value.id)

      if (deleteError) throw deleteError

      wochenplaene.value = wochenplaene.value.filter(w => w.id !== id)
      return true
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Löschen des Wochenplans:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Computed: Aktuelle Woche (7 Tage ab heute)
  const currentWeekPlans = computed(() => {
    const today = new Date()
    const weekDates = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      weekDates.push(date.toISOString().split('T')[0])
    }

    return weekDates.map(date => {
      const plan = wochenplaene.value.find(w => w.plan_datum === date)
      return {
        datum: date,
        plan: plan || null
      }
    })
  })

  return {
    loading,
    error,
    wochenplaene,
    currentWeekPlans,
    fetchWochenplaene,
    fetchWochenplanByDate,
    addWochenplan,
    updateWochenplan,
    deleteWochenplan
  }
}
