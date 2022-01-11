<template>
  <q-page class="page">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="row justify-center q-mt-lg">
      <div class="col-4 q-md q-mr-lg">
        <questCard
          v-if="getCurrentQuest"
          :currentQuestCard="getCurrentQuest"
          :creator="getQuestCreator()"
        ></questCard>
      </div>
    </div>
    <div class="row justify-center q-mt-lg">
      <div class="col-6 q-md q-mr-lg">
        <node-tree
          v-bind:nodes="getNeighbourhoodTree"
          v-on:updateTree="selectionChanged"
          :channelId="null"
          :editable="true"
          :roles="getRoles"
        />
      </div>
    </div>
    <div class="col-3 column items-center q-mb-md">
      <div v-if="selectedNodeId">
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
        <node-form
          class="q-mt-md"
          v-if="newNodeParent == selectedNodeId"
          :editing="true"
          :nodeInput="newNode"
          :allowAddChild="false"
          :ibisTypes="childIbisTypes"
          v-on:action="addNode"
        />
      </div>
    </div>
    <div class="column items-center">
      <div class="col-3">
        <div class="q-pa-md q-gutter-sm lt-md">
          <node-tree
            v-bind:nodes="getNeighbourhoodTree"
            v-on:updateTree="selectionChanged"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeTree from "../components/node-tree.vue";
import {
  ibis_node_type_enum,
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_list,
  public_private_bool,
} from "../enums";
import { userLoaded } from "../boot/userLoaded";
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
import { RoleState, RoleGetterTypes, RoleActionTypes } from "../store/role";
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
  Role,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
import CastingRoleEdit from "../components/casting_role_edit.vue";

@Component<GamePlayPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeTree: nodeTree,
    CastingRoleEdit,
  },
  computed: {
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapState("role", {
      allRoles: (state: RoleState) => state.role,
    }),
    ...mapGetters("quests", [
      "getCurrentQuest",
      "getCurrentGamePlay",
      "getCastingRolesById",
    ]),
    ...mapGetters("members", [
      "getMemberById",
      "getAvailableRolesMembersById",
      "castingRolesPerQuest",
    ]),
    ...mapGetters("conversation", [
      "getFocusNode",
      "getConversationNodeById",
      "getNeighbourhoodTree",
      "getNeighbourhood",
      "getRootNode",
      "getNode",
    ]),
    ...mapGetters("role", ["getRoles"]),
  },
  methods: {
    ...mapActions("quests", [
      "setCurrentQuest",
      "ensureQuest",
      "addCastingRole",
      "deleteCastingRole",
    ]),
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("conversation", [
      "ensureConversationNeighbourhood",
      "ensureRootNode",
    ]),
    ...mapActions("role", ["ensureAllRoles"]),
  },
  watch: {},
})
export default class GamePlayPage extends Vue {
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

  allRoles!: RoleState["role"];

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getCastingRolesById!: QuestsGetterTypes["getCastingRolesById"];
  getMemberById: MembersGetterTypes["getMemberById"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getNeighbourhood: ConversationGetterTypes["getNeighbourhood"];
  getNode: ConversationGetterTypes["getNode"];
  getNeighbourhoodTree: ConversationGetterTypes["getNeighbourhoodTree"];
  getAvailableRolesMembersById!: MembersGetterTypes["getAvailableRolesMembersById"];
  getRootNode: ConversationGetterTypes["getRootNode"];
  castingRolesPerQuest!: MembersGetterTypes["castingRolesPerQuest"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  // declare the action attributes for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  addCastingRole!: QuestsActionTypes["addCastingRole"];
  deleteCastingRole!: QuestsActionTypes["deleteCastingRole"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureConversationNeighbourhood!: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureMemberById: MembersActionTypes["ensureMemberById"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];
  getRoles: RoleGetterTypes["getRoles"];

  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
  }

  selectionChanged(id) {
    this.selectedNodeId = id;
  }

  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await userLoaded;
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.setCurrentGuild(this.guildId),
    ]);
    await Promise.all([
      this.ensureQuest({ quest_id: this.questId }),
      this.ensureGuild({ guild_id: this.guildId }),
      this.ensureAllRoles(),
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
