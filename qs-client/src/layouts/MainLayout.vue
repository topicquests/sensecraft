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
      <div class="gt-sm">          
        <q-btn v-if = '!$store.state.auth.user'
          @click="goTo('signin')"
          outline
          roundeded
          label="sign in"
          name="signin"
          class="q-mr-sm"> 
        </q-btn> 
      <q-btn v-if = '!$store.state.auth.user'
          @click="goTo('register')"
          outline
          roundeded
          label="sign up"
          name= "register"
          ></q-btn>
      </div>
      <div class="gt-sm">          
        <q-btn  v-if = '$store.state.auth.user'
          @click="logout()"
          outline
          roundeded
          label="log off"
          name="logoff"> 
        </q-btn>
      </div>       
      <div class="lt-md">  
        <q-btn
          flat
          dense
          round
          @click="rightDrawer = ! rightDrawer"
          icon="menu"
          aria-label="Menu">
        </q-btn>       
      </div>       
      </q-toolbar>            
    </q-header>

    <q-drawer
        v-model="leftDrawer"        
        :breakpoint="200"     
        bordered
        content-class="bg-grey-4"
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
              to= "/guild-app"> Guild list        
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

    <q-drawer
      v-model="rightDrawer" >         
      <q-scroll-area class="fit">                 
        <q-list>
          <q-item>
            <q-btn
              v-if = '$store.state.auth.user'
              @click="logout()"
              outline
              roundeded
              label="Logout"
              class="q-mr-sm"
              > </q-btn> 
            <q-btn
            v-if = '!$store.state.auth.user'
              @click="goTo('signin')"
              outline
              roundeded
              label="sign in"
              class="q-mr-sm"
              > </q-btn> 
            </q-item>
            <q-item>
             <q-btn
              v-if = '!$store.state.auth.user'
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
      rightDrawer: false,
      leftDrawer: false
    }
  }, 
  
  methods: {
    logout() {
      this.rightDrawer = false;
      this.leftDrawer = false;
      this.$store.dispatch("auth/logout")
      .then(response => {
          this.$q.notify({
            type: "positive",
            message: "You are now logged out"
          });
          this.$store.commit("SET_USER_DATA", {user: null})
      })
    },
    goTo(route) {
      this.rightDrawer = false;
      this.leftDrawer = false;
      this.$router.push({ name: route });
    },
  }
};
</script>
