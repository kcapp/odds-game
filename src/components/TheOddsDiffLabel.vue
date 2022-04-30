<template>
  <span
    :class="{
      redOCLabel: this.oddsValue < 0,
      greenOCLabel: this.oddsValue > 0,
    }"
    >{{ this.oddsValue }}</span
  >
</template>

<script>
export default {
  props: ["oddsValue"],
};
</script>

<style>
.greenOCLabel {
  background-color: green;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
}

.redOCLabel {
  background-color: red;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
}
</style>
