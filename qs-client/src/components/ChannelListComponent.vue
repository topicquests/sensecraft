<template>
  <q-card>
    <p>{{ title }}</p>
    <q-list
      style="color: darkgreen; background-color: lightblue"
      :data="channels"
      row-key="desc"
    >
      <q-item v-for="channel in channels" :key="channel.id">
        <router-link
          v-if="game"
          :to="{
            name: 'game_channel_conversation',
            params: {
              guild_id: channel.guild_id,
              quest_id: channel.quest_id,
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
import Vue from "vue";
import Component from "vue-class-component";
import { ConversationNode } from "../types";
// TODO ConversationNode as channel
import { Prop } from "vue/types/options";

const ChannelListProps = Vue.extend({
  props: {
    channels: Array as Prop<ConversationNode[]>,
    game: Boolean,
    title: String,
  },
});

@Component<ChannelList>({
  name: "channel_list",
})
export default class ChannelList extends ChannelListProps {}
</script>

<style>
q-td {
  font-size: 30%;
}
</style>
