<template>
  <q-page style="background-color: #CAF0F8">
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
     <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
      <QuestTable v-bind:quests="notStartedQuests" title="Not Started" :view=true></QuestTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
         <QuestTable v-bind:quests="registrationQuests" title="Registering" :view=true></QuestTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <QuestTable v-bind:quests="ongoingQuests" title="Ongoing" :view=true></QuestTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <QuestTable v-bind:quests="finishedQuests" title="Finished" :view=true></QuestTable>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import scoreboard from '../components/scoreboard.vue'
import QuestTable from '../components/quest-table.vue';
import app from '../App'

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
    "scoreboard": scoreboard,
    QuestTable
  },
  computed: {
    ...mapGetters('quests', ['getQuestsByStatus']),
    notStartedQuests() {
      return this.getQuestsByStatus('draft');
    },

    registrationQuests() {
      return this.getQuestsByStatus('registration');
    },

    ongoingQuests() {
      return this.getQuestsByStatus('ongoing');
    },

    finishedQuests() {
      return this.getQuestsByStatus('finished');
    },
  },
  methods: {
    ...mapActions('quests', ['ensureAllQuests'])
  },
  async beforeMount() {
    await app.userLoaded
    await this.ensureAllQuests();
  }
};
</script>
<style scoped>
.background {
    background-color: rgba(45, 45, 45, 0.1)
}
</style>
