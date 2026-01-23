<template>
  <div class="fixed bottom-4 right-4 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
    <!-- Header -->
    <div class="bg-gray-900 px-4 py-3 rounded-t-lg flex justify-between items-center border-b border-gray-700">
      <div class="flex items-center gap-2">
        <h3 class="text-white font-semibold">Betslip</h3>
        <span v-if="selections.length > 0" class="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
          {{ selections.length }}
        </span>
      </div>
      <button 
        v-if="selections.length > 0"
        @click="clearBetslip" 
        class="text-gray-400 hover:text-white text-sm"
      >
        Clear
      </button>
    </div>

    <!-- Content -->
    <div class="p-4 max-h-96 overflow-y-auto">
      <!-- Empty State -->
      <div v-if="selections.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-sm">No bets selected</p>
        <p class="text-xs mt-2">Add up to {{ maxSelections }} matches</p>
      </div>

      <!-- Selections -->
      <div v-else class="space-y-2">
        <div 
          v-for="sel in selections" 
          :key="`${sel.sport}-${sel.matchId}`"
          class="bg-gray-900 border border-gray-700 rounded p-3"
        >
          <div class="flex justify-between items-start mb-1">
            <div class="flex-1">
              <div class="text-xs text-gray-500 uppercase mb-1">{{ sel.sport.replace('_', ' ') }}</div>
              <div class="text-sm text-white font-medium">{{ sel.predictedWinnerName }}</div>
              <div class="text-xs text-gray-400">vs {{ sel.opponentName }}</div>
            </div>
            <button 
              @click="removeSelection(sel.matchId, sel.sport)"
              class="text-gray-500 hover:text-red-400"
            >
              ✕
            </button>
          </div>
          <div class="text-right mt-2">
            <span class="text-green-400 font-semibold">{{ sel.odds.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Stake Input -->
      <div v-if="selections.length > 0" class="mt-4 pt-4 border-t border-gray-700">
        <label class="block text-sm text-gray-400 mb-2">Stake (kCoins)</label>
        <input 
          v-model.number="stake" 
          type="number" 
          min="1" 
          :max="wallet.balance"
          step="1"
          class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
        />
        <div class="text-xs text-gray-500 mt-1">Balance: {{ wallet.balance.toFixed(2) }} kCoins</div>
      </div>

      <!-- Summary -->
      <div v-if="selections.length > 0" class="mt-4 pt-4 border-t border-gray-700 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-400">Combined Odds:</span>
          <span class="text-white font-semibold">{{ combinedOdds.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-base">
          <span class="text-gray-400">Potential Win:</span>
          <span class="text-green-400 font-bold">{{ potentialWin.toFixed(2) }} kC</span>
        </div>
      </div>

      <!-- Place Bet Button -->
      <button 
        v-if="selections.length > 0"
        @click="handlePlaceBet"
        :disabled="placing || stake > wallet.balance || stake < 1"
        class="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors"
      >
        {{ placing ? 'Placing Bet...' : 'Place Bet' }}
      </button>

      <!-- Error Message -->
      <div v-if="error" class="mt-3 text-red-400 text-sm text-center">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mt-3 text-green-400 text-sm text-center">
        Bet placed successfully!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBetslipStore } from '@/stores/betslip'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'

const betslipStore = useBetslipStore()
const userStore = useUserStore()
const { selections, stake, combinedOdds, potentialWin, maxSelections } = storeToRefs(betslipStore)
const { clearBetslip, removeSelection, placeBet } = betslipStore
const { wallet } = storeToRefs(userStore)

const placing = ref(false)
const error = ref('')
const success = ref(false)

async function handlePlaceBet() {
  placing.value = true
  error.value = ''
  success.value = false

  try {
    await placeBet()
    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to place bet'
  } finally {
    placing.value = false
  }
}
</script>
