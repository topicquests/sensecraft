<template>
  <q-page>
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>

    <div class="row justify-center">
      <div class="col-5 q-pa-lg">
        <questCard v-bind:currentQuestCard="getCurrentQuest"> </questCard>
      </div>
    </div>
    <div class="row justify-center">
      <div class="col-6">
        <guilds-to-quest-card v-bind:questId="questId"></guilds-to-quest-card>
      </div>
    </div>

    <div class="row justify-center q-mt-lg">
      <div class="col-6 q-md q-mr-lg">
        <node-tree
          v-bind:nodes="getConversationTree"
          v-on:updateTree="selectionChanged"
          :channelId="null"
          :editable="false"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import questCard from "../components/quest-card.vue";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import nodeTree from "../components/node-tree.vue";
import nodeForm from "../components/node-form.vue";
import guildsToQuestCard from "../components/guilds-to-quest-card.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { GuildsActionTypes } from "../store/guilds";
import { QuestsGetterTypes, QuestsActionTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";

@Component<QuestViewPage>({
  components: {
    questCard: questCard,
    scoreboard: scoreboard,
    member: member,
    nodeForm: nodeForm,
    nodeTree: nodeTree,
    guildsToQuestCard: guildsToQuestCard,
  },
  computed: {
    ...mapGetters("quests", ["getCurrentQuest", "getCurrentGamePlay"]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "getConversation",
      "getConversationTree",
      "getFocusNode",
      "getConversationTree",
      "getRootNode",
    ]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["ensureGuildsPlayingQuest"]),
    ...mapActions("members", ["fetchMemberById"]),
    ...mapActions("conversation", [
      "ensureConversation",
      "ensureConversationSubtree",
      "ensureRootNode",
      "ensureConversationNeighbourhood",
    ]),
  },
})
export default class QuestViewPage extends Vue {
  questId: number;
  selectedNodeId: number = null;

  // declare the computed attributes for Typescript
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getConversationTree: ConversationGetterTypes["getConversationTree"];
  getConversation: ConversationGetterTypes["getConversation"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getRootNode!: ConversationGetterTypes["getRootNode"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  ensureConversation: ConversationActionTypes["ensureConversation"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];
  ensureConversationSubtree: ConversationActionTypes["ensureConversationSubtree"];
  ensureGuildsPlayingQuest: GuildsActionTypes["ensureGuildsPlayingQuest"];
  ensureConversationNeighbourhood: ConversationActionTypes["ensureConversationNeighbourhood"];

  selectionChanged(id) {
    this.selectedNodeId = id;
  }
  async beforeMount() {
    const quest_id = Number.parseInt(this.$route.params.quest_id);
    this.questId = quest_id;
    await Promise.all([
      this.setCurrentQuest(quest_id),
      this.ensureConversation(quest_id),
      this.ensureGuildsPlayingQuest({ quest_id }),
      this.ensureQuest({ quest_id }),
    ]);
    let node_id =
      this.getCurrentGamePlay?.focus_node_id || this.getRootNode?.id;
    if (node_id) {
      await this.ensureConversationNeighbourhood({
        node_id,
        guild_id: null,
      });
      this.selectedNodeId = this.getFocusNode.id;
    }
  }
}
</script>
<style></style>
