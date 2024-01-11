<template>
  <q-layout view="lHh Lpr lFf">
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
        <div v-if="isAuthenticated && showTree && currentGuild">
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
    <div v-if="currentGuild" class="q-pa-md q-gutter-sm">
        <channel-list
          v-bind:guild_id="currentGuild.id"
          :inPage="false"
          title="Guild Channels"
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
         
          <q-item clickable v-ripple id="guildView">
            <q-item-section>
              <q-btn :to="{ name: 'guild_list' }"> Guilds </q-btn>
            </q-item-section>
          </q-item>
          <q-item>
            <q-btn
              v-show="!isAuthenticated"
              @click="goTo('signin')"
              roundeded
              label="sign in"
              id="signin"
              name="signinBtn"
              class="q-mr-sm lt-md"
            >
            </q-btn>
          </q-item>
          <q-item>
            <q-btn
              v-show="!isAuthenticated"
              @click="goTo('register')"
              class="lt-md"
              name="registerBtn"
              roundeded
              label="Register"
              id="register"
            ></q-btn>
          </q-item>
          <div v-if="isAuthenticated">
            <q-item>
              <q-btn
                class="lt-md"
                @click="onLogout()"
                outline
                roundeded
                label="log off"
                id="logoff"
                name="logoffBtn"
              >
              </q-btn>
            </q-item>
          </div>
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

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMemberStore } from 'src/stores/member';
import { useGuildStore } from 'src/stores/guilds'

const router = useRouter()
const memberStore = useMemberStore()
//const guildStore = useGuildStore()
const leftDrawer = ref(false)
const rightDrawerOpen = ref(false)
const showTree = true;
const isAuthenticated = ref(memberStore.baseState.isAuthenticated)

//Getters
const currentGuild = false

function goTo(route: string): void {
  router.push(route)
}

function onLogout() {
    this.rightDrawerOpen = false;
    this.leftDrawer = false;
    this.goTo('home');
    this.logout();
    this.$q.notify({
      type: 'positive',
      message: 'You are now logged out',
    });
}

function   toggleNav() {
    if (this.rightDrawerOpen) {
      this.closeNav();
    } else {
      this.rightDrawerOpen = true;
    }
}
  
</script>
