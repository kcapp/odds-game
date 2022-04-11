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
import bcryptjs from "bcryptjs";

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
    hashPass(user) {
      return bcryptjs.hash(user.password, 10);
    },
    handleLogin() {
      this.loading = true;
      this.hashPass(this.user)
        .then((res) => {
          this.user.password = btoa(this.user.password);
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
        })
        .catch((err) => {
          console.log(err);
        });
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
