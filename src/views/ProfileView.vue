<template>
  <div class="m10">
    <div class="passwordWarning" v-if="currentUser.requires_change">
      You are using starter password. Please change it
      <RouterLink style="color: black" to="/changepass">here</RouterLink>.
    </div>
    <table
      class="profileTable profileBlockFill"
      v-if="this.userData && (this.coins || this.coins >= 0)"
    >
      <tr>
        <td style="width: 100%">
          <table>
            <tr>
              <td class="pl20">
                <div>
                  <div>
                    <div class="profilePictureCircleWrapper">
                      <div class="profilePictureContent">
                        <img
                          class="profileImg"
                          v-bind:src="
                            'https://darts.sportradar.ag' +
                            this.profilePictureUrl
                          "
                          v-if="
                            this.profilePictureUrl &&
                            this.profilePictureUrl.startsWith('/')
                          "
                          @error="$event.target.src = this.placeholderImage"
                        />
                        <img
                          class="profileImg"
                          v-bind:src="this.profilePictureUrl"
                          v-else-if="
                            this.profilePictureUrl &&
                            this.profilePictureUrl.startsWith('https://')
                          "
                          @error="$event.target.src = this.placeholderImage"
                        />
                        <i class="fa-solid fa-robot" v-else></i>
                      </div>
                    </div>
                    <div class="profileName pt20 txtC">
                      <h3 class="colWhite noMargin">
                        {{ this.userData.first_name }}
                      </h3>
                      <h2 class="colWhite noMargin">
                        {{ this.userData.last_name }}
                      </h2>
                    </div>
                    <div class="pt20 txtC" v-if="!currentUser.requires_change">
                      <RouterLink to="/changepass">change password</RouterLink>
                    </div>
                  </div>
                </div>
              </td>
              <td style="padding-left: 50px">
                <div style="padding-bottom: 10px; color: white">
                  Select tournament
                </div>
                <div style="padding-bottom: 10px">
                  <select
                    style="display: table"
                    class="textInput selectName"
                    @change="updateBetsData(this.currentUser.user_id)"
                    v-model="this.selectedTournamentId"
                  >
                    <option disabled selected value="">
                      Please select one
                    </option>
                    <template
                      v-for="(tournament, index) in this.tournaments.filter(
                        Boolean
                      )"
                    >
                      <option
                        :value="tournament.id"
                        v-bind:key="tournament.id"
                        v-if="tournament"
                      >
                        {{ tournament.name }}
                      </option>
                    </template>
                  </select>
                </div>
                <div>
                  <hr />
                </div>
                <div style="color: white; font-weight: 500">
                  Match k-Coins balance
                </div>
                <div style="color: #575656">
                  Coins earned by betting on match results.
                </div>
                <div style="padding: 10px 0px">
                  <span class="ibDisplay"
                    ><h1 class="noMargin">{{ this.coins.toFixed(2) }}</h1></span
                  >
                  <TheCoin></TheCoin>
                </div>
                <div style="color: white; font-weight: 500">
                  Tournament k-Coins balance
                </div>
                <div style="color: #575656">
                  Coins earned by betting on tournament outcomes and special
                  bets.
                </div>
                <div style="padding: 10px 0px">
                  <span class="ibDisplay"
                    ><h1 class="noMargin">
                      {{ this.tournamentCoins.toFixed(2) }}
                    </h1></span
                  >
                  <TheCoin></TheCoin>
                </div>
              </td>
            </tr>
          </table>
          <div class="profileBlockFill">
            <div><hr /></div>
            <div v-if="this.players && this.bets">
              <table style="width: 100%">
                <tr class="colWhite">
                  <td class="txtR pr10">home player</td>
                  <td class="txtC" colspan="3">bets</td>
                  <td class="pl10">away player</td>
                  <td>result</td>
                  <td>status</td>
                  <td>view options</td>
                  <td class="txtC">result</td>
                </tr>
                <tr>
                  <td colspan="9">
                    <hr />
                  </td>
                </tr>
                <tr
                  v-for="(bet, index) in this.bets"
                  v-bind:key="index"
                  class="colGray"
                >
                  <td
                    class="txtR pr10"
                    :class="{ juicyGreen: bet.outcome === bet.player_1 }"
                  >
                    {{ this.players[bet.player_1].first_name }}
                    {{ this.players[bet.player_1].last_name }}
                  </td>
                  <td class="txtR colWhite">{{ bet.bet_1 }}</td>
                  <td class="txtC colWhite">{{ bet.bet_x }}</td>
                  <td class="txtL colWhite">{{ bet.bet_2 }}</td>
                  <td
                    class="pl10"
                    :class="{ juicyGreen: bet.outcome === bet.player_2 }"
                  >
                    {{ this.players[bet.player_2].first_name }}
                    {{ this.players[bet.player_2].last_name }}
                  </td>
                  <td class="colWhite">
                    <template v-if="bet.outcome !== null">
                      <span
                        v-if="
                          this.getGameResultById(bet.match_id).winner_id ===
                          null
                        "
                      >
                        {{ this.getGameResultById(bet.match_id).home_score }} :
                        {{ this.getGameResultById(bet.match_id).away_score }}
                      </span>
                      <span
                        v-else-if="
                          bet.player_1 ===
                          this.getGameResultById(bet.match_id).winner_id
                        "
                      >
                        {{
                          Math.max(
                            this.getGameResultById(bet.match_id).home_score,
                            this.getGameResultById(bet.match_id).away_score
                          )
                        }}
                        :
                        {{
                          Math.min(
                            this.getGameResultById(bet.match_id).home_score,
                            this.getGameResultById(bet.match_id).away_score
                          )
                        }}
                      </span>
                      <span
                        v-else-if="
                          bet.player_2 ===
                          this.getGameResultById(bet.match_id).winner_id
                        "
                      >
                        {{
                          Math.min(
                            this.getGameResultById(bet.match_id).home_score,
                            this.getGameResultById(bet.match_id).away_score
                          )
                        }}
                        :
                        {{
                          Math.max(
                            this.getGameResultById(bet.match_id).home_score,
                            this.getGameResultById(bet.match_id).away_score
                          )
                        }}
                      </span>
                    </template>
                  </td>
                  <td v-if="bet.outcome === undefined || bet.outcome === null">
                    scheduled
                  </td>
                  <td
                    class="colWhite"
                    v-else-if="
                      bet.outcome === bet.player_1 ||
                      bet.outcome === bet.player_2
                    "
                  >
                    finished
                  </td>
                  <td class="colWhite" v-else-if="bet.outcome === 0">
                    finished (draw)
                  </td>
                  <td v-else>unknown</td>
                  <td>
                    <RouterLink
                      :to="{ name: 'game', params: { id: bet.match_id } }"
                      >odds</RouterLink
                    >
                    <span v-if="this.isFinished(bet)">
                      .
                      <a
                        :href="
                          'https://darts.sportradar.ag/matches/' +
                          bet.match_id +
                          '/result'
                        "
                        target="_blank"
                        >result</a
                      >
                    </span>
                    <span v-else>
                      .
                      <a
                        :href="
                          'https://darts.sportradar.ag/matches/' +
                          bet.match_id +
                          '/spectate'
                        "
                        target="_blank"
                        >spectate</a
                      >
                    </span>
                  </td>
                  <td
                    class="txtR colWhite"
                    v-if="bet.outcome && bet.outcome === bet.player_1"
                  >
                    <span
                      :class="{
                        colPlus: this.getBet1Coins(bet) > 0,
                        colMinus: this.getBet1Coins(bet) < 0,
                      }"
                      >{{ this.getBet1Coins(bet).toFixed(2) }}</span
                    >
                    <span class="pl20"><TheSmallCoin /></span>
                  </td>
                  <td
                    class="txtR colWhite"
                    v-else-if="bet.outcome && bet.outcome === bet.player_2"
                  >
                    <span
                      :class="{
                        colPlus: this.getBet2Coins(bet) > 0,
                        colMinus: this.getBet2Coins(bet) < 0,
                      }"
                      >{{ this.getBet2Coins(bet).toFixed(2) }}</span
                    >
                    <span class="pl20"><TheSmallCoin /></span>
                  </td>
                  <td class="txtR colWhite" v-else-if="bet.outcome === 0">
                    <span
                      :class="{
                        colPlus: this.getBetDrawCoins(bet) > 0,
                        colMinus: this.getBetDrawCoins(bet) < 0,
                      }"
                      >{{ this.getBetDrawCoins(bet).toFixed(2) }}</span
                    >
                    <span class="pl20"><TheSmallCoin /></span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import axios from "axios";
