<template>
  <div class="m50">
    <div class="gameDivLive">
      <div class="tournamentTitle">
        Tournament ranking:
        {{ this.tournament ? this.tournament.name : "Unknown" }}
      </div>
      <div class="pt20">
        <table class="rankingTable">
          <tr>
            <td class="juicyGreen">user</td>
            <td class="juicyGreen txtR">coins</td>
            <td>&nbsp;</td>
            <td class="juicyGreen txtC">coins in open bets</td>
            <td class="juicyGreen txtC">bets placed</td>
            <td class="juicyGreen txtR">avg coins won / bet</td>
          </tr>
          <tr v-for="(item, index) in this.ranking" v-bind:key="index">
            <RankingItem>
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
              <template #avgWin>
                {{ (item.coins_won / item.bets_placed).toFixed(2) }}
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
export default {
  components: { RankingItem },
  props: ["tournament", "ranking"],
  data() {
    return {};
  },
  methods: {
    //getUserData(gameId) {},
  },
  mounted() {
    // axios
    //   .get("/kcapp-api/player")
    //   .then((players) => {
    //     this.players = players.data;
    //     console.log("getting player data" + this.players);
    //     axios
    //       .get("/kcapp-api/match/" + this.gameId)
    //       .then((gameData) => {
    //         this.game = gameData.data;
    //
    //         Object.entries(this.players).forEach((item) => {
    //           if (item[1].id === this.game.players[0]) {
    //             this.player1 = item[1];
    //           }
    //           if (item[1].id === this.game.players[1]) {
    //             this.player2 = item[1];
    //           }
    //         });
    //       })
    //       .catch((error) => {
    //         console.log("Error when getting data for user " + error);
    //       });
    //   })
    //   .catch((error) => {
    //     console.log("Error when getting data for user " + error);
    //   });
  },
};
</script>

<style>
.tournamentTitle {
  padding: 10px 20px;
  background-color: #22232c;
  border-radius: 10px;
  font-size: 20px;
  text-align: left;
}
.rankingTable {
  width: 100%;
  padding: 10px 20px;
}
</style>
