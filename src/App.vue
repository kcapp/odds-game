<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
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
        <div class="flex items-center gap-3">
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
