<template>
  <div>
    <q-card><guilds-table v-bind:questId="questId"> </guilds-table> </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import guildsTable from "../components/guilds-table.vue";
import { Prop } from "vue/types/options";

const GuildsToQuestProp = Vue.extend({
  props: {
    questId: Number,
  },
});

@Component<GuildToQuestCard>({
  name: "GuildsToQuest",
  components: {
    guildsTable: guildsTable,
  },
  computed: {},
})
export default class GuildToQuestCard extends GuildsToQuestProp {}
</script>
