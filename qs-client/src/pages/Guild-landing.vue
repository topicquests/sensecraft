<template>
  <q-page :padding="true">
    <q-btn
      v-if = '$store.state.user.user'
      style="margin-bottom: 4px;"
      label="New Guild"
      @click="$router.replace('/guildform')"
    />

    <q-table title="My Guilds" :data="rootConversations" :columns="columns" row-key = "desc">
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
          <q-td key="label" :props="props">{{props.row.label}}</q-td>
          <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
          <q-td key="date" :props="props">{{props.row.createdAt}}</q-td>
          <q-td key="nodeId" auto-width :props="props">
            <router-link :to="{ name: 'guildedit', params: { id:  props.row.id }}">Edit</router-link>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>

import {mapGetters } from "vuex";

export default {
  props: ["user"],
  data() {
    return {
      columns: [
        {
          name: 'desc',
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true
        },
        {
          name: "handle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
          sortable: true
        },
        {
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "createdAt",
          sortable: true
        },
        {
          name: "nodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }
      ],
      isAuthenticated: false,
      serverPagination: {},
      serverData: []
    };
  },

  computed: {
    rootConversations() {
      return  this.$store.getters['guilds/getGuilds'];
    }

  },
};
</script>

<style>
</style>
