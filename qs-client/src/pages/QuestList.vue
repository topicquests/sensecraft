<template>
  <q-page style="background-color: #caf0f8">
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
import scoreboard from "../components/scoreboard.vue";
import QuestTable from "../components/quest-table.vue";
import { userLoaded } from "../boot/userLoaded";

export default {
  props: ["member"],

  components: {
    scoreboard: scoreboard,
    QuestTable,
  },
  computed: {
    ...mapGetters("quests", ["getQuestsByStatus"]),
    notStartedQuests() {
      return this.getQuestsByStatus("draft");
    },

    registrationQuests() {
      return this.getQuestsByStatus("registration");
    },

    ongoingQuests() {
      return this.getQuestsByStatus("ongoing");
    },

    finishedQuests() {
      return this.getQuestsByStatus("finished");
    },
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
  },
  async beforeMount() {
    await userLoaded;
    await this.ensureAllQuests();
  },
};
</script>
<style scoped>
.background {
  background-color: rgba(45, 45, 45, 0.1);
}
</style>
