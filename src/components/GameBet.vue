<template>
  <td class="txtR txtB">
    <span
      v-if="bet.player_1 === player1.id"
      :class="{
        strike: bet.bet_1 > 0 && bet.outcome !== bet.player_1,
        colMinus: bet.bet_1 > 0 && bet.outcome !== bet.player_1,
        colPlus: bet.bet_1 > 0 && bet.outcome === bet.player_1,
      }"
    >
      <slot name="payout1" /> <slot name="bet1"
    /></span>
    <span
      v-else-if="bet.player_1 === player2.id"
      :class="{
        strike: bet.bet_2 > 0 && bet.outcome !== bet.player_2,
        colMinus: bet.bet_2 > 0 && bet.outcome !== bet.player_2,
        colPlus: bet.bet_2 > 0 && bet.outcome === bet.player_2,
      }"
      ><slot name="payout2" /> <slot name="bet2"
    /></span>
  </td>
  <td class="txtC">
    <span class="colWhite">
      {{ this.bettor.first_name }}

      {{ this.bettor.last_name }}
    </span>
    <br />
    <span
      :class="{
        strike:
          bet.bet_x !== 0 && bet.bet_x > 0 && bet.outcome && bet.outcome !== 0,
        colMinus: bet.bet_x > 0 && bet.outcome !== 0,
        colPlus: bet.bet_x > 0 && bet.outcome === 0,
      }"
      ><slot name="betDraw" /> <slot name="payoutDraw"
    /></span>
  </td>
  <td class="txtL txtB">
    <span
      v-if="bet.player_2 === player2.id"
      :class="{
        strike: bet.bet_2 > 0 && bet.outcome !== bet.player_2,
        colMinus: bet.bet_2 > 0 && bet.outcome !== bet.player_2,
        colPlus: bet.bet_2 > 0 && bet.outcome === bet.player_2,
      }"
      ><slot name="bet2" /> <slot name="payout2"
    /></span>
    <span
      v-else-if="bet.player_2 === player1.id"
      :class="{
        strike: bet.bet_1 > 0 && bet.outcome !== bet.player_1,
        colMinus: bet.bet_1 > 0 && bet.outcome !== bet.player_1,
        colPlus: bet.bet_1 > 0 && bet.outcome === bet.player_1,
      }"
      ><slot name="bet1" /> <slot name="payout1"
    /></span>
  </td>
</template>
<script>
export default {
  props: ["player1", "player2", "bet", "bettor"],
};
</script>
<style>
.betFont {
  font-size: 20px;
  font-weight: 300;
}
</style>
