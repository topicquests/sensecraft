<template>
  <q-page class="bg-secondary page" v-if="ready">
    <div class="row justify-center q-mt-lg">
      <h3>
        Channels of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: this.guildId,
            },
          }">{{ this.getCurrentGuild.name }}</router-link>
        in quest
        <router-link
          :to="{
            name: 'quest_page',
            params: {
              guild_id: this.guildId,
            },
          }">{{ this.getCurrentQuest.name }}</router-link>
      </h3>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-6">
        <channel-list v-bind:guild_id="guildId" v-bind:quest_id="questId" :inPage="true" title="Game Channels" />
        </div>
      </div>
      <div class="column items-center q-mb-md">
      <div class="col-6">
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
      </div>
     </div>
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
import {
  GuildsGetterTypes,
} from "../store/guilds";
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
    ...mapGetters("guilds", ["getCurrentGuild"]),
    ...mapGetters("quests", ["isPlayingQuestInGuild", "getCurrentQuest"]),
    ...mapGetters(["hasPermission"]),
  },
  methods: {
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("channel", ["createChannelNode"]),
  },
  watch: {},
  meta: (c) => ({
    title: `Channels for quest - ${c.getCurrentQuest.name}`,
  }),
})
export default class GameChannelList extends Vue {
  //data
  guildId: number;
  questId: number;
  creatingGuildC: boolean = false;
  newGuildChannelName: string = "";
  creatingGameC: boolean = false;
  newGameChannelName: string = "";
  ready = false;

  // declare the computed attributes for Typescript
  getMemberById: MembersGetterTypes["getMemberById"];
  getCurrentGuild: GuildsGetterTypes["getCurrentGuild"];
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getChannels: ChannelGetterTypes["getChannels"];
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
    this.creatingGameC = false;
  }
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    this.setCurrentGuild(this.guildId),
    this.setCurrentQuest(this.questId),
    await userLoaded;
    await Promise.all([
      this.ensureGuild({ guild_id: this.guildId }),
      this.ensureQuest({ quest_id: this.questId }),
    ]);
    this.ready = true;
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
