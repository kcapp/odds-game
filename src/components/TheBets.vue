<script>
import BetItem from "@/components/BetItem.vue";
import axios from "axios";
import ioClient from "socket.io-client";

export default {
  data() {
    return {
      searchName: "",
      loaded: false,
      balance: null,
      coinsAvailable: 0,
      tournamentId: 0,
      tournamentFinished: false,
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
  props: ["games", "players", "requestedTournamentId", "results"],
  created() {
    this.loadComponentData();
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
    getResultsForGameId(gameId) {
      let res = null;
      this.results.forEach((item) => {
        if (item.match_id === gameId) {
          res = item;
        }
      });
      return res;
    },
    loadComponentData() {
      // By default, load current tournament
      let url =
        import.meta.env.VITE_KCAPP_API_PROXY_STRING +
        "/tournament/current/" +
        import.meta.env.VITE_OFFICE_ID;
      // If there was requested tournament (i.e. previous ones), load data for it
      if (this.requestedTournamentId !== 0) {
        url =
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
          "/tournament/" +
          this.requestedTournamentId;
      }
      axios
        .get(url)
        .then((tournament) => {
          this.tournamentId = tournament.data.id;
          this.tournamentFinished = tournament.data.is_finished;

          // Get the rest of the data after we fetch current tournament id
          axios
            .all([
              axios.get(
                import.meta.env.VITE_ODDS_API_PROXY_STRING +
                  "/user/" +
                  this.$store.state.auth.user.user_id +
                  "/tournament/" +
                  this.tournamentId +
                  "/bets"
              ),
              axios.get(
                import.meta.env.VITE_ODDS_API_PROXY_STRING +
                  "/user/" +
                  this.$store.state.auth.user.user_id +
                  "/tournament/" +
                  this.tournamentId +
                  "/balance"
              ),
              axios.get(
                import.meta.env.VITE_ODDS_API_PROXY_STRING + "/games/meta"
              ),
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
                this.balance = balance.data;
                this.loaded = true;

                this.immutableCoins = 0;
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
    filterName: function () {
      // remove all filters
      this.toggleAll();
    },
    resetGameBets() {
      this.loadComponentData();
    },
    reloadBalance(newBalance) {
      this.balance = newBalance;
      this.$refs.betItem.forEach((item) => {
        item.coinsAvailable =
          newBalance.start_coins -
          newBalance.coins_bets_open -
          newBalance.coins_bets_closed +
          newBalance.coins_won;
      });
    },
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
    disableOtherBetsSaving(gameId) {
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
      this.searchName = "";
      this.betsOnly = true;
      this.finishedOnly = false;
      this.unfinishedOnly = false;
    },
    toggleFinished() {
      this.searchName = "";
      this.finishedOnly = true;
      this.unfinishedOnly = false;
      this.betsOnly = false;
    },
    toggleUnfinished() {
      this.searchName = "";
      this.unfinishedOnly = true;
      this.finishedOnly = false;
      this.betsOnly = false;
    },
    toggleAll() {
      this.finishedOnly = false;
      this.unfinishedOnly = false;
      this.betsOnly = false;
    },
    getPlayer1Initials(game) {
      return this.players[game.players[0]].name;
    },
    getPlayer2Initials(game) {
      return this.players[game.players[1]].name;
    },
    // Returns boolean value indicating whether the BetItem should be shown or not
    isShown(game) {
      let gameFinished = game.is_finished;
      let hasBets = this.gameBets[game.id];
      if (this.unfinishedOnly === true) {
        return gameFinished === true;
      } else if (this.finishedOnly === true) {
        return gameFinished !== true;
      } else if (this.betsOnly === true) {
        return hasBets === undefined;
      } else {
        // By default, do not hide (hide = false)
        if (this.searchName !== "" && this.searchName.length >= 3) {
          return !this.hasPlayerName(game);
        }
        return false;
      }
    },
    clearSearchName() {
      this.searchName = "";
    },
    hasPlayerName(game) {
      // get game players
      let pNames = (
        this.players[game.players[0]].first_name +
        " " +
        this.players[game.players[0]].last_name +
        " " +
        this.players[game.players[1]].first_name +
        " " +
        this.players[game.players[1]].last_name
      ).toLowerCase();
      return pNames.indexOf(this.searchName.toLowerCase()) > -1;
    },
  },
};
</script>

<template>
  <div class="tableHeader">
    <table style="width: 100%; margin: 0px 10px">
      <tr>
        <td class="txtL">
          <form @submit.prevent="nameSearch" style="display: inline-block">
            <input
              v-model="searchName"
              placeholder="name"
              type="text"
              class="textInput"
              @keyup="this.filterName()"
            />
          </form>
          <span
            class="pl10"
            v-if="this.searchName && this.searchName.length >= 3"
          >
            <i
              @click="this.clearSearchName"
              class="fa-solid fa-circle-xmark"
            ></i>
          </span>
        </td>
        <td class="txtR">
          Filter:
          <a href="#" @click="toggleBets" :class="{ juicyGreen: this.betsOnly }"
            >my bets</a
          >
          |
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
            :class="{
              juicyGreen: !this.finishedOnly && !this.unfinishedOnly,
            }"
            >all</a
          >
        </td>
      </tr>
    </table>
  </div>
  <div>
    <table v-if="loaded" class="gameBetsTable">
      <tr
        v-for="(game, index) in this.games"
        v-bind:key="index"
        :class="{ hideItem: isShown(game) }"
      >
        <td>
          <BetItem
            ref="betItem"
            :balance="this.balance"
            :coinsAvailable="this.coinsAvailable"
            :tournamentId="tournamentId"
            :tournament-finished="tournamentFinished"
            :game="game"
            :result="this.getResultsForGameId(game.id)"
            :players="game.players"
            :gameBets="gameBets[game.id]"
            :gameMeta="gameMeta[game.id]"
            :p1Initials="this.getPlayer1Initials(game)"
            :p2Initials="this.getPlayer2Initials(game)"
            @recalculateCoins="recalculateCoins"
            @disableOtherBetsSaving="disableOtherBetsSaving"
            @enableBetSaving="enableBetSaving"
            @reloadBalance="reloadBalance"
            @resetGameBets="resetGameBets"
          >
            <template #playerOneName>
              {{ this.players[game.players[0]].name }}
            </template>
            <template #playerTwoName>
              {{ this.players[game.players[1]].name }}
            </template>
            <template #probsPlayerOne>
              {{
                (
                  game.player_winning_probabilities[[game.players[0]]] * 100
                ).toFixed(2)
              }}%
            </template>
            <template #probsPlayerTwo>
              {{
                (
                  game.player_winning_probabilities[[game.players[1]]] * 100
                ).toFixed(2)
              }}%
            </template>
            <template #oddsPlayerOne>
              {{
                gameBets[game.id]
                  ? gameBets[game.id].odds_1
                  : game.player_odds[[game.players[0]]]
              }}
            </template>
            <template #oddsPlayerTwo>
              {{
                gameBets[game.id]
                  ? gameBets[game.id].odds_2
                  : game.player_odds[[game.players[1]]]
              }}
            </template>
          </BetItem>
        </td>
      </tr>
    </table>
  </div>
</template>

<style>
.hideItem {
  display: none;
}
.tableHeader {
  display: flex;
  /*margin: 10px;*/
  /*border-bottom: 1px solid #363636;*/
  /*padding-bottom: 10px;*/
  /*width: 100%;*/
}
.filterHeader {
  padding-bottom: 5px;
}
.gameBetsTable {
  width: 100%;
  margin: 0px 5px;
}
</style>
