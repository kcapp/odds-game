<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { TableTennisTournament, DartsTournament } from '@/types/sports'
import { getMatches, getProbabilities, getPlayers } from '@/api/sports'
import { useBetslipStore } from '@/stores/betslip'
import { placeBet } from '@/api/betting'
import { useUserStore } from '@/stores/user'

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
const betslipStore = useBetslipStore()
const userStore = useUserStore()
const testMode = import.meta.env.VITE_BETTING_TEST_MODE === 'true'
const expandedMatch = ref<number | null>(null)
const selectedPlayer = ref<number | null>(null)
const betStake = ref<number>(100)
const placingBet = ref(false)
const betslipExpanded = ref(true)
const placingBetslip = ref(false)
const betslipError = ref('')
const betslipSuccess = ref(false)
const showBetslipSelector = ref(false)
const selectedBetForBetslip = ref<BetSelection | null>(null)
const addingToBetslip = ref(false)

onMounted(async () => {
  if (props.sport === 'darts') {
    await loadPlayers()
  }
  await loadMatches()
  await loadProbabilities()
  await betslipStore.loadPendingBetslips()
})

async function loadPlayers() {
  if (props.sport !== 'darts') return
  
  try {
    const playersList = await getPlayers(props.sport)
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
    const response = await getMatches(props.sport, props.tournament.id)
    matches.value = response.matches || []
  } catch (error) {
    console.error('Failed to load matches:', error)
  } finally {
    loading.value = false
  }
}

