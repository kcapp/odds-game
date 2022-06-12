<template>
  <div class="m10">
    <div class="gameDiv">
      <div class="tournamentTitle">
        Tournament Match Bets Ranking:
        {{ this.tournament ? this.tournament.name : "Unknown" }}
      </div>
      <div class="pt20">
        <table class="rankingTable" v-if="ranking">
          <tr>
            <td class="juicyGreen pr10">#</td>
            <td class="juicyGreen">user</td>
            <td class="juicyGreen txtR">game coins won</td>
            <td class="juicyGreen txtR">tournament coins won</td>
            <td class="juicyGreen txtR">total coins won</td>
            <td>&nbsp;</td>
          </tr>
          <tr
            v-for="(item, index) in ranking.filter(Boolean)"
            v-bind:key="index"
          >
            <RankingTotalItem>
              <template #index>{{ index + 1 }}.</template>
              <template #playerName>
                {{ item.first_name }} {{ item.last_name }}
                <span v-if="item.is_cheater">
                  <i class="fa-solid fa-poo"></i>
                </span>
              </template>
              <template #coinsWonGame>
                {{ item.coins_won_game.toFixed(2) }}
              </template>
              <template #coinsWonTournament>
                {{ item.coins_won_tournament.toFixed(2) }}
              </template>
              <template #coinsWonTotal>
                {{ item.coins_won_total.toFixed(2) }}
              </template>
            </RankingTotalItem>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import RankingTotalItem from "@/components/RankingTotalItem.vue";
export default {
  components: { RankingTotalItem },
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
