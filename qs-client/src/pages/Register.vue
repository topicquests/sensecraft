
<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274C5, #5A4A9F);"
  >
    <div class="column q-pa-lg">
      <div class="row">
      </div>
    </div>
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width:300px;height:485px;">
          <q-card-section class="bg-deep-purple-7">
            <h4 class="text-h5 text-white q-my-md">Registration</h4>
            <div class="absolute-bottom-right q-pr-md" style="transform: translateY(50%);">
              <q-btn fab icon="close" color="purple-4" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-px-sm q-pt-xl q-pb-lg">
              <q-input
                square clearable
                v-model="formdata.email"
                type="email"
                label="Email"
                tabindex="1">
              <template v-slot:prepend>
                <q-icon name="email"
                tabindex="-1"/>
              </template>
              </q-input>
              <q-input
                square clearable
                v-model="formdata.name"
                label="Name"
                tabindex="2">
              <template v-slot:prepend>
                <q-icon name="person"
                tabindex="-1"/>
              </template>
              </q-input>
              <q-input
                square
                clearable
                v-model="formdata.handle"
                label="handle"
                tabindex="3">
              <template v-slot:prepend>
                <q-icon
                  name="person"
                  tabindex="-1" />
              </template>
              </q-input>
              <q-input
                sqaure clearable
                v-model="formdata.password"
                filled :type="isPwd ? 'password' : 'text'"
                label = "Password"
                tabindex="4"
                v-on:keyup.enter="doRegister">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                    @click="isPwd = !isPwd"
                    tabindex="-1"/>
                </template>
                <template v-slot:prepend>
                  <q-icon name="lock"
                  tabindex="-1"/>
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-xl q-pt-lg">
            <q-btn
              unelevated size="lg"
              color="purple-4"
              class="full-width text-white"
              label="Get Started"
              @click="doRegister"/>
          </q-card-actions>
          <q-card-section class="text-center q-pa-sm">
            <p class="text-grey-6">Return to login</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>

import { mapState, mapActions } from "vuex";

export default {
  data() {
  return {
    formdata: {
    email: null,
    handle: null,
    name: null,
    password: null,
    },
    isPwd: true,
    isPwdSignIn: true,
    showDialog: true,
    title: "Register"
  };
  },

  methods: {
  doRegister() {
    const theEmail = this.formdata.email;
    const theHandle = this.formdata.handle;
    const theName = this.formdata.name;

    if (!theEmail) {
      this.$q.notify({ type: "negative", message: "Missing Email" });
      return;
    }

    if (!theHandle) {
      this.$q.notify({ type: "negative", message: "Missing Handle" });
      return;
    }

    if (!theName) {
      this.$q.notify({ type: "negative", message: "Missing name field" });
      return;
    }

    if (!this.formdata.password) {
      this.$q.notify({ type: "negative", message: "Missing Password" });
      return;
    }

    this.$store.dispatch("member/registerUser", {formdata: this.formdata})
  },

  goHome() {
    this.$router.push({ name: "home" });
  },

  onHide() {
  // Workaround needed because of timing issues (sequencing of 'hide' and 'ok' events) ...
    setTimeout(() => {
      this.goHome();
      }, 50);
    },
  },
};
</script>

<style>
input:focus {
  background-color: rgb(204, 208, 212);
}
</style>
