<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="guild-admin-card q-mt-md q-pa-md">
        <div class="row justify-end" style="width: 92%">
          <member></member>
        </div>
        <div class="row justify-center" style="width: 100%">
          <div class="col-10 justify-center">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <h4 v-if="getCurrentGuild">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: String(getCurrentGuild.id) },
              }"
              >{{ getCurrentGuild.name }}
            </router-link>
          </h4>
        </div>
        <q-tooltip>Click on guild name to goto guild</q-tooltip>

        <div class="row justify-center">
          <div class="column">
            <q-card>
              <div class="admin-content-container">
                <q-editor
                  class="admin-content guild-description-col"
                  v-model="getCurrentGuild.description"
                >
                </q-editor>
              </div>
              <div class="row" q-mt-md>
                <q-btn
                  id="update-button"
                  label="Update"
                  @click="doSubmit"
                ></q-btn>
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-3"></div>
        <section class="quest-section">
          <div
            class="column items-center q-mt-md"
            v-if="potentialQuests && potentialQuests.length > 0"
          >
            <div class="col-4">
              <q-card q-ma-md>
                <quest-table
                  v-bind:quests="potentialQuests"
                  title="Potential Quests"
                >
                  <template v-slot:default="slotProps">
                    <span v-if="findPlayOfGuild(slotProps.quest.game_play)">
                      <q-btn
                        v-if="
                          findPlayOfGuild(slotProps.quest.game_play).status ==
                          'invitation'
                        "
                        label="Invitation"
                        @click="doRegister(slotProps.quest.id)"
                        class="q-mr-md q-ml-md"
                      />
                      <span
                        v-else-if="
                          findPlayOfGuild(slotProps.quest.game_play).status ==
                          'requested'
                        "
                      >
                        Waiting for response
                      </span>
                    </span>
                    <q-btn
                      v-else
                      label="Register"
                      @click="doRegister(slotProps.quest.id)"
                      class="q-mr-md q-ml-md"
                    />
                  </template>
                </quest-table>
              </q-card>
            </div>
          </div>
          <div v-else>
            <div class="row justify-center">
              <div class="column">
                <h4 class="gt-md">No quest you can join</h4>
                <h2 class="lt-md">No quest you can join</h2>
              </div>
            </div>
          </div>

          <div v-if="activeQuests && activeQuests.length > 0">
            <div class="row justify-center">
              <q-card class="active-quest-card col-12 q-mb-md">
                <div class="row justify-center text-center">
                  <h3 class="q-mt-md q-mb-md active-quest-header">
                    Registered Quests
                  </h3>
                </div>
                <div
                  v-for="quest in activeQuests"
                  :key="quest.id"
                  class="row justify-start"
                >
                  <h2 class="gt-md">{{ quest.name }}</h2>
                  <br />
                  <h6 class="lt-md">{{ quest.name }}</h6>

                  <q-tooltip max-width="25rem">{{
                    quest.description
                  }}</q-tooltip>
                </div>
              </q-card>
            </div>
          </div>
        </section>
        <section class="guild-section">
          <div class="channel row justify-center q-mb-lg">
            <q-btn
              class="q-mt-md"
              color="primary"
              label="Create Guild Channel"
              @click="
                $router.push({
                  name: 'guild_channel_list',
                  params: { guild_id: String(guildId) },
                })
              "
            >
            </q-btn>
          </div>
          <div class="row justify-start">
            <q-card class="guildAdmin-card">
              <div class="row justify-center">
                <div>
                  <h3 class="guildAdmin-card-header">Guild Admins</h3>
                </div>
              </div>
              <div class="row q-pl-md">
                <span
                  >Select members to add as guild admins. You also can remove
                  members that are listed by selecting them from the
                  dropdown.</span
                >
              </div>
              <q-select
                class="q-pl-lg"
                style="width: 50%"
                :multiple="true"
                v-model="handle"
                @add="
                  (details) => {
                    addGuildAdmin(details.value);
                  }
                "
                @remove="
                  (details) => {
                    removeGuildAdmin(details.value);
                  }
                "
                label="Member"
                :options="getGuildMembers"
                option-label="handle"
                option-value="id"
                emit-value
                map-options
              >
              </q-select>
              <div v-for="member in getGuildMembers" :key="member.id">
                <div class="row">
                  <span
                    v-if="isGuildAdmin(member.id)"
                    class="q-pl-md q-pt-md"
                    style="width: 25%"
                  >
                    {{ member.handle }}
                  </span>
                </div>
              </div>
            </q-card>

            <guild-card
              class="guilds-card"
              v-bind:currentGuild="{ ...getCurrentGuild }"
              :showDescription="false"
            ></guild-card>
          </div>
          <div class="row justify-center q-mt-md">
            <q-card class="available-roles-card">
              <div class="row justify-center">
                <h3 class="available-roles-card-header">
                  Members Available Roles
                </h3>
              </div>
              <div class="row q-pl-md">
                <span
                  >Here admin can set members available roles. Use the dropdown
                  next to team members handle. Select from list of roles.
                  Selecting existing roles removes that role from being
                  available to player.
                </span>
              </div>
              <div>
                <div v-for="member in getGuildMembers" :key="member.id">
                  <div class="row" id="members-handle">
                    <span class="q-pl-md q-pt-md">
                      {{ member.handle }}
                    </span>
                    <q-select
                      style="width: 50%"
                      class="q-pl-md q-mb-md"
                      :multiple="true"
                      v-model="availableRolesByMember[member.id]"
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
          <div class="row justify-center q-mt-md q-mb-sm">
            <q-card class="roles-card">
              <div class="row justify-center">
                <h3 class="roles-card-header">Roles</h3>
              </div>
              <div class="row q-pl-md">
                <span
                  >Listed are system roles with their permissions. Guild admin
                  can add specific guild roles. This new role will only be
                  available for this guild. Click "NEW ROLE" button to name and
                  create role.
                </span>
              </div>
              <q-btn
                class="q-ma-md"
                v-if="$store.state.member.member"
                id="newRoleBtn"
                label="New Role"
                color="primary"
                @click="
                  $router.push({
                    name: 'create_guild_role',
                    params: { guildId: String(guildId) },
                  })
                "
              />
              <div>
                <role-table v-bind:roles="getRoles"></role-table>
              </div>
            </q-card>
          </div>
        </section>
      </q-card>
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
import { MemberState, MemberGetterTypes } from "../store/member";
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
import QuestTable from "../components/quest-table.vue";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";

