<template>
  <div v-for="(group, index) in this.games">
    <div style="border: 1px solid white">{{ this.groups[index].name }}</div>
    <div v-for="(game, gameIndex) in group">
      {{ gameIndex }}
      {{ game.players[0] }} vs {{ game.players[1] }}
      {{ game.match_mode.name }} is finished: {{ game.is_finished }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      games: [],
      groups: [],
    };
  },
  mounted() {
    axios
      .all([
        axios.get("https://darts.sportradar.ag/api/tournament/34/matches"),
        axios.get("https://darts.sportradar.ag/api/tournament/groups"),
        ,
      ])
      .then(
        axios.spread((games, groups) => {
          console.log(groups.data);
          console.log(games.data);
          this.games = games.data;
          this.groups = groups.data;
        })
      )
      .catch((error) => {
        console.log("Error when getting data for matches " + error);
      });
  },
};
</script>
