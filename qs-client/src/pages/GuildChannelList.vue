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
      </h3>
    </div>
    <div class="col-3 q-md q-mb-md">
      <channel-list v-bind:guild_id="guildId" :inPage="true" title="Guild Channels" />
      <q-btn
        v-if="canAddChannel() && !creating"
        @click="createGuildChannel()"
        label="Create Guild Channel"
      />
      <!-- todo: create_guild_channel permission -->
      <q-input
        v-if="creating"
        v-model="newChannelName"
        label="Channel name"
        id="channel_name"
      />
      <q-btn
        v-if="creating"
        @click="cancelCreateGuildChannel()"
        label="Cancel"
      />
      <q-btn
        v-if="creating"
        @click="confirmCreateGuildChannel()"
        label="Confirm"
      />
      <!-- todo: only active if non-empty name -->
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
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
} from "../store/channel";
import {
  //TODO don't need
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import {
  ibis_node_type_enum,
  meta_state_enum,
  permission_enum,
  publication_state_enum,
} from "../enums";
import { ConversationNode } from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
@Component<GuildChannelList>({
  components: {
    member: member,
    ChannelList: ChannelList,
  },
  computed: {
    ...mapGetters("guilds", ["getCurrentGuild"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters(["hasPermission"]),
  },
  methods: {
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("channel", ["createChannelNode"]),
  },
  watch: {},
})
export default class GuildChannelList extends Vue {
  //data
  guildId: number;
  channels: ConversationNode[];
  creating: boolean = false;
  newChannelName: string = "";
  ready = false;

  // declare the computed attributes for Typescript
  getMemberById: MembersGetterTypes["getMemberById"];
  getCurrentGuild: GuildsGetterTypes["getCurrentGuild"];
  getChannels: ChannelGetterTypes["getChannels"];
  getGameChannels: ChannelGetterTypes["getGameChannels"];
  getChannelById: ChannelGetterTypes["getChannelById"];
  getChannelConversation: ChannelGetterTypes["getChannelConversation"];
  getChannelConversationTree: ChannelGetterTypes["getChannelConversationTree"];
  getChannelNode: ChannelGetterTypes["getChannelNode"];
  // declare the action attributes for Typescript
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  createChannelNode: ChannelActionTypes["createChannelNode"];
  hasPermission: BaseGetterTypes["hasPermission"];
  canAddChannel() {
    return this.hasPermission(permission_enum.guildAdmin, this.guildId);
  }
  createGuildChannel() {
    this.creating = true;
  }
  cancelCreateGuildChannel() {
    this.creating = false;
  }
  async confirmCreateGuildChannel() {
    try{ 
      let channel: Partial<ConversationNode> = {
        title: this.newChannelName,
        node_type: ibis_node_type_enum.channel,
        meta: meta_state_enum.channel,
        status: publication_state_enum.guild_draft,
        guild_id: this.guildId,
      };
      await this.createChannelNode({ data: channel });
      this.$q.notify({
        message: `Added new conversation node`,
        color: "positive",
      });
    }
    catch (err) {
      console.log("there was an error in creating conversation node ", err);
      this.$q.notify({
        message: `There was an error creating new conversation node.`,
        color: "negative",
      });
    }
    this.creating = false;
  }
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    this.setCurrentGuild(this.guildId),
    await this.ensureGuild({ guild_id: this.guildId });
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
