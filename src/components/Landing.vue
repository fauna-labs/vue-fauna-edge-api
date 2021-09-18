<template>
  <div>{{ email }}</div>
</template>

<script>
import atob from 'atob';

export default {
  name: "landing-page",
  data: function () {
    return {
      idToken: null,
      token: null,
      found: false,
      email: undefined
    };
  },
  methods: {},
  async mounted() {
    try {
      this.token = await this.$auth.getTokenSilently();
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const userid = payload.sub.split('|')[1];
      this.idToken = await this.$auth.getIdTokenClaims();
      this.email = this.idToken ? this.idToken.email : undefined;

      const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
      };
      let response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/users/${userid}`, {
        method: "GET",
        mode: "cors",
        headers: headers
      });
      this.found = response.status >= 200 && response.status < 300;

      if (this.found) {
        const res = await response.json();
        this.email = res.email;
        this.$root.$children[0].email = this.email;
      } else {
        response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/users`, {
          method: "POST",
          mode: "cors",
          headers: headers,
          body: JSON.stringify({
            email: this.email
          })
        });
      }
    } catch(e) {
      console.log('ERROR:', e);
    }
  },
};
</script>