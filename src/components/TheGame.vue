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
      <div class="pt20">
        <table class="gameTable">
          <tr>
            <td class="playerColumn txtR colWhite">
              <span class="gamePlayerName" v-if="this.player1"
                >{{ player1.first_name }} {{ player1.last_name }}</span
              >
            </td>
            <td class="midColumn txtC">vs</td>
            <td class="playerColumn txtL colWhite">
              <span class="gamePlayerName" v-if="this.player2"
                >{{ player2.first_name }} {{ player2.last_name }}</span
              >
            </td>
          </tr>
          <tr>
            <td class="playerColumn txtR">
              <span class="gamePlayerName" v-if="this.player1">{{
                player1Elo
              }}</span>
            </td>
            <td class="midColumn txtC">elo</td>
            <td class="playerColumn txtL">
              <span class="gamePlayerName" v-if="this.player2">{{
                player2Elo
              }}</span>
            </td>
          </tr>
          <tr>
            <td class="playerColumn txtR">
              <span class="gamePlayerName" v-if="this.player1"
                >{{
                  (
                    this.probabilities.player_winning_probabilities[
                      player1.id
                    ] * 100
                  ).toFixed(2)
                }}
                %</span
              >
            </td>
            <td class="midColumn txtC">winning</td>
            <td class="playerColumn txtL">
              <span class="gamePlayerName" v-if="this.player2"
                >{{
                  (
                    this.probabilities.player_winning_probabilities[
                      player2.id
                    ] * 100
                  ).toFixed(2)
                }}
                %</span
              >
            </td>
          </tr>
          <tr>
            <td class="playerColumn txtR">
              <span class="gamePlayerName" v-if="this.player1">{{
                this.probabilities.player_odds[player1.id]
              }}</span>
            </td>
            <td class="midColumn txtC">odds</td>
            <td class="playerColumn txtL">
              <span class="gamePlayerName" v-if="this.player2">{{
                this.probabilities.player_odds[player2.id]
              }}</span>
            </td>
          </tr>
          <tr>
            <td colspan="3" class="pt20">
              <div class="gameTitle">Bets</div>
            </td>
          </tr>
          <tr>
            <td class="playerColumn txtR betFont">
              {{ this.player1SumBets }}
            </td>
            <td class="txtC midColumn">total bets</td>
            <td class="playerColumn txtL betFont">
              {{ this.player2SumBets }}
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <div style="margin: 0 auto; width: 60%">
                <hr />
              </div>
            </td>
          </tr>
          <tr v-for="(bet, index) in this.gameBets" v-bind:key="index">
            <GameBet>
              <template #bet1>{{ bet.bet_1 }}</template>
              <template #playerName
                >{{ this.players[bet.user_id].first_name }}

                {{ this.players[bet.user_id].last_name }}</template
              >
              <template #bet2>{{ bet.bet_2 }}</template>
            </GameBet>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import GameBet from "@/components/GameBet.vue";
import TheCoin from "@/components/TheCoin.vue";

export default {
  components: { GameBet },
  props: ["gameId"],
  data() {
    return {
      game: null,
      players: [],
      probabilities: [],
      gameBets: [],
      player1: null,
      player2: null,
      player1SumBets: 0,
      player2SumBets: 0,
      live: true,
      player1Elo: 0,
      player2Elo: 0,
    };
  },
  methods: {
    //getUserData(gameId) {},
  },
  created() {
    // Get the rest of the data after we fetch current tournament id
    axios
      .get("/kcapp-api/player")
      .then((players) => {
        this.players = players.data;
        axios
          .all([
            axios.get("/kcapp-api/match/" + this.gameId),
            axios.get(
              "/kcapp-api/tournament/match/" + this.gameId + "/probabilities"
            ),
            axios.get("/api/bets/" + this.gameId),
          ])
          .then(
            axios.spread((game, probabilities, bets) => {
              this.game = game.data;
              this.probabilities = probabilities.data;
              this.gameBets = bets.data;

              Object.entries(this.players).forEach((item) => {
                if (item[1].id === this.game.players[0]) {
                  this.player1 = item[1];
                  this.player1Elo =
                    this.probabilities.player_elo[this.player1.id];
                }
                if (item[1].id === this.game.players[1]) {
                  this.player2 = item[1];
                  this.player2Elo =
                    this.probabilities.player_elo[this.player2.id];
                }
              });

              // summarise the bets
              Object.entries(this.gameBets).forEach((item) => {
                this.player1SumBets += item[1].bet_1;
                this.player2SumBets += item[1].bet_2;
              });
            })
          )
          .catch((error) => {
            console.log("Error when getting data for game " + error);
          });
      })
      .catch((error) => {
        console.log("Error when getting data for user " + error);
      });
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
.gameTable {
  width: 100%;
}
.playerColumn {
  width: 40%;
}
.midColumn {
  width: 20%;
}
.gamePlayerName {
  font-size: 25px;
  font-weight: 300;
}

.betFont {
  font-size: 20px;
  font-weight: 300;
}
</style>
