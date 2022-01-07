<template>
  <q-page class="page">
    <div class="col-3 q-md q-mb-md">
      <channel-list
        v-if="getGameChannels.length"
        v-bind:channels="getGameChannels"
        title="Game Channels"
      />
    </div>

    <q-btn
      v-if="canAddGameChannel() && !creatingGameC"
      @click="createGameChannel()"
      label="Create Game Channel"
    />
    <!-- todo: create_guild_channel permission -->
    <q-input
      v-if="creatingGameC"
      v-model="newGameChannelName"
      label="Game channel name"
      id="channel_name"
    />
    <q-btn
      v-if="creatingGameC"
      @click="cancelCreateGameChannel()"
      label="Cancel"
    />
    <q-btn
      v-if="creatingGameC"
      @click="confirmCreateGameChannel()"
      label="Confirm"
    />
    <!-- todo: only active if non-empty name -->

    <div class="col-3 q-md q-mb-md">
      <channel-list
        v-if="getGuildChannels.length"
        v-bind:channels="getGuildChannels"
        title="Guild Channels"
      />
    </div>
    <q-btn
      v-if="canAddGuildChannel() && !creatingGuildC"
      @click="createGuildChannel()"
      label="Create Guild Channel"
    />
    <q-input
      v-if="creatingGuildC"
      v-model="newGuildChannelName"
      label="Guild channel name"
      id="channel_name"
    />
    <q-btn
      v-if="creatingGuildC"
      @click="cancelCreateGuildChannel()"
      label="Cancel"
    />
    <q-btn
      v-if="creatingGuildC"
      @click="confirmCreateGuildChannel()"
      label="Confirm"
    />
    <!-- todo: only active if non-empty name -->
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from "vuex";
// import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import ChannelList from "../components/ChannelListComponent.vue";
import { userLoaded } from "../boot/userLoaded";
import {
  ibis_node_type_enum,
  meta_state_enum,
  permission_enum,
  publication_state_enum,
} from "../enums";
import {
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
  // createChannelNode,
} from "../store/channel";
import { GuildsActionTypes } from "../store/guilds";
import {
  //TODO don't need
  QuestsActionTypes,
  QuestsGetterTypes,
} from "../store/quests";
import { ConversationNode } from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
@Component<GameChannelList>({
  components: {
    member: member,
    ChannelList: ChannelList,
  },
  computed: {
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("channel", ["getGuildChannels", "getGameChannels"]),
    ...mapGetters("quests", ["isPlayingQuestInGuild"]),
  },
  methods: {
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("channel", ["ensureChannels", "createChannelNode"]),
    ...mapGetters(["hasPermission"]),
  },
  watch: {},
})
export default class GameChannelList extends Vue {
  //data
  guildId: number;
  questId: number;
  channels: ConversationNode[];
  creatingGuildC: boolean = false;
  newGuildChannelName: string = "";
  creatingGameC: boolean = false;
  newGameChannelName: string = "";

  // declare the computed attributes for Typescript
  getMemberById: MembersGetterTypes["getMemberById"];
  getChannels: ChannelGetterTypes["getChannels"];
  getGuildChannels: ChannelGetterTypes["getGuildChannels"];
  getGameChannels: ChannelGetterTypes["getGameChannels"];
  getChannelById: ChannelGetterTypes["getChannelById"];
  getChannelConversation: ChannelGetterTypes["getChannelConversation"];
  getChannelConversationTree: ChannelGetterTypes["getChannelConversationTree"];
  getChannelNode: ChannelGetterTypes["getChannelNode"];
  // declare the action attributes for Typescript
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  isPlayingQuestInGuild: QuestsGetterTypes["isPlayingQuestInGuild"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureChannels: ChannelActionTypes["ensureChannels"];
  createChannelNode: ChannelActionTypes["createChannelNode"];
  hasPermission: BaseGetterTypes["hasPermission"];

  canAddGuildChannel() {
    // todo: create_guild_channel permission
    return this.hasPermission(permission_enum.guildAdmin, this.guildId);
  }
  createGuildChannel() {
    this.creatingGuildC = true;
  }
  cancelCreateGuildChannel() {
    this.creatingGuildC = false;
  }
  confirmCreateGuildChannel() {
    let channel: Partial<ConversationNode> = {
      title: this.newGuildChannelName,
      node_type: ibis_node_type_enum.channel,
      meta: meta_state_enum.channel,
      status: publication_state_enum.guild_draft,
      guild_id: this.guildId,
    };
    this.createChannelNode({ data: channel });
  }

  canAddGameChannel() {
    // todo: create_guild_channel permission
    // maybe allow the admin to create a channel if admin not playing but guild registered
    return (
      this.isPlayingQuestInGuild(this.questId, this.guildId) &&
      this.hasPermission(
        permission_enum.publishGameMove,
        this.guildId,
        this.questId
      )
    );
  }
  createGameChannel() {
    this.creatingGameC = true;
  }
  cancelCreateGameChannel() {
    this.creatingGameC = false;
  }
  confirmCreateGameChannel() {
    let channel: Partial<ConversationNode> = {
      title: this.newGameChannelName,
      node_type: ibis_node_type_enum.channel,
      meta: meta_state_enum.channel,
      status: publication_state_enum.guild_draft,
      guild_id: this.guildId,
      quest_id: this.questId,
    };
    this.createChannelNode({ data: channel });
  }
  async beforeCreate() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await userLoaded;
    await this.setCurrentGuild(this.guildId),
      await this.setCurrentQuest(this.questId),
      await this.ensureGuild({ guild_id: this.guildId });
    await this.ensureQuest({ quest_id: this.questId });
    await this.ensureChannels(this.guildId);
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
