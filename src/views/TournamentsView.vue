<script>
import axios from "axios";
import TheTournaments from "@/components/TheTournaments.vue";

export default {
  components: { TheTournaments },
  data() {
    return {
      tournaments: [],
    };
  },
  mounted() {
    axios
      .all([
        axios.get(this.kcappApiUrl + "/tournament/office/" + this.officeId),
      ])
      .then(
        axios.spread((tournaments) => {
          this.tournaments = tournaments.data;
        })
      )
      .catch((error) => {
        console.log("Error when getting data for tournaments " + error);
      });
  },
};
</script>

<template>
  <TheTournaments :tournaments="this.tournaments" />
</template>
