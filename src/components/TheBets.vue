<script>
import BetItem from "@/components/BetItem.vue";
import axios from "axios";
export default {
  data() {
    return {
      gameBets: [],
      finishedOnly: false,
      unfinishedOnly: false,
    };
  },
  components: { BetItem },
  props: ["games", "players", "tournamentId"],
  mounted() {
    axios
      .get(
        "http://localhost:9001/user/" +
          this.$store.state.auth.user.user_id +
          "/tournament/" +
          this.tournamentId +
          "/bets"
      )
      .then((bets) => {
        for (const [index, value] of bets.data.entries()) {
          this.gameBets[value.match_id] = value;
          this.allBets[value.match_id] = value;
        }
      })
      .catch((error) => {
        console.log("Error when getting bets " + error);
      });
  },
  methods: {
    toggleFinished() {
      this.finishedOnly = true;
      this.unfinishedOnly = false;
    },
    toggleUnfinished() {
      this.unfinishedOnly = true;
      this.finishedOnly = false;
    },
    toggleAll() {
      this.finishedOnly = false;
      this.unfinishedOnly = false;
    },
    // Returns boolean value indicating whether the BetItem should be shown or not
    isShown(game) {
      let gameFinished = game.is_finished;
      if (this.unfinishedOnly === true) {
        return gameFinished === true;
      } else if (this.finishedOnly === true) {
        return gameFinished !== true;
      } else {
        // By default, do not hide
        return false;
      }
    },
  },
};
</script>

<template>
  <span class="fa-stack fa-2x" style="font-size: 12px">
    <i
      class="fa-solid fa-circle fa-stack-2x"
      style="color: rgb(58, 170, 53)"
    ></i>
    <i
      class="fa-solid fa-k fa-stack-1x fa-inverse fa-rotate-by"
      style="--fa-rotate-angle: -25deg"
    ></i>
  </span>
  <div class="filterHeader">
    Filter:
    <a
      href="#"
      @click="toggleFinished"
      :class="{ juicyGreen: this.finishedOnly }"
      >finished only</a
    >
    |
    <a
      href="#"
      @click="toggleUnfinished()"
      :class="{ juicyGreen: this.unfinishedOnly }"
      >unfinished only</a
    >
    |
    <a
      href="#"
      @click="toggleAll()"
      :class="{ juicyGreen: !this.finishedOnly && !this.unfinishedOnly }"
      >all</a
    >
  </div>
  <div v-for="(game, index) in this.games" v-bind:key="index">
    <BetItem
      :game="game"
      :players="game.players"
      :gameBets="gameBets[game.id]"
      :class="{ hideItem: isShown(game) }"
    >
      <template #playerOneName>
        {{ this.players[game.players[0]].name }}
      </template>
      <template #playerTwoName>
        {{ this.players[game.players[1]].name }}
      </template>
      <template #probsPlayerOne>
        {{ game.player_winning_probabilities[[game.players[0]]] }}
      </template>
      <template #probsPlayerTwo>
        {{ game.player_winning_probabilities[[game.players[1]]] }}
      </template>
      <template #oddsPlayerOne>
        {{ game.player_odds[[game.players[0]]] }}
      </template>
      <template #oddsPlayerTwo>
        {{ game.player_odds[[game.players[1]]] }}
      </template>
    </BetItem>
  </div>
</template>

<style>
.hideItem {
  display: none;
}
.filterHeader {
  margin: 30px 50px 10px 20px;
  border-bottom: 1px solid #363636;
  padding-bottom: 5px;
  text-align: right;
}
</style>
