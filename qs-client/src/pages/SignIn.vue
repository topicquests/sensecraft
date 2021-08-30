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
              <div >
              <q-input square clearable
                v-model="formData.signonEmail"
                :tabindex="1"
                type="email"
                label="Email">
                <template v-slot:prepend>
                  <q-icon name="email"
                  :tabindex="-1" />
                </template>
              </q-input>
              </div>
               <q-input
                square
                v-model="formData.password"
                tabindex="2"
                filled :type="isPwdSignIn ? 'password' : 'text'"
                v-on:keyup.enter="doLogin"
                label = Password>
                <template v-slot:append>
                  <q-icon
                    :tabindex="-1"
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


import { mapActions } from "vuex";

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
    userId: null,
    err: null
  };
  },
  methods: {
    ...mapActions('member', ['signin']),
    ...mapActions('quests',['findQuests']),
    ...mapActions('guilds',['findGuilds']),
   async doLogin() {
      try {
        const loginResponse = await this.login(this.formData.signonEmail)
            this.$q.notify({
              type: "positive",
              message: "You are now signed in"
              })
              this.goNext();
      }
      catch (error) {
        console.log("Error with sign in ", error)
        this.$q.notify({
          type: "negative",
          message: "Issue with sign in. Verify your email and password"
        })}
    },
    async login(email) {
      try {
        email = email && email.toString().toLowerCase();
        const signInResp = await this.signin(this.formData);
        if (!signInResp) {
          throw 'login failed'
        }
        this.userId = this.$store.state.member.member.id;
        return
      }
      catch {
        console.log("Error with sign in ", error)
        this.$q.notify({
          type: "negative",
          message: "Issue with sign in. Verify your email and password"
      })}
    },

    async goNext() {
      try {
          const checkGuildsBelongToUser = await this.$store.dispatch('guilds/checkBelongsToGuild', this.userId)
          console.log("checked guilds :", checkGuildsBelongToUser )
          const len = this.$store.state.guilds.belongsTo.length;
          if (this.$store.state.guilds.belongsTo.length === 0) {
            this.goLobby();
          }else if (this.$store.state.guilds.belongsTo.length === 1) {
            console.log("belongs to: ", this.$store.state.guilds.belongsTo[0].guild_id);
            const guildId = this.$store.state.guilds.belongsTo[0].guild_id
            this.$router.push(({name: 'guild', params: {guild_id: guildId}}))

          }else {
            this.goHome();
          }
      }
      catch (error) {
        console.log("Error in going to next page", error)
      }
    },
  goHome() {
    this.$router.push({ name: "home" });
  },
  goLanding() {
    this.$router.push({name: "landingPage"});
  },
  goLobby() {
   this.$router.push({name: "lobby"});
  },
  onHide() {
// Workaround needed because of timing issues (sequencing of 'hide' and 'ok' events) ...
  setTimeout(() => {
    this.goHome();
    }, 50);
  },
},
async beforeMount() {
     const quests = await this.findQuests();
     const guilds = await this.findGuilds();
  }
};
</script>

<style lang="styl">
</style>

