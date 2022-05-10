<script>
import axios from "axios";
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin },
  data() {
    return {
      currentUserId: null,
      coinsAvailable: 0,
      singleBet: 0,
      singleBetResult: 0,
      betOdds: 0,
      floatingDigits: 2,
      floatingOddsDigits: 3,
      betId: 0,
      betOutcomeId: 0,
      messages: [],
      matchBetsSum: this.userBets
        ? this.userBets.bet_1 + this.userBets.bet_2
        : 0,
      live: false,
      message: "",
      enabledSave: true,
      selectedKey: null,
    };
  },
  props: [
    "outcomeMarketId",
    "outcomes",
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
    betResult() {
      this.userBets.forEach((item) => {
        if (this.outcomeMarketId === item.market_id) {
          this.betId = item.id;
        }
      });

      return (this.singleBet * this.betOdds).toFixed(this.floatingDigits);
    },
  },
  mounted() {
    this.resetBalance();

    if (this.userBets.filter(Boolean).length === 0) {
      this.betId = 0;
      this.betOdds = 0;
    } else {
      this.userBets.forEach((item) => {
        if (this.outcomeMarketId === item.market_id) {
          this.betId = item.id;
          this.betOutcomeId = item.outcome_id;
          this.betOdds = item.odds_x;
          this.singleBet = item.bet_x;
          this.singleBetResult = (this.singleBet * this.betOdds).toFixed(
            this.floatingDigits
          );
        }
      });
    }

    this.live = this.tournamentStarted;
    this.currentUserId = this.$store.state.auth.user.user_id;
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
      return this.betId;
    },
    getOutcomeMarketId() {
      return this.outcomeMarketId;
    },
    getBetCoinSum() {
      // OVER wins
      if (this.userBets.outcome > this.userBets.outcome_value) {
        if (this.singleBetResult - this.matchBetsSum > 0) {
          return "+" + (this.singleBetResult - this.matchBetsSum).toFixed(2);
        } else {
          return (this.singleBetResult - this.matchBetsSum).toFixed(2);
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
      if (this.singleBet === undefined || this.singleBet === "") {
        this.singleBet = 0;
      }

      // if there is no user bet with given bet id, the bet id was removed, and it's 0
      if (this.userBets[this.betId] === undefined) {
        this.betId = 0;
      }

      // disable all others save buttons except the one on the bet you're editing
      this.$emit("disableBetsSavingForFutures", this.outcomeMarketId);

      // this is the most important part, all the save buttons are disabled except current one
      // is this an existing bet?
      if (this.betId) {
        let oldBetSum = parseInt(this.singleBet);
        let newBetSum = this.userBets[this.betId].bet_x;

        let balanceAfterBet =
          this.getImmutableCoinsAvailable() - oldBetSum + newBetSum;
        // check if we have enough coins
        if (balanceAfterBet < 0) {
          // if we do not, reset to db values and enable save buttons
          this.resetBet(this.userBets[this.betId].bet_x);
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      } else {
        // this is a new bet, update odds value
        if (this.betOutcomeId) {
          this.betOdds = this.outcomes[this.betOutcomeId].odds_x;
        } else {
          // new bet and no outcome selected? reset the bet and message to pick
          this.message = "choose outcome";
          // empty new bet, reset
          this.resetBet(0);
          return;
        }

        // if this is not an existing bet in the db
        // check the balance, if we have enough coins (more than the value)
        let newBetSum = parseInt(this.singleBet);
        if (newBetSum === 0) {
          this.message = "insert bet";
          // empty new bet, reset
          this.resetBet(0);
        }
        let balanceAfterBet = this.getImmutableCoinsAvailable() - newBetSum;
        if (balanceAfterBet < 0) {
          // if we do not, reset to 0 and enable save buttons
          this.resetBet(0);
        } else {
          // if we have enough coins, display balance - value and wait for save
          this.coinsAvailable = balanceAfterBet;
        }
      }
    },
    resetBet(bet) {
      this.singleBet = bet;
      this.resetBalance();
      this.$emit("enableBetSaving", this.betId);
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
      return !!(
        this.userBets !== undefined &&
        this.userBets[this.outcomeMarketId] &&
        this.userBets[this.outcomeMarketId].outcome !== null
      );
    },
    updateOdds() {
      this.validateAndEmit();
    },
    postTournamentBet() {
      const json = JSON.stringify({
        id: this.betId, // same as outcome_id for existing bets
        user_id: this.$store.state.auth.user.user_id,
        tournament_id: parseInt(this.tournamentId),
        outcome_id: parseInt(this.betOutcomeId),
        bet_x: parseInt(this.singleBet),
        bet_1: 0,
        bet_2: 0,
      });
      axios
        .post(
          import.meta.env.VITE_ODDS_API_PROXY_STRING +
            "/tournamentbets/" +
            this.betId,
          json
        )
        .then((res) => {
          this.betId = res.data;
          this.message = "saved";
          // enable all save buttons
          this.$emit("enableBetSaving", this.betId);

          if (res.data === 0) {
            // row was deleted, reset outcome id, so we get clear select dropdown
            this.betId = 0;
            this.betOutcomeId = 0;
            this.betOdds = 0;
            this.message = "removed";
          }

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
            {{ this.marketNames[this.outcomeMarketId] }}
          </td>
          <td class="txtC smallText smGreenHeader" style="width: 100px">
            odds
          </td>
          <td>&nbsp;</td>
          <td class="smGreenHeader txtC">your bet</td>
          <td colspan="3">&nbsp;</td>
        </tr>
        <tr>
          <td class="vMiddle txtC marketValueFont">
            <select
              style="display: table"
              class="textInput selectName"
              @change="updateOdds()"
              v-model="this.betOutcomeId"
            >
              <option disabled selected value="">Please select one</option>
              <template v-for="(oc, index) in this.outcomes.filter(Boolean)">
                <option :value="oc.id" v-bind:key="oc.id" v-if="oc">
                  {{ oc.player_name }} (odds: {{ oc.odds_x }})
                </option>
              </template>
            </select>
          </td>
          <td class="txtC">{{ this.betOdds }}</td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="txtC">
            <span
              v-if="this.tournamentStarted || this.betHasOutcome()"
              class="txtC"
            >
              {{ this.singleBet }}
            </span>
            <input
              v-else
              :disabled="!this.enabledSave"
              type="text"
              class="textInput txtC w40"
              v-model="this.singleBet"
              @keypress="this.isNumber($event)"
              @change="this.validateAndEmit()"
            />
          </td>
          <td style="padding-left: 10px">
            <i class="fa-solid fa-equals"></i>
          </td>
          <td class="w60 txtR">
            {{ this.betResult }}
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
          <td colspan="7">
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
          <td colspan="5" class="txtR">
            <div v-if="this.enabledSave">
              <span class="smallText">coins available: </span>
              <span class="colWhite smallText">{{
                this.coinsAvailable ? this.coinsAvailable.toFixed(2) : 0
              }}</span>
            </div>
          </td>
        </tr>
      </table>
    </form>
  </div>
</template>

<style>
.selectName {
  background-color: #22232c;
}
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
