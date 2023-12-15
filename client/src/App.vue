<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueRouter from "vue-router";
import router from "./router";
import type { MemberState } from "./store/member";
import { mapState, mapActions } from "vuex";
import store from "./boot/store";
import { initWSClient } from "./wsclient";
import { userLoadedResolve } from "./boot/userLoaded";

Vue.use(VueRouter);

declare const ws_url: string;
initWSClient(store, ws_url);

const app = new Vue({
  name: "App",
  store: store,
  router: router(),
  watch: {
    currentUser(newUser, oldUser) {
      // reload quests an guilds
      if (newUser?.id !== oldUser?.id) {
        this.$store.dispatch("quests/resetQuests");
        this.$store.dispatch("guilds/resetGuilds");
        this.$store.dispatch("conversation/resetConversation");
        this.$store.dispatch("channel/resetChannel");
      }
      if (newUser === null) {
        //this.$router.push("/");
      } else {
        if (this.$route.path === "/login") {
          this.$router.push("/account");
        }
      }
    },
  },
  methods: {
    ...mapActions("member", ["ensureLoginUser", "renewToken"]),
  },
  created: async function () {
    const member = await this.ensureLoginUser();
    userLoadedResolve(member);
    if (member) {
      const prevTokenExpiry = Number.parseInt(
        window.localStorage.getItem("tokenExpiry")
      );
      const prevToken = window.localStorage.getItem("token");
      const renewToken = this.renewToken;
      const interval = Math.max(0, prevTokenExpiry - Date.now() - 10000);
      window.setTimeout(function () {
        renewToken({ data: { token: prevToken } });
      }, interval);
    }
  },
  computed: {
    ...mapState("member", {
      currentUser: (state: MemberState) => state.member,
    }),
  },
});

export default app;
</script>
