<template>
  <q-page style="background-color: #caf0f8">
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
          v-bind:nodes="getNeighbourhoodTree"
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
import {
  QuestsState,
  QuestsGetterTypes,
  QuestsActionTypes,
} from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
  ibis_child_types,
} from "../store/conversation";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";

@Component<QuestViewPage>({
  components: {
    questCard: questCard,
    scoreboard: scoreboard,
    nodeForm: nodeForm,
    nodeTree: nodeTree,
  },
  computed: {
    ...mapGetters("quests", ["getCurrentQuest", "getCurrentGamePlay"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "getConversation",
      "getConversationTree",
      "getFocusNode",
      "getNeighbourhoodTree",
      "getRootNode",
    ]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
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
  newNode: Partial<ConversationNode> = {};
  selectedNodeId: number = null;
  newNodeParent: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  currentQuestId!: QuestsState["currentQuest"];

  // declare the computed attributes for Typescript
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getMemberById: MembersGetterTypes["getMemberById"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getConversationTree: ConversationGetterTypes["getConversationTree"];
  getConversation: ConversationGetterTypes["getConversation"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getNeighbourhoodTree!: ConversationGetterTypes["getNeighbourhoodTree"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getRootNode!: ConversationGetterTypes["getRootNode"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureConversation: ConversationActionTypes["ensureConversation"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];
  ensureConversationSubtree: ConversationActionTypes["ensureConversationSubtree"];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];

  selectionChanged(id) {
    this.selectedNodeId = id;
  }
  async beforeMount() {
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await this.ensureConversation(this.questId);
    await this.ensureAllGuilds;
    await Promise.all([this.setCurrentQuest(this.questId)]);
    let node_id = this.getCurrentGamePlay?.focus_node_id;
    if (!node_id) {
      await this.ensureRootNode(this.questId);
      node_id = this.getRootNode?.id;
    }
    if (node_id) {
      await this.ensureConversationSubtree({
        node_id,
      });
      this.selectedNodeId = this.getFocusNode.id;
    }
    const quest = this.getCurrentQuest;
  }
}
</script>
<style></style>
