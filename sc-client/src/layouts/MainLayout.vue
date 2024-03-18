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
            v-show="!checkIfAuthenticated()"
            @click="goTo('signin')"
            roundeded
            label="sign in"
            id="signin"
            name="signinBtn"
            class="q-mr-sm bg-deep-purple-7 gt-sm"
          >
          </q-btn>
          <q-btn
            v-show="!checkIfAuthenticated()"
            @click="goTo('register')"
            class="bg-deep-purple-7 gt-sm"
            name="registerBtn"
            roundeded
            label="Register"
            id="register"
          ></q-btn>
        </div>
        <div v-if="checkIfAuthenticated()">
          <q-btn
            class="gt-sm"
            @click="onLogout()"
            outline
            roundeded
            label="log off"
            id="logoff"
            name="logoffBtn"
          >
          </q-btn>
        </div>
        <div v-if="checkIfAuthenticated() && showTree && currentGuild">
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
      v-model="rightDrawer"
      :breakpoint="200"
      bordered
      side="right"
      id="mySidenav"
      class="sidenav"
      :overlay="true"
    >
      <div v-if="currentGuild" class="q-pa-md q-gutter-sm">
        <channel-list
          :guild_id="currentGuild.id"
          :inPage="false"
          title="Guild Channels"
        />
      </div>
      <div
        v-if="currentGuild && questStore.getCurrentQuest"
        class="q-pa-md q-gutter-sm"
      >
        <channel-list
          v-bind:guild_id="currentGuild.id"
          v-bind:quest_id="questStore.getCurrentQuest.id"
          :inPage="false"
          title="Game Channels"
        />
      </div>
    </q-drawer>
    <q-drawer v-model="leftDrawer" :breakpoint="500" bordered :overlay="true">
      <q-scroll-area class="fit">
        <drawer_menu v-on:onLogout="onLogout"></drawer_menu>
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

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import channelList  from '../components/ChannelListComponent.vue'
import { GuildData } from '../types';
import { useQuasar } from 'quasar';
import drawer_menu  from '../components/drawer_menu.vue'

const router = useRouter();
const memberStore = useMemberStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const $q = useQuasar();
const leftDrawer = ref(false);
const isAuthenticated = ref(false);
const rightDrawer = ref(false);
const showTree = true;
const currentGuild  = ref<GuildData|undefined>(guildStore.getCurrentGuild);

function checkIfAuthenticated(): boolean {
  isAuthenticated.value = memberStore.isAuthenticated;
  if (isAuthenticated.value == true) {
    return true;
  }
  return false;
};
function goTo(route: string): void {
  router.push(route);
};
async function onLogout() {
  rightDrawer.value = false;
  leftDrawer.value = false;
  goTo('home');
  await memberStore.logout();
  $q.notify({
    type: 'positive',
    message: 'You are now logged out',
  });
};
function toggleNav() {
  if (rightDrawer.value) {
    closeNav();
  } else {
    rightDrawer.value = true;
  }
};
function closeNav() {
  rightDrawer.value = false;
};
onBeforeMount(async () => {
  await guildStore.ensureAllGuilds();
  await questStore.ensureAllQuests();
});
</script>
