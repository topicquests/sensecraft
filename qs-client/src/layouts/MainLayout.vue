<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>        
        <q-toolbar-title>
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
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script>
import EssentialLink from "components/EssentialLink.vue";



export default {
  name: "MainLayout",  
  
  methods: {
    logout() {
      this.$store.dispatch("auth/logout");
    }
  }
};
</script>
