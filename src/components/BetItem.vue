<script>
export default {
  data() {
    return {
      player1Bet: this.gameBets ? this.gameBets.bet_1 : (0).toFixed(2),
      player2Bet: this.gameBets ? this.gameBets.bet_2 : (0).toFixed(2),
      floatingDigits: 2,
    };
  },
  props: ["game", "players", "gameBets"],
  computed: {
    player1BetResult() {
      if (this.gameBets) {
        return (
          this.player1Bet * this.game.player_odds[[this.game.players[0]]]
        ).toFixed(this.floatingDigits);
      } else {
        return (0).toFixed(2);
      }
    },
    player2BetResult() {
      if (this.gameBets) {
        return (
          this.player2Bet * this.game.player_odds[[this.game.players[1]]]
        ).toFixed(this.floatingDigits);
      } else {
        return (0).toFixed(2);
      }
    },
  },
};
</script>

<template>
  <div
    style="
      margin: 30px 50px 30px 20px;
      min-height: 100px;
      border-bottom: 1px solid #363636;
    "
  >
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
          <div class="icon" v-else>
            <i class="fa-solid fa-hourglass-start"></i>
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
        <td colspan="7">&nbsp;</td>
      </tr>
    </table>
  </div>
</template>

<style scoped="scoped">
h3 {
  display: inline;
}

.smGreenHeader {
  font-size: 13px;
  color: #3aaa35;
}

input:disabled {
  background-color: #383838;
}
</style>
