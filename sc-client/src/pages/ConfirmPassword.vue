<template>
  <q-page class="auth-page">
    <q-card class="auth-card q-pa-md">
      <q-form>
        <h2 class="text-h5">Reset Your Password</h2>
        <p class="sc-text-muted">
          Please enter your email address. You will receive a link to create a
          new password via email
        </p>
        <q-input
          class="q-mb-md"
          filled
          clearable
          v-model="email"
          type="email"
          name="email"
          label="Email"
          tabindex="1"
          v-on:keyup.enter="sendConfirmationEmail"
        >
          <template v-slot:prepend>
            <q-icon name="email" :tabindex="-1" />
          </template>
        </q-input>
        <div class="row justify-center q-pt-lg q-pb-lg">
          <q-btn
            unelevated
            label="Send password reset email"
            color="primary"
            @click="sendConfirmationEmail"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useMemberStore } from '../stores/member';

const q = useQuasar();
const memberStore = useMemberStore();
const email = ref<string | undefined>(undefined);

async function sendConfirmationEmail() {
  try {
    const theEmail = email.value;
    if (!theEmail) {
      q.notify({ type: 'negative', message: 'Missing Email' });
      return;
    }
    await memberStore.sendConfirmEmail(theEmail);
    q.notify({
      type: 'positive',
      message: 'Please check email for confirmation link',
    });
  } catch (err) {
    q.notify({
      type: 'negative',
      message: 'Could not reset the password',
    });
    console.log(err);
  }
}
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
