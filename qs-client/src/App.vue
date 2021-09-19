<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import Vue from 'vue'
import store from './store'
import router from './router'
import { mapState } from 'vuex'
import CKEditor from '@ckeditor/ckeditor5-vue2';

Vue.use(CKEditor);

const app = new Vue({
  name: "App",
  store: store,
  router: router(store),
  watch: {
    currentUser(newUser, oldUser) {
      // reload quests an guilds
      this.$store.dispatch("quests/fetchQuests")
      this.$store.dispatch("guilds/fetchGuilds")
      if (newUser === null) {
        this.$router.push("/");
      } else {
        if (this.$route.path === "/login") {
          this.$router.push("/account");
        }
      }
    }
  },
  created: async function() {
    const prevTokenExpiry = window.localStorage.getItem('tokenExpiry')
    if (prevTokenExpiry > Date.now()) {
      const res = await this.$store.dispatch("member/fetchLoginUser");
      if (res.user) {
        window.setTimeout(function() {
          this.$store.dispatch("member/renewToken", {params: {token: this.$store.state.member.token}});
        }, Math.min(0, prevTokenExpiry - Date.now() - 10000));
      }
      console.log(res);
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