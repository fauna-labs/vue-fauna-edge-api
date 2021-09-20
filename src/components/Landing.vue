<template>
  <div>
    <v-dialog v-model="captureProfile" width="600">
      <div class="d-flex justify-center">
        <CaptureProfile
          @success="success"
        >
        </CaptureProfile>
      </div>
    </v-dialog>
    <v-card v-if="foundInFauna" flat>
      <v-card-text>
        <p class="overline mb-0">access_token</p>
        <p class="caption">{{ token }}</p>
        <p class="overline mb-0">Profile</p>
        <p class="caption" v-if="profile"><b>Name:</b> {{ profile.name }}</p>
        <div class="d-inline-flex" v-if="profile && profile.address">
          <p class="caption pr-4"><b>City:</b> {{ profile.address.city }}</p>
          <p class="caption"><b>Country:</b> {{ profile.address.country }}</p>
        </div>
      </v-card-text>
    </v-card>
  </div>

</template>

<script>
import atob from 'atob';
import CaptureProfile from '@/components/CaptureProfile'

export default {
  name: "landing-page",
  data: function () {
    return {
      idToken: null,
      token: null,
      userid: undefined,
      foundInFauna: false,
      email: undefined,
      profile: undefined,
      captureProfile: false
    };
  },
  components: {
    CaptureProfile
  },
  methods: {
    async faunaGetUser() {
      const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
      };
      const getUserResponse = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/users/${this.userid}`, {
        method: "GET",
        mode: "cors",
        headers: headers
      });
      this.foundInFauna = getUserResponse.status >= 200 && getUserResponse.status < 300;

      if (this.foundInFauna) {
        const res = await getUserResponse.json();
        this.email = res.email;
        this.profile = res.profile;
        this.$root.$children[0].email = this.email;
      }
    },
    async faunaCreateUser() {
      const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
      };
      await fetch(`${process.env.VUE_APP_API_ENDPOINT}/users`, {
        method: "POST",
        mode: "cors",
        headers: headers,
        body: JSON.stringify({
          email: this.email
        })
      });
    },
    async success() {
      this.captureProfile = false;
      await this.faunaGetUser();
    }
  },
  async mounted() {
    try {
      this.token = await this.$auth.getTokenSilently();
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      this.userid = payload.sub;
      this.idToken = await this.$auth.getIdTokenClaims();
      this.email = this.idToken ? this.idToken.email : undefined;

      await this.faunaGetUser();

      if (!this.foundInFauna) {
        await this.faunaCreateUser();
      }

      this.captureProfile = (this.email && !this.profile);

    } catch(e) {
      console.log('ERROR:', e);
    }
  }
};
</script>