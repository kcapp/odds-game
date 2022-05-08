<template>
  <div>
    <table v-if="this.outcomes && this.balance" class="tournamentBetsTable">
      <tr>
        <td class="colWhite">
          <div>
            <h3>Total bets (over / under)</h3>
          </div>
        </td>
      </tr>
      <tr v-for="(outcome, index) in this.outcomesTotal" v-bind:key="index">
        <td>
          <BetTotalItem
            ref="betItem"
            :outcome="outcome"
            :tournamentId="tournamentId"
            :balance="this.balance"
            :user-bets="this.userBets[outcome.id]"
            @resetBets="resetBets"
            @reloadBalance="reloadBalance"
            @disableOtherBetsSaving="disableOtherBetsSaving"
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
    </table>
  </div>
</template>
<script>
import { Outcome } from "@/models/Outcome.ts";
import BetTotalItem from "@/components/BetTotalItem.vue";
import axios from "axios";
export default {
  components: { BetTotalItem },
  props: ["outcomes", "requestedTournamentId"],
  data() {
    return {
      tournamentId: 0,
      outcomesAll: [],
      outcomesTotal: [],
      outcomesFutures: [],
      outcomesProps: [],
      userBets: [],
      balance: null,
    };
  },
  methods: {
    reloadBalance(newBalance) {
      this.balance = newBalance;
      this.$refs.betItem.forEach((item) => {
        item.coinsAvailable =
          newBalance.start_coins -
          newBalance.tournament_coins_open -
          newBalance.tournament_coins_closed +
          newBalance.tournament_coins_won;
      });
    },
    disableOtherBetsSaving(outcomeId) {
      this.$refs.betItem.forEach((item) => {
        item.enabledSave = item.getOutcomeId() === outcomeId;
      });
    },
    enableBetSaving() {
      this.$refs.betItem.forEach((item) => {
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
                for (const [index, value] of bets.data.entries()) {
                  this.userBets[value.outcome_id] = value;
                }

                // // set metadata indexed by match id
                // for (const [index, value] of meta.data.entries()) {
                //   this.gameMeta[value.match_id] = value;
                // }
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
  font-size: 30px;
  font-weight: 300;
  color: #00bd7e;
}
</style>
