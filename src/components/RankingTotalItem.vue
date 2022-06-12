<template>
  <td class="pr10"><slot name="index" /></td>
  <td><slot name="playerName" /></td>
  <td class="txtR"><slot name="coinsWonGame" /></td>
  <td class="txtR"><slot name="coinsWonTournament" /></td>
  <td class="txtR colWhite"><slot name="coinsWonTotal" /></td>
  <td class="txtL pl10"><TheCoin /></td>
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
