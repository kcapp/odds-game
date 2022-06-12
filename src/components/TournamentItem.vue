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
    <RouterLink
      :to="{
        name: 'gameRanking',
        params: { id: this.tournament.id },
      }"
    >
      match
    </RouterLink>
    .
    <RouterLink
      :to="{
        name: 'tournamentRanking',
        params: { id: this.tournament.id },
      }"
    >
      tournament
    </RouterLink>
    .
    <RouterLink
      :to="{
        name: 'totalRanking',
        params: { id: this.tournament.id },
      }"
    >
      total
    </RouterLink>
    <span v-if="tournament.is_playoffs && false">
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
