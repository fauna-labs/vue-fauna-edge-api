<template>
  <div>
    <v-card height="300">
      <div v-if="authenticated">
        <Landing></Landing>
      </div>
      <div v-else>
        <v-card-text class="headline">Click Login to start</v-card-text>
        <v-img :src="require('../assets/app.png')"></v-img>
      </div>
    </v-card>
  </div>
</template>

<script>
import Landing from "@/components/Landing";

export default {
  name: 'home',
  data: function() {
    return {
      token: null
    }
  },
  components: {
    Landing
  },
  computed: {
    authenticated() {
      return this.$root.$children[0].authenticated;
    }
  },
  methods: {
  }
}
</script>