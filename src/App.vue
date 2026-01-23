<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { ref, onMounted, watch, computed } from 'vue'
import { getBetslips } from '@/api/betting'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const betslips = ref<any[]>([])

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const activeBetslipsCount = computed(() => {
  return betslips.value.filter((b: any) => b.status === 'pending').length
})

const totalPotentialWins = computed(() => {
  return betslips.value
    .filter((b: any) => b.status === 'pending')
    .reduce((sum, b) => sum + b.potential_payout, 0)
})

const totalLosses = computed(() => {
  return betslips.value
    .filter((b: any) => b.status === 'lost')
    .reduce((sum, b) => sum + b.stake, 0)
})

const loadBettingStats = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    await userStore.loadWallet()
    betslips.value = await getBetslips()
  } catch (error) {
    console.error('Failed to load betting stats:', error)
  }
}

onMounted(() => {
  loadBettingStats()
})

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) loadBettingStats()
})

// Reload stats when returning to sports page
watch(() => router.currentRoute.value.path, (path) => {
  if (path === '/sports' || path === '/bets') {
    loadBettingStats()
  }
})
</script>

<template>
  <div id="app">
    <header v-if="authStore.isAuthenticated" class="bg-gray-800 p-3">
      <nav class="flex gap-6 max-w-7xl mx-auto items-center justify-between">
        <div class="flex gap-6">
          <RouterLink to="/" class="text-white no-underline font-medium hover:text-green-400 transition-colors router-link text-sm">Home</RouterLink>
          <RouterLink to="/sports" class="text-white no-underline font-medium hover:text-green-400 transition-colors router-link text-sm">Sports</RouterLink>
          <RouterLink to="/bets" class="text-white no-underline font-medium hover:text-green-400 transition-colors router-link text-sm">My Bets</RouterLink>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 text-sm">
            <div class="bg-green-600 px-3 py-1.5 rounded-md" title="Your balance">
              <span class="text-white font-semibold">{{ userStore.wallet.balance.toFixed(0) }}</span>
              <span class="text-green-100 ml-1">kCoins</span>
            </div>
            <div v-if="activeBetslipsCount > 0" class="bg-orange-600 px-3 py-1.5 rounded-md" title="Active betslips">
              <span class="text-white font-semibold">{{ activeBetslipsCount }}</span>
              <span class="text-orange-100 ml-1">Active</span>
            </div>
            <div v-if="totalPotentialWins > 0" class="bg-blue-600 px-3 py-1.5 rounded-md" title="Potential wins from active betslips">
              <span class="text-white font-semibold">{{ totalPotentialWins.toFixed(0) }}</span>
              <span class="text-blue-100 ml-1">Pot. Win</span>
            </div>
            <div v-if="totalLosses > 0" class="bg-red-900 px-3 py-1.5 rounded-md" title="Total losses">
              <span class="text-white font-semibold">{{ totalLosses.toFixed(0) }}</span>
              <span class="text-red-100 ml-1">Lost</span>
            </div>
          </div>
          <div class="h-6 w-px bg-gray-600"></div>
          <span class="text-gray-300 font-medium text-sm">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
          <button 
            @click="handleLogout"
            class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 text-sm"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
    <main :class="authStore.isAuthenticated ? 'max-w-7xl mx-auto my-8 px-4' : ''">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.router-link.router-link-active {
  color: #4ade80;
}
</style>
