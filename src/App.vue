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
        <v-icon class="ml-1">mdi-account-arrow-right</v-icon>
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
    return {}
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