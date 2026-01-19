<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSportsStore } from '@/stores/sports'
import TournamentMatches from '@/components/sports/TournamentMatches.vue'
import type { TableTennisTournament, DartsTournament } from '@/types/sports'

const sportsStore = useSportsStore()
const fetchedPlayoffTournaments = ref<DartsTournament[]>([])
const selectedTournament = ref<{sport: 'table_tennis' | 'darts', tournament: TableTennisTournament | DartsTournament} | null>(null)

onMounted(async () => {
  await sportsStore.fetchTournaments('all')
  
  // Fetch playoff tournament details for darts
  const playoffIds = new Set<number>()
  sportsStore.dartsTournaments.forEach(t => {
    if (t.playoffs_tournament_id) {
      playoffIds.add(t.playoffs_tournament_id)
    }
  })
  
  // Fetch missing playoff tournaments from API
  for (const id of playoffIds) {
    // Check if already in the loaded list
    const existingTournament = sportsStore.dartsTournaments.find(t => t.id === id)
    if (!existingTournament) {
      try {
        const response = await fetch(`https://darts.sportradar.ag/api/tournament/${id}`)
        const tournament: DartsTournament = await response.json()
        fetchedPlayoffTournaments.value.push(tournament)
      } catch (error) {
        console.error(`Failed to fetch playoff tournament ${id}:`, error)
      }
    }
  }
  
  // Load end dates for visible tournaments
  sortedTableTennisTournaments.value.forEach(tournament => {
    loadTableTennisEndDate(tournament)
  })
})

function selectTournament(sport: 'table_tennis' | 'darts', tournament: TableTennisTournament | DartsTournament) {
  selectedTournament.value = { sport, tournament }
}

