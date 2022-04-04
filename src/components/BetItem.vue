<script>
import axios from "axios";
export default {
  data() {
    return {
      player1Bet: this.gameBets ? this.gameBets.bet_1 : 0,
      player2Bet: this.gameBets ? this.gameBets.bet_2 : 0,
      floatingDigits: 2,
    };
  },
  props: ["game", "players", "gameBets", "coins", "tournamentId"],
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
  methods: {
    postBet() {
      const json = JSON.stringify({
        id: this.gameBets ? this.gameBets.id : 0,
        user_id: this.$store.state.auth.user.user_id,
        tournament_id: parseInt(this.tournamentId),
        match_id: parseInt(this.game.id),
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
          console.log(res);
          this.errors = [];
          this.errors.push("Player added");
        })
        .catch((error) => {
          this.errors.push(error.response.data.errorText);
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
                v-if="!this.game.is_finished"
              >
                save
              </button>
            </td>
            <td>
              <span v-if="gameBets" class="smWhite">bets placed</span>
            </td>
            <td colspan="6">&nbsp;</td>
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

.smWhite {
  padding-left: 30px;
  color: white;
  font-size: 13px;
}
</style>
