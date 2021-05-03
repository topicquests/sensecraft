<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>        
        <q-toolbar-title>
<<<<<<< HEAD
          <q-img src="../statics/guild_quest.png"
          style="width:150px"></q-img>
        </q-toolbar-title> 
        <div class="gt-sm">          
         <q-btn
          @click="goTo('signin')"
          outline
          roundeded
          label="sign in"
          name="signin"
          class="q-mr-sm"
          > </q-btn> 
        <q-btn
          @click="goTo('register')"
          outline
          roundeded
          label="sign up"
          name= "register"
          ></q-btn>
        </div> 
        <div class="lt-md"> 
          <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = ! leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
          ></q-btn>       
        </div>       
      </q-toolbar>            
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen" >         
      <q-scroll-area class="fit">                 
        <q-list>
          <q-item>
            <q-btn
              outline
              roundeded
              label="sign in"
              class="q-mr-sm"
              > </q-btn> 
            </q-item>
            <q-item>
             <q-btn
              @click="goTo('register')"
              outline
              roundeded
              label="sign up"
            ></q-btn> 
          </q-item>
        </q-list>
      </q-scroll-area>         
    </q-drawer>
    
=======
          QS Demo
        </q-toolbar-title>
        <div>
          <!--v-if="!$store.state.auth.user"-->
          <q-btn
            
            flat
            to="/register"
            stretch
            class="text-bold"
            ><q-icon
              name="fas fa-user-plus"
              class="q-mr-sm text-white"
              size="xs"
            ></q-icon
            >Register</q-btn
          >
           <!--v-if="!$store.state.auth.user"-->
          <q-btn
           
            to="/signin"
            flat
            stretch
            class="text-bold"
          >
            <q-icon
              name="fas fa-sign-in-alt"
              class="q-mr-sm text-white"
              size="xs"
            ></q-icon
            >Sign In</q-btn
          >          
        </div>
      </q-toolbar>
    </q-header>
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script>
<<<<<<< HEAD

export default {
  name: "MainLayout",

  data () {
    return {
      leftDrawerOpen: false,
    }
  }, 
=======
import EssentialLink from "components/EssentialLink.vue";



export default {
  name: "MainLayout",  
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
  
  methods: {
    logout() {
      this.$store.dispatch("auth/logout");
<<<<<<< HEAD
    },
    goTo(route) {
      this.$router.push({ name: route });
    },
=======
    }
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
  }
};
</script>
