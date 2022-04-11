<script>
import axios from "axios";
import TheBoardIcon from "@/components/TheBoardIcon.vue";
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin, TheBoardIcon },
  data() {
    return {
      player1Bet: this.gameBets ? this.gameBets.bet_1 : 0,
      player2Bet: this.gameBets ? this.gameBets.bet_2 : 0,
      floatingDigits: 2,
      betId: 0,
      messages: [],
      matchBetsSum: this.gameBets
        ? this.gameBets.bet_1 + this.gameBets.bet_2
        : 0,
      live: false,
      message: "",
      betsOff: 0,
    };
  },
  props: [
    "game",
    "players",
    "gameBets",
    "tournamentId",
    "coinsAvailable",
    "gameMeta",
  ],
  computed: {
    player1BetResult() {
      return (
        this.player1Bet * this.game.player_odds[[this.game.players[0]]]
      ).toFixed(this.floatingDigits);
    },
    player2BetResult() {
      return (
        this.player2Bet * this.game.player_odds[[this.game.players[1]]]
      ).toFixed(this.floatingDigits);
    },
  },
  mounted() {
    this.betId = this.gameBets ? this.gameBets.id : 0;
    this.betsOff = this.gameMeta ? this.gameMeta.bets_off : 0;
    this.live = this.game.is_started && !this.game.is_finished;
  },
  methods: {
    getBetCoinSum() {
      if (this.game.winner_id === this.players[0]) {
        if (this.player1BetResult - this.matchBetsSum > 0) {
          return "+" + (this.player1BetResult - this.matchBetsSum).toFixed(2);
        } else {
          return (this.player1BetResult - this.matchBetsSum).toFixed(2);
        }
      }
      if (this.game.winner_id === this.players[1]) {
        if (this.player2BetResult - this.matchBetsSum > 0) {
          return "+" + (this.player2BetResult - this.matchBetsSum).toFixed(2);
        } else {
          return (this.player2BetResult - this.matchBetsSum).toFixed(2);
        }
      }
      return 0;
    },
    isNumber: function (evt) {
      evt = evt ? evt : window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    setBetMessage(msg) {
      this.message = msg;
    },
    validateAndEmit() {
      this.$emit(
        "recalculateCoins",
        this.game.id ? this.game.id : 0,
        this.gameBets ? this.gameBets.bet_1 : 0,
        this.gameBets ? this.gameBets.bet_2 : 0
      );
    },
    postBet() {
      const json = JSON.stringify({
        id: this.betId,
        user_id: this.$store.state.auth.user.user_id,
        tournament_id: parseInt(this.tournamentId),
        match_id: parseInt(this.game.id),
        player_1: this.game.players[0],
        player_2: this.game.players[1],
        bet_1: parseInt(this.player1Bet),
        bet_x: 0,
        bet_2: parseInt(this.player2Bet),
        odds_1: parseFloat(
          this.game.player_odds[[this.game.players[0]]].toFixed(3)
        ),
        odds_x: parseFloat("0"),
        odds_2: parseFloat(
          this.game.player_odds[[this.game.players[1]]].toFixed(3)
        ),
      });
      axios
        .post("/api/bets/" + this.game.id, json)
        .then((res) => {
          this.betId = res.data;
          this.message = "saved";
          setTimeout(this.setBetMessage, 3000, "bets placed");
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
  },
};
</script>

<template>
  <div class="gameDivContainer">
    <div :class="{ gameDivLive: this.live, gameDiv: !this.live }">
      <form @submit.prevent="postBet()">
        <table style="text-align: left">
          <tr>
            <td colspan="2" class="smGreenHeader" v-if="game.is_finished">
              finished
            </td>
            <td colspan="2" class="smGreenHeader" v-else>
              scheduled: {{ game.created_at }}
            </td>
            <td class="smGreenHeader">win prob.</td>
            <td class="smGreenHeader">odds</td>
            <td class="smallText">&nbsp;</td>
            <td class="pl10 smallText smGreenHeader">your bet</td>
            <td colspan="2">&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td rowspan="2">
              <div class="icon" v-if="game.is_finished">
                <i class="fa-solid fa-flag-checkered"></i>
              </div>
              <div class="icon" v-else-if="game.is_walkover">
                <i class="fa-solid fa-flag"></i>
              </div>
              <TheBoardIcon v-else />
            </td>
            <td style="padding-left: 30px; min-width: 250px">
              <h3 v-if="game.winner_id === players[0]" class="winnerColor">
                <slot name="playerOneName" />
              </h3>
              <h3 v-else>
                <slot name="playerOneName" />
              </h3>
            </td>
            <td style="width: 80px">
              <slot name="probsPlayerOne" />
            </td>
            <td style="width: 50px">
              <slot name="oddsPlayerOne" />
            </td>
            <td class="txtC">
              <i class="fa-solid fa-xmark"></i>
            </td>
            <td class="pl10 txtC">
              <span v-if="game.is_finished || this.live" class="txtC">
                {{ this.player1Bet }}
              </span>
              <input
                v-else
                type="text"
                class="textInput txtC w40"
                v-model="this.player1Bet"
                @keypress="this.isNumber($event)"
                @change="this.validateAndEmit()"
              />
            </td>
            <td style="padding-left: 10px">
              <i class="fa-solid fa-equals"></i>
            </td>
            <td class="w60 txtR">
              {{ this.player1BetResult }}
            </td>
            <td rowspan="2">
              <span v-if="game.is_finished && this.matchBetsSum > 0"
                ><span
                  :class="{
                    betResultPlus: this.getBetCoinSum() > 0,
                    betResultMinus: this.getBetCoinSum() < 0,
                    betResult: this.getBetCoinSum() === 0,
                  }"
                >
                  {{ this.getBetCoinSum() }}</span
                >
                <span><TheCoin /></span
              ></span>
            </td>
          </tr>
          <tr>
            <td style="padding-left: 30px">
              <h3 v-if="game.winner_id === players[1]" class="winnerColor">
                <slot name="playerTwoName" />
              </h3>
              <h3 v-else>
                <slot name="playerTwoName" />
              </h3>
            </td>
            <td>
              <slot name="probsPlayerTwo" />
            </td>
            <td>
              <slot name="oddsPlayerTwo" />
            </td>
            <td class="txtC">
              <i class="fa-solid fa-xmark"></i>
            </td>
            <td class="pl10 txtC">
              <span v-if="game.is_finished || this.live" class="txtC">
                {{ this.player2Bet }}
              </span>
              <input
                v-else
                type="text"
                class="textInput txtC w40"
                v-model="this.player2Bet"
                @keypress="this.isNumber($event)"
                @change="this.validateAndEmit()"
              />
            </td>
            <td style="padding-left: 10px">
              <i class="fa-solid fa-equals"></i>
            </td>
            <td class="w60 txtR">
              {{ this.player2BetResult }}
            </td>
          </tr>
          <tr>
            <td colspan="9">
              <hr />
            </td>
          </tr>
          <tr>
            <td class="smallText">
              <div v-if="this.live">
                <button
                  class="smSaveLabel"
                  v-if="this.live"
                  @click="$router.push('/')"
                >
                  view
                </button>
              </div>
              <div v-else>
                <button
                  type="submit"
                  class="smSaveLabel"
                  v-if="!this.game.is_finished && !this.live && !this.betsOff"
                >
                  save
                </button>
              </div>
            </td>
            <td class="smallText pl30 colWhite">
              <span v-if="this.live"
                ><i class="fa-solid fa-circle-play"></i> live match</span
              >
              <span v-else>{{ this.message }}</span>
            </td>
            <td colspan="4" class="txtR">
              <span class="smallText">coins available: </span>
              <span class="colWhite smallText">{{
                this.coinsAvailable.toFixed(2)
              }}</span>
            </td>
            <td colspan="3">&nbsp;</td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</template>

<style scoped="scoped">
table td {
  border: 0px solid white;
}

.betResult {
  padding-left: 20px;
  font-size: 30px;
  font-weight: 500;
}

.betResultPlus {
  padding-left: 20px;
  font-size: 30px;
  font-weight: 500;
  color: #3aaa35;
}

.betResultMinus {
  padding-left: 20px;
  font-size: 30px;
  font-weight: 500;
  color: #e30716;
}

h3 {
  display: inline;
  font-weight: 400;
}

input:disabled {
  background-color: #383838;
}

hr {
  height: 1px;
  border: none;
  color: #1e5b44;
  background-color: #1e5b44;
}

button {
  border: none;
}

.smallText {
  font-size: 13px;
}

.colWhite {
  color: white;
}

.smWhite {
  padding-left: 30px;
  color: white;
  font-size: 13px;
}

.savedMessage {
  animation: fadeOut 2s forwards;
  animation-delay: 1s;
  color: white;
  text-align: center;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.gameDivContainer {
  margin: 20px 50px 20px 20px;
}

.gameDiv {
  background-color: #22232c;
  padding: 20px;
  border-radius: 10px;
  min-height: 100px;
}

.gameDivLive {
  background-color: #333444;
  padding: 20px;
  border-radius: 10px;
  min-height: 100px;
}
</style>
