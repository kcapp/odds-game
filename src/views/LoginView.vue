<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const login = ref('')
const password = ref('')

const handleSubmit = async () => {
  const success = await authStore.login(login.value, password.value)
  
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="max-w-md w-full space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white mb-2">SBP</h1>
        <p class="text-gray-400 text-sm">Sign in to your account</p>
      </div>

      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <input
              id="login"
              v-model="login"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="Username"
            />
          </div>

          <div>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="Password"
            />
          </div>

          <div v-if="authStore.error" class="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded-lg text-xs">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out text-sm"
          >
            <span class="flex items-center justify-center">
              <svg v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
