<template>
  <q-layout view="hHh Lpr fFf">
    <q-header>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <q-toolbar>
        <q-btn
          id="leftDrawer"
          dense
          flat
          round
          icon="menu"
          name="leftdrawerBtn"
          aria-label="Open navigation menu"
          @click="leftDrawer = !leftDrawer"
        />
        <q-toolbar-title>
          <q-btn flat no-caps @click="goTo('home')" id="home" class="brand-btn">
            <q-img
              src="../statics/sensecraft_icon.png"
              style="width: 40px"
              id="home_icon"
            ></q-img>
            <q-img
              src="../statics/sensecraft.png"
              style="width: 140px"
              id="home_image"
              class="gt-xs"
            ></q-img>
          </q-btn>
        </q-toolbar-title>
        <div>
          <q-btn
            v-show="!checkIfAuthenticated"
            @click="goTo('signin')"
            outline
            no-caps
            label="Sign in"
            id="signin"
            name="signinBtn"
            class="q-mr-sm gt-sm"
          >
          </q-btn>
          <q-btn
            v-show="!checkIfAuthenticated"
            @click="goTo('register')"
            unelevated
            no-caps
            color="accent"
            name="registerBtn"
            label="Register"
            id="register"
            class="gt-sm"
          ></q-btn>
        </div>
        <div v-if="checkIfAuthenticated">
          <q-btn
            class="gt-sm"
            @click="onLogout()"
            flat
            round
            dense
            icon="logout"
            id="logoff"
            name="logoffBtn"
            aria-label="Sign out"
          >
            <q-tooltip anchor="bottom middle" self="top middle">
              Sign out
            </q-tooltip>
          </q-btn>
        </div>
        <div
          v-if="
            checkIfAuthenticated &&
            showTree &&
            currentGuild &&
            guildStore.isGuildMember(currentGuild.id)
          "
        >
          <q-btn
            flat
            dense
            round
            :color="readStatusStore.hasUnreadChannels ? 'accent' : 'white'"
            aria-label="Guild and quest conversations"
            name="rightdrawerBtn"
            @click="toggleNav"
            id="channel_list"
          >
            <q-icon name="forum" />
            <q-tooltip anchor="bottom middle" self="top middle">
              Guild and Quest conversations
            </q-tooltip>
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
      class="sidenav chrome-drawer"
      :overlay="true"
    >
      <right_drawer :currentGuild="currentGuild" :currentQuest="currentQuest">
      </right_drawer>
    </q-drawer>
    <q-drawer
      v-model="leftDrawer"
      :breakpoint="500"
      bordered
      :overlay="true"
      class="chrome-drawer"
    >
      <q-scroll-area class="fit">
        <drawer_menu v-on:onLogout="onLogout"></drawer_menu>
      </q-scroll-area>
    </q-drawer>
    <q-page-container class="q-pa-md">
      <router-view />
    </q-page-container>
    <q-footer class="app-footer">
      <p id="Pfooter">
        Sensecraft — © <a href="http://topicquests.org">TopicQuests</a> and
        <a href="https://www.conversence.com">Conversence</a> 2022-2024.
        <a href="https://github.com/topicquests/sensecraft">Open Source</a>
      </p>
    </q-footer>
  </q-layout>
</template>
<script setup lang="ts">
// Imports
import { computed, onBeforeMount, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { useQuasar } from 'quasar';
import drawer_menu from '../components/drawer_menu.vue';
import right_drawer from '../components/right-drawer.vue';
import { useReadStatusStore } from '../stores/readStatus';

// Router
const router = useRouter();

//Stores
const memberStore = useMemberStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const readStatusStore = useReadStatusStore();

// Quasar
const $q = useQuasar();
const nodeTreeRef = ref();

// Reactive variables
const leftDrawer = ref(false);
const isAuthenticated = ref(false);
const rightDrawer = ref(false);
const showTree = ref(true);

// Computed properties
const currentGuild = computed(() => guildStore.getCurrentGuild);
const currentQuest = computed(() => questStore.getCurrentQuest);
const checkIfAuthenticated = computed(
  (): boolean => memberStore.isAuthenticated,
);

// Lifecycles
onBeforeMount(() => {
  isAuthenticated.value = memberStore.isAuthenticated;
});
onBeforeRouteLeave((to, from, next) => {
  guildStore.setCurrentGuild(0);
  questStore.setCurrentQuest(0);
  next();
});

// Functions
async function goTo(newRoute: string): Promise<void> {
  await router.push({ name: newRoute });
}
async function onLogout() {
  rightDrawer.value = false;
  leftDrawer.value = false;
  nodeTreeRef.value?.clearTree();
  memberStore.logout();
  await goTo('home');
  $q.notify({
    type: 'positive',
    message: 'You are now logged out',
  });
}
function toggleNav() {
  if (rightDrawer.value) {
    closeNav();
  } else {
    rightDrawer.value = true;
  }
}
function closeNav() {
  rightDrawer.value = false;
}
</script>
<style>
.q-header {
  background-color: var(--sc-color-chrome-bg);
  color: var(--sc-color-chrome-text);
  border-bottom: 1px solid var(--sc-color-chrome-border);
}

.q-toolbar {
  padding: 0 var(--sc-space-16);
  min-height: 64px;
}

.brand-btn {
  border-radius: var(--sc-radius-md);
}

#home_icon {
  margin-right: var(--sc-space-8);
}

#home_image {
  margin-right: var(--sc-space-8);
}

.chrome-drawer {
  background-color: var(--sc-color-chrome-bg);
  color: var(--sc-color-chrome-text);
}

.chrome-drawer .q-scroll-area {
  padding-top: var(--sc-space-16);
}

.app-footer {
  background: var(--sc-color-chrome-bg);
  color: var(--sc-color-chrome-text-muted);
  border-top: 1px solid var(--sc-color-chrome-border);
}

footer#Pfooter {
  font-size: 0.875rem;
  padding: var(--sc-space-16) 0;
  text-align: center;
  margin: 0;
}

footer#Pfooter a {
  color: var(--sc-color-chrome-text);
  text-decoration: underline;
  text-underline-offset: 2px;
}

footer#Pfooter a:hover {
  color: var(--sc-color-accent);
}

@media only screen and (max-width: 768px) {
  .q-toolbar-title {
    display: flex;
    justify-content: center;
  }
  .chrome-drawer {
    width: 80%;
  }
  footer#Pfooter {
    font-size: 0.75rem;
    padding: var(--sc-space-8) 0;
  }
}
</style>
