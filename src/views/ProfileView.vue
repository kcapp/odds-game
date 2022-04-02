<template>
  <div style="margin: 30px">
    <div>
      <h2>
        Welcome, <span class="juicyGreen">{{ currentUser.login }}</span>
      </h2>
    </div>
    <div class="passwordWarning" v-if="currentUser.requires_change">
      You are using starter password. Please change it here.
    </div>
    <div
      style="
        background-color: #22232c;
        min-height: 100px;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
      "
    >
      Profile data
    </div>
  </div>
</template>
<script>
export default {
  name: "UserProfile",
  data() {
    return {
      requires_change: true,
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
    }
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
</style>
