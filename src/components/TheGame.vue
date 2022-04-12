<template>
  <div class="m50">
    <div :class="{ gameDivLive: this.live, gameDiv: !this.live }">
      <div class="gameTitle">
        {{
          this.game
            ? this.game.tournament.tournament_name +
              ", " +
              this.game.tournament.tournament_group_name
            : ""
        }}
      </div>
      <div class="pt20"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["gameId"],
  data() {
    return {
      game: null,
      players: [],
      player1: null,
      player2: null,
      live: true,
    };
  },
  methods: {
    //getUserData(gameId) {},
  },
  mounted() {
    // axios
    //   .get("/kcapp-api/player")
    //   .then((players) => {
    //     this.players = players.data;
    //     console.log("getting player data" + this.players);
    //     axios
    //       .get("/kcapp-api/match/" + this.gameId)
    //       .then((gameData) => {
    //         this.game = gameData.data;
    //
    //         Object.entries(this.players).forEach((item) => {
    //           if (item[1].id === this.game.players[0]) {
    //             this.player1 = item[1];
    //           }
    //           if (item[1].id === this.game.players[1]) {
    //             this.player2 = item[1];
    //           }
    //         });
    //       })
    //       .catch((error) => {
    //         console.log("Error when getting data for user " + error);
    //       });
    //   })
    //   .catch((error) => {
    //     console.log("Error when getting data for user " + error);
    //   });
  },
};
</script>

<style>
.gameTitle {
  padding: 10px;
  background-color: #22232c;
  border-radius: 10px;
  font-size: 20px;
  text-align: center;
}
</style>
