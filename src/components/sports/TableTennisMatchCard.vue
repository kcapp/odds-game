<script setup lang="ts">
import type { TableTennisMatch } from '@/types/sports'

interface Props {
  match: TableTennisMatch
}

const props = defineProps<Props>()

const isFinished = props.match.is_finished === 1
const canBet = !isFinished && props.match.date_played === null
const hasWinner = props.match.winner_id !== 0
</script>

<template>
  <div class="border rounded p-3 hover:shadow transition-shadow text-sm">
    <!-- Header -->
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs text-gray-500">{{ match.group_name }}</span>
      <span 
        :class="[
          'px-2 py-0.5 text-xs font-medium rounded',
          canBet ? 'bg-blue-100 text-blue-700' : 
          isFinished ? 'bg-gray-200 text-gray-700' : 
          'bg-yellow-100 text-yellow-700'
        ]"
      >
        {{ canBet ? 'Bet' : isFinished ? 'Done' : 'Live' }}
      </span>
    </div>

    <!-- Players and Scores -->
    <div class="space-y-1">
      <div 
        :class="[
          'flex justify-between items-center p-1.5 rounded',
          hasWinner && match.winner_id === match.home_player_id ? 'bg-green-50 font-semibold' : ''
        ]"
      >
        <span class="flex-1 truncate">{{ match.home_player_name }}</span>
        <span class="text-lg font-bold ml-2">{{ match.home_score_total }}</span>
      </div>
      
      <div 
        :class="[
          'flex justify-between items-center p-1.5 rounded',
          hasWinner && match.winner_id === match.away_player_id ? 'bg-green-50 font-semibold' : ''
        ]"
      >
        <span class="flex-1 truncate">{{ match.away_player_name }}</span>
        <span class="text-lg font-bold ml-2">{{ match.away_score_total }}</span>
      </div>
    </div>

    <!-- Set Scores -->
    <div v-if="match.scores && match.scores.length > 0" class="mt-2 pt-2 border-t">
      <div class="flex gap-1 flex-wrap">
        <div 
          v-for="score in match.scores" 
          :key="score.set"
          class="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
        >
          {{ score.home }}-{{ score.away }}
        </div>
      </div>
    </div>

    <!-- Bet Button -->
    <button 
      v-if="canBet"
      class="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
    >
      Place Bet
    </button>
  </div>
</template>
