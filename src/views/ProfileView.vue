<template>
  <div style="margin: 30px">
    <div class="passwordWarning" v-if="currentUser.requires_change">
      You are using starter password. Please change it
      <RouterLink style="color: black" to="/changepass">here</RouterLink>.
    </div>
    <table class="profileTable" v-if="this.userData && this.coins">
      <tr>
        <td>
          <div class="profileBlockFill">
            <div>
              <div class="profilePictureCircleWrapper">
                <div class="profilePictureContent">
                  <i class="fa-solid fa-robot"></i>
                </div>
              </div>
              <div class="profileName pt20 txtC">
                <h3 class="cWhite noMargin">
                  {{ this.userData.first_name }}
                </h3>
                <h2 class="cWhite noMargin">
                  {{ this.userData.last_name }}
                </h2>
              </div>
              <div class="pt20 txtC" v-if="!currentUser.requires_change">
                <RouterLink to="/changepass">change password</RouterLink>
              </div>
            </div>
          </div>
        </td>
        <td style="padding-left: 20px; width: 100%">
          <div class="profileBlockFill">
            <div style="color: white; font-weight: 500">
              Match kcappCoins balance
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
              Tournament kcappCoins balance
            </div>
            <div style="color: #575656">
              Coins earned by betting on tournament outcomes and special bets.
            </div>
            <div style="padding: 10px 0px">
              <span class="ibDisplay"
                ><h1 class="noMargin">
                  {{ this.tournamentCoins.toFixed(2) }}
                </h1></span
              >
              <TheCoin></TheCoin>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import axios from "axios";
import TheCoin from "@/components/TheCoin.vue";

export default {
  name: "UserProfile",
  components: { TheCoin },
  data() {
    return {
      userData: {
        first_name: "",
        last_name: "",
      },
      requires_change: true,
      coins: 0,
      tournamentCoins: 0,
      currentTournamentId: 0,
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
      axios
        .get("/kcapp-api/tournament/current/" + import.meta.env.VITE_OFFICE_ID)
        .then((tournament) => {
          this.currentTournamentId = tournament.data.id;

          // Get the rest of the data after we fetch current tournament id
          this.getUserData(this.currentUser.user_id);
        })
        .catch((error) => {
          console.log("Error when getting current tournament " + error);
        });
    }
  },
  methods: {
    getUserData(userId) {
      axios
        .all([
          axios.get(
            "/api/user/" +
              userId +
              "/tournament/" +
              this.currentTournamentId +
              "/balance"
          ),
        ])
        .then(
          axios.spread((userData) => {
            this.coins =
              userData.data.start_coins -
              userData.data.coins_bets_open -
              userData.data.coins_bets_closed +
              userData.data.coins_won;
            this.tournamentCoins = userData.data.tournament_coins_closed;
            this.userData.first_name = userData.data.first_name;
            this.userData.last_name = userData.data.last_name;
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
  margin-top: 20px;
  height: 100%;
}

.cWhite {
  color: white;
}
</style>
