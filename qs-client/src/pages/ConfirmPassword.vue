<template>
  <q-page>
    <q-card border: true class="card fixed-center q-pl-md q-pt-md">
      <q-form>
      <h2>Reset Your Password</h2>
      <p>Please enter your email address. You will receive a link to createa new password via email</p>
        <q-input
          class="q-mb-md"
          square
          clearable
          v-model="email"
          type="email"
          name="email"
          label="Email"
          tabindex="1"
        v-on:keyup.enter="sendConfirmationEmail"
        >
        </q-input>
        <div class="row justify-center q-pt-lg q-pb-lg">
        <q-btn
            class="align-center"
            label="Reset Password"
            color="primary"
            @click="sendConfirmationEmail"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import Component from "vue-class-component"
import Vue from "vue"
import { mapActions } from "vuex";
import { MemberActionTypes } from "src/store/member";

@Component<ConfirmPassword> ({
    name: "confirm_password",

    methods: {
    ...mapActions("member", [ "sendConfirmEmail"]),
  },
})

export default class ConfirmPassword extends Vue {
    email:string=null;

    sendConfirmEmail!: MemberActionTypes["sendConfirmEmail"];

    sendConfirmationEmail() {
    try { 
        let theEmail = this.email;
        if (!theEmail) {
            this.$q.notify({ type: "negative", message: "Missing Email" });
            return;
        }
        this.sendConfirmEmail({ data: { email: theEmail }});
            this.$q.notify({type: "positive", message: "Please check email for confirmation link"})
    }
  catch(err) {
    console.log(err)
  }
}
}
</script>
