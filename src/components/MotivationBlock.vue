<template>
  <div class="motivation-block">
    <div class="motivation-header">
      <h3>Dein täglicher Motivationsimpuls</h3>
      <div class="day-navigation">
        <button @click="previousDay" class="nav-btn" title="Vorheriger Tag">←</button>
        <span class="day-counter">Tag {{ currentDay }} von 30</span>
        <button @click="nextDay" class="nav-btn" title="Nächster Tag">→</button>
      </div>
    </div>

    <div class="motivation-content">
      <div class="affirmation-section">
        <div class="section-icon">💪</div>
        <div class="section-content">
          <h4>Deine Affirmation</h4>
          <p class="affirmation">{{ todaysMotivation?.affirmation || '' }}</p>
        </div>
      </div>

      <div class="impuls-section">
        <div class="section-icon">💡</div>
        <div class="section-content">
          <h4>Dein Impuls</h4>
          <p class="impuls">{{ todaysMotivation?.impuls || '' }}</p>
        </div>
      </div>

      <div class="aufgabe-section">
        <div class="section-icon">✨</div>
        <div class="section-content">
          <h4>Deine heutige Aufgabe</h4>
          <p class="aufgabe">{{ todaysMotivation?.aufgabe || '' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMotivation } from '../composables/useMotivation'

const { todaysMotivation, currentDay, nextDay, previousDay } = useMotivation()
</script>

<style scoped>
.motivation-block {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.motivation-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.motivation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.motivation-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.day-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.day-counter {
  font-weight: 500;
  font-size: 0.9rem;
  min-width: 80px;
  text-align: center;
}

.motivation-content {
  position: relative;
  z-index: 1;
}

.affirmation-section,
.impuls-section,
.aufgabe-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.aufgabe-section {
  margin-bottom: 0;
}

.section-icon {
  font-size: 1.5rem;
  min-width: 40px;
  text-align: center;
}

.section-content {
  flex: 1;
}

.section-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.9;
}

.affirmation,
.impuls,
.aufgabe {
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
}

.affirmation {
  font-style: italic;
  font-weight: 500;
}

.impuls {
  font-weight: 400;
}

.aufgabe {
  font-weight: 500;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .motivation-block {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .motivation-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .motivation-header h3 {
    font-size: 1.3rem;
  }

  .affirmation-section,
  .impuls-section,
  .aufgabe-section {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }

  .section-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .day-navigation {
    gap: 0.75rem;
    padding: 0.4rem 0.8rem;
  }

  .day-counter {
    font-size: 0.85rem;
    min-width: 70px;
  }
}

/* Desktop optimizations */
@media (min-width: 1024px) {
  .motivation-block {
    padding: 2.5rem;
  }

  .motivation-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .aufgabe-section {
    grid-column: 1 / -1;
  }
}
</style>
