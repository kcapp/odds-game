<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import { useUserStore } from '@/stores/user'

interface DashboardStats {
  total_bets: number
  pending_bets: number
  won_bets: number
  lost_bets: number
  total_wagered: number
  total_winnings: number
  total_losses: number
  net_profit: number
  win_rate: number
  average_odds: number
  biggest_win: number
  recent_bets: any[]
}

const userStore = useUserStore()
const stats = ref<DashboardStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  await loadDashboard()
})

async function loadDashboard() {
  loading.value = true
  try {
    const response = await api.get('/dashboard/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

const profitClass = computed(() => {
  if (!stats.value) return 'text-gray-400'
  return stats.value.net_profit > 0 ? 'text-green-400' : stats.value.net_profit < 0 ? 'text-red-400' : 'text-gray-400'
})
</script>

<template>
  <div class="home py-8 px-4 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Dashboard</h1>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400">Loading dashboard...</p>
    </div>

    <div v-else-if="stats" class="space-y-6">
      <!-- Top Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Balance -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="text-sm text-gray-400 mb-2">Current Balance</div>
          <div class="text-3xl font-bold text-green-400">{{ userStore.wallet.balance.toFixed(2) }}</div>
          <div class="text-xs text-gray-500 mt-1">kCoins</div>
        </div>

        <!-- Total Bets -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="text-sm text-gray-400 mb-2">Total Bets</div>
          <div class="text-3xl font-bold text-white">{{ stats.total_bets }}</div>
          <div class="text-xs text-gray-500 mt-1">
            <span class="text-orange-400">{{ stats.pending_bets }}</span> pending
          </div>
        </div>

        <!-- Win Rate -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="text-sm text-gray-400 mb-2">Win Rate</div>
          <div class="text-3xl font-bold text-blue-400">{{ stats.win_rate.toFixed(1) }}%</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ stats.won_bets }}W / {{ stats.lost_bets }}L
          </div>
        </div>

        <!-- Net Profit -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="text-sm text-gray-400 mb-2">Net Profit/Loss</div>
          <div class="text-3xl font-bold" :class="profitClass">
            {{ stats.net_profit >= 0 ? '+' : '' }}{{ stats.net_profit.toFixed(2) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">kCoins</div>
        </div>
      </div>

      <!-- Detailed Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Financial Summary -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold mb-4">Financial Summary</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Total Wagered:</span>
              <span class="font-semibold text-white">{{ stats.total_wagered.toFixed(2) }} kC</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Total Winnings:</span>
              <span class="font-semibold text-green-400">+{{ stats.total_winnings.toFixed(2) }} kC</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Total Losses:</span>
              <span class="font-semibold text-red-400">-{{ stats.total_losses.toFixed(2) }} kC</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-gray-700">
              <span class="text-gray-400">ROI:</span>
              <span class="font-semibold" :class="profitClass">
                {{ stats.total_wagered > 0 ? ((stats.net_profit / stats.total_wagered) * 100).toFixed(1) : '0.0' }}%
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Biggest Win:</span>
              <span class="font-semibold text-green-400">{{ stats.biggest_win.toFixed(2) }} kC</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Average Odds:</span>
              <span class="font-semibold text-white">{{ stats.average_odds.toFixed(2) }}x</span>
            </div>
          </div>
        </div>

        <!-- Performance Stats -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold mb-4">Performance</h2>
          <div class="space-y-4">
            <!-- Win Rate Progress Bar -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-400">Wins</span>
                <span class="text-green-400">{{ stats.won_bets }} ({{ stats.win_rate.toFixed(1) }}%)</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-green-500 h-2 rounded-full transition-all"
                  :style="{ width: stats.win_rate + '%' }"
                ></div>
              </div>
            </div>

            <!-- Loss Rate Progress Bar -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-400">Losses</span>
                <span class="text-red-400">{{ stats.lost_bets }} ({{ (100 - stats.win_rate).toFixed(1) }}%)</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-red-500 h-2 rounded-full transition-all"
                  :style="{ width: (100 - stats.win_rate) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Pending Bets Progress -->
            <div v-if="stats.pending_bets > 0">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-400">Pending</span>
                <span class="text-orange-400">{{ stats.pending_bets }}</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-orange-500 h-2 rounded-full transition-all"
                  :style="{ width: ((stats.pending_bets / stats.total_bets) * 100) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Average Stake -->
            <div class="pt-4 border-t border-gray-700">
              <div class="flex justify-between items-center">
                <span class="text-gray-400">Average Stake:</span>
                <span class="font-semibold text-white">
                  {{ stats.total_bets > 0 ? (stats.total_wagered / stats.total_bets).toFixed(2) : '0.00' }} kC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="stats.recent_bets && stats.recent_bets.length > 0" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-bold mb-4">Recent Bets</h2>
        <div class="space-y-3">
          <div 
            v-for="bet in stats.recent_bets" 
            :key="bet.id"
            class="flex items-center justify-between p-3 bg-gray-750 rounded"
          >
            <div class="flex-1">
              <div class="font-medium text-white">{{ bet.predicted_winner_name }}</div>
              <div class="text-xs text-gray-400">
                {{ bet.sport === 'table_tennis' ? 'Table Tennis' : 'Darts' }} • 
                {{ bet.odds.toFixed(2) }}x • 
                {{ bet.stake.toFixed(2) }} kC
              </div>
            </div>
            <div>
              <span 
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="{
                  'bg-green-900 text-green-300': bet.status === 'won',
                  'bg-red-900 text-red-300': bet.status === 'lost',
                  'bg-gray-700 text-gray-300': bet.status === 'pending'
                }"
              >
                {{ bet.status.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
