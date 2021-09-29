<template>
  <q-card>
    <q-table
      style="color: darkgreen; background-color: lightblue"
      :title="title"
      :data="quests"
      :columns="columns1"
      row-key="desc"
    >
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
          <q-td key="label" :props="props">{{ props.row.label }}</q-td>
          <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
          <q-td v-if="view" key="questNodeId" auto-width :props="props">
            <router-link
              :to="{ name: 'quest_page', params: { quest_id: props.row.id } }"
              >View</router-link
            >
          </q-td>
          <q-td v-else key="questNodeId" auto-width :props="props">
            <router-link
              :to="{ name: 'quest_edit', params: { quest_id: props.row.id } }"
              >Edit</router-link
            >
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Quest, Member } from "../types";
import { Prop } from "vue/types/options";

const QuestTableProps = Vue.extend({
  props: {
    quests: Array as Prop<Quest[]>,
    title: String,
    view: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
});

@Component<QuestTable>({
  name: "quest_table",
})
export default class QuestTable extends QuestTableProps {
  columns1: [
    {
      name: "desc";
      required: true;
      label: "Label";
      align: "left";
      field: "name";
      sortable: true;
    },
    {
      name: "handle";
      required: false;
      label: "Handle";
      align: "left";
      field: "handle";
      sortable: true;
    },
    {
      name: "questNodeId";
      required: false;
      label: "Action";
      align: "left";
      field: "id";
      sortable: true;
    }
  ];
}
</script>

<style>
q-td {
  font-size: 30%;
}
</style>
