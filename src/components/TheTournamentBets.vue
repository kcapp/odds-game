<template>
  <div ref="jumpTop">
    <table v-if="this.outcomes && this.balance" class="tournamentBetsTable">
      <tr>
        <td>
          Jump to section:
          <span
            class="colPlus"
            style="cursor: pointer"
            @click="this.jumpTo('jumpBetTotal')"
            >Total bets</span
          >
          |
          <span
            class="colPlus"
            style="cursor: pointer"
            @click="this.jumpTo('jumpBetFutures')"
            >Outcomes (futures)</span
          >
          |
          <span
            class="colPlus"
            style="cursor: pointer"
            @click="this.jumpTo('jumpBetProps')"
            >Player props</span
          >
        </td>
      </tr>
      <tr>
        <td>
          <hr />
        </td>
      </tr>
      <tr>
        <td class="colWhite" ref="jumpBetTotal">
          <div>
            <table style="width: 98%">
              <tr>
                <td>
                  <h3 class="h3class">Total bets (over / under)</h3>
                </td>
                <td class="txtR">
                  <span
                    class="colPlus"
                    style="cursor: pointer"
                    @click="this.jumpTo('jumpTop')"
                    >Back to top</span
                  >
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
      <tr v-for="(outcome, index) in this.outcomesTotal" v-bind:key="index">
        <td>
          <BetTotalItem
            ref="betTotalItem"
            :outcome="outcome"
            :tournamentId="tournamentId"
            :balance="this.balance"
            :user-bets="this.userBets[outcome.id]"
            @resetBets="resetBets"
            @reloadBalance="reloadBalance"
            @disableBetsSavingForTotals="disableBetsSavingForTotals"
            @enableBetSaving="enableBetSaving"
          >
            <template #oddsOver>
              {{
                userBets[outcome.id]
                  ? userBets[outcome.id].odds_1
                  : outcome.getOdds1()
              }}
            </template>
            <template #oddsUnder>
              {{
                userBets[outcome.id]
                  ? userBets[outcome.id].odds_2
                  : outcome.getOdds2()
              }}
            </template>
          </BetTotalItem>
        </td>
      </tr>
      <tr>
        <td class="colWhite" ref="jumpBetFutures">
          <div>
            <table style="width: 98%">
              <tr>
                <td>
                  <h3 class="h3class">Outrights (futures)</h3>
                </td>
                <td class="txtR">
                  <span
                    class="colPlus"
                    style="cursor: pointer"
                    @click="this.jumpTo('jumpTop')"
                    >Back to top</span
                  >
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
      <template
        v-for="(futuresOutcomesGroup, futuresOutcomesGroupIndex) in this
          .groupsFutures"
        v-bind:key="futuresOutcomesGroupIndex"
      >
        <tr v-if="futuresOutcomesGroup">
          <td>
            <BetFuturesItem
              ref="betFuturesItem"
              :market-names="this.marketNames"
              :outcomeMarketId="futuresOutcomesGroupIndex"
              :outcomes="getOutcomesIndexed(futuresOutcomesGroup)"
              :tournamentId="tournamentId"
              :balance="this.balance"
              :user-bets="getFuturesBets()"
              @resetBets="resetBets"
              @reloadBalance="reloadBalance"
              @disableBetsSavingForFutures="disableBetsSavingForFutures"
              @enableBetSaving="enableBetSaving"
            />
          </td>
        </tr>
      </template>
      <tr>
        <td class="colWhite" ref="jumpBetProps">
          <div>
            <table style="width: 98%">
              <tr>
                <td>
                  <h3 class="h3class">Player props</h3>
                </td>
                <td class="txtR">
                  <span
                    class="colPlus"
                    style="cursor: pointer"
                    @click="this.jumpTo('jumpTop')"
                    >Back to top</span
                  >
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
      <template
        v-for="(propsOutcomesGroup, propsOutcomesGroupIndex) in this
          .groupsProps"
        v-bind:key="propsOutcomesGroupIndex"
      >
        <tr v-if="propsOutcomesGroup">
          <td>
            <BetPropsItem
              ref="betPropsItem"
              :market-names="this.marketNames"
              :outcomeMarketId="propsOutcomesGroupIndex"
              :outcomes="getOutcomesIndexed(propsOutcomesGroup)"
              :tournamentId="tournamentId"
              :balance="this.balance"
              :user-bets="getPropsBets()"
              @resetBets="resetBets"
              @reloadBalance="reloadBalance"
              @disableBetsSavingForProps="disableBetsSavingForProps"
              @enableBetSaving="enableBetSaving"
            />
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>
<script>
import { Outcome } from "@/models/Outcome.ts";
import BetTotalItem from "@/components/BetTotalItem.vue";
import BetFuturesItem from "@/components/BetFuturesItem.vue";
import BetPropsItem from "@/components/BetPropsItem.vue";
import axios from "axios";
export default {
  components: { BetTotalItem, BetFuturesItem, BetPropsItem },
  props: ["outcomes", "requestedTournamentId"],
  data() {
    return {
      tournamentId: 0,
      outcomesAll: [],
      outcomesTotal: [],
      outcomesFutures: [],
      outcomesProps: [],
      groupsFutures: [],
      groupsProps: [],
      marketNames: [],
      userBets: [],
      balance: null,
    };
  },
  methods: {
    jumpTo(refName) {
      const element = this.$refs[refName];
      if (element) {
        // Use el.scrollIntoView() to instantly scroll to the element
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
    getFuturesBets() {
      let futuresBets = [];
      this.userBets.forEach((item) => {
        if (item.market_type_id === 2) {
          futuresBets[item.id] = item;
        }
      });
      return futuresBets;
    },
    getPropsBets() {
      let propsBets = [];
      this.userBets.filter(Boolean).forEach((item) => {
        if (item.market_type_id === 3) {
          propsBets[item.id] = item;
        }
      });
      return propsBets;
    },
    getOutcomesIndexed(outcomes) {
      let oc = [];
      outcomes.forEach((item) => {
        oc[item.id] = item;
      });
      return oc;
    },
    reloadBalance(newBalance) {
      this.balance = newBalance;
      let ca =
        newBalance.start_coins -
        newBalance.tournament_coins_open -
        newBalance.tournament_coins_closed +
        newBalance.tournament_coins_won;
      this.$refs.betTotalItem.forEach((item) => {
        item.coinsAvailable = ca;
      });
      this.$refs.betFuturesItem.forEach((item) => {
        item.coinsAvailable = ca;
      });
      this.$refs.betPropsItem.forEach((item) => {
        item.coinsAvailable = ca;
      });
    },
    disableBetsSavingForTotals(outcomeId) {
      this.$refs.betTotalItem.forEach((item) => {
        item.enabledSave = item.getOutcomeId() === outcomeId;
      });
      this.$refs.betFuturesItem.forEach((item) => {
        item.enabledSave = false;
      });
      this.$refs.betPropsItem.forEach((item) => {
        item.enabledSave = false;
      });
    },
    disableBetsSavingForFutures(outcomeMarketId) {
      this.$refs.betTotalItem.forEach((item) => {
        item.enabledSave = false;
      });
      this.$refs.betFuturesItem.forEach((item) => {
        if (item.getOutcomeMarketId() === outcomeMarketId) {
          item.enabledSave = true;
        } else {
          item.enabledSave = false;
        }
      });
      this.$refs.betPropsItem.forEach((item) => {
        item.enabledSave = false;
      });
    },
    disableBetsSavingForProps(outcomeMarketId) {
      this.$refs.betTotalItem.forEach((item) => {
        item.enabledSave = false;
      });
      this.$refs.betFuturesItem.forEach((item) => {
        item.enabledSave = false;
      });
      this.$refs.betPropsItem.forEach((item) => {
        if (item.getOutcomeMarketId() === outcomeMarketId) {
          item.enabledSave = true;
        } else {
          item.enabledSave = false;
        }
      });
    },
    enableBetSaving() {
      this.$refs.betTotalItem.forEach((item) => {
        item.enabledSave = true;
      });
      this.$refs.betFuturesItem.forEach((item) => {
        item.enabledSave = true;
      });
      this.$refs.betPropsItem.forEach((item) => {
        item.enabledSave = true;
      });
    },
    resetBets() {
      this.loadComponentData();
    },
    loadComponentData() {
      // By default, load current tournament
      let url =
        import.meta.env.VITE_KCAPP_API_PROXY_STRING +
        "/tournament/current/" +
        import.meta.env.VITE_OFFICE_ID;
      // If there was requested tournament (i.e. previous ones), load data for it
      if (this.requestedTournamentId !== 0) {
        url =
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
          "/tournament/" +
          this.requestedTournamentId;
      }
      axios
        .get(url)
        .then((tournament) => {
          this.tournamentId = tournament.data.id;
          this.tournamentFinished = tournament.data.is_finished;

          // Get the rest of the data after we fetch current tournament id
          axios
            .all([
              axios.get(
                import.meta.env.VITE_ODDS_API_PROXY_STRING +
                  "/user/" +
                  this.$store.state.auth.user.user_id +
                  "/tournament/" +
                  this.tournamentId +
                  "/tournamentbets"
              ),
              axios.get(
                import.meta.env.VITE_ODDS_API_PROXY_STRING +
                  "/user/" +
                  this.$store.state.auth.user.user_id +
                  "/tournament/" +
                  this.tournamentId +
                  "/balance"
              ),
            ])
            .then(
              axios.spread((bets, balance) => {
                this.userBets = [];
                for (const [index, value] of bets.data.entries()) {
                  this.userBets[value.outcome_id] = value;
                }

                this.balance = balance.data;
                this.loaded = true;

                this.immutableCoins = 0;
              })
            )
            .catch((error) => {
              console.log("Error when getting data for tournaments " + error);
            });
        })
        .catch((error) => {
          console.log("Error when getting bets " + error);
        });
    },
    buildTournamentOutcomesArray(o) {
      o.forEach((item) => {
        let oc = new Outcome(item);
        // assign market to group
        if (oc.getMarketTypeId() === 1) {
          this.outcomesTotal.push(oc);
        } else if (oc.getMarketTypeId() === 2) {
          this.outcomesFutures.push(oc);
        } else if (oc.getMarketTypeId() === 3) {
          this.outcomesProps.push(oc);
        }
        // also keep all markets in one array
        this.outcomesAll.push(oc);
        this.marketNames[oc.getMarketId()] = oc.getMarketName();
      });

      this.outcomesFutures.forEach((item) => {
        if (this.groupsFutures[item.getMarketId()] === undefined) {
          this.groupsFutures[item.getMarketId()] = [];
        }
        this.groupsFutures[item.getMarketId()].push(item);
      });
      this.groupsFutures.forEach((item) => {
        item.sort((a, b) => (a.odds_x > b.odds_x ? 1 : -1));
      });

      this.outcomesProps.forEach((item) => {
        if (this.groupsProps[item.getMarketId()] === undefined) {
          this.groupsProps[item.getMarketId()] = [];
        }
        this.groupsProps[item.getMarketId()].push(item);
      });
      this.groupsProps.forEach((item) => {
        item.sort((a, b) => (a.odds_x > b.odds_x ? 1 : -1));
      });
    },
  },
  mounted() {
    this.buildTournamentOutcomesArray(this.outcomes);
  },
  created() {
    this.loadComponentData();
  },
};
</script>

<style>
.tournamentBetsTable {
  width: 100%;
  margin: 0px 5px;
}
.tournamentBetsTable h3 {
  margin: 0px;
  font-size: 15px;
  font-weight: 300;
  color: #00bd7e;
  display: inline-block;
}
</style>
