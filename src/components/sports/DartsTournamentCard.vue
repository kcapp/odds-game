<script setup lang="ts">
import type { DartsTournament } from '@/types/sports'

interface Props {
  tournament: DartsTournament
  selected?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [tournament: DartsTournament]
}>()

const isFinished = props.tournament.is_finished
const isPlayoffs = props.tournament.is_playoffs
const startDate = new Date(props.tournament.start_time)
const endDate = new Date(props.tournament.end_time)
</script>

<template>
  <div 
    @click="emit('select', tournament)"
    :class="[
      'border rounded p-3 cursor-pointer transition-all text-sm',
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
    ]"
  >
    <div class="flex justify-between items-start mb-1">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold truncate">{{ tournament.name }}</h3>
        <p class="text-xs text-gray-500">
          <span class="font-mono bg-gray-100 px-1 rounded">{{ tournament.short_name }}</span>
          <span v-if="isPlayoffs" class="ml-1 text-orange-600 font-medium">Playoffs</span>
          <span v-else-if="tournament.is_season" class="ml-1 text-green-600 font-medium">Season</span>
        </p>
      </div>
      <span 
        :class="[
          'px-2 py-0.5 text-xs font-medium rounded ml-2 flex-shrink-0',
          isFinished ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-700'
        ]"
      >
        {{ isFinished ? 'Done' : 'Active' }}
      </span>
    </div>

    <div class="text-xs text-gray-600 mt-2 space-y-0.5">
      <p>{{ startDate.toLocaleDateString() }} - {{ endDate.toLocaleDateString() }}</p>
    </div>
  </div>
</template>
