<script setup="ts"></script>

<template>
  <div class="nav">
    <nav v-if="showUserMenu">
      <div style="margin-bottom: 50px">
        <img src="@/assets/logo128VC.png" width="60" />
      </div>
      <div class="item"><RouterLink to="/">Home</RouterLink></div>
      <div class="item"><RouterLink to="/profile">Profile</RouterLink></div>
      <div class="item"><RouterLink to="/bets">Bets</RouterLink></div>
      <div class="item">
        <RouterLink @click.prevent="logOut" to="/">Log out</RouterLink>
      </div>
    </nav>
    <nav v-else>
      <div style="margin-bottom: 50px">
        <img src="@/assets/logo128VC.png" width="60" />
      </div>
      <div class="item"><RouterLink to="/">Home</RouterLink></div>
      <div class="item"><RouterLink to="/login">Log in</RouterLink></div>
    </nav>
  </div>
  <div class="content">
    <RouterView />
  </div>
</template>

<script>
export default {
  computed: {
    showUserMenu() {
      return !!this.$store.state.auth.user;
    },
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
  },
};
</script>

<style>
@import "assets/base.css";
</style>
