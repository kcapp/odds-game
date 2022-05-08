<script>
import axios from "axios";
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin },
  data() {
    return {
      currentUserId: null,
      coinsAvailable: 0,
      overBet: this.userBets ? this.userBets.bet_1 : 0,
      underBet: this.userBets ? this.userBets.bet_2 : 0,
      overBetOdds: 0,
      underBetOdds: 0,
      floatingDigits: 2,
      floatingOddsDigits: 3,
      betId: 0,
      messages: [],
      matchBetsSum: this.userBets
        ? this.userBets.bet_1 + this.userBets.bet_2
        : 0,
      live: false,
      message: "",
      enabledSave: true,
    };
  },
  props: [
    "futuresOutcomes",
    "marketNames",
    // ---
    "balance",
    "game",
    "players",
    "userBets",
    "tournamentId",
    "tournamentStarted",
    "tournamentFinished",
  ],
  computed: {
    overBetResult() {
      let b1 = this.userBets ? this.userBets.odds_1 : 0;
      return (this.overBet * b1).toFixed(this.floatingDigits);
    },
    underBetResult() {
      let b2 = this.userBets ? this.userBets.odds_2 : 0;
      return (this.underBet * b2).toFixed(this.floatingDigits);
    },
  },
  mounted() {
    this.resetBalance();

    this.betId = this.userBets ? this.userBets.outcome_id : 0;
    this.live = this.tournamentStarted;
    this.currentUserId = this.$store.state.auth.user.user_id;

    this.overBetOdds = this.userBets ? this.userBets.odds_1 : 0;
    this.underBetOdds = this.userBets ? this.userBets.odds_2 : 0;
  },
  methods: {
    getImmutableCoinsAvailable() {
      return (
        this.balance.start_coins -
        this.balance.tournament_coins_open -
        this.balance.tournament_coins_closed +
        this.balance.tournament_coins_won
      );
    },
    resetBalance() {
      this.coinsAvailable =
        this.balance.start_coins -
        this.balance.tournament_coins_open -
        this.balance.tournament_coins_closed +
        this.balance.tournament_coins_won;
    },
    getOutcomeId() {
      return this.outcome.id;
    },
    getBetCoinSum() {
      // OVER wins
      if (this.userBets.outcome > this.userBets.outcome_value) {
        if (this.overBetResult - this.matchBetsSum > 0) {
          return "+" + (this.overBetResult - this.matchBetsSum).toFixed(2);
        } else {
          return (this.overBetResult - this.matchBetsSum).toFixed(2);
        }
      }
      // UNDER wins
      if (this.userBets.outcome < this.userBets.outcome_value) {
        if (this.underBetResult - this.matchBetsSum > 0) {
          return "+" + (this.underBetResult - this.matchBetsSum).toFixed(2);
        } else {
          return (this.underBetResult - this.matchBetsSum).toFixed(2);
        }
      }
      if (this.userBets.outcome === this.userBets.outcome_value) {
        return (0).toFixed(2);
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
      if (this.overBet === undefined || this.overBet === "") {
        this.overBet = 0;
      }
      if (this.underBet === undefined || this.underBet === "") {
        this.underBet = 0;
      }

      // disable all others save buttons except the one on the bet you're editing
      this.$emit("disableOtherBetsSaving", this.outcome.id);

      // this is the most important part, all the save buttons are disabled except current one
      // is this an existing bet?
      if (this.betId) {
        let oldBetSum = parseInt(this.overBet) + parseInt(this.underBet);
        let newBetSum = this.userBets.bet_1 + this.userBets.bet_2;
        let balanceAfterBet =
          this.getImmutableCoinsAvailable() - oldBetSum + newBetSum;
        // check if we have enough coins
        if (balanceAfterBet < 0) {
          // if we do not, reset to db values and enable save buttons
          this.resetBet(this.userBets.bet_1, this.userBets.bet_2);
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      } else {
        // if this is not an existing bet in the db
        // check the balance, if we have enough coins (more than the value)
        let newBetSum = parseInt(this.overBet) + parseInt(this.underBet);
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
      this.overBet = bet1;
      this.underBet = bet2;
      this.resetBalance();
      this.$emit("enableBetSaving", this.outcome.id);
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
    betHasOutcome() {
      if (this.userBets !== undefined && this.userBets.outcome !== null) {
        return true;
      }
      return false;
    },
    postTournamentBet() {
      const json = JSON.stringify({
        id: this.betId, // same as outcome_id for existing bets
        user_id: this.$store.state.auth.user.user_id,
        tournament_id: parseInt(this.tournamentId),
        outcome_id: parseInt(this.outcome.id),
        bet_1: parseInt(this.overBet),
        bet_x: 0,
        bet_2: parseInt(this.underBet),
      });
      axios
        .post(
          import.meta.env.VITE_ODDS_API_PROXY_STRING +
            "/tournamentbets/" +
            this.outcome.id,
          json
        )
        .then((res) => {
          this.betId = res.data;
          this.message = "saved";
          setTimeout(this.setBetMessage, 2000, "bet placed");
          // enable all save buttons
          this.$emit("enableBetSaving", this.outcome.id);

          // TODO - set bet odds for specific game
          this.$emit("resetBets");
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
  <div class="gameDiv">
    <form @submit.prevent="postTournamentBet()">
      <table class="txtL betTable">
        <tr>
          <td class="smGreenHeader marketNameLabel">
            {{ this.marketNames[this.futuresOutcomes.id] }}
          </td>
          <td class="smGreenHeader txtC" style="width: 120px">type</td>
          <td class="txtC smallText smGreenHeader">odds</td>
          <td>&nbsp;</td>
          <td class="smGreenHeader txtC">your bet</td>
          <td colspan="3">&nbsp;</td>
        </tr>
        <tr>
          <td rowspan="2" class="vMiddle txtC marketValueFont">
            {{ this.futuresOutcomes }}
            <select></select>
          </td>
          <td class="txtC">over</td>
          <td style="width: 80px" class="txtC">
            <slot name="oddsOver" />
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="this.tournamentStarted || this.betHasOutcome()"
              class="txtC"
            >
              {{ this.overBet }}
            </span>
            <input
              v-else
              :disabled="!this.enabledSave"
              type="text"
              class="textInput txtC w40"
              v-model="this.overBet"
              @keypress="this.isNumber($event)"
              @change="this.validateAndEmit()"
            />
          </td>
          <td style="padding-left: 10px">
            <i class="fa-solid fa-equals"></i>
          </td>
          <td class="w60 txtR">
            {{ this.overBetResult }}
          </td>
          <td rowspan="2" class="vMiddle">
            <span
              v-if="
                this.matchBetsSum > 0 &&
                (this.betHasOutcome() || tournamentFinished)
              "
              ><span
                :class="{
                  betResultPlus: parseInt(this.getBetCoinSum()) > 0,
                  betResultMinus: parseInt(this.getBetCoinSum()) < 0,
                  betResult: parseInt(this.getBetCoinSum()) === 0,
                }"
              >
                {{ this.getBetCoinSum() }}</span
              >
              <span><TheCoin /></span
            ></span>
          </td>
        </tr>
        <tr>
          <td class="txtC">under</td>
          <td class="txtC">
            <slot name="oddsUnder" />
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="this.tournamentStarted || this.betHasOutcome()"
              class="txtC"
            >
              {{ this.underBet }}
            </span>
            <input
              v-else
              :disabled="!this.enabledSave"
              type="text"
              class="textInput txtC w40"
              v-model="this.underBet"
              @keypress="this.isNumber($event)"
              @change="this.validateAndEmit()"
            />
          </td>
          <td class="pl10">
            <i class="fa-solid fa-equals"></i>
          </td>
          <td class="w60 txtR">
            {{ this.underBetResult }}
          </td>
        </tr>
        <tr>
          <td colspan="10">
            <hr />
          </td>
        </tr>
        <tr>
          <td class="smallText">
            <div v-if="this.tournamentFinished || this.betHasOutcome()">
              <span class="pl10"
                >final value:
                <span class="greenOCLabel">
                  {{ this.userBets.outcome }}
                </span>
              </span>
            </div>
            <div v-else>
              <button
                :disabled="!this.enabledSave"
                type="submit"
                class="smSaveLabel"
                v-if="!this.tournamentFinished && !this.tournamentStarted"
              >
                save
              </button>
            </div>
          </td>
          <td class="smallText pl30 colWhite">
            <span>{{ this.message }}</span>
          </td>
          <td colspan="3" class="txtR">
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
</template>

<style>
.betTable {
  min-width: 600px;
}
.betTable td {
  border: 0px solid white;
}
.marketNameLabel {
  background-color: #333545;
  color: white;
  border-radius: 6px;
  padding: 0px 10px;
  width: 161px;
  text-align: center;
}
.marketValueFont {
  font-size: 35px;
  color: white;
}
</style>
