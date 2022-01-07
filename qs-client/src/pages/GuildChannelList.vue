<template>
  <q-page class="page">
    <div class="col-3 q-md q-mb-md">
      <channel-list v-bind:channels="getGuildChannels" title="Guild Channels" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from "vuex";
// import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import ChannelList from "../components/ChannelListComponent.vue";
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
  // createChannelNode,
} from "../store/channel";
import { ConversationMap, ibis_child_types } from "../store/conversation";
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
import { registration_status_enum, permission_enum } from "../enums";
import { Guild, GamePlay, Casting, ConversationNode, Member } from "../types";
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
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("channel", ["getGuildChannels"]),
  },
  methods: {
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMemberById"]),
    ...mapActions("channel", ["ensureChannels"]),
  },
  watch: {},
})
export default class GuildChannelList extends Vue {
  //data
  guildId: number;
  channels: ConversationNode[];

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
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureChannels: ChannelActionTypes["ensureChannels"];
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    await this.setCurrentGuild(this.guildId),
      await this.ensureGuild({ guild_id: this.guildId });
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