@Component<GuildAdminPage>({
  name: "guild_admin",
  meta: (c) => ({
    title: `Guild Administration - ${c.getCurrentGuild?.name}`,
  }),
  components: {
    CastingRoleEdit,
    roleTable,
    guildCard,
    QuestTable,
    scoreboard: scoreboard,
    member: member,
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
        return (this.guildGamePlays || []).map((gp: GamePlay) => gp.quest_id);
      },
    },
    getGuildMembers: {
      get: function () {
        if (this.getCurrentGuild) {
          return this.getMembersOfCurrentGuild;
        }
        return [];
      },
    },
    ...mapState("role", {
      allRoles: (state: RoleState) => state.role,
    }),
    ...mapGetters("member", [
      "getMembersAvailableRoles",
      "guildPerQuest",
      "getUserById",
    ]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("quests", [
      "getQuests",
      "getQuestById",
      "castingInQuest",
      "getCastingRolesById",
    ]),
    ...mapGetters("guilds", [
      "getCurrentGuild",
      "getGuildMembershipById",
      "getMembersOfCurrentGuild",
    ]),
    ...mapGetters(["hasPermission"]),
    ...mapGetters("members", [
      "castingRolesPerQuest",
      "getAvailableRolesForMemberAndGuild",
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
      "updateGuildMembership",
      "updateGuild",
    ]),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions("members", ["ensureMembersOfGuild", "ensureAllMembers"]),
  },
})
export default class GuildAdminPage extends Vue {
  handle: string = null;
  member_id: number = null;
  questGamePlay: GamePlay[] = [];
  isAdmin = false;
  label = "";
  questId: number = null;
  gamePlay?: GamePlay = null;
  selectedNode: ConversationNode = null;
  focusNode: ConversationNode = null;
  guildId: number = null;
  availableRolesByMember: { [key: number]: number[] } = {};
  availableRoles: GuildMemberAvailableRole[] = [];

