<template>
  <div>
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
      <div class="row justify-start q-pb-sm">
        <q-editor v-model="guild.description"></q-editor>
      </div>
      <div>
        <q-card-section>
          <q-separator class="q-mt-sm" color="gray"></q-separator>
          <span class="q-pl-xl">Invintation</span>
          <q-option-group
            v-model="guild.open_for_applications"
            :options="invintation"
            color="primary"
            inline
          >
          </q-option-group>
        </q-card-section>
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
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions, mapState, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import { Guild } from "../types";
import {
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import { Prop } from "vue/types/options";

const GuildCardProps = Vue.extend({
  props: {
    currentGuild: Object as Prop<Guild>,
  },
});

@Component<GuildCard>({
  name: "guild-card",
  data() {
    return {
      public_private_bool: public_private_bool,
      invintation: [
        { label: "open", value: true },
        { label: "close", value: false },
      ],
    };
  },
  computed: {
    ...mapGetters("guilds", ["getGuildById"]),
  },
  methods: {
    ...mapActions("guilds", ["updateGuild"]),
  },
})
export default class GuildCard extends GuildCardProps {
  group: "public";
  guild: Guild;
  guild_id: null;
  isAdmin: false;
  invintation: Boolean;
  public_private_bool: Boolean;

  created() {
    this.guild = this.currentGuild;
  }

  getGuildById!: GuildsGetterTypes["getGuildById"];

  updateGuild: GuildsActionTypes["updateGuild"];

  async doSubmit() {
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
  }
}
</script>
