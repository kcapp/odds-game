<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { TableTennisTournament, DartsTournament } from '@/types/sports'

interface Props {
  sport: 'table_tennis' | 'darts'
  tournament: TableTennisTournament | DartsTournament
}

const props = defineProps<Props>()
const emit = defineEmits<{
  back: []
}>()

const matches = ref<any[]>([])
const probabilities = ref<Record<number, any>>({})
const players = ref<Record<number, any>>({})
const loading = ref(true)

onMounted(async () => {
  if (props.sport === 'darts') {
    await loadPlayers()
  }
  await loadMatches()
  if (props.sport === 'darts') {
    await loadProbabilities()
  }
})

async function loadPlayers() {
  if (props.sport !== 'darts') return
  
  try {
    const response = await fetch('https://darts.sportradar.ag/api/players')
    const playersList = await response.json()
    // Index by player id
    playersList.forEach((player: any) => {
      players.value[player.id] = player
    })
  } catch (error) {
    console.error('Failed to load players:', error)
  }
}

async function loadMatches() {
  try {
    if (props.sport === 'table_tennis') {
      const response = await fetch(`https://ttapp.sportradar.ag/api/tournaments/${props.tournament.id}/games`)
      matches.value = await response.json()
    } else {
      const response = await fetch(`https://darts.sportradar.ag/api/tournament/${props.tournament.id}/matches`)
      const data = await response.json()
      // Flatten matches from grouped structure
      matches.value = Object.values(data).flat()
    }
  } catch (error) {
    console.error('Failed to load matches:', error)
  } finally {
    loading.value = false
  }
}

async function loadProbabilities() {
  if (props.sport !== 'darts') return
  
  try {
    const response = await fetch(`https://darts.sportradar.ag/api/tournament/${props.tournament.id}/probabilities`)
    const probs = await response.json()
    // Index by match id
    probs.forEach((prob: any) => {
      probabilities.value[prob.id] = prob
    })
  } catch (error) {
    console.error('Failed to load probabilities:', error)
  }
}

