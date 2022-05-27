<template>
  <q-card>
    <q-table
      class="quest-table"
      :title="title"
      :data="questData"
      :columns="columns"
      row-key="id"
    >
     <template v-slot:body-cell-view="props">
        <td>
          <span v-if="view" key="view">
            <router-link
              :to="{
                name: 'quest_page',
                params: { quest_id: props.row.id },
              }"
            >
              View
            </router-link>
          </span>
          <span v-if="edit" key="view">
            <router-link
              :to="{
                name: 'quest_edit',
                params: { quest_id: props.row.id },
              }"
              >Edit</router-link
            >
          </span>
        </td>
      </template>
      <template v-slot:body-cell-actions="props">
        <td>
          <slot v-bind:quest="props.row.quest"></slot>
        </td>
      </template>
    </q-table>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Quest, Member } from "../types";
import { Prop } from "vue/types/options";

type QuestRow = {
  id: number;
  name: string;
  quest: Quest;
  numPlayers: number;
  numMoves: number;
};

const QuestTableProps = Vue.extend({
  props: {
    quests: Array as Prop<Quest[]>,
    title: String,
    view: {
      type: Boolean,
      required: true,
      default: false,
    },
    edit: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
});

@Component<QuestTable>({
  name: "quest_table",
  computed: {
    columns: function () {
      const extra = this.extra_columns || [];
      return [
        {
          name: "questNodeId",
          required: false,
          label: "id",
          align: "left",
          field: "id",
          sortable: true,
        },
        {
          name: "name",
          required: true,
          label: "title",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "numPlayers",
          required: true,
          label: "#Players",
          align: "left",
          field: "player_count",
          sortable: true,
        },
        {
          name: "numMoves",
          required: true,
          label: "#Moves",
          align: "left",
          field: "node_count",
          sortable: true,
        },
        {
          name: "actions",
          required: true,
          label: "Interval",
          align: "left",
          field: "actions",
          sortable: true,
        },
        {
          name: "view",
          required: true,
          label: "View",
          align: "left",
          field: "actions",
          sortable: true,
        },
      ];
    },
    questData: function (): QuestRow[] {
      return this.quests.map((quest: Quest) => this.questRow(quest));
    },
  },
})
export default class QuestTable extends QuestTableProps {
  questData: QuestRow[];
  columns!: Object[];

  questRow(quest: Quest): QuestRow {
    return {
      id: quest.id,
      quest: quest,
      name: quest.name,
      numPlayers: null,
      numMoves: null,
    };
  }
}
</script>

<style>
q-td {
  font-size: 30%;
}
.quest-table {
  background-color: ivory;
}
</style>
