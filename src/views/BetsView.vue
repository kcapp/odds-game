<script>
import axios from "axios";
import TheBets from "@/components/TheBets.vue";

export default {
  components: { TheBets },
  data() {
    return {
      tournamentId: 34,
      games: [],
      players: [],
      bets: [],
    };
  },
  mounted() {
    axios
      .all([
        axios.get(
          "http://localhost:8002/tournament/" +
            this.tournamentId +
            "/probabilities"
        ),
        axios.get("http://localhost:8002/player"),
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
};
</script>

<template>
  <TheBets
    :games="this.games"
    :players="this.players"
    :tournamentId="this.tournamentId"
  />
</template>