function formatDate(dateString: string) {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getMatchStatus(match: any) {
  if (props.sport === 'table_tennis') {
    if (match.is_finished) return 'Finished'
    if (match.date_played) return 'In Progress'
    return 'Scheduled'
  } else {
    if (match.is_finished) return 'Finished'
    if (match.is_started) return 'In Progress'
    return 'Scheduled'
  }
}

function getPlayerName(playerId: number, match: any) {
  if (props.sport === 'table_tennis') {
    return playerId === match.home_player_id ? match.home_player_name : match.away_player_name
  }
  // For darts, get player name from players map
  const player = players.value[playerId]
  return player ? player.name : `Player ${playerId}`
}

function getScore(match: any) {
  if (props.sport === 'table_tennis') {
    return `${match.home_score_total}-${match.away_score_total}`
  } else {
    if (!match.legs_won || match.legs_won.length === 0) return '0-0'
    const player1Wins = match.legs_won.filter((p: number) => p === match.players[0]).length
    const player2Wins = match.legs_won.filter((p: number) => p === match.players[1]).length
    return `${player1Wins}-${player2Wins}`
  }
}

function getProbability(match: any, playerIndex: number) {
  if (props.sport !== 'darts') return null
  const prob = probabilities.value[match.id]
  if (!prob || !prob.player_winning_probabilities) return null
  const playerId = match.players[playerIndex]
  return prob.player_winning_probabilities[playerId]
}

function getOdds(match: any, playerIndex: number) {
  if (props.sport !== 'darts') return null
  const prob = probabilities.value[match.id]
  if (!prob || !prob.player_odds) return null
  const playerId = match.players[playerIndex]
  return prob.player_odds[playerId]
}

const sortedMatches = computed(() => {
  return [...matches.value].sort((a, b) => {
    const dateA = props.sport === 'table_tennis' ? a.date_of_match : a.created_at
    const dateB = props.sport === 'table_tennis' ? b.date_of_match : b.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
})
</script>

<template>
  <div class="tournament-matches">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
      <button 
        @click="emit('back')"
        class="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
      >
        ← Back to Tournaments
      </button>
      <h2 class="text-xl sm:text-2xl font-bold text-white">
        {{ tournament.name }} - Matches
      </h2>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400">Loading matches...</p>
    </div>

    <div v-else-if="sortedMatches.length === 0" class="text-center py-12">
      <p class="text-gray-400">No matches available</p>
    </div>

    <!-- Desktop View -->
    <div v-else class="hidden lg:block bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Players</th>
            <th v-if="sport === 'darts'" class="px-6 py-4 text-center text-sm font-semibold text-gray-200">Win Probability</th>
            <th v-if="sport === 'darts'" class="px-6 py-4 text-center text-sm font-semibold text-gray-200">Odds</th>
            <th class="px-6 py-4 text-center text-sm font-semibold text-gray-200">Score</th>
            <th class="px-6 py-4 text-center text-sm font-semibold text-gray-200">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr 
            v-for="match in sortedMatches"
            :key="sport === 'table_tennis' ? match.match_id : match.id"
            class="hover:bg-gray-750 transition-colors"
          >
            <!-- Date -->
            <td class="px-6 py-4 text-sm text-gray-400">
              {{ formatDate(sport === 'table_tennis' ? match.date_of_match : match.created_at) }}
            </td>

            <!-- Players -->
            <td class="px-6 py-4">
              <div v-if="sport === 'table_tennis'" class="space-y-1">
                <div 
                  :class="[
                    'text-sm sm:text-base',
                    match.winner_id === match.home_player_id 
                      ? 'font-bold text-green-400' 
                      : 'text-gray-400'
                  ]"
                >
                  {{ match.home_player_name }}
                </div>
                <div class="text-gray-500 text-xs">vs</div>
                <div 
                  :class="[
                    'text-sm sm:text-base',
                    match.winner_id === match.away_player_id 
                      ? 'font-bold text-green-400' 
                      : 'text-gray-400'
                  ]"
                >
                  {{ match.away_player_name }}
                </div>
              </div>
              <div v-else class="space-y-1">
                <div 
                  :class="[
                    'text-sm sm:text-base',
                    match.winner_id === match.players[0] 
                      ? 'font-bold text-green-400' 
                      : 'text-gray-400'
                  ]"
                >
                  {{ getPlayerName(match.players[0], match) }}
                </div>
                <div class="text-gray-500 text-xs">vs</div>
                <div 
                  :class="[
                    'text-sm sm:text-base',
                    match.winner_id === match.players[1] 
                      ? 'font-bold text-green-400' 
                      : 'text-gray-400'
                  ]"
                >
                  {{ getPlayerName(match.players[1], match) }}
                </div>
              </div>
            </td>

            <!-- Win Probability (Darts only) -->
            <td v-if="sport === 'darts'" class="px-6 py-4 text-center text-sm">
              <div v-if="getProbability(match, 0)" class="space-y-1">
                <div class="text-gray-300">
                  {{ (getProbability(match, 0) * 100).toFixed(1) }}%
                </div>
                <div class="text-gray-500">vs</div>
                <div class="text-gray-300">
                  {{ (getProbability(match, 1) * 100).toFixed(1) }}%
                </div>
              </div>
              <div v-else class="text-gray-500">-</div>
            </td>

            <!-- Odds (Darts only) -->
            <td v-if="sport === 'darts'" class="px-6 py-4 text-center text-sm">
              <div v-if="getOdds(match, 0)" class="space-y-1">
                <div class="text-green-300">
                  {{ getOdds(match, 0).toFixed(2) }}
                </div>
                <div class="text-gray-500">vs</div>
                <div class="text-green-300">
                  {{ getOdds(match, 1).toFixed(2) }}
                </div>
              </div>
              <div v-else class="text-gray-500">-</div>
            </td>

            <!-- Score -->
            <td class="px-6 py-4 text-center">
              <span class="text-white font-mono text-lg">{{ getScore(match) }}</span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 text-center">
              <span 
                :class="[
                  'px-2 py-0.5 text-xs font-medium rounded',
                  getMatchStatus(match) === 'Finished' ? 'bg-gray-700 text-gray-300' :
                  getMatchStatus(match) === 'In Progress' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-blue-900 text-blue-300'
                ]"
              >
                {{ getMatchStatus(match) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile View -->
    <div v-else class="lg:hidden space-y-4">
      <div 
        v-for="match in sortedMatches"
        :key="sport === 'table_tennis' ? match.match_id : match.id"
        class="bg-gray-800 rounded-lg p-4 shadow-lg"
      >
        <!-- Date and Status -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-400">
            {{ formatDate(sport === 'table_tennis' ? match.date_of_match : match.created_at) }}
          </span>
          <span 
            :class="[
              'px-2 py-0.5 text-xs font-medium rounded',
              getMatchStatus(match) === 'Finished' ? 'bg-gray-700 text-gray-300' :
              getMatchStatus(match) === 'In Progress' ? 'bg-yellow-900 text-yellow-300' :
              'bg-blue-900 text-blue-300'
            ]"
          >
            {{ getMatchStatus(match) }}
          </span>
        </div>

        <!-- Players -->
        <div class="mb-3">
          <div v-if="sport === 'table_tennis'" class="space-y-2">
            <div class="flex items-center justify-between">
              <span 
                :class="[
                  'text-base',
                  match.winner_id === match.home_player_id 
                    ? 'font-bold text-green-400' 
                    : 'text-gray-400'
                ]"
              >
                {{ match.home_player_name }}
              </span>
              <span class="text-white font-mono text-lg">{{ match.home_score_total }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span 
                :class="[
                  'text-base',
                  match.winner_id === match.away_player_id 
                    ? 'font-bold text-green-400' 
                    : 'text-gray-400'
                ]"
              >
                {{ match.away_player_name }}
              </span>
              <span class="text-white font-mono text-lg">{{ match.away_score_total }}</span>
            </div>
          </div>
          <div v-else class="space-y-2">
            <div class="flex items-center justify-between">
              <span 
                :class="[
                  'text-base',
                  match.winner_id === match.players[0] 
                    ? 'font-bold text-green-400' 
                    : 'text-gray-400'
                ]"
              >
                {{ getPlayerName(match.players[0], match) }}
              </span>
              <span class="text-white font-mono text-lg">
                {{ match.legs_won ? match.legs_won.filter((p: number) => p === match.players[0]).length : 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span 
                :class="[
                  'text-base',
                  match.winner_id === match.players[1] 
                    ? 'font-bold text-green-400' 
                    : 'text-gray-400'
                ]"
              >
                {{ getPlayerName(match.players[1], match) }}
              </span>
              <span class="text-white font-mono text-lg">
                {{ match.legs_won ? match.legs_won.filter((p: number) => p === match.players[1]).length : 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Darts: Probabilities and Odds -->
        <div v-if="sport === 'darts' && getProbability(match, 0)" class="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-700">
          <div>
            <div class="text-xs text-gray-400 mb-1">Win Probability</div>
            <div class="text-sm text-gray-300">
              {{ (getProbability(match, 0) * 100).toFixed(1) }}% - {{ (getProbability(match, 1) * 100).toFixed(1) }}%
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">Odds</div>
            <div class="text-sm text-green-300">
              {{ getOdds(match, 0).toFixed(2) }} - {{ getOdds(match, 1).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
