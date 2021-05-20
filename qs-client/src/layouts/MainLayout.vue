<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>        
        <q-toolbar-title>
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
          class="q-mr-sm"> 
        </q-btn> 
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
              @click="goTo('signin')"
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
    
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script>

export default {
  name: "MainLayout",

  data () {
    return {
      leftDrawerOpen: false,
    }
  }, 
  
  methods: {
    logout() {
      this.$store.dispatch("auth/logout");
    },
    goTo(route) {
      this.$router.push({ name: route });
    },
  }
};
</script>
