<template>
  <div>
    <q-card class="q-pa-md q-mb-xl" id="card" bordered>
      <div class="q-mb-sm">
        <q-card-section horizontal>
          <q-input
            square
            filled
            clearable
            tabindex="1"
            v-model="serverData.smtp_server"
            label="smtp server"
            class="q-mr-md"
            style="width: 45%"
          />
          <q-input
            square
            filled
            tabindex="2"
            v-model="serverData.smtp_port"
            type="number"
            label="smtp port"
            style="width: 45%"
          />
        </q-card-section>
      </div>
      <div class="q-mb-sm">
        <q-card-section horizontal>
          <q-input
            square
            filled
            clearable
            tabindex="3"
            v-model="serverData.smtp_auth_method"
            type="text"
            label="smtp auth method"
            class="q-mr-md"
            style="width: 45%"
          />
          <q-checkbox
            tabindex="4"
            v-model="serverData.smtp_secure"
            label="smtp secure"
          />
        </q-card-section>
      </div>
      <div class="q-mb-sm">
        <q-card-section horizontal>
          <q-input
            square
            filled
            clearable
            tabindex="5"
            v-model="serverData.smtp_username"
            type="text"
            label="username"
            class="q-mr-md"
            style="width: 45%"
          />
          <q-input
            square
            v-model="serverData.smtp_password"
            tabindex="6"
            filled
            clearable
            :type="isPwdSignIn ? 'password' : 'text'"
            v-on:keyup.enter="doUpdateServerData"
            name="password"
            label="Password"
            style="width: 45%"
          >
            <template v-slot:append>
              <q-icon
                :tabindex="-1"
                :name="isPwdSignIn ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwdSignIn = !isPwdSignIn"
              />
            </template>
          </q-input>
        </q-card-section>
      </div>
      <div class="q-mb-sm">
        <q-input
          square
          filled
          clearable
          tabindex="7"
          v-model="serverData.server_url"
          type="url"
          label="server url"
          style="width: 45%"
        />
      </div>
      <div class="q-mb-sm">
        <q-input
          square
          filled
          clearable
          tabindex="8"
          v-model="serverData.confirm_account_mail_template_title"
          type="text"
          label="confirm account title"
          style="width: 90%"
        />
      </div>
      <div class="q-mb-sm">
        <q-input
          square
          filled
          clearable
          tabindex="9"
          v-model="serverData.confirm_account_mail_template_text"
          type="textarea"
          label="confirm account text"
          style="width: 90%"
        />
      </div>
      <div class="q-mb-sm">
        <q-input
          square
          filled
          clearable
          tabindex="10"
          v-model="serverData.confirm_account_mail_template_html"
          type="textarea"
          label="confirm account html"
          style="width: 90%"
        />
      </div>
      <div class="q-mb-sm">
        <q-input
          square
          filled
          clearable
          tabindex="11"
          v-model="serverData.reset_password_mail_template_title"
          type="text"
          label="reset password title"
          style="width: 90%"
        />
      </div>
      <div class="q-mb-sm">
        <q-input
          square
          filled
          clearable
          tabindex="12"
          v-model="serverData.reset_password_mail_template_text"
          type="textarea"
          label="reset password text"
          style="width: 90%"
        />
      </div>
      <q-input
        square
        filled
        clearable
        tabindex="13"
        v-model="serverData.reset_password_mail_template_html"
        type="textarea"
        label="reset password html"
        style="width: 90%"
      />
      <q-card-section>
        <div class="q-pa-md q-gutter-sm">
          <div class="row justify-center q-pb-lg">
            <q-btn
              class="align-center q-mr-md"
              label="Cancel"
              color="primary"
              :tabindex="14"
              @click="doCancelUpdate"
            />

            <q-btn
              class="align-center q-mr-md"
              label="Update server data"
              color="primary"
              :tabindex="14"
              @click="doUpdateServerData"
            />

            <q-btn
              class="align-center"
              label="Reset to default"
              color="primary"
              :tabindex="14"
              @click="doResetDefaultAll"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useServerDataStore } from '../stores/serverData'
import { useQuasar } from 'quasar'

const serverDataStore = useServerDataStore();
const isPwdSignIn= ref(true);
const serverData = ref(serverDataStore.getServerData);
const $q = useQuasar();

async function doUpdateServerData() {
  try {
    await serverDataStore.updateServerData({ data: serverData });
    $q.notify({ type: "positive", message: "Server data updated" });
  } catch (err) {
    $q.notify({
    type: "negative",
    message: "Error in updating server data",
    });
  }
}
async function doCancelUpdate() {
    await serverDataStore.resetServerData();
}
async function doResetDefaultAll() {
  try {
    await serverDataStore.resetDefaultAll();
      $q.notify({
      type: "positive",
      message: "Server data reset to default values",
    });
  } catch (err) {
      $q.notify({
      type: "negative",
      message: "Error in resetting server data",
    });
  }
}
</script>
<style>
#card {
  border-radius: 10px;
}
input[type="text"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}
input[type="textaerea"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

input[type="password"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}
input[type="url"] {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}
</style>
