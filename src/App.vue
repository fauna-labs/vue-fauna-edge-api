<!--
Copyright Fauna, Inc.
SPDX-License-Identifier: MIT-0
-->
<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <router-link to="/"><h1>Demo</h1></router-link>
      </div>

      <v-spacer></v-spacer>

      <div v-if="!authenticated">
        <v-btn text @click="login">
          Login
          <v-icon class="ml-1">mdi-account-arrow-left</v-icon>
        </v-btn>  
      </div>
      <v-btn text v-else @click="logout">
        Logout
        <div v-if="email" class="caption ml-2">{{ email }}</div>
        <v-icon v-else class="ml-1">mdi-account-arrow-right</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: function() {
    return {
      email: undefined
    }
  },
  computed: {
    authenticated() {
      return this.$auth.isAuthenticated
    }
  },
  methods: {
    login() {
      this.$auth.loginWithRedirect();
    },
    async logout() {
      this.$auth.logout({
        returnTo: window.location.origin,
      });
    }
  }
};
</script>