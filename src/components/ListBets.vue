<script>
import TournamentBetItem from "@/components/TournamentBetItem.vue";

export default {
  components: { TournamentBetItem },
  props: ["tournaments"],
};
</script>

<template>
  <div style="margin: 10px">
    <div class="gameDiv">
      <div class="tournamentTitle">Bets</div>
      <div class="pt20">
        <table class="rankingTable">
          <tr>
            <td class="juicyGreen">tournament name</td>
            <td>&nbsp;</td>
          </tr>
          <tr v-for="(item, index) in this.tournaments" v-bind:key="index">
            <TournamentBetItem :tournament="item" />
          </tr>
        </table>
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
