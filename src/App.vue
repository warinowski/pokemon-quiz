<script setup>
import { ref, onMounted } from 'vue'
import { usePokemon } from './composables/usePokemon.js'
import SetupScreen from './components/SetupScreen.vue'
import QuizScreen from './components/QuizScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'

const { generateQuiz } = usePokemon()

const screen = ref('setup') // 'setup' | 'quiz' | 'results'
const questions = ref([])
const finalScore = ref(0)
const finalTotal = ref(0)

const isDark = ref(true)

onMounted(() => {
  const saved = localStorage.getItem('pokemon-quiz-theme')
  if (saved === 'light') {
    isDark.value = false
    document.documentElement.classList.add('light')
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light')
    localStorage.setItem('pokemon-quiz-theme', 'dark')
  } else {
    document.documentElement.classList.add('light')
    localStorage.setItem('pokemon-quiz-theme', 'light')
  }
}

function onStart({ selectedGens, questionCount }) {
  questions.value = generateQuiz(selectedGens, questionCount)
  screen.value = 'quiz'
}

function onFinish({ score, total }) {
  finalScore.value = score
  finalTotal.value = total
  screen.value = 'results'
}

function onPlayAgain() {
  screen.value = 'setup'
  questions.value = []
}
</script>

<template>
  <SetupScreen v-if="screen === 'setup'" :is-dark="isDark" @start="onStart" @toggle-theme="toggleTheme" />
  <QuizScreen v-else-if="screen === 'quiz'" :questions="questions" @finish="onFinish" />
  <ResultsScreen v-else :score="finalScore" :total="finalTotal" @play-again="onPlayAgain" />
</template>
