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
          <h4 v-if="guild && currentGuild">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: String(currentGuild.id) },
              }"
              >{{ currentGuild.name }}
            </router-link>
          </h4>
          <q-tooltip>Click on guild name to goto guild</q-tooltip>
        </div>
        <div class="row justify-center">
          <div class="column">
            <q-card>
              <div class="admin-content-container">
                <q-editor
                  v-model="description"
                  class="admin-content guild-description-col"
                  :toolbar="[
                    ['bold', 'italic', 'underline', 'strike', 'undo', 'redo'],
                  ]"
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

        <div class="col-3" style="width: 50%"></div>
        <section class="quest-section">
          <div
            class="column items-center q-mt-md"
            v-if="potentialQuests && potentialQuests.length > 0"
          >
            <div class="col-4" style="width: 100%">
              <q-card q-ma-md>
                <quest-table :quests="potentialQuests" title="Potential Quests">
                  <template v-slot:default="slotProps">
                    <span v-if="findPlayOfGuild(slotProps.quest.game_play)">
                      <q-btn
                        v-if="
                          findPlayOfGuild(slotProps.quest.game_play)!.status ==
                          'invitation'
                        "
                        label="Invitation"
                        @click="doRegister(slotProps.quest.id)"
                        class="q-mr-md q-ml-md"
                      />
                      <span
                        v-else-if="
                          findPlayOfGuild(slotProps.quest.game_play)!.status ==
                          'request'
                        "
                      >
                        Waiting for response
                      </span>
                    </span>
                    <q-btn
                      v-else
                      data-test="register-quest-btn"
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
                  :key="quest!.id"
                  class="row justify-start"
                >
                  <h2 class="gt-md">{{ quest!.name }}</h2>
                  <br />
                  <h6 class="lt-md">{{ quest!.name }}</h6>

                  <q-tooltip max-width="25rem">{{
                    quest!.description
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
                router.push({
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
                v-if="member"
                class="q-pl-lg"
                style="width: 50%"
                :multiple="true"
                :model-value="getGuildAdmins"
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
                color="blue"
              >
              </q-select>
            </q-card>

            <guild-card
              class="guilds-card"
              :currentGuild="currentGuild"
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
                <div v-for="member in getGuildMembers" :key="member!.id">
                  <div class="row" :data-testid="`member-block-${member.handle}`">

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
                          roleAdded(member!.id, details.value);
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
                      :data-testid="`role-select-${member.id}`"
                      emit-value
                      map-options
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
                v-if="member"
                id="newRoleBtn"
                label="New Role"
                color="primary"
                @click="
                  router.push({
                    name: 'create_guild_role',
                    params: { guildId: String(guildId) },
                  })
                "
              />
              <div>
                <role-table :roles="roleStore.getRoles"></role-table>
              </div>
            </q-card>
          </div>
        </section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Imports
import { waitUserLoaded } from '../app-access';
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
  quest_status_type,
} from '../enums';
import {
  Quest,
  GamePlay,
  GuildMemberAvailableRole,
  GuildMembership,
  QuestData,
  PublicMember,
  Guild,
} from '../types';
import { computed, ref } from 'vue';
import roleTable from '../components/role-table.vue';
import guildCard from '../components/guild-card.vue';
import QuestTable from '../components/quest-table.vue';
import scoreboard from '../components/score-board.vue';
import memberHandle from '../components/member-handle.vue';
import { onBeforeMount } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useQuasar } from 'quasar';
import { useBaseStore } from '../stores/baseStore';
import { useRoute, useRouter } from 'vue-router';
import { useMembersStore } from '../stores/members';
import { useRoleStore } from '../stores/role';
import { useQuestStore } from '../stores/quests';
import { useMemberStore } from '../stores/member';
import { onBeforeRouteLeave } from 'vue-router';

// Stores
const guildStore = useGuildStore();
const membersStore = useMembersStore();
const baseStore = useBaseStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();
const memberStore = useMemberStore();

// Quasar
const $q = useQuasar();

// Routes
const router = useRouter();
const route = useRoute();

// Reactive variables
const guild = ref<Partial<Guild>>({
  name: '',
  handle: '',
  public: false,
  description: '',
  default_role_id: null,
});
const ready = ref(false);
const currentGuildId = ref<number | undefined>();
const availableRolesByMember = ref<{ [key: number]: number[] | undefined }>({});
const isAdmin = ref(false);

// Variables
let guildId: number | undefined = undefined;
const confirmedPlayQuestId: number[] = [];

// Computed Properties
const currentGuild = computed({
  get: () => guildStore.getCurrentGuild!,
  set: (value) => guildStore.setCurrentGuild(value.id),
});
const member = computed(() => memberStore.member);
const quest = computed(() => questStore.getQuests);
const description = computed<string>({
  get() {
    return currentGuild.value?.description ?? '';
  },
  set(value) {
    currentGuild.value.description = value;
  },
});

const activeQuests = computed((): Partial<QuestData[]> => {
  const active_quests = questStore.getQuests.filter((q: QuestData) => {
    if (typeof q.id === 'number')
      return (
        (q.status == quest_status_enum.ongoing ||
          q.status == quest_status_enum.paused ||
          q.status == quest_status_enum.registration) &&
        confirmedPlayQuestId.includes(q.id)
      );
  });
  if (active_quests && active_quests.length > 0) {
    return active_quests;
  } else {
    return [];
  }
});
const guildGamePlays = computed(() => {
  if (currentGuild.value && currentGuild.value.game_play?.length > 0) {
    const gamePlay: GamePlay[] = currentGuild.value.game_play.filter(
      (gp: GamePlay) => gp.status == registration_status_enum.confirmed,
    );
    return gamePlay;
  } else {
    return [];
  }
});
const potentialQuests = computed((): QuestData[] => {
  return quest.value.filter(
    (q: Quest) =>
      (q.status == quest_status_enum.registration ||
        q.status == quest_status_enum.ongoing) &&
      !confirmedPlayQuestIds.value.includes(q.id),
  );
});
const confirmedPlayQuestIds = computed((): number[] => {
  return (guildGamePlays.value || []).map((gp: GamePlay) => gp.quest_id);
});
const getGuildMembers = computed((): PublicMember[] => {
  return guildStore.getMembersOfCurrentGuild!;
});
const getGuildAdmins = computed((): PublicMember[] =>
  membersStore.getMembersByIds(
    (currentGuild.value?.guild_membership || [])
      .filter((gm: GuildMembership) =>
        gm.permissions.includes(permission_enum.guildAdmin),
      )
      .map((gm: GuildMembership) => gm.member_id),
  ),
);

const findPlayOfGuild = computed(() => (gamePlays: GamePlay[]) => {
  if (gamePlays) {
    return gamePlays.find(
      (gp: GamePlay) => gp.guild_id == currentGuildId.value,
    );
  } else return undefined;
});
// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  if (typeof route.params.guild_id === 'string') {
    guildId = Number.parseInt(route.params.guild_id);
  }
  currentGuildId.value = guildId!;
  await Promise.all([
    guildStore.setCurrentGuild(guildId!),
    guildStore.ensureGuild(guildId!, true),
    questStore.ensureAllQuests(),
    roleStore.ensureAllRoles(),
    membersStore.ensureMembersOfGuild({ guildId }),
  ]);
  currentGuild.value = guildStore.getGuildById(guildId!);
  availableRolesByMember.value = Object.fromEntries(
    guildStore.getMembersOfCurrentGuild!.map((m: PublicMember) => [
      m.id,
      m.guild_member_available_role
        ?.filter((r: GuildMemberAvailableRole) => r.guild_id == guildId)
        .map((r: GuildMemberAvailableRole) => r.role_id),
    ]),
  );
  if (typeof currentGuildId.value === 'number') {
    isAdmin.value = baseStore.hasPermission(
      permission_enum.guildAdmin,
      currentGuildId.value,
    );
    const canRegisterToQuest = baseStore.hasPermission(
      permission_enum.joinQuest,
      currentGuildId.value,
    );
    if (!canRegisterToQuest) {
      await router.push({
        name: 'guild',
        params: { guild_id: String(currentGuildId.value) },
      });
    }
  }
  ready.value = true;
});
onBeforeRouteLeave((to, from, next) => {
  guildStore.setCurrentGuild(0);
  questStore.setCurrentQuest(0);
  next();
});

