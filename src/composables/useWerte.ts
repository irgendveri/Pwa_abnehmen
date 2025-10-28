import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import type { Werte } from '../types/database'
import { useAuthStore } from '../stores/auth'
import { useZiele } from './useZiele'

export function useWerte() {
  const { user } = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const werte = ref<Werte[]>([])

  // Alle Werte für den aktuellen Benutzer abrufen
  const fetchWerte = async () => {
    if (!user.value) {
      console.log('fetchWerte: Kein Benutzer gefunden')
      error.value = null // Setze keinen Fehler wenn nur kein User da ist
      werte.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('fetchWerte: Lade Daten für User ID:', user.value.id)

      // Debug: Testen verschiedener Abfragen
      console.log('=== DEBUG START ===')

      // Test 1: Rohe Abfrage ohne Filter
      const { data: allData, error: allError } = await supabase
        .from('werte')
        .select('*')
        .limit(10)

      console.log('Test 1 - Alle Daten:', { data: allData, error: allError })

      // Test 2: Count-Abfrage
      const { count, error: countError } = await supabase
        .from('werte')
        .select('*', { count: 'exact', head: true })

      console.log('Test 2 - Count:', { count, error: countError })

      // Test 3: Spezifische ID-Abfrage (von Screenshot)
      const { data: specificData, error: specificError } = await supabase
        .from('werte')
        .select('*')
        .eq('id', 2)

      console.log('Test 3 - ID 2:', { data: specificData, error: specificError })

      // Test 4: Auth-Status prüfen
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Test 4 - Session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userIdMatch: session?.user?.id === user.value.id
      })

      console.log('=== DEBUG ENDE ===')

      if (allError) {
        console.error('Fehler beim Laden aller Daten:', allError)
      } else {
        console.log('User IDs in DB:', allData?.map(item => item.Userid))
      }

      // Jetzt die normale Abfrage mit User-Filter
      const { data, error: fetchError } = await supabase
        .from('werte')
        .select('*')
        .eq('Userid', user.value.id)
        .order('wert_datum', { ascending: false })

      if (fetchError) {
        console.error('Supabase Fehler:', fetchError)
        throw fetchError
      }

      console.log('fetchWerte: Gefilterte Daten erhalten:', data)
      werte.value = data as Werte[] || []
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      error.value = errorMessage
      console.error('Fehler beim Abrufen der Werte:', err)
    } finally {
      loading.value = false
    }
  }

  // Überprüfung ob ein Ziel erreicht wurde
  const checkZielErreicht = async (neuesGewicht: number) => {
    console.log('=== checkZielErreicht START ===')
    console.log('neuesGewicht:', neuesGewicht)

    // Stelle sicher, dass die aktuellen Werte geladen sind
    await fetchWerte()

    const { fetchZiele, hauptziel, zwischenziele } = useZiele()
    await fetchZiele()

    let zielErreicht = false
    let zielText = ''

    // Hole das vorherige Gewicht zum Vergleich
    const vorherigesGewicht = werte.value.length > 0 && werte.value[0] ? werte.value[0].wert_gewicht : neuesGewicht + 1
    console.log('vorherigesGewicht:', vorherigesGewicht)
    console.log('werte.value:', werte.value.map(w => ({ id: w.id, gewicht: w.wert_gewicht, datum: w.wert_datum })))

    console.log('hauptziel.value:', hauptziel.value)
    console.log('zwischenziele.value:', zwischenziele.value)

    // Prüfe Hauptziel - nur wenn wir es zum ersten Mal erreichen
    if (hauptziel.value &&
        neuesGewicht <= hauptziel.value.ziel_ziel &&
        vorherigesGewicht > hauptziel.value.ziel_ziel) {
      console.log('Hauptziel erreicht!')
      zielErreicht = true
      zielText = `Hauptziel erreicht! Zielgewicht: ${hauptziel.value.ziel_ziel}kg`
    }
    // Prüfe Zwischenziele - sortiert nach Zieldatum, nehme das nächste erreichbare
    else {
      console.log('Prüfe Zwischenziele...')
      const erreichbareZwischenziele = zwischenziele.value.filter(ziel => {
        const neuesGewichtCheck = neuesGewicht <= ziel.ziel_ziel
        const vorherigesGewichtCheck = vorherigesGewicht > ziel.ziel_ziel
        console.log(`Ziel ${ziel.ziel_ziel}kg: neuesGewicht(${neuesGewicht}) <= ziel(${ziel.ziel_ziel}) = ${neuesGewichtCheck}, vorherigesGewicht(${vorherigesGewicht}) > ziel(${ziel.ziel_ziel}) = ${vorherigesGewichtCheck}`)
        return neuesGewichtCheck && vorherigesGewichtCheck
      }).sort((a, b) => new Date(a.ziel_datum).getTime() - new Date(b.ziel_datum).getTime())

      console.log('erreichbareZwischenziele:', erreichbareZwischenziele)

      if (erreichbareZwischenziele.length > 0) {
        const naechstesZiel = erreichbareZwischenziele[0]
        if (naechstesZiel) {
          console.log('Zwischenziel erreicht:', naechstesZiel)
          zielErreicht = true
          zielText = `Zwischenziel erreicht! Zielgewicht: ${naechstesZiel.ziel_ziel}kg bis ${new Date(naechstesZiel.ziel_datum).toLocaleDateString()}`
        }
      }
    }

    console.log('=== checkZielErreicht RESULT ===')
    console.log('zielErreicht:', zielErreicht)
    console.log('zielText:', zielText)
    console.log('=== checkZielErreicht END ===')

    return { zielErreicht, zielText }
  }

  // Überprüfung ob ein Ziel erreicht wurde (mit explizitem vorherigemGewicht)
  const checkZielErreichtMitVorherigemGewicht = async (neuesGewicht: number, vorherigesGewicht: number) => {
    console.log('=== checkZielErreichtMitVorherigemGewicht START ===')
    console.log('neuesGewicht:', neuesGewicht)
    console.log('vorherigesGewicht (explizit):', vorherigesGewicht)

    const { fetchZiele, hauptziel, zwischenziele } = useZiele()
    await fetchZiele()

    let zielErreicht = false
    let zielText = ''

    console.log('hauptziel.value:', hauptziel.value)
    console.log('zwischenziele.value:', zwischenziele.value)

    // Prüfe Hauptziel - nur wenn wir es zum ersten Mal erreichen
    if (hauptziel.value &&
        neuesGewicht <= hauptziel.value.ziel_ziel &&
        vorherigesGewicht > hauptziel.value.ziel_ziel) {
      console.log('Hauptziel erreicht!')
      zielErreicht = true
      zielText = `Hauptziel erreicht! Zielgewicht: ${hauptziel.value.ziel_ziel}kg`
    }
    // Prüfe Zwischenziele - sortiert nach Zieldatum, nehme das nächste erreichbare
    else {
      console.log('Prüfe Zwischenziele...')
      const erreichbareZwischenziele = zwischenziele.value.filter(ziel => {
        const neuesGewichtCheck = neuesGewicht <= ziel.ziel_ziel
        const vorherigesGewichtCheck = vorherigesGewicht > ziel.ziel_ziel
        console.log(`Ziel ${ziel.ziel_ziel}kg: neuesGewicht(${neuesGewicht}) <= ziel(${ziel.ziel_ziel}) = ${neuesGewichtCheck}, vorherigesGewicht(${vorherigesGewicht}) > ziel(${ziel.ziel_ziel}) = ${vorherigesGewichtCheck}`)
        return neuesGewichtCheck && vorherigesGewichtCheck
      }).sort((a, b) => new Date(a.ziel_datum).getTime() - new Date(b.ziel_datum).getTime())

      console.log('erreichbareZwischenziele:', erreichbareZwischenziele)

      if (erreichbareZwischenziele.length > 0) {
        const naechstesZiel = erreichbareZwischenziele[0]
        if (naechstesZiel) {
          console.log('Zwischenziel erreicht:', naechstesZiel)
          zielErreicht = true
          zielText = `Zwischenziel erreicht! Zielgewicht: ${naechstesZiel.ziel_ziel}kg bis ${new Date(naechstesZiel.ziel_datum).toLocaleDateString()}`
        }
      }
    }

    console.log('=== checkZielErreichtMitVorherigemGewicht RESULT ===')
    console.log('zielErreicht:', zielErreicht)
    console.log('zielText:', zielText)
    console.log('=== checkZielErreichtMitVorherigemGewicht END ===')

    return { zielErreicht, zielText }
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

      // Stelle sicher, dass werte.value die aktuellen Daten enthält (ohne den neuen Wert)
      console.log('Vor fetchWerte: werte.value.length =', werte.value.length)
      await fetchWerte()
      console.log('Nach fetchWerte: werte.value.length =', werte.value.length)
      console.log('werte.value Gewichte:', werte.value.map(w => w.wert_gewicht))

      // Überprüfe ob ein Ziel erreicht wurde (mit dem vorherigen Gewicht vor dem neuen Eintrag)
      // Da fetchWerte() den neuen Wert bereits lädt, nehmen wir den zweiten Wert als "vorherigen"
      const vorherigesGewicht = werte.value.length > 1 && werte.value[1] ? werte.value[1].wert_gewicht : wertData.wert_gewicht + 1
      console.log('Bestimmtes vorherigesGewicht:', vorherigesGewicht)
      const zielCheck = await checkZielErreichtMitVorherigemGewicht(wertData.wert_gewicht, vorherigesGewicht)

      werte.value.unshift(newWert)

      return { wert: newWert, zielErreicht: zielCheck.zielErreicht, zielText: zielCheck.zielText }
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
    deleteWert,
    checkZielErreicht
  }
}
