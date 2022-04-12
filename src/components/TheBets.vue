<script>
import BetItem from "@/components/BetItem.vue";
import axios from "axios";
import ioClient from "socket.io-client";

export default {
  data() {
    return {
      tournamentId: 0,
      gameBets: [],
      gameMeta: [],
      finishedOnly: false,
      unfinishedOnly: false,
      betsOnly: false,
      immutableCoins: 0,
      coins: 0,
      socket: null,
      activeGames: [],
    };
  },
  components: { BetItem },
  props: ["games", "players"],
  mounted() {
    axios
      .get("/kcapp-api/tournament/current/" + import.meta.env.VITE_OFFICE_ID)
      .then((tournament) => {
        this.tournamentId = tournament.data.id;

        // Get the rest of the data after we fetch current tournament id
        axios
          .all([
            axios.get(
              "/api/user/" +
                this.$store.state.auth.user.user_id +
                "/tournament/" +
                this.tournamentId +
                "/bets"
            ),
            axios.get(
              "/api/user/" +
                this.$store.state.auth.user.user_id +
                "/tournament/" +
                this.tournamentId +
                "/balance"
            ),
            axios.get("/api/games/meta"),
          ])
          .then(
            axios.spread((bets, balance, meta) => {
              for (const [index, value] of bets.data.entries()) {
                this.gameBets[value.match_id] = value;
              }
              // set metadata indexed by match id
              for (const [index, value] of meta.data.entries()) {
                this.gameMeta[value.match_id] = value;
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
    // connection to server
    ioClient(
      import.meta.env.VITE_KCAPP_SOCKET +
        ":" +
        import.meta.env.VITE_KCAPP_SOCKET_PORT +
        "/active"
    ).on("warmup_started", (data) => {
      // get live match data from server socket
      this.$refs.betItem.forEach((item) => {
        if (item.game.id === data.match.id) {
          item.live = true;
        }
      });
    });

    ioClient(
      import.meta.env.VITE_KCAPP_SOCKET +
        ":" +
        import.meta.env.VITE_KCAPP_SOCKET_PORT +
        "/active"
    ).on("leg_finished", (data) => {
      if (data.match.is_finished) {
        this.finalizeGame(data.match);
      }
    });
  },
  methods: {
    finalizeGame(g) {
      this.$refs.betItem.forEach((item) => {
        if (item.game.id === g.id) {
          item.game.is_finished = true;
          item.live = false;
          item.betsOff = true;
          item.game.winner_id = g.winner_id;
        }
      });
    },
    recalculateCoins(matchId, oldBet1, oldBet2) {
      let sumNewBets = 0;
      let sumOldBets = 0;

      if (this.gameBets !== undefined) {
        this.gameBets.forEach((bet) => {
          sumOldBets += parseInt(bet.bet_1) + parseInt(bet.bet_2);
        });
      }

      this.$refs.betItem.forEach((item) => {
        if (item.player1Bet === "") {
          item.player1Bet = 0;
        }
        if (item.player2Bet === "") {
          item.player2Bet = 0;
        }
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
    handleBetSaving(gameId) {
      this.$refs.betItem.forEach((item) => {
        item.enabledSave = item.getGameId() === gameId;
      });
    },
    enableBetSaving() {
      this.$refs.betItem.forEach((item) => {
        item.enabledSave = true;
      });
    },
    toggleBets() {
      this.betsOnly = true;
      this.finishedOnly = false;
      this.unfinishedOnly = false;
    },
    toggleFinished() {
      this.finishedOnly = true;
      this.unfinishedOnly = false;
      this.betsOnly = false;
    },
    toggleUnfinished() {
      this.unfinishedOnly = true;
      this.finishedOnly = false;
      this.betsOnly = false;
    },
    toggleAll() {
      this.finishedOnly = false;
      this.unfinishedOnly = false;
      this.betsOnly = false;
    },
    // Returns boolean value indicating whether the BetItem should be shown or not
    isShown(game) {
      let gameFinished = game.is_finished;
      if (this.unfinishedOnly === true) {
        return gameFinished === true;
      } else if (this.finishedOnly === true) {
        return gameFinished !== true;
      } else if (this.betsOnly === true) {
        if (this.gameBets[game.id] !== undefined) {
          return true;
        } else {
          return false;
        }
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
      :gameMeta="gameMeta[game.id]"
      :class="{ hideItem: isShown(game) }"
      @recalculateCoins="recalculateCoins"
      @handleBetSaving="handleBetSaving"
      @enableBetSaving="enableBetSaving"
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
