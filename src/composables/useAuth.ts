import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  // Aktuelle Session laden
  const getCurrentSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      if (error) throw error

      user.value = currentSession?.user ?? null
      session.value = currentSession
    } catch (error) {
      console.error('Fehler beim Laden der Session:', error)
    } finally {
      loading.value = false
    }
  }

  // Anmelden mit Email und Passwort
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Anmeldung fehlgeschlagen:', error)
      throw error
    }
  }

  // Registrierung mit Email und Passwort
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Registrierung fehlgeschlagen:', error)
      throw error
    }
  }

  // Abmelden
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      session.value = null
    } catch (error) {
      console.error('Abmeldung fehlgeschlagen:', error)
      throw error
    }
  }

  // Auth State Listener
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      loading.value = false
    })
  }

  onMounted(() => {
    getCurrentSession()
    setupAuthListener()
  })

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }
}
