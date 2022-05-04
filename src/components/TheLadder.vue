<template>
  <slot> </slot>
</template>

<script>
import axios from "axios";
import PlayoffGroup from "@/models/PlayoffGroup.ts";
export default {
  data() {
    return {
      metadata: null,
      playoffGroups: [],
      groupGames: [],
    };
  },
  props: ["tournamentId"],
  methods: {
    buildPlayoffGroups() {
      this.metadata.forEach((item) => {
        let pg = new PlayoffGroup(
          item.tournament_group.id,
          item.tournament_group.name
        );
        const index = this.playoffGroups.findIndex(
          (object) => object.id === pg.id
        );
        if (index === -1) {
          this.playoffGroups.push(pg);
        }
      });
    },
    buildPlayoffGroupsGames() {
      this.metadata.forEach((item) => {
        const index = this.playoffGroups.findIndex(
          (object) => object.id === item.tournament_group.id
        );
        console.log(index);
        this.playoffGroups[index].addGame({
          match_id: item.match_id,
          playOrder: item.order_of_play,
        });
      });
    },
    loadLadder() {
      axios
        .get("/kcapp-api/tournament/" + this.tournamentId + "/metadata")
        .then((metadata) => {
          this.metadata = metadata.data;
          this.buildPlayoffGroups();
          this.buildPlayoffGroupsGames();
          console.log(this.playoffGroups);
        })
        .catch((error) => {
          console.log("Error when getting ladder data ", error);
        });
    },
  },
  created() {
    this.loadLadder();
  },
};
</script>
