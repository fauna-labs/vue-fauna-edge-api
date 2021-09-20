<template>
  <v-container class="pa-0">
    <v-card class="pa-4">
      <v-card-title>Please complete your profile</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="city"
            :rules="cityRules"
            label="City"
            required
          ></v-text-field>

          <v-text-field
            v-model="country"
            :rules="countryRules"
            label="Country"
            required
          ></v-text-field>

          <p class="overline mb-0">consent</p>
          <p class="caption">{{ ipsum }}</p>

          <v-checkbox
            v-model="consent"
            :rules="[(v) => !!v || 'You must agree to continue!']"
            label="Do you agree?"
            required
          ></v-checkbox>

          <v-btn :disabled="!valid" color="success" class="mr-4" @click="save">
            Save
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "capture-profile",
  data: function () {
    return {
      valid: true,
      name: undefined,
      nameRules: [(v) => !!v || "Name is required"],
      country: undefined,
      countryRules: [(v) => !!v || "Country is required"],
      city: undefined,
      cityRules: [(v) => !!v || "City is required"],
      ipsum:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      consent: false,
    };
  },
  methods: {
    async save() {
      this.$refs.form.validate();
      if (!this.valid) return;

      try {
        this.token = await this.$auth.getTokenSilently();
        const payload = JSON.parse(atob(this.token.split(".")[1]));
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
        };

        const userid = payload.sub;

        const res = await fetch(
          `${process.env.VUE_APP_API_ENDPOINT}/users/${userid}`,
          {
            method: "PUT",
            mode: "cors",
            headers: headers,
            body: JSON.stringify({
              profile: {
                name: this.name,
                address: {
                  city: this.city,
                  country: this.country
                },
                consentProvided: this.consent
              }
            }),
          }
        );
        if (res.status == 200) {
          this.$emit('success', true);
        }
      } catch (e) {
        console.log(`${e}`);
      }
    },
  },
};
</script>