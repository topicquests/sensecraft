<template>
  <q-page class="bg-secondary">
    <div>
      <member></member>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="col-4 q-pa-md bg-secondary" v-if="getCurrentGuild">
      <p class="bg-secondary" style="text-align: center; font-size: 40px">
        {{ getCurrentGuild.name }}
        <q-btn
          v-if="!isMember && getCurrentGuild.open_for_applications"
          label="Join Guild"
          @click="joinToGuild()"
          style="margin-right: 1em"
          class="bg-dark-blue"
        />
        <router-link
          v-if="canRegisterToQuest"
          :to="{
            name: 'guild_admin',
            params: { guild_id: currentGuildId },
          }"
          style="font-size: smaller"
          >Admin</router-link
        >
      </p>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 900px">
        <q-card class="bg-light-blue no-border">
          <div v-if="activeQuests.length > 0">
            <div v-for="quest in activeQuests" :key="quest.id">
              <q-radio
                v-model="currentQuestIdS"
                color="black"
                style="font-size: 20px"
                :val="quest.id"
                :label="quest.name"
              >
                <q-btn
                  v-if="isMember && !guildPerQuest[quest.id]"
                  label="Play"
                  @click="prompt = true"
                  style="margin-right: 1em"
                  class="bg-dark-blue"
                />
                <q-btn
                  v-else-if="
                    guildPerQuest[quest.id] &&
                    guildPerQuest[quest.id] == currentGuildId
                  "
                  class="q-ml-md bg-dark-blue"
                  label="Go To Quest"
                  style="margin-right: 1em"
                  @click="
                    $router.push({
                      name: 'game_play',
                      params: { quest_id: quest.id },
                    })
                  "
                />
                <router-link
                  v-if="
                    guildPerQuest[quest.id] &&
                    guildPerQuest[quest.id] != currentGuildId
                  "
                  :to="{
                    name: 'guild',
                    params: { guild_id: guildPerQuest[quest.id] },
                  }"
                  >Playing in guild</router-link
                >
              </q-radio>
            </div>
          </div>
          <div v-else>
            <p style="font-size: 20px">You are not registered to any quests</p>
          </div>
        </q-card>
      </div>
    </div>
    <div class="row">
      <div class="col-3">
        <div
          v-if="
            getCurrentQuest &&
            !getCurrentQuest.start &&
            isPlayingQuestInGuild(getCurrentQuest.id, getCurrentGuild.id)
          "
        >
          <castingRoleEdit
            class="q-ml-md"
            v-if="getAvailableRolesById(memberId).length"
            v-bind:availableRoles="getAvailableRolesById(memberId)"
            v-bind:castingRoles="getRolesForQuest"
            v-bind:guildId="guildId"
            v-bind:questId="currentQuestId"
            v-bind:memberId="memberId"
            v-on:castingRoleAdd="castingRoleAdded"
            v-on:castingRoleRemove="castingRoleRemoved"
          ></castingRoleEdit>
        </div>
      </div>
    </div>
    <div class="col-4 col-md">
      <p class="card-header bg-secondary">Team</p>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-6">
        <q-card id="team-card">
          <ul>
            <li
              v-for="member in getMembersOfGuild(getCurrentGuild)"
              :key="member.id"
              class="q-ml-lg q-mr-md"
              style="color: red"
            >
              {{ member.handle }}
              <span v-if="playingAsGuildId(member.id)">
                <span
                  v-if="playingAsGuildId(member.id) == currentGuildId"
                  style="color: black"
                >
                  {{ getAllCastingRoleNames(member.id) }}
                </span>
                <span v-if="playingAsGuildId(member.id) != currentGuildId"
                  >Playing in
                  <router-link
                    :to="{
                      name: 'guild',
                      params: { guild_id: playingAsGuildId(member.id) },
                    }"
                    >{{ playingAsGuild(member.id).name }}</router-link
                  ></span
                >
              </span>
            </li>
          </ul>
        </q-card>
      </div>
    </div>
    <div class="row justify-center bg-secondary">
      <div class="col-4">
        <p class="card-header bg-secondary">Current Quest</p>
      </div>
      <div class="col-4">
        <p class="card-header bg-secondary">Quest Move</p>
      </div>
    </div>
    <div class="row justify-center">
      <div class="col-4 q-mt-md items-center" v-if="getCurrentQuest">
        <questCard
          v-bind:currentQuest="getCurrentQuest"
          :creator="getQuestCreator()"
          v-if="getCurrentQuest"
        ></questCard>
      </div>
      <div class="col-4 q-ml-lg q-mt-md items-center" style="width: 30%">
        <div v-if="getFocusNode">
          <node-form v-bind:nodeInput="getFocusNode" />
        </div>
      </div>
    </div>
    <div class="column items-center" v-if="pastQuests.length > 0">
      <div class="col-4">
        <q-card>
          <q-table
            title="Past Quests"
            :data="pastQuests"
            :columns="columns1"
            row-key="desc"
            id="quest_table"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
                <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
                <q-td key="status" :props="props">{{ props.row.status }}</q-td>
                <q-td key="end" :props="props">{{ props.row.end }}</q-td>
                <q-td key="questNodeId" auto-width :props="props">
                  <router-link
                    :to="{
                      name: 'quest_page',
                      params: { quest_id: props.row.id },
                    }"
                    >Enter</router-link
                  >
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Available Roles</div>
        </q-card-section>
        <div v-for="role in roles" :key="role.id">
          <q-radio
            v-model="roleId"
            :label="role.name"
            :val="role.id"
            @input="updateRole()"
            v-close-popup="true"
          >
          </q-radio>
        </div>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup="true"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeForm from "../components/node-form.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import {
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
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
  CastingRole,
  PublicMember,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
