<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="quest-edit-card q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="row justify-end" style="width: 89%">
          <div class="col-4 text-right q-pr-md">
            <router-link
              class="quest-link"
              :to="{
                name: 'quest_page',
                params: { questId: quest_id },
              }"
              >>>go to quest page</router-link
            >
          </div>
        </div>
        <div class="row justify-center">
          <div class="column items-center">
            <div class="col-12">
              <h4 class="q-pb-sm q-ma-sm">Edit Quest</h4>
            </div>
          </div>
        </div>
        <div class="row justify-center">
          <div
            class="column items-center"
            style="width: 75%"
            v-if="getCurrentQuest"
          >
            <quest-card
              v-bind:thisQuest="{ ...getCurrentQuest }"
              :edit="true"
              v-on:doUpdateQuest="doSubmitQuest"
              style="width: 100%"
            ></quest-card>
          </div>
        </div>

        <div>
          <div class="row justify-center">
            <div class="column items-center">
              <div class="col-12 q-mb-xs q-mt-md q-pa-sm" style="width: 100%">
                <h4 v-if="!node.id">New Conversation Node</h4>
                <h4 v-if="node.id">Update Conversation Node</h4>
              </div>
            </div>
          </div>
          <div class="row justify-center">
            <div
              class="column items-center"
              style="width: 100%"
              v-if="getCurrentQuest"
            >
              <node-form
                :nodeInput="node"
                :editing="true"
                :ibisTypes="base_ibis_types"
                v-on:action="editNode"
                style="width: 75%"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import nodeForm from "../components/node-form.vue";
import questCard from "../components/quest-edit-card.vue";
import Component from "vue-class-component";
import { userLoaded } from "../boot/userLoaded";
import Vue from "vue";

import {
  quest_status_list,
  public_private_bool,
  ibis_node_type_enum,
} from "../enums";
import { Quest, ConversationNode } from "../types";
import { MemberState, MemberActionTypes } from "../store/member";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import { BaseGetterTypes } from "../store/baseStore";

@Component<QuestEditPage>({
  meta: (c) => ({
    title: `Quest edit - ${c.getCurrentQuest?.name}`,
  }),
  components: {
    scoreboard: scoreboard,
    member: member,
    nodeForm: nodeForm,
    questCard: questCard,
  },
  computed: {
    ...mapState("member", ["member"]),
    ...mapGetters("quests", ["isQuestMember", "getCurrentQuest"]),
    ...mapGetters("conversation", ["getRootNode", "getConversation"]),
    ...mapGetters(["hasPermission"]),
    node: function (): Partial<ConversationNode> {
      return this.getRootNode || this.defaultNode;
    },
    quest: function (): Quest {
      return this.getCurrentQuest;
    },
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "updateQuest", "ensureQuest"]),
    ...mapActions("conversation", [
      "ensureConversation",
      "createConversationNode",
      "updateConversationNode",
      "fetchConversationNeighbourhood",
      "fetchRootNode",
    ]),
  },
})
export default class QuestEditPage extends Vue {
  ready = false;
  public_private_bool = public_private_bool;
  quest_status_list = quest_status_list;
  publication_state_list;
  isAdmin: true;
  quest_id: number;

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  member: MemberState["member"];
  isQuestMember: QuestsGetterTypes["isQuestMember"];
  getRootNode: ConversationGetterTypes["getRootNode"];
  getConversation: ConversationGetterTypes["getConversation"];
  hasPermission: BaseGetterTypes["hasPermission"];
  updateQuest!: QuestsActionTypes["updateQuest"];
  ensureQuest!: QuestsActionTypes["ensureQuest"];
  ensureConversation!: ConversationActionTypes["ensureConversation"];
  ensureLoginUser!: MemberActionTypes["ensureLoginUser"];
  createConversationNode!: ConversationActionTypes["createConversationNode"];
  updateConversationNode!: ConversationActionTypes["updateConversationNode"];
  fetchConversationNeighbourhood!: ConversationActionTypes["fetchConversationNeighbourhood"];
  fetchRootNode!: ConversationActionTypes["fetchRootNode"];
  setCurrentQuest!: QuestsActionTypes["setCurrentQuest"];
  node!: Partial<ConversationNode>;
  quest!: Quest;

  defaultNode = {
    quest_id: undefined,
    title: "",
    description: "",
    status: "private_draft",
    node_type: "question",
  };
  base_ibis_types = [ibis_node_type_enum.question];

  async editNode(node) {
    if (this.node.id) {
      await this.updateNode(node);
    } else {
      await this.addNode(node);
    }
  }
  async addNode(node) {
    try {
      const data = { ...this.node, ...node };
      data.quest_id = this.quest_id;
      await this.createConversationNode({ data });
      this.$q.notify({
        message: `Added node to conversation`,
        color: "positive",
      });
      await this.fetchRootNode({ params: { quest_id: this.quest_id } });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding new node.`,
        color: "negative",
      });
    }
  }

  async updateNode(node) {
    try {
      const data = { ...this.node, ...node };
      await this.updateConversationNode({ data });
      this.$q.notify({
        message: `Root node updated`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding root node.`,
        color: "negative",
      });
    }
  }
  validateStartEnd(quest) {
    if (quest.start < quest.end) {
      return true;
    }
    return false;
  }

  async doSubmitQuest(quest) {
    try {
      if (!this.validateStartEnd(quest)) {
        throw "End date is before start date";
      }
      await this.updateQuest({
        data: quest,
      });
      this.$q.notify({
        message: "Quest was updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating quest ", err);
      this.$q.notify({
        message: `There was an error updating quest. If this issue persists, contact support.`,
        color: "negative",
      });
    }
  }

  async beforeMount() {
    this.quest_id = Number.parseInt(this.$route.params.quest_id);
    await userLoaded;
    await this.setCurrentQuest(this.quest_id);
    await this.ensureQuest({ quest_id: this.quest_id });
    await this.ensureConversation(this.quest_id);
    if (this.getConversation.length > 0) {
      await this.fetchRootNode({ params: { quest_id: this.quest_id } });
    }
    this.ready = true;
  }
}
</script>

<style>
.quest-edit-card {
  width: 60%;
}

.name-field {
  transition: width 0.36s;
  width: 1500px;
}
.details {
  max-width: 1500px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}

h4 {
  text-align: center;
}
.q-editor {
  width: 80%;
  border: 1px solid black;
}
.quest-link {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
}
@media only screen and (max-width: 1300px) {
  .quest-edit-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-edit-card {
    width: 98%;
  }
}
</style>
