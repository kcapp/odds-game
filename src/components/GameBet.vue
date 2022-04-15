<template>
  <td class="txtR betFont"><slot name="bet1" /></td>
  <td class="txtC colWhite"><slot name="playerName" /></td>
  <td class="txtL betFont"><slot name="bet2" /></td>
</template>
<script>
// import TheCoin from "@/components/TheCoin.vue";
export default {};
</script>
<style>
.betFont {
  font-size: 20px;
  font-weight: 300;
}
</style>
