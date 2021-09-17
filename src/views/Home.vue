<template>
  <div>
    <v-card height="300">
      <div v-if="authenticated">
        <v-btn @click="getToken">Get Token</v-btn>
      </div>
      <v-card-text v-else>Click Login to start</v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'home',
  data: function() {
    return {
      token: null
    }
  },
  computed: {
    authenticated() {
      return this.$root.$children[0].authenticated;
    }

  },
  methods: {
    async getToken() {
      this.token = await this.$auth.getTokenSilently();
    }
  },
  // async created() {
  //   console.log('M O U N T E D');
  //   if (this.$auth) {
  //     this.token = await this.$auth.getTokenSilently();
  //   } else {
  //     console.log('no auth');
  //   }
  // },
}
</script>