<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['finish'])

const currentIndex = ref(0)
const score = ref(0)
const selectedAnswer = ref(null)
const answered = ref(false)
const imageLoaded = ref(false)

const currentQuestion = computed(() => props.questions[currentIndex.value])
const totalQuestions = computed(() => props.questions.length)
const progress = computed(() => ((currentIndex.value) / totalQuestions.value) * 100)
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1)

function selectAnswer(option) {
  if (answered.value) return

  selectedAnswer.value = option
  answered.value = true

  if (option === currentQuestion.value.correctAnswer) {
    score.value++
  }
}

function nextQuestion() {
  if (isLastQuestion.value) {
    emit('finish', {
      score: score.value,
      total: totalQuestions.value,
    })
    return
  }

  currentIndex.value++
  selectedAnswer.value = null
  answered.value = false
  imageLoaded.value = false
}

function getOptionClass(option) {
  if (!answered.value) return ''
  if (option === currentQuestion.value.correctAnswer) return 'correct'
  if (option === selectedAnswer.value) return 'wrong'
  return 'dimmed'
}

function getOptionLabel(index) {
  return String.fromCharCode(65 + index) // A, B, C
}

function onImageLoad() {
  imageLoaded.value = true
}
</script>

<template>
  <div class="quiz">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="header">
      <span class="question-num">Question {{ currentIndex + 1 }} / {{ totalQuestions }}</span>
      <span class="score-display">Score: {{ score }}</span>
    </div>

    <div class="image-container">
      <div v-if="!imageLoaded" class="image-placeholder">
        <div class="spinner"></div>
      </div>
      <img
        :key="currentQuestion.pokemon.id"
        :src="currentQuestion.pokemon.image"
        :alt="answered ? currentQuestion.correctAnswer : 'Who\'s that Pokemon?'"
        class="pokemon-image"
        :class="{ loaded: imageLoaded }"
        @load="onImageLoad"
      />
    </div>

    <h2 class="prompt">Who's that Pokemon?</h2>

    <div class="options">
      <button
        v-for="(option, index) in currentQuestion.options"
        :key="option"
        class="option-btn"
        :class="getOptionClass(option)"
        @click="selectAnswer(option)"
        :disabled="answered"
      >
        <span class="option-label">{{ getOptionLabel(index) }}</span>
        <span class="option-name">{{ option }}</span>
      </button>
    </div>

    <div v-if="answered" class="feedback">
      <p v-if="selectedAnswer === currentQuestion.correctAnswer" class="feedback-correct">
        Correct!
      </p>
      <p v-else class="feedback-wrong">
        Wrong! It was <strong>{{ currentQuestion.correctAnswer }}</strong>
      </p>
      <button class="btn btn-next" @click="nextQuestion">
        {{ isLastQuestion ? 'See Results' : 'Next' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  max-width: 500px;
  margin: 0 auto;
  padding: 16px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--spinner-track);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.score-display {
  font-weight: 600;
  color: var(--text);
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 300px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-image);
  border-radius: 16px;
}

.image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokemon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pokemon-image.loaded {
  opacity: 1;
}

.prompt {
  text-align: center;
  font-size: 1.3rem;
  color: var(--text-heading);
  margin-bottom: 16px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--option-bg);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1rem;
  text-align: left;
  color: var(--text);
}

.option-btn:hover:not(:disabled) {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

.option-btn:disabled {
  cursor: default;
}

.option-btn.correct {
  border-color: var(--correct-border);
  background: var(--correct-bg);
}

.option-btn.wrong {
  border-color: var(--wrong-border);
  background: var(--wrong-bg);
}

.option-btn.dimmed {
  opacity: 0.5;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--option-label-bg);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--option-label-color);
  flex-shrink: 0;
}

.correct .option-label {
  background: #2d6a4f;
  color: white;
}

.wrong .option-label {
  background: #c1121f;
  color: white;
}

.option-name {
  font-weight: 500;
}

.feedback {
  text-align: center;
}

.feedback-correct {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 12px;
}

.feedback-wrong {
  font-size: 1.1rem;
  color: #f87171;
  margin-bottom: 12px;
}

.btn-next {
  padding: 12px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent);
  color: white;
  transition: background 0.15s ease;
}

.btn-next:hover {
  background: var(--accent-hover);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid var(--spinner-track);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