async function loadProbabilities() {
  try {
    const probs = await getProbabilities(props.sport, props.tournament.id)
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
    // Check if match has a winner (winner_id is not 0 or null)
    if (match.winner_id && match.winner_id !== 0) return 'Finished'
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
  const matchId = props.sport === 'table_tennis' ? match.match_id : match.id
  const prob = probabilities.value[matchId]
  if (!prob || !prob.player_winning_probabilities) return null
  
  if (props.sport === 'table_tennis') {
    const playerId = playerIndex === 0 ? match.home_player_id : match.away_player_id
    return prob.player_winning_probabilities[playerId]
  } else {
    const playerId = match.players[playerIndex]
    return prob.player_winning_probabilities[playerId]
  }
}

function getOdds(match: any, playerIndex: number) {
  const matchId = props.sport === 'table_tennis' ? match.match_id : match.id
  const prob = probabilities.value[matchId]
  if (!prob || !prob.player_odds) return null
  
  if (props.sport === 'table_tennis') {
    const playerId = playerIndex === 0 ? match.home_player_id : match.away_player_id
    return prob.player_odds[playerId]
  } else {
    const playerId = match.players[playerIndex]
    return prob.player_odds[playerId]
  }
}

const sortedMatches = computed(() => {
  return [...matches.value].sort((a, b) => {
    let dateA, dateB
    if (props.sport === 'table_tennis') {
      dateA = a.date_played || a.date_of_match
      dateB = b.date_played || b.date_of_match
    } else {
      dateA = a.last_throw_time
      dateB = b.last_throw_time
    }
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
})

function canBet(match: any): boolean {
  const status = getMatchStatus(match)
  // In test mode, allow betting on any match with odds
  if (testMode) {
    return getOdds(match, 0) !== null
  }
  // In normal mode, only scheduled matches
  return status === 'Scheduled' && getOdds(match, 0) !== null
}

function openBetPanel(match: any, playerIndex: number) {
  const matchId = props.sport === 'table_tennis' ? match.match_id : match.id
  expandedMatch.value = expandedMatch.value === matchId ? null : matchId
  selectedPlayer.value = playerIndex
  betStake.value = 100
}

async function confirmSingleBet(match: any) {
  if (selectedPlayer.value === null) return
  
  const playerIndex = selectedPlayer.value
  const odds = getOdds(match, playerIndex)
  if (!odds) return

  if (betStake.value <= 0) {
    return
  }

  if (betStake.value > userStore.wallet.balance) {
    return
  }

  let winnerId, winnerName, opponentId, opponentName

  if (props.sport === 'table_tennis') {
    if (playerIndex === 0) {
      winnerId = match.home_player_id
      winnerName = match.home_player_name
      opponentId = match.away_player_id
      opponentName = match.away_player_name
    } else {
      winnerId = match.away_player_id
      winnerName = match.away_player_name
      opponentId = match.home_player_id
      opponentName = match.home_player_name
    }
  } else {
    winnerId = match.players[playerIndex]
    winnerName = getPlayerName(winnerId, match)
    opponentId = match.players[playerIndex === 0 ? 1 : 0]
    opponentName = getPlayerName(opponentId, match)
  }

  const matchId = props.sport === 'table_tennis' ? match.match_id : match.id
  
  placingBet.value = true
  try {
    await placeBet({
      stake: betStake.value,
      bets: [{
        sport: props.sport,
        match_id: matchId,
        tournament_id: props.tournament.id,
        predicted_winner_id: winnerId,
        predicted_winner_name: winnerName,
        opponent_id: opponentId,
        opponent_name: opponentName,
        odds: odds
      }]
    })

    // Refresh wallet
    await userStore.loadWallet()
    
    // Close panel
    expandedMatch.value = null
    selectedPlayer.value = null
  } catch (error: any) {
    console.error('Failed to place bet:', error)
  } finally {
    placingBet.value = false
  }
}

function closeBetPanel() {
  expandedMatch.value = null
  selectedPlayer.value = null
}

async function placeBetslip() {
  placingBetslip.value = true
  betslipError.value = ''
  betslipSuccess.value = false

  try {
    await betslipStore.placeBet()
    betslipSuccess.value = true
    
    // Refresh wallet
    await userStore.loadWallet()
    
    // Auto-close success message
    setTimeout(() => {
      betslipSuccess.value = false
      betslipExpanded.value = false
    }, 2000)
  } catch (error: any) {
    betslipError.value = error.response?.data?.error || error.message || 'Failed to place betslip'
  } finally {
    placingBetslip.value = false
  }
}


function addToBetslip(match: any, playerIndex: number) {
  const odds = getOdds(match, playerIndex)
  if (!odds) return

  let winnerId, winnerName, opponentId, opponentName

  if (props.sport === 'table_tennis') {
    if (playerIndex === 0) {
      winnerId = match.home_player_id
      winnerName = match.home_player_name
      opponentId = match.away_player_id
      opponentName = match.away_player_name
    } else {
      winnerId = match.away_player_id
      winnerName = match.away_player_name
      opponentId = match.home_player_id
      opponentName = match.home_player_name
    }
  } else {
    winnerId = match.players[playerIndex]
    winnerName = getPlayerName(winnerId, match)
    opponentId = match.players[playerIndex === 0 ? 1 : 0]
    opponentName = getPlayerName(opponentId, match)
  }

  const matchId = props.sport === 'table_tennis' ? match.match_id : match.id
  
  const selection: BetSelection = {
    sport: props.sport,
    matchId: matchId,
    tournamentId: props.tournament.id,
    predictedWinnerId: winnerId,
    predictedWinnerName: winnerName,
    opponentId: opponentId,
    opponentName: opponentName,
    odds: odds
  }

  // Show betslip selector if there are pending betslips
  if (betslipStore.pendingBetslips.length > 0) {
    selectedBetForBetslip.value = selection
    showBetslipSelector.value = true
  } else {
    // Add to current betslip
    const added = betslipStore.addSelection(selection)
    if (!added) {
      alert('Cannot add bet: Either match is already in betslip or betslip is full (max 5 bets)')
    }
  }
}

async function addToSelectedBetslip(betslipId: number | null) {
  if (!selectedBetForBetslip.value) return

  addingToBetslip.value = true
  try {
    if (betslipId === null) {
      // Add to current (new) betslip
      const added = betslipStore.addSelection(selectedBetForBetslip.value)
      if (!added) {
        alert('Cannot add bet: Either match is already in betslip or betslip is full (max 5 bets)')
      }
    } else {
      // Add to existing betslip
      await betslipStore.addToExistingBetslip(betslipId, selectedBetForBetslip.value)
    }
    
    showBetslipSelector.value = false
    selectedBetForBetslip.value = null
  } catch (error: any) {
    alert(error.response?.data?.error || error.message || 'Failed to add bet to betslip')
  } finally {
    addingToBetslip.value = false
  }
}

function cancelBetslipSelection() {
  showBetslipSelector.value = false
  selectedBetForBetslip.value = null
}

interface BetSelection {
  sport: 'darts' | 'table_tennis'
  matchId: number
  tournamentId: number
  predictedWinnerId: number
  predictedWinnerName: string
  opponentId: number
  opponentName: string
  odds: number
}

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

    <!-- Betslip Selector Modal -->
    <div 
      v-if="showBetslipSelector"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cancelBetslipSelection"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-4">Add Bet to Betslip</h3>
          
          <div v-if="selectedBetForBetslip" class="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
            <div class="text-sm text-white font-medium">{{ selectedBetForBetslip.predictedWinnerName }}</div>
            <div class="text-xs text-gray-400">vs {{ selectedBetForBetslip.opponentName }}</div>
            <div class="text-xs text-green-400 mt-1">Odds: {{ selectedBetForBetslip.odds.toFixed(2) }}</div>
          </div>

          <div class="space-y-2 mb-6">
            <!-- New Betslip Option -->
            <button
              @click="addToSelectedBetslip(null)"
              :disabled="addingToBetslip"
              class="w-full p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors text-left"
            >
              <div class="font-medium">New Betslip</div>
              <div class="text-xs text-gray-200 mt-1">
                Current: {{ betslipStore.selections.length }} bet(s) • Stake: {{ betslipStore.stake }} kC
              </div>
            </button>

            <!-- Existing Betslips -->
            <div v-if="betslipStore.pendingBetslips.length > 0" class="pt-2">
              <div class="text-sm text-gray-400 mb-2">Or add to existing betslip:</div>
              <button
                v-for="betslip in betslipStore.pendingBetslips"
                :key="betslip.id"
                @click="addToSelectedBetslip(betslip.id)"
                :disabled="addingToBetslip || betslip.bets.length >= 5"
                class="w-full p-3 bg-gray-900 hover:bg-gray-750 disabled:bg-gray-800 disabled:opacity-50 border border-gray-700 rounded transition-colors text-left mb-2"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-white">Betslip #{{ betslip.id }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      {{ betslip.bets.length }}/5 bets • Stake: {{ betslip.total_stake }} kC
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-green-400">{{ betslip.combined_odds.toFixed(2) }}x</div>
                    <div class="text-xs text-gray-400">{{ betslip.potential_win.toFixed(2) }} kC</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <button
            @click="cancelBetslipSelection"
            class="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Betslip Section -->
    <div 
      v-if="betslipStore.selections.length > 0"
      class="mb-6 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700"
    >
      <!-- Betslip Header (Always Visible) -->
      <button
        @click="betslipExpanded = !betslipExpanded"
        class="w-full px-4 sm:px-6 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg font-semibold text-white">🎫 Betslip</span>
          <span class="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
            {{ betslipStore.selections.length }}/{{ betslipStore.maxSelections }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <div class="text-sm text-gray-400">Potential Win</div>
            <div class="text-lg font-bold text-green-400">{{ betslipStore.potentialWin.toFixed(2) }} kC</div>
          </div>
          <svg 
            class="w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': betslipExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <!-- Betslip Content (Collapsible) -->
      <div v-if="betslipExpanded" class="border-t border-gray-700 p-4 sm:p-6">
        <!-- Selections -->
        <div class="space-y-2 mb-4">
          <div 
            v-for="(sel, idx) in betslipStore.selections" 
            :key="`${sel.sport}-${sel.matchId}`"
            class="bg-gray-900 border border-gray-700 rounded p-3"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs text-gray-500 uppercase">{{ sel.sport.replace('_', ' ') }}</span>
                  <span class="text-xs text-gray-600">•</span>
                  <span class="text-xs text-gray-500">Bet {{ idx + 1 }}</span>
                </div>
                <div class="text-sm text-white font-medium">{{ sel.predictedWinnerName }}</div>
                <div class="text-xs text-gray-400">vs {{ sel.opponentName }}</div>
              </div>
              <div class="flex items-start gap-3">
                <div class="text-right">
                  <span class="text-green-400 font-semibold">{{ sel.odds.toFixed(2) }}</span>
                </div>
                <button 
                  @click="betslipStore.removeSelection(sel.matchId, sel.sport)"
                  class="text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove from betslip"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stake and Summary -->
        <div class="bg-gray-900 rounded-lg p-4 space-y-3">
          <div>
            <label class="block text-sm text-gray-400 mb-2">Stake (kCoins)</label>
            <input 
              v-model.number="betslipStore.stake" 
              type="number" 
              min="1" 
              :max="userStore.wallet.balance"
              step="10"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
            <div class="text-xs text-gray-500 mt-1">
              Available: {{ userStore.wallet.balance.toFixed(2) }} kCoins
            </div>
          </div>

          <div class="pt-3 border-t border-gray-800 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Combined Odds:</span>
              <span class="text-white font-semibold">{{ betslipStore.combinedOdds.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-base">
              <span class="text-gray-400">Potential Win:</span>
              <span class="text-green-400 font-bold">{{ betslipStore.potentialWin.toFixed(2) }} kC</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-2">
            <button
              @click="placeBetslip"
              :disabled="placingBetslip || betslipStore.stake > userStore.wallet.balance || betslipStore.stake < 1"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded transition-colors"
            >
              {{ placingBetslip ? 'Placing...' : 'Place Betslip' }}
            </button>
            <button
              @click="betslipStore.clearBetslip()"
              class="px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded transition-colors"
            >
              Clear
            </button>
          </div>

          <!-- Messages -->
          <div v-if="betslipError" class="text-red-400 text-sm text-center">
            {{ betslipError }}
          </div>
          <div v-if="betslipSuccess" class="text-green-400 text-sm text-center">
            Betslip placed successfully!
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400">Loading matches...</p>
    </div>

    <div v-else-if="sortedMatches.length === 0" class="text-center py-12">
      <p class="text-gray-400">No matches available</p>
    </div>

    <div v-else class="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
      <table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-200">Date</th>
            <th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-200">Players</th>
            <th class="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-200">Score</th>
            <th class="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-200">Status</th>
            <th class="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-200">Bet</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="match in sortedMatches"
            :key="sport === 'table_tennis' ? match.match_id : match.id"
          >
          <tr 
            class="hover:bg-gray-750 transition-colors border-b border-gray-700"
            :class="{ 'bg-gray-750': expandedMatch === (sport === 'table_tennis' ? match.match_id : match.id) }"
          >
            <!-- Date -->
            <td class="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-400">
              {{ formatDate(sport === 'table_tennis' ? (match.date_played || match.date_of_match) : match.last_throw_time) }}
            </td>

            <!-- Players -->
            <td class="px-4 sm:px-6 py-3 sm:py-4">
              <div v-if="sport === 'table_tennis'">
                <div class="flex items-start gap-3">
                  <div class="flex-1 text-right">
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
                    <div v-if="getProbability(match, 0)" class="text-xs text-gray-400">
                      <span class="text-gray-500">Prob:</span> {{ (getProbability(match, 0) * 100).toFixed(1) }}%
                    </div>
                    <div v-if="getOdds(match, 0)" class="text-xs text-green-300">
                      <span class="text-gray-500">Odds:</span> {{ getOdds(match, 0).toFixed(2) }}
                    </div>
                  </div>
                  <span class="text-gray-500 text-xs pt-1">vs</span>
                  <div class="flex-1 text-left">
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
                    <div v-if="getProbability(match, 1)" class="text-xs text-gray-400">
                      <span class="text-gray-500">Prob:</span> {{ (getProbability(match, 1) * 100).toFixed(1) }}%
                    </div>
                    <div v-if="getOdds(match, 1)" class="text-xs text-green-300">
                      <span class="text-gray-500">Odds:</span> {{ getOdds(match, 1).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="flex items-start gap-3">
                  <div class="flex-1 text-right">
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
                    <div v-if="getProbability(match, 0)" class="text-xs text-gray-400">
                      <span class="text-gray-500">Prob:</span> {{ (getProbability(match, 0) * 100).toFixed(1) }}%
                    </div>
                    <div v-if="getOdds(match, 0)" class="text-xs text-green-300">
                      <span class="text-gray-500">Odds:</span> {{ getOdds(match, 0).toFixed(2) }}
                    </div>
                  </div>
                  <span class="text-gray-500 text-xs pt-1">vs</span>
                  <div class="flex-1 text-left">
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
                    <div v-if="getProbability(match, 1)" class="text-xs text-gray-400">
                      <span class="text-gray-500">Prob:</span> {{ (getProbability(match, 1) * 100).toFixed(1) }}%
                    </div>
                    <div v-if="getOdds(match, 1)" class="text-xs text-green-300">
                      <span class="text-gray-500">Odds:</span> {{ getOdds(match, 1).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
            </td>

            <!-- Score -->
            <td class="px-4 sm:px-6 py-3 sm:py-4 text-center">
              <span class="text-white font-mono text-base sm:text-lg">{{ getScore(match) }}</span>
            </td>

            <!-- Status -->
            <td class="px-4 sm:px-6 py-3 sm:py-4 text-center">
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

            <!-- Betting -->
            <td class="px-4 sm:px-6 py-3 sm:py-4">
              <div v-if="canBet(match)" class="flex flex-col gap-1">
                <div class="flex gap-1">
                  <button
                    @click="openBetPanel(match, 0)"
                    class="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors whitespace-nowrap flex-1"
                    title="Place single bet"
                  >
                    Bet {{ getOdds(match, 0)?.toFixed(2) }}
                  </button>
                  <button
                    @click="addToBetslip(match, 0)"
                    :disabled="!betslipStore.canAddMore || betslipStore.isInBetslip(sport === 'table_tennis' ? match.match_id : match.id, sport)"
                    class="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors"
                    title="Add to betslip"
                  >
                    +
                  </button>
                </div>
                <div class="flex gap-1">
                  <button
                    @click="openBetPanel(match, 1)"
                    class="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors whitespace-nowrap flex-1"
                    title="Place single bet"
                  >
                    Bet {{ getOdds(match, 1)?.toFixed(2) }}
                  </button>
                  <button
                    @click="addToBetslip(match, 1)"
                    :disabled="!betslipStore.canAddMore || betslipStore.isInBetslip(sport === 'table_tennis' ? match.match_id : match.id, sport)"
                    class="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors"
                    title="Add to betslip"
                  >
                    +
                  </button>
                </div>
              </div>
              <span v-else class="text-xs text-gray-500">-</span>
            </td>
          </tr>

          <!-- Expanded Betting Panel -->
          <tr 
            v-if="expandedMatch === (sport === 'table_tennis' ? match.match_id : match.id)"
            class="bg-gray-750"
          >
            <td colspan="5" class="px-4 sm:px-6 py-4 border-b border-gray-700">
              <div class="bg-gray-800 rounded-lg p-4 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-white">Place Single Bet</h3>
                  <button 
                    @click="closeBetPanel"
                    class="text-gray-400 hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div class="space-y-3">
                  <!-- Selected Player -->
                  <div class="bg-gray-700 rounded p-3">
                    <div class="text-sm text-gray-400 mb-1">Betting on:</div>
                    <div class="text-white font-semibold">
                      {{ selectedPlayer === 0 ? 
                        (sport === 'table_tennis' ? match.home_player_name : getPlayerName(match.players[0], match)) :
                        (sport === 'table_tennis' ? match.away_player_name : getPlayerName(match.players[1], match))
                      }}
                    </div>
                    <div class="text-sm text-green-300 mt-1">
                      Odds: {{ getOdds(match, selectedPlayer!)?.toFixed(2) }}
                    </div>
                  </div>

                  <!-- Stake Input -->
                  <div>
                    <label class="block text-sm text-gray-400 mb-2">Stake Amount (kCoins)</label>
                    <input
                      v-model.number="betStake"
                      type="number"
                      min="1"
                      :max="userStore.wallet.balance"
                      step="10"
                      class="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter stake"
                    />
                    <div class="text-xs text-gray-400 mt-1">
                      Available balance: {{ userStore.wallet.balance.toFixed(2) }} kCoins
                    </div>
                    <div 
                      v-if="betStake > userStore.wallet.balance"
                      class="text-xs text-red-400 mt-1"
                    >
                      Insufficient balance
                    </div>
                  </div>

                  <!-- Potential Win -->
                  <div class="bg-gray-700 rounded p-3">
                    <div class="text-sm text-gray-400">Potential Win:</div>
                    <div class="text-xl font-bold text-green-400">
                      {{ (betStake * (getOdds(match, selectedPlayer!) || 1)).toFixed(2) }} kCoins
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <button
                      @click="confirmSingleBet(match)"
                      :disabled="placingBet || betStake <= 0 || betStake > userStore.wallet.balance"
                      class="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      {{ placingBet ? 'Placing Bet...' : 'Confirm Bet' }}
                    </button>
                    <button
                      @click="closeBetPanel"
                      class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
