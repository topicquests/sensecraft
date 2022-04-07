<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div
            v-if="notStartedQuests.length"
            class="col-4"
            style="width: 100%"
          >
            <QuestTable
              v-bind:quests="notStartedQuests"
              title="Not Started"
              :view="true"
            ></QuestTable>
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no quests started</h4>
          </div>
        </div>
        <div class="column items-center">
          <div
            v-if="registrationQuests.length"
            class="col-4 "
            style="width: 100%"
          >
            <QuestTable
              v-bind:quests="registrationQuests"
              title="Registering"
              :view="true"
            ></QuestTable>
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no quests in registration</h4>
          </div>
        </div>
        <div class="column items-center">
          <div
            v-if="ongoingQuests.length"
            class="col-4 "
            style="width: 100%"
          >
            <QuestTable
              v-bind:quests="ongoingQuests"
              title="Ongoing"
              :view="true"
            ></QuestTable>
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no ongoing quests</h4>
          </div>
        </div>
        <div class="column items-center">
          <div
            v-if="finishedQuests.length"
            class="col-4"
            style="width: 100%"
          >
            <QuestTable
              v-bind:quests="finishedQuests"
              title="Finished"
              :view="true"
            ></QuestTable>
          </div>
          <div v-else class="column items-center">
            <h4>There are no quests finished</h4>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions } from "vuex";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import scoreboard from "../components/scoreboard.vue";
import QuestTable from "../components/quest-table.vue";
import member from "../components/member.vue";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import { quest_status_enum, quest_status_list } from "../enums";
import { Quest } from "../types";
import { GuildsActionTypes } from "src/store/guilds";

@Component<QuestList>({
  components: {
    scoreboard: scoreboard,
    QuestTable,
    member: member,
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
    ...mapActions("quests", ["ensureAllQuests", "setCurrentQuest"]),
    ...mapActions("guilds", ["setCurrentGuild"]),
  },
})
export default class QuestList extends Vue {
  ready = false;
  getQuestsByStatus!: QuestsGetterTypes["getQuestsByStatus"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  notStartedQuests!: Quest[];
  registrationQuests!: Quest[];
  ongoingQuests!: Quest[];
  finishedQuests!: Quest[];
  async beforeMount() {
    await userLoaded;
    await this.ensureAllQuests();
    await this.setCurrentQuest(null);
    await this.setCurrentGuild(null);
    this.ready = true;
  }
}
</script>
<style scoped>
.background {
  background-color: rgba(45, 45, 45, 0.1);
}
</style>
