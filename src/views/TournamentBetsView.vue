<script>
import axios from "axios";
import TheBets from "@/components/TheBets.vue";
import TheTournamentBets from "@/components/TheTournamentBets.vue";

export default {
  components: { TheTournamentBets },
  data() {
    return {
      tournamentId: 0,
      outcomes: [],
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
            import.meta.env.VITE_ODDS_API_PROXY_STRING +
              "/tournament/" +
              this.tournamentId +
              "/outcomes"
          ),
        ])
        .then(
          axios.spread((outcomes) => {
            this.outcomes = outcomes.data;
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
  <TheTournamentBets
    v-if="this.outcomes.length > 0"
    :outcomes="this.outcomes"
    :requested-tournament-id="this.tournamentId"
  />
</template>
