<template>
  <div>
    <q-card class="q-pl-md">
      <div v-if="guild" class="row justify-start q-pb-lg">
        <q-input v-model="guild.name" />
      </div>
      <span class="q-ml-xl" style="font-weight: bold">Type of Guild</span>
      <div class="row justify-start">
        <q-option-group
          v-if="guild"
          v-model="guild.public"
          :options="public_private_bool"
          color="primary"
          inline
        >
        </q-option-group>
      </div>
      <section v-if="showDescription == true">
        <div class="row justify-start q-pb-xs" style="font-weight: bold">
          Description<br />
        </div>
        <div class="row justify-start q-pb-sm">
          <q-editor v-model="guild.description"> </q-editor>
        </div>
      </section>
      <div>
        <section class="q-pt-lg">
          <span class="q-pl-xl" style="font-weight: bold">Invitation</span>
          <q-option-group
           v-if="guild"
            v-model="guild.open_for_applications"
            :options="invitation"
            color="primary"
            inline
          >
          </q-option-group>
        </section>
      </div>
      <q-separator color="grey"></q-separator>
      <section class="q-pt-md">
        <div class="row justify-start q-pb-lg">
          <q-btn
            label="Submit"
            @click="doSubmit"
            color="primary"
            class="q-mr-md q-ml-md"
          />
          <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
        </div>
      </section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import { Guild } from "../types";
import {
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import { Prop } from "vue/types/options";

const GuildCardProps = Vue.extend({
  props: {
    currentGuild: Object as Prop<Guild>,
    showDescription: Boolean,
  },
});

@Component<GuildCard>({
  name: "guild-card",
  data() {
    return {
      public_private_bool: public_private_bool,
      invitation: [
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
  invitation: boolean;
  public_private_bool: boolean;

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
  async beforeMount() {
    await userLoaded;
  }
}
</script>
