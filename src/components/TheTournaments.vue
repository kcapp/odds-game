<script>
import TournamentItem from "@/components/TournamentItem.vue";

export default {
  components: { TournamentItem },
  props: ["tournaments"],
};
</script>

<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4 bg-gray-700 px-4 py-2 rounded">Standings: tournament list</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-white">
                <th class="py-1 text-left">Tournament name</th>
                <th class="py-1 text-center">Match</th>
                <th class="py-1 text-center">Tournament</th>
                <th class="py-1 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in this.tournaments" :key="index" class="border-t border-gray-700">
                <td class="py-1 text-gray-400">
                  <span v-if="!item.is_finished" class="inline-block px-2 py-0.5 mr-2 text-xs text-white bg-green-600 rounded">active</span>
                  {{ item.name }}
                </td>
                <td class="py-1 text-center">
                  <router-link :to="{ name: 'gameRanking', params: { id: item.id } }" class="text-blue-400 hover:text-blue-300">
                    View
                  </router-link>
                </td>
                <td class="py-1 text-center">
                  <router-link :to="{ name: 'tournamentRanking', params: { id: item.id } }" class="text-blue-400 hover:text-blue-300">
                    View
                  </router-link>
                </td>
                <td class="py-1 text-center">
                  <router-link :to="{ name: 'totalRanking', params: { id: item.id } }" class="text-blue-400 hover:text-blue-300">
                    View
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.rankingTable {
  width: 100%;
  padding: 10px 20px;
}
</style>
