<template>
  <TheLadder :tournamentId="tournamentId" />
</template>

<script>
import TheLadder from "@/components/TheLadder.vue";
export default {
  components: { TheLadder },
  data() {
    return {
      tournamentId: 0,
    };
  },
  created() {
    if (this.$route.params.id !== undefined && this.$route.params.id) {
      this.tournamentId = this.$route.params.id;
    }
  },
};
</script>

<style></style>
