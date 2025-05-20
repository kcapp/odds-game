<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <div class="flex flex-col mb-4">
          <h2 class="text-lg font-semibold text-white bg-gray-700 px-4 py-2 rounded w-full">
            Tournament Match Bets Ranking: {{ this.tournament ? this.tournament.name : "Unknown" }}
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
              <tr v-for="(item, index) in this.customRanking" :key="index" class="border-t border-gray-700">
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
                <td class="py-1 text-center text-gray-400">{{ item.coins_bets_open.toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ') }}</td>
                <td class="py-1 text-center text-gray-400">{{ item.bets_placed }}</td>
                <td class="py-1 text-right text-gray-400">
                  {{ (item.coins_available + item.tournament_coins_open + item.potential_winnings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') }}
                </td>
                <td class="py-1 text-right" :class="{
                  'text-red-500': item.bets_closed > 0 && (item.coins_won - item.coins_bets_closed) < 0,
                  'text-green-500': item.bets_closed > 0 && (item.coins_won - item.coins_bets_closed) > 0,
                  'text-gray-400': item.bets_closed === 0
                }">
                  {{ item.bets_closed > 0 ? ((item.coins_won - item.coins_bets_closed) / item.bets_closed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ') : "0.00" }}
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
import axios from "axios";
export default {
  data() {
    return {
      tournamentId: 0,
      customRanking: null,
    };
  },
  props: ["tournament", "ranking", "cheatersRanking", "nonCheatersRanking"],
  methods: {
    hasCheaters() {
      let numCheaters = 0;
      this.ranking.forEach((item) => {
        if (item.is_cheater === 1) {
          numCheaters++;
        }
      });
      return numCheaters;
    },
  },
  computed: {
    currentUser() {
      if (this.$store.state.auth.user) {
        return JSON.parse(localStorage.getItem("user"));
      }
      return {};
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    } else {
      this.customRanking = this.nonCheatersRanking;
      axios
        .get(
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
            "/tournament/current/" +
            import.meta.env.VITE_OFFICE_ID
        )
        .then((tournament) => {
          this.tournamentId = tournament.data.id;
        })
        .catch((error) => {
          console.log("Error when getting data for leaderboards " + error);
        });
    }
  },
};
</script>
