<template>
  <q-page class="page">
    <div class="sidenav gt-sm">
      <div class="q-pa-md q-gutter-sm">
        <node-tree
          v-bind:nodes="channelTree"
          v-on:updateTree="selectionChanged"
        >
        </node-tree>
      </div>
    </div>
    <div class="col-3 q-md q-mb-md">
      <div v-if="selectedNodeId">
        <!-- cloned from GamePlay-->
        <node-form
          v-if="canEdit(channelId, selectedNodeId)"
          v-bind:nodeInput="selectedNode(true)"
          v-bind:allowAddChild="true"
          :editing="true"
          v-bind:ibisTypes="selectedIbisTypes"
          v-on:action="updateNode"
          v-on:addChild="addChild"
        />
        <node-form v-else v-bind:nodeInput="selectedNode()" />
        <q-btn
          v-if="!canEdit(channelId, selectedNodeId)"
          @click="addChild()"
          label="Add Child"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from "vuex";
// import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
//import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import nodeForm from "../components/node-form.vue";
import nodeTree from "../components/node-tree.vue";
import { userLoaded } from "../boot/userLoaded";
import {
  ibis_node_type_enum,
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_list,
  public_private_bool,
} from "../enums";
import app from "../App.vue";
import {
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
} from "../store/channel";
import { ConversationMap, ibis_child_types } from "../store/conversation";
import {
  QuestsState,
  QuestsActionTypes,
  QuestsGetterTypes,
} from "../store/quests";
import {
  //TODO don't need
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import {
  //TODO don't need
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
    member: member,
    nodeCard: nodeCard,
    nodeForm: nodeForm,
    nodeTree: nodeTree,
  },
  computed: {
    ...mapGetters("quests", ["getCurrentQuest", "getCurrentGamePlay"]),
    ...mapGetters("channels", ["getGuildChannels", "getChannelConversation"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("channel", [
      "getChannels",
      "getGuildChannels",
      "getGameChannels",
      "getChannelById",
      "getChannelConversation",
      "getChannelConversationTree",
      "getChannelNode",
      "canEdit",
    ]),
    channelTree: function () {
      return this.getChannelConversationTree(this.channelId);
    },
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("channel", [
      "ensureChannelConversation",
      "ensureChannels",
      "createChannelNode",
      "updateChannelNode",
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
  questId?: number;
  channelId: number;
  newNode: Partial<ConversationNode> = {};
  selectedNodeId: number = null;
  newNodeParent: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  channelTree: any;

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getMemberById: MembersGetterTypes["getMemberById"];
  getChannels: ChannelGetterTypes["getChannels"];
  getGuildChannels: ChannelGetterTypes["getGuildChannels"];
  getGameChannels: ChannelGetterTypes["getGameChannels"];
  getChannelById: ChannelGetterTypes["getChannelById"];
  getChannelConversation: ChannelGetterTypes["getChannelConversation"];
  getChannelConversationTree: ChannelGetterTypes["getChannelConversationTree"];
  getChannelNode: ChannelGetterTypes["getChannelNode"];
  canEdit: ChannelGetterTypes["canEdit"];
  // declare the action attributes for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureMemberById: MembersActionTypes["ensureMemberById"];
  ensureChannels: ChannelActionTypes["ensureChannels"];
  ensureChannelConversation: ChannelActionTypes["ensureChannelConversation"];
  createChannelNode: ChannelActionTypes["createChannelNode"];
  updateChannelNode: ChannelActionTypes["updateChannelNode"];
  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
  }
  selectedNode(copy?: boolean) {
    let node = this.getChannelNode(this.channelId, this.selectedNodeId);
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
      ? this.getChannelNode(this.channelId, selectedNode.parent_id)
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

      await this.createChannelNode({ data: node });
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
      await this.updateChannelNode({ data: node });
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
    this.channelId = Number.parseInt(this.$route.params.channel_id);
    await userLoaded;
    const promises = [];
    if (this.questId) {
      await Promise.all([
        this.setCurrentQuest(this.questId),
        this.setCurrentGuild(this.guildId),
      ]);
      promises.push(this.ensureQuest({ quest_id: this.questId }));
    } else {
      await this.setCurrentGuild(this.guildId);
    }
    promises.push(this.ensureGuild({ guild_id: this.guildId }));
    promises.push(
      this.ensureChannelConversation({
        channel_id: this.channelId,
        guild: this.guildId,
      })
    );
    await Promise.all(promises);
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
