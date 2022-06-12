<template>
  <TheTotalRanking v-if="ranking" :tournament="tournament" :ranking="ranking" />
</template>

<script>
import axios from "axios";
import TheTotalRanking from "@/components/TheTotalRanking.vue";
export default {
  components: { TheTotalRanking },
  data() {
    return {
      tournamentId: 0,
      tournament: null,
      ranking: [],
      rankingGame: [],
      rankingTournament: [],
      rankingTotal: [],
      cheatersRanking: [],
      nonCheatersRanking: [],
    };
  },
  methods: {
    combineRankings() {
      this.rankingGame.forEach((item) => {
        if (!item.is_cheater) {
          if (this.rankingTotal[item.user_id] === undefined) {
            this.rankingTotal[item.user_id] = {};
          }
          this.rankingTotal[item.user_id].rankingGame = item;
        }
      });
      this.rankingTournament.forEach((item) => {
        if (this.rankingTotal[item.user_id] === undefined) {
          this.rankingTotal[item.user_id] = {};
        }
        this.rankingTotal[item.user_id].rankingTournament = item;
      });

      this.rankingTotal.forEach((item, index) => {
        let firstName = item.rankingGame
          ? item.rankingGame.first_name
          : item.rankingTournament.first_name;
        let lastName = item.rankingGame
          ? item.rankingGame.last_name
          : item.rankingTournament.last_name;
        let coinsGame = item.rankingGame ? item.rankingGame.coins_available : 0;
        let coinsTournament = item.rankingTournament
          ? item.rankingTournament.coins_available
          : 0;
        let coinsTotal = parseFloat(coinsGame) + parseFloat(coinsTournament);
        this.ranking[index] = {
          first_name: firstName,
          last_name: lastName,
          coins_won_game: coinsGame,
          coins_won_tournament: coinsTournament,
          coins_won_total: coinsTotal,
          // bets_closed: 10
          // bets_placed: 10
          // coins_available: 0.39990234
          // coins_bets_closed: 7262
          // coins_bets_open: 0
          // coins_won: 6262.4
          // is_cheater: 0
          // potential_winnings: 0
          // start_coins: 1000
          // tournament_coins_closed: 1000
          // tournament_coins_open: 1000
          // tournament_coins_won: 0
          // tournament_id: 37
          // user_id: 60
        };
      });

      // sort
      this.ranking.sort((a, b) => {
        if (a.coins_won_total < b.coins_won_total) {
          return 1;
        } else {
          return -1;
        }
      });
    },
  },
  created() {
    if (this.$route.params.id !== undefined && this.$route.params.id) {
      this.tournamentId = this.$route.params.id;
    }
    axios
      .all([
        axios.get(
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
            "/tournament/" +
            this.tournamentId
        ),
        axios.get(
          import.meta.env.VITE_ODDS_API_PROXY_STRING +
            "/tournament/" +
            this.tournamentId +
            "/gameranking"
        ),
        axios.get(
          import.meta.env.VITE_ODDS_API_PROXY_STRING +
            "/tournament/" +
            this.tournamentId +
            "/ranking"
        ),
      ])
      .then(
        axios.spread((tournament, rankingGame, rankingTournament) => {
          this.tournament = tournament.data;
          this.rankingGame = rankingGame.data;
          this.rankingTournament = rankingTournament.data;
          this.combineRankings();
          //this.splitRankings(ranking.data);
        })
      )
      .catch((error) => {
        console.log("Error when getting data for tournaments ", error);
      });
  },
};
</script>

<style></style>
