import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.is_admin === true)

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login({ login: username, password })
      
      user.value = response.user
      token.value = response.token
      localStorage.setItem('auth_token', response.token)
      
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    
    try {
      // Just clear local state (no logout endpoint in API)
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      loading.value = false
    }
  }

  async function validateSession() {
    if (!token.value) return false

    loading.value = true
    
    try {
      const response = await authApi.validateToken(token.value)
      user.value = response.user
      return true
    } catch (e) {
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    validateSession,
    clearError,
  }
})
