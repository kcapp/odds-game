<template>
  <div class="txtC">
    <div class="loginFormDiv">
      <h3>Password change</h3>
      <form @submit.prevent="handlePassChange">
        <input
          v-model="p1"
          placeholder="new password"
          type="password"
          class="textInput"
        />
        <br />
        <br />
        <input
          v-model="p2"
          placeholder="repeat new password"
          type="password"
          class="textInput"
        />
        <br />
        <br />
        <button type="submit" class="buttonGreen">change</button>
        <div v-if="message" class="error" role="alert">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import User from "@/models/user.js";

export default {
  name: "PassChange",
  data() {
    return {
      user: new User("", ""),
      message: "",
      p1: "",
      p2: "",
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
    }
  },
  methods: {
    changePassword(userId, pass) {
      return axios
        .post(
          this.kcappOddsApiUrl + "/user/changepass",
          {
            login: userId,
            password: pass,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    handlePassChange() {
      if (this.p1 === "" || this.p2 === "") {
        this.message = "Enter new password twice";
        return;
      }
      if (this.p1 !== this.p2) {
        this.message = "Enter the same password twice";
        return;
      }
      if (this.p1.length < 4) {
        this.message = "Password must be at least 4 characters long";
        return;
      }

      //this.changePassword(this.$store.state.auth.user.login, btoa(this.p1));
    },
  },
};
</script>
