<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <div class="flex flex-col mb-4">
          <h2 class="text-lg font-semibold text-white bg-gray-700 px-4 py-2 rounded w-full">
            Tournament Total Ranking: {{ this.tournament ? this.tournament.name : "Unknown" }}
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-white">
                <th class="py-1 text-left">#</th>
                <th class="py-1 text-left">User</th>
                <th class="py-1 text-right">Game Coins Won</th>
                <th class="py-1 text-right">Tournament Coins Won</th>
                <th class="py-1 text-right">Total Coins Won</th>
                <th class="py-1 text-right">Gap to Leader</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in ranking.filter(Boolean)" :key="index" class="border-t border-gray-700">
                <td class="py-1 text-gray-400">{{ index + 1 }}.</td>
                <td class="py-1 text-gray-400">
                  {{ item.first_name }} {{ item.last_name }}
                  <span v-if="item.is_cheater" class="ml-2 text-yellow-500">
                    <i class="fa-solid fa-poo"></i>
                  </span>
                </td>
                <td class="py-1 text-right" :class="{
                  'text-red-500': item.coins_won_game < 0,
                  'text-green-500': item.coins_won_game > 0,
                  'text-gray-400': item.coins_won_game === 0
                }">
                  {{ item.coins_won_game.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') }}
                </td>
                <td class="py-1 text-right" :class="{
                  'text-red-500': item.coins_won_tournament < 0,
                  'text-green-500': item.coins_won_tournament > 0,
                  'text-gray-400': item.coins_won_tournament === 0
                }">
                  {{ item.coins_won_tournament.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') }}
                </td>
                <td class="py-1 text-right" :class="{
                  'text-red-500': item.coins_won_total < 0,
                  'text-green-500': item.coins_won_total > 0,
                  'text-gray-400': item.coins_won_total === 0
                }">
                  {{ item.coins_won_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') }}
                </td>
                <td class="py-1 text-right text-gray-400">
                  {{ index > 0 ? (ranking[0].coins_won_total - item.coins_won_total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["tournament", "ranking"],
  methods: {},
  mounted() {
    console.log("mounted", this.ranking);
  },
};
</script>

<style>
.rankingTable {
  width: 100%;
  padding: 10px 20px;
}
</style>
