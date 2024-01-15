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

<script setup lang="ts">
import { useRouter } from 'vue-router';
import signinCard from '../components/signin-card.vue';
import { AxiosError } from 'axios';

  const router = useRouter()
  let title = "Sign In";  
  let isPwd = true;
  let isPwdSignIn = true;
  let showDialog = true;
  let formData = { mail: null, pass: null };

  function doLogin(this: any, formData: any) {
    try {
      this.formData.mail = formData.mail.toString().toLowerCase();
      this.formData.pass = formData.pass;
      const signInResp = this.signin({ data: this.formData });
      if (!signInResp) {
        throw 'login failed';
      }
      // await this.ensureLoginUser();
      this.goNext();
    } catch (AxiosError: any) {
      const errorString = AxiosError.response.data.message;
      console.log('Error with sign in', errorString);
      if (errorString == 'invalid confirmed / Cannot login untilconfirmed') {
        this.$q.notify({
          type: "negative",
          message:
            'You have not been confirmed. Check your email for confirmation link',
        });
      } else {
        this.$q.notify({
          type: "negative",
          message:
            'Problem signing in verify you have entered correctemail and password ',
        });
      }
    }
  }

  function goNext(this: any) {
    try {
      this.goLobby();
    } catch (error) {
      console.log('Error ingoing to next page', error);
    }
  }
  function goHome() {
    router.push({ name: 'home' });
  }
  function goLanding() {
    router.push({ name: 'landingPage' });
  }
  function goLobby() {
    router.push({ name: 'lobby' });
  }
  function onHide() {
    // Workaround needed because of timing issues (sequencing of'hide'and 'ok' events)...
    setTimeout(() => {
      goHome();
    }, 50);
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
