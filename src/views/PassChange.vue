<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-md mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 class="text-base font-bold text-white mb-4 text-center">Change Password</h2>
        <form @submit.prevent="handlePassChange" class="space-y-3">
          <div>
            <input
              v-model="p1"
              placeholder="new password"
              type="password"
              class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div>
            <input
              v-model="p2"
              placeholder="repeat new password"
              type="password"
              class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
          >
            change
          </button>
          <div v-if="message" class="mt-3 p-3 bg-green-900/50 border border-green-800 rounded-md text-green-200 text-xs">
            {{ message }}
          </div>
          <div v-if="errorMessage" class="mt-3 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200 text-xs">
            {{ errorMessage }}
          </div>
        </form>
      </div>
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
      errorMessage: "",
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
          import.meta.env.VITE_ODDS_API_PROXY_STRING + "/user/changepass",
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
          // show only success message
          this.message = response.data.message;
          this.errorMessage = "";

          // reset form fields
          this.p1 = "";
          this.p2 = "";

          // set store value of required pass change to false
          this.$store.commit("disableRequiredPassChange");
          this.updateStorageValue("requires_change", false);
        })
        .catch((error) => {
          // show only error message
          this.message = "";
          this.errorMessage = error.data.message;
        });
    },
    updateStorageValue(key, value) {
      let storageUser = JSON.parse(localStorage.getItem("user"));
      storageUser[key] = value;
      localStorage.setItem("user", JSON.stringify(storageUser));
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

      this.changePassword(this.$store.state.auth.user.login, btoa(this.p1));
    },
  },
};
</script>

<style>
.success {
  padding: 20px 0px;
  color: #3aaa35;
}
</style> 