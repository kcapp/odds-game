<script setup lang="ts">
import type { TableTennisTournament } from '@/types/sports'

interface Props {
  tournament: TableTennisTournament
  selected?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [tournament: TableTennisTournament]
}>()

const isFinished = props.tournament.is_finished === 1
const isPlayoffs = props.tournament.is_playoffs === 1
const completionPercentage = props.tournament.scheduled > 0 
  ? Math.round((props.tournament.finished / props.tournament.scheduled) * 100)
  : 0
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
          <span v-if="isPlayoffs" class="text-orange-600 font-medium">Playoffs</span>
          <span v-else class="text-green-600 font-medium">{{ tournament.phase }}</span>
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

    <div class="flex items-center justify-between text-xs text-gray-600 mt-2">
      <span>{{ tournament.participants }} players</span>
      <span class="font-medium">{{ tournament.finished }}/{{ tournament.scheduled }}</span>
    </div>

    <div class="mt-2">
      <div class="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          class="bg-blue-500 h-1.5 rounded-full transition-all"
          :style="{ width: `${completionPercentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
