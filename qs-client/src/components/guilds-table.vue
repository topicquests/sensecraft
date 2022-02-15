<template>
  <div>
    <q-table
      class="guilds-tale"
      :title="title"
      :data="guilds"
      :columns="columns"
      row-key="desc"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
          <q-td key="numMembers">{{(props.row.guild_membership||[]).length}}</q-td>
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

            <!-- component :is="action_component" :props="props" />
import { GuildsMembershipIndicator } from "./guilds-membership-indicator";

-->
<script lang="ts">
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import Vue from "vue";
import { Prop } from "vue/types/options";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import { Guild } from "../types";


const GuildsTableProp = Vue.extend({
  props: {
    title: String,
    guilds: Array as Prop<Guild[]>,
  },
});

@Component<GuildTable>({
  name: "GuildsTable",
})
export default class GuildTable extends GuildsTableProp {
  columns = [
    {
      name: "desc",
      required: true,
      label: "Name",
      align: "left",
      field: "name",
      sortable: true,
    },
    {
      name: "numMembers",
      required: true,
      label: "# Members",
      align: "left",
      field: "(guild_membership||[]).length",
      sortable: true,
    },
    {
      name: "membership",
      required: false,
      label: "Membership",
      align: "left",
      field: "id",
      sortable: false,
    },
    {
      name: "view",
      required: false,
      label: "View",
      align: "left",
      field: "id",
      sortable: false,
    },
  ];

}
</script>
<style>
.guilds-table {
  text-align: center;
  font-size: 1em;
  background-color: ivory;
}
</style>
