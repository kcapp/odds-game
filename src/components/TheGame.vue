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
      <div class="pt20 txtC colWhite" v-if="this.game">
        <div
          style="
            margin: 0 auto;
            width: 125px;
            font-weight: 500;
            background-color: #00c178;
            padding: 5px 10px;
            border-radius: 5px;
          "
        >
          <span v-if="this.game.is_finished === true">finished</span>
          <span v-else-if="this.game.first_throw_time === null"
            >not started</span
          >
          <span v-else>live game</span>
        </div>
      </div>
      <div class="pt10">
        <table class="gameTable">
          <tr>
            <td class="playerColumn txtR colWhite">
              <span class="gamePlayerName" v-if="this.player1">
                <span
                  v-if="this.game.winner_id === this.player1.id"
                  class="juicyGreen"
                  >{{ player1.first_name }} {{ player1.last_name }}</span
                >
                <span v-else
                  >{{ player1.first_name }} {{ player1.last_name }}</span
                >
              </span>
            </td>
            <td class="midColumn txtC">vs</td>
            <td class="playerColumn txtL colWhite">
              <span class="gamePlayerName" v-if="this.player2">
                <span
                  v-if="this.game.winner_id === this.player2.id"
                  class="juicyGreen"
                  >{{ player2.first_name }} {{ player2.last_name }}</span
                >
                <span v-else
                  >{{ player2.first_name }} {{ player2.last_name }}</span
                >
              </span>
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
          <tr v-if="this.game && !this.game.is_finished">
            <td colspan="3" class="txtC">
              <div class="sliderBar"></div>
              <div
                style="
                  margin: -38px auto 0 auto;
                  width: 30px;
                  height: 30px;
                  position: relative;
                "
              >
                <span class="indicator" :style="this.indicatorPositionString">
                  <span class="fa-stack fa-2x indicatorStack">
                    <i class="fa-solid fa-circle-up fa-stack-2x"></i>
                    <i
                      class="fa-solid fa-circle fa-stack-1x fa-inverse"
                      style="z-index: -1; font-size: 20px"
                    ></i>
                  </span>
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="this.game && !this.game.is_finished">
            <td class="txtC" colspan="3">
              <div class="midIndicator"></div>
            </td>
          </tr>
          <tr>
            <td colspan="3" class="pt20">
              <div class="gameTitle">Bets</div>
            </td>
          </tr>
          <tr v-if="this.gameBets.length > 0">
            <td class="playerColumn txtR">
              {{ this.player1SumBets }}
            </td>
            <td class="txtC midColumn">total bets</td>
            <td class="playerColumn txtL">
              {{ this.player2SumBets }}
            </td>
          </tr>
          <tr v-if="this.gameBets.length > 0">
            <td colspan="3">
              <div style="margin: 0 auto; width: 60%">
                <hr />
              </div>
            </td>
          </tr>
          <tr v-if="this.gameBets.length === 0">
            <td colspan="3" class="txtC pt20 colWhite">
              No bets placed for this game
            </td>
          </tr>
          <tr v-for="(bet, index) in this.gameBets" v-bind:key="index">
            <GameBet
              :player1="this.player1"
              :player2="this.player2"
              :bet="bet"
              :better="this.players[bet.user_id]"
            >
              <template #payout1 v-if="bet.bet_1"
                >(+ {{ (bet.bet_1 * bet.odds_1).toFixed(0) }})</template
              >
              <template #bet1>{{ bet.bet_1 }}</template>
              <template #bet2>{{ bet.bet_2 }}</template>
              <template #payout2 v-if="bet.bet_2"
                >(+ {{ (bet.bet_2 * bet.odds_2).toFixed(0) }})</template
              >
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
import TheSmallCoin from "@/components/TheSmallCoin.vue";
import ioClient from "socket.io-client";

