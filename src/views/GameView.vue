<template>
  <TheGame :gameId="gameId" />
</template>

<script>
import TheGame from "@/components/TheGame.vue";
export default {
  components: { TheGame },
  data() {
    return {
      gameId: 0,
    };
  },
  created() {
    if (this.$route.params.id !== undefined && this.$route.params.id) {
      this.gameId = this.$route.params.id;
    }
  },
};
</script>

<style></style>
