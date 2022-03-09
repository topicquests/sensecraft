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
          <q-btn flat @click="goTo('home')" id="home">
            <q-img
              src="../statics/sensecraft_icon.png"
              style="width: 60px"
              id="home_image"
            ></q-img>
            <q-img
              src="../statics/sensecraft.png"
              style="width: 160px"
              id="home_image"
            ></q-img>
          </q-btn>
        </q-toolbar-title>
        <div>
          <q-btn
            v-show="!isAuthenticated"
            @click="goTo('signin')"
            roundeded
            label="sign in"
            id="signin"
            class="q-mr-sm bg-deep-purple-7"
          >
          </q-btn>
          <q-btn
            v-show="!isAuthenticated"
            @click="goTo('register')"
            class="bg-deep-purple-7"
            roundeded
            label="Register"
            id="register"
          ></q-btn>
        </div>
        <div v-if="isAuthenticated">
          <q-btn
            @click="onLogout()"
            outline
            roundeded
            label="log off"
            id="logoff"
            name="logoff"
          >
          </q-btn>
        </div>
        <div v-if="isAuthenticated && showTree && getChannels && getChannels.length">
          <q-btn
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
    <div
      v-if="rightDrawerOpen"
      style="width: 350px"
      id="mySidenav"
      class="sidenav"
    >
      <div class="q-pa-md q-gutter-sm">
        <channel-list
          v-if="getGuildChannels.length"
          v-bind:channels="getGuildChannels"
          title="Guild Channels"
        />
      </div>
    </div>
    <q-drawer v-model="leftDrawer" :breakpoint="200" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <q-item clickable v-ripple :to="{ name: 'root' }">
            <q-item-section>
              <q-btn to="/">Home</q-btn>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple :to="{ name: 'house_rules' }">
            <q-item-section>
              <q-btn to="/house_rules">House Rules</q-btn>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple v-show="isAuthenticated" id="lobby">
            <q-item-section>
              <q-btn :to="{ name: 'lobby' }">Dashboard</q-btn>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :to="{ name: 'quest_list' }"
            id="questView"
          >
            <q-item-section>
              <q-item-label>
                <q-btn :to="{ name: 'quest_list' }">All Quests </q-btn>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            v-show="hasPermission('createQuest')"
            id="createQuest"
          >
            <q-item-section>
              <q-item-label>
                <q-btn :to="{ name: 'quest_landing' }">
                  Quest create\edit
                </q-btn>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple id="guildView">
            <q-item-section>
              <q-btn :to="{ name: 'guild_list' }"> Guilds </q-btn>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            v-show="hasPermission('createGuild')"
            id="createGuild"
          >
            <q-item-section>
              <q-btn :to="{ name: 'guild_landing' }"> Guild create\edit </q-btn>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            v-if="hasPermission('superadmin')"
            id="admin"
          >
            <q-btn :to="{ name: 'admin', params: { member_id: memberId } }">
              Administration
            </q-btn>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container class="q-pa-md">
      <router-view />
    </q-page-container>
    <q-footer class="footer bg-secondary">
      <p id="Pfooter">
        Sensecraft — © <a href="https://topicquests.org">TopicQuests</a> 2022.
        <a href="https://github.com/topicquests/sensecraft">Open Source</a>
      </p>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { mapState, mapGetters, mapActions } from "vuex";
import { MemberActionTypes, MemberState } from "../store/member";
import { BaseGetterTypes } from "../store/baseStore";
import nodeTree from "../components/node-tree.vue";
import Component from "vue-class-component";
import Vue from "vue";
import {
  conversation,
  ConversationActionTypes,
  ConversationGetterTypes,
} from "src/store/conversation";
import { ChannelGetterTypes, ChannelActionTypes } from "../store/channel";
import { GuildsGetterTypes } from "../store/guilds";
import ChannelList from "../components/ChannelListComponent.vue";

@Component<MainLayout>({
  name: "MainLayout",
  components: {
    nodeTree: nodeTree,
    ChannelList: ChannelList,
  },
  meta: {
    // sets document title
    title: "Homepage",
    // optional; sets final title as "Index Page - My Website", useful for multiple level meta
    titleTemplate: (title) => `${title} - SenseCraft`,
  },
  data() {
    return {
      simple: [
        {
          label: "Satisfied customers (with avatar)",
          avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
        },
      ],

      selected: null,
    };
  },
  computed: {
    ...mapState("member", {
      isAuthenticated: (state: MemberState) => state.isAuthenticated,
      memberId: (state: MemberState) => state.member.id,
    }),
    ...mapGetters("conversation", [
      "getNeighbourhoodTree",
      "getConversationTree",
      "getConversationNodeById",
    ]),
    ...mapGetters(["hasPermission"]),
    ...mapGetters("channel", [
      "getGuildChannels",
      "getGameChannels",
      "getChannels",
    ]),
    ...mapGetters("guilds", ["getCurrentGuild"]),
  },
  watch: {
    selected: function (val, oldVal) {
      this.setConversationNode(val);
    },
  },
  methods: {
    ...mapActions("member", ["logout"]),
    ...mapActions("channel", ["ensureChannels"]),
    ...mapActions("conversation", ["setConversationNode"]),
  },
})
export default class MainLayout extends Vue {
  private leftDrawer: Boolean = false;
  private rightDrawerOpen: Boolean = false;
  private showTree: Boolean = true;

  // Declare computed attributes for typescript
  getGuildChannels!: ChannelGetterTypes["getGuildChannels"];
  getGameChannels!: ChannelGetterTypes["getGameChannels"];
  getNeighbourhoodTree!: ConversationGetterTypes["getNeighbourhoodTree"];
  getConversationTree!: ConversationGetterTypes["getConversationTree"];
  hasPermission!: BaseGetterTypes["hasPermission"];
  getConversationNodeById!: ConversationGetterTypes["getConversationNodeById"];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  getChannels!:ChannelGetterTypes['getChannels']

  // Declare action attributes for typescript
  logout: MemberActionTypes["logout"];
  ensureChannels: ChannelActionTypes["ensureChannels"];
  public goTo(route): void {
    this.rightDrawerOpen = false;
    this.leftDrawer = false;
    this.$router.push({ name: route });
  }
  toggleNav() {
    if (this.rightDrawerOpen) {
      this.closeNav();
    } else {
      this.rightDrawerOpen = true;
    }
  }
  closeNav() {
    this.rightDrawerOpen = false;
  }

  async onLogout() {
    this.rightDrawerOpen = false;
    this.leftDrawer = false;
    this.goTo("home");
    await this.logout();
    this.$q.notify({
      type: "positive",
      message: "You are now logged out",
    });
  }

  async beforeMount() {
    await this.ensureChannels(this.getCurrentGuild?.id);
  }
}
</script>
<style>
#Pfooter {
  text-align: center;
  font-size: 15pt;
  color: #333;
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

* {
  margin: 0px;
  padding: 0px;
}

body {
  font-family: "Exo", sans-serif;
}
</style>