  // declare state bindings for TypeScript
  member!: MemberState["member"];
  memberId!: number;
  currentGuildId!: number;
  currentQuestId!: QuestsState["currentQuest"];
  allRoles!: RoleState["role"];
  currentQuestIdS!: number;
  ready = false;

  // declare the computed attributes for Typescript
  getQuests!: QuestsGetterTypes["getQuests"];
  getQuestById!: QuestsGetterTypes["getQuestById"];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  getMembersOfCurrentGuild!: GuildsGetterTypes["getMembersOfCurrentGuild"];
  hasPermission!: BaseGetterTypes["hasPermission"];
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  getRoles!: RoleGetterTypes["getRoles"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  castingRolesPerQuest!: MembersGetterTypes["castingRolesPerQuest"];
  getCastingRolesById!: QuestsGetterTypes["getCastingRolesById"];
  getAvailableRolesForMemberAndGuild!: MembersGetterTypes["getAvailableRolesForMemberAndGuild"];
  getGuildMembershipById!: GuildsGetterTypes["getGuildMembershipById"];
  getUserById!: MemberGetterTypes["getUserById"];
  getMemberById!: MembersGetterTypes["getMemberById"];
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
  updateGuildMembership!: GuildsActionTypes["updateGuildMembership"];
  updateGuild!: GuildsActionTypes["updateGuild"];

  getCastingRole(memberId: number, questId: number) {
    const roles: CastingRole[] = this.castingRolesPerQuest(memberId, questId);
    const rolesName = roles.map((cr) => this.allRoles[cr.role_id].name);
    return rolesName;
  }

  async addGuildAdmin(id) {
    if (!this.isGuildAdmin(id)) {
      const guildMembership = this.getGuildMembershipById(id);
      guildMembership.permissions.push("guildAdmin");
      await this.updateGuildMembership(guildMembership);
      this.$q.notify({
        type: "positive",
        message:
          "Guild admin added to " + (await this.getMemberById(id)?.handle),
      });
    } else if (this.isGuildAdmin(id)) {
      const perm = this.getGuildMembershipById(id).permissions;
      for (var i = 0; i < perm.length; i++) {
        if (perm[i] == "guildAdmin") {
          perm.splice(i, 1);
        }
      }
      const guildMembership = this.getGuildMembershipById(id);
      guildMembership.permissions = perm;
      await this.updateGuildMembership(guildMembership);
      this.$q.notify({
        type: "positive",
        message:
          "Guild admin removed from " + (await this.getMemberById(id)?.handle),
      });
    }
  }
  async removeGuildAdmin(id) {
    if (!this.isGuildAdmin(id)) {
      const guildMembership = this.getGuildMembershipById(id);
      guildMembership.permissions.push("guildAdmin");
      await this.updateGuildMembership(guildMembership);
      this.$q.notify({
        type: "positive",
        message:
          "Guild admin added to  " + (await this.getMemberById(id)?.handle),
      });
    } else if (this.isGuildAdmin(id)) {
      const perm = this.getGuildMembershipById(id).permissions;
      for (var i = 0; i < perm.length; i++) {
        if (perm[i] == "guildAdmin") {
          perm.splice(i, 1);
        }
      }
      const guildMembership = this.getGuildMembershipById(id);
      guildMembership.permissions = perm;
      await this.updateGuildMembership(guildMembership);
      this.$q.notify({
        type: "positive",
        message:
          "Guild admin removed from  " + (await this.getMemberById(id)?.handle),
      });
    }
  }
  isGuildAdmin(id) {
    const perm = this.getGuildMembershipById(id).permissions;
    if (perm.find((e) => e == "guildAdmin")) {
      return true;
    }
    return false;
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
      await this.addGamePlay({ data: payload });
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
  async doSubmit() {
    try {
      await this.updateGuild({ data: this.getCurrentGuild });
      this.$q.notify({
        message: "Guild was updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating guild ", err);
      this.$q.notify({
        message:
          "There was an error updating guild. If this issue persists, contact support.",
        color: "negative",
      });
    }
  }

  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    await Promise.all([
      this.ensureGuild({ guild_id: this.guildId }),
      this.ensureAllQuests(),
      this.ensureAllRoles(),
      this.ensureMembersOfGuild({ guildId: this.guildId }),
    ]);
    this.member_id = this.memberId;
    await this.setCurrentGuild(this.guildId);
    this.availableRolesByMember = Object.fromEntries(
      this.getGuildMembers.map((m: Member) => [
        m.id,
        m.guild_member_available_role
          ?.filter((r: GuildMemberAvailableRole) => r.guild_id == this.guildId)
          .map((r: GuildMemberAvailableRole) => r.role_id),
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
        params: { guild_id: String(this.guildId) },
      });
    }
    this.ready = true;
  }
}
</script>
<style>
.guild-admin-card {
  width: 60%;
}

.quest-section {
  background-color: gainsboro;
  padding-bottom: 5em;
  padding-top: 1em;
}
.active-quest-card {
  background-color: white;
  width: 100%;
  margin-top: 1em;
}
.active-quest-header {
  text-decoration: underline;
  font-family: Arial, Helvetica, sans-serif;
  color: blue;
}
.guildAdmin-header {
  background-color: azure;
  padding: 0.5em;
  align-items: center;
}

.channel {
  margin-top: 1em;
}
.guild-section {
  background-color: seashell;
}
.guildAdmin-card {
  background-color: white;
  width: 50%;

  margin-left: 1em;
}
.guildAdmin-card-header {
  font-family: Arial, Helvetica, sans-serif;
}
.guilds-card {
  margin-bottom: 2em;
  margin-left: 1em;
  width: 40%;
}
.available-roles-card-header {
  font-family: Arial, Helvetica, sans-serif;
}

.available-roles-card {
  background-color: white;
  width: 80%;
}

.roles-card {
  background-color: white;
  width: 80%;
  margin-bottom: 1em;
}
.roles-card-header {
  font-family: Arial, Helvetica, sans-serif;
}
#members-handle {
  font-size: 13pt;
}
.guild-editor-description {
  font-family: Arial, Helvetica, sans-serif;
  margin-top: 0.5em;
  border: 1px solid black;
}
#update-button {
  background-color: #02a7e3;
  color: white;
  margin-bottom: 1em;
  margin-top: 0.5em;
  margin-left: 1em;
  font-family: Arial, Helvetica, sans-serif;
}
.guild-description-col {
  width: 60%;
  margin-bottom: 1em;
}

@media only screen and (max-width: 1300px) {
  .guild-admin-card {
    width: 70%;
  }
}
@media only screen and (max-width: 800px) {
  .guild-admin-card {
    width: 98%;
  }
}
@media only screen and (max-width: 1000px) {
  .guild-editor-description {
    width: 98%;
  }
  @media only screen and (max-width: 800px) {
    .guild-description-col {
      width: 98%;
    }
  }

  @media only screen and (max-width: 1000px) {
    .scoreboard {
      width: 98%;
    }
  }
  @media only screen and (max-width: 1000px) {
    .guildAdmin-card {
      width: 98%;
      margin-right: 1em;
    }
  }
  @media only screen and (max-width: 1000px) {
    .guilds-card {
      margin-bottom: 2em;
      width: 98%;
      margin-top: 1em;
      margin-right: 1em;
    }
  }
  @media only screen and (max-width: 1000px) {
    .roles-card {
      width: 95%;
    }
  }
  @media only screen and (max-width: 1000px) {
    .available-roles-card {
      width: 95%;
    }
  }
}
.admin-content-container {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
  border: 5px solid #ccc;
  max-height: 300px;
  overflow-y: auto;
}
.admin-content {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 5px 20px 0 rgb(151, 146, 146);
}
</style>
