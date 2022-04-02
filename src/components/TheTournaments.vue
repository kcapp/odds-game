<script>
export default {
  data() {
    return {
      gameBets: [],
    };
  },
  components: {},
  props: ["tournaments"],
  methods: {},
};
</script>

<template>
  <div class="filterHeader"></div>
  <div v-for="(tournament, index) in this.tournaments" v-bind:key="index">
    <div
      style="
        margin: 10px 50px 10px 20px;
        padding: 0px 0px 10px 0px;
        border-bottom: 1px solid #363636;
      "
    >
      <table class="txtL" style="width: 100%">
        <tr>
          <td style="width: 300px">
            <RouterLink
              :to="{ name: 'betsId', params: { id: tournament.id } }"
              >{{ tournament.name }}</RouterLink
            >
          </td>
          <td class="plr5" v-if="!tournament.is_finished">
            <span class="smGreenLabel">active tournament</span>
          </td>
          <td class="plr5" v-else>&nbsp;</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style>
.filterHeader {
  margin: 30px 50px 10px 20px;
  border-bottom: 1px solid #363636;
  padding-bottom: 5px;
  text-align: right;
}

.plr5 {
  padding: 0px 5px;
}
</style>
