<script>
import axios from "axios";
import TheBoardIcon from "@/components/TheBoardIcon.vue";
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin, TheBoardIcon },
  data() {
    return {
      currentUserId: null,
      coinsAvailable: 0,
      player1Bet: this.gameBets ? this.gameBets.bet_1 : 0,
      player2Bet: this.gameBets ? this.gameBets.bet_2 : 0,
      player1CurrentOdds: 0,
      player2CurrentOdds: 0,
      player1BetOdds: 0,
      player2BetOdds: 0,
      floatingDigits: 2,
      betId: 0,
      messages: [],
      matchBetsSum: this.gameBets
        ? this.gameBets.bet_1 + this.gameBets.bet_2
        : 0,
      live: false,
      message: "",
      betsOff: 0,
      enabledSave: true,
      gameDate: null,
      gameTime: null,
    };
  },
  props: ["balance", "game", "players", "gameBets", "tournamentId", "gameMeta"],
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
    this.coinsAvailable =
      this.balance.start_coins -
      this.balance.coins_bets_open -
      this.balance.coins_bets_closed +
      this.balance.coins_won;

    this.betId = this.gameBets ? this.gameBets.id : 0;
    this.betsOff = this.gameMeta ? this.gameMeta.bets_off : 0;
    this.live = this.game.is_started && !this.game.is_finished;
    this.currentUserId = this.$store.state.auth.user.user_id;

    this.gameDate = new Date(this.game.created_at).toLocaleDateString("en-gb");
    this.gameTime = new Date(this.game.created_at).toLocaleTimeString("en-gb", {
      hour: "2-digit",
      minute: "2-digit",
    });

    this.player1CurrentOdds = this.game.player_odds[this.players[0]];
    this.player2CurrentOdds = this.game.player_odds[this.players[1]];
    this.player1BetOdds = this.gameBets
      ? this.gameBets.odds_1
      : this.player1CurrentOdds;
    this.player2BetOdds = this.gameBets
      ? this.gameBets.odds_2
      : this.player2CurrentOdds;
  },
  methods: {
    getImmutableCoinsAvailable() {
      return (
        this.balance.start_coins -
        this.balance.coins_bets_open -
        this.balance.coins_bets_closed +
        this.balance.coins_won
      );
    },
    resetBalance() {
      this.coinsAvailable =
        this.balance.start_coins -
        this.balance.coins_bets_open -
        this.balance.coins_bets_closed +
        this.balance.coins_won;
    },
    getGameId() {
      return this.game.id;
    },
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
      if (this.player1Bet === undefined || this.player1Bet === "") {
        this.player1Bet = 0;
      }
      if (this.player2Bet === undefined || this.player2Bet === "") {
        this.player2Bet = 0;
      }

      // disable all others save buttons except the one on the bet you're editing
      this.$emit("handleBetSaving", this.game.id);

      // this is the most important part, all the save buttons are disabled except current one
      // is this an existing bet?
      if (this.betId) {
        let oldBetSum = parseInt(this.player1Bet) + parseInt(this.player2Bet);
        let newBetSum = this.gameBets.bet_1 + this.gameBets.bet_2;
        let balanceAfterBet =
          this.getImmutableCoinsAvailable() - oldBetSum + newBetSum;
        // check if we have enough coins
        if (balanceAfterBet < 0) {
          // if we do not, reset to db values and enable save buttons
          this.resetBet(this.gameBets.bet_1, this.gameBets.bet_2);
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      } else {
        // if this is not an existing bet in the db
        // check the balance, if we have enough coins (more than the value)
        let newBetSum = parseInt(this.player1Bet) + parseInt(this.player2Bet);
        if (newBetSum === 0) {
          // empty new bet, reset
          this.resetBet(0, 0);
        }
        let balanceAfterBet = this.getImmutableCoinsAvailable() - newBetSum;
        if (balanceAfterBet < 0) {
          // if we do not, reset to 0 and enable save buttons
          this.resetBet(0, 0);
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      }
    },
    resetBet(bet1, bet2) {
      this.player1Bet = bet1;
      this.player2Bet = bet2;
      this.resetBalance();
      this.$emit("enableBetSaving", this.game.id);
    },
    reloadBalance() {
      axios
        .get(
          "/api/user/" +
            this.$store.state.auth.user.user_id +
            "/tournament/" +
            this.tournamentId +
            "/balance"
        )
        .then((balance) => {
          this.$emit("reloadBalance", balance.data);
        })
        .catch((error) => {
          console.log("Error reloading balance " + error);
        });
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
          // enable all save buttons
          this.$emit("enableBetSaving", this.game.id);
          // reset available coins for all games
        })
        .catch((error) => {
          console.log(error.message);
        })
        .finally(() => {
          this.reloadBalance();
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
              scheduled:
              {{ this.gameDate }} {{ this.gameTime }}
            </td>
            <td class="smGreenHeader">win prob.</td>
            <td class="smGreenHeader txtC">odds</td>
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
            <td style="width: 90px" class="txtC">
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
                :disabled="
                  !this.enabledSave || this.currentUserId === this.players[1]
                "
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
            <td class="txtC">
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
                :disabled="
                  !this.enabledSave || this.currentUserId === this.players[0]
                "
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
                  @click="
                    $router.push({
                      name: 'game',
                      params: { id: this.game.id },
                    })
                  "
                >
                  view
                </button>
              </div>
              <div v-else>
                <button
                  :disabled="!this.enabledSave"
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
              <div v-if="this.enabledSave">
                <span class="smallText">coins available: </span>
                <span class="colWhite smallText">{{
                  this.coinsAvailable ? this.coinsAvailable.toFixed(2) : 0
                }}</span>
              </div>
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

button:disabled {
  background-color: #4a4b52b0;
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
</style>
