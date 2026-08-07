<template>
  <q-page class="auth-page">
    <q-card class="auth-card q-pa-md">
      <div v-if="token" class="text-body1">Email verified</div>

      <p v-else class="sc-text-muted">
        A confirmation email has been sent to your registered email account.
        Please click on the link in the email to confirm registration. You may
        also need to check your spam folder. You can request a new
        confirmation below.
      </p>

      <div class="q-mt-md row justify-center">
        <q-input
          filled
          clearable
          v-model="email"
          type="email"
          name="email"
          label="Email"
          tabindex="1"
          v-on:keyup.enter="resend"
          class="full-width"
        >
        </q-input>
      </div>
      <div class="row justify-center q-pt-lg q-pb-lg">
        <q-btn
          unelevated
          label="Resend email Verification"
          color="primary"
          @click="resend"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Notify, useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount } from 'vue';
import { useMemberStore } from '../stores/member';

// eslint-disable-next-line prefer-const
let email: string | null = null; // must be non-const because used as model
let token: string | null = null;
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const memberStore = useMemberStore();

async function resend() {
  const theEmail = email;
  if (!theEmail) {
    $q.notify({ type: 'negative', message: 'Missing Email' });
    return;
  }
  await memberStore.sendConfirmEmail(theEmail);
}

async function getNewToken(prevToken: string) {
  try {
    await memberStore.renewToken(prevToken);
    await memberStore.fetchLoginUser();
    Notify.create({
      message: 'Email Verified. You are now signed in',
      color: 'positive',
    });
    await router.push({ name: 'lobby' });
  } catch (err) {
    console.log('Error renewing token: ', err);
    $q.notify({
      message:
        'There was an error renewing token. Please resend email verification.',
      color: 'negative',
    });
  }
}
onBeforeMount(async () => {
  const tokenArg = route.query.token;
  if (tokenArg) {
    token = Array.isArray(tokenArg) ? tokenArg[0] : tokenArg;
    if (token) {
      await getNewToken(token);
    }
  }
});
</script>
<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sc-color-bg-muted);
  padding: var(--sc-space-24);
}

.auth-card {
  width: 480px;
  max-width: 100%;
  border-radius: var(--sc-radius-lg);
}
</style>
