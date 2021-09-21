<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import Vue from 'vue'
import store from './store'
import router from './router'
import { mapState, mapActions } from 'vuex'


const app = new Vue({
  name: "App",
  store: store,
  router: router(store),
  watch: {
    currentUser(newUser, oldUser) {
      // reload quests an guilds
      if (newUser?.id !== oldUser?.id) {
        this.$store.dispatch("quests/clearState")
        this.$store.dispatch("guilds/clearState")
      }
      if (newUser === null) {
        this.$router.push("/");
      } else {
        if (this.$route.path === "/login") {
          this.$router.push("/account");
        }
      }
    }
  },
  methods: {
    ...mapActions('member', ['ensureLoginUser', 'renewToken']),
  },
  created: async function() {
    const member = await this.ensureLoginUser()
    if (member) {
      const prevTokenExpiry = Number.parseInt(window.localStorage.getItem('tokenExpiry'))
      const prevToken = window.localStorage.getItem('token')
      const renewToken = this.renewToken
      const interval = Math.max(0, prevTokenExpiry - Date.now() - 10000)
      window.setTimeout(function() {
        renewToken({params: {token: prevToken}});
      }, interval);
    }
  },
  computed: {
    ...mapState('member', {
      currentUser: state => state.member,
    }),
  }
});

export default app
</script>