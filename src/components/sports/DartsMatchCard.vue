<script setup lang="ts">
import type { DartsMatch } from '@/types/sports'

interface Props {
  match: DartsMatch
}

const props = defineProps<Props>()

const isFinished = props.match.is_finished
const canBet = !isFinished && !props.match.is_abandoned
const hasWinner = props.match.winner_id !== null

// Calculate score from legs_won
function getPlayerScore(playerId: number): number {
  return props.match.legs_won.filter(id => id === playerId).length
}

const playerScores = props.match.players.map(id => ({
  id,
  score: getPlayerScore(id)
}))
</script>

<template>
  <div class="border rounded p-3 hover:shadow transition-shadow text-sm">
    <!-- Header -->
    <div class="flex justify-between items-center mb-2">
      <div class="flex-1 min-w-0">
        <span class="text-xs font-medium text-gray-700 truncate block">{{ match.match_type.name }}</span>
        <p class="text-xs text-gray-500 truncate">{{ match.match_mode.short_name }}</p>
      </div>
      <span 
        :class="[
          'px-2 py-0.5 text-xs font-medium rounded ml-2 flex-shrink-0',
          canBet ? 'bg-blue-100 text-blue-700' : 
          isFinished ? 'bg-gray-200 text-gray-700' : 
          match.is_abandoned ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        ]"
      >
        {{ canBet ? 'Bet' : isFinished ? 'Done' : match.is_abandoned ? 'N/A' : 'Live' }}
      </span>
    </div>

    <!-- Players and Scores -->
    <div class="space-y-1">
      <div 
        v-for="player in playerScores"
        :key="player.id"
        :class="[
          'flex justify-between items-center p-1.5 rounded',
          hasWinner && match.winner_id === player.id ? 'bg-green-50 font-semibold' : ''
        ]"
      >
        <span class="flex-1">Player {{ player.id }}</span>
        <span class="text-lg font-bold ml-2">{{ player.score }}</span>
      </div>
    </div>

    <!-- Legs Detail -->
    <div v-if="match.legs_won.length > 0" class="mt-2 pt-2 border-t">
      <div class="flex gap-1 flex-wrap">
        <div 
          v-for="(winnerId, index) in match.legs_won" 
          :key="index"
          class="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
        >
          P{{ winnerId }}
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
