<template>
  <div class="txtC">
    <div class="loginFormDiv">
      <h3>Log in</h3>
      <form @submit.prevent="handleLogin">
        <input
          v-model="user.login"
          placeholder="username"
          type="text"
          class="textInput"
        />
        <br />
        <br />
        <input
          v-model="user.password"
          placeholder="password"
          type="password"
          class="textInput"
        />
        <br />
        <br />
        <button type="submit" class="buttonGreen">login</button>
        <div v-if="message" class="error" role="alert">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import User from "../models/user";

export default {
  data() {
    return {
      user: new User("", ""),
      loading: false,
      message: "",
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  created() {
    if (this.loggedIn) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleLogin() {
      this.loading = true;
      if (this.user.login && this.user.password) {
        this.$store.dispatch("auth/login", this.user).then(
          () => {
            this.$router.push("/profile");
          },
          (error) => {
            this.loading = false;
            this.message = error.response && error.response.data;
          }
        );
      }
    },
  },
};
</script>

<style>
.error {
  padding: 20px 0px;
  color: red;
}
.loginFormDiv {
  width: 300px;
  text-align: left;
  margin: 50px auto 0;
}
</style>
