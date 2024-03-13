<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="guild-admin-card q-mt-md q-pa-md">
        <div class="row justify-end" style="width: 92%">
          <member-handle></member-handle>
        </div>
        <div class="row justify-center" style="width: 100%">
          <div class="col-10 justify-center">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <h4 v-if="guildStore.getCurrentGuild">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: String(guildStore.getCurrentGuild.id) },
              }"
              >{{ guildStore.getCurrentGuild.name }}
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
                   v-model="guildStore.getCurrentGuild.description"
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
              v-bind:currentGuild="{ ...guildStore.getCurrentGuild }"
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
                      :options="roleStore.getRoles"
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

<script setup lang="ts">
import { userLoaded } from "../boot/userLoaded";
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
import Vue, { computed, ref } from "vue";
import CastingRoleEdit from "../components/casting_role_edit.vue";
import roleTable from "../components/role-table.vue";
import guildCard from "../components/guild-card.vue";
import QuestTable from "../components/quest-table.vue";
import scoreboard from "../components/score-board.vue";
import memberHandle from "../components/member-handle.vue";
import { onBeforeMount } from "vue";
import { useGuildStore } from "src/stores/guilds";
import { useQuasar } from "quasar";
import { useQuestStore } from "src/stores/quests";
import { useMemberStore } from "src/stores/member";
import { useRoleStore } from "src/stores/role";
import { useBaseStore } from "src/stores/baseStore";
import { useRouter } from "vue-router";

const guildStore = useGuildStore();
const questStore = useQuestStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore()
const roleStore = useRoleStore();
const $q = useQuasar();
const router = useRouter();
const ready = ref(false);
const currentGuildId!: number;
const member_id: number|null = null;
const questGamePlay: GamePlay[] = [];
const isAdmin = ref(false);
const label = "";
const guildId: number|null = null;
const currentQuestIdS = computed ({
  get: function () {
    return questStore.currentQuest;
  },
  set: function (value) {
      questStore.setCurrentQuest(value);
  },
});
function activeQuests() {
  const active_quests = questStore.getQuests.filter(
    (q: Quest) =>
    (q.status == quest_status_enum.ongoing ||
     q.status == quest_status_enum.paused ||
     q.status == quest_status_enum.registration) &&
    confirmedPlayQuestIds.includes(q.id));
      if (active_quests && active_quests.length > 0) {
          return active_quests;
        } else {
          return [];
        }
      },
    })
function pastQuests() {
  questStore.getQuests.filter(
    (q: Quest) =>
    (q.status == quest_status_enum.finished ||
     q.status == quest_status_enum.scoring) &&
      playQuestIds()
  );
}
function playQuestIds() {
  guildStore.getCurrentGuild.game_play.map((gp: GamePlay) => gp.quest_id);
}
function guildGamePlays() {
  if (guildStore.getCurrentGuild?.game_play?.length > 0) {
    const gamePlay = guildStore.getCurrentGuild.game_play.filter(
    (gp: GamePlay) => gp.status == registration_status_enum.confirmed
    );
    return gamePlay;
  } else {
    return [];
  }
}
function potentialQuests() {
  return questStore.getQuests.filter(
    (q: Quest) =>
    (q.status == quest_status_enum.registration ||
     q.status == quest_status_enum.ongoing) &&
    !confirmedPlayQuestIds()
    );
  }
