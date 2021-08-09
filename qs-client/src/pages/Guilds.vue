<template>
  <q-page style ="background-color:lightgrey" >
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <q-card>
          <div>
            <q-table title="Guild List" :data="guildList" :columns="columns" row-key = "desc">
              <template slot="body" slot-scope="props">
                <q-tr :props="props">
                  <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                  <q-td key="label" :props="props">{{props.row.label}}</q-td>
                  <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                  <q-td key="public" :props="props">{{props.row.public}}</q-td>
                  <q-td key="date" :props="props">{{props.row.created_at}}</q-td>
                  <q-td key="nodeId" auto-width :props="props">
                    <router-link :to="{ name: 'guildview', params: { id:  props.row.id }}">View</router-link>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>

import { mapGetters } from "vuex";
import scoreboard from '../components/scoreboard.vue'

export default {
  props: ["member"],
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
          name: "public",
          required: false,
          label: "Public",
          align: "left",
          field: "public",
          sortable: true
        },
        {
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "created_at",
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
      ]
    }
  },
  components: {
    "scoreboard": scoreboard
  },
  computed: {
    guildList() {
      return  this.$store.getters['guilds/getGuilds'];
    }
  },

  async beforeMount() {
     const guilds = await this.$store.dispatch('guilds/findGuilds');
     console.log('find guilds returns: ', guilds);
  }
};
</script>
