<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import { updateBetslipStake, deleteBetslip } from '@/api/betting'
import { useUserStore } from '@/stores/user'

interface Bet {
  id: number
  sport: string
  match_id: number
  tournament_id: number
  predicted_winner_name: string
  opponent_name: string
  odds: number
  status: string
}

interface Betslip {
  id: number
  total_stake: number
  potential_win: number
  combined_odds: number
  status: string
  placed_at: string
  settled_at?: string
  bets: Bet[]
}

interface Transaction {
  id: number
  amount: number
  balance_before: number
  balance_after: number
  transaction_type: string
  description: string
  created_at: string
}

const betslips = ref<Betslip[]>([])
const transactions = ref<Transaction[]>([])
const balance = ref(0)
const loading = ref(true)
const activeTab = ref<'betslips' | 'transactions'>('betslips')
const editingStake = ref<number | null>(null)
const editedStake = ref<number>(0)
const updatingStake = ref(false)
const userStore = useUserStore()
const notification = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
const betFilter = ref<'all' | 'single' | 'betslip'>('all')
const showDeleteConfirm = ref(false)
const betslipToDelete = ref<number | null>(null)

const filteredBetslips = computed(() => {
  if (betFilter.value === 'all') {
    return betslips.value
  } else if (betFilter.value === 'single') {
    return betslips.value.filter(b => b.bets.length === 1)
  } else {
    return betslips.value.filter(b => b.bets.length > 1)
  }
})

