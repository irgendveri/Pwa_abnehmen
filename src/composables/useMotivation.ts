import { ref, computed } from 'vue'

export interface MotivationDay {
  tag: number
  affirmation: string
  impuls: string
  aufgabe: string
}

export function useMotivation() {
  const motivation30Tage: MotivationDay[] = [
    {
      tag: 1,
      affirmation: "Heute ist ein Neuanfang – ich wähle mich selbst und meine Gesundheit.",
      impuls: "Starte bewusst in deine Reise. Kleine Schritte zählen.",
      aufgabe: "Schreibe dein Warum für die Gewichtsabnahme auf."
    },
    {
      tag: 2,
      affirmation: "Ich vertraue darauf, dass jeder kleine Fortschritt zählt.",
      impuls: "Fokus auf Beständigkeit, nicht Perfektion.",
      aufgabe: "Trinke heute 2 Liter Wasser – bewusst und verteilt über den Tag."
    },
    {
      tag: 3,
      affirmation: "Ich bin stärker als jede Versuchung.",
      impuls: "Selbstdisziplin ist Selbstliebe in Aktion.",
      aufgabe: "Plane heute deine Mahlzeiten im Voraus."
    },
    {
      tag: 4,
      affirmation: "Mein Körper verändert sich, weil ich ihn achtsam behandle.",
      impuls: "Achtsamkeit beginnt mit Wertschätzung.",
      aufgabe: "Iss heute eine Mahlzeit langsam und mit vollem Bewusstsein."
    },
    {
      tag: 5,
      affirmation: "Ich wachse mit jeder Herausforderung.",
      impuls: "Schwierige Tage sind Training für deine Stärke.",
      aufgabe: "Gehe heute 10 Minuten länger spazieren als sonst."
    },
    {
      tag: 6,
      affirmation: "Ich bin stolz auf jeden Schritt, den ich mache.",
      impuls: "Erfolg liegt im Dranbleiben, nicht im Tempo.",
      aufgabe: "Notiere drei Dinge, auf die du diese Woche stolz bist."
    },
    {
      tag: 7,
      affirmation: "Ich bin dankbar für meinen Körper und seine Stärke.",
      impuls: "Dankbarkeit verwandelt deinen Blick auf dich selbst.",
      aufgabe: "Schreibe drei Dinge auf, die du an deinem Körper magst."
    },
    {
      tag: 8,
      affirmation: "Ich verdiene es, mich gut zu fühlen.",
      impuls: "Selbstfürsorge ist keine Belohnung – sie ist notwendig.",
      aufgabe: "Plane heute eine gesunde Mahlzeit, die dir richtig gut schmeckt."
    },
    {
      tag: 9,
      affirmation: "Ich kontrolliere, was ich heute tue – das reicht.",
      impuls: "Bleibe im Jetzt. Vergangenheit und Zukunft dürfen ruhen.",
      aufgabe: "Mache heute 5 Minuten Atemübung oder Meditation."
    },
    {
      tag: 10,
      affirmation: "Ich verändere mich von innen nach außen.",
      impuls: "Dein Mindset ist der Schlüssel zu dauerhafter Veränderung.",
      aufgabe: "Schreibe einen positiven Satz über dich auf den Spiegel."
    },
    {
      tag: 11,
      affirmation: "Ich lasse alte Gewohnheiten los, die mir nicht guttun.",
      impuls: "Veränderung beginnt mit Bewusstsein.",
      aufgabe: "Ersetze heute eine ungesunde Gewohnheit durch eine bessere."
    },
    {
      tag: 12,
      affirmation: "Ich wähle Bewegung, die mir Freude macht.",
      impuls: "Sport ist kein Muss, sondern ein Geschenk an dich.",
      aufgabe: "Probiere heute eine neue Form der Bewegung aus."
    },
    {
      tag: 13,
      affirmation: "Ich bin auf meiner eigenen Reise – kein Vergleich mit anderen.",
      impuls: "Dein Tempo ist genau richtig.",
      aufgabe: "Verbringe heute Zeit offline – nur du und dein Körper."
    },
    {
      tag: 14,
      affirmation: "Ich bin geduldig – Veränderung braucht Zeit.",
      impuls: "Erlaube dir, langsam zu wachsen.",
      aufgabe: "Vergleiche heute nicht, sondern feiere dich selbst."
    },
    {
      tag: 15,
      affirmation: "Ich liebe mich genug, um dran zu bleiben.",
      impuls: "Selbstliebe zeigt sich in Taten, nicht nur in Worten.",
      aufgabe: "Belohne dich heute mit etwas, das nichts mit Essen zu tun hat."
    },
    {
      tag: 16,
      affirmation: "Ich bin stolz auf meine Konsequenz.",
      impuls: "Du bist schon so viel weiter, als du denkst.",
      aufgabe: "Mache eine kleine Fortschrittsreflexion: Was hat sich verbessert?"
    },
    {
      tag: 17,
      affirmation: "Ich höre auf meinen Körper und seine Bedürfnisse.",
      impuls: "Er sendet dir Signale – lerne, sie zu verstehen.",
      aufgabe: "Achte heute bewusst auf Hunger- und Sättigungsgefühle."
    },
    {
      tag: 18,
      affirmation: "Ich bin in Balance – körperlich und mental.",
      impuls: "Wahre Balance bedeutet auch, sich Pausen zu gönnen.",
      aufgabe: "Plane heute 30 Minuten nur für dich selbst."
    },
    {
      tag: 19,
      affirmation: "Ich bin bereit, das Beste aus mir hervorzuholen.",
      impuls: "Deine Energie folgt deiner Einstellung.",
      aufgabe: "Höre heute Musik, die dich motiviert und positiv stimmt."
    },
    {
      tag: 20,
      affirmation: "Ich bleibe dran, auch wenn es schwer wird.",
      impuls: "Erfolg ist das Ergebnis von Durchhaltevermögen.",
      aufgabe: "Erinnere dich heute an einen Moment, in dem du etwas Schwieriges geschafft hast."
    },
    {
      tag: 21,
      affirmation: "Ich feiere jeden kleinen Sieg.",
      impuls: "Freude verstärkt Motivation.",
      aufgabe: "Notiere drei Erfolge der letzten Woche – egal wie klein."
    },
    {
      tag: 22,
      affirmation: "Ich bin genug – genau so, wie ich bin.",
      impuls: "Selbstannahme ist die Grundlage jeder Veränderung.",
      aufgabe: "Schreibe dir selbst heute einen freundlichen Satz auf."
    },
    {
      tag: 23,
      affirmation: "Ich bin fokussiert auf meine Ziele.",
      impuls: "Klarheit gibt dir Stärke.",
      aufgabe: "Schreibe dein Abnahmeziel und 3 Gründe auf, warum du es willst."
    },
    {
      tag: 24,
      affirmation: "Ich genieße den Weg – nicht nur das Ziel.",
      impuls: "Die Reise formt dich, nicht das Ergebnis allein.",
      aufgabe: "Tu heute etwas, das dich lächeln lässt."
    },
    {
      tag: 25,
      affirmation: "Ich lasse Rückschläge los und mache weiter.",
      impuls: "Perfektion ist nicht nötig, Beständigkeit ist der Schlüssel.",
      aufgabe: "Reflektiere kurz: Was kann ich aus meinem letzten Rückschlag lernen?"
    },
    {
      tag: 26,
      affirmation: "Ich nähre meinen Körper mit Liebe und Bewusstsein.",
      impuls: "Essen ist Energie – behandle es achtsam.",
      aufgabe: "Bereite heute eine gesunde Mahlzeit selbst zu."
    },
    {
      tag: 27,
      affirmation: "Ich spüre, wie sich mein Körper verändert und stärker wird.",
      impuls: "Jede Bewegung formt nicht nur den Körper, sondern auch den Geist.",
      aufgabe: "Mache heute eine Körperdehnung oder Yoga-Session."
    },
    {
      tag: 28,
      affirmation: "Ich bin stolz auf meine Reise und meine Ausdauer.",
      impuls: "Blicke zurück und erkenne, wie weit du gekommen bist.",
      aufgabe: "Vergleiche ein altes Foto oder Gefühl mit dem Heute – erkenne deinen Fortschritt."
    },
    {
      tag: 29,
      affirmation: "Ich bin die beste Version meiner selbst im Werden.",
      impuls: "Du bist nicht auf Diät – du veränderst dein Leben.",
      aufgabe: "Schreibe auf, was du über dich gelernt hast."
    },
    {
      tag: 30,
      affirmation: "Ich habe Durchhaltevermögen, Mut und Selbstliebe bewiesen.",
      impuls: "Feiere dich – du hast 30 Tage bewusste Veränderung gemeistert.",
      aufgabe: "Plane, wie du deine neue Routine langfristig beibehalten willst."
    }
  ]

  // Get the current day based on today's date
  const getCurrentDay = () => {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Cycle through the 30-day program
    return ((dayOfYear - 1) % 30) + 1
  }

  const currentDay = ref(getCurrentDay())

  const todaysMotivation = computed(() => {
    return motivation30Tage.find(day => day.tag === currentDay.value) || motivation30Tage[0]
  })

  const setDay = (day: number) => {
    if (day >= 1 && day <= 30) {
      currentDay.value = day
    }
  }

  const nextDay = () => {
    currentDay.value = currentDay.value < 30 ? currentDay.value + 1 : 1
  }

  const previousDay = () => {
    currentDay.value = currentDay.value > 1 ? currentDay.value - 1 : 30
  }

  return {
    motivation30Tage,
    todaysMotivation,
    currentDay,
    setDay,
    nextDay,
    previousDay
  }
}