function backToTournaments() {
  selectedTournament.value = null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

async function getTableTennisEndDate(tournament: TableTennisTournament): Promise<string> {
  // If we don't have an end date, fetch matches to get the last match date
  try {
    const response = await fetch(`http://localhost:8080/api/matches?sport=table_tennis&tournament_id=${tournament.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    const data = await response.json()
    if (data.matches && data.matches.length > 0) {
      // Find the latest date_of_match
      const latestMatch = data.matches.reduce((latest: any, match: any) => {
        return new Date(match.date_of_match) > new Date(latest.date_of_match) ? match : latest
      })
      return latestMatch.date_of_match
    }
  } catch (error) {
    console.error('Failed to fetch matches:', error)
  }
  return ''
}

// Sorted tournaments by start date
const sortedTableTennisTournaments = computed(() => {
  return [...sportsStore.tableTennisTournaments].sort((a, b) => {
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  })
})

const sortedDartsTournaments = computed(() => {
  // Combine loaded tournaments with fetched playoff tournaments
  const allDartsTournaments = [
    ...sportsStore.dartsTournaments,
    ...fetchedPlayoffTournaments.value
  ]
  return allDartsTournaments.sort((a, b) => {
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  })
})

// Helper to get playoff tournament for table tennis using parent_tournament_id
function getTableTennisPlayoffTournament(tournament: TableTennisTournament): TableTennisTournament | null {
  if (tournament.is_playoffs) return null
  
  // Find playoff tournament where parent_tournament_id matches this tournament's id
  return sortedTableTennisTournaments.value.find(t => 
    t.is_playoffs && t.parent_tournament_id === tournament.id
  ) || null
}

// Helper to get playoff tournament name for darts
function getPlayoffTournamentName(playoffId: number): string {
  const tournament = sortedDartsTournaments.value.find(t => t.id === playoffId)
  return tournament ? tournament.name : `#${playoffId}`
}

// Cache for end dates
const tableTennisEndDates = ref<Record<number, string>>({})

async function loadTableTennisEndDate(tournament: TableTennisTournament) {
  if (!tableTennisEndDates.value[tournament.id]) {
    const endDate = await getTableTennisEndDate(tournament)
    tableTennisEndDates.value[tournament.id] = endDate
  }
}
</script>

<template>
  <div class="sports">
    <!-- Tournament Matches View -->
    <TournamentMatches 
      v-if="selectedTournament"
      :sport="selectedTournament.sport"
      :tournament="selectedTournament.tournament"
      @back="backToTournaments"
    />

    <!-- Tournaments List -->
    <div v-else>
      <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Sports & Tournaments</h1>
    
      <!-- Loading State -->
      <div v-if="sportsStore.loading" class="text-center py-12">
        <p class="text-gray-400">Loading tournaments...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="sportsStore.error" class="text-center py-12">
        <p class="text-red-400">{{ sportsStore.error }}</p>
      </div>

      <!-- Tournaments Content -->
      <div v-else>
        <!-- Desktop Table View -->
        <div class="hidden lg:block bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-200 w-1/2">
              Table Tennis
            </th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-200 w-1/2">
              Darts
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr 
            v-for="(_, index) in Math.max(sortedTableTennisTournaments.length, sortedDartsTournaments.length)"
            :key="index"
            class="hover:bg-gray-750 transition-colors"
          >
            <!-- Table Tennis Column -->
            <td class="px-6 py-4 align-top w-1/2">
              <div 
                v-if="sortedTableTennisTournaments[index]" 
                class="space-y-1.5 cursor-pointer hover:bg-gray-700 p-3 rounded transition-colors"
                @click="selectTournament('table_tennis', sortedTableTennisTournaments[index])"
              >
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-base flex-1 text-white">
                    {{ sortedTableTennisTournaments[index].name }}
                  </h3>
                  <span 
                    :class="[
                      'px-2 py-0.5 text-xs font-medium rounded flex-shrink-0',
                      sortedTableTennisTournaments[index].is_finished 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-green-900 text-green-300'
                    ]"
                  >
                    {{ sortedTableTennisTournaments[index].is_finished ? 'Finished' : 'Active' }}
                  </span>
                </div>
                
                <div class="text-sm">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-xs font-medium',
                      sortedTableTennisTournaments[index].is_playoffs 
                        ? 'bg-orange-900 text-orange-300' 
                        : 'bg-blue-900 text-blue-300'
                    ]"
                  >
                    {{ sortedTableTennisTournaments[index].is_playoffs ? 'Playoffs' : 'Regular Season' }}
                  </span>
                  <span 
                    v-if="!sortedTableTennisTournaments[index].is_playoffs && getTableTennisPlayoffTournament(sortedTableTennisTournaments[index])"
                    class="ml-2 text-xs text-gray-400"
                  >
                    → Playoffs: {{ getTableTennisPlayoffTournament(sortedTableTennisTournaments[index])!.name }}
                  </span>
                </div>

                <div class="text-sm text-gray-400">
                  <span class="font-medium text-gray-300">Start:</span> 
                  {{ formatDate(sortedTableTennisTournaments[index].start_time) }}
                  <span class="mx-2">•</span>
                  <span class="font-medium text-gray-300">End: </span>
                  <span v-if="tableTennisEndDates[sortedTableTennisTournaments[index].id]">
                    {{ formatDate(tableTennisEndDates[sortedTableTennisTournaments[index].id]) }}
                  </span>
                  <span v-else>-</span>
                </div>
              </div>
            </td>

            <!-- Darts Column -->
            <td class="px-6 py-4 align-top w-1/2">
              <div 
                v-if="sortedDartsTournaments[index]" 
                class="space-y-1.5 cursor-pointer hover:bg-gray-700 p-3 rounded transition-colors"
                @click="selectTournament('darts', sortedDartsTournaments[index])"
              >
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-base flex-1 text-white">
                    {{ sortedDartsTournaments[index].name }}
                  </h3>
                  <span 
                    :class="[
                      'px-2 py-0.5 text-xs font-medium rounded flex-shrink-0',
                      sortedDartsTournaments[index].is_finished 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-green-900 text-green-300'
                    ]"
                  >
                    {{ sortedDartsTournaments[index].is_finished ? 'Finished' : 'Active' }}
                  </span>
                </div>
                
                <div class="text-sm">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-xs font-medium',
                      sortedDartsTournaments[index].is_playoffs 
                        ? 'bg-orange-900 text-orange-300' 
                        : 'bg-blue-900 text-blue-300'
                    ]"
                  >
                    {{ sortedDartsTournaments[index].is_playoffs ? 'Playoffs' : 'Regular Season' }}
                  </span>
                  <span 
                    v-if="sortedDartsTournaments[index].playoffs_tournament_id"
                    class="ml-2 text-xs text-gray-400"
                  >
                    → Playoffs: {{ getPlayoffTournamentName(sortedDartsTournaments[index].playoffs_tournament_id) }}
                  </span>
                </div>

                <div class="text-sm text-gray-400">
                  <span class="font-medium text-gray-300">Start:</span> 
                  {{ formatDate(sortedDartsTournaments[index].start_time) }}
                  <span class="mx-2">•</span>
                  <span class="font-medium text-gray-300">End:</span> 
                  {{ formatDate(sortedDartsTournaments[index].end_time) }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-6">
      <!-- Table Tennis Section -->
      <div v-if="sortedTableTennisTournaments.length > 0">
        <h2 class="text-xl font-bold text-white mb-3">Table Tennis</h2>
        <div class="space-y-3">
          <div 
            v-for="tournament in sortedTableTennisTournaments"
            :key="`tt-${tournament.id}`"
            class="bg-gray-800 rounded-lg p-4 shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
            @click="selectTournament('table_tennis', tournament)"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <h3 class="font-semibold text-base flex-1 text-white">
                {{ tournament.name }}
              </h3>
              <span 
                :class="[
                  'px-2 py-0.5 text-xs font-medium rounded flex-shrink-0',
                  tournament.is_finished 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-green-900 text-green-300'
                ]"
              >
                {{ tournament.is_finished ? 'Finished' : 'Active' }}
              </span>
            </div>
            
            <div class="mb-2">
              <span 
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  tournament.is_playoffs 
                    ? 'bg-orange-900 text-orange-300' 
                    : 'bg-blue-900 text-blue-300'
                ]"
              >
                {{ tournament.is_playoffs ? 'Playoffs' : 'Regular Season' }}
              </span>
              <span 
                v-if="!tournament.is_playoffs && getTableTennisPlayoffTournament(tournament)"
                class="ml-2 text-xs text-gray-400"
              >
                → {{ getTableTennisPlayoffTournament(tournament)!.name }}
              </span>
            </div>

            <div class="text-sm text-gray-400">
              <div>
                <span class="font-medium text-gray-300">Start:</span> 
                {{ formatDate(tournament.start_time) }}
              </div>
              <div>
                <span class="font-medium text-gray-300">End: </span>
                <span v-if="tableTennisEndDates[tournament.id]">
                  {{ formatDate(tableTennisEndDates[tournament.id]) }}
                </span>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Darts Section -->
      <div v-if="sortedDartsTournaments.length > 0">
        <h2 class="text-xl font-bold text-white mb-3">Darts</h2>
        <div class="space-y-3">
          <div 
            v-for="tournament in sortedDartsTournaments"
            :key="`darts-${tournament.id}`"
            class="bg-gray-800 rounded-lg p-4 shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
            @click="selectTournament('darts', tournament)"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <h3 class="font-semibold text-base flex-1 text-white">
                {{ tournament.name }}
              </h3>
              <span 
                :class="[
                  'px-2 py-0.5 text-xs font-medium rounded flex-shrink-0',
                  tournament.is_finished 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-green-900 text-green-300'
                ]"
              >
                {{ tournament.is_finished ? 'Finished' : 'Active' }}
              </span>
            </div>
            
            <div class="mb-2">
              <span 
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  tournament.is_playoffs 
                    ? 'bg-orange-900 text-orange-300' 
                    : 'bg-blue-900 text-blue-300'
                ]"
              >
                {{ tournament.is_playoffs ? 'Playoffs' : 'Regular Season' }}
              </span>
              <span 
                v-if="tournament.playoffs_tournament_id"
                class="ml-2 text-xs text-gray-400"
              >
                → {{ getPlayoffTournamentName(tournament.playoffs_tournament_id) }}
              </span>
            </div>

            <div class="text-sm text-gray-400">
              <div>
                <span class="font-medium text-gray-300">Start:</span> 
                {{ formatDate(tournament.start_time) }}
              </div>
              <div>
                <span class="font-medium text-gray-300">End:</span> 
                {{ formatDate(tournament.end_time) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  </div>
</template>

