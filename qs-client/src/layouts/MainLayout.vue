<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          id="leftDrawer"
          dense
          flat
          round
          icon="menu"
          @click="leftDrawer = !leftDrawer"
        />
        <q-toolbar-title>
          <q-btn flat @click="goTo('home')">
            <q-img
              src="../statics/guild_quest.png"
              style="width: 150px"
              id="home_image"
            ></q-img>
          </q-btn>
        </q-toolbar-title>
        <div>
          <q-btn
            v-show="!isAuthenticated"
            @click="goTo('signin')"
            outline
            roundeded
            label="sign in"
            id="signin"
            class="q-mr-sm"
          >
          </q-btn>
          <q-btn
            v-show="!isAuthenticated"
            @click="goTo('register')"
            outline
            roundeded
            label="sign up"
            id="register"
          ></q-btn>
        </div>
        <div>
          <q-btn
            v-show="isAuthenticated"
            @click="onLogout()"
            outline
            roundeded
            label="log off"
            id="logoff"
            name="logoff"
          >
          </q-btn>
        </div>
        <div>
          <q-btn
            v-show="showTree && getNeighbourhoodTree.length"
            flat
            dense
            round
            aria-label="Tree View"
            @click="toggleNav"
            id="conversation_tree"
          >
            <q-icon name="menu" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <div id="mySidenav" class="sidenav">
      <div class="q-pa-md q-gutter-sm">
        <node-tree
          v-if="getNeighbourhoodTree.length"
          v-bind:nodes="getNeighbourhoodTree"
        />
      </div>
    </div>
    <q-drawer v-model="leftDrawer" :breakpoint="200" bordered>
      <q-scroll-area class="fit">
        <div>
          <q-list>
            <div>
              <q-item> About </q-item>
            </div>
            <div>
              <q-item v-show="isAuthenticated" id="lobby">
                <router-link :to="{ name: 'lobby' }"> Lobby </router-link>
              </q-item>
            </div>
            <div>
              <q-item id="questView">
                <router-link :to="{ name: 'quest_list' }">
                  Quest list
                </router-link>
              </q-item>
            </div>
            <div>
              <q-item v-show="hasPermission('createQuest')" id="createQuest">
                <router-link :to="{ name: 'quest_landing' }">
                  Quest create\edit
                </router-link>
              </q-item>
            </div>
            <div>
              <q-item id="guildView">
                <router-link :to="{ name: 'guild_list' }">
                  Guild list
                </router-link>
              </q-item>
            </div>
            <div>
              <q-item v-show="hasPermission('createGuild')" id="createGuild">
                <router-link :to="{ name: 'guild_landing' }">
                  Guild create\edit
                </router-link>
              </q-item>
            </div>
            <div>
              <q-item id="home">
                <router-link :to="{ name: 'root' }"> Home </router-link>
              </q-item>
            </div>
            <div v-if="hasPermission('superadmin')">
              <q-item id="admin">
                <router-link
                  :to="{ name: 'admin', params: { member_id: memberId } }"
                >
                  Administration
                </router-link>
              </q-item>
            </div>
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer style="background-color: aquamarine" class="footer">
      <p id="Pfooter">Sensecraft 2021</p>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { mapState, mapGetters, mapActions } from "vuex";
import { MemberState } from "../store/member";
import nodeTree from "../components/node-tree.vue";

export default {
  name: "MainLayout",
  data() {
    return {
      simple: [
        {
          label: "Satisfied customers (with avatar)",
          avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
        },
      ],
      leftDrawer: false,
      rightDrawerOpen: false,
      selected: null,
      showTree: true,
    };
  },
  components: {
    nodeTree: nodeTree,
  },
  computed: {
    ...mapGetters("conversation", [
      "getNeighbourhoodTree",
      "getConversationTree",
    ]),
    ...mapGetters(["hasPermission"]),
    ...mapState("member", {
      isAuthenticated: (state: MemberState) => state.isAuthenticated,
      memberId: (state: MemberState) => state.member.id,
    }),
  },
  watch: {
    selected: function (val, oldVal) {
      this.setConversationNode(val);
    },
  },

  methods: {
    ...mapActions("conversation", [
      "getConversationNodeById",
      "setConversationNode",
    ]),
    ...mapActions("member", ["logout"]),
    toggleNav() {
      if (this.rightDrawerOpen) {
        this.closeNav();
      } else {
        this.rightDrawerOpen = true;
        this.$el.querySelector("#mySidenav").style.width = "450px";
      }
    },
    closeNav() {
      this.rightDrawerOpen = false;
      this.$el.querySelector("#mySidenav").style.width = "0";
    },
    goTo(route) {
      this.rightDrawer = false;
      this.leftDrawer = false;
      this.$router.push({ name: route });
    },
    async onLogout() {
      this.rightDrawer = false;
      this.leftDrawer = false;
      this.$el.querySelector("#mySidenav").style.width = "0";
      await this.logout();
      this.$q.notify({
        type: "positive",
        message: "You are now logged out",
      });
      this.goTo("home");
    },
  },
};
</script>
<style>
#Pfooter {
  text-align: center;
  font-size: 15pt;
  color: dodgerblue;
  background-color: aquamarine;
}

.sidenav {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  color: black;
  background-color: rgb(230, 234, 238);
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
}
</style>
