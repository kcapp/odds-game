<script>
import axios from "axios";
import TheBoardIcon from "@/components/TheBoardIcon.vue";
import TheCoin from "@/components/TheCoin.vue";
//import TheTooltip from "@/components/TheTooltip.vue";
import TheOddsDiffLabel from "@/components/TheOddsDiffLabel.vue";
import TheInitials from "@/components/TheInitials.vue";
export default {
  components: {
    TheInitials,
    TheOddsDiffLabel,
    TheCoin,
    TheBoardIcon,
  },
  data() {
    return {
      currentUserId: null,
      coinsAvailable: 0,
      player1Bet: this.gameBets
        ? this.players[0] === this.gameBets.player_1
          ? this.gameBets.bet_1
          : this.gameBets.bet_2
        : 0,
      player2Bet: this.gameBets
        ? this.players[0] === this.gameBets.player_1
          ? this.gameBets.bet_2
          : this.gameBets.bet_1
        : 0,
      drawBet: this.gameBets && this.gameBets.bet_x ? this.gameBets.bet_x : 0,
      player1CurrentOdds: 0,
      player2CurrentOdds: 0,
      drawCurrentOdds: 0,
      player1BetOdds: 0,
      player2BetOdds: 0,
      drawBetOdds: 0,
      floatingDigits: 2,
      floatingOddsDigits: 3,
      betId: 0,
      messages: [],
      matchBetsSum: this.gameBets
        ? this.gameBets.bet_1 + this.gameBets.bet_2 + this.gameBets.bet_x
        : 0,
      live: false,
      message: "",
      betsOff: 0,
      enabledSave: true,
      gameDate: null,
      gameTime: null,
    };
  },
  props: [
    "balance",
    "game",
    "players",
    "gameBets",
    "tournamentId",
    "gameMeta",
    "tournamentFinished",
    "p1Initials",
    "p2Initials",
    "result",
  ],
  computed: {
    player1BetResult() {
      let b1 = this.gameBets
        ? this.gameBets.player_1 === this.players[0]
          ? this.gameBets.odds_1
          : this.gameBets.odds_2
        : this.game.player_odds[this.game.players[0]];
      return (this.player1Bet * b1).toFixed(this.floatingDigits);
    },
    player2BetResult() {
      let b2 = this.gameBets
        ? this.gameBets.player_2 === this.players[1]
          ? this.gameBets.odds_2
          : this.gameBets.odds_1
        : this.game.player_odds[this.game.players[1]];
      return (this.player2Bet * b2).toFixed(this.floatingDigits);
    },
    drawBetResult() {
      let bx = this.gameBets ? this.gameBets.odds_x : this.game.player_odds[0];
      return (this.drawBet * bx).toFixed(this.floatingDigits);
    },
    isPlayersDecided() {
      return this.game.is_players_decided ? this.game.is_players_decided : true;
    },
    currentUser() {
      if (this.$store.state.auth.user) {
        return JSON.parse(localStorage.getItem("user"));
      }
      return {};
    },
  },
  updated() {
    const hash = this.$route.hash;
    if (hash) {
      let matchId = hash.substring(1, hash.length);
      document.getElementById(`form-match-${matchId}`).scrollIntoView();
    }
  },
  mounted() {
    this.resetBalance();

    this.betId = this.gameBets ? this.gameBets.id : 0;
    this.betsOff = this.gameMeta ? this.gameMeta.bets_off : 0;
    this.live = this.game.is_started && !this.game.is_finished;
    this.currentUserId = this.$store.state.auth.user.user_id;

    this.gameDate = new Date(this.game.created_at).toLocaleDateString("en-ca");
    this.gameTime = new Date(this.game.created_at).toLocaleTimeString("en-gb", {
      hour: "2-digit",
      minute: "2-digit",
    });

    this.player1CurrentOdds = this.game.player_odds[this.players[0]];
    this.player2CurrentOdds = this.game.player_odds[this.players[1]];

    this.drawCurrentOdds = this.game.player_odds[0];
    this.player1BetOdds = this.gameBets
      ? this.gameBets.odds_1
      : this.player1CurrentOdds;
    this.player2BetOdds = this.gameBets
      ? this.gameBets.odds_2
      : this.player2CurrentOdds;

    this.drawBetOdds = this.gameBets
      ? this.gameBets.odds_x
      : this.drawCurrentOdds;
  },
  methods: {
    getP1OddsDiff() {
      return (this.player1CurrentOdds - this.player1BetOdds).toFixed(
        this.floatingOddsDigits
      );
    },
    getP2OddsDiff() {
      return (this.player2CurrentOdds - this.player2BetOdds).toFixed(
        this.floatingOddsDigits
      );
    },
    getDrawOddsDiff() {
      return (this.drawCurrentOdds - this.drawBetOdds).toFixed(
        this.floatingOddsDigits
      );
    },
    isP1OddsChanged() {
      return this.player1CurrentOdds !== this.player1BetOdds;
    },
    isP2OddsChanged() {
      return this.player2CurrentOdds !== this.player2BetOdds;
    },
    isDrawOddsChanged() {
      return this.drawCurrentOdds !== this.drawBetOdds;
    },
    isOddsChanged() {
      return true;
    },
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
      if (this.game.winner_id === null) {
        //return (-1 * this.matchBetsSum).toFixed(2);
        if (this.drawBetResult - this.matchBetsSum > 0) {
          return "+" + (this.drawBetResult - this.matchBetsSum).toFixed(2);
        } else {
          return (this.drawBetResult - this.matchBetsSum).toFixed(2);
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
      if (
        this.player1Bet === undefined ||
        this.player1Bet === "" ||
        this.player1Bet < 0
      ) {
        this.player1Bet = 0;
      }
      if (
        this.player2Bet === undefined ||
        this.player2Bet === "" ||
        this.player2Bet < 0
      ) {
        this.player2Bet = 0;
      }
      if (
        this.drawBet === undefined ||
        this.drawBet === "" ||
        this.drawBet < 0
      ) {
        this.drawBet = 0;
      }

      // disable all others save buttons except the one on the bet you're editing
      this.$emit("disableOtherBetsSaving", this.game.id);

      // this is the most important part, all the save buttons are disabled except current one
      // is this an existing bet?
      if (this.betId) {
        let oldBetSum =
          parseInt(this.player1Bet) +
          parseInt(this.player2Bet) +
          parseInt(this.drawBet);
        let newBetSum =
          this.gameBets.bet_1 + this.gameBets.bet_2 + this.gameBets.bet_x;
        let balanceAfterBet =
          this.getImmutableCoinsAvailable() - oldBetSum + newBetSum;
        // check if we have enough coins
        if (balanceAfterBet < 0) {
          // if we do not, reset to db values and enable save buttons
          this.resetBet(
            this.gameBets.bet_1,
            this.gameBets.bet_2,
            this.gameBets.bet_x
          );
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      } else {
        // if this is not an existing bet in the db
        // check the balance, if we have enough coins (more than the value)
        let newBetSum =
          parseInt(this.player1Bet) +
          parseInt(this.player2Bet) +
          parseInt(this.drawBet);
        if (newBetSum === 0) {
          // empty new bet, reset
          this.resetBet(0, 0, 0);
        }
        let balanceAfterBet = this.getImmutableCoinsAvailable() - newBetSum;
        if (balanceAfterBet < 0) {
          // if we do not, reset to 0 and enable save buttons
          this.resetBet(0, 0, 0);
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      }
    },
    resetBet(bet1, bet2, betX) {
      this.player1Bet = bet1;
      this.player2Bet = bet2;
      this.drawBet = betX;
      this.resetBalance();
      this.$emit("enableBetSaving", this.game.id);
    },
    reloadBalance() {
      axios
        .get(
          import.meta.env.VITE_ODDS_API_PROXY_STRING +
            "/user/" +
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
        bet_x: parseInt(this.drawBet),
        bet_2: parseInt(this.player2Bet),
        odds_1: parseFloat(
          this.game.player_odds[[this.game.players[0]]].toFixed(3)
        ),
        odds_x: this.game.player_odds[0]
          ? parseFloat(this.game.player_odds[0].toFixed(3))
          : null,
        odds_2: parseFloat(
          this.game.player_odds[[this.game.players[1]]].toFixed(3)
        ),
        token: this.currentUser.token,
      });
      axios
        .post(
          import.meta.env.VITE_ODDS_API_PROXY_STRING + "/bets/" + this.game.id,
          json
        )
        .then((res) => {
          this.betId = res.data;
          this.message = "saved";
          setTimeout(this.setBetMessage, 2000, "bets placed");
          // enable all save buttons
          this.$emit("enableBetSaving", this.game.id);

          this.player1BetOdds = this.player1CurrentOdds;
          this.player2BetOdds = this.player2CurrentOdds;
          this.drawBetOdds = this.drawCurrentOdds;
          // TODO - set bet odds for specific game
          this.$emit("resetGameBets");
        })
        .catch((error) => {
          console.log(error.message);
        })
        .finally(() => {
          this.reloadBalance();
        });
    },
    getGameWinnerInitials(game) {
      if (game.winner_id === this.players[0]) {
        return this.p1Initials;
      }
      if (game.winner_id === this.players[1]) {
        return this.p2Initials;
      }
      return "";
    },
  },
};
</script>

<template>
  <div
    :class="{ gameDivLive: this.live, gameDiv: !this.live }"
    v-bind:id="`form-match-${this.game.id}`"
  >
    <form @submit.prevent="postBet()">
      <table class="txtL">
        <tr>
          <td colspan="3" class="smGreenHeader" v-if="game.is_finished">
            finished
          </td>
          <td colspan="3" class="smGreenHeader" v-else>
            scheduled:
            {{ this.gameDate }} {{ this.gameTime }}
          </td>
          <td class="smGreenHeader">win prob.</td>
          <td class="smGreenHeader txtC">
            odds
            <span
              v-if="isOddsChanged() && !this.game.is_finished && !this.live"
            >
            </span>
          </td>
          <td class="smallText">&nbsp;</td>
          <td class="pl10 smallText smGreenHeader">your bet</td>
          <td colspan="2">&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr
          :class="{
            vBottom: this.isOddsChanged,
            vMiddle: !this.isOddsChanged,
          }"
        >
          <td rowspan="3" class="vMiddle">
            <div
              class="icon"
              v-if="game.is_finished && game.winner_id === null"
            >
              <i class="fa-solid fa-equals"></i>
            </div>
            <TheInitials
              v-else-if="game.is_finished"
              :initials="getGameWinnerInitials(game)"
            />
            <div class="icon" v-else-if="game.is_walkover">
              <i class="fa-solid fa-flag"></i>
            </div>
            <TheBoardIcon v-else />
          </td>
          <td class="txtC scoreTd">
            <template v-if="this.result.is_finished">
              <span v-if="this.result.home_player_id === players[0]">
                {{ this.result.home_score }}</span
              >
              <span v-else> {{ this.result.away_score }}</span>
            </template>
          </td>
          <td style="min-width: 200px">
            <h3 :class="{ winnerColor: game.winner_id === players[0] }">
              <slot name="playerOneName" />
            </h3>
          </td>
          <td style="width: 80px">
            <slot name="probsPlayerOne" />
          </td>
          <td style="width: 120px" class="txtC">
            <slot name="oddsPlayerOne" />
            <span
              class="colWhite font11"
              v-if="isP1OddsChanged() && !this.game.is_finished && !this.live"
              ><br />
              <TheOddsDiffLabel :oddsValue="getP1OddsDiff()" class="mr5" />
              {{ player1CurrentOdds.toFixed(this.floatingOddsDigits) }}
            </span>
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="game.is_finished || this.tournamentFinished || this.betsOff"
              class="txtC"
            >
              {{ this.player1Bet }}
            </span>
            <input
              v-else
              :disabled="
                !this.enabledSave || this.currentUserId === this.players[1]
              "
              type="number"
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
            <span
              class="colWhite font11"
              v-if="isP1OddsChanged() && !this.game.is_finished && !this.live"
              ><br />
              {{
                (player1CurrentOdds * this.player1Bet).toFixed(
                  this.floatingDigits
                )
              }}
            </span>
          </td>
          <td rowspan="3" class="vMiddle">
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
        <tr v-if="this.game.player_winning_probabilities[0]">
          <td>&nbsp;</td>
          <td>
            <h3
              :class="{
                winnerColor: game.is_finished && game.winner_id === null,
              }"
            >
              draw
            </h3>
          </td>
          <td style="width: 80px">
            <slot name="probsDraw" />
          </td>
          <td style="width: 120px" class="txtC">
            <slot name="oddsDraw" />
            <span
              class="colWhite font11"
              v-if="isDrawOddsChanged() && !this.game.is_finished && !this.live"
              ><br />
              <TheOddsDiffLabel :oddsValue="getDrawOddsDiff()" class="mr5" />
              {{ drawCurrentOdds.toFixed(this.floatingOddsDigits) }}
            </span>
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="game.is_finished || this.tournamentFinished || this.betsOff"
              class="txtC"
            >
              {{ this.drawBet }}
            </span>
            <input
              v-else
              :disabled="
                !this.enabledSave ||
                this.currentUserId === this.players[0] ||
                this.currentUserId === this.players[1]
              "
              type="number"
              class="textInput txtC w40"
              v-model="this.drawBet"
              @keypress="this.isNumber($event)"
              @change="this.validateAndEmit()"
            />
          </td>
          <td style="padding-left: 10px">
            <i class="fa-solid fa-equals"></i>
          </td>
          <td class="w60 txtR">
            {{ this.drawBetResult }}
            <span
              class="colWhite font11"
              v-if="isDrawOddsChanged() && !this.game.is_finished && !this.live"
              ><br />
              {{
                (drawCurrentOdds * this.drawBet).toFixed(this.floatingDigits)
              }}
            </span>
          </td>
        </tr>
        <tr
          :class="{
            vTop: this.isOddsChanged,
            vMiddle: !this.isOddsChanged,
          }"
        >
          <td class="txtC scoreTd">
            <template v-if="this.result.is_finished">
              <span v-if="this.result.home_player_id === players[1]">
                {{ this.result.home_score }}</span
              >
              <span v-else> {{ this.result.away_score }}</span>
            </template>
          </td>
          <td>
            <h3 :class="{ winnerColor: game.winner_id === players[1] }">
              <slot name="playerTwoName" />
            </h3>
          </td>
          <td>
            <slot name="probsPlayerTwo" />
          </td>
          <td class="txtC">
            <slot name="oddsPlayerTwo" />
            <span
              class="colWhite font11"
              v-if="isP2OddsChanged() && !this.game.is_finished && !this.live"
              ><br />
              <TheOddsDiffLabel :oddsValue="getP2OddsDiff()" class="mr5" />
              {{ player2CurrentOdds.toFixed(this.floatingOddsDigits) }}
            </span>
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="game.is_finished || this.tournamentFinished || this.betsOff"
              class="txtC"
            >
              {{ this.player2Bet }}
            </span>
            <input
              v-else
              :disabled="
                !this.enabledSave || this.currentUserId === this.players[0]
              "
              type="number"
              class="textInput txtC w40"
              v-model="this.player2Bet"
              @keypress="this.isNumber($event)"
              @change="this.validateAndEmit()"
            />
          </td>
          <td class="pl10">
            <i class="fa-solid fa-equals"></i>
          </td>
          <td class="w60 txtR">
            {{ this.player2BetResult }}
            <span
              class="colWhite font11"
              v-if="isP2OddsChanged() && !this.game.is_finished && !this.live"
              ><br />
              {{
                (player2CurrentOdds * this.player2Bet).toFixed(
                  this.floatingDigits
                )
              }}
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="10">
            <hr />
          </td>
        </tr>
        <tr>
          <td class="smallText">
            <div v-if="!this.game.is_finished && !this.tournamentFinished">
              <button
                :disabled="!this.enabledSave"
                type="submit"
                class="smSaveLabel"
                v-if="
                  !this.game.is_finished &&
                  !this.betsOff &&
                  !this.tournamentFinished
                "
              >
                save
              </button>
            </div>
          </td>
          <td class="smallText pl30 colWhite" colspan="2">
            <span v-if="this.live">live match</span>
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
          <td></td>
          <td class="txtR">
            <button
              class="smViewLabel"
              @click="
                $router.push({
                  name: 'game',
                  params: { id: this.game.id },
                })
              "
            >
              view
            </button>
          </td>
          <td></td>
        </tr>
      </table>
    </form>
  </div>
</template>

<style scoped="scoped">
table td {
  border: 0px solid white;
}

h3 {
  display: inline;
  font-weight: 400;
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

.scoreTd {
  min-width: 40px;
  font-size: 17px;
  color: #00bd7e;
}

.scoreTd span {
  background-color: #333445;
  padding: 3px 5px;
  border-radius: 5px;
  color: white;
}
</style>
