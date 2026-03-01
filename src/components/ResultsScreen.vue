<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['playAgain'])

const percentage = computed(() => {
  return Math.round((props.score / props.total) * 100)
})

const message = computed(() => {
  const pct = percentage.value
  if (pct === 100) return 'Perfect score! You\'re a Pokemon Master!'
  if (pct >= 90) return 'Amazing! You really know your Pokemon!'
  if (pct >= 70) return 'Great job! Solid Pokemon knowledge!'
  if (pct >= 50) return 'Not bad! Keep training!'
  if (pct >= 30) return 'Room for improvement. Try again!'
  return 'Looks like you need to study up!'
})

const ringColor = computed(() => {
  const pct = percentage.value
  if (pct >= 80) return '#4ade80'
  if (pct >= 50) return '#e9c46a'
  return '#e63946'
})
</script>

<template>
  <div class="results">
    <h1 class="title">Quiz Complete!</h1>

    <div class="score-ring">
      <svg viewBox="0 0 120 120" class="ring-svg">
        <circle cx="60" cy="60" r="52" fill="none" :stroke="'var(--ring-track)'" stroke-width="10" />
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          :stroke="ringColor"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="2 * Math.PI * 52"
          :stroke-dashoffset="2 * Math.PI * 52 * (1 - percentage / 100)"
          transform="rotate(-90 60 60)"
          class="ring-progress"
        />
      </svg>
      <div class="ring-text">
        <span class="ring-percentage">{{ percentage }}%</span>
      </div>
    </div>

    <p class="score-text">
      You got <strong>{{ score }}</strong> out of <strong>{{ total }}</strong> correct!
    </p>

    <p class="message">{{ message }}</p>

    <button class="btn btn-play-again" @click="emit('playAgain')">
      Play Again
    </button>
  </div>
</template>

<style scoped>
.results {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.title {
  font-size: 2rem;
  color: var(--text-heading);
  margin-bottom: 32px;
}

.score-ring {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 24px;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-progress {
  transition: stroke-dashoffset 1s ease-out;
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-percentage {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-heading);
}

.score-text {
  font-size: 1.2rem;
  color: var(--text);
  margin-bottom: 8px;
}

.message {
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.btn-play-again {
  padding: 14px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent);
  color: white;
  transition: background 0.15s ease;
}

.btn-play-again:hover {
  background: var(--accent-hover);
}
</style>
