<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <div v-if="currentUser.requires_change" class="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200 text-sm">
          You are using starter password. Please change it
          <RouterLink class="text-red-200 hover:text-red-100 underline" to="/changepass">here</RouterLink>.
        </div>

        <!-- Player Name Section -->
        <div class="text-center mb-4">
          <h1 class="text-2xl font-bold text-white">{{ userData.first_name }} {{ userData.last_name }}</h1>
          <div v-if="!currentUser.requires_change" class="mt-2">
            <RouterLink to="/changepass" class="text-sm text-blue-400 hover:text-blue-300">Change password</RouterLink>
          </div>
        </div>

        <div class="border-b border-gray-700 mb-6"></div>

        <!-- Tournament Selection -->
        <div class="mb-6">
          <p class="text-sm text-gray-300 mb-2">Select tournament</p>
          <select
            class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            @change="updateBetsData(currentUser.user_id)"
            v-model="selectedTournamentId"
          >
            <option disabled selected value="">Please select one</option>
            <template v-for="tournament in tournaments.filter(Boolean)">
              <option :value="tournament.id" :key="tournament.id" v-if="tournament">
                {{ tournament.name }}
              </option>
            </template>
          </select>
        </div>

        <!-- Coin Balances -->
        <div class="bg-gray-700/50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-white">Match k-Coins balance</p>
              <p class="text-sm text-gray-400">Coins earned by betting on match results.</p>
              <div class="flex items-center mt-2">
                <span class="text-2xl text-white">{{ coins.toFixed(2) }}</span>
                <TheCoin class="ml-2" />
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-white">Tournament k-Coins balance</p>
              <p class="text-sm text-gray-400">Coins earned by betting on tournament outcomes and special bets.</p>
              <div class="flex items-center mt-2">
                <span class="text-2xl text-white">{{ tournamentCoins.toFixed(2) }}</span>
                <TheCoin class="ml-2" />
              </div>
            </div>
          </div>
        </div>

        <!-- Your Bets Section -->
        <div class="bg-gray-800 rounded-lg p-4 mb-6">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-white">
                  <th class="py-2 text-right">Home Player</th>
                  <th class="py-2 text-center">Bets</th>
                  <th class="py-2 text-left">Away Player</th>
                  <th class="py-2 text-center">Score</th>
                  <th class="py-2 text-center">Status</th>
                  <th class="py-2 text-center">View Options</th>
                  <th class="py-2 text-center">Bet Result</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bet in bets" :key="bet.id" class="border-t border-gray-700">
                  <td class="py-2 text-gray-300 text-right" :class="{ 'text-green-400': bet.outcome === bet.player_1 }">
                    {{ players[bet.player_1].first_name }} {{ players[bet.player_1].last_name }}
                  </td>
                  <td class="py-2 text-gray-300 text-center">
                    <div class="flex justify-center space-x-2">
                      <span>{{ bet.bet_1 }}</span>
                      <span>{{ bet.bet_x }}</span>
                      <span>{{ bet.bet_2 }}</span>
                    </div>
                  </td>
                  <td class="py-2 text-gray-300 text-left" :class="{ 'text-green-400': bet.outcome === bet.player_2 }">
                    {{ players[bet.player_2].first_name }} {{ players[bet.player_2].last_name }}
                  </td>
                  <td class="py-2 text-gray-300 text-center">
                    <template v-if="bet.outcome !== null">
                      <span v-if="getGameResultById(bet.match_id).winner_id === null">
                        {{ getGameResultById(bet.match_id).home_score }} : {{ getGameResultById(bet.match_id).away_score }}
                      </span>
                      <span v-else-if="bet.player_1 === getGameResultById(bet.match_id).winner_id">
                        {{ Math.max(getGameResultById(bet.match_id).home_score, getGameResultById(bet.match_id).away_score) }} :
                        {{ Math.min(getGameResultById(bet.match_id).home_score, getGameResultById(bet.match_id).away_score) }}
                      </span>
                      <span v-else-if="bet.player_2 === getGameResultById(bet.match_id).winner_id">
                        {{ Math.min(getGameResultById(bet.match_id).home_score, getGameResultById(bet.match_id).away_score) }} :
                        {{ Math.max(getGameResultById(bet.match_id).home_score, getGameResultById(bet.match_id).away_score) }}
                      </span>
                    </template>
                  </td>
                  <td class="py-2 text-gray-300 text-center">
                    <span v-if="bet.outcome === undefined || bet.outcome === null">scheduled</span>
                    <span v-else-if="bet.outcome === bet.player_1 || bet.outcome === bet.player_2">finished</span>
                    <span v-else-if="bet.outcome === 0">finished (draw)</span>
                    <span v-else>unknown</span>
                  </td>
                  <td class="py-2 text-center">
                    <RouterLink :to="{ name: 'game', params: { id: bet.match_id } }" class="text-blue-400 hover:text-blue-300">odds</RouterLink>
                    <span v-if="isFinished(bet)">
                      .
                      <a :href="'https://darts.sportradar.ag/matches/' + bet.match_id + '/result'" target="_blank" class="text-blue-400 hover:text-blue-300">result</a>
                    </span>
                    <span v-else>
                      .
                      <a :href="'https://darts.sportradar.ag/matches/' + bet.match_id + '/spectate'" target="_blank" class="text-blue-400 hover:text-blue-300">spectate</a>
                    </span>
                  </td>
                  <td class="py-2 text-center">
                    <template v-if="bet.outcome && bet.outcome === bet.player_1">
                      <span :class="{ 'text-green-400': getBet1Coins(bet) > 0, 'text-red-400': getBet1Coins(bet) < 0 }">
                        {{ getBet1Coins(bet).toFixed(2) }}
                      </span>
                      <TheSmallCoin class="ml-2" />
                    </template>
                    <template v-else-if="bet.outcome && bet.outcome === bet.player_2">
                      <span :class="{ 'text-green-400': getBet2Coins(bet) > 0, 'text-red-400': getBet2Coins(bet) < 0 }">
                        {{ getBet2Coins(bet).toFixed(2) }}
                      </span>
                      <TheSmallCoin class="ml-2" />
                    </template>
                    <template v-else-if="bet.outcome === 0">
                      <span :class="{ 'text-green-400': getBetDrawCoins(bet) > 0, 'text-red-400': getBetDrawCoins(bet) < 0 }">
                        {{ getBetDrawCoins(bet).toFixed(2) }}
                      </span>
                      <TheSmallCoin class="ml-2" />
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import TheCoin from "../components/TheCoin.vue";
import TheSmallCoin from "../components/TheSmallCoin.vue";
import User from "../models/user";

export default {
  name: "UserProfile",
  components: { TheSmallCoin, TheCoin },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem("user")),
      userData: {
        first_name: "",
        last_name: "",
      },
      bets: [],
      players: [],
      coins: 0,
      tournamentCoins: 0,
      selectedTournamentId: 0,
      tournaments: [],
      results: [],
    };
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    } else {
      let res;
      axios
        .all([
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/office/" +
              import.meta.env.VITE_OFFICE_ID
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/current/" +
              import.meta.env.VITE_OFFICE_ID
          ),
        ])
        .then(
          axios.spread((tournaments, currentTournament) => {
            this.tournaments = tournaments.data;
            this.selectedTournamentId = currentTournament.data.id;
            if (!this.selectedTournamentId) {
              this.selectedTournamentId = this.tournaments[0].id;
            }

            // Get the rest of the data after we fetch current tournament id
            this.getUserData(this.currentUser.user_id);
          })
        )
        .catch((error) => {
          console.log("Error when getting data for tournaments " + error);
        })
        .finally(() => {
          axios
            .get(
              import.meta.env.VITE_KCAPP_API_PROXY_STRING +
                "/tournament/office/" +
                import.meta.env.VITE_OFFICE_ID
            )
            .then((tournaments) => {
              this.tournaments = tournaments.data;
              this.selectedTournamentId = this.tournaments[0].id;

              // Get the rest of the data after we fetch current tournament id
              this.getUserData(this.currentUser.user_id);
            });
        });
    }
  },
  methods: {
    updateBetsData(userId) {
      this.getUserData(userId);
    },
    getGameResultById(gameId) {
      let res = null;
      this.results.forEach((item) => {
        if (item.match_id === gameId) {
          res = item;
        }
      });
      return res;
    },
    isFinished(bet) {
      return (
        bet.outcome === bet.player_1 ||
        bet.outcome === bet.player_2 ||
        bet.outcome === 0
      );
    },
    getBet1Coins(bet) {
      return bet.bet_1 * bet.odds_1 - (bet.bet_1 + bet.bet_2 + bet.bet_x);
    },
    getBet2Coins(bet) {
      return bet.bet_2 * bet.odds_2 - (bet.bet_1 + bet.bet_2 + bet.bet_x);
    },
    getBetDrawCoins(bet) {
      return bet.bet_x * bet.odds_x - (bet.bet_1 + bet.bet_2 + bet.bet_x);
    },
    getUserData(userId) {
      axios
        .all([
          axios.get(
            import.meta.env.VITE_ODDS_API_PROXY_STRING +
              "/user/" +
              userId +
              "/tournament/" +
              this.selectedTournamentId +
              "/balance"
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING + "/player/" + userId
          ),
          axios.get(import.meta.env.VITE_KCAPP_API_PROXY_STRING + "/player"),
          axios.get(
            import.meta.env.VITE_ODDS_API_PROXY_STRING +
              "/user/" +
              userId +
              "/bets"
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/" +
              this.selectedTournamentId +
              "/matches/result"
          ),
        ])
        .then(
          axios.spread((userData, kcappPlayer, players, bets, results) => {
            this.coins =
              userData.data.start_coins -
              userData.data.coins_bets_open -
              userData.data.coins_bets_closed +
              userData.data.coins_won;
            this.tournamentCoins =
              userData.data.start_coins -
              userData.data.tournament_coins_open -
              userData.data.tournament_coins_closed +
              userData.data.tournament_coins_won;
            this.userData.first_name = userData.data.first_name;
            this.userData.last_name = userData.data.last_name;

            this.players = players.data;

            // Filter bets by tournament
            this.bets = [];
            bets.data.filter(Boolean).forEach((item) => {
              if (item.tournament_id === this.selectedTournamentId) {
                this.bets.push(item);
              }
            });

            this.results = results.data;
          })
        )
        .catch((error) => {
          console.log("Error when getting data for user " + error);
        });
    },
    getPlayerName(playerId) {
      const player = this.players.find(p => p.id === playerId);
      return player ? `${player.first_name} ${player.last_name}` : "Unknown Player";
    },
  },
};
</script>

<style>
.passwordWarning {
  background-color: rgb(255 0 0);
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
}

.profileImg {
  width: 120px;
  margin-top: -20px;
}

.profileTable {
  width: 100%;
}

.profileTable td {
  vertical-align: top;
}

.profileBlockFill {
  background-color: #22232c;
  min-height: 330px;
  padding: 20px;
  border-radius: 10px;
  height: 100%;
}

.colGray {
  color: #6d6d6d;
}

h1 {
  font-size: 40px;
  font-weight: 300;
}
</style>
