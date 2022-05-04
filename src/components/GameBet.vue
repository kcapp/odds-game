<template>
  <td class="txtR">
    <span
      v-if="bet.player_1 === player1.id"
      :class="{ strike: bet.outcome === bet.player_2 }"
      ><slot name="payout1" /> <slot name="bet1"
    /></span>
    <span
      v-else-if="bet.player_1 === player2.id"
      :class="{ strike: bet.outcome === bet.player_1 }"
      ><slot name="payout2" /> <slot name="bet2"
    /></span>
  </td>
  <td class="txtC colWhite">
    {{ this.better.first_name }}

    {{ this.better.last_name }}
  </td>
  <td class="txtL">
    <span
      v-if="bet.player_2 === player2.id"
      :class="{ strike: bet.outcome === bet.player_1 }"
      ><slot name="bet2" /> <slot name="payout2"
    /></span>
    <span
      v-else-if="bet.player_2 === player1.id"
      :class="{ strike: bet.outcome === bet.player_2 }"
      ><slot name="bet1" /> <slot name="payout1"
    /></span>
  </td>
</template>
<script>
export default {
  props: ["player1", "player2", "bet", "better"],
};
</script>
<style>
.betFont {
  font-size: 20px;
  font-weight: 300;
}
</style>
