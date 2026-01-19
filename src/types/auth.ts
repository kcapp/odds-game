export interface User {
  id: number
  first_name: string
  last_name: string
  login: string
  requires_change: boolean
  is_cheater: number
}

export interface LoginCredentials {
  login: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface AuthResponse {
  user: User
  token: string
}
