<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePokemon } from '../composables/usePokemon.js'

const props = defineProps({
  isDark: { type: Boolean, required: true },
})

const emit = defineEmits(['start', 'toggleTheme'])

const { generations, loading, error, fetchGenerations } = usePokemon()

const selectedGens = ref([])
const questionCount = ref(50)

onMounted(() => {
  fetchGenerations()
})

const totalPokemon = computed(() => {
  return generations.value
    .filter(g => selectedGens.value.includes(g.id))
    .reduce((sum, g) => sum + g.pokemon.length, 0)
})

const canSelect50 = computed(() => totalPokemon.value >= 50)
const canSelect100 = computed(() => totalPokemon.value >= 100)

function toggleGen(genId) {
  const index = selectedGens.value.indexOf(genId)
  if (index === -1) {
    selectedGens.value.push(genId)
  } else {
    selectedGens.value.splice(index, 1)
  }

  // Reset question count if current selection is no longer valid
  if (questionCount.value === 50 && !canSelect50.value) {
    questionCount.value = 'all'
  } else if (questionCount.value === 100 && !canSelect100.value) {
    questionCount.value = 'all'
  }
}

function selectAll() {
  selectedGens.value = generations.value.map(g => g.id)
}

function deselectAll() {
  selectedGens.value = []
}

function startQuiz() {
  emit('start', {
    selectedGens: [...selectedGens.value],
    questionCount: questionCount.value,
  })
}
</script>

<template>
  <div class="setup">
    <div class="top-bar">
      <button class="theme-toggle" @click="emit('toggleTheme')" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <span v-if="isDark" class="theme-icon">&#9788;</span>
        <span v-else class="theme-icon">&#9790;</span>
      </button>
    </div>

    <h1 class="title">Who's That Pokemon?</h1>
    <p class="subtitle">Test your Pokemon knowledge!</p>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading Pokemon data...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>Failed to load Pokemon data: {{ error }}</p>
      <button @click="fetchGenerations" class="btn">Retry</button>
    </div>

    <template v-else>
      <section class="section">
        <h2>Select Generations</h2>
        <div class="select-actions">
          <button @click="selectAll" class="btn btn-small">Select All</button>
          <button @click="deselectAll" class="btn btn-small btn-outline">Deselect All</button>
        </div>
        <div class="gen-grid">
          <label
            v-for="gen in generations"
            :key="gen.id"
            class="gen-card"
            :class="{ selected: selectedGens.includes(gen.id) }"
          >
            <input
              type="checkbox"
              :checked="selectedGens.includes(gen.id)"
              @change="toggleGen(gen.id)"
            />
            <span class="gen-name">{{ gen.name }}</span>
            <span class="gen-count">{{ gen.pokemon.length }} Pokemon</span>
          </label>
        </div>
      </section>

      <section class="section" v-if="selectedGens.length > 0">
        <h2>Number of Questions</h2>
        <p class="total-info">{{ totalPokemon }} Pokemon selected</p>
        <div class="question-options">
          <label class="question-option" :class="{ selected: questionCount === 50, disabled: !canSelect50 }">
            <input
              type="radio"
              name="questionCount"
              :value="50"
              v-model="questionCount"
              :disabled="!canSelect50"
            />
            <span>50 Questions</span>
          </label>
          <label class="question-option" :class="{ selected: questionCount === 100, disabled: !canSelect100 }">
            <input
              type="radio"
              name="questionCount"
              :value="100"
              v-model="questionCount"
              :disabled="!canSelect100"
            />
            <span>100 Questions</span>
          </label>
          <label class="question-option" :class="{ selected: questionCount === 'all' }">
            <input
              type="radio"
              name="questionCount"
              value="all"
              v-model="questionCount"
            />
            <span>All ({{ totalPokemon }})</span>
          </label>
        </div>
      </section>

      <button
        class="btn btn-start"
        :disabled="selectedGens.length === 0"
        @click="startQuiz"
      >
        Start Quiz!
      </button>
    </template>
  </div>
</template>

<style scoped>
.setup {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

.theme-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.title {
  text-align: center;
  font-size: 2rem;
  color: var(--accent);
  margin-bottom: 4px;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.section {
  margin-bottom: 28px;
}

.section h2 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: var(--text-heading);
}

.select-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.gen-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

@media (min-width: 480px) {
  .gen-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.gen-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  background: var(--bg-card);
}

.gen-card:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

.gen-card.selected {
  border-color: var(--border-selected);
  background: var(--bg-card-selected);
}

.gen-card input {
  accent-color: var(--accent);
  width: 18px;
  height: 18px;
}

.gen-name {
  font-weight: 600;
  font-size: 0.9rem;
  flex: 1;
  color: var(--text);
}

.gen-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.total-info {
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 480px) {
  .question-options {
    flex-direction: row;
  }
}

.question-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: 1;
  user-select: none;
  background: var(--bg-card);
  color: var(--text);
}

.question-option:hover:not(.disabled) {
  border-color: var(--border-hover);
}

.question-option.selected {
  border-color: var(--border-selected);
  background: var(--bg-card-selected);
}

.question-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.question-option input {
  accent-color: var(--accent);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent);
  color: white;
  transition: all 0.15s ease;
}

.btn:hover {
  background: var(--accent-hover);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 14px;
  font-size: 0.85rem;
}

.btn-outline {
  background: var(--outline-bg);
  color: var(--accent);
  border: 2px solid var(--accent);
}

.btn-outline:hover {
  background: var(--outline-hover-bg);
}

.btn-start {
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 1.2rem;
  margin-top: 8px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--spinner-track);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px 20px;
  color: var(--accent);
}
</style>
