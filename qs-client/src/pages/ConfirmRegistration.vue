<template>
  <q-page class="bg-secondary">
    <div>
      <q-card class="card fixed-center q-pa-md item">
        <span class="q-pb-md q-pl-md" v-if="token"> Email verified </span>

        <span class="q-pl-md q-pr-md q-pb-md text-start" v-else
          >A confirmation email has been seent to your registered email account.
          Please click on link in email to confirm registration. You may also
          need to check in your spam for request. You can request a new
          confirmation below. Please click button below to resend email
          verification.</span
        >

        <div class="q-mt-md row justify-center">
          <q-input
            square
            clearable
            v-model="email"
            type="email"
            name="email"
            label="  Email"
            tabindex="1"
            v-on:keyup.enter="resend"
            class="reg-email-input"
            style="width: 80%"
          >
          </q-input>
        </div>
        <div class="row justify-center q-pt-lg q-pb-lg">
          <q-btn
            class="align-center"
            label="Resend email Verification"
            color="primary"
            @click="resend"
          />
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
  meta: { title: "Confirm" },

  methods: {
    ...mapActions("member", [
      "renewToken",
      "fetchLoginUser",
      "sendConfirmEmail",
    ]),
  },
})
export default class ConfirmRegistration extends Vue {
  email: string = null;
  token: string = null;
  renewToken!: MemberActionTypes["renewToken"];
  fetchLoginUser!: MemberActionTypes["fetchLoginUser"];
  sendConfirmEmail!: MemberActionTypes["sendConfirmEmail"];

  async resend() {
    let theEmail = this.email;
    if (!theEmail) {
      this.$q.notify({ type: "negative", message: "Missing Email" });
      return;
    }
    await this.sendConfirmEmail({ data: { email: theEmail } });
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
    if (tokenArg) {
      this.token = Array.isArray(tokenArg) ? tokenArg[0] : tokenArg;
      await this.getNewToken(this.token);
    }
  }
}
</script>
<style>
.card {
  width: 40%;
  background-color: rgb(211, 256, 238);
}

.reg-email-input {
  background-color: rgb(235, 247, 238);
  border-radius: 5px;
  font-size: 12px;
  box-shadow: 0 0 15px 4px;
}
</style>
