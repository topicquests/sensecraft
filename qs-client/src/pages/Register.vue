
<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274C5, #5A4A9F);"
  >
    <div class="column q-pa-lg">
      <div class="row">        
      </div>
    </div>
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width:300px;height:485px;">
          <q-card-section class="bg-deep-purple-7">
            <h4 class="text-h5 text-white q-my-md">Registration</h4>
            <div class="absolute-bottom-right q-pr-md" style="transform: translateY(50%);">
              <q-btn fab icon="close" color="purple-4" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-px-sm q-pt-xl q-pb-lg">
              <q-input square clearable v-model="formdata.email" type="email" label="Email">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input square clearable v-model="formdata.firstname" label="First name">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>                
              </q-input>
              <q-input square clearable v-model="formdata.lastname"  label="Last name">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>                
              </q-input>
              <q-input square clearable v-model="formdata.handle"  label="handle">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>                
              </q-input>
              <q-input v-model="formdata.password" 
                       filled :type="isPwd ? 'password' : 'text'">
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />          
                </template>
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-xl q-pt-lg">
            <q-btn unelevated size="lg" color="purple-4" class="full-width text-white" label="Get Started" @click="doRegister"/>
          </q-card-actions>
          <q-card-section class="text-center q-pa-sm">
            <p class="text-grey-6">Return to login</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>

import { mapState, mapActions } from "vuex";

export default {
  data() {
  return {
    formdata: {
    email: null,
    handle: null,
    firstname: null,
    lastname: null,
    password: null,
    },
    isPwd: true,
    isPwdSignIn: true,
    showDialog: true,      
    title: "Register"
  };
  },

  computed: {
    
  },

  methods: {
  doRegister() {
  const theEmail = this.$data.formdata.email;
  const theHandle = this.$data.formdata.handle;
  const theFirstName = this.$data.formdata.firstname;
  const theLastName = this.$data.formdata.lastname;
  
  if (!theEmail) {
  this.$q.notify({ type: "negative", message: "Missing Email" });
  return;
  }

  if (!theHandle) {
    this.$q.notify({ type: "negative", message: "Missing Handle" });
    return;
  }
  if (!theFirstName) {
    this.$q.notify({ type: "negative", message: "Missing first name field" });
    return;
  }
  if (!theLastName) {
    this.$q.notify({ type: "negative", message: "Missing last name field" });
    return;
  }

  if (!this.$data.formdata.password) {
    this.$q.notify({ type: "negative", message: "Missing Password" });
    return;
  }

  this.$store.dispatch("account/registerUser", {formdata: this.formdata})
  .then(response => {
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
