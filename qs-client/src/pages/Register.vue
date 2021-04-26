
<template>
  <q-page :padding="true" class="flex-center" style="width:50vw;min-width:350px;">
    <div class="panel-body">
      <h6>Register</h6>
      <div slot="body">
        <div class="row q-mb-md">
          <q-input
            v-model="email"
            type="email"
            name="email"
            label="E-mail"
            stack-label
            class="full-width"
            autofocus
          />
        </div>
        <div class="row q-mb-md">
          <q-input
            v-model="fullName"
            type="text"
            name="fname"
            label="Full Name"
            stack-label
            class="full-width"
            autofocus
          />
        </div>
        <div class="row q-mb-md">
          <q-input
            v-model="handle"
            type="text"
            name="handle"
            label="Handle"
            stack-label
            class="full-width"
            autofocus
          />
        </div> 

        <div class="row q-mb-md">
          <q-input 
            v-model="password" 
            filled :type="isPwd ? 'password' : 'text'">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input> 
        </div>           
      </div>
      <div>
        <q-btn class="q-ma-sm" color="primary" label="Register" @click="doRegister"/>
        <q-btn class="q-ma-sm" outline color="negative"  label="Cancel" @click="$router.replace('/home')"/>
      </div>
    </div>
  </q-page>
</template>


<script>

import auth from "src/auth";


export default {
  data() {
    return {
      isPwd: true,
      showDialog: true,
      email: null,
      handle: null,
      fullName: null,
      password: null,
      title: "Register"
    };
  },

  computed: {},
  methods: {
    doRegister() {
      console.info("Register-1", this.$data.email);
      const theEmail = this.$data.email;
      const theHandle = this.$data.handle;
      const theFullName = this.$data.fullName;
      if (!theEmail) {
        this.$q.notify({ type: "negative", message: "Missing Email" });
        return;
      }
      if (!theHandle) {
        this.$q.notify({ type: "negative", message: "Missing Handle" });
        return;
      }
      if (!theFullName) {
        this.$q.notify({ type: "negative", message: "Missing FullName" });
        return;
      }
      if (!this.$data.password) {
        this.$q.notify({ type: "negative", message: "Missing Password" });
        return;
      }
      this.register(theEmail, this.$data.password, theFullName, theHandle)
        .then(response => {
          console.log('response:', response);
          this.$q.notify({
            type: "positive",
            message: "Please check your email for verification!"
          });
          this.goHome();
        }).catch((error) => {
          // user must be invited and isn't
          console.log('HEY! Error!:', { error });
          this.$q.notify({
            type: "negative",
            message: "Cannot register, email not found on invitations list"
          });
          this.goHome();
       })

  },
  register(email, password, fullName, handle, homepage) {
      return auth.register(email, password, fullName, handle);
    },
    goHome() {
      this.$router.push({ name: "home" });
    },
    onHide() {
      // Workaround needed because of timing issues (sequencing of 'hide' and 'ok' events) ...
      setTimeout(() => {
        this.goHome();
      }, 50);
    },   
  },
  
  
  mounted() {},
  beforeDestroy() {}
};
</script>

<style lang="styl">
</style>
