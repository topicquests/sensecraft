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
            v-show="!checkIfAuthenticated"
            @click="goTo('signin')"
            roundeded
            label="sign in"
            id="signin"
            name="signinBtn"
            class="q-mr-sm bg-deep-purple-7 gt-sm"
          >
          </q-btn>
          <q-btn
            v-show="!checkIfAuthenticated"
            @click="goTo('register')"
            class="bg-deep-purple-7 gt-sm"
            name="registerBtn"
            roundeded
            label="Register"
            id="register"
          ></q-btn>
        </div>
        <div v-if="checkIfAuthenticated">
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
            :color="readStatusStore.hasUnreadChannels ? 'cyan' : 'grey'"
            aria-label="Tree View"
            @click="toggleNav"
            id="channel_list"
          >
            <q-icon name="menu" />
          </q-btn>
          <q-tooltip
            anchor="top middle"
            self="bottom middle"
            class="custom-tooltip"
          >
            Guild and Quest conversations
          </q-tooltip>
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
      <right_drawer :currentGuild="currentGuild" :currentQuest="currentQuest">
      </right_drawer>
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
        Sensecraft — © <a href="http://topicquests.org">TopicQuests</a> and
        <a href="https://www.conversence.com">Conversence</a> 2022-2024.
        <a href="https://github.com/topicquests/sensecraft">Open Source</a>
      </p>
    </q-footer>
  </q-layout>
</template>
<script setup lang="ts">
// Imports
import { computed, onBeforeMount, ref, watch } from 'vue';
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

// Watches
watch(currentGuild, () => {
  if (currentGuild.value) {
    readStatusStore.hasUnreadChannels;
  }
});
watch(currentQuest, () => {
  if (currentQuest.value) {
    readStatusStore.hasUnreadChannels;
  }
});

// Lifecycles
onBeforeMount(async () => {
  isAuthenticated.value = memberStore.isAuthenticated;
});
onBeforeRouteLeave((to, from, next) => {
  guildStore.setCurrentGuild(0);
  questStore.setCurrentQuest(0);
  next();
});

// Functions
async function goTo(newRoute: string): void {
  await router.push({ name: newRoute });
}
function onLogout() {
  rightDrawer.value = false;
  leftDrawer.value = false;
  memberStore.logout();
  goTo('home');
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
#leftDrawer,
#rightDrawer {
  border-radius: 10px;
}
.custom-tooltip {
  background-color: #333 !important;
  color: rgb(147, 200, 221) !important;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-tooltip::before {
  border-top-color: #333 !important;
}

.q-header {
  background-color: #0f12da;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  height: 75px;
}

.q-toolbar {
  padding: 0 16px;
}

#home_image {
  width: 50px;
  margin-right: 8px;
}

.q-btn.q-mr-sm {
  margin-right: 8px;
}

.q-btn.flat {
  background-color: transparent;
}

.q-drawer {
  background-color: #1e1e1e;
  color: white;
  border-radius: 10px;
}

.q-drawer .q-scroll-area {
  padding-top: 16px;
}

footer#Pfooter {
  font-size: 14px;
  color: white;
  padding: 16px 0;
  text-align: center;
}

footer#Pfooter a {
  color: #4caf50;
  text-decoration: none;
}

footer#Pfooter a:hover {
  text-decoration: underline;
}

@media only screen and (max-width: 768px) {
  #home_image {
    display: none;
  }
  .q-toolbar-title {
    display: flex;
    justify-content: center;
  }
  #leftDrawer,
  #rightDrawer {
    width: 250px;
  }
  .q-drawer {
    width: 80%;
  }
  footer#Pfooter {
    font-size: 12px;
    padding: 8px 0;
  }
}
</style>
