import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// import the plugin
import VueGAPI from "vue-gapi";

// create the 'options' object
const apiConfig = {
  clientId:
    "20580427167-5dcn0fcdd8r36g5ch3h2ehafpo96q7v3.apps.googleusercontent.com",
  discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  scope: "https://www.googleapis.com/auth/spreadsheets"
  // see all available scopes here: https://developers.google.com/identity/protocols/googlescopes'
};

// Use the plugin and pass along the configuration
Vue.use(VueGAPI, apiConfig);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
