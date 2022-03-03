<template>
  <q-page class="bg-secondary">
    <h3 v-if="getCurrentGuild" class="text-center">
      <router-link
        :to="{ name: 'guild', params: { guild_id: getCurrentGuild.id } }"
      >
        {{ getCurrentGuild.name }}</router-link
      >
    </h3>
    <q-tooltip>Click link to goto guild</q-tooltip>
    <div v-if="getCurrentGuild" class="row justify-center">
      <div class="col-4" style="height:10%;">
        <guild-card
          v-bind:currentGuild="getCurrentGuild"
          class="q-ml-xl"
          style="width: 80%;"
        ></guild-card>
      </div>
    </div>
    <div
      class="column items-center q-mt-md"
      v-if="potentialQuests && potentialQuests.length > 0"
    >
      <div class="col-4">
        <q-card q-ma-md>
          <q-table
            title="Potential Quests"
            :data="potentialQuests"
            :columns="columns1"
            row-key="desc"
            id="quest_table"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
                <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
                <q-td key="status" :props="props">{{ props.row.status }}</q-td>
                <q-td key="start" :props="props">{{ props.row.start }}</q-td>
                <span v-if="findPlayOfGuild(props.row.game_play)">
                  <span
                    v-if="
                      findPlayOfGuild(props.row.game_play).status ==
                      'invitation'
                    "
                  >
                    <q-td key="questNodeId" auto-width :props="props">
                      <q-btn
                        label="Invitation"
                        @click="doRegister(props.row.id)"
                        class="q-mr-md q-ml-md"
                      />
                    </q-td>
                  </span>
                  <span
                    v-if="
                      findPlayOfGuild(props.row.game_play).status == 'requested'
                    "
                  >
                    <q-td key="questNodeId" auto-width :props="props">
                      Waiting for response
                    </q-td>
                  </span>
                </span>
                <span v-if="!findPlayOfGuild(props.row.game_play)">
                  <q-td key="questNodeId" auto-width :props="props">
                    <q-btn
                      label="Register"
                      @click="doRegister(props.row.id)"
                      class="q-mr-md q-ml-md"
                    />
                  </q-td>
                </span>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
    <div v-else>
      <div class="column items-center q-mt-md">
        <h4>No quest you can join</h4>
      </div>
    </div>
    <div class="row justify-center text-center">
      <h5 class="q-mt-md q-mb-md">Registered Quests</h5>
    </div>
    <div v-if="activeQuests && activeQuests.length > 0">
      <div class="row justify-center">
        <q-card class="col-4 q-mb-md">
          <div
            v-for="quest in activeQuests"
            :key="quest.id"
            class="row justify-center"
          >
            <h6>{{ quest.name }}</h6>
            <q-tooltip max-width="25rem">{{ quest.description }}</q-tooltip>
          </div>
        </q-card>
      </div>
    </div>

    <div class="row justify-center q-mt-md">
      <q-card style="width: 40%">
        <div class="row justify-center">
          <H5>Members Available Roles </H5>
        </div>
        <div style="width: 90%">
          <div v-for="member in getGuildMembers" :key="member.id">
            <div class="row">
              <span class="q-pl-md q-pt-md" style="width: 25%">
                {{ member.handle }}
              </span>
              <q-select
                style="width: 70%"
                class="q-pl-md"
                :multiple="true"
                v-model="rolesByMember[member.id]"
                @add="
                  (details) => {
                    roleAdded(member.id, details.value);
                  }
                "
                @remove="
                  (details) => {
                    roleRemoved(member.id, details.value);
                  }
                "
                :options="getRoles"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                id="qselect"
              >
              </q-select>
            </div>
          </div>
        </div>
      </q-card>
    </div>
    <div class="column items-center">
      <div class="col-6 q-pt-lg q-mb-md" style="width: 55%">
        <q-btn
          v-if="$store.state.member.member"
          id="newRoleBtn"
          label="New Role"
          color="primary"
          @click="
            $router.push({ name: 'create_guild_role', params: { guildId } })
          "
        />
      </div>
      <div class="q-mb-xl" style="width: 55%">
        <role-table v-bind:roles="getRoles"></role-table>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapActions, mapState, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import {
  QuestsActionTypes,
  QuestsGetterTypes,
  QuestsState,
} from "../store/quests";
import { RoleActionTypes, RoleGetterTypes, RoleState } from "../store/role";
import {
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import { MemberState } from "../store/member";
import { MembersActionTypes, MembersGetterTypes } from "../store/members";
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
  quest_status_type,
} from "../enums";
import {
  Quest,
  GamePlay,
  ConversationNode,
  Member,
  Role,
  GuildMemberAvailableRole,
  PublicMember,
  CastingRole,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { BaseGetterTypes } from "../store/baseStore";
import CastingRoleEdit from "../components/casting_role_edit.vue";
import roleTable from "../components/role-table.vue";
import guildCard from "../components/guild-card.vue";

@Component<GuildAdminPage>({
  name: "guild_admin",
  meta: {
    title: "Guild Admin"
  },
  components: {
    CastingRoleEdit,
    roleTable: roleTable,
    guildCard: guildCard,
  },
  computed: {
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapState("guilds", {
      currentGuildId: (state: GuildsState) => state.currentGuild,
    }),
    ...mapState("quests", {
      currentQuestId: (state: QuestsState) => state.currentQuest,
    }),
    currentQuestIdS: {
      get: function () {
        return this.currentQuestId;
      },
      set: function (value) {
        this.setCurrentQuest(value);
      },
    },
    activeQuests: {
      get: function () {
        const active_quests = this.getQuests.filter(
          (q: Quest) =>
            (q.status == quest_status_enum.ongoing ||
              q.status == quest_status_enum.paused ||
              q.status == quest_status_enum.registration) &&
            this.confirmedPlayQuestIds.includes(q.id)
        );
        if (active_quests && active_quests.length > 0) {
          return active_quests;
        } else {
          return [];
        }
      },
    },
    pastQuests: {
      get: function () {
        this.getQuests.filter(
          (q: Quest) =>
            (q.status == quest_status_enum.finished ||
              q.status == quest_status_enum.scoring) &&
            this.playQuestIds.includes(q.id)
        );
      },
    },
    playQuestIds: {
      get: function () {
        this.getCurrentGuild.game_play.map((gp: GamePlay) => gp.quest_id);
      },
    },
    guildGamePlays: {
      get: function () {
        if (this.getCurrentGuild?.game_play?.length > 0) {
          const gamePlay = this.getCurrentGuild.game_play.filter(
            (gp: GamePlay) => gp.status == registration_status_enum.confirmed
          );
          return gamePlay;
        } else {
          return [];
        }
      },
    },
    potentialQuests: {
      get: function () {
        this.confirmedPlayQuestIds = this.guildGamePlays.map(
          (gp: GamePlay) => gp.quest_id
        );
        return this.getQuests.filter(
          (q: Quest) =>
            (q.status == quest_status_enum.registration ||
              q.status == quest_status_enum.ongoing) &&
            !this.confirmedPlayQuestIds.includes(q.id)
        );
      },
    },
    confirmedPlayQuestIds: {
      get: function () {
        if (this.guildGamePlays.length > 0) {
          const gamePlay = this.guildGamePlays.map(
            (gp: GamePlay) => gp.quest_id
          );
          return gamePlay;
        } else {
          return [];
        }
      },
      set: function () {},
    },
    getGuildMembers: {
      get: function () {
        if (this.getCurrentGuild) {
          return this.getMembersOfGuild(this.getCurrentGuild);
        }
        return [];
      },
    },
    ...mapState("role", {
      allRoles: (state: RoleState) => state.role,
    }),
    ...mapGetters("member", ["getMembersAvailableRoles", "guildPerQuest"]),
    ...mapGetters("quests", [
      "getQuests",
      "getQuestById",
      "castingInQuest",
      "getCastingRolesById",
    ]),
    ...mapGetters("guilds", ["getCurrentGuild"]),
    ...mapGetters(["hasPermission"]),
    ...mapGetters("members", [
      "getMembersOfGuild",
      "castingRolesPerQuest",
      "getAvailableRolesMembersById",
    ]),
    ...mapGetters("role", ["getRoles", "getRoleById"]),
  },
  watch: {},
  methods: {
    ...mapActions("quests", [
      "ensureAllQuests",
      "addGamePlay",
      "addCastingRole",
      "deleteCastingRole",
      "setCurrentQuest",
    ]),
    ...mapActions("guilds", [
      "ensureGuild",
      "setCurrentGuild",
      "addGuildMemberAvailableRole",
      "deleteGuildMemberAvailableRole",
    ]),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions("members", ["ensureMembersOfGuild", "ensureAllMembers"]),
  },
})
export default class GuildAdminPage extends Vue {
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
  questGamePlay: GamePlay[] = [];
  isAdmin = false;
  label = "";
  questId: number = null;
  gamePlay?: GamePlay = null;
  selectedNode: ConversationNode = null;
  focusNode: ConversationNode = null;
  guildId: number = null;
  rolesByMember: { [key: number]: number[] } = {};
  castingRolesByMember: { [key: number]: number[] } = {};
  availableRoles: GuildMemberAvailableRole[] = [];

  // declare state bindings for TypeScript
  member!: MemberState["member"];
  memberId!: number;
  currentGuildId!: number;
  currentQuestId!: QuestsState["currentQuest"];
  allRoles!: RoleState["role"];
  currentQuestIdS!: number;

  // declare the computed attributes for Typescript
  getQuests!: QuestsGetterTypes["getQuests"];
  getQuestById!: QuestsGetterTypes["getQuestById"];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  hasPermission!: BaseGetterTypes["hasPermission"];
  getMembersOfGuild!: MembersGetterTypes["getMembersOfGuild"];
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  getRoles!: RoleGetterTypes["getRoles"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  castingRolesPerQuest!: MembersGetterTypes["castingRolesPerQuest"];
  getCastingRolesById!: QuestsGetterTypes["getCastingRolesById"];
  getAvailableRolesMembersById!: MembersGetterTypes["getAvailableRolesMembersById"];
  potentialQuests: Quest[];
  guildGamePlays: GamePlay[];
  getGuildMembers: PublicMember[];
  activeQuests: Quest[];

  // declare the methods for Typescript
  ensureAllQuests!: QuestsActionTypes["ensureAllQuests"];
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];
  addGamePlay!: QuestsActionTypes["addGamePlay"];
  ensureGuild!: GuildsActionTypes["ensureGuild"];
  setCurrentGuild!: GuildsActionTypes["setCurrentGuild"];
  addGuildMemberAvailableRole!: GuildsActionTypes["addGuildMemberAvailableRole"];
  ensureMembersOfGuild!: MembersActionTypes["ensureMembersOfGuild"];
  deleteGuildMemberAvailableRole!: GuildsActionTypes["deleteGuildMemberAvailableRole"];
  addCastingRole!: QuestsActionTypes["addCastingRole"];
  deleteCastingRole!: QuestsActionTypes["deleteCastingRole"];
  ensureAllMembers!: MembersActionTypes["ensureAllMembers"];
  setCurrentQuest!: QuestsActionTypes["setCurrentQuest"];

  getCastingRole(memberId: number, questId: number) {
    const roles: CastingRole[] = this.castingRolesPerQuest(memberId, questId);
    const rolesName = roles.map((cr) => this.allRoles[cr.role_id].name);
    return rolesName;
  }

  getAvailableRolesById(memberId: number) {
    const roles = this.getAvailableRolesMembersById(memberId);
    const roleName = roles.map((cr) => this.getRoleById(cr.role_id));
    return roleName;
  }
  async doRegister(questId: number) {
    try {
      this.questId = questId;
      const regQuest = this.getQuestById(questId);
      if (
        (
          [
            quest_status_enum.ongoing,
            quest_status_enum.registration,
          ] as quest_status_type[]
        ).indexOf(regQuest.status) < 0
      ) {
        throw `Can not register quest in ${regQuest.status} status`;
      }
      let payload = {
        guild_id: this.currentGuildId,
        quest_id: questId,
      };
      const play = await this.addGamePlay({ data: payload });
      this.$q.notify({
        type: "positive",
        message: "You have registered to Quest ",
      });
    } catch (err) {
      this.$q.notify({
        type: "negative",
        message: `${err}`,
      });
      console.log("error registering to quest: ", err);
    }
  }
  findPlayOfGuild(gamePlays) {
    if (gamePlays) {
      return gamePlays.find(
        (gp: GamePlay) => gp.guild_id == this.currentGuildId
      );
    }
  }

  playingAsGuildId(member_id) {
    return this.castingInQuest(null, member_id)?.guild_id;
  }

  async roleAdded(member_id, role_id) {
    const guild_id = this.guildId;
    await this.addGuildMemberAvailableRole({
      data: { member_id, guild_id, role_id },
    });
  }

  async roleRemoved(member_id: number, role_id: number) {
    const guild_id: number = this.guildId;
    await this.deleteGuildMemberAvailableRole({
      params: { member_id, guild_id, role_id },
      data: {},
    });
  }
  async castingRoleAdded(member_id: number, role_id: number) {
    const guild_id = this.guildId;
    const quest_id: number = this.currentQuestId;
    await this.addCastingRole({
      data: { member_id, guild_id, role_id, quest_id },
    });
  }

  async castingRoleRemoved(member_id: number, role_id: number) {
    const guild_id: number = this.guildId;
    const quest_id: number = this.currentQuestId;
    await this.deleteCastingRole({
      params: { member_id, role_id, guild_id, quest_id },
      data: {},
    });
  }
  getMembersRole(memberId) {
    this.castingRolesByMember = Object.fromEntries(
      this.getGuildMembers.map((m: Member) => [
        m.id,
        m.guild_member_available_role?.map(
          (r: GuildMemberAvailableRole) => r.role_id
        ),
      ])
    );
  }

  async created() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    await Promise.all([
      this.ensureGuild({ guild_id: this.guildId }),
      this.ensureAllQuests(),
      this.ensureAllRoles(),
      this.ensureMembersOfGuild({ guildId: this.guildId }),
    ]);
    await this.setCurrentGuild(this.guildId);
    this.rolesByMember = Object.fromEntries(
      this.getGuildMembers.map((m: Member) => [
        m.id,
        m.guild_member_available_role?.map(
          (r: GuildMemberAvailableRole) => r.role_id
        ),
      ])
    );
    this.castingRolesByMember = Object.fromEntries(
      this.getGuildMembers.map((m: Member) => [
        m.id,
        m.guild_member_available_role?.map(
          (r: GuildMemberAvailableRole) => r.role_id
        ),
      ])
    );
    this.isAdmin = this.hasPermission(
      permission_enum.guildAdmin,
      this.currentGuildId
    );
    const canRegisterToQuest = this.hasPermission(
      permission_enum.joinQuest,
      this.currentGuildId
    );
    if (!canRegisterToQuest) {
      this.$router.push({
        name: "guild",
        params: { guild_id: this.guildId.toString() },
      });
    }
  }
}
</script>
<style></style>
