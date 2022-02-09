<template>
  <div>
    <q-card
      ><guilds-quest-table v-bind:questId="questId"> </guilds-quest-table>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import guildsQuestTable from "../components/guilds-quest-table.vue";
import { Prop } from "vue/types/options";

const GuildsToQuestProp = Vue.extend({
  props: {
    questId: Number,
  },
});

@Component<GuildToQuestCard>({
  name: "GuildsToQuest",
  components: {
    guildsQuestTable: guildsQuestTable,
  },
  computed: {},
})
export default class GuildToQuestCard extends GuildsToQuestProp {}
</script>
