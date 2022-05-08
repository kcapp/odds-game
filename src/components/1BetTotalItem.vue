<template>
  <div class="gameDiv">
    <form @submit.prevent="postBet()">
      <table class="txtL betTable">
        <tr>
          <td class="smGreenHeader marketNameLabel">
            {{ this.bet.getMarketName() }}
          </td>
          <td class="smGreenHeader txtC">type</td>
          <td class="smGreenHeader txtC">odds</td>
          <td class="smallText">&nbsp;</td>
          <td class="pl10 smallText smGreenHeader">your bet</td>
          <td colspan="2">&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td rowspan="2" class="vMiddle txtC marketValueFont">
            {{ this.bet.getOutcomeValue() }}
          </td>
          <td style="width: 80px" class="txtC">over</td>
          <td style="width: 50px" class="txtC">
            {{ this.bet.getOdds1() }}
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span v-if="this.tournamentStarted" class="txtC">
              {{ this.player1Bet }}
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
          <td class="pl10">
            <i class="fa-solid fa-equals"></i>
          </td>
          <td class="w60 txtR">0</td>
          <td rowspan="2" class="vMiddle">
            <span v-if="this.tournamentFinished && this.outcomeBetsSum > 0"
              ><span> {{ this.getBetCoinSum() }}</span> <span><TheCoin /></span
            ></span>
          </td>
        </tr>
        <tr>
          <td class="txtC">under</td>
          <td class="txtC">
            {{ this.bet.getOdds1() }}
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span v-if="this.tournamentStarted" class="txtC">
              {{ this.player2Bet }}
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
          <td class="w60 txtR">0</td>
        </tr>
        <tr>
          <td colspan="8">1</td>
        </tr>
      </table>
    </form>
  </div>
</template>

<template>
  <div :class="{ gameDivLive: this.live, gameDiv: !this.live }">
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
              <TheTooltip
                text="Odds for this match have changed (new odds below).
                  If you choose to use new odds, adjust your bet and click save button.
                  Both odds are updated."
              >
                <i class="fa-solid fa-circle-info"></i></TheTooltip
              ></span>
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
          <td rowspan="2" class="vMiddle">
            <div class="icon" v-if="game.is_finished">
              <i class="fa-solid fa-flag-checkered"></i>
            </div>
            <div class="icon" v-else-if="game.is_walkover">
              <i class="fa-solid fa-flag"></i>
            </div>
            <TheBoardIcon v-else />
          </td>
          <td class="txtC">
            <span></span>
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
              {{ player1CurrentOdds }}
            </span>
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="game.is_finished || this.live || this.tournamentFinished"
              class="txtC"
            >
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
          <td rowspan="2" class="vMiddle">
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
        <tr
          :class="{
            vTop: this.isOddsChanged,
            vMiddle: !this.isOddsChanged,
          }"
        >
          <td class="txtC">
            <span></span>
          </td>
          <td>
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
            <span
              class="colWhite font11"
              v-if="isP2OddsChanged() && !this.game.is_finished && !this.live"
            ><br />
              <TheOddsDiffLabel :oddsValue="getP2OddsDiff()" class="mr5" />
              {{ player2CurrentOdds }}
            </span>
          </td>
          <td class="txtC">
            <i class="fa-solid fa-xmark"></i>
          </td>
          <td class="pl10 txtC">
            <span
              v-if="game.is_finished || this.live || this.tournamentFinished"
              class="txtC"
            >
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
            <div
              v-if="
                this.live || this.game.is_finished || this.tournamentFinished
              "
            >
              <button
                class="smSaveLabel"
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
                v-if="
                  !this.game.is_finished &&
                  !this.live &&
                  !this.betsOff &&
                  !this.tournamentFinished
                "
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
          <td colspan="5" class="txtR">
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

<script>
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin },
  props: ["bet", "outcomeBets"],
  methods: {
    isNumber: function (evt) {
      evt = evt ? evt : window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
  },
  computed: {
    player1BetResult() {
      let b1 = this.outcomeBets
        ? this.outcomeBets.odds_1
        : this.game.player_odds[[this.game.players[0]]];
      return (this.player1Bet * b1).toFixed(this.floatingDigits);
    },
    player2BetResult() {
      let b2 = this.outcomeBets
        ? this.outcomeBets.odds_2
        : this.game.player_odds[[this.game.players[1]]];
      return (this.player2Bet * b2).toFixed(this.floatingDigits);
    },
  },
  data() {
    return {
      outcomeBetsSum: this.outcomeBets
        ? this.outcomeBets.bet_1 + this.outcomeBets.bet_2
        : 0,
      floatingDigits: 2,
      enabledSave: true,
      tournamentStarted: false,
      tournamentFinished: false,
      // player1Bet: this.gameBets ? this.gameBets.bet_1 : 0,
      // player2Bet: this.gameBets ? this.gameBets.bet_2 : 0,
      overBet: this.gameBets ? this.gameBets.bet_1 : 0,
      underBet: this.gameBets ? this.gameBets.bet_2 : 0,
    };
  },
};
</script>

<style>
.betTable {
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
