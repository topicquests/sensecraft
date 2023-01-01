<template>
  <div>
    <q-card class="q-pa-md q-mb-xl" bordered style="width: 900px">
      <q-card-section horizontal>
        <q-input
          v-model="serverData.smtp_server"
          label="smtp server"
          class="q-mr-md"
          style="width: 45%"
        />
        <q-input
          v-model="serverData.smtp_port"
          type="number"
          label="smtp port"
          style="width: 45%"
        />
      </q-card-section>
      <q-card-section horizontal>
        <q-input
          v-model="serverData.smtp_auth_method"
          type="text"
          label="smtp auth method"
          class="q-mr-md"
          style="width: 45%"
        />
        <q-input
          v-model="serverData.smtp_secure"
          label="smtp secure"
          style="width: 45%"
        />
      </q-card-section>
      <q-card-section horizontal>
        <q-input
          v-model="serverData.smtp_username"
          type="text"
          label="username"
          class="q-mr-md"
          style="width: 45%"
        />
        <q-input
          v-model="serverData.smtp_password"
          type="password"
          label="password"
          style="width: 45%"
        />
      </q-card-section>
      <q-input
        v-model="serverData.server_url"
        type="url"
        label="server url"
        style="width: 45%"
      />
      <q-input
        v-model="serverData.confirm_account_mail_template_title"
        type="text"
        label="confirm account title"
        style="width: 75%"
      />

      <q-input
        v-model="serverData.confirm_account_mail_template_text"
        type="text"
        label="confirm account text"
        style="width: 75%"
      />
      <q-input
        v-model="serverData.confirm_account_mail_template_html"
        type="text"
        label="confirm account html"
        style="width: 75%"
      />

      <q-input
        v-model="serverData.reset_password_mail_template_title"
        type="text"
        label="reset password title"
        style="width: 75%"
      />
      <q-input
        v-model="serverData.reset_password_mail_template_text"
        type="text"
        label="reset password text"
        style="width: 75%"
      />

      <q-input
        v-model="serverData.reset_password_mail_template_html"
        type="text"
        label="reset password html"
        style="width: 75%"
      />
      <div class="row justify-center q-pt-lg q-pb-lg">
        <q-btn
          class="align-center"
          label="Update server data"
          color="primary"
          :tabindex="14"
          @click="updateServerData"
        />
      </div>
    </q-card>
  </div>
</template>

<script lang="ts">
import { ServerData } from "src/types";
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions } from "vuex";
import { ServerDataActionTypes } from "../store/serverData";

@Component<ServerDataCard>({
  name: "serverDataCard",

  methods: {
    ...mapActions("serverData", ["fetchServerData"])
  }
})
export default class ServerDataCard extends Vue {
  serverData: Partial<ServerData> = {};

  // declare the methods for Typescript ensureGuildsPlayingQuest!:
  fetchServerData!: ServerDataActionTypes["fetchServerData"];

  updateServerData() {
    try {
      this.$q.notify({ type: "positive", message: "Server data updated" });
    } catch (err) {
      this.$q.notify({
        type: "negative",
        message: "Error in updating server data"
      });
    }
  }

  beforeMount() {
    this.fetchServerData();
  }
}
</script>
<style></style>
