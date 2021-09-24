<template>
  <q-page style="background-color: lightgrey">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="col">
      <div class="row justify-center">
        <h3>Edit Guild</h3>
      </div>
    </div>
    <div class="column items-center" v-if="guild">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <q-card class="q-pl-md">
          <div class="row justify-start q-pa-lg">
            <div class="q-gutter-sm">
              <q-option-group
                v-model="guild.public"
                :options="public_private_bool"
                color="primary"
                inline
              >
              </q-option-group>
            </div>
          </div>
          <div class="row justify-start q-pb-lg">
            <q-input v-model="guild.name" label="Name" />
          </div>
          <div class="row justify-start q-pb-xs">Details<br /></div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="guild.description"></q-editor>
          </div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <span label="Handle">{{ guild.handle }}</span>
          </div>
          <div class="row justify-start q-pb-lg">
            <q-btn
              label="Submit"
              @click="doSubmit"
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

<script>
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import app from "../App";
import { public_private_bool } from "../enums";

export default {
  data() {
    return {
      group: "public",
      public_private_bool,
      guild_id: null,
      isAdmin: false,
      shape: "line",
      submitResult: [],
      details: "",
      handle: "",
      type: false,
    };
  },
  components: {
    scoreboard: scoreboard,
    member: member,
  },
  computed: {
    ...mapState("member", ["member"]),
    ...mapGetters("guilds", ["getGuildById"]),
    ...mapGetters(["hasPermission"]),
    guild: function () {
      return this.getGuildById(this.guild_id);
    },
  },
  methods: {
    ...mapActions("guilds", ["updateGuild", "ensureGuild"]),

    doSubmit: async function () {
      if (this.group === true) {
        this.guild.public = true;
      }

      if (this.group === false) {
        this.guild.public = false;
      }
      try {
        await this.updateGuild({ data: this.guild });
        this.$q.notify({
          message: "Guild was updated successfully",
          color: "positive",
        });
      } catch (err) {
        console.log("there was an error in updating guild ", err);
        this.$q.notify({
          message:
            "There was an error updating guild. If this issue persists, contact support.",
          color: "negative",
        });
      }
    },
  },

  async beforeMount() {
    this.guild_id = this.$route.params.guild_id;
    await app.userLoaded;
    await this.ensureGuild(this.guild_id);
    this.isAdmin = this.hasPermission("guild_admin", this.guild_id);
  },
};
</script>

<style>
.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
</style>
