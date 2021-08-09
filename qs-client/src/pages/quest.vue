<template>
  <q-page class = 'bg-grey-4'>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
     <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
      <q-card>
        <q-table title="Not Started Quests" :data="notStartedQuests" :columns="columns" row-key = "desc">
          <template slot="body" slot-scope="props">
            <q-tr :props="props">
              <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
              <q-td key="label" :props="props">{{props.row.label}}</q-td>
              <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
              <q-td key="public" :props="props">{{props.row.public}}</q-td>
              <q-td key="status" :props="props">{{props.row.status}}</q-td>
              <q-td key="date" :props="props">{{props.row.created_at}}</q-td>
              <q-td key="nodeId" auto-width :props="props">
                <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <q-card>
          <q-table title="Registered Quests" :data="registrationQuests" :columns="columns" row-key = "desc">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                <q-td key="label" :props="props">{{props.row.label}}</q-td>
                <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                <q-td key="public" :props="props">{{props.row.public}}</q-td>
                <q-td key="status" :props="props">{{props.row.status}}</q-td>
                <q-td key="date" :props="props">{{props.row.created_at}}</q-td>
                <q-td key="nodeId" auto-width :props="props">
                  <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <q-card>
          <q-table title="In Progress Quests" :data="ongoingQuests" :columns="columns" row-key = "desc">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                  <q-td key="label" :props="props">{{props.row.label}}</q-td>
                  <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                  <q-td key="public" :props="props">{{props.row.public}}</q-td>
                  <q-td key="status" :props="props">{{props.row.status}}</q-td>
                  <q-td key="date" :props="props">{{props.row.created_at}}</q-td>
                  <q-td key="nodeId" auto-width :props="props">
                  <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
    <div class="column items-center">
    <div class="col-4 q-pa-lg" style="width: 1000px">
    <q-card>
        <q-table title="Completed Quests" :data="finishedQuests" :columns="columns" row-key = "desc">
          <template slot="body" slot-scope="props">
            <q-tr :props="props">
              <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                  <q-td key="label" :props="props">{{props.row.label}}</q-td>
                  <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                  <q-td key="public" :props="props">{{props.row.public}}</q-td>
                  <q-td key="status" :props="props">{{props.row.status}}</q-td>
                  <q-td key="date" :props="props">{{props.row.created_at}}</q-td>
                  <q-td key="nodeId" auto-width :props="props">
                <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
              </q-td>
            </q-tr>
          </template>
        </q-table>
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
          name: "status",
          required: false,
          label: "Status",
          align: "left",
          field: "status",
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
    ...mapGetters('quests',['getQuestByStatus']),
    notStartedQuests() {
      return  this.getQuestByStatus("draft");
    },

     registrationQuests() {
      return  this.getQuestByStatus("registration");
    },

    ongoingQuests() {
       return  this.getQuestByStatus('ongoing');
    },

    finishedQuests() {
       return  this.$store.getters['quests/getQuestByStatus']('finished');
    }
  },

  async beforeMount() {
     const quests = await this.$store.dispatch('quests/findQuests');
     console.log('find quests returns: ', quests);
  }
};
</script>
<style scoped>
.background {
    background-color: rgba(45, 45, 45, 0.1)
}
</style>
