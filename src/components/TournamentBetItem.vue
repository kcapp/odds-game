<template>
  <td>
    <span :class="{ colWhite: !this.tournament.is_finished }">{{
      this.tournament.name
    }}</span>
    <span v-if="!this.tournament.is_finished" class="smGreenLabel ml1em"
      >active</span
    >
  </td>
  <td>
    <RouterLink :to="{ name: 'betsId', params: { id: this.tournament.id } }"
      >match bets</RouterLink
    >
    <span v-if="tournament.is_playoffs">
      .
      <RouterLink
        :to="{
          name: 'tournamentBetsId',
          params: { id: this.tournament.id },
        }"
      >
        tournament bets
      </RouterLink>
    </span>

    <span v-if="tournament.is_playoffs">
      <!-- Ladder link removed -->
    </span>
  </td>
</template>

<script>
export default {
  props: ["tournament"],
};
</script>
