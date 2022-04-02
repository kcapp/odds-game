<script>
import axios from "axios";
import TheBets from "@/components/TheBets.vue";

export default {
  components: { TheBets },
  data() {
    return {
      tournamentId: 0,
      games: [],
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
        .get(this.kcappApiUrl + "/tournament/current/" + this.officeId)
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
            this.kcappApiUrl +
              "/tournament/" +
              this.tournamentId +
              "/probabilities"
          ),
          axios.get(this.kcappApiUrl + "/player"),
        ])
        .then(
          axios.spread((games, players) => {
            this.games = games.data;
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
  <TheBets :games="this.games" :players="this.players" />
</template>
