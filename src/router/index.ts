import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import BetsView from "@/views/BetsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
    },
    {
      path: "/bets",
      name: "bets",
      component: BetsView,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login", "/home", "/"];
  const authRequired = !publicPages.includes(to.path);
  const user = localStorage.getItem("user");
  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !user) {
    next("/login");
  } else {
    next();
  }
});

export default router;
