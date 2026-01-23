import { fetchWithAuth } from './client'
import type {
  AllTournamentsResponse,
  TournamentResponse,
  MatchResponse,
  SportType
} from '@/types/sports'

export async function getTournaments(sport: SportType = 'all'): Promise<AllTournamentsResponse | TournamentResponse> {
  const endpoint = sport === 'all' 
    ? '/tournaments' 
    : `/tournaments?sport=${sport}`
  
  return fetchWithAuth<AllTournamentsResponse | TournamentResponse>(endpoint)
}

export async function getMatches(sport: 'table_tennis' | 'darts', tournamentId: number): Promise<MatchResponse> {
  return fetchWithAuth<MatchResponse>(`/matches?sport=${sport}&tournament_id=${tournamentId}`)
}

export async function getProbabilities(sport: 'table_tennis' | 'darts', tournamentId: number): Promise<any[]> {
  return fetchWithAuth<any[]>(`/probabilities?sport=${sport}&tournament_id=${tournamentId}`)
}

export async function getPlayers(sport: 'table_tennis' | 'darts'): Promise<any[]> {
  return fetchWithAuth<any[]>(`/players?sport=${sport}`)
}
