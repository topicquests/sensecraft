<template>
  <q-page
    class="window-height window-width row justify-center items-center bg-secondary"
  >
    <div class="column">
      <div class="row">
        <q-card square class="shadow-24" style="width: 400px; height: 520px">
          <q-card-section class="bg-deep-purple-7">
            <h4 style="text-align: center" class="text-h5 text-white q-my-md">
              Sign Up
            </h4>
          </q-card-section>
          <q-card-section>
            <q-form>
              <div class="q-mb-sm">
                <q-input
                  square
                  clearable
                  filled
                  v-model="formdata.email"
                  type="email"
                  name="email"
                  label="Email"
                  tabindex="1"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" tabindex="-1" />
                  </template>
                </q-input>
              </div>
              <div class="q-mb-sm">
                <q-input
                  square
                  clearable
                  filled
                  v-model="formdata.name"
                  type="text"
                  label="Name"
                  name="name"
                  tabindex="2"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" tabindex="-1" />
                  </template>
                </q-input>
              </div>
              <div class="q-mb-sm">
                <q-input
                  square
                  clearable
                  filled
                  v-model="formdata.handle"
                  type="text"
                  name="handle"
                  label="Handle"
                  tabindex="3"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" tabindex="-1" />
                  </template>
                </q-input>
              </div>
              <div class="q-mb-sm">
                <q-input
                  sqaure
                  clearable
                  v-model="formdata.password"
                  filled
                  :type="isPwd ? 'password' : 'text'"
                  name="password"
                  label="Password"
                  tabindex="4"
                  v-on:keyup.enter="doRegister"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      @click="isPwd = !isPwd"
                      tabindex="-1"
                    />
                  </template>
                  <template v-slot:prepend>
                    <q-icon name="lock" tabindex="-1" />
                  </template>
                </q-input>
              </div>
            </q-form>
          </q-card-section>
          <q-card-section>
            <q-card-actions>
              <q-btn
                unelevated
                size="lg"
                color="purple-4"
                class="text-white"
                label="Get Started"
                style="width: 100%"
                name="registerButton"
                @click="doRegister"
              />
            </q-card-actions>
          </q-card-section>
          <q-card-section class="text-center q-pa-sm">
            <router-link to="/signin" class="text-grey-6"
              >Existing user?</router-link
            >
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapActions } from "vuex";
import { Notify } from "quasar";

export default {
  name: "RegisterPage",
  meta: {
    // sets document title
    title: "Register",
  },
  data() {
    return {
      ready: false,
      formdata: {
        email: null,
        handle: null,
        name: null,
        password: null,
      },
      isPwd: true,
      isPwdSignIn: true,
      showDialog: true,
      title: "Register",
    };
  },

  methods: {
    ...mapActions("member", ["registerUser"]),
    async doRegister() {
      try {
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
        // TODO: the domain can be normalized to LC, but case can be significant in the handle
        this.formdata.email = theEmail.toLowerCase();
        await this.registerUser(this.formdata);
        Notify.create({
          message:
            "Account created successfully. Please check your email for a confirmation link.",
          color: "positive",
        });
        this.$router.push({ name: "confirm_registration" });
      } catch (error) {
        if (error.message === "EXISTS") {
          Notify.create({
            message:
              "This account already exists. Try resetting your password or contact support.",
            color: "negative",
          });
        } else {
          Notify.create({
            message:
              "There was an error creating your account. If this issue persists, contact support.",
            color: "negative",
          });
        }
        console.log("There was an error registering ", error);
      }
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
input[type="email"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  border: none;

  width: 100%;
}
input[type="password"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
input[type="text"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
</style>
