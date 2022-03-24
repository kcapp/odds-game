<script>
export default {
  props: ["game", "players", "gameBets"],
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
        <td colspan="2">&nbsp;</td>
        <td style="font-size: 13px; color: #3aaa35">win prob.</td>
        <td style="font-size: 13px; color: #3aaa35">odds</td>
        <td style="font-size: 13px">&nbsp;</td>
        <td style="font-size: 13px; color: #3aaa35; padding-left: 10px">
          your bet
        </td>
      </tr>
      <tr>
        <td rowspan="2">
          <div class="icon" v-if="game.is_finished">
            <i class="fa-solid fa-flag-checkered"></i>
          </div>
          <div class="icon" v-else-if="game.is_walkover">
            <i class="fa-solid fa-flag"></i>
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
            v-if="gameBets"
            type="text"
            class="textInput txtC"
            style="width: 40px"
            v-model="gameBets.bet_1"
          />
          <input
            v-else
            type="text"
            class="textInput txtC"
            style="width: 40px"
            value="0"
          />
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
            v-if="gameBets"
            type="text"
            class="textInput txtC"
            style="width: 40px"
            v-model="gameBets.bet_2"
          />
          <input
            v-else
            type="text"
            class="textInput txtC"
            style="width: 40px"
            value="0"
          />
        </td>
      </tr>
      <tr>
        <td colspan="5">&nbsp;</td>
      </tr>
    </table>
  </div>
</template>

<style scoped="scoped">
h3 {
  display: inline;
}
</style>
