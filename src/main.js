// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { Auth0Plugin } from "@/auth";

Vue.config.productionTip = false

const auth0Domain = process.env.VUE_APP_AUTH0_DOMAIN;
const auth0ClientId = process.env.VUE_APP_AUTH0_CLIENT_ID;
const customAudience = process.env.VUE_APP_FAUNA_ACCESS_PROVIDER_AUD
Vue.use(Auth0Plugin, {
  domain: auth0Domain,
  clientId: auth0ClientId,
  audience: customAudience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  }
});

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
