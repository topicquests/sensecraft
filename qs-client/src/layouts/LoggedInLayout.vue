<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="drawer = !drawer" />
         <q-toolbar-title>
          <q-img src="../statics/guild_quest.png"
          style="width:150px"></q-img>
        </q-toolbar-title> 
    
        <div class="gt-sm">          
         <q-btn
          @click="logout()"
          outline
          roundeded
          label="log off"
          name="logoff"> 
        </q-btn>
      </div>
    </q-toolbar>       
  </q-header>

    <q-drawer
        v-model="drawer"
        show-if-above
        :width="200"
        :breakpoint="500"
        bordered
        content-class="bg-grey-3"
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
          <router-link
            to= "/quests">  Quest list        
          </router-link>
          </q-item>
          </div>
          <div> 
            <q-item> 
            <router-link
              to= "/guild"> Guild list        
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
<div>
    <div class="lt-md"> 
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = ! leftDrawerOpen"
          icon="menu"
          aria-label="Menu">
        </q-btn>       
      </div> 
    </div>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
          Title
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
  //name: LoggedInLayout,

  data () {
    return {
      left: false,
      leftDrawerOpen: false,
      drawer: false
    }
  },

  methods: {
    logout() {
      this.$store.dispatch("auth/logout");
      this.$router.push({ name: "home" });
    }    
  }
}
</script>