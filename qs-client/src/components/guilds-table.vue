<template>
  <div>
    <q-table
      class="guilds-table"
      :title="title"
      :data="guilds"
      :columns="columns"
      row-key="desc"
    >
      <template v-slot:body="props">
        <q-tr :props="props" style="text-align:left">

          <q-td key="name" :props="props"> {{ props.row.name }}</q-td>
          <q-td key="numMembers">{{numMembers(props.row)}}</q-td>
          <q-td v-if="scores" key="score">{{scores[props.row.id]}}</q-td>
          <q-td key="actions">
            <slot v-bind:guild="props.row"></slot>
          </q-td>
          <q-td key="view">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: props.row.id },
              }"
            >
              View
            </router-link>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import Vue from "vue";
import { Prop } from "vue/types/options";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import { QuestsGetterTypes } from "src/store/quests";
import { Guild } from "../types";
import { ScoreMap } from "../scoring";

const GuildsTableProp = Vue.extend({
  props: {
    title: String,
    guilds: Array as Prop<Guild[]>,
    scores: Object as Prop<ScoreMap>,
    showPlayers: Boolean,
    extra_columns: Array as Prop<Object[]>,
  },
});

@Component<GuildTable>({
  name: "GuildsTable",
  computed: {
    columns: function() {
      const extra = this.extra_columns || [];
      if (this.scores) {
        extra.push({
          name: "score",
          required: true,
          label: "Score",
          align: "left",
          field: "scores[id]",
          sortable: true,
        });
      }
      return [
        {
          name: "name",
          required: true,
          label: "Guild",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "numMembers",
          required: true,
          label: this.showPlayers? "Players" :  "Members",
          align: "left",
          field: "this.numMembers(row)",
          sortable: true,
        },
        ...extra,
        {
          name: "actions",
          required: true,
          label: "Actions",
          align: "left",
          field: "actions",
          sortable: true,
        },
        {
          name: "view",
          required: true,
          label: "View",
          align: "left",
          field: "view",
          sortable: false,
        },
      ];
    },
    ...mapGetters('quests', ["getCurrentQuest"]),
  }
})
export default class GuildTable extends GuildsTableProp {
  columns!: Object[];
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  numMembers(guild: Guild) {
    if (this.showPlayers) {
      const quest = this.getCurrentQuest;
      return (quest.casting || []).filter(c => c.guild_id==guild.id).length;
    }
    return (guild.guild_membership || []).length;
  }
}
</script>
<style>
.guilds-table {
  text-align: center;
  font-size: 1em;
  background-color:ivory;
}
</style>
