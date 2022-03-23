<template>
  <div class="container">
    <header class="jumbotron">
      <h3>
        <strong>{{ currentUser.login }}</strong> Profile
      </h3>
    </header>
    <p>
      <strong>change</strong>
      {{ currentUser.requiresChange }}
    </p>
    <p>
      <strong>Id:</strong>
      {{ currentUser.login }}
    </p>
    <strong>Authorities:</strong>
  </div>
</template>
<script>
export default {
  name: "UserProfile",
  data() {
    return {
      requiresChange: true,
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
      this.requiresChange = this.currentUser.requiresChange;
    }
  },
};
</script>
