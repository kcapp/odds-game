import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTournaments, getMatches } from '@/api/sports'
import type {
  TableTennisTournament,
  DartsTournament,
  TableTennisMatch,
  DartsMatch,
  SportType,
  AllTournamentsResponse,
  TournamentResponse
} from '@/types/sports'

export const useSportsStore = defineStore('sports', () => {
  const tableTennisTournaments = ref<TableTennisTournament[]>([])
  const dartsTournaments = ref<DartsTournament[]>([])
  const selectedSport = ref<SportType>('all')
  const selectedTournament = ref<number | null>(null)
  const matches = ref<TableTennisMatch[] | DartsMatch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTournaments(sport: SportType = 'all') {
    loading.value = true
    error.value = null
    
    try {
      const response = await getTournaments(sport)
      
      if ('table_tennis' in response || 'darts' in response) {
        // All tournaments response
        const allResponse = response as AllTournamentsResponse
        tableTennisTournaments.value = allResponse.table_tennis || []
        dartsTournaments.value = allResponse.darts || []
      } else {
        // Single sport response
        const sportResponse = response as TournamentResponse
        if (sportResponse.sport === 'table_tennis') {
          tableTennisTournaments.value = sportResponse.tournaments as TableTennisTournament[]
          dartsTournaments.value = []
        } else if (sportResponse.sport === 'darts') {
          dartsTournaments.value = sportResponse.tournaments as DartsTournament[]
          tableTennisTournaments.value = []
        }
      }
      
      selectedSport.value = sport
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tournaments'
      console.error('Error fetching tournaments:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchMatches(sport: 'table_tennis' | 'darts', tournamentId: number) {
    loading.value = true
    error.value = null
    
    try {
      const response = await getMatches(sport, tournamentId)
      matches.value = response.matches
      selectedTournament.value = tournamentId
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch matches'
      console.error('Error fetching matches:', e)
    } finally {
      loading.value = false
    }
  }

  function clearMatches() {
    matches.value = []
    selectedTournament.value = null
  }

  return {
    tableTennisTournaments,
    dartsTournaments,
    selectedSport,
    selectedTournament,
    matches,
    loading,
    error,
    fetchTournaments,
    fetchMatches,
    clearMatches
  }
})
