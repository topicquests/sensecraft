<template>
  <q-page class="bg-secondary">
    <div class="row justify-center q-mt-lg">
      <div class="col-6 q-md q-mr-lg">
        <node-tree
          v-on:updateTree="selectionChanged"
          :currentGuildId="guildId"
          :currentQuestId="questId"
          :channelId="channelId"
          :roles="getRoles"
          :editable="true"
        >
        </node-tree>
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
import { RoleState, RoleGetterTypes, RoleActionTypes } from "../store/role";
import {
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
  channel,
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
  Role,
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
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("channel", [
      "getChannels",
      "getChannelById",
      "getChannelConversation",
      "getChannelNode",
      "canEdit",
    ]),
    ...mapGetters("role", ["getRoles"]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("channel", ["ensureChannelConversation", "ensureChannels"]),
    ...mapActions("role", ["ensureAllRoles"]),
    async getChannel(channelId) {
      this.ensureChannelConversation({
        channel_id: channelId,
        guild: this.guildId,
      });
    },
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
  getChannelById: ChannelGetterTypes["getChannelById"];
  getChannelConversation: ChannelGetterTypes["getChannelConversation"];
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
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];
  getRoles: RoleGetterTypes["getRoles"];

  selectionChanged(id) {
    this.selectedNodeId = id;
  }

  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    this.channelId = Number.parseInt(this.$route.params.channel_id);
    await userLoaded;
    const promises = [];
    this.setCurrentGuild(this.guildId);
    this.setCurrentQuest(this.questId);
    if (this.questId) {
      promises.push(this.ensureQuest({ quest_id: this.questId }));
    }
    promises.push(this.ensureGuild({ guild_id: this.guildId }));
    promises.push(this.ensureAllRoles());
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
