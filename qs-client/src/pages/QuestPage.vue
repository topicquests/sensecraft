<template>
  <q-page>
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
import nodeTree from "../components/node-tree.vue";
import nodeForm from "../components/node-form.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import { ibis_node_type_type, ibis_node_type_list } from "../enums";
import { ConversationNode } from "../types";
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
    nodeForm: nodeForm,
    nodeTree: nodeTree,
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
      this.selectedNodeId = this.getFocusNode.id;
    }
  }
}
</script>
<style></style>
