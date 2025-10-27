import { ref } from 'vue'
import { supabase } from '../supabase'

export function useDatabase() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Generische Funktion zum Abrufen von Daten
  const fetchData = async <T>(tableName: string, filters?: Record<string, any>) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase.from(tableName).select('*')

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      return data as T[]
    } catch (err: any) {
      error.value = err.message
      console.error('Fehler beim Abrufen der Daten:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Daten einfügen
  const insertData = async <T>(tableName: string, data: Partial<T>) => {
    loading.value = true
    error.value = null

    try {
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single()

      if (insertError) throw insertError

      return insertedData as T
    } catch (err: any) {
      error.value = err.message
      console.error('Fehler beim Einfügen der Daten:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Daten aktualisieren
  const updateData = async <T>(
    tableName: string,
    id: string | number,
    updates: Partial<T>
  ) => {
    loading.value = true
    error.value = null

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return updatedData as T
    } catch (err: any) {
      error.value = err.message
      console.error('Fehler beim Aktualisieren der Daten:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Daten löschen
  const deleteData = async (tableName: string, id: string | number) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Fehler beim Löschen der Daten:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchData,
    insertData,
    updateData,
    deleteData
  }
}
