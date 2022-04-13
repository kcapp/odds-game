<template>
  <td>
    <RouterLink :to="{ name: 'betsId', params: { id: this.tournament.id } }">{{
      this.tournament.name
    }}</RouterLink>
    <span v-if="!this.tournament.is_finished" class="smGreenLabel ml20"
      >active</span
    >
  </td>
  <td>
    <RouterLink :to="{ name: 'betsId', params: { id: this.tournament.id } }"
      >bets</RouterLink
    >
    .
    <RouterLink
      :to="{ name: 'tournamentRanking', params: { id: this.tournament.id } }"
    >
      ranking
    </RouterLink>
  </td>
</template>

<script>
export default {
  props: ["tournament"],
};
</script>
