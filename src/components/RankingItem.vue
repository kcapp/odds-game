<template>
  <td><slot name="playerName" /></td>
  <td class="txtR"><slot name="coins" /></td>
  <td class="txtL"><TheCoin /></td>
  <td class="txtC"><slot name="coinsInActiveBets" /></td>
  <td class="txtC"><slot name="betsPlaced" /></td>
  <td class="txtR"><slot name="avgWin" /></td>
</template>
<script>
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin },
};
</script>

<style>
td {
  padding: 5px 0px;
}
</style>
