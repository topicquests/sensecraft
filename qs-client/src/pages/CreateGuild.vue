<template>
  <q-page style="background-color: lightgrey">
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
      <div class="col-4 q-pa-md" style="width: 55%">
        <q-card class="q-pl-md">
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
            <q-editor v-model="guild.description"></q-editor>
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
import { mapActions } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import { GuildsActionTypes } from "../store/guilds";

@Component<GuildFormPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
  },
  methods: {
    ...mapActions("guilds", ["createGuild"]),
  },
})
export default class GuildFormPage extends Vue {
  public_private_bool = public_private_bool;
  createGuild: GuildsActionTypes["createGuild"];
  async doSubmit(guild) {
    try {
      const res = await this.createGuild({ data: guild });
      this.$q.notify({
        message: `Added new guild`,
        color: "positive",
      });
      this.$router.push({ name: "guild_edit", params: { guild_id: res.id } });
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
  }
  data() {
    return {
      guild: {
        name: "",
        handle: "",
        public: false,
        description: "",
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
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: underline;
  text-align: center;
}
</style>
