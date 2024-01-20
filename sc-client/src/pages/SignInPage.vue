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
import { useMemberStore } from 'src/stores/member';

  const router = useRouter();
  const memberStore = useMemberStore();

  async function doLogin(mail: string, pass: string) {
    try {
      const email: string = mail.toString().toLowerCase();     
      const password: string = pass;
      const signInResp = await memberStore.signin(email, password);
      if (!signInResp) {
        throw 'login failed';
      }
      await memberStore.ensureLoginUser();
      goNext();
    } catch (error: unknown) {
      //const errorString = error.response.data.message;
      console.log('Error with sign in');
      /*
      if (errorString == 'invalid confirmed / Cannot login untilconfirmed') {
        $q.notify({
          type: 'negative',
          message:
            'You have not been confirmed. Check your email for confirmation link',
        });
      } else {
        .$q.notify({
          type: 'negative',
          message:
            'Problem signing in verify you have entered correctemail and password ',
        });
      }
      */
    }
  }

  function goNext() {
    try {
      goLobby();
    } catch (error) {
      console.log('Error ingoing to next page', error);
    }
  }
  function goLobby() {
    router.push({ name: 'lobby' });
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
