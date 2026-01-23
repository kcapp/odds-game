<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

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
    case 'pending': return 'bg-yellow-900 text-yellow-300'
    case 'void': return 'bg-gray-700 text-gray-300'
    default: return 'bg-gray-700 text-gray-300'
  }
}

function getTransactionColor(type: string) {
  if (type === 'bet_won' || type === 'initial_grant') return 'text-green-400'
  if (type === 'bet_placed') return 'text-red-400'
  return 'text-gray-400'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="bets py-8 px-4 max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">My Bets</h1>
      <div class="flex items-center gap-4">
        <p class="text-gray-400">Balance:</p>
        <p class="text-2xl font-bold text-green-400">{{ balance.toFixed(2) }} kCoins</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-700">
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
          Betslips
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

      <div v-else class="space-y-4">
        <div 
          v-for="betslip in betslips" 
          :key="betslip.id"
          class="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6"
        >
          <!-- Betslip Header -->
          <div class="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-700">
            <div>
              <div class="text-sm text-gray-400">Betslip #{{ betslip.id }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(betslip.placed_at) }}</div>
            </div>
            <span :class="['px-3 py-1 rounded text-sm font-medium', getStatusBadgeColor(betslip.status)]">
              {{ betslip.status.toUpperCase() }}
            </span>
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
              <div class="text-white font-medium">{{ betslip.total_stake.toFixed(2) }} kC</div>
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