// Functions
const doRegister = async (quest_Id: number) => {
  try {
    const questId = quest_Id;
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
    if (typeof guildId === 'number') {
      const payload: Partial<GamePlay> = {
        guild_id: guildId,
        quest_id: quest_Id,
      };
      await questStore.addGamePlay(payload);

      // ✅ Update availableRolesByMember here after registration
      await membersStore.ensureMembersOfGuild({ guildId });

      availableRolesByMember.value = Object.fromEntries(
        guildStore.getMembersOfCurrentGuild!.map((m: PublicMember) => [
          m.id,
          m.guild_member_available_role
            ?.filter((r: GuildMemberAvailableRole) => r.guild_id == guildId)
            .map((r: GuildMemberAvailableRole) => r.role_id),
        ]),
      );
    }

    $q.notify({
      type: 'positive',
      message: 'You have registered to Quest',
    });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: `${err}`,
    });
    console.log('error registering to quest: ', err);
  }
};
async function addGuildAdmin(member: PublicMember) {
  const id = member.id;
  const guildMembership = guildStore.getGuildMembershipById(id);
  if (guildMembership!.permissions.includes(permission_enum.guildAdmin)) {
    console.error(`adding admin permissions to ${id} who already has them`);
    return;
  }
  guildMembership!.permissions = [
    ...guildMembership!.permissions,
    permission_enum.guildAdmin,
  ];
  try {
    await guildStore.updateGuildMembership(guildMembership!);
    $q.notify({
      type: 'positive',
      message:
        'Guild admin added to ' +
        (membersStore.getMemberById(id)?.handle),
    });
  } catch (error) {
    guildMembership!.permissions.pop();
    $q.notify({
      type: 'negative',
      message: 'Could not add guild admin: ' + error.response.data.message,
    });
  }
}
async function removeGuildAdmin(member: PublicMember) {
  const id = member.id;

  const guildMembership = guildStore.getGuildMembershipById(id);
  const perm = guildMembership!.permissions;
  const loc = perm.indexOf(permission_enum.guildAdmin);
  if (loc < 0) {
    console.error(
      `Asking to remove admin permission from ${id} who is not an admin???`,
    );
    return;
  }
  perm.splice(loc, 1);
  guildMembership!.permissions = perm;
  try {
    await guildStore.updateGuildMembership(guildMembership!);
    $q.notify({
      type: 'positive',
      message:
        'Guild admin removed from  ' +
        (membersStore.getMemberById(id)?.handle),
    });
  } catch (error) {
    guildMembership!.permissions.push(permission_enum.guildAdmin);
    $q.notify({
      type: 'negative',
      message: 'Could not remove guild admin: ' + error.response.data.message,
    });
  }
}

/*
function isGuildAdmin(id: number) {
  return guildStore
    .getGuildMembershipById(id)
    ?.permissions.includes(permission_enum.guildAdmin);
}
*/

async function roleAdded(member_id: number, role_id: number) {
  const guild_id = guildId;
  if (guild_id)
    await guildStore.addGuildMemberAvailableRole({
      member_id,
      guild_id,
      role_id,
    });
}

async function roleRemoved(member_id: number, role_id: number) {
  const guild_id: number | undefined = guildId;
  if (typeof guild_id == 'number')
    await guildStore.deleteGuildMemberAvailableRole({
      member_id,
      guild_id,
      role_id,
    });
}

async function doSubmit() {
  try {
    if (currentGuild.value) await guildStore.updateGuild(currentGuild.value);
    $q.notify({
      message: 'Guild was updated successfully',
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in updating guild ', err);
    $q.notify({
      message:
        'There was an error updating guild. If this issue persists, contact support.',
      color: 'negative',
    });
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
RoleState,
