<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          dense
          flat
          round icon="menu"
          @click="leftDrawer = !leftDrawer" />
        <q-toolbar-title>
          <q-btn
            flat
            @click="goTo('home')">
            <q-img src="../statics/guild_quest.png"
            style="width:150px"></q-img>
          </q-btn>
        </q-toolbar-title>
      <div>
        <q-btn v-if = '!this.member'
          @click="goTo('signin')"
          outline
          roundeded
          label="sign in"
          name="signin"
          class="q-mr-sm">
        </q-btn>
      <q-btn v-if = '!this.member'
          @click="goTo('register')"
          outline
          roundeded
          label="sign up"
          name= "register"
          ></q-btn>
      </div>
      <div>
        <q-btn  v-if = 'this.member'
          @click="logout()"
          outline
          roundeded
          label="log off"
          name="logoff">
        </q-btn>
      </div>
      <div>
        <q-btn v-if='showTree' flat dense round aria-label="Tree View" @click="toggleNav">
          <q-icon name="menu"/>
        </q-btn>
      </div>
      </q-toolbar>
    </q-header>
    <div id="mySidenav" class="sidenav">
      <div class="q-pa-md q-gutter-sm">
        <q-tree
          :nodes="treeView"
          node-key="id"
          default-expand-all
          :selected.sync="selected">
        </q-tree>
      </div>
    </div>
    <q-drawer
        v-model="leftDrawer"
        :breakpoint="200"
        bordered
      >
        <q-scroll-area class="fit">
         <div>
           <q-list>
          <div>
            <q-item>
            About
            </q-item>
          </div>
          <div>
            <q-item>
              <router-link v-if = '$store.state.member.member'
                to= "/lobby">  Lobby
              </router-link>
            </q-item>
          </div>
          <div>
            <q-item>
              <router-link
                to= "/quest">  Quest list
              </router-link>
            </q-item>
          </div>
          <div>
            <q-item>
              <router-link v-if = 'hasPermission("createQuest")'
                to= "/quest-landing">  Quest create
              </router-link>
            </q-item>
          </div>
          <div>
            <q-item>
            <router-link
              to= "/guilds"> Guild list
            </router-link>
            </q-item>
          </div>
          <div>
            <q-item>
              <router-link v-if = 'hasPermission("createGuild")'
                to= "/guild-landing">  Guild create
              </router-link>
            </q-item>
          </div>
          <div>
            <q-item>
            <router-link
              to= "/"> Home
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
      <p id="Pfooter" >Sensecraft 2021</p>
    </q-footer>
  </q-layout>
</template>
<script>
import {mapState, mapGetters, mapActions} from 'vuex'

export default {
  name: "MainLayout",
  data () {
    return {
      simple: [
        {
          label: 'Satisfied customers (with avatar)',
          avatar: 'https://cdn.quasar.dev/img/boy-avatar.png'
      }],
      leftDrawer: false,
      rightDrawerOpen: false,
      selected: null
    }

  },
  computed: {

    ...mapState('conversation', {
      showTree: state => state.showTree,
      conversation: state => state.conversation,
      treeView: state => state.neighbourhood,
    }),
    ...mapGetters([
      'hasPermission'
    ]),
    ...mapState('member', {
      member: state => state.member
    }),

  },
  watch: {
    selected: function(val, oldVal) {
      this.setConversationNode(val)
   }
  },

  methods: {
    ...mapActions('conversation', [
      'getConversationNodeById',
      'setConversationNode'
    ]),
    toggleNav() {
      if (this.rightDrawerOpen) {
        this.closeNav();
      } else {
        this.rightDrawerOpen = true;
        document.getElementById("mySidenav").style.width = "450px";
      }
    },
    closeNav() {
      this.rightDrawerOpen = false;
      document.getElementById("mySidenav").style.width = "0";
    },
    goTo(route) {
      this.rightDrawer = false;
      this.leftDrawer = false;
      this.$router.push({ name: route });
    },
    logout() {
      this.rightDrawer = false;
      this.leftDrawer = false;
      document.getElementById("mySidenav").style.width = "0";
      this.$store.dispatch("member/logout")
      .then(response => {
          this.$q.notify({
            type: "positive",
            message: "You are now logged out"
          });
           this.goTo('home');
      })
    },
  }
};
</script>
<style>
  #Pfooter {
    text-align: center;
    font-size: 15pt;
    color:dodgerblue;
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
