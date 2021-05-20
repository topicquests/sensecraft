<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated>
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
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

    <q-drawer v-model="left" side="left" overlay bordered>
      <!-- drawer content -->
    </q-drawer>

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
      left: false
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