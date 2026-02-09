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
const showSingleBetModal = ref(false)
const selectedBet = ref<{ match: any, playerIndex: number, odds: number } | null>(null)
const betStake = ref<number>(100)
const placingBet = ref(false)
const betslipExpanded = ref(true)
const placingBetslip = ref(false)
const betslipError = ref('')
const betslipSuccess = ref(false)
const showBetslipSelector = ref(false)
const selectedBetForBetslip = ref<BetSelection | null>(null)
const addingToBetslip = ref(false)
const notification = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

const availableBetslips = computed(() => {
  if (!selectedBetForBetslip.value) return []
  
  return betslipStore.pendingBetslips.filter(betslip => {
    // Filter out betslips that already have this match
    const hasMatch = betslip.bets.some(bet => 
      bet.match_id === selectedBetForBetslip.value?.matchId && 
      bet.sport === selectedBetForBetslip.value?.sport
    )
    
    // Filter out if betslip is full (5 bets max)
    if (betslip.bets.length >= 5) return false
    
    return !hasMatch
  })
})

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
    return new Date(dateA).getTime() - new Date(dateB).getTime()
  })
})

function canBet(match: any): boolean {
  const status = getMatchStatus(match)
  // Only allow betting on scheduled matches (not started, not finished)
  // Even in test mode, don't allow betting on finished games
  return status === 'Scheduled' && getOdds(match, 0) !== null
}

function openBetPanel(match: any, playerIndex: number) {
  const odds = getOdds(match, playerIndex)
  if (!odds) return
  
  selectedBet.value = { match, playerIndex, odds }
  showSingleBetModal.value = true
  betStake.value = 100
}

async function confirmSingleBet() {
  if (!selectedBet.value) return
  
  const { match, playerIndex, odds } = selectedBet.value

  if (betStake.value <= 0) {
    showNotification('Please enter a valid stake amount', 'error')
    return
  }

  if (betStake.value > userStore.wallet.balance) {
    showNotification('Insufficient balance', 'error')
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
      bet_type: 'single',  // Mark as single bet
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
    
    // Close modal
    showSingleBetModal.value = false
    selectedBet.value = null
    showNotification('Bet placed successfully!', 'success')
  } catch (error: any) {
    console.error('Failed to place bet:', error)
    showNotification(error.response?.data?.error || error.message || 'Failed to place bet', 'error')
  } finally {
    placingBet.value = false
  }
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
      showNotification('Cannot add bet: Either match is already in betslip or betslip is full (max 5 bets)', 'error')
    }
  }
}

function showNotification(message: string, type: 'success' | 'error' | 'info') {
  console.log('Showing notification:', message, type)
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

async function addToSelectedBetslip(betslipId: number | null) {
  if (!selectedBetForBetslip.value) return

  addingToBetslip.value = true
  try {
    if (betslipId === null) {
      // Add to current (new) betslip
      const added = betslipStore.addSelection(selectedBetForBetslip.value)
      if (!added) {
        showNotification('Cannot add bet: Either match is already in betslip or betslip is full (max 5 bets)', 'error')
      } else {
        // Close modal and scroll to top
        showBetslipSelector.value = false
        selectedBetForBetslip.value = null
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      // Add to existing betslip
      await betslipStore.addToExistingBetslip(betslipId, selectedBetForBetslip.value)
      showBetslipSelector.value = false
      selectedBetForBetslip.value = null
    }
  } catch (error: any) {
    showNotification(error.response?.data?.error || error.message || 'Failed to add bet to betslip', 'error')
  } finally {
    addingToBetslip.value = false
  }
}

function cancelBetslipSelection() {
  showBetslipSelector.value = false
  selectedBetForBetslip.value = null
}

async function handleDeleteBetslip(betslipId: number) {
  if (!confirm('Are you sure you want to delete this betslip? Your stake will be refunded.')) {
    return
  }

  try {
    await betslipStore.removeBetslip(betslipId)
    showNotification('Betslip deleted successfully', 'success')
  } catch (error: any) {
    showNotification(error.response?.data?.error || error.message || 'Failed to delete betslip', 'error')
  }
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
    <!-- Notification -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
    >
      <div
        v-if="notification"
        :class="[
          'fixed top-4 right-4 max-w-md px-6 py-4 rounded-lg shadow-lg border',
          notification.type === 'success' ? 'bg-green-900 border-green-700 text-green-100' :
          notification.type === 'error' ? 'bg-red-900 border-red-700 text-red-100' :
          'bg-blue-900 border-blue-700 text-blue-100'
        ]"
        style="z-index: 9999;"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-0.5">
            <svg v-if="notification.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="notification.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium">{{ notification.message }}</p>
          </div>
          <button
            @click="notification = null"
            class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

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
            <div v-if="availableBetslips.length > 0" class="pt-2">
              <div class="text-sm text-gray-400 mb-2">Or add to existing betslip:</div>
              <div
                v-for="betslip in availableBetslips"
                :key="betslip.id"
                class="mb-2 border border-gray-700 rounded bg-gray-900"
              >
                <button
                  @click="addToSelectedBetslip(betslip.id)"
                  :disabled="addingToBetslip || betslip.bets.length >= 5"
                  class="w-full p-3 hover:bg-gray-750 disabled:opacity-50 transition-colors text-left"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium text-white uppercase">BETSLIP #{{ betslip.id }}</div>
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
                <div class="px-3 pb-2">
                  <button
                    @click="handleDeleteBetslip(betslip.id)"
                    class="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete Betslip
                  </button>
                </div>
              </div>
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

          </template>
        </tbody>
      </table>
    </div>

    <!-- Single Bet Modal -->
    <div 
      v-if="showSingleBetModal && selectedBet"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style="z-index: 9999;"
      @click.self="showSingleBetModal = false; selectedBet = null"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">Place Single Bet</h3>
            <button 
              @click="showSingleBetModal = false; selectedBet = null"
              class="text-gray-400 hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <!-- Selected Player -->
            <div class="bg-gray-700 rounded p-3">
              <div class="text-sm text-gray-400 mb-1">Betting on:</div>
              <div class="text-white font-semibold">
                {{ selectedBet.playerIndex === 0 ? 
                  (sport === 'table_tennis' ? selectedBet.match.home_player_name : getPlayerName(selectedBet.match.players[0], selectedBet.match)) :
                  (sport === 'table_tennis' ? selectedBet.match.away_player_name : getPlayerName(selectedBet.match.players[1], selectedBet.match))
                }}
              </div>
              <div class="text-sm text-green-300 mt-1">
                Odds: {{ selectedBet.odds.toFixed(2) }}
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
                {{ (betStake * selectedBet.odds).toFixed(2) }} kCoins
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                @click="confirmSingleBet()"
                :disabled="placingBet || betStake <= 0 || betStake > userStore.wallet.balance"
                class="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                {{ placingBet ? 'Placing Bet...' : 'Confirm Bet' }}
              </button>
              <button
                @click="showSingleBetModal = false; selectedBet = null"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
