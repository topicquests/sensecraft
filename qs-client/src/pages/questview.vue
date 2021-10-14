<template>
  <q-page style="background-color: #caf0f8">
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="row justify-center">
      <div class="col-4 q-pa-lg">
        <questCard
          v-bind:currentQuestCard="getCurrentQuest"
          :creator="getQuestCreator()"
        >
        </questCard>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import questCard from "../components/quest-card.vue";
import scoreboard from "../components/scoreboard.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import app from "../App.vue";
import {
  QuestsState,
  QuestsGetterTypes,
  QuestsActionTypes,
} from "../store/quests";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
@Component<QuestViewPage>({
  components: {
    questCard: questCard,
    scoreboard: scoreboard,
  },
  computed: {
    ...mapState("quests", {
      questId: (state: QuestsState) => state.currentQuest,
    }),
    ...mapGetters("quests", ["getCurrentQuest"]),
    ...mapGetters("members", ["getMemberById"]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("members", ["fetchMemberById"]),
  },
})
export default class QuestViewPage extends Vue {
  currentQuestId!: QuestsState["currentQuest"];

  // declare the computed attributes for Typescript
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getMemberById: MembersGetterTypes["getMemberById"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];

  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
  }
  async beforeMount() {
    try {
      const questId = Number.parseInt(this.$route.params.quest_id);
      await app.userLoaded;
      await this.setCurrentQuest(questId);
      await this.ensureQuest({ quest_id: questId });
      const quest = this.getCurrentQuest;
      await this.fetchMemberById({ params: { id: quest.creator } });
      const creator = this.getMemberById(quest.creator);
    } catch (error) {
      console.log("Error in questview create: ", error);
    }
  }
}
</script>
