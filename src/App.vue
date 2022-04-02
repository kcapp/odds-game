<script setup="ts"></script>

<template>
  <div class="nav">
    <nav v-if="showUserMenu">
      <div style="margin-bottom: 50px">
        <img src="@/assets/logo128VC.png" width="60" />
        <span
          class="fa-stack fa-2x"
          style="
            font-size: 12px;
            position: absolute;
            margin-left: -17px;
            margin-top: 0px;
          "
        >
          <i
            class="fa-solid fa-circle fa-stack-2x"
            style="color: rgb(58, 170, 53)"
          ></i>
          <i
            class="fa-solid fa-k fa-stack-1x fa-inverse fa-rotate-by"
            style="--fa-rotate-angle: -25deg"
          ></i>
        </span>
      </div>
      <div class="item"><RouterLink to="/">Home</RouterLink></div>
      <div class="item"><RouterLink to="/profile">Profile</RouterLink></div>
      <div class="item">
        <RouterLink to="/tournaments">Tournaments</RouterLink>
      </div>
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
