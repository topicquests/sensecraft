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
    <div class="col-4">
      <div class="row justify-center">
        <h3>Edit Guild</h3>
      </div>
    </div>
    <div class="row justify-center">
      <div class="col-4">
        <guild-card
          v-bind:currentGuild="getCurrentGuild"
          class="q-ml-xl"
          style="width: 80%"
        ></guild-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { BaseGetterTypes } from "../store/baseStore";
import { userLoaded } from "../boot/userLoaded";
import { permission_enum } from "../enums";
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import guildCard from "../components/guild-card.vue";
import Component from "vue-class-component";
import Vue from "vue";

@Component<GuildEdit>({
  name: "guild_edit",
  components: {
    scoreboard: scoreboard,
    member: member,
    guildCard: guildCard,
  },
  computed: {
    ...mapState("member", ["member"]),
    ...mapGetters("guilds", ["getGuildById", "getCurrentGuild"]),
    ...mapGetters(["hasPermission"]),
    guild: function () {
      return this.getGuildById(this.guild_id);
    },
  },
  methods: {
    ...mapActions("guilds", ["updateGuild", "ensureGuild"]),
  },
})
export default class GuildEdit extends Vue {
  guild_id: number;
  isAdmin: Boolean = false;

  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  hasPermission!: BaseGetterTypes["hasPermission"];

  ensureGuild: GuildsActionTypes["ensureGuild"];

  async beforeMount() {
    this.guild_id = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    await this.ensureGuild({ guild_id: this.guild_id });
    this.isAdmin = this.hasPermission(
      permission_enum.guildAdmin,
      this.guild_id
    );
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
</style>
