<script>
import axios from "axios";
import ListBets from "@/components/ListBets.vue";

export default {
  components: { ListBets },
  data() {
    return {
      tournaments: [],
    };
  },
  mounted() {
    axios
      .all([
        axios.get(
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
            "/tournament/office/" +
            import.meta.env.VITE_OFFICE_ID
        ),
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
  <ListBets :tournaments="this.tournaments" />
</template>
