<template>
    <div>
        <q-card>
            <q-input v-model="serverData.smtp_server" label="smtp server" />
            <q-input v-model="serverData.smtp_port" label="smtp port" />
            <q-input v-model="serverData.smtp_auth_method" label="smtp auth method" />
            <q-input v-model="serverData.smtp_secure" label="smtp secure" />
            <q-input v-model="serverData.smtp_username" label="username" />
            <q-input v-model="serverData.smtp_password" label="password" />
            <q-input v-model="serverData.server_url" label="server url" />
            <q-input v-model="serverData.confirm_account_mail_template_title" label="confirm account title" />
            <q-input v-model="serverData.confirm_account_mail_template_text" label="confirm account text" />
            <q-input v-model="serverData.confirm_account_mail_template_html" label="confirm account html" />
            <q-input v-model="serverData.reset_password_mail_template_title" label="reset password title" />
            <q-input v-model="serverData.reset_password_mail_template_text" label="reset password text" />
            <q-input v-model="serverData.reset_password_mail_template_html" label="reset password html" />
        </q-card>
    </div>
</template>

<script lang="ts">
import { ServerData } from "src/types";
import Vue from "vue";
import Component from "vue-class-component";

@Component < ServerDataCard > ({
    name: "serverDataCard",
})
export default class ServerDataCard extends Vue {
    serverData: ServerData;
}
</script>
