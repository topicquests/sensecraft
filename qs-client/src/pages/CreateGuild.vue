<template>
  <q-page class="bg-secondary" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-xs q-mt-md" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="row justify-center">
      <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Guild</h4>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 35%">
        <q-card class="q-pl-md" column items-center>
          <div class="row justify-start q-pa-lg">
            <q-option-group
              v-model="guild.public"
              :options="public_private_bool"
              color="primary"
              inline
            >
            </q-option-group>
          </div>
          <div class="row justify-start q-pb-lg">
            <q-input class="guildText" v-model="guild.name" label="Name" />
          </div>
          <div class="row justify-start q-pb-xs">Details<br /></div>
          <div class="row justify-start q-pb-lg">
            <q-editor v-model="guild.description" style="width: 85%"></q-editor>
          </div>
          <div class="row">
            <span class="q-pt-md"> Default Role </span>
            <q-select
              class="q-ml-md"
              style="width: 50%"
              v-model="role"
              :options="getRoles"
              option-label="name"
              option-value="id"
            />
          </div>
          <div class="row justify-start q-pb-lg">
            <q-input v-model="guild.handle" label="Handle" class="guildText" />
          </div>
          <div class="row justify-start q-pb-lg">
            <q-btn
              label="Submit"
              @click="doSubmit(guild)"
              color="primary"
              class="q-mr-md q-ml-md"
            />
            <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import { GuildsActionTypes } from "../store/guilds";
import { RoleActionTypes, RoleGetterTypes } from "../store/role";
import { Role } from "./../types";
import { MembersActionTypes } from "src/store/members";

@Component<GuildFormPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
  },

  computed: {
    ...mapGetters("role", ["getRoles"]),
  },

  methods: {
    ...mapActions("guilds", ["createGuild"]),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions('members', ['ensureAllMembers'])
  },
  meta: {
    title: 'Create Guild',
  },
})
export default class GuildFormPage extends Vue {
  public_private_bool = public_private_bool;
  ready = false;
  createGuild: GuildsActionTypes["createGuild"];

  // declare the computed attributes for Typescript
  getRoles!: RoleGetterTypes["getRoles"];
  role: Partial<Role> = {
    name: "",
  };

  // declare the methods for Typescript
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];
  ensureAllMembers: MembersActionTypes['ensureAllMembers']

  async doSubmit(guild) {
    try {
      guild.default_role_id = this.role.id;
      const res = await this.createGuild({ data: guild });
      this.$q.notify({
        message: `Added new guild`,
        color: "positive",
      });
      this.$router.push({ name: "guild_admin", params: { guild_id: res.id } });
    } catch (err) {
      console.log("there was an error in creating guild ", err);
      this.$q.notify({
        message: `There was an error creating new guild.`,
        color: "negative",
      });
    }
  }

  async beforeMount() {
    await userLoaded;
    await this.ensureAllRoles();
    await this.ensureAllMembers();
    this.ready = true;
  }
  data() {
    return {
      guild: {
        name: "",
        handle: "",
        public: false,
        description: "",
        default_role_id: null,
      },
    };
  }
}
</script>
<style>
.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
.guildText {
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  width: 25%;
}
#h4 {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
}
</style>