async function loadData() {
  loading.value = true
  try {
    const [walletRes, betslipsRes, transactionsRes] = await Promise.all([
      api.get('/wallet'),
      api.get('/betslips'),
      api.get('/transactions')
    ])
    
    balance.value = walletRes.data.balance
    betslips.value = betslipsRes.data
    transactions.value = transactionsRes.data
  } catch (error) {
    console.error('Failed to load betting data:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}

function getStatusColor(status: string) {
  switch (status) {
    case 'won': return 'text-green-400'
    case 'lost': return 'text-red-400'
    case 'pending': return 'text-yellow-400'
    case 'void': return 'text-gray-400'
    default: return 'text-gray-400'
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'won': return 'bg-green-900 text-green-300'
    case 'lost': return 'bg-red-900 text-red-300'
    case 'pending': return 'bg-gray-700 text-gray-300'
    case 'void': return 'bg-gray-700 text-gray-300'
    default: return 'bg-gray-700 text-gray-300'
  }
}

function getTransactionColor(type: string) {
  if (type === 'bet_won' || type === 'initial_grant') return 'text-green-400'
  if (type === 'bet_placed') return 'text-red-400'
  return 'text-gray-400'
}

function startEditingStake(betslip: Betslip) {
  editingStake.value = betslip.id
  editedStake.value = betslip.total_stake
}

function cancelEditingStake() {
  editingStake.value = null
  editedStake.value = 0
}

function showNotification(message: string, type: 'success' | 'error' | 'info') {
  console.log('Showing notification:', message, type)
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

async function saveStake(betslip: Betslip) {
  if (editedStake.value <= 0) {
    showNotification('Stake must be greater than 0', 'error')
    return
  }

  if (editedStake.value > balance.value + betslip.total_stake) {
    showNotification('Insufficient balance', 'error')
    return
  }

  updatingStake.value = true
  try {
    const response = await updateBetslipStake({
      betslip_id: betslip.id,
      new_stake: editedStake.value
    })

    // Update local data
    betslip.total_stake = response.new_stake
    betslip.potential_win = response.new_potential_win
    balance.value = response.new_balance
    
    // Refresh user wallet
    await userStore.loadWallet()
    
    editingStake.value = null
    showNotification('Stake updated successfully', 'success')
  } catch (error: any) {
    showNotification(error.response?.data?.error || error.message || 'Failed to update stake', 'error')
  } finally {
    updatingStake.value = false
  }
}

async function handleDeleteBetslip(betslipId: number) {
  betslipToDelete.value = betslipId
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  betslipToDelete.value = null
}

async function confirmDelete() {
  if (!betslipToDelete.value) return

  try {
    const response = await deleteBetslip({ betslip_id: betslipToDelete.value })
    
    // Remove from local list
    betslips.value = betslips.value.filter(b => b.id !== betslipToDelete.value)
    
    // Update balance
    balance.value = response.new_balance
    await userStore.loadWallet()
    
    showNotification(`Betslip deleted. Refunded ${response.refunded.toFixed(2)} kC`, 'success')
  } catch (error: any) {
    showNotification(error.response?.data?.error || error.message || 'Failed to delete betslip', 'error')
  } finally {
    showDeleteConfirm.value = false
    betslipToDelete.value = null
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="bets py-8 px-4 max-w-7xl mx-auto">
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

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style="z-index: 9999;"
      @click.self="cancelDelete"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-4">Confirm Delete</h3>
          
          <p class="text-gray-300 mb-6">
            Are you sure you want to delete this {{ betslips.find(b => b.id === betslipToDelete)?.bets.length === 1 ? 'single bet' : 'betslip' }}? Your stake will be refunded.
          </p>

          <div class="flex gap-3 justify-end">
            <button
              @click="cancelDelete"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">My Bets</h1>
      <div class="flex items-center gap-4">
        <p class="text-gray-400">Balance:</p>
        <p class="text-2xl font-bold text-green-400">{{ balance.toFixed(2) }} kCoins</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-700">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <button
            @click="activeTab = 'betslips'"
            :class="[
              'pb-3 px-4 font-medium transition-colors',
              activeTab === 'betslips' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-white'
            ]"
          >
            My Bets
          </button>
          <button
            @click="activeTab = 'transactions'"
            :class="[
              'pb-3 px-4 font-medium transition-colors',
              activeTab === 'transactions' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-white'
            ]"
          >
            Transactions
          </button>
        </div>
        
        <!-- Filter buttons -->
        <div v-if="activeTab === 'betslips'" class="flex gap-2 pb-3">
          <button
            @click="betFilter = 'all'"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              betFilter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            All
          </button>
          <button
            @click="betFilter = 'single'"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              betFilter === 'single' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            Single Bets
          </button>
          <button
            @click="betFilter = 'betslip'"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              betFilter === 'betslip' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            Betslips
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400">Loading...</p>
    </div>

    <!-- Betslips Tab -->
    <div v-else-if="activeTab === 'betslips'">
      <div v-if="betslips.length === 0" class="text-center py-12">
        <p class="text-gray-400">No bets placed yet</p>
      </div>

      <div v-else-if="filteredBetslips.length === 0" class="text-center py-12">
        <p class="text-gray-400">No {{ betFilter === 'single' ? 'single bets' : 'betslips' }} found</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="betslip in filteredBetslips" 
          :key="betslip.id"
          class="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6"
        >
          <!-- Betslip Header -->
          <div class="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-700">
            <div>
              <div class="flex items-center gap-2">
                <div class="text-sm text-white font-medium uppercase">
                  {{ betslip.bets.length === 1 ? 'Single Bet' : 'Betslip' }} #{{ betslip.id }}
                </div>
                <span v-if="betslip.bets.length > 1" class="text-xs px-2 py-0.5 bg-blue-900 text-blue-300 rounded">
                  {{ betslip.bets.length }} bets
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(betslip.placed_at) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusBadgeColor(betslip.status)]">
                {{ betslip.status.toUpperCase() }}
              </span>
              <button
                v-if="betslip.status === 'pending'"
                @click="handleDeleteBetslip(betslip.id)"
                class="px-2 py-0.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="Delete betslip"
              >
                DELETE
              </button>
            </div>
          </div>

          <!-- Bets in Betslip -->
          <div class="space-y-3 mb-4">
            <div 
              v-for="bet in betslip.bets" 
              :key="bet.id"
              class="bg-gray-900 rounded p-3"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs text-gray-500 uppercase mb-1">{{ bet.sport.replace('_', ' ') }}</div>
                  <div class="text-white font-medium">{{ bet.predicted_winner_name }}</div>
                  <div class="text-sm text-gray-400">vs {{ bet.opponent_name }}</div>
                </div>
                <div class="text-right">
                  <div class="text-green-400 font-semibold">{{ bet.odds.toFixed(2) }}</div>
                  <div :class="['text-xs mt-1', getStatusColor(bet.status)]">
                    {{ bet.status }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Betslip Summary -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div>
              <div class="text-xs text-gray-500 mb-1">Stake</div>
              <div v-if="editingStake === betslip.id" class="flex items-center gap-2">
                <input
                  v-model.number="editedStake"
                  type="number"
                  min="1"
                  step="10"
                  :max="balance + betslip.total_stake"
                  class="w-20 px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-green-500"
                  :disabled="updatingStake"
                />
                <button
                  @click="saveStake(betslip)"
                  :disabled="updatingStake"
                  class="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  @click="cancelEditingStake"
                  :disabled="updatingStake"
                  class="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
              <div v-else class="flex items-center gap-2">
                <div class="text-white font-medium">{{ betslip.total_stake.toFixed(2) }} kC</div>
                <button
                  v-if="betslip.status === 'pending'"
                  @click="startEditingStake(betslip)"
                  class="text-xs text-blue-400 hover:text-blue-300"
                  title="Edit stake"
                >
                  ✎
                </button>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Combined Odds</div>
              <div class="text-white font-medium">{{ betslip.combined_odds.toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Potential Win</div>
              <div class="text-green-400 font-medium">{{ betslip.potential_win.toFixed(2) }} kC</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Result</div>
              <div :class="['font-medium', getStatusColor(betslip.status)]">
                {{ betslip.status === 'won' ? `+${betslip.potential_win.toFixed(2)} kC` : 
                   betslip.status === 'lost' ? `-${betslip.total_stake.toFixed(2)} kC` : 
                   '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Tab -->
    <div v-else-if="activeTab === 'transactions'">
      <div v-if="transactions.length === 0" class="text-center py-12">
        <p class="text-gray-400">No transactions yet</p>
      </div>

      <div v-else class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">Description</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400">Amount</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400">Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr 
                v-for="tx in transactions" 
                :key="tx.id"
                class="hover:bg-gray-750"
              >
                <td class="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                  {{ formatDate(tx.created_at) }}
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {{ tx.transaction_type.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-400">
                  {{ tx.description }}
                </td>
                <td class="px-4 py-3 text-right">
                  <span :class="['font-medium', getTransactionColor(tx.transaction_type)]">
                    {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount.toFixed(2) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-white font-medium">
                  {{ tx.balance_after.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
