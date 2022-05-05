<template>
  <!--  <div v-for="(group, index) in this.playoffGroups" v-bind:key="index">-->
  <!--    {{ group.getGames }}-->
  <!--  </div>-->
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
      rounds: [[], [], [], [], []],
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
        this.playoffGroups[index].addGame({
          match_id: item.match_id,
          playOrder: item.order_of_play,
          winner_outcome_match_id: item.winner_outcome_match_id,
          looser_outcome_match_id: item.looser_outcome_match_id,
        });
      });
    },
    sortPlayoffGroupsGames() {
      this.playoffGroups.forEach((group) => {
        group.sortGamesByOrderOfPlay();
      });
    },
    showRounds() {
      this.playoffGroups.forEach((group) => {
        group.getGames.forEach((game) => {
          //console.log(game);
          if (this.rounds[0].length === 0) {
            this.rounds[0].push(game.match_id);
            this.rounds[1].push(game.winner_outcome_match_id);
          }
        });
      });
      //this.playoffGroups[1].getRounds;
      // this.playoffGroups.forEach((group) => {
      //   group.getRounds;
      // });
      console.log(this.rounds);
    },
    loadLadder() {
      axios
        .get(
          import.meta.env.VITE_KCAPP_API_PROXY_STRING +
            "/tournament/" +
            this.tournamentId +
            "/metadata"
        )
        .then((metadata) => {
          this.metadata = metadata.data;
          this.buildPlayoffGroups();
          this.buildPlayoffGroupsGames();
          this.sortPlayoffGroupsGames();
          this.showRounds();
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