import { RoleActionTypes, RoleGetterTypes, RoleState } from "../store/role";
import castingRoleEdit from "src/components/casting_role_edit.vue";
import { ChannelActionTypes } from '../store/channel'

@Component<GuildPage>({
  meta: {
    title: 'Guild Page'
  },
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeForm: nodeForm,
    castingRoleEdit: castingRoleEdit,
  },
  computed: {
    ...mapState("quests", {
      currentQuestId: (state: QuestsState) => state.currentQuest,
    }),
    ...mapState("role", {
      allRoles: (state: RoleState) => state.role,
    }),
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapState("guilds", {
      currentGuildId: (state: GuildsState) => state.currentGuild,
    }),
    currentQuestIdS: {
      get: function () {
        return this.currentQuestId;
      },
      set: function (value) {
        this.setCurrentQuest(value);
      },
    },
    ...mapGetters("quests", [
      "getQuestById",
      "getQuests",
      "getCurrentQuest",
      "castingInQuest",
      "getCurrentGamePlay",
      "getCastingRoles",
      "getCastingRolesForQuest",
      "isPlayingQuestInGuild",
    ]),    
    ...mapGetters("members", [
      "getMemberById",
      "getMembersOfGuild",
      "castingRolesPerQuest",
      "getAvailableRolesMembersById",
    ]),
    ...mapGetters("guilds", [
      "isGuildMember",
      "getGuildById",
      "getCurrentGuild",
    ]),
    ...mapGetters("role", ["getRoleById"]),
    ...mapGetters("member", ["getMembersAvailableRoles", "guildPerQuest"]),
    ...mapState("conversation", {
      rootNode: (state: ConversationState) => state.conversationRoot,
    }),
    ...mapGetters("conversation", ["getFocusNode", "getConversationNodeById"]),
    ...mapGetters(["hasPermission"]),
    getRolesForQuest(): Role {
      const castingRoles = this.castingRolesPerQuest(
        this.memberId,
        this.currentQuestId
      );
      const roles = castingRoles.map((cr) => this.allRoles[cr.role_id]);
      return roles;
    },
    getCastingRoleNames(): string[] {
      const roles = this.getRolesForQuest;
      const rolesName = roles.map((cr) => cr.name).join(",");
      return rolesName;
    },
  },
  watch: {
    currentQuestId: "onCurrentQuestChange",
  },
  methods: {
    ...mapActions("conversation", [
      "ensureConversationNeighbourhood",
      "ensureRootNode",
      "resetConversation",
    ]),
    ...mapActions("quests", [
      "ensureAllQuests",
      "setCurrentQuest",
      "setCastingRole",
      "addCasting",
      "addCastingRole",
      "deleteCastingRole",
      "updateGamePlay",
    ]),
    ...mapActions("members", ["ensureMembersOfGuild", "ensureMemberById"]),
    ...mapActions("guilds", [
      "ensureGuild",
      "getMemberByGuildIdandUserId",
      "getMembersByGuildId",
      "registerQuest",
      "joinGuild",
      "setCurrentGuild",
      "addGuildMembership",
      "ensureGuildsPlayingQuest",
    ]),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions('channel', ['ensureChannels']),
    getGuildMembers(): PublicMember[] {
      if (this.getCurrentGuild) {
        return this.getMembersOfGuild(this.getCurrentGuild);
      }
      return [];
    },
  },
})
export default class GuildPage extends Vue {
  // data
  columns1 = [
    {
      name: "desc",
      required: true,
      label: "Quest",
      align: "left",
      field: "name",
      sortable: true,
    },
    {
      name: "status",
      required: false,
      label: "Handle",
      align: "left",
      field: "status",
      sortable: true,
    },
    {
      name: "handle",
      required: false,
      label: "Status",
      align: "left",
      field: "handle",
      sortable: true,
    },
    {
      name: "start",
      required: false,
      label: "Start Date",
      align: "left",
      field: "start",
      sortable: true,
    },
    {
      name: "questNodeId",
      required: false,
      label: "Action",
      align: "left",
      field: "id",
      sortable: true,
    },
  ];
  guildId: number;
  memberPlaysQuestSomewhere?: number;
  memberPlaysQuestInThisGuild = false;
  casting: Casting;
  guildGamePlays: GamePlay[] = [];
  pastQuests: Quest[] = [];
  activeQuests: Quest[] = [];
  potentialQuests: Quest[] = [];
  questGamePlay: GamePlay[] = [];
  roles: Role[] = [];
  isMember = false;
  isAdmin = false;
  canRegisterToQuest = false;
  members: Member[] = [];
  label = "";
  questId: number;
  gamePlay = null;
  prompt = false;
  roleId: number = null;

