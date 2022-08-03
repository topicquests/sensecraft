<template>
  <q-card v-if="ready">
    <router-link
      v-if="!inPage && quest_id"
      :to="{
        name: 'game_channel_list',
        params: { guild_id: guild_id, quest_id: quest_id },
      }"
      >{{ title }}</router-link
    >
    <router-link
      v-else-if="!inPage"
      :to="{ name: 'guild_channel_list', params: { guild_id: guild_id } }"
      >{{ title }}</router-link
    >
    <p v-else>{{ title }}</p>
    <q-list
      style="color: darkgreen; background-color: lightblue"
      :data="getChannels"
      row-key="desc"
    >
      <q-item v-for="channel in getChannels" :key="channel.id">
        <router-link
          v-if="quest_id"
          :to="{
            name: 'game_channel_conversation',
            params: {
              guild_id: guild_id,
              quest_id: quest_id,
              channel_id: channel.id,
            },
          }"
          >{{ channel.title }}</router-link
        >
        <router-link
          v-else
          :to="{
            name: 'guild_channel_conversation',
            params: {
              guild_id: channel.guild_id,
              channel_id: channel.id,
            },
          }"
          >{{ channel.title }}</router-link
        >
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts">
import { mapGetters, mapActions } from "vuex";
import Vue from "vue";
import Component from "vue-class-component";

import { ConversationNode } from "../types";
import { userLoaded } from "../boot/userLoaded";
import { ChannelGetterTypes, ChannelActionTypes } from "../store/channel";

const ChannelListProps = Vue.extend({
  props: {
    guild_id: Number,
    quest_id: Number,
    inPage: Boolean,
    title: String,
  },
});

@Component<ChannelList>({
  name: "channel_list",

  computed: {
    ...mapGetters("channel", ["getGuildChannels", "getGameChannelsOfQuest"]),
    ...mapGetters(["hasPermission"]),
    getChannels: function () {
      return this.quest_id
        ? this.getGameChannelsOfQuest(this.quest_id)
        : this.getGuildChannels;
    },
  },
  methods: {
    ...mapActions("channel", ["ensureChannels", "createChannelNode"]),
  },
})
export default class ChannelList extends ChannelListProps {
  guild_id: number;
  quest_id: number;
  title: string;
  ready = false;
  getGameChannelsOfQuest!: ChannelGetterTypes["getGameChannelsOfQuest"];
  getGuildChannels!: ChannelGetterTypes["getGuildChannels"];
  getChannels!: ConversationNode[];
  ensureChannels!: ChannelActionTypes["ensureChannels"];

  async beforeMount() {
    await userLoaded;
    await this.ensureChannels(this.guild_id, this.quest_id);
    this.ready = true;
  }
}
</script>

<style>
q-td {
  font-size: 30%;
}
</style>
