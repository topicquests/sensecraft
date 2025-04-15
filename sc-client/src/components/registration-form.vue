<template>
  <div>
    <q-card-section>
      <q-form>
        <div class="q-mb-sm">
          <q-input
            ref="emailInput"
            square
            clearable
            filled
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
          <span class="text-red" v-if="emailError">{{ emailError }}</span>
        </div>
        <div class="q-mb-sm">
          <q-input
            square
            clearable
            filled
            v-model="formdata.name"
            type="text"
            label="Name"
            name="name"
            tabindex="2"
          >
            <template v-slot:prepend>
              <q-icon name="person" tabindex="-1" />
            </template>
          </q-input>
        </div>
        <div class="q-mb-sm">
          <q-input
            square
            clearable
            filled
            v-model="formdata.handle"
            type="text"
            name="handle"
            label="Handle"
            tabindex="3"
          >
            <template v-slot:prepend>
              <q-icon name="person" tabindex="-1" />
            </template>
          </q-input>
        </div>
        <div class="q-mb-sm">
          <q-input
            sqaure
            clearable
            v-model="formdata.password"
            filled
            :type="isPwd ? 'password' : 'text'"
            name="password"
            label="Password"
            tabindex="4"
            v-on:keyup.enter="doRegister"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                @click="isPwd = !isPwd"
                tabindex="-1"
              />
            </template>
            <template v-slot:prepend>
              <q-icon name="lock" tabindex="-1" />
            </template>
          </q-input>
        </div>
        <q-card-section>
          <q-card-actions>
            <q-btn
              unelevated
              size="lg"
              color="purple-4"
              class="text-white"
              label="Get Started"
              style="width: 100%"
              name="registerButton"
              @click="doRegister"
            />
          </q-card-actions>
        </q-card-section>
        <q-card-section class="text-center q-pa-sm">
          <router-link to="/signin" class="text-grey-6"
            >Existing user?</router-link
          >
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
const formdata = ref<FormData>({});
const emailError = ref<string | null>(null);

// Functions
function doRegister() {
  validateEmail();
  if (emailError.value) {
    Notify.create({
      type: 'negative',
      message: 'Invalid or Missing Email',
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
  console.log('Validate email called');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = emailPattern.test(formdata.value.email || '')
    ? null
    : 'Invalid email format';
  console.log('Email Error:', emailError.value);
}

defineExpose({ getFormData, validateEmail, formdata });
</script>

<style>
input[type='email'] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
input[type='password'] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
input[type='text'] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
.text-red {
  color: red;
}
</style>
