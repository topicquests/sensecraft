<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import store from "./store";
import router from "./router";
import { MemberState } from "./store/member";
import { mapState, mapActions } from "vuex";

var userLoadedResolve = null;

const app = new Vue({
  name: "App",
  store: store,
  router: router(),
  watch: {
    currentUser(newUser, oldUser) {
      // reload quests an guilds
      if (newUser?.id !== oldUser?.id) {
        this.$store.dispatch("quests/clearState");
        this.$store.dispatch("guilds/clearState");
        this.$store.dispatch("conversation/clearState");
      }
      if (newUser === null) {
        this.$router.push("/");
      } else {
        if (this.$route.path === "/login") {
          this.$router.push("/account");
        }
      }
    },
  },
  data: () => ({
    userLoaded: new Promise((resolve) => {
      userLoadedResolve = resolve;
    }),
  }),
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
        renewToken({ params: { token: prevToken } });
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
