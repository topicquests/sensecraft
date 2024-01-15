<template>
  <q-page
    class="window-height window-width row justify-center items-center animated-bg bg-secondary"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <div>
          <signinCard v-on:doLogin="doLogin"></signinCard>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import signinCard from "../components/signin-card.vue";
import { mapGetters, mapActions } from "vuex";
import { MemberActionTypes } from "../store/member";

@Component<SigninPage>({
  meta: {
    title: "Sign In",
  },
  components: {
    signinCard: signinCard,
  },
  computed: { ...mapGetters("member", ["getUserId"]) },
  methods: {
    ...mapActions("member", ["signin", "ensureLoginUser"]),
  },
})
export default class SigninPage extends Vue {
  isPwd = true;
  isPwdSignIn = true;
  showDialog = true;
  formData = { mail: null, pass: null };

  ensureLoginUser!: MemberActionTypes["ensureLoginUser"];
  signin!: MemberActionTypes["signin"];

  async doLogin(formData: { mail: { toString: () => string }; pass: any }) {
    try {
      this.formData.mail = formData.mail.toString().toLowerCase();
      this.formData.pass = formData.pass;
      const signInResp = await this.signin({ data: this.formData });
      if (!signInResp) {
        throw "login failed";
      }
      await this.ensureLoginUser();
      this.goNext();
    } catch (AxiosError) {
      const errorString = AxiosError.response.data.message;
      console.log("Error with sign in", errorString);
      if (errorString == "invalid confirmed / Cannot login untilconfirmed") {
        this.$q.notify({
          type: "negative",
          message:
            "You have not been confirmed. Check your email for confirmation link",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message:
            "Problem signing in verify you have entered correctemail and password ",
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
    // Workaround needed because of timing issues (sequencing of'hide'and 'ok' events)...
    setTimeout(() => {
      this.goHome();
    }, 50);
  }
}
</script>

<style>
input[type="email"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}

input[type="password"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
</style>
