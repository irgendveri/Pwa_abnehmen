import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import type { Ziele, ZieleInsert } from '../types/database'

export function useZiele() {
  const { user } = useAuthStore()
  const ziele = ref<Ziele[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hauptziel = computed(() =>
    ziele.value.find(ziel => ziel.ziel_typ === 2)
  )

  const zwischenziele = computed(() =>
    ziele.value.filter(ziel => ziel.ziel_typ === 1).sort((a, b) =>
      new Date(a.ziel_datum).getTime() - new Date(b.ziel_datum).getTime()
    )
  )

  const fetchZiele = async () => {
    console.log('useZiele: fetchZiele called, user:', user.value?.id)
    if (!user.value) {
      console.log('useZiele: No user available, skipping fetch')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('useZiele: Querying database for user:', user.value.id)
      const { data, error: fetchError } = await supabase
        .from('ziele')
        .select('*')
        .eq('Userid', user.value.id)
        .order('ziel_typ', { ascending: false }) // Hauptziel zuerst
        .order('ziel_datum', { ascending: true })

      if (fetchError) {
        console.error('useZiele: Database error:', fetchError)
        throw fetchError
      }

      console.log('useZiele: Fetched ziele data:', data)
      ziele.value = data || []
      console.log('useZiele: Set ziele.value to:', ziele.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Ziele'
      console.error('Fehler beim Laden der Ziele:', err)
    } finally {
      loading.value = false
    }
  }

  const addZiel = async (zielData: Omit<ZieleInsert, 'Userid'>) => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      // Prüfen ob bereits ein Hauptziel existiert
      if (zielData.ziel_typ === 2 && hauptziel.value) {
        throw new Error('Es kann nur ein Hauptziel geben')
      }

      const { data, error: insertError } = await supabase
        .from('ziele')
        .insert({
          ...zielData,
          Userid: user.value.id
        })
        .select()

      if (insertError) throw insertError

      if (data && data[0]) {
        ziele.value.push(data[0])
        // Sortierung aktualisieren
        ziele.value = ziele.value.sort((a, b) => {
          if (a.ziel_typ !== b.ziel_typ) {
            return b.ziel_typ - a.ziel_typ // Hauptziel zuerst
          }
          return new Date(a.ziel_datum).getTime() - new Date(b.ziel_datum).getTime()
        })
      }

      return data?.[0]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Ziels'
      console.error('Fehler beim Hinzufügen des Ziels:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteZiel = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('ziele')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      ziele.value = ziele.value.filter(ziel => ziel.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Ziels'
      console.error('Fehler beim Löschen des Ziels:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateZiel = async (id: number, updates: Partial<Omit<ZieleInsert, 'Userid'>>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('ziele')
        .update(updates)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (data && data[0]) {
        const index = ziele.value.findIndex(ziel => ziel.id === id)
        if (index !== -1) {
          ziele.value[index] = data[0]
        }
      }

      return data?.[0]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Ziels'
      console.error('Fehler beim Aktualisieren des Ziels:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    ziele: computed(() => ziele.value),
    hauptziel,
    zwischenziele,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchZiele,
    addZiel,
    deleteZiel,
    updateZiel
  }
}
