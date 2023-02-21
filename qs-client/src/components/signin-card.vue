<template>
  <q-card square class="shadow-24" style="width: 400px; height: 380px">
    <q-card-section class="bg-deep-purple-7">
      <h3 style="text-align: center" class="text-h5 text-white q-my-md">
        Welcome back!
      </h3>
    </q-card-section>
    <q-card-section>
      <q-form class="q-px-sm">
        <div class="q-mb-sm">
          <q-input
            clearable
            filled
            square
            v-model="formData.signonEmail"
            :tabindex="1"
            name="email"
            type="email"
            label="Email"
          >
            <template v-slot:prepend>
              <q-icon name="email" :tabindex="-1" />
            </template>
          </q-input>
        </div>
        <q-input
          square
          v-model="formData.password"
          tabindex="2"
          filled
          :type="isPwdSignIn ? 'password' : 'text'"
          v-on:keyup.enter="doLogin"
          name="password"
          label="Password"
        >
          <template v-slot:append>
            <q-icon
              :tabindex="-1"
              :name="isPwdSignIn ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwdSignIn = !isPwdSignIn"
            />
          </template>

          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>
      </q-form>
    </q-card-section>
    <div class="text-center q-gutter-md">
      <q-card-section>
        <q-card-actions>
          <q-btn
            name="loginBtn"
            size="lg"
            color="purple-4"
            class="text-white"
            label="Log in"
            style="width: 100%"
            @click="doLogin"
          />
        </q-card-actions>
        <q-card-section class="text-center q-pa-sm">
          <router-link to="/register" class="text-grey-6"
            >New user?</router-link
          >
          <div>
            <router-link to="/confirmPassword" class="text-grey-6"
              >Forgot password?</router-link
            >
          </div>
        </q-card-section>
      </q-card-section>
    </div>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import { MemberActionTypes } from "../store/member";

@Component<SigninCard>({
  name: "signinCard",

  computed: { ...mapGetters("member", ["getUserId"]) },

  methods: {
    ...mapActions("member", ["signin", "ensureLoginUser"])
  }
})
export default class SigninCard extends Vue {
  isPwd = true;
  isPwdSignIn = true;
  showDialog = true;
  formData = {
    signonEmail: null,
    password: null
  };

  ensureLoginUser!: MemberActionTypes["ensureLoginUser"];
  signin!: MemberActionTypes["signin"];

  async doLogin() {
    try {
      this.formData.signonEmail = this.formData.signonEmail
        .toString()
        .toLowerCase();
      const signInResp = await this.signin({
        params: {
          password: this.formData.password,
          email: this.formData.signonEmail
        }
      });
      if (!signInResp) {
        throw "login failed";
      }
      await this.ensureLoginUser();
      this.goNext();
    } catch (AxiosError) {
      const errorString = AxiosError.response.data.message;
      console.log("Error with sign in ", errorString);
      if (errorString == "invalid confirmed / Cannot login untilconfirmed") {
        this.$q.notify({
          type: "negative",
          message:
            "You have notbeenconfirmed. Check your email for confirmation link"
        });
      } else {
        this.$q.notify({
          type: "negative",
          message:
            "Problem signing in verify you have entered correctemail and password "
        });
      }
    }
  }
  async goNext() {
    try {
      this.goLobby();
    } catch (error) {
      console.log("Error ingoing to next page", error);
    }
  }
  goHome() {
    this.$router.push({ name: "home" });
  }
  goLanding() {
    this.$router.push({ name: "landingPage" });
  }

  goLobby() {
    this.$router.push({ name: "lobby" });
  }
  onHide() {
    // Workaround needed because of timing issues (sequencing of 'hide'and 'ok' events) ...
    setTimeout(() => {
      this.goHome();
    }, 50);
  }
}
</script>
