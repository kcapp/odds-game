<script>
import BetItem from "@/components/BetItem.vue";
import axios from "axios";
import io from "socket.io";

export default {
  data() {
    return {
      tournamentId: 0,
      gameBets: [],
      finishedOnly: false,
      unfinishedOnly: false,
      immutableCoins: 0,
      coins: 0,
      socket: null,
    };
  },
  components: { BetItem },
  props: ["games", "players"],
  mounted() {
    this.socket = io.Socket(`${window.location.origin}/active`);

    socket.on("connect", (data) => {
      socket.emit("join", "Client Connecting");
    });
    const activeSocket = io.connect();
    activeSocket.on("warmup_started", (data) => {
      if (data.match.tournament_id !== null) {
        location.href = `/matches/${data.match.id}/obs`;
      }
    });
    axios
      .get(this.kcappApiUrl + "/tournament/current/" + this.officeId)
      .then((tournament) => {
        this.tournamentId = tournament.data.id;

        // Get the rest of the data after we fetch current tournament id
        axios
          .all([
            axios.get(
              this.kcappOddsApiUrl +
                "/user/" +
                this.$store.state.auth.user.user_id +
                "/tournament/" +
                this.tournamentId +
                "/bets"
            ),
            axios.get(
              this.kcappOddsApiUrl +
                "/user/" +
                this.$store.state.auth.user.user_id +
                "/tournament/" +
                this.tournamentId +
                "/balance"
            ),
          ])
          .then(
            axios.spread((bets, balance) => {
              for (const [index, value] of bets.data.entries()) {
                this.gameBets[value.match_id] = value;
              }
              this.coins = balance.data.coins;
              this.immutableCoins = balance.data.coins;
            })
          )
          .catch((error) => {
            console.log("Error when getting data for tournaments " + error);
          });
      })
      .catch((error) => {
        console.log("Error when getting bets " + error);
      });
  },
  methods: {
    recalculateCoins(matchId, oldBet1, oldBet2) {
      let sumNewBets = 0;
      let sumOldBets = 0;

      if (this.gameBets !== undefined) {
        this.gameBets.forEach((bet) => {
          sumOldBets += parseInt(bet.bet_1) + parseInt(bet.bet_2);
        });
      }

      this.$refs.betItem.forEach((item) => {
        sumNewBets += parseInt(item.player1Bet) + parseInt(item.player2Bet);
      });

      this.coins = this.immutableCoins + sumOldBets - sumNewBets;
      if (this.coins < 0) {
        this.$refs.betItem.forEach((item) => {
          if (item.game.id === matchId) {
            item.player1Bet = parseInt(oldBet1);
            item.player2Bet = parseInt(oldBet2);
            this.coins = this.immutableCoins;
          }
        });
      }
    },
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
      ref="betItem"
      :coinsAvailable="this.coins"
      :tournamentId="tournamentId"
      :game="game"
      :players="game.players"
      :gameBets="gameBets[game.id]"
      :class="{ hideItem: isShown(game) }"
      @recalculateCoins="recalculateCoins"
    >
      <template #playerOneName>
        {{ this.players[game.players[0]].name }}
      </template>
      <template #playerTwoName>
        {{ this.players[game.players[1]].name }}
      </template>
      <template #probsPlayerOne>
        {{
          (game.player_winning_probabilities[[game.players[0]]] * 100).toFixed(
            2
          )
        }}%
      </template>
      <template #probsPlayerTwo>
        {{
          (game.player_winning_probabilities[[game.players[1]]] * 100).toFixed(
            2
          )
        }}%
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