export default {
  components: { GameBet },
  props: ["gameId"],
  data() {
    return {
      sliderWidth: 500,
      indicatorPosition: 0,
      indicatorPositionString: "left: 0px;",
      totalWinningScore: 0,
      currentLegId: 0,
      p1TotalScore: 0,
      p2TotalScore: 0,
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
    setIndicator() {
      let unit = this.sliderWidth / (this.totalWinningScore * 2);
      if (this.p1TotalScore >= this.p2TotalScore) {
        this.indicatorPosition = -(this.p1TotalScore * unit).toFixed(0);
      } else {
        this.indicatorPosition = (this.p2TotalScore * unit).toFixed(0);
      }
      this.indicatorPositionString = "left:" + this.indicatorPosition + "px;";
    },
    connectSocket(legId) {
      ioClient(
        import.meta.env.VITE_KCAPP_SOCKET +
          ":" +
          import.meta.env.VITE_KCAPP_SOCKET_PORT +
          "/legs/" +
          legId
      )
        .on("score_update", (data) => {
          this.game.legs.forEach((leg) => {
            if (data.leg.id === leg.id) {
              leg.visits = data.leg.visits;
            }
          });
          let scores = this.getPlayersTotalScores();
          this.p1TotalScore = scores[this.game.players[0]];
          this.p2TotalScore = scores[this.game.players[1]];
          this.setIndicator();
        })
        .on("leg_finished", () => {
          this.gameBets = [];
          this.loadGame();
        });
    },
    getPlayersTotalScores() {
      let playerScores = [];
      let playerLeg = [];
      playerScores[this.game.players[0]] = 0;
      playerScores[this.game.players[1]] = 0;
      // get player score from legs
      this.game.legs.forEach((leg) => {
        playerLeg[this.game.players[0]] = 0;
        playerLeg[this.game.players[1]] = 0;
        leg.visits.forEach((visit) => {
          playerLeg[visit.player_id] +=
            visit.first_dart.value * visit.first_dart.multiplier +
            visit.second_dart.value * visit.second_dart.multiplier +
            visit.third_dart.value * visit.third_dart.multiplier;
        });

        if (leg.is_finished) {
          if (leg.winner_player_id === this.game.players[0]) {
            playerScores[this.game.players[0]] +=
              playerLeg[this.game.players[0]];
          }
          if (leg.winner_player_id === this.game.players[1]) {
            playerScores[this.game.players[1]] +=
              playerLeg[this.game.players[1]];
          }
        } else {
          playerScores[this.game.players[0]] += playerLeg[this.game.players[0]];
          playerScores[this.game.players[1]] += playerLeg[this.game.players[1]];
        }
      });
      return playerScores;
    },
    loadGame() {
      this.gameBets = [];
      this.player1SumBets = 0;
      this.player2SumBets = 0;
      // Get the rest of the data after we fetch current tournament id
      axios
        .get(import.meta.env.VITE_KCAPP_API_PROXY_STRING + "/player")
        .then((players) => {
          this.players = players.data;
          axios
            .all([
              axios.get(
                import.meta.env.VITE_KCAPP_API_PROXY_STRING +
                  "/match/" +
                  this.gameId
              ),
              axios.get(
                import.meta.env.VITE_KCAPP_API_PROXY_STRING +
                  "/api/tournament/match/" +
                  this.gameId +
                  "/probabilities"
              ),
              axios.get(
                import.meta.env.VITE_ODDS_API_PROXY_STRING +
                  "/bets/" +
                  this.gameId
              ),
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
                  // player1 is game's player 0 (displayed on the left side)
                  if (item[1].player_1 === this.player1.id) {
                    this.player1SumBets += item[1].bet_1;
                    this.player2SumBets += item[1].bet_2;
                  } else if (item[1].player_1 === this.player2.id) {
                    this.player2SumBets += item[1].bet_1;
                    this.player1SumBets += item[1].bet_2;
                  }
                });

                this.totalWinningScore =
                  this.game.legs[0].starting_score *
                  this.game.match_mode.wins_required;
                this.currentLegId = this.game.current_leg_id;
                this.connectSocket(this.currentLegId);

                let scores = this.getPlayersTotalScores();
                let s1 = scores[this.game.players[0]]
                  ? scores[this.game.players[0]]
                  : 0;
                let s2 = scores[this.game.players[1]]
                  ? scores[this.game.players[1]]
                  : 0;
                this.p1TotalScore = s1;
                this.p2TotalScore = s2;

                this.setIndicator();
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
  },
  created() {
    this.loadGame();
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
  font-size: 20px;
  font-weight: 300;
}

.betFont {
  font-size: 20px;
  font-weight: 300;
}

.sliderBar {
  width: 500px;
  height: 3px;
  margin: 20px auto;
  border: 1px solid rgb(76, 77, 86);
  background-color: #22232d;
}
.indicator {
  position: relative;
  font-size: 17px;
  color: #00ae12;
  z-index: 1;
}
.midIndicator {
  margin: -40px auto 0 auto;
  width: 3px;
  border: 1px solid #494a54;
  height: 19px;
  background-color: #23242f;
  position: relative;
}
.indicatorStack {
  font-size: 12px;
}
</style>
