<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="row justify-center q-mt-lg">
          <h3 class="q-mt-md">
            {{ getCurrentQuest.name }}
          <q-btn v-if="getCurrentQuest.description" class="q-ml-xs q-mt-md" size="md" :flat="true" icon="info" >
          <q-tooltip self="bottom middle" max-width="25rem">
            <div v-html="getCurrentQuest.description"></div>
          </q-tooltip>
          </q-btn>
          </h3>
          <router-link :to="{name: 'quest_teams', params:{ quest_id: getCurrentQuest.id }}" class="q-ml-sm q-mt-md"
          >Teams</router-link>
        </div>
        <div class="row justify-center q-mt-lg">
          <span v-if="!memberId">
            <router-link :to="{name: 'signin'}">Login to play</router-link>
          </span>
          <span v-else-if="isQuestMember(questId)">
            You can <router-link :to="{name: 'quest_edit', params:{ quest_id: questId }}">administer</router-link> this quest.
          </span>
          <span v-else-if="guildId">
            You're playing in guild 
            <router-link 
              :to="{name: 'guild', params:{ guild_id: guildId }}"
              >{{ getCurrentGuild.name }}</router-link>
          </span>
          <span v-else-if="getCurrentQuest.status != 'registration'">
            The game has started
          </span>
          <span v-else-if="myPlayingGuilds.length == 1">
            Your guild <router-link :to="{name: 'guild', params:{
              guild_id: myPlayingGuilds[0].id,
            }}">{{ myPlayingGuilds[0].name }}</router-link> is playing!
            <q-btn
              label="Join the game"
              @click="registerMemberDialog = true"
              style="margin-right: 1em"
              class="bg-primary q-ml-md"
            />
          </span>
          <span v-else-if="myPlayingGuilds.length > 1">
            You are part of many guilds which are playing this quest. Pick one:
            <ul>
              <li v-for="guild in myPlayingGuilds" :key="guild.id">
                <router-link :to="{name: 'guild', params:{ guild_id: guild.id }}">{{ guild.name }}</router-link>
              </li>
            </ul>
          </span>
          <span v-else-if="myGuilds(true).length == 1">
            You are a leader in {{myGuilds(true)[0].name}}.
            Maybe you want to <router-link :to="{name: 'guild', params:{
              guild_id: myGuilds(true)[0].id,
            }}">join</router-link> this quest?
          </span>
          <span v-else-if="myGuilds(true).length > 1">
            You are a leader in many guilds:
            <ul>
              <li v-for="guild in myGuilds(true)" :key="guild.id">
                <router-link :to="{name: 'guild', params:{ guild_id: guild.id }}">{{ guild.name }}</router-link>
              </li>
            </ul>
            Maybe you want one of them to join this quest?
          </span>
          <span v-else-if="myGuilds().length == 1">
            You are a member in {{myGuilds()[0].name}}. You could tell the guild leader to join this quest!
          </span>
          <span v-else-if="myGuilds().length > 1">
            You are a member in many guilds: 
            <ul>
              <li v-for="guild in myGuilds()" :key="guild.id">
                <router-link :to="{name: 'guild', params:{ guild_id: guild.id }}">{{ guild.name }}</router-link>
              </li>
            </ul>
            You could tell the guild leader in one of them to join this quest!
          </span>
          <span v-else-if="guildsPlayingGame(false, true).length > 1">
            Here are guilds playing the game which are you could join:
            <ul>
              <li v-for="guild in guildsPlayingGame(false, true)" :key="guild.id">
                <router-link :to="{name: 'guild', params:{ guild_id: guild.id }}">{{ guild.name }}</router-link>
              </li>
            </ul>
          </span>
          <span v-else>
            Maybe try to join <router-link :to="{name: 'guild_list'}">a guild</router-link> which could be interested in this quest?
          </span>
        </div>
        <div class="row justify-center q-mt-lg">
          <div class="col-6 q-md q-mr-lg">
            <node-tree
              v-bind:currentQuestId="questId"
              v-bind:currentGuildId="guildId"
              v-bind:initialSelectedNodeId="selectedNodeId"
              @tree-selection="selectionChanged"
              :channelId="null"
              :editable="true"
            />
          </div>
        </div>
        <q-dialog v-model="registerMemberDialog" persistent>
          <member-game-registration
            v-bind:guildId="mySelectedPlayingGuildId"
            v-bind:questId="questId"
          />
        </q-dialog>
      </q-card>
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
  permission_enum,
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
import { RoleState, RoleGetterTypes, RoleActionTypes } from "../store/role";
import {
  Casting,
  ConversationNode,
  Member,
  Guild,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
import CastingRoleEdit from "../components/casting_role_edit.vue";
import memberGameRegistration from "../components/member_game_registration.vue";

@Component<QuestPlayPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeTree: nodeTree,
    CastingRoleEdit,
    memberGameRegistration,
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
      "getCurrentQuest", "isQuestMember"
    ]),
    ...mapGetters("guilds", [
      "getCurrentGuild",
      "getGuildById",
    ]),
    ...mapGetters("members", [
      "getMemberById",
    ]),
    ...mapGetters(["hasPermission"]),
    guildId() {
      const casting: Casting = this.castingPerQuest[this.questId];
      if (casting) {
        return casting.guild_id
      }
    }
  },
  methods: {
    ...mapActions("quests", [
      "setCurrentQuest",
      "ensureQuest",
    ]),
    ...mapActions("guilds", [
      "setCurrentGuild",
      "ensureGuild",
      "ensureGuildsPlayingQuest",
    ]),
  },
  watch: {
    $route(to, from) {
      if (from.params.quest_id != to.params.quest_id) {
        this.ready = false;
        this.initialize()
      }
    },
    guildId: "initializeGuild"
  },
  meta: (c) => ({
    title: `Quest - ${c.getCurrentQuest?.name}`,
  }),
})
export default class QuestPlayPage extends Vue {
  //data
  ibis_node_type_list = ibis_node_type_list;
  publication_state_list = publication_state_list;
  public_private_bool = public_private_bool;
  guildId!: number;
  questId: number;
  myPlayingGuilds: Guild[];
  mySelectedPlayingGuildId: number = null;
  newNode: Partial<ConversationNode> = {};
  selectedNodeId: number = null;
  newNodeParent: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  allRoles!: RoleState["role"];
  ready = false;
  registerMemberDialog = false;

