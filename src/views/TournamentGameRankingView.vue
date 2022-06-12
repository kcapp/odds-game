<template>
  <TheGameRanking
    :tournament="tournament"
    :ranking="ranking"
    :cheaters-ranking="cheatersRanking"
    :non-cheaters-ranking="nonCheatersRanking"
  />
</template>

<script>
import axios from "axios";
import TheGameRanking from "@/components/TheGameRanking.vue";
export default {
  components: { TheGameRanking },
  data() {
    return {
      tournamentId: 0,
      tournament: null,
      ranking: [],
      cheatersRanking: [],
      nonCheatersRanking: [],
    };
  },
  methods: {
    splitRankings(ranking) {
      ranking.forEach((item) => {
        if (item.is_cheater === 1) {
          this.cheatersRanking.push(item);
        } else {
          this.nonCheatersRanking.push(item);
        }
      });
    },
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
            "/gameranking"
        ),
      ])
      .then(
        axios.spread((tournament, ranking) => {
          this.tournament = tournament.data;
          this.ranking = ranking.data;
          this.splitRankings(ranking.data);
        })
      )
      .catch((error) => {
        console.log("Error when getting data for tournaments ", error);
      });
  },
};
</script>

<style></style>
