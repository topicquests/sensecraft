<template>
  <q-page>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <QuestTable
          v-bind:quests="notStartedQuests"
          title="Not Started"
          :view="true"
        ></QuestTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <QuestTable
          v-bind:quests="registrationQuests"
          title="Registering"
          :view="true"
        ></QuestTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <QuestTable
          v-bind:quests="ongoingQuests"
          title="Ongoing"
          :view="true"
        ></QuestTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <QuestTable
          v-bind:quests="finishedQuests"
          title="Finished"
          :view="true"
        ></QuestTable>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions } from "vuex";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import scoreboard from "../components/scoreboard.vue";
import QuestTable from "../components/quest-table.vue";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import { quest_status_enum, quest_status_list } from "../enums";

@Component<QuestList>({
  components: {
    scoreboard: scoreboard,
    QuestTable,
  },

  computed: {
    ...mapGetters("quests", ["getQuestsByStatus"]),
    notStartedQuests() {
      return this.getQuestsByStatus(quest_status_enum.draft);
    },
    registrationQuests() {
      return this.getQuestsByStatus(quest_status_enum.registration);
    },
    ongoingQuests() {
      return this.getQuestsByStatus(quest_status_enum.ongoing);
    },
    finishedQuests() {
      return this.getQuestsByStatus(quest_status_enum.finished);
    },
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
  },
})
export default class QuestList extends Vue {
  getQuestsByStatus!: QuestsGetterTypes["getQuestsByStatus"];
  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  async beforeMount() {
    await userLoaded;
    await this.ensureAllQuests();
  }
}
</script>
<style scoped>
.background {
  background-color: rgba(45, 45, 45, 0.1);
}
</style>
