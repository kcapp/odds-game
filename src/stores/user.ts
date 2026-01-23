import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWallet } from '@/api/betting'

export interface Wallet {
  id: number
  user_id: number
  balance: number
  created_at: string
  updated_at: string
}

export const useUserStore = defineStore('user', () => {
  const wallet = ref<Wallet>({
    id: 0,
    user_id: 0,
    balance: 0,
    created_at: '',
    updated_at: ''
  })
  const loadingWallet = ref(false)

  async function loadWallet() {
    loadingWallet.value = true
    try {
      wallet.value = await getWallet()
    } catch (error) {
      console.error('Failed to load wallet:', error)
    } finally {
      loadingWallet.value = false
    }
  }

  return {
    wallet,
    loadingWallet,
    loadWallet
  }
})
