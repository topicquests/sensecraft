<template>
  <q-page style ="background-color:lightgrey" >
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
          <q-card >
            <q-table title="Quests" :data="this.quests" :columns="columns1" row-key = "desc">
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
     <div class="column items-center">
      <div class="col-4 q-pa-lg q-pl-lg" style="width: 1000px">
        <q-card>
            <p> If you have not already choosen a guild to join. Select one from the list </p>
            <p> If you are already a member of a guild, click on join button to go to that's guild page</p>
        </q-card>
      </div>
     </div>
      <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <q-card >
          <q-table title="Guilds" :data="this.guilds" :columns="columns2" row-key = "desc">
            <template slot="body" slot-scope="props">
                <q-tr :props="props">
                  <q-td key="guildDesc" :props="props"> {{props.row.name}}</q-td>
                  <q-td key="label" :props="props">{{props.row.label}}</q-td>
                  <q-td key="guildHandle" :props="props">{{props.row.handle}}</q-td>
                  <q-td key="guildNodeId" auto-width :props="props">
                    <router-link :to="{ name: 'guild', params: { guild_id:  props.row.id }}" >Join</router-link>
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
import scoreboard from '../components/scoreboard.vue'
import { computed } from '@vue/composition-api'
import { mapActions, mapState } from 'vuex'

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
      ]
    };
  },
  components: {
    "scoreboard": scoreboard
  },
  computed: {
    ...mapState('guilds', {
      guilds: state => state.guilds
    }),
    ...mapState('quests', {
      quests: state => state.quests
    }),
  },
  methods: {
    ...mapActions('quests',['findQuests']),
    ...mapActions('guilds',['findGuilds']),
  },
  async beforeMount() {
     const quests = await this.findQuests;
     const guilds = await this.findGuilds;
  }
}
</script>