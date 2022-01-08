<template>
  <q-page style="background-color: #caf0f8">
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="sidenav gt-sm">
      <div class="q-pa-md q-gutter-sm">
        <node-tree
          v-bind:nodes="getConversationTree"
          :channelId="null"
          :editable="true"
          :roles="[]"
          v-on:updateTree="selectionChanged"
        />
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
      <div class="col-4 q-pa-lg">
        <node-form v-bind:nodeInput="selectedNode()" />
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
    ...mapState("quests", {
      questId: (state: QuestsState) => state.currentQuest,
    }),
    ...mapGetters("quests", ["getCurrentQuest"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "getConversation",
      "getConversationTree",
      "getFocusNode",
    ]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("members", ["fetchMemberById"]),
    ...mapActions("conversation", ["ensureConversation"]),
  },
})
export default class QuestViewPage extends Vue {
  selectedNodeId: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  currentQuestId!: QuestsState["currentQuest"];

  // declare the computed attributes for Typescript
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getMemberById: MembersGetterTypes["getMemberById"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getConversationTree: ConversationGetterTypes["getConversationTree"];
  getConversation: ConversationGetterTypes["getConversation"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureConversation: ConversationActionTypes["ensureConversation"];

  getQuestCreator() {
    return this.getCurrentQuest
      ? this.getMemberById(this.getCurrentQuest.creator)
      : null;
  }
  selectedNode(copy?: boolean) {
    let node = this.getConversationNodeById(this.selectedNodeId);
    if (copy) {
      node = { ...node };
    }
    return node;
  }
  selectionChanged(id) {
    this.selectedNodeId = id;
    const selectedNode = this.selectedNode();
    console.log("selectedNode: ", selectedNode);
    const parent = selectedNode
      ? this.getConversationNodeById(selectedNode.parent_id)
      : null;
    if (parent) {
      this.selectedIbisTypes = ibis_child_types(parent.node_type);
    } else {
      this.selectedIbisTypes = ibis_node_type_list;
    }
  }
  async created() {
    try {
      const questId = Number.parseInt(this.$route.params.quest_id);
      await userLoaded;
      await this.setCurrentQuest(questId);
      await this.ensureQuest({ quest_id: questId });
      await this.ensureConversation(questId);
      const quest = this.getCurrentQuest;
      console.log(this.getConversationTree);
      this.selectedNodeId = this.getConversation.length
        ? this.getConversation[0].id
        : null;
      await this.fetchMemberById({ params: { id: quest.creator } });
      const creator = this.getMemberById(quest.creator);
    } catch (error) {
      console.log("Error in questview create: ", error);
    }
  }
}
</script>
<style>
.sidenav {
  height: 100%;
  width: 15%;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  color: black;
  background-color: rgb(230, 234, 238);
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  border: 1px solid gray;
}
</style>
