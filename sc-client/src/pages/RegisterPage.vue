<template>
  <q-page
    class="registration-page window-height window-width row justify-center items-center"
  >
    <node-pattern color="#ffffff" :opacity="0.1" />
    <div class="column items-center">
      <q-card class="registration-card">
        <!-- Header -->
        <q-card-section class="registration-card__header">
          <div class="text-h5 flex items-center justify-center q-my-sm">
            <q-icon name="person_add" size="md" class="q-mr-sm" />
            Create Your Account
          </div>
        </q-card-section>

        <q-separator />

        <!-- Registration Form -->
        <q-card-section class="q-pa-md">
          <registration-form @doRegister="doRegister" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useMemberStore } from '../stores/member';
import NodePattern from '../components/graphics/NodePattern.vue';
import registrationForm, {
  FormData,
} from '../components/registration-form.vue';

// Stores
const memberStore = useMemberStore();
const router = useRouter();

// Validation
function validate(formData: FormData) {
  if (!formData.email) {
    throwError('Missing Email');
  }
  if (!formData.handle) {
    throwError('Missing Handle');
  }
  if (!formData.name) {
    throwError('Missing Name field');
  }
  if (!formData.password) {
    throwError('Missing Password');
  }
}

function throwError(msg: string) {
  Notify.create({ type: 'negative', message: msg, color: 'negative' });
  throw new Error(`Validation error: ${msg}`);
}

// Registration
async function doRegister(formData: FormData) {
  try {
    validate(formData);

    if (formData.email) {
      formData.email = formData.email.toLowerCase();
    }

    const res = await memberStore.registerUser(formData);

    if (res) {
      Notify.create({
        message:
          '✅ Account created successfully. Please check your email for a confirmation link.',
        color: 'positive',
      });
      await router.push({ name: 'confirm_registration' });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error);
      Notify.create({
        message: '❌ There was an error creating your account.',
        color: 'negative',
      });
    } else {
      console.error('Unexpected error:', error);
      Notify.create({
        message:
          '⚠️ Something went wrong. Please try again or contact support.',
        color: 'negative',
      });
    }
  }
}
</script>

<style scoped>
.registration-page {
  position: relative;
  overflow: hidden;
  background: var(--sc-color-chrome-bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registration-card {
  width: 420px;
  max-width: 90vw;
  border-radius: var(--sc-radius-lg);
  box-shadow: var(--sc-shadow-lg);
}

.registration-card__header {
  background: var(--sc-color-primary);
  color: #ffffff;
  text-align: center;
  border-radius: var(--sc-radius-lg) var(--sc-radius-lg) 0 0;
}
</style>
