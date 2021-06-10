<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274C5, #5A4A9F);"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width:300px;height:485px;">

          <q-card-section class="bg-deep-purple-7">
            <h4 class="text-h5 text-white q-my-md">Guild's Quest</h4>
            <div class="absolute-bottom-right q-pr-md" style="transform: translateY(50%);">
              <q-btn fab icon="add" color="purple-4" />
            </div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-px-sm q-pt-xl">
              <q-input square clearable 
                v-model="formData.signonEmail" 
                type="email" 
                label="Email">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

               <q-input 
                square 
                v-model="formData.password" 
                filled :type="isPwdSignIn ? 'password' : 'text'"
                label = Password>
                <template v-slot:append>
                  <q-icon
                    :name="isPwdSignIn ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwdSignIn = !isPwdSignIn"/>          
                </template>

                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </q-form>
          </q-card-section>

          <q-card-section>
            <div class="text-center q-pa-md q-gutter-md">
              <q-btn round color="indigo-7">
                <q-icon name="fab fa-facebook-f" size="1.2rem" />
              </q-btn>
              <q-btn round color="red-8">
                <q-icon name="fab fa-google-plus-g" size="1.2rem" />
              </q-btn>
              <q-btn round color="light-blue-5">
                <q-icon name="fab fa-twitter" size="1.2rem" />
              </q-btn>
            </div>
          </q-card-section>

          <div class="text-center q-pa-md q-gutter-md">
            <q-card-section>
              <q-card-actions class="q-px-lg">
                <q-btn unelevated size="md" color="purple-4" class="text-white" label="Sign on" @click="doLogin"/>
           
                
                <q-btn unelevated size="md" color="purple-4" class="text-white" label="Cancel" @click="$router.replace('/home')"/>
              </q-card-actions>
            </q-card-section>
          </div>

          <q-card-section class="text-center q-pa-xs">
            <p class="text-grey-6">Forgot your password?</p>
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
   
    isPwd: true,
    isPwdSignIn: true,
    showDialog: true,
    formData: {
      signonEmail: null,
      password: null, 
    },       
    title: "Sign on",
    err: null
  };
  },

  computed: {},

  methods: {
  async doLogin() {
      await this.login(this.formData.signonEmail, this.formData.password);      
      }, 

  login(email, password) {
    email = email && email.toString().toLowerCase();
     this.$store
        .dispatch("auth/authenticate", {
          strategy: "local",
          email: email,
          password: password
        }).then(response => {  
          console.log("Signin ", {response}) 
          this.$store.commit('user/setUsers', response.user)         
          this.$q.notify({
            type: "positive",
            message: "You are now signed in"
          });
          this.goLanding();
        })
        // Just use the returned error instead of mapping it from the store.
        .catch((error) => {
            console.log('HEY! Error!:', { error });
            this.$q.notify({
            type: "negative",
            message: "Cannot sign in, please check your e-mail or password"
          });
        });
    },  


  goHome() {
    this.$router.push({ name: "home" });
  },

  goLanding() {
    this.$router.push({name: "landingPage"});
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

