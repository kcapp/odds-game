<template>
  <div class="mt-8 px-4">
    <div class="w-full max-w-md mx-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl p-6">
        <h3 class="text-base font-bold text-white mb-4 text-center">Log in</h3>
        <form @submit.prevent="handleLogin" class="space-y-3">
          <div>
            <input
              v-model="user.login"
              placeholder="Username"
              type="text"
              class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <input
              v-model="user.password"
              placeholder="Password"
              type="password"
              class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <button 
            type="submit" 
            class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors text-sm"
          >
            Login
          </button>
          <div v-if="message" class="mt-3 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200 text-xs" role="alert">
            {{ message }}
          </div>
        </form>
      </div>
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
            this.message = error.message;
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
