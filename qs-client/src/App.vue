<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import Vue from 'vue'
import { onMounted, watch } from "@vue/composition-api";
import store from './store'
import router from './router'

const app = new Vue({
  name: "App",
  store: store,
  router: router(store),
  watch: {
    currentUser(newUser, oldUser) {
      // reload quests an guilds
      this.$store.dispatch("quests/findQuests")
      this.$store.dispatch("guilds/findGuilds")
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
    if (window.localStorage.getItem('token')) {
      const res = await this.$store.dispatch("member/fetchLoginUser");
      console.log(res);
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.member.member;
    }
  }
});

export default app
</script>