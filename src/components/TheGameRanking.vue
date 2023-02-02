<template>
  <div class="m10">
    <div class="gameDiv">
      <div class="tournamentTitle">
        <table class="w100pc">
          <tr>
            <td>
              Tournament Match Bets Ranking:
              {{ this.tournament ? this.tournament.name : "Unknown" }}
            </td>
            <td class="txtR w60">
              <select
                style="display: table"
                class="textInput selectName"
                @change="getCustomRanking()"
                v-model="this.selectedLeaderboardId"
              >
                <option selected value="0">Public</option>
                <template v-for="(leaderboard, index) in this.leaderboards">
                  <option
                    :value="leaderboard.id"
                    v-bind:key="leaderboard.id"
                    v-if="leaderboard"
                  >
                    {{ leaderboard.name }}
                  </option>
                </template>
              </select>
            </td>
          </tr>
        </table>
      </div>
      <div class="pt20">
        <table class="rankingTable">
          <tr>
            <td class="juicyGreen pr10">#</td>
            <td class="juicyGreen">user</td>
            <td class="juicyGreen txtC" colspan="3">
              coins available (open bets)
            </td>
            <td class="juicyGreen txtC">bets placed</td>
            <td class="juicyGreen txtR">total potential</td>
            <td class="juicyGreen txtR">avg coins / bet</td>
          </tr>
          <tr v-for="(item, index) in this.customRanking" v-bind:key="index">
            <RankingItem>
              <template #index>{{ index + 1 }}.</template>
              <template #playerName>
                {{ item.first_name }} {{ item.last_name }}
                <span v-if="item.is_cheater">
                  <i class="fa-solid fa-poo"></i>
                </span>
              </template>
              <template #coins>
                {{ item.coins_available.toFixed(2) }}
              </template>
              <template #coinsInActiveBets>
                {{ item.coins_bets_open }}
              </template>
              <template #betsPlaced>
                {{ item.bets_placed }}
              </template>
              <template #totalPotential>
                {{
                  (
                    item.coins_available +
                    item.coins_bets_open +
                    item.potential_winnings
                  ).toFixed(2)
                }}
              </template>
              <template #avgWin v-if="item.bets_closed > 0">
                <span
                  :class="{
                    colPlus: item.coins_won - item.coins_bets_closed > 0,
                    colMinus: item.coins_won - item.coins_bets_closed < 0,
                  }"
                >
                  {{
                    ((item.coins_available - 1000) / item.bets_closed).toFixed(
                      2
                    )
                  }}
                </span>
              </template>
              <template #avgWin v-else>
                {{ (0).toFixed(2) }}
              </template>
            </RankingItem>
          </tr>
          <tr v-if="this.hasCheaters()">
            <td colspan="8" style="padding-top: 20px; color: white">
              CHEATERS
            </td>
          </tr>
          <tr
            v-for="(item, index) in this.cheatersRanking"
            v-bind:key="index"
            style="overflow: hidden"
          >
            <RankingItem>
              <template #index><i class="fa-solid fa-poo"></i></template>
              <template #playerName>
                {{ item.first_name }} {{ item.last_name }}
              </template>
              <template #coins>
                {{ item.coins_available.toFixed(2) }}
              </template>
              <template #coinsInActiveBets>
                {{ item.coins_bets_open }}
              </template>
              <template #betsPlaced>
                {{ item.bets_placed }}
              </template>
              <template #totalPotential>
                {{
                  (
                    item.coins_available +
                    item.coins_bets_open +
                    item.potential_winnings
                  ).toFixed(2)
                }}
              </template>
              <template #avgWin v-if="item.bets_closed > 0">
                <span
                  :class="{
                    colPlus: item.coins_won - item.coins_bets_closed > 0,
                    colMinus: item.coins_won - item.coins_bets_closed < 0,
                  }"
                >
                  {{
                    (
                      (item.coins_won - item.coins_bets_closed) /
                      item.bets_closed
                    ).toFixed(2)
                  }}
                </span>
              </template>
              <template #avgWin v-else>
                {{ (0).toFixed(2) }}
              </template>
            </RankingItem>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import RankingItem from "@/components/RankingItem.vue";
import axios from "axios";
export default {
  data() {
    return {
      selectedLeaderboardId: 0,
      leaderboards: [],
      tournamentId: 0,
      customRanking: null,
    };
  },
  components: { RankingItem },
  props: ["tournament", "ranking", "cheatersRanking", "nonCheatersRanking"],
  methods: {
    getCustomRanking() {
      if (parseInt(this.selectedLeaderboardId) === 0) {
        this.customRanking = this.ranking;
      } else {
        axios
          .get(
            import.meta.env.VITE_ODDS_API_PROXY_STRING +
              "/tournament/" +
              this.tournamentId +
              "/gameranking/" +
              this.selectedLeaderboardId
          )
          .then((customRanking) => {
            this.customRanking = customRanking.data;
          })
          .catch((error) => {
            console.log("Error when getting data for leaderboards " + error);
          });
      }
    },
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
          const currentUser = JSON.parse(localStorage.getItem("user"));
          axios
            .get(
              import.meta.env.VITE_ODDS_API_PROXY_STRING +
                "/leaderboards/games/" +
                tournament.data.id +
                "/" +
                currentUser.user_id
            )
            .then((leaderboards) => {
              this.leaderboards = leaderboards.data;
            });
        })
        .catch((error) => {
          console.log("Error when getting data for leaderboards " + error);
        });
    }
  },
};
</script>

<style>
.rankingTable {
  width: 100%;
  padding: 10px 20px;
}
</style>
