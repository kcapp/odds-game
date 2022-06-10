<template>
  <div class="m10">
    <div class="gameDiv">
      <div class="tournamentTitle">
        Tournament Match Bets Ranking:
        {{ this.tournament ? this.tournament.name : "Unknown" }}
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
          <tr v-for="(item, index1) in this.ranking" v-bind:key="index1">
            <RankingItem v-if="!item.is_cheater">
              <template #index>{{ index1 + 1 }}.</template>
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
          <tr v-if="this.hasCheaters()">
            <td colspan="8" style="padding-top: 20px; color: white">
              CHEATERS
            </td>
          </tr>
          <tr
            v-for="(item, index2) in this.ranking"
            v-bind:key="index2"
            style="overflow: hidden"
          >
            <RankingItem v-if="item.is_cheater">
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
export default {
  components: { RankingItem },
  props: ["tournament", "ranking"],
  data() {
    return {};
  },
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
    //getUserData(gameId) {},
  },
  mounted() {},
};
</script>

<style>
.rankingTable {
  width: 100%;
  padding: 10px 20px;
}
</style>
