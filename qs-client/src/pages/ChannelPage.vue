<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center q-mt-lg">
      <h3 v-if="questId">
        Channel of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: this.guildId,
            },
          }"
          >{{ this.getCurrentGuild.name }}</router-link
        >
        in quest
        <router-link
          :to="{
            name: 'quest_page',
            params: {
              guild_id: this.guildId,
            },
          }"
          >{{ this.getCurrentQuest.name }}</router-link
        >
        (<router-link
          :to="{
            name: 'game_channel_list',
            params: {
              guild_id: this.guildId,
              quest_id: this.questId,
            },
          }"
          >more</router-link
        >)
      </h3>
      <h3 v-else>
        Channel of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: this.guildId,
            },
          }"
          >{{ this.getCurrentGuild.name }}</router-link
        >
        (<router-link
          :to="{
            name: 'guild_channel_list',
            params: {
              guild_id: this.guildId,
            },
          }"
          >more</router-link
        >)
      </h3>
    </div>
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
import { mapGetters, mapActions } from "vuex";
// import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
//import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import nodeForm from "../components/node-form.vue";
import nodeTree from "../components/node-tree.vue";
import { userLoaded } from "../boot/userLoaded";
import {
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_list,
  public_private_bool,
} from "../enums";
import { RoleGetterTypes, RoleActionTypes } from "../store/role";
import { ChannelGetterTypes, ChannelActionTypes } from "../store/channel";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import { GuildsGetterTypes, GuildsActionTypes } from "../store/guilds";
import { ConversationNode } from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";

@Component<ChannelPage>({
  components: {
    member: member,
    nodeCard: nodeCard,
    nodeForm: nodeForm,
    nodeTree: nodeTree,
  },
  computed: {
    ...mapGetters("guilds", ["getCurrentGuild"]),
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
  },
  watch: {
    $route(to, from) {
      this.ready = false;
      this.initialize();
    },
  },
  meta: (c) => ({
    // todo: not reactive because not computed
    title: `${c.getCurrentQuest ? "Game" : "Guild"} Channel - ${
      c.getChannelById(c.channelId)?.title
    }`,
  }),
})
export default class ChannelPage extends Vue {
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
  ready = false;

  // declare the computed attributes for Typescript
  getCurrentGuild: GuildsGetterTypes["getCurrentGuild"];
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

  async initialize() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    this.channelId = Number.parseInt(this.$route.params.channel_id);
    await userLoaded;
    const promises = [];
    this.setCurrentGuild(this.guildId);
    this.setCurrentQuest(this.questId);
    if (this.questId) {
      promises.push(this.ensureQuest({ quest_id: this.questId }));
      promises.push(this.ensureChannels(this.guildId, this.questId));
    }
    promises.push(this.ensureChannels(this.guildId));
    promises.push(this.ensureGuild({ guild_id: this.guildId }));
    promises.push(this.ensureAllRoles());
    promises.push(
      this.ensureChannelConversation({
        channel_id: this.channelId,
        guild: this.guildId,
      })
    );
    await Promise.all(promises);
    this.ready = true;
  }
  async beforeMount() {
    await this.initialize();
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
