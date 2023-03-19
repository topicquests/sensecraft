<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <q-toolbar>
        <q-btn
          id="leftDrawer"
          dense
          flat
          round
          icon="menu"
          name="leftdrawerBtn"
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
            name="signinBtn"
            class="q-mr-sm bg-deep-purple-7 gt-sm"
          >
          </q-btn>
          <q-btn
            v-show="!isAuthenticated"
            @click="goTo('register')"
            class="bg-deep-purple-7 gt-sm"
            name="registerBtn"
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
            name="logoffBtn"
          >
          </q-btn>
        </div>
        <div v-if="isAuthenticated && showTree && getCurrentGuild">
          <q-btn
            flat
            dense
            round
            aria-label="Tree View"
            @click="toggleNav"
            id="channel_list"
          >
            <q-icon name="menu" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="rightDrawerOpen"
      :breakpoint="200"
      bordered
      side="right"
      id="mySidenav"
      class="sidenav"
      :overlay="true"
    >
      <div v-if="getCurrentGuild" class="q-pa-md q-gutter-sm">
        <channel-list
          v-bind:guild_id="getCurrentGuild.id"
          :inPage="false"
          title="Guild Channels"
        />
      </div>
      <div
        v-if="getCurrentGuild && getCurrentQuest"
        class="q-pa-md q-gutter-sm"
      >
        <channel-list
          v-bind:guild_id="getCurrentGuild.id"
          v-bind:quest_id="getCurrentQuest.id"
          :inPage="false"
          title="Game Channels"
        />
      </div>
    </q-drawer>
    <q-drawer v-model="leftDrawer" :breakpoint="200" bordered :overlay="true">
      <q-scroll-area class="fit">
        <q-list>
          <q-item clickable v-ripple id="root">
            <q-item-section>
              <q-btn :to="{ name: 'root' }">Home</q-btn>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple id="house_rules">
            <q-item-section>
              <q-btn :to="{ name: 'house_rules' }">House Rules</q-btn>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple v-show="isAuthenticated" id="lobby">
            <q-item-section>
              <q-btn :to="{ name: 'lobby' }">Dashboard</q-btn>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple id="questView">
            <q-item-section id="quest_list">
              <q-item-label>
                <q-btn :to="{ name: 'quest_list' }">Quests</q-btn>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            id="createQuest"
            v-show="hasPermission(permission_enum.createQuest)"
          >
            <q-item-section id="create_quest">
              <q-item-label>
                <q-btn :to="{ name: 'create_quest' }" name="createQuestBtn">
                  Create Quests</q-btn
                >
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
            id="createGuild"
            v-show="hasPermission(permission_enum.createGuild)"
          >
            <q-item-section id="guild_create">
              <q-item-label>
                <q-btn :to="{ name: 'create_guild' }">Create Guild</q-btn>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            v-if="hasPermission(permission_enum.superadmin)"
            id="admin"
          >
            <q-btn :to="{ name: 'admin', params: { member_id: memberId } }">
              Administration
            </q-btn>
          </q-item>
          <q-item>
            <q-btn
              v-show="!isAuthenticated"
              @click="goTo('signin')"
              roundeded
              label="sign in"
              id="signin"
              name="signinBtn"
              class="q-mr-sm bg-deep-purple-7 lt-md"
            >
            </q-btn>
          </q-item>
          <q-item>
            <q-btn
              v-show="!isAuthenticated"
              @click="goTo('register')"
              class="bg-deep-purple-7 lt-md"
              name="registerBtn"
              roundeded
              label="Register"
              id="register"
            ></q-btn>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container class="q-pa-md">
      <router-view />
    </q-page-container>
    <q-footer class="footer bg-secondary">
      <p id="Pfooter">
        Sensecraft — © <a href="http://topicquests.org">TopicQuests</a> 2022.
        <a href="https://github.com/topicquests/sensecraft">Open Source</a>
      </p>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { mapState, mapGetters, mapActions } from "vuex";
import Component from "vue-class-component";
import Vue from "vue";
import { permission_enum } from "../enums";
import { MemberActionTypes, MemberState } from "../store/member";
import { BaseGetterTypes } from "../store/baseStore";
import nodeTree from "../components/node-tree.vue";
import { ConversationGetterTypes } from "../store/conversation";
import { GuildsGetterTypes } from "../store/guilds";
import ChannelList from "../components/ChannelListComponent.vue";
import { QuestsGetterTypes } from "../store/quests";

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
    ...mapGetters("guilds", ["getCurrentGuild"]),
    ...mapGetters("quests", ["getCurrentQuest"]),
  },
  watch: {
    selected: function (val, oldVal) {
      this.setConversationNode(val);
    },
  },
  methods: {
    ...mapActions("member", ["logout"]),
    ...mapActions("conversation", ["setConversationNode"]),
  },
})
export default class MainLayout extends Vue {
  private leftDrawer = false;
  private rightDrawerOpen = false;
  private showTree = true;

  // Declare computed attributes for typescript
  memberId!: number;
  isAuthenticated!: boolean;
  getNeighbourhoodTree!: ConversationGetterTypes["getNeighbourhoodTree"];
  getConversationTree!: ConversationGetterTypes["getConversationTree"];
  hasPermission!: BaseGetterTypes["hasPermission"];
  getConversationNodeById!: ConversationGetterTypes["getConversationNodeById"];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  permission_enum = permission_enum;

  // Declare action attributes for typescript
  logout: MemberActionTypes["logout"];
  public goTo(route): void {
    this.rightDrawerOpen = false;
    this.leftDrawer = false;
    this.$router.push({ name: route });
  }
  private showGameChannelList() {
    if (this.getCurrentGuild && this.getCurrentQuest) return true;
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
