import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";
import appConfig from "@/config/config.js";

const app = createApp(App);

app.use(router);
app.use(store);

app.config.globalProperties.kcappApiUrl = appConfig.kcappApiUrl;
app.config.globalProperties.kcappSocketUrl = appConfig.kcappSocketUrl;
app.config.globalProperties.kcappOddsApiUrl = appConfig.kcappOddsApiUrl;
app.config.globalProperties.officeId = appConfig.officeId;
app.mount("#app");
