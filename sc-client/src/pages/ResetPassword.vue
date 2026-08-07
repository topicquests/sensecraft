<template>
  <q-page class="auth-page">
    <q-card class="auth-card q-pa-md">
      <q-form>
        <h2 class="text-h5">Reset Password</h2>
        <q-input
          class="q-mb-md"
          filled
          clearable
          v-model="password"
          :type="isPwdReset ? 'password' : 'text'"
          name="password"
          label="New password"
          tabindex="1"
        >
          <template v-slot:append>
            <q-icon
              :tabindex="-1"
              :name="isPwdReset ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwdReset = !isPwdReset"
            />
          </template>
        </q-input>
        <q-input
          filled
          clearable
          v-model="confirm_password"
          :type="isPwdConfirmed ? 'password' : 'text'"
          name="confirm_password"
          label="Confirm Password"
          tabindex="2"
        >
          <template v-slot:append>
            <q-icon
              :tabindex="-1"
              :name="isPwdConfirmed ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwdConfirmed = !isPwdConfirmed"
            />
          </template>
        </q-input>
        <div class="row justify-center q-pt-lg q-pb-lg">
          <q-btn
            unelevated
            label="Reset Password"
            color="primary"
            :tabindex="3"
            @click="updatePassword"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { Member } from '../types';
import { waitUserLoaded } from '../app-access';
import { useQuasar } from 'quasar';
import { useMemberStore } from '../stores/member';
import { LocationQueryValue, useRoute, useRouter } from 'vue-router';

const q = useQuasar();
const router = useRouter();
const route = useRoute();
const memberStore = useMemberStore();
const password = ref<string>();
const isPwdConfirmed = ref(true);
const confirm_password = ref<string>();
const isPwdReset = ref(true);
let token: string | undefined | LocationQueryValue = undefined;
const memberId = computed((): number => memberStore.member!.id);
const member = computed((): Partial<Member> => memberStore.member!);

async function updatePassword() {
  if (!password.value) {
    q.notify({ type: 'negative', message: 'Missing Password' });
    return;
  }
  if (password.value !== confirm_password.value) {
    q.notify({ type: 'negative', message: 'Passwords do not match' });
  } else {
    try {
      await memberStore.updateUser({
        id: memberId.value,
        password: password.value,
      });
    } catch (e) {
      q.notify({
        type: 'negative',
        message: 'Could not reset the password',
      });
      console.error(e);
      return;
    }
    q.notify({ type: 'positive', message: 'Password updated' });
    router.push({ name: 'lobby' });
  }
}
async function verifyToken(token: string) {
  try {
    await memberStore.renewToken(token);
    await memberStore.ensureLoginUser();
  } catch (err) {
    q.notify({
      type: 'negative',
      message: 'Issue with verification. Retry verifying',
    });
    router.push({ name: 'confirm_password' });
  }
}
onBeforeMount(async () => {
  const tokenArg = route.query.token;
  token = Array.isArray(tokenArg) ? tokenArg[0] : tokenArg;
  if (token) {
    await verifyToken(token.toString());
  } else {
    await waitUserLoaded();
    if (!member.value) {
      q.notify({ type: 'negative', message: 'Ask to reset password' });
      router.push({ name: 'confirm_password' });
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
