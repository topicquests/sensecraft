<template>
  <q-page
    class="window-height window-width row justify-center items-center bg-secondary"
  >
    <div class="column">
      <div class="row">
        <q-card square class="shadow-24" style="width: 400px; height: 520px">
          <q-card-section class="bg-deep-purple-7">
            <h4 style="text-align: center" class="text-h5 text-white q-my-md">
              Sign Up
            </h4>
          </q-card-section>
          <registration-form v-on:doRegister="doRegister"></registration-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useMemberStore } from '../stores/member';
import registrationForm from '../components/registration-form.vue';

interface FormData {
  email?: string;
  handle?: string;
  name?: string;
  password?: string;
}

// Stores
const memberStore = useMemberStore();

// Router
const router = useRouter();

// Functionsw
function validate(formData: FormData) {
  const theEmail = formData.email;
  const theHandle = formData.handle;
  const theName = formData.name;
  if (!theEmail) {
    Notify.create({
      type: 'negative',
      message: 'Missing Email',
      color: 'negative',
    });
    throw new Error('Validation error: Missing Email');
  }
  if (!theHandle) {
    Notify.create({
      type: 'negative',
      message: 'Missing Handle',
      color: 'negative',
    });
    throw new Error('Validation error: Missing Handle');
  }
  if (!theName) {
    Notify.create({
      type: 'negative',
      message: 'Missing Name field',
      color: 'negative',
    });
    throw new Error('Validation error: Missing Name field');
  }
  if (!formData.password) {
    Notify.create({
      type: 'negative',
      message: 'Missing Password',
      color: 'negative',
    });
    throw new Error('Validation error: Missing Password');
  }
}
async function doRegister(formData: FormData) {
  try {
    validate(formData);
    if (formData.email) {
      formData.email = formData.email.toLowerCase();
    }
    const res = await memberStore.registerUser(formData);
    console.log('Sending notification...');
    if(res) {
      Notify.create({
        message:
          'Account created successfully. Please check your email for a confirmation link.',
        color: 'positive',
      });
      await router.push({ name: 'confirm_registration' });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error);
      Notify.create({
        message: 'There was an error creating new member.',
        color: 'negative',
      });
    } else {
      console.error('Unexpected error:', error);
      Notify.create({
        message:
          'There was an error creating your account. If this issue persists, contact support.',
        color: 'negative',
      });
    }
  }
}
</script>