import TheCoin from "../components/TheCoin.vue";
import TheSmallCoin from "../components/TheSmallCoin.vue";
import image from "../assets/user_placeholder.jpg";

export default {
  name: "UserProfile",
  components: { TheSmallCoin, TheCoin },
  data() {
    return {
      placeholderImage: image,
      userData: {
        first_name: "",
        last_name: "",
      },
      bets: [],
      players: [],
      requires_change: true,
      coins: 0,
      tournamentCoins: 0,
      selectedTournamentId: 0,
      profilePictureUrl: "",
      tournaments: [],
    };
  },
  computed: {
    currentUser() {
      if (this.$store.state.auth.user) {
        return JSON.parse(localStorage.getItem("user"));
      }
      return {};
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    } else {
      this.requires_change = this.currentUser.requires_change;
      let res;
      axios
        .all([
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/office/" +
              import.meta.env.VITE_OFFICE_ID
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/current/" +
              import.meta.env.VITE_OFFICE_ID
          ),
        ])
        .then(
          axios.spread((tournaments, currentTournament) => {
            this.tournaments = tournaments.data;
            this.selectedTournamentId = currentTournament.data.id;
            if (!this.selectedTournamentId) {
              this.selectedTournamentId = this.tournaments[0].id;
            }

            // Get the rest of the data after we fetch current tournament id
            this.getUserData(this.currentUser.user_id);
          })
        )
        .catch((error) => {
          console.log("Error when getting data for tournaments " + error);
        })
        .finally(() => {
          axios
            .get(
              import.meta.env.VITE_KCAPP_API_PROXY_STRING +
                "/tournament/office/" +
                import.meta.env.VITE_OFFICE_ID
            )
            .then((tournaments) => {
              this.tournaments = tournaments.data;
              this.selectedTournamentId = this.tournaments[0].id;

              // Get the rest of the data after we fetch current tournament id
              this.getUserData(this.currentUser.user_id);
            });
        });
    }
  },
  methods: {
    updateBetsData(userId) {
      this.getUserData(userId);
    },
    getGameResultById(gameId) {
      let res = null;
      this.results.forEach((item) => {
        if (item.match_id === gameId) {
          res = item;
        }
      });
      return res;
    },
    isFinished(bet) {
      return (
        bet.outcome === bet.player_1 ||
        bet.outcome === bet.player_2 ||
        bet.outcome === 0
      );
    },
    getBet1Coins(bet) {
      return bet.bet_1 * bet.odds_1 - (bet.bet_1 + bet.bet_2 + bet.bet_x);
    },
    getBet2Coins(bet) {
      return bet.bet_2 * bet.odds_2 - (bet.bet_1 + bet.bet_2 + bet.bet_x);
    },
    getBetDrawCoins(bet) {
      return bet.bet_x * bet.odds_x - (bet.bet_1 + bet.bet_2 + bet.bet_x);
    },
    setProfilePictureUrl(s) {
      if (s.startsWith("/")) {
        this.profilePictureUrl = "https://darts.sportradar.ag" + s;
      } else {
        this.profilePictureUrl = s;
      }
    },
    getUserData(userId) {
      axios
        .all([
          axios.get(
            import.meta.env.VITE_ODDS_API_PROXY_STRING +
              "/user/" +
              userId +
              "/tournament/" +
              this.selectedTournamentId +
              "/balance"
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING + "/player/" + userId
          ),
          axios.get(import.meta.env.VITE_KCAPP_API_PROXY_STRING + "/player"),
          axios.get(
            import.meta.env.VITE_ODDS_API_PROXY_STRING +
              "/user/" +
              userId +
              "/bets"
          ),
          axios.get(
            import.meta.env.VITE_KCAPP_API_PROXY_STRING +
              "/tournament/" +
              this.selectedTournamentId +
              "/matches/result"
          ),
        ])
        .then(
          axios.spread((userData, kcappPlayer, players, bets, results) => {
            this.coins =
              userData.data.start_coins -
              userData.data.coins_bets_open -
              userData.data.coins_bets_closed +
              userData.data.coins_won;
            this.tournamentCoins =
              userData.data.start_coins -
              userData.data.tournament_coins_open -
              userData.data.tournament_coins_closed +
              userData.data.tournament_coins_won;
            this.userData.first_name = userData.data.first_name;
            this.userData.last_name = userData.data.last_name;
            this.profilePictureUrl = kcappPlayer.data.profile_pic_url;
            this.players = players.data;

            // Filter bets by tournament
            this.bets = [];
            bets.data.filter(Boolean).forEach((item) => {
              if (item.tournament_id === this.selectedTournamentId) {
                this.bets.push(item);
              }
            });

            this.results = results.data;
          })
        )
        .catch((error) => {
          console.log("Error when getting data for user " + error);
        });
    },
  },
};
</script>

<style>
.passwordWarning {
  background-color: rgb(255 0 0);
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
}

.profileImg {
  width: 120px;
  margin-top: -20px;
}

.profileTable {
  width: 100%;
}

.profileTable td {
  vertical-align: top;
}

.profileBlockFill {
  background-color: #22232c;
  min-height: 330px;
  padding: 20px;
  border-radius: 10px;
  height: 100%;
}

.colGray {
  color: #6d6d6d;
}

h1 {
  font-size: 40px;
  font-weight: 300;
}
</style>
