<script setup="ts"></script>

<template>
  <div class="nav">
    <nav v-if="showUserMenu">
      <div style="margin-bottom: 50px">
        <img src="@/assets/logo128VC.png" width="60" />
        <TheCoin
          style="
            position: absolute;
            font-size: 14px;
            margin-left: -16px;
            margin-top: 0px;
          "
        />
      </div>
      <div class="item">
        <RouterLink to="/"> <i class="fa-solid fa-house"></i> Home</RouterLink>
      </div>
      <div class="item">
        <RouterLink to="/profile"
          ><i class="fa-solid fa-user"></i> Profile</RouterLink
        >
      </div>
      <div class="item">
        <RouterLink to="/tournaments"
          ><i class="fa-solid fa-trophy"></i> Tournaments</RouterLink
        >
      </div>
      <div class="item">
        <RouterLink to="/bets">
          <i class="fa-solid fa-coins"></i>
          Bets</RouterLink
        >
      </div>
      <div class="item">
        <RouterLink @click.prevent="logOut" to="/"
          ><i class="fa-solid fa-right-from-bracket"></i> Log out</RouterLink
        >
      </div>
    </nav>
    <nav v-else>
      <div style="margin-bottom: 50px">
        <img src="@/assets/logo128VC.png" width="60" />
      </div>
      <div class="item">
        <RouterLink to="/"><i class="fa-solid fa-house"></i> Home</RouterLink>
      </div>
      <div class="item">
        <RouterLink to="/login"
          ><i class="fa-solid fa-right-to-bracket"></i> Log in</RouterLink
        >
      </div>
    </nav>
  </div>
  <div class="content">
    <RouterView />
  </div>
</template>

<script>
import TheCoin from "@/components/TheCoin.vue";
export default {
  components: { TheCoin },
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
