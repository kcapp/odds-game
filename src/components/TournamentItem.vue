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
      :to="{
        name: 'tournamentGameRanking',
        params: { id: this.tournament.id },
      }"
    >
      match ranking
    </RouterLink>
    .
    <RouterLink
      :to="{
        name: 'tournamentRanking',
        params: { id: this.tournament.id },
      }"
    >
      tournament ranking
    </RouterLink>
    <span v-if="tournament.is_playoffs">
      .
      <RouterLink :to="{ name: 'ladder', params: { id: this.tournament.id } }">
        ladder
      </RouterLink>
    </span>
  </td>
</template>

<script>
export default {
  props: ["tournament"],
};
</script>
