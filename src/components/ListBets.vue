<script>
import TournamentBetItem from "@/components/TournamentBetItem.vue";

export default {
  components: { TournamentBetItem },
  props: ["tournaments"],
};
</script>

<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4 bg-gray-700 px-4 py-2 rounded">Bets: tournament list</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-white">
                <th class="py-1 text-left">Tournament name</th>
                <th class="py-1 text-center">Match Bets</th>
                <th class="py-1 text-center">Tournament Bets</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in this.tournaments" :key="index" class="border-t border-gray-700">
                <td class="py-1 text-gray-400">
                  <span v-if="!item.is_finished" class="inline-block px-2 py-0.5 mr-2 text-xs text-white bg-green-600 rounded">active</span>
                  {{ item.name }}
                </td>
                <td class="py-1 text-center">
                  <router-link :to="'/bets/' + item.id" class="text-blue-400 hover:text-blue-300">
                    View
                  </router-link>
                </td>
                <td class="py-1 text-center">
                  <template v-if="item.is_playoffs">
                    <router-link :to="'/tournament-bets/' + item.id" class="text-blue-400 hover:text-blue-300">
                      View
                    </router-link>
                  </template>
                  <template v-else>
                    <span class="text-gray-500">Not Available</span>
                  </template>
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
