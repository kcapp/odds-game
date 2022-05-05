<template>
  <TheRanking :tournament="tournament" :ranking="ranking" />
</template>

<script>
import TheGame from "@/components/TheGame.vue";
import axios from "axios";
import TheRanking from "@/components/TheRanking.vue";
export default {
  components: { TheRanking },
  data() {
    return {
      tournamentId: 0,
      tournament: null,
      ranking: [],
    };
  },
  created() {
    if (this.$route.params.id !== undefined && this.$route.params.id) {
      this.tournamentId = this.$route.params.id;
    }
    axios
      .all([
        axios.get(
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
            "/tournament/" +
            this.tournamentId
        ),
        axios.get(
          import.meta.env.VITE_ODDS_API_PROXY_STRING +
            "/tournament/" +
            this.tournamentId +
            "/ranking"
        ),
      ])
      .then(
        axios.spread((tournament, ranking) => {
          this.tournament = tournament.data;
          this.ranking = ranking.data;
        })
      )
      .catch((error) => {
        console.log("Error when getting data for tournaments ", error);
      });
  },
};
</script>

<style></style>
