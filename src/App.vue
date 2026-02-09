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
    <header v-if="authStore.isAuthenticated" class="bg-gray-800 p-2">
      <nav class="flex max-w-7xl mx-auto items-center justify-between px-4">
        <div class="flex gap-4 items-center">
          <RouterLink to="/" class="text-white no-underline font-medium hover:text-green-400 transition-colors router-link px-2 py-1">Home</RouterLink>
          <RouterLink to="/sports" class="text-white no-underline font-medium hover:text-green-400 transition-colors router-link px-2 py-1">Sports</RouterLink>
          <RouterLink to="/bets" class="text-white no-underline font-medium hover:text-green-400 transition-colors router-link px-2 py-1 flex items-center gap-2">
            <span>My Bets</span>
            <span v-if="activeBetslipsCount > 0" class="bg-orange-600 px-2 py-0.5 rounded font-semibold text-white">{{ activeBetslipsCount }}</span>
            <span class="bg-green-600 px-2 py-0.5 rounded font-semibold text-white">{{ userStore.wallet.balance.toFixed(0) }} kC</span>
          </RouterLink>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-gray-300 font-medium">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            <span v-if="authStore.isAdmin" class="bg-purple-600 px-2 py-0.5 rounded font-semibold text-white" title="Administrator">
              ADMIN
            </span>
          </div>
          <button 
            @click="handleLogout"
            class="bg-red-600 hover:bg-red-700 text-white font-medium px-2 py-0.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.router-link.router-link-active {
  color: #4ade80;
}
</style>

<style>
/* Global font size standardization */
button, a, span, div {
  font-size: 14px !important;
}
</style>