function confirmedPlayQuestIds(){
    return (guildGamePlays || []).map((gp: GamePlay) => gp.quest_id);
},
function getGuildMembers() {
  if (guildStore.getCurrentGuild) {
    return guildStore.getMembersOfCurrentGuild;
  }
  return [];
}

 
 

  // declare state bindings for TypeScript
  member!: MemberState["member"];
  memberId!: number;
 
  currentQuestId!: QuestsState["currentQuest"];
  allRoles!: RoleState["role"];
  currentQuestIdS!: number;
 
  function getCastingRole(memberId: number, questId: number) {
    const roles: CastingRole[] = this.castingRolesPerQuest(memberId, questId);
    const rolesName = roles.map((cr) => this.allRoles[cr.role_id].name);
    return rolesName;
  }

  async function addGuildAdmin(id) {
    if (!isGuildAdmin(id)) {
      const guildMembership = guildStore.getGuildMembershipById(id);
      if(guildMembership) {
        guildMembership.permissions.push("guildAdmin");
      }
      await guildStore.updateGuildMembership(guildMembership);
      $q.notify({
        type: "positive",
        message:
          "Guild admin added to " + (await this.getMemberById(id)?.handle),
      });
    } else if (isGuildAdmin(id)) {
      const perm = guildStore.getGuildMembershipById(id).permissions;
      for (var i = 0; i < perm.length; i++) {
        if (perm[i] == "guildAdmin") {
          perm.splice(i, 1);
        }
      }
      const guildMembership = guildStore.getGuildMembershipById(id);
      if(guildMembership) {
      guildMembership.permissions = perm;
      await guildStore.updateGuildMembership(guildMembership);
      $q.notify({
        type: "positive",
        message:
          "Guild admin removed from " + (await memberStore.getMemberById(id)?.handle),
      });
    }
  }
  async function removeGuildAdmin(id) {
    if (!isGuildAdmin(id)) {
      const guildMembership = guildStore.getGuildMembershipById(id);
      if(guildMembership) {
        guildMembership.permissions.push("guildAdmin");
        await guildStore.updateGuildMembership(guildMembership);
        $q.notify({
          type: "positive",
          message:
          "Guild admin added to  " + (await memberStore.getMemberById(id)?.handle),
        });
      } else if (isGuildAdmin(id) && guildStore.getGuildMembershipById(id)) {
          const perm = guildStore.getGuildMembershipById(id).permissions;
          for (var i = 0; i < perm.length; i++) {
            if (perm[i] == "guildAdmin") {
            perm.splice(i, 1);
          }
      }
      const guildMembership = guildStore.getGuildMembershipById(id);
        guildMembership.permissions = perm;
        await guildStore.updateGuildMembership(guildMembership);
        $q.notify({
        type: "positive",
        message:
          "Guild admin removed from  " + (await this.getMemberById(id)?.handle),
      });
    }
  }
  function isGuildAdmin(id) {
    const perm = guildStore.getGuildMembershipById(id).permissions;
    if (perm.find((e) => e == "guildAdmin")) {
      return true;
    }
    return false;
  }
  async function doRegister(questId: number) {
    try {
      questId = questId;
      const regQuest = questStore.getQuestById(questId);
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
        guild_id: currentGuildId,
        quest_id: questId,
      };
      await questStore.addGamePlay({ data: payload });
      $q.notify({
        type: "positive",
        message: "You have registered to Quest ",
      });
    } catch (err) {
      $q.notify({
        type: "negative",
        message: `${err}`,
      });
      console.log("error registering to quest: ", err);
    }
  }
  function findPlayOfGuild(gamePlays) {
    if (gamePlays) {
      return gamePlays.find(
        (gp: GamePlay) => gp.guild_id == currentGuildId
      );
    }
  }

  function playingAsGuildId(member_id) {
    return this.castingInQuest(null, member_id)?.guild_id;
  }

  async function roleAdded(member_id, role_id) {
    const guild_id = this.guildId;
    await guildStore.addGuildMemberAvailableRole({
      data: { member_id, guild_id, role_id },
    });
  }

  async function roleRemoved(member_id: number, role_id: number) {
    const guild_id: number = this.guildId;
    await this.deleteGuildMemberAvailableRole({
      params: { member_id, guild_id, role_id },
      data: {},
    });
  }
  async function castingRoleAdded(member_id: number, role_id: number) {
    const guild_id = guildId;
    const quest_id: number = this.currentQuestId;
    await this.addCastingRole({
      data: { member_id, guild_id, role_id, quest_id },
    });
  }

  async function castingRoleRemoved(member_id: number, role_id: number) {
    const guild_id: number = this.guildId;
    const quest_id: number = currentQuestId;
    await this.deleteCastingRole({
      params: { member_id, role_id, guild_id, quest_id },
      data: {},
    });
  }
  async function doSubmit() {
    try {
      await guildStore.updateGuild({ data: guildStore.getCurrentGuild });
      $q.notify({
        message: "Guild was updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating guild ", err);
      $q.notify({
        message:
          "There was an error updating guild. If this issue persists, contact support.",
        color: "negative",
      });
    }
  }

  onBeforeMount(async () {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await userLoaded;
    await Promise.all([
      guildStore.ensureGuild({ guild_id: this.guildId }),
      questStore.ensureAllQuests(),
      this.ensureAllRoles(),
      this.ensureMembersOfGuild({ guildId: this.guildId }),
    ]);
    this.member_id = this.memberId;
    await guildStore.setCurrentGuild(this.guildId);
    this.availableRolesByMember = Object.fromEntries(
      this.getGuildMembers.map((m: Member) => [
        m.id,
        m.guild_member_available_role
          ?.filter((r: GuildMemberAvailableRole) => r.guild_id == this.guildId)
          .map((r: GuildMemberAvailableRole) => r.role_id),
      ])
    );
    isAdmin.value = baseStore.hasPermission(
      permission_enum.guildAdmin,
      currentGuildId
    );
    const canRegisterToQuest = baseStore.hasPermission(
      permission_enum.joinQuest,
      currentGuildId
    );
    if (!canRegisterToQuest) {
      router.push({
        name: "guild",
        params: { guild_id: String(this.guildId) },
      });
    }
    ready.value = true;
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
