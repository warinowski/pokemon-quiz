import { ref } from 'vue'

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const ARTWORK_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

const GENERATION_NAMES = {
  1: 'Generation I (Kanto)',
  2: 'Generation II (Johto)',
  3: 'Generation III (Hoenn)',
  4: 'Generation IV (Sinnoh)',
  5: 'Generation V (Unova)',
  6: 'Generation VI (Kalos)',
  7: 'Generation VII (Alola)',
  8: 'Generation VIII (Galar)',
  9: 'Generation IX (Paldea)',
}

// Shared state so data persists across components and quiz restarts
const generations = ref([])

function extractId(url) {
  const parts = url.replace(/\/$/, '').split('/')
  return parseInt(parts[parts.length - 1], 10)
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function usePokemon() {
  const loading = ref(false)
  const error = ref(null)

  async function fetchGenerations() {
    if (generations.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const promises = []
      for (let i = 1; i <= 9; i++) {
        promises.push(
          fetch(`${POKEAPI_BASE}/generation/${i}`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch generation ${i}`)
              return res.json()
            })
        )
      }

      const results = await Promise.all(promises)

      generations.value = results.map((gen, index) => ({
        id: index + 1,
        name: GENERATION_NAMES[index + 1],
        pokemon: gen.pokemon_species.map(species => ({
          id: extractId(species.url),
          name: capitalize(species.name),
          image: `${ARTWORK_BASE}/${extractId(species.url)}.png`,
        })).sort((a, b) => a.id - b.id),
      }))
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function generateQuiz(selectedGenIds, questionCount) {
    // Pool all pokemon from selected generations
    const pool = []
    for (const gen of generations.value) {
      if (selectedGenIds.includes(gen.id)) {
        pool.push(...gen.pokemon)
      }
    }

    // Get all pokemon names for wrong answer generation
    const allPokemon = generations.value.flatMap(g => g.pokemon)

    // Shuffle and pick questions
    const shuffled = shuffle(pool)
    const questions = questionCount === 'all'
      ? shuffled
      : shuffled.slice(0, Math.min(questionCount, shuffled.length))

    // Generate quiz questions with options
    return questions.map(pokemon => {
      // Pick 2 wrong answers
      const wrongAnswers = []
      const usedNames = new Set([pokemon.name])

      while (wrongAnswers.length < 2) {
        const random = allPokemon[Math.floor(Math.random() * allPokemon.length)]
        if (!usedNames.has(random.name)) {
          wrongAnswers.push(random.name)
          usedNames.add(random.name)
        }
      }

      // Shuffle options
      const options = shuffle([
        pokemon.name,
        ...wrongAnswers,
      ])

      return {
        pokemon,
        options,
        correctAnswer: pokemon.name,
      }
    })
  }

  return {
    generations,
    loading,
    error,
    fetchGenerations,
    generateQuiz,
  }
}
