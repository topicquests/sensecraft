<template>
   <q-page :padding="true" class = "flex flex-center bg-secondary" >
     <div>
       <div class="row q-col-gutter-sm">
     </div>
     <div class="row q-col-gutter-xl">
       <div>
       <q-card >
        <q-table title="Quests" :data="getQuests" :columns="columns1" row-key = "desc">
         <template slot="body" slot-scope="props">
          <q-tr :props="props">
            <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
            <q-td key="label" :props="props">{{props.row.label}}</q-td>
            <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
            <q-td key="questNodeId" auto-width :props="props">
              <router-link :to="{ name: 'questRequest', params: { quest_id:  props.row.id }}">Edit</router-link>
            </q-td>
          </q-tr>
        </template>
      </q-table>
     </q-card>
    </div>
    <div>
      <q-card>
<p> If you have not already choose a guild join a guild</p>
      </q-card>
    </div>
    <div>
      <q-card>
        <q-table title="Guilds" :data="getGuilds" :columns="columns2" row-key = "desc">
          <template slot="body" slot-scope="props">
            <q-tr :props="props">
              <q-td key="guildDesc" :props="props"> {{props.row.name}}</q-td>
              <q-td key="label" :props="props">{{props.row.label}}</q-td>
              <q-td key="guildHandle" :props="props">{{props.row.handle}}</q-td>
              <q-td key="guildNodeId" auto-width :props="props">
               <router-link v-model = "guildId" :to="{ name: 'guild', params: { guild_id:  props.row.id }}" >Join</router-link>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </div>
    </div>
    </div>
  </q-page>
</template>

<script>
import { computed } from '@vue/composition-api'

export default {
  props: ["guild"],
  data() {
    return {
      columns1: [
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
          name: "questNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }
      ],
      columns2:[
        {
          name: 'guildDesc',
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true
        },
        {
          name: "guildHandle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
          sortable: true
        },
        {
          name: "guildNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }
      ],
      guildId: 0,
      isAuthenticated: false,
      serverPagination: {},
      serverData: []
    };
  },

  computed: {
    getQuests() {
      return  this.$store.getters['quests/getQuests'];
    },
    getGuilds() {
      return  this.$store.getters['guilds/getGuilds'];
    }
  },
    methods: {
    }
}
</script>