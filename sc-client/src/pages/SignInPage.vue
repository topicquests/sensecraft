<template>
  <q-page class="signin-page window-height window-width row justify-center items-center">
    <node-pattern color="#ffffff" :opacity="0.1" />
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
import NodePattern from '../components/graphics/NodePattern.vue';
import { useMemberStore } from '../stores/member';
import { useQuasar } from 'quasar';
import axios from 'axios';

const router = useRouter();
const $q = useQuasar();
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
    $q.notify({
      type: 'positive',
      message: 'You are logged in',
    });
    await goNext();
  } catch (error) {
    let message;
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data.message;
    } else message = String(error);
    console.log('error message ', message);

    if (message == 'invalid confirmed / Cannot login until confirmed') {
      $q.notify({
        type: 'negative',
        message:
          'You have not been confirmed. Check your email for confirmation link',
      });
    } else {
      $q.notify({
        type: 'negative',
        message:
          'Problem signing in verify you have entered correctemail and password ',
      });
    }
  }
}

async function goNext() {
  try {
    await goLobby();
  } catch (error) {
    console.log('Error ingoing to next page', error);
  }
}
async function goLobby() {
  await router.push({ name: 'lobby' });
}
</script>

<style scoped>
.signin-page {
  position: relative;
  overflow: hidden;
  background: var(--sc-color-chrome-bg);
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
