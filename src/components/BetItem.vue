<script>
import axios from "axios";
export default {
  data() {
    return {
      player1Bet: this.gameBets ? this.gameBets.bet_1 : 0,
      player2Bet: this.gameBets ? this.gameBets.bet_2 : 0,
      floatingDigits: 2,
      betId: 0,
      messages: [],
      matchBetsSum: this.gameBets
        ? this.gameBets.bet_1 + this.gameBets.bet_2
        : 0,
      live: false,
    };
  },
  props: [
    "game",
    "players",
    "gameBets",
    "tournamentId",
    "coinsAvailable",
    "activeGames",
  ],
  computed: {
    player1BetResult() {
      return (
        this.player1Bet * this.game.player_odds[[this.game.players[0]]]
      ).toFixed(this.floatingDigits);
    },
    player2BetResult() {
      return (
        this.player2Bet * this.game.player_odds[[this.game.players[1]]]
      ).toFixed(this.floatingDigits);
    },
  },
  mounted() {
    this.betId = this.gameBets ? this.gameBets.id : 0;
    this.activeGames.forEach((item) => {
      if (this.game.id === item.id) {
        this.live = true;
      }
    });
  },
  methods: {
    postBet() {
      const json = JSON.stringify({
        id: this.betId,
        user_id: this.$store.state.auth.user.user_id,
        tournament_id: parseInt(this.tournamentId),
        match_id: parseInt(this.game.id),
        player_1: this.game.players[0],
        player_2: this.game.players[1],
        bet_1: parseInt(this.player1Bet),
        bet_x: 0,
        bet_2: parseInt(this.player2Bet),
        odds_1: parseFloat(this.game.player_odds[[this.game.players[0]]]),
        odds_x: parseFloat(0),
        odds_2: parseFloat(this.game.player_odds[[this.game.players[1]]]),
      });
      axios
        .post(this.kcappOddsApiUrl + "/bets/" + this.game.id, json)
        .then((res) => {
          this.betId = res.data;
          setTimeout((this.messages[this.betId] = "saved"), 1000);
          setTimeout((this.messages[this.betId] = ""), 1000);
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<template>
  <div style="margin: 20px 50px 20px 20px">
    <div
      style="
        background-color: #22232c;
        padding: 20px;
        border-radius: 10px;
        min-height: 100px;
      "
    >
      <form @submit.prevent="postBet()">
        <table style="text-align: left">
          <tr>
            <td colspan="2" class="smGreenHeader" v-if="game.is_finished">
              finished
            </td>
            <td colspan="2" class="smGreenHeader" v-else>
              scheduled: {{ game.created_at }}
            </td>
            <td class="smGreenHeader">win prob.</td>
            <td class="smGreenHeader">odds</td>
            <td style="font-size: 13px">&nbsp;</td>
            <td style="font-size: 13px; color: #3aaa35; padding-left: 10px">
              your bet
            </td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td rowspan="2">
              <div class="icon" v-if="game.is_finished">
                <i class="fa-solid fa-flag-checkered"></i>
              </div>
              <div class="icon" v-else-if="game.is_walkover">
                <i class="fa-solid fa-flag"></i>
              </div>
              <div
                class="icon"
                v-else
                style="overflow: hidden; filter: grayscale(100%)"
              >
                <img
                  src="@/assets/logo128VC.png"
                  width="60"
                  style="
                    margin-top: 44px;
                    margin-left: -32px;
                    transform: rotate(45deg);
                    opacity: 0.3;
                  "
                />
              </div>
            </td>
            <td style="padding-left: 30px; min-width: 250px">
              <h3 v-if="game.winner_id === players[0]" class="winnerColor">
                <slot name="playerOneName" />
              </h3>
              <h3 v-else>
                <slot name="playerOneName" />
              </h3>
            </td>
            <td style="width: 80px">
              <slot name="probsPlayerOne" />
            </td>
            <td style="width: 50px">
              <slot name="oddsPlayerOne" />
            </td>
            <td class="txtC">
              <i class="fa-solid fa-xmark"></i>
            </td>
            <td style="padding-left: 10px">
              <input
                v-if="game.is_finished"
                disabled="disabled"
                type="text"
                class="textInput txtC w40"
                v-model="this.player1Bet"
              />
              <input
                v-else
                type="text"
                class="textInput txtC w40"
                v-model="this.player1Bet"
                @change="
                  $emit(
                    'recalculateCoins',
                    this.game.id ? this.game.id : 0,
                    this.gameBets ? this.gameBets.bet_1 : 0,
                    this.gameBets ? this.gameBets.bet_2 : 0
                  )
                "
              />
            </td>
            <td style="padding-left: 10px">
              <i class="fa-solid fa-equals"></i>
            </td>
            <td class="w60 txtR">
              {{ this.player1BetResult }}
            </td>
          </tr>
          <tr>
            <td style="padding-left: 30px">
              <h3 v-if="game.winner_id === players[1]" class="winnerColor">
                <slot name="playerTwoName" />
              </h3>
              <h3 v-else>
                <slot name="playerTwoName" />
              </h3>
            </td>
            <td>
              <slot name="probsPlayerTwo" />
            </td>
            <td>
              <slot name="oddsPlayerTwo" />
            </td>
            <td class="txtC">
              <i class="fa-solid fa-xmark"></i>
            </td>
            <td style="padding-left: 10px">
              <input
                v-if="game.is_finished"
                disabled="disabled"
                type="text"
                class="textInput txtC w40"
                v-model="this.player2Bet"
              />
              <input
                v-else
                type="text"
                class="textInput txtC w40"
                v-model="this.player2Bet"
                @change="
                  $emit(
                    'recalculateCoins',
                    this.game.id ? this.game.id : 0,
                    this.gameBets ? this.gameBets.bet_1 : 0,
                    this.gameBets ? this.gameBets.bet_2 : 0
                  )
                "
              />
            </td>
            <td style="padding-left: 10px">
              <i class="fa-solid fa-equals"></i>
            </td>
            <td class="w60 txtR">
              {{ this.player2BetResult }}
            </td>
          </tr>
          <tr>
            <td colspan="8">
              <hr />
            </td>
          </tr>
          <tr>
            <td>
              <button
                type="submit"
                class="smSaveLabel"
                v-if="!this.game.is_finished && !this.live"
              >
                save
              </button>
              <span v-if="this.live">match live <a>spectate</a></span>
            </td>
            <td>
              <span>{{ this.messages[this.betId] }}</span>
              <span v-if="gameBets" class="smWhite">bets placed</span>
              <span v-else>&nbsp;</span>
            </td>
            <td colspan="4" class="txtR">
              <span class="smallText">coins available: </span>
              <span class="colWhite smallText">{{ this.coinsAvailable }}</span>
            </td>
            <td colspan="1">&nbsp;</td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</template>

<style scoped="scoped">
h3 {
  display: inline;
  font-weight: 400;
}

input:disabled {
  background-color: #383838;
}

hr {
  height: 1px;
  border: none;
  color: #1e5b44;
  background-color: #1e5b44;
}

button {
  border: none;
}

.smallText {
  font-size: 13px;
}

.colWhite {
  color: white;
}

.smWhite {
  padding-left: 30px;
  color: white;
  font-size: 13px;
}

.savedMessage {
  animation: fadeOut 2s forwards;
  animation-delay: 1s;
  color: white;
  text-align: center;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    width: 0;
    height: 0;
  }
}
</style>
