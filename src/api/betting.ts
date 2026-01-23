import api from './index'
import type { Wallet } from '@/stores/user'

export interface BetRequest {
  sport: 'table_tennis' | 'darts'
  match_id: number
  tournament_id: number
  predicted_winner_id: number
  predicted_winner_name: string
  opponent_id: number
  opponent_name: string
  odds: number
}

export interface PlaceBetRequest {
  stake: number
  bets: BetRequest[]
}

export interface AddToBetslipRequest {
  betslip_id: number
  bets: BetRequest[]
}

export interface PlaceBetResponse {
  betslip_id: number
  stake: number
  potential_win: number
  combined_odds: number
  new_balance: number
}

export interface AddToBetslipResponse {
  betslip_id: number
  combined_odds: number
  potential_win: number
  total_bets: number
}

export async function placeBet(request: PlaceBetRequest): Promise<PlaceBetResponse> {
  const response = await api.post('/betslips', request)
  return response.data
}

export async function addToBetslip(request: AddToBetslipRequest): Promise<AddToBetslipResponse> {
  const response = await api.post('/betslips/add', request)
  return response.data
}

export async function getBetslips() {
  const response = await api.get('/betslips')
  return response.data
}

export async function getWallet(): Promise<Wallet> {
  const response = await api.get<Wallet>('/wallet')
  return response.data
}

export async function getTransactions() {
  const response = await api.get('/transactions')
  return response.data
}
