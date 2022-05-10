<script>
import axios from "axios";
import TheBets from "@/components/TheBets.vue";

export default {
  components: { TheBets },
  data() {
    return {
      tournamentId: 0,
      games: [],
      results: [],
      players: [],
      bets: [],
    };
  },
  created() {
    if (this.$route.params.id !== undefined && this.$route.params.id) {
      this.tournamentId = this.$route.params.id;
    }
  },
  mounted() {
    // In case we got tournament id from the route parameter
    if (!this.tournamentId) {
      axios
        .get(
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
            "/tournament/current/" +
            import.meta.env.VITE_OFFICE_ID
        )
        .then((tournament) => {
          this.tournamentId = tournament.data.id;
          this.getData();
        })
        .catch((error) => {
          console.log("Error when getting current tournament " + error);
        });
    } else {
      this.getData();
    }
  },
  methods: {
    getData() {
      axios
        .all([
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/" +
              this.tournamentId +
              "/probabilities"
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/" +
              this.tournamentId +
              "/matches/result"
          ),
          axios.get(import.meta.env.VITE_KCAPP_API_PROXY_STRING + "/player"),
        ])
        .then(
          axios.spread((games, results, players) => {
            this.games = games.data;
            this.results = results.data;
            this.players = players.data;
          })
        )
        .catch((error) => {
          console.log("Error when getting data for matches " + error);
        });
    },
  },
};
</script>

<template>
  <TheBets
    :games="this.games"
    :results="this.results"
    :players="this.players"
    :requested-tournament-id="this.tournamentId"
  />
</template>
