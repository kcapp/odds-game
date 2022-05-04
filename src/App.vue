<script setup="ts"></script>

<template>
  <div class="nav">
    <nav v-if="showUserMenu">
      <div id="logo" style="margin-bottom: 50px">
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
      <RouterLink to="/"
        ><div class="item">
          <i class="fa-solid fa-house"></i> Home
        </div></RouterLink
      >

      <RouterLink to="/profile"
        ><div class="item">
          <i class="fa-solid fa-user"></i> Profile
        </div></RouterLink
      >

      <RouterLink to="/tournaments">
        <div class="item">
          <i class="fa-solid fa-trophy"></i> Tournaments
        </div></RouterLink
      >

      <RouterLink to="/bets">
        <div class="item">
          <i class="fa-solid fa-coins"></i> Bets
        </div></RouterLink
      >
      <a href="#">
        <div class="item">
          <RouterLink @click.prevent="logOut" to="/logout"
            ><i class="fa-solid fa-right-from-bracket"></i> Log out</RouterLink
          >
        </div>
      </a>
    </nav>
    <nav v-else>
      <div style="margin-bottom: 50px">
        <img src="@/assets/logo128VC.png" width="60" />
      </div>

      <RouterLink to="/"
        ><div class="item">
          <i class="fa-solid fa-house"></i> Home
        </div></RouterLink
      >

      <RouterLink to="/login"
        ><div class="item">
          <i class="fa-solid fa-right-to-bracket"></i> Log in
        </div></RouterLink
      >
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

a.router-link-active,
a.router-link-exact-active > div {
  background-color: #333445;
  border-radius: 5px;
}
</style>
