import { createStore } from "vuex";
import { auth } from "./auth.module";

export default createStore({
  modules: {
    auth,
  },
  mutations: {
    disableRequiredPassChange(state) {
      state.auth.user.requires_change = false;
    },
  },
});
