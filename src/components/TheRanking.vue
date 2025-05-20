<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <div class="flex flex-col mb-4">
          <h2 class="text-lg font-semibold text-white bg-gray-700 px-4 py-2 rounded w-full">
            Tournament Bets Ranking: {{ this.tournament ? this.tournament.name : "Unknown" }}
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-white">
                <th class="py-1 text-left">#</th>
                <th class="py-1 text-left">User</th>
                <th class="py-1 text-right">Coins Available</th>
                <th class="py-1 text-center">Open Bets</th>
                <th class="py-1 text-center">Bets Placed</th>
                <th class="py-1 text-right">Total Potential</th>
                <th class="py-1 text-right">Avg Coins/Bet</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in this.ranking" :key="index" class="border-t border-gray-700">
                <td class="py-1 text-gray-400">{{ index + 1 }}.</td>
                <td class="py-1 text-gray-400">
                  {{ item.first_name }} {{ item.last_name }}
                </td>
                <td class="py-1 text-right" :class="{
                  'text-red-500': item.coins_available < 0,
                  'text-green-500': item.coins_available > 0,
                  'text-gray-400': item.coins_available === 0
                }">
                  {{ item.coins_available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') }}
                </td>
                <td class="py-1 text-center text-gray-400">{{ item.tournament_coins_open.toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ') }}</td>
                <td class="py-1 text-center text-gray-400">{{ item.bets_placed }}</td>
                <td class="py-1 text-right text-gray-400">
                  {{ (item.coins_available + item.tournament_coins_open + item.potential_winnings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') }}
                </td>
                <td class="py-1 text-right" :class="{
                  'text-red-500': item.bets_closed > 0 && (item.coins_available - 1000) / item.bets_closed < 0,
                  'text-green-500': item.bets_closed > 0 && (item.coins_available - 1000) / item.bets_closed > 0,
                  'text-gray-400': item.bets_closed === 0
                }">
                  {{ item.bets_closed > 0 ? ((item.coins_available - 1000) / item.bets_closed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') : "0.00" }}
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
  data() {
    return {};
  },
};
</script>

<style>
.rankingTable {
  width: 100%;
  padding: 10px 20px;
}
</style>
