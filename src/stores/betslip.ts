import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useUserStore } from './user'
import { getBetslips, addToBetslip, deleteBetslip } from '@/api/betting'

export interface BetSelection {
  sport: 'darts' | 'table_tennis'
  matchId: number
  tournamentId: number
  predictedWinnerId: number
  predictedWinnerName: string
  opponentId: number
  opponentName: string
  odds: number
}

export interface PendingBetslip {
  id: number
  total_stake: number
  potential_win: number
  combined_odds: number
  status: string
  bet_type: string
  placed_at: string
  bets: any[]
}

export const useBetslipStore = defineStore('betslip', () => {
  const selections = ref<BetSelection[]>([])
  const stake = ref<number>(10)
  const pendingBetslips = ref<PendingBetslip[]>([])

  const maxSelections = 5

  const combinedOdds = computed(() => {
    if (selections.value.length === 0) return 1
    return selections.value.reduce((acc, sel) => acc * sel.odds, 1)
  })

  const potentialWin = computed(() => {
    return stake.value * combinedOdds.value
  })

  const canAddMore = computed(() => {
    return selections.value.length < maxSelections
  })

  function addSelection(selection: BetSelection) {
    // Check if match already in betslip
    const exists = selections.value.some(
      s => s.matchId === selection.matchId && s.sport === selection.sport
    )
    if (exists) {
      return false
    }

    if (selections.value.length >= maxSelections) {
      return false
    }

    selections.value.push(selection)
    return true
  }

  function removeSelection(matchId: number, sport: string) {
    selections.value = selections.value.filter(
      s => !(s.matchId === matchId && s.sport === sport)
    )
  }

  function clearBetslip() {
    selections.value = []
    stake.value = 10
  }

  function isInBetslip(matchId: number, sport: string): boolean {
    return selections.value.some(
      s => s.matchId === matchId && s.sport === sport
    )
  }

  async function loadPendingBetslips() {
    try {
      const allBetslips = await getBetslips()
      pendingBetslips.value = allBetslips.filter((b: any) => b.status === 'pending')
    } catch (error) {
      console.error('Failed to load pending betslips:', error)
      pendingBetslips.value = []
    }
  }

  async function placeBet() {
    const userStore = useUserStore()
    if (selections.value.length === 0) {
      throw new Error('No selections in betslip')
    }

    if (stake.value > userStore.wallet.balance) {
      throw new Error('Insufficient balance')
    }

    const bets = selections.value.map(sel => ({
      sport: sel.sport,
      match_id: sel.matchId,
      tournament_id: sel.tournamentId,
      predicted_winner_id: sel.predictedWinnerId,
      predicted_winner_name: sel.predictedWinnerName,
      opponent_id: sel.opponentId,
      opponent_name: sel.opponentName,
      odds: sel.odds
    }))

    const response = await api.post('/betslips', {
      bets,
      stake: stake.value,
      bet_type: 'betslip'  // Always mark as betslip when using betslip store
    })

    // Update balance in user store
    await userStore.loadWallet()

    // Reload pending betslips
    await loadPendingBetslips()

    // Clear betslip
    clearBetslip()

    return response.data
  }

  async function addToExistingBetslip(betslipId: number, selection: BetSelection) {
    const bets = [{
      sport: selection.sport,
      match_id: selection.matchId,
      tournament_id: selection.tournamentId,
      predicted_winner_id: selection.predictedWinnerId,
      predicted_winner_name: selection.predictedWinnerName,
      opponent_id: selection.opponentId,
      opponent_name: selection.opponentName,
      odds: selection.odds
    }]

    const response = await addToBetslip({
      betslip_id: betslipId,
      bets
    })

    // Reload pending betslips to show updated data
    await loadPendingBetslips()

    return response
  }

  async function removeBetslip(betslipId: number) {
    const userStore = useUserStore()
    
    const response = await deleteBetslip({
      betslip_id: betslipId
    })

    // Update balance in user store
    await userStore.loadWallet()

    // Reload pending betslips
    await loadPendingBetslips()

    return response
  }

  return {
    selections,
    stake,
    combinedOdds,
    potentialWin,
    canAddMore,
    maxSelections,
    pendingBetslips,
    addSelection,
    removeSelection,
    clearBetslip,
    isInBetslip,
    placeBet,
    loadPendingBetslips,
    addToExistingBetslip,
    removeBetslip
  }
})
