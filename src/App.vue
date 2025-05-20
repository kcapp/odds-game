<script>
export default {
  data() {
    return {
      isMenuOpen: false
    }
  },
  computed: {
    showUserMenu() {
      return !!this.$store.state.auth.user;
    }
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Top Navigation Bar -->
    <nav class="bg-gray-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-2xl font-bold text-white">OddsGame</span>
            </div>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex md:items-center md:space-x-4">
            <RouterLink to="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <i class="fa-solid fa-house"></i> Home
            </RouterLink>

            <template v-if="showUserMenu">
              <RouterLink to="/profile" class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                <i class="fa-solid fa-user"></i> Profile
              </RouterLink>

              <RouterLink to="/bets" class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                <i class="fa-solid fa-coins"></i> Bets
              </RouterLink>

              <RouterLink to="/standings" class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                <i class="fa-solid fa-trophy"></i> Standings
              </RouterLink>

              <button @click="logOut" class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                <i class="fa-solid fa-right-from-bracket"></i> Log out
              </button>
            </template>

            <template v-else>
              <RouterLink to="/login" class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                <i class="fa-solid fa-right-to-bracket"></i> Log in
              </RouterLink>
            </template>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button @click="toggleMenu" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <i class="fa-solid" :class="isMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-show="isMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <RouterLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
            <i class="fa-solid fa-house"></i> Home
          </RouterLink>

          <template v-if="showUserMenu">
            <RouterLink to="/profile" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <i class="fa-solid fa-user"></i> Profile
            </RouterLink>

            <RouterLink to="/bets" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <i class="fa-solid fa-coins"></i> Bets
            </RouterLink>

            <RouterLink to="/standings" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <i class="fa-solid fa-trophy"></i> Standings
            </RouterLink>

            <button @click="logOut" class="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <i class="fa-solid fa-right-from-bracket"></i> Log out
            </button>
          </template>

          <template v-else>
            <RouterLink to="/login" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <i class="fa-solid fa-right-to-bracket"></i> Log in
            </RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>

<style>
@import "assets/base.css";

.router-link-active {
  @apply bg-gray-700 text-white;
}

/* Override base.css styles for dark theme */
body {
  @apply bg-gray-900 text-white;
}

.nav {
  @apply bg-gray-800;
}

.item {
  @apply text-gray-300 hover:bg-gray-700 hover:text-white;
}
</style>
