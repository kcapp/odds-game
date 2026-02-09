import type { LoginCredentials, LoginResponse, User } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(error.message || 'Invalid credentials')
    }

    const data: LoginResponse = await response.json()
    
    // Get user info with the token
    const user = await this.getCurrentUser(data.token)
    
    return {
      user,
      token: data.token
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }

    return response.json()
  },

  async validateToken(token: string): Promise<{ user: User; token: string }> {
    const user = await this.getCurrentUser(token)
    return { user, token }
  },
}
