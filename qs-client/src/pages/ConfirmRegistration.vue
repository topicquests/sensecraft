<template>
  <q-page class="bg-secondary">
    <div>
      <q-card  class="card fixed-center q-pl-md q-pt-md">
        <span class="q-pb-md q-pl-md" v-if="token"
          >If this screen is being displayed it is due to an issue with email
          verification. Please click button below to resend email verification.
          If you have reached this screen after another attempt please contact
          SenseCraft administrator</span
        >
        <span class="q-pb-md q-pl-md" v-else
          >Give your email if you want us to resend your confirmation email</span
        >
        <div class="row justify-center q-pt-lg q-pb-lg">
          <q-btn
            class="align-center"
            label="Resend email Verification"
            color="primary"
            @click="resend"
          />
        </div>
        <div>
          <q-input
            square
            clearable
            v-model="email"
            type="email"
            name="email"
            label="Email"
            tabindex="1"
            v-on:keyup.enter="resend"
          >
          </q-input>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { mapActions } from "vuex";
import { MemberActionTypes } from "src/store/member";
import { Notify } from "quasar";

@Component<ConfirmRegistration>({
  name: "confirm_registration",

  methods: {
    ...mapActions("member", ["renewToken", "fetchLoginUser", "sendConfirmEmail"]),
  },
})
export default class ConfirmRegistration extends Vue {
  email: string = null;
  token: string = null;
  renewToken!: MemberActionTypes["renewToken"];
  fetchLoginUser!: MemberActionTypes["fetchLoginUser"];
  sendConfirmEmail!: MemberActionTypes["sendConfirmEmail"];

  resend() {
    let theEmail = this.email;
    if (!theEmail) {
      this.$q.notify({ type: "negative", message: "Missing Email" });
      return;
    }
    this.sendConfirmEmail({ data: { email: theEmail }});
  }

  async getNewToken(prevToken) {
    try {
      await this.renewToken({ data: { token: prevToken } });
      await this.fetchLoginUser();
      Notify.create({
        message: "Email Verified. You are now signed in",
        color: "positive",
      });
      this.$router.push({ name: "lobby" });
    } catch (err) {
      this.$q.notify({
        message:
          "There was an error renewing token. Please resend email verification.",
        color: "negative",
      });
    }
  }

  async beforeMount() {
    const tokenArg = this.$route.query.token;
    this.token = (Array.isArray(tokenArg)) ? tokenArg[0] : tokenArg;
    await this.getNewToken(this.token);
  }
}
</script>
<style>
.card {
  width: 40%;
  background-color: rgb(211, 256, 238);
}

input[type="email"] {
  padding: 10px;
  background-color: rgb(235, 247, 238);
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
  box-shadow: 0 0 15px 4px;
}
</style>
