<template>
  <q-page class="page">
    <div class="col-3 q-md q-mb-md">
      <div v-if="selectedNodeId">
        <!-- cloned from GamePlay-->
        <node-form
          v-if="canEdit(selectedNodeId)"
          v-bind:nodeInput="selectedNode(true)"
          v-bind:allowAddChild="true"
          :editing="true"
          v-bind:ibisTypes="selectedIbisTypes"
          v-on:action="updateNode"
          v-on:addChild="addChild"
        />
        <node-form v-else v-bind:nodeInput="selectedNode()" />
        <q-btn
          v-if="!canEdit(selectedNodeId)"
          @click="addChild()"
          label="Add Child"
        />
      </div>
    </div>
  </q-page>
</template>
<script>
import { mapGetters, mapActions, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import nodeForm from "../components/node-form.vue";
import nodeTree from "../components/node-tree.vue";
import {
  ibis_node_type_enum,
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_list,
  public_private_bool,
} from "../enums";
import app from "../App.vue";
import {
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
  ibis_child_types,
} from "../store/conversation";
import {
  QuestsState,
  QuestsActionTypes,
  QuestsGetterTypes,
} from "../store/quests";
import {
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import {
  MemberState,
  MemberGetterTypes,
  MemberActionTypes,
} from "../store/member";
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
} from "../enums";
import {
  Quest,
  Guild,
  GamePlay,
  Casting,
  ConversationNode,
  Member,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
@Component<RolePlayPage>({
  components: {
//    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeCard: nodeCard,
    nodeForm: nodeForm,
    nodeTree: nodeTree,
  },
  computed: {
//    ...mapGetters("quests", ["getCurrentQuest", "getCurrentGamePlay"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("conversation", [
      "getFocusNode",
      "getConversationNodeById",
      "getNeighbourhoodTree",
      "getNeighbourhood",
      "canEdit",
      "getRootNode",
      "getNode",
    ]),
  },
  methods: {
//    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
//    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("conversation", [
      "ensureConversationNeighbourhood",
      "createConversationNode",
      "updateConversationNode",
      "ensureRootNode",
    ]),
  },
  watch: {},
})
export default class RolePlayPage extends Vue {
  //data
  ibis_node_type_list = ibis_node_type_list;
  publication_state_list = publication_state_list;
  public_private_bool = public_private_bool;
  guildId: number;
  questId: number;
  newNode: Partial<ConversationNode> = {};
  selectedNodeId: number = null;
  newNodeParent: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getMemberById: MembersGetterTypes["getMemberById"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getNeighbourhood: ConversationGetterTypes["getNeighbourhood"];
  canEdit: ConversationGetterTypes["canEdit"];
  getNode: ConversationGetterTypes["getNode"];
  getNeighbourhoodTree: ConversationGetterTypes["getNeighbourhoodTree"];
  getRootNode: ConversationGetterTypes["getRootNode"];
  // declare the action attributes for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureConversationNeighbourhood!: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureMemberById: MembersActionTypes["ensureMemberById"];
  createConversationNode: ConversationActionTypes["createConversationNode"];
  updateConversationNode: ConversationActionTypes["updateConversationNode"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];

  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
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
  addChild() {
    this.newNodeParent = this.selectedNodeId;
    const parent_ibis_type = this.selectedNode().node_type;
    this.childIbisTypes = ibis_child_types(parent_ibis_type);
    this.newNode = Object.assign(
      {
        status: "private_draft",
      },
      this.newNode,
      {
        node_type: this.childIbisTypes[0],
        parent_id: this.selectedNodeId,
      }
    );
  }
  async addNode(node) {
    try {
      node.quest_id = this.questId;
      node.guild_id = this.guildId;
      node.parent_id = this.selectedNodeId;

      await this.createConversationNode({ data: node });
      this.newNodeParent = null;
      this.$q.notify({
        message: `Added node to conversation`,
        color: "positive",
      });
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
      await this.updateConversationNode({ data: node });
      this.$q.notify({
        message: `node updated`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding node.`,
        color: "negative",
      });
    }
  }
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await app.userLoaded;
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.setCurrentGuild(this.guildId),
    ]);
    await Promise.all([
      this.ensureQuest({ quest_id: this.questId }),
      this.ensureGuild({ guild_id: this.guildId }),
    ]);
    let node_id = this.getCurrentGamePlay?.focus_node_id;
    if (!node_id) {
      await this.ensureRootNode(this.questId);
      node_id = this.getRootNode?.id;
    }
    if (node_id) {
      await this.ensureConversationNeighbourhood({
        node_id,
        guild: this.guildId,
      });
      this.selectedNodeId = this.getFocusNode.id;
    }
    const quest = this.getCurrentQuest;
    await this.ensureMemberById({ id: quest.creator });
    // const creator = this.getMemberById(quest.creator);
  }
}
</script>

<style scoped>
.page {
  background-color: whitesmoke;
}

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
