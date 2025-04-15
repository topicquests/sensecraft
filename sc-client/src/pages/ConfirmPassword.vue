<template>
  <q-page class="bg-secondary">
    <q-card border-true class="card fixed-center q-pa-md">
      <q-form>
        <h2>Reset Your Password</h2>
        <p>
          Please enter your email address. You will receive a link to create a
          new password via email
        </p>
        <q-input
          class="q-mb-md"
          clearable
          standout="bg-teal text-white"
          color="whitesmoke"
          v-model="email"
          type="email"
          name="email"
          label="* Email"
          tabindex="1"
          v-on:keyup.enter="sendConfirmationEmail"
        >
          <template v-slot:prepend>
            <q-icon name="email" :tabindex="-1" />
          </template>
        </q-input>
        <div class="row justify-center q-pt-lg q-pb-lg">
          <q-btn
            class="align-center"
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

<style>
.card {
  background-color: lightgray;
  width: 30%;
}

input[type='email'] {
  font-size: 14pt;
}
</style>
