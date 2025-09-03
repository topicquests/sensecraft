<template>
  <div>
    <q-card-section>
      <q-form @submit.prevent="doRegister" class="q-gutter-md">
        <!-- Email -->
        <q-input
          ref="emailInput"
          outlined
          dense
          clearable
          v-model="formdata.email"
          type="email"
          name="email"
          label="Email"
          tabindex="1"
          @blur="validateEmail"
        >
          <template v-slot:prepend>
            <q-icon name="email" tabindex="-1" />
          </template>
        </q-input>
        <span class="text-red text-caption" v-if="emailError">
          {{ emailError }}
        </span>

        <!-- Name -->
        <q-input
          outlined
          dense
          clearable
          v-model="formdata.name"
          type="text"
          label="Full Name"
          name="name"
          tabindex="2"
        >
          <template v-slot:prepend>
            <q-icon name="person" tabindex="-1" />
          </template>
        </q-input>

        <!-- Handle -->
        <q-input
          outlined
          dense
          clearable
          v-model="formdata.handle"
          type="text"
          name="handle"
          label="Handle"
          tabindex="3"
        >
          <template v-slot:prepend>
            <q-icon name="account_circle" tabindex="-1" />
          </template>
        </q-input>

        <!-- Password -->
        <q-input
          outlined
          dense
          clearable
          v-model="formdata.password"
          :type="isPwd ? 'password' : 'text'"
          name="password"
          label="Password"
          tabindex="4"
        >
          <template v-slot:prepend>
            <q-icon name="lock" tabindex="-1" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
              tabindex="-1"
            />
          </template>
        </q-input>

        <!-- Confirm Password -->
        <q-input
          outlined
          dense
          clearable
          v-model="confirmPassword"
          :type="isConfirmPwd ? 'password' : 'text'"
          name="confirmPassword"
          label="Confirm Password"
          tabindex="5"
          @blur="validatePasswordMatch"
        >
          <template v-slot:prepend>
            <q-icon name="lock" tabindex="-1" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isConfirmPwd = !isConfirmPwd"
              tabindex="-1"
            />
          </template>
        </q-input>
        <span class="text-red text-caption" v-if="passwordError">
          {{ passwordError }}
        </span>

        <!-- Submit -->
        <q-card-section>
          <q-card-actions>
            <q-btn
              unelevated
              size="lg"
              color="deep-purple-7"
              class="text-white full-width"
              label="Get Started"
              name="registerButton"
              type="submit"
            />
          </q-card-actions>
        </q-card-section>

        <!-- Link to Sign In -->
        <q-card-section class="text-center q-pa-sm">
          <router-link to="/signin" class="text-grey-6">
            Already have an account? Sign in
          </router-link>
        </q-card-section>
      </q-form>
    </q-card-section>
  </div>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { ref } from 'vue';

export interface FormData {
  email?: string;
  handle?: string;
  name?: string;
  password?: string;
}

// Emits
const emit = defineEmits(['doRegister']);

// Reactive Variables
const isPwd = ref(true);
const isConfirmPwd = ref(true);
const formdata = ref<FormData>({});
const confirmPassword = ref<string>('');
const emailError = ref<string | null>(null);
const passwordError = ref<string | null>(null);

// Functions
function doRegister() {
  validateEmail();
  validatePasswordMatch();

  if (emailError.value || passwordError.value) {
    Notify.create({
      type: 'negative',
      message: 'Please fix errors before continuing',
      color: 'negative',
    });
    return;
  }

  emit('doRegister', formdata.value);
}

function getFormData() {
  return formdata.value;
}

function validateEmail() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = emailPattern.test(formdata.value.email || '')
    ? null
    : 'Invalid email format';
}

function validatePasswordMatch() {
  passwordError.value =
    formdata.value.password === confirmPassword.value
      ? null
      : 'Passwords do not match';
}

defineExpose({ getFormData, validateEmail, validatePasswordMatch, formdata });
</script>

<style scoped>
.full-width {
  width: 100%;
}
.text-red {
  color: red;
}
</style>