  // declare state
  member!: Member;
  memberId!: number;
  // declare the computed attributes for Typescript
  hasPermission!: BaseGetterTypes["hasPermission"];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  getGuildById!: GuildsGetterTypes["getGuildById"];
  castingPerQuest!: MemberGetterTypes["castingPerQuest"];
  getMemberById!: MembersGetterTypes["getMemberById"];
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  isQuestMember!: QuestsGetterTypes["isQuestMember"];

  // declare the action attributes for Typescript
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  ensureGuildsPlayingQuest: GuildsActionTypes["ensureGuildsPlayingQuest"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];

  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
  }

  selectionChanged(id) {
    this.$router.push({
      name: id ? "quest_page_node" : "quest_page",
      params: {
        quest_id: String(this.questId),
        node_id: id ? String(id) : undefined
      },
    });
  }

  guildsPlayingGame(only_mine: boolean= false, recruiting: boolean=false) {
    let guild_ids = this.getCurrentQuest.game_play?.map((gp) => gp.guild_id) || [];
    if (only_mine) {
      guild_ids = guild_ids.filter((g) => (
        this.member.guild_membership || []).some((gm) => gm.guild_id === g && gm.status == 'confirmed'));
    }
    let guilds = guild_ids.map((gid) => this.getGuildById(gid));
    if (recruiting) {
      guilds = guilds.filter((g) => g.open_for_applications);
    }
    return guilds;
  }

  myGuilds(only_as_leader: boolean = false) {
    let memberships = this.member.guild_membership || [];
    memberships = memberships.filter((gm) => gm.status == 'confirmed');
    let guild_ids = memberships.map((gm) => gm.guild_id);
    if (only_as_leader) {
      guild_ids = guild_ids.filter((gid) => this.hasPermission(permission_enum.joinQuest, gid));
    }
    return guild_ids.map((gid) => this.getGuildById(gid));
  }

  async initialize() {
    this.questId = Number.parseInt(this.$route.params.quest_id);
    if (this.$route.params.node_id) {
      this.selectedNodeId = Number.parseInt(this.$route.params.node_id);
    }
    await userLoaded;
    this.setCurrentQuest(this.questId);
    const promises: Promise<any>[] = [
      this.ensureQuest({ quest_id: this.questId }),
      this.ensureGuildsPlayingQuest({ quest_id: this.questId }),
    ];
    await Promise.all(promises)
    // after so we have game_play ready
    await this.initializeGuildInner()
    this.ready = true;
  }
  async initializeGuild() {
    await this.initializeGuildInner()
    this.ready = true
  }
  async initializeGuildInner() {
    if (this.guildId) {
      this.ready = false;
      this.setCurrentGuild(this.guildId);
      await this.ensureGuild({guild_id: this.guildId});
    } else if (this.member) {
      this.myPlayingGuilds = this.guildsPlayingGame(true);
      if (this.myPlayingGuilds.length) {
        this.mySelectedPlayingGuildId = this.myPlayingGuilds[0].id;
      }
    }
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