  // declare state bindings for TypeScript
  currentGuildId!: GuildsState["currentGuild"];
  currentQuestId!: QuestsState["currentQuest"];
  member!: MemberState["member"];
  memberId: number;
  rootNode!: ConversationState["conversationRoot"];
  currentQuestIdS!: number;
  allRoles!: RoleState["role"];

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  getQuests!: QuestsGetterTypes["getQuests"];
  getQuestById!: QuestsGetterTypes["getQuestById"];
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  getFocusNode!: ConversationGetterTypes["getFocusNode"];
  getGuildById!: GuildsGetterTypes["getGuildById"];
  isPlayingQuestInGuild!: QuestsGetterTypes["isPlayingQuestInGuild"];
  getMembersOfGuild!: MembersGetterTypes["getMembersOfGuild"];
  getMemberById!: MembersGetterTypes["getMemberById"];
  getAvailableRolesMembersById!: MembersGetterTypes["getAvailableRolesMembersById"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  getCastingRolesForQuest!: QuestsGetterTypes["getCastingRolesForQuest"];
  getCastingRoles!: QuestsGetterTypes["getCastingRoles"];
  hasPermission!: BaseGetterTypes["hasPermission"];
  isGuildMember!: GuildsGetterTypes["isGuildMember"];
  getParentNode!: ConversationGetterTypes["getConversationNodeById"];
  getConversationNodeById!: ConversationGetterTypes["getConversationNodeById"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getMembersAvailableRoles!: MemberGetterTypes["getMembersAvailableRoles"];
  guildPerQuest!: MemberGetterTypes["guildPerQuest"];
  castingRolesPerQuest!: MembersGetterTypes["castingRolesPerQuest"];
 
  // declare the methods for Typescript
  ensureGuildsPlayingQuest!: GuildsActionTypes["ensureGuildsPlayingQuest"];
  ensureMembersOfGuild!: MembersActionTypes["ensureMembersOfGuild"];
  ensureMemberById!: MembersActionTypes["ensureMemberById"];
  ensureConversationNeighbourhood!: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureRootNode!: ConversationActionTypes["ensureRootNode"];
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];
  setCurrentGuild!: GuildsActionTypes["setCurrentGuild"];
  setCurrentQuest!: QuestsActionTypes["setCurrentQuest"];
  setCastingRole!: QuestsActionTypes["setCastingRole"];
  registerAllMembers!: GuildsActionTypes["registerAllMembers"];
  resetConversation!: ConversationActionTypes["resetConversation"];
  addGuildMembership!: GuildsActionTypes["addGuildMembership"];
  addCasting!: QuestsActionTypes["addCasting"];
  addCastingRole!: QuestsActionTypes["addCastingRole"];
  deleteCastingRole!: QuestsActionTypes["deleteCastingRole"];
  ensureAllQuests!: QuestsActionTypes["ensureAllQuests"];
  ensureGuild!: GuildsActionTypes["ensureGuild"];
  ensureQuest!: QuestsActionTypes["ensureQuest"];
  ensureChannels!: ChannelActionTypes['ensureChannels']
  fetchQuestById!: QuestsActionTypes["fetchQuestById"];
  updateQuest!: QuestsActionTypes["updateQuest"];
  updateGamePlay!: QuestsActionTypes["updateGamePlay"];
  getGuildMembers!: () => PublicMember[];
  getRolesForQuest!: () => Role[];
  getCastingRoleNames!: () => string[];

  async initialize() {
    await this.setCurrentGuild(this.guildId);
    this.checkPermissions();
    const playQuestIds = this.getCurrentGuild.game_play.map(
      (gp: GamePlay) => gp.quest_id
    );
    this.guildGamePlays = this.getCurrentGuild.game_play.filter(
      (gp: GamePlay) => gp.status == registration_status_enum.confirmed
    );
    const confirmedPlayQuestIds = this.guildGamePlays.map(
      (gp: GamePlay) => gp.quest_id
    );
    if (this.canRegisterToQuest) {
      this.potentialQuests = this.getQuests.filter(
        (q: Quest) =>
          (q.status == quest_status_enum.registration ||
            q.status == quest_status_enum.ongoing) &&
          !confirmedPlayQuestIds.includes(q.id)
      );
    }
    this.pastQuests = this.getQuests.filter(
      (q: Quest) =>
        (q.status == quest_status_enum.finished ||
          q.status == quest_status_enum.scoring) &&
        playQuestIds.includes(q.id)
    );
    this.activeQuests = this.getQuests.filter(
      (q: Quest) =>
        (q.status == quest_status_enum.ongoing ||
          q.status == quest_status_enum.paused ||
          q.status == quest_status_enum.registration) &&
        confirmedPlayQuestIds.includes(q.id)
    );

    if (this.guildGamePlays.length > 0) {
      const response = await this.initializeQuest();
    }
  }
  getAvailableRolesById(memberId: number) {
    const roles = this.getAvailableRolesMembersById(memberId) || [];
    const roleName = roles.map((cr) => this.getRoleById(cr.role_id));
    return roleName;
  }
  playingAsGuildId(member_id) {
    return this.castingInQuest(null, member_id)?.guild_id;
  }
  playingAsGuild(member_id) {
    const guild_id = this.playingAsGuildId(member_id);
    if (guild_id) return this.getGuildById(guild_id);
  }
  async initializeQuest() {
    var quest_id = this.currentQuestId;
    if (
      quest_id &&
      !this.guildGamePlays.find((gp: GamePlay) => gp.quest_id == quest_id)
    ) {
      quest_id = null;
    }
    if (!quest_id) {
      const gamePlay = this.guildGamePlays[0];
      await this.setCurrentQuest(gamePlay.quest_id);
    }
    // TODO: figure out why is this not triggered reliably by the watch and the change above?
    await this.onCurrentQuestChange();
  }

  async onCurrentQuestChange() {
    // we should not get here without a current quest
    const quest: Quest = this.getCurrentQuest;
    if (!quest) {
      return;
    }
    await this.ensureMemberById({ id: quest.creator });
    await this.ensureGuildsPlayingQuest({ quest_id: quest.id });
    const casting = quest.casting?.find(
      (ct: Casting) => ct.member_id == this.memberId
    );
    if (casting) {
      this.memberPlaysQuestSomewhere = casting.guild_id;
      if (casting.guild_id == this.currentGuildId) {
        this.memberPlaysQuestInThisGuild = true;
        this.casting = casting;
      }
    }
    const guild = this.currentGuildId;
    const gamePlay = this.findPlayOfGuild(quest.game_play);
    var node_id = gamePlay.focus_node_id;
    if (!node_id) {
      await this.ensureRootNode(this.currentQuestId);
      node_id = this.rootNode?.id;
    }
    if (node_id) {
      await this.ensureConversationNeighbourhood({ node_id, guild });
    } else {
      // ill-constructed quest
      await this.resetConversation();
    }
    return "success";
  }

  getCastingRoleNamesForQuest(memberId: number) {
    const castingRoles = this.castingRolesPerQuest(
      memberId,
      this.currentQuestId
    );
    const roles = castingRoles.map((cr) => this.allRoles[cr.role_id]);
    return roles;
  }

  getAllCastingRoleNames(memberId: number) {
    const roles = this.getCastingRoleNamesForQuest(memberId);
    const rolesName = roles.map((cr) => cr.name).join(",");
    return rolesName;
  }
  async joinToGuild() {
    await this.addGuildMembership({
      guild_id: this.currentGuildId,
      member_id: this.memberId,
    });
    this.isMember = true;
    this.$q.notify({
      type: "positive",
      message: "You are joining guild " + this.currentGuildId,
    });
    return;
  }
  async registerAllMembersToQuest() {
    // This was a temporary fix, let's not do this too often.
    const guildId = this.currentGuildId;
    const registerAllMembers = this.registerAllMembers;
    const calls = this.getCurrentGuild.game_play
      .filter((gp: GamePlay) => gp.status == registration_status_enum.confirmed)
      .map((gp: GamePlay) =>
        registerAllMembers({ params: { guildId, questId: gp.quest_id } })
      );
    await Promise.all(calls);
  }
  findPlayOfGuild(gamePlays) {
    if (gamePlays)
      return gamePlays.find(
        (gp: GamePlay) => gp.guild_id == this.currentGuildId
      );
  }
  async doAddCasting(quest_id: number) {
    await this.addCasting({
      data: {
        quest_id,
        guild_id: this.currentGuildId,
        member_id: this.memberId,
      },
    });
  }
  checkPermissions() {
    this.isMember = !!this.isGuildMember(this.currentGuildId);
    if (this.isMember) {
      this.isAdmin = this.hasPermission(
        permission_enum.guildAdmin,
        this.currentGuildId
      );
      this.canRegisterToQuest = this.hasPermission(
        permission_enum.joinQuest,
        this.currentGuildId
      );
    }
  }
  show_tree(show) {
    this.$store.commit("conversation/SHOW_TREE", show);
  }

  getPlayedQuests() {
    const play = this.guildGamePlays;
    return play.map((gp: GamePlay) => this.getQuestById(gp.quest_id));
  }
  getParentsNode() {
    const nodeId = this.getFocusNode?.parent_id;
    if (nodeId) {
      return this.getConversationNodeById(nodeId);
    }
  }

  async setFocusNode(node_id: number) {
    const gamePlay = this.getCurrentGamePlay;
    if (gamePlay) {
      gamePlay.focus_node_id = node_id;
      await this.updateGamePlay(gamePlay);
    }
  }

  getAvailableRoles() {
    this.getMembersAvailableRoles.map((role) => {
      this.roles.push(this.getRoleById(role.role_id));
    });
  }

  getQuestCreator() {
    const quest = this.getCurrentQuest;
    if (quest) {
      return this.getMemberById(quest.creator);
    }
  }
  async updateRole() {
    const guild_id = this.guildId;
    const role_id = this.roleId;
    const member_id = this.memberId;
    const quest_id = this.currentQuestId;
    await this.doAddCasting(quest_id);
    await this.addCastingRole({
      data: { member_id, guild_id, role_id, quest_id },
    });
  }
  async castingRoleAdded(role_id: number) {
    const guild_id = this.guildId;
    const quest_id: number = this.currentQuestId;
    await this.addCastingRole({
      data: { member_id: this.memberId, role_id, guild_id, quest_id },
    });
  }

  async castingRoleRemoved(role_id: number) {
    const guild_id: number = this.guildId;
    const quest_id: number = this.currentQuestId;
    await this.deleteCastingRole({
      params: {
        member_id: this.memberId,
        role_id,
        guild_id,
        quest_id,
      },
      data: {},
    });
  }
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    await Promise.all([
      this.ensureAllQuests(),
      this.ensureGuild({ guild_id: this.guildId }),
      this.ensureAllRoles(),
      this.ensureChannels(this.guildId),
    ]);
    await this.ensureMembersOfGuild({ guildId: this.guildId });
    await this.initialize();
    this.getAvailableRoles();
  }
}
</script>

<style>
#team-card {
  font-size: 20px;
  color: black;
  border: grey;
  background-color: floralwhite;
}
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}
.card-header {
  text-align: center;
  font-size: 20px;
  padding-bottom: sm;
}
#node_card {
  border: 3px solid black;
  font-size: 10pt;
  color: darkblue;
  height: 400px;
  background-color: #caf0f8;
}
</style>
