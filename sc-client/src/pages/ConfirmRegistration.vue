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

<script setup lang="ts">
import { Notify, useQuasar } from "quasar";
import { useRoute, useRouter } from 'vue-router'
import { onBeforeMount } from "vue";
import { useMemberStore } from "src/stores/member";

  let email: string | null= null;
  let token: string | null = null;
  const $q = useQuasar();
  const router = useRouter();
  const route = useRoute();
  const memberStore = useMemberStore()
 

  async function resend() {
    let theEmail = email;
    if (!theEmail) {
      $q.notify({ type: "negative", message: "Missing Email" });
      return;
    }
    await memberStore.sendConfirmEmail(theEmail);
  }

  async function getNewToken(prevToken: string | null) {
    try {
      await memberStore.renewToken();
      await memberStore.fetchLoginUser();
      Notify.create({
        message: "Email Verified. You are now signed in",
        color: "positive",
      });
      router.push({ name: "lobby" });
    } catch (err) {
      $q.notify({
        message:
          "There was an error renewing token. Please resend email verification.",
        color: "negative",
      });
    }
  }
  onBeforeMount(async() =>{
    const tokenArg = route.query.token;
    if (tokenArg) {
      token = Array.isArray(tokenArg) ? tokenArg[0] : tokenArg;
      await getNewToken(token);
    }
  })
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
