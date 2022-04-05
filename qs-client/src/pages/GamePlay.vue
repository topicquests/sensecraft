<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="col-4 text-right q-pr-md" v-if="guildId">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: String(guildId) },
              }"
              >>>back to guild page</router-link
            >
        </div>
        <div class="row justify-center q-mt-lg">
          <div class="col-8">
            <questCard
              v-if="getCurrentQuest"
              :currentQuest="getCurrentQuest"
              :creator="getQuestCreator()"
            ></questCard>
          </div>
        </div>
        <div class="row justify-center q-mt-lg">
          <div class="col-6 q-md q-mr-lg">
            <node-tree
              v-bind:currentQuestId="questId"
              v-bind:currentGuildId="guildId"
              v-on:updateTree="selectionChanged"
              :channelId="null"
              :editable="true"
            />
          </div>
        </div>
      </q-card>
    </div>
    <div class="sidenav gt-sm"  v-if="guildId">
      <div class="q-pa-md q-gutter-sm">
        <channel-list/>
          <q-btn
            color="primary"
            label="Create Guild Channel"
            @click="
              $router.push({
                name: 'game_channel_list',
                params: {
                  guild_id: String(guildId),
                  quest_id: String(questId),
                },
              })
            "
          >
          </q-btn>
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
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
} from "../store/channel";
import { RoleState, RoleGetterTypes, RoleActionTypes } from "../store/role";
import {
  Casting,
  ConversationNode,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
import CastingRoleEdit from "../components/casting_role_edit.vue";
import ChannelList from "../components/ChannelListComponent.vue";

@Component<GamePlayPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeTree: nodeTree,
    CastingRoleEdit,
    ChannelList,
  },
  computed: {
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapGetters("member", [
      "castingPerQuest",
    ]),
    ...mapGetters("quests", [
      "getCurrentQuest",
    ]),
    ...mapGetters("guilds", ["getCurrentGuild"]),
    ...mapGetters("members", [
      "getMemberById",
    ]),
  },
  methods: {
    ...mapActions("quests", [
      "setCurrentQuest",
      "ensureQuest",
    ]),
    ...mapActions("guilds", ["setCurrentGuild"]),
    ...mapActions("channel", ["ensureChannels"]),
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
  ready = false;

  // declare the computed attributes for Typescript
  castingPerQuest!: MemberGetterTypes["castingPerQuest"];
  getMemberById!: MembersGetterTypes["getMemberById"];
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];

  // declare the action attributes for Typescript
  ensureChannels!: ChannelActionTypes["ensureChannels"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];

  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
  }

  selectionChanged(id) {
    this.selectedNodeId = id;
  }

  async guildIfPlaying() {
    const casting: Casting = this.castingPerQuest[this.questId];
    if (casting) {
      return casting.guild_id;
    }
  }

  async beforeMount() {
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await userLoaded;
    this.guildId = await this.guildIfPlaying();
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.setCurrentGuild(this.guildId),
      this.ensureQuest({ quest_id: this.questId }),
      this.ensureChannels(this.guildId),
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
