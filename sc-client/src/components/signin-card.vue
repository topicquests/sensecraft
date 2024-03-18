<template>
  <q-card class="signon-card">
    <q-card-section class="bg-deep-purple-7">
      <h3 style="text-align: center" class="text-h5 text-white q-my-md">
        Welcome back!
      </h3>
    </q-card-section>
    <q-card-section>
      <q-form class="q-px-sm">
        <div class="q-mb-sm">
          <q-input
            clearable
            filled
            square
            v-model="mail"
            :tabindex="1"
            name="email"
            type="email"
            label="Email"
          >
            <template v-slot:prepend>
              <q-icon name="email" :tabindex="-1" />
            </template>
          </q-input>
        </div>
        <q-input
          square
          v-model="pass"
          tabindex="2"
          filled
          :type="isPwdSignIn ? 'password' : 'text'"
          v-on:keyup.enter="doLogin"
          name="pass"
          label="Password"
        >
          <template v-slot:append>
            <q-icon
              :tabindex="-1"
              :name="isPwdSignIn ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwdSignIn = !isPwdSignIn"
            />
          </template>

          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>
      </q-form>
    </q-card-section>
    <div class="text-center q-gutter-md">
      <q-card-section>
        <q-card-actions>
          <q-btn
            name="loginBtn"
            size="lg"
            color="purple-4"
            class="text-white"
            label="Log in"
            style="width: 100%"
            @click="doLogin"
          />
        </q-card-actions>
        <q-card-section class="text-center q-pa-sm">
          <router-link to="/register" class="text-grey-6"
            >New user?</router-link
          >
          <div>
            <router-link to="/confirmPassword" class="text-grey-6"
              >Forgot password?</router-link
            >
          </div>
        </q-card-section>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';

let isPwdSignIn = ref(true);
const mail: Ref<string> = ref('');
const pass: Ref<string> = ref('');
let email: string;
let password: string;

const emit = defineEmits(['doLogin']);

const doLogin = () => {
  email = mail.value;
  password = pass.value;

  emit('doLogin', email, password);
};
</script>
<style>
.signon-card {
  border: 0.5em;
  border-radius: 8px;
  width: 350px;
  height: 380px;
}
input[type='email'] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
input[type='password'] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  box-sizing: border-box;
  border: none;
  width: 100%;
}
</style>
