<script>
import TournamentItem from "@/components/TournamentItem.vue";

export default {
  components: { TournamentItem },
  props: ["tournaments"],
};
</script>

<template>
  <div style="margin: 20px">
    <div class="gameDivLive">
      <div class="tournamentTitle">Tournament list</div>
      <div class="pt20">
        <table class="rankingTable">
          <tr>
            <td class="juicyGreen">name</td>
            <td>&nbsp;</td>
          </tr>
          <tr v-for="(item, index) in this.tournaments" v-bind:key="index">
            <TournamentItem :tournament="item" />
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

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
