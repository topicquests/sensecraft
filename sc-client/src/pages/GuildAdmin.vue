<template>
  <q-page class="bg-secondary q-pa-md" v-if="ready">
    <div class="row justify-center">
      <q-card class="q-pa-lg guild-admin-card">

        <!-- Guild Header -->
        <q-card-section class="row justify-between items-center">
          <h4 v-if="guild && currentGuild" class="q-mt-none q-mb-none">
            <router-link
              :to="{ name: 'guild', params: { guild_id: String(currentGuild.id) } }"
              class="text-primary"
            >
              {{ currentGuild.name }}
            </router-link>
          </h4>
          <member-handle />
        </q-card-section>
        <q-separator />

        <!-- Description Editor -->
        <q-card-section>
          <div class="text-h6 q-mb-sm">Guild Description</div>
          <q-editor
            v-model="description"
            class="q-mb-md"
            :toolbar="[['bold','italic','underline','strike','undo','redo']]"
          />
          <q-btn
            id="update-button"
            color="primary"
            icon="mdi-content-save"
            label="Update"
            @click="doSubmit"
          />
        </q-card-section>

        <!-- Quests Section -->
        <q-card-section class="quest-section">
          <div class="text-h6 q-mb-md">Quests</div>

          <!-- Potential Quests -->
          <div v-if="potentialQuests.length">
            <quest-table :quests="potentialQuests" title="Potential Quests">
              <template v-slot:default="slotProps">
                <q-btn
                  v-if="findPlayOfGuild(slotProps.quest.game_play)?.status === 'invitation'"
                  label="Invitation"
                  color="secondary"
                  icon="mdi-email"
                  @click="doRegister(slotProps.quest.id)"
                />
                <span
                  v-else-if="findPlayOfGuild(slotProps.quest.game_play)?.status === 'request'"
                  class="text-grey"
                >
                  Waiting for response
                </span>
                <q-btn
                  v-else
                  data-test="register-quest-btn"
                  label="Register"
                  color="primary"
                  icon="mdi-plus"
                  @click="doRegister(slotProps.quest.id)"
                />
              </template>
            </quest-table>
          </div>
          <div v-else class="text-center q-pa-md">
            <q-icon name="mdi-alert" size="lg" color="grey" />
            <div class="text-subtitle1">No quests you can join</div>
          </div>

          <!-- Active Quests -->
          <div v-if="activeQuests.length" class="q-mt-lg">
            <div class="text-h6 q-mb-sm">Registered Quests</div>
            <q-list bordered separator>
              <q-item v-for="quest in activeQuests" :key="quest!.id">
                <q-item-section>
                  <q-item-label>{{ quest!.name }}</q-item-label>
                  <q-item-label caption>{{ quest!.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <!-- Guild Channels -->
        <q-card-section class="guild-section">
          <div class="text-h6 q-mb-sm">Guild Channels</div>
          <q-btn
            color="primary"
            icon="mdi-forum"
            label="Create Guild Channel"
            @click="router.push({ name: 'guild_channel_list', params: { guild_id: String(guildId) } })"
          />
        </q-card-section>

        <!-- Guild Admins -->
        <q-card-section>
          <div class="text-h6 q-mb-sm">Guild Admins</div>
          <q-select
            v-if="member"
            v-model="getGuildAdmins"
            multiple
            use-chips
            filled
            label="Select admins"
            :options="getGuildMembers"
            option-label="handle"
            option-value="id"
            color="primary"
            @add="details => addGuildAdmin(details.value)"
            @remove="details => removeGuildAdmin(details.value)"
          />
        </q-card-section>

        <!-- Guild Info & Roles -->
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Guild Info -->
            <div class="col-12 col-md-6">
              <guild-card :currentGuild="currentGuild" :showDescription="false" />
            </div>

            <!-- Member Roles -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Members Available Roles</div>
                  <div class="text-caption text-grey">
                    Set available roles for each member.
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div v-for="member in getGuildMembers" :key="member.id" class="q-mb-md">
                    <div class="text-subtitle2">{{ member.handle }}</div>
                    <q-select
                      v-model="availableRolesByMember[member.id]"
                      multiple
                      use-chips
                      dense
                      filled
                      :options="roleStore.getRoles"
                      option-label="name"
                      option-value="id"
                      emit-value
                      map-options
                      @add="details => roleAdded(member.id, details.value)"
                      @remove="details => roleRemoved(member.id, details.value)"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- Roles Section -->
        <q-card-section>
          <div class="text-h6 q-mb-sm">Roles</div>
          <div class="text-caption text-grey q-mb-md">
            System roles and guild-specific roles. Guild admins can create new ones.
          </div>
          <q-btn
            v-if="member"
            id="newRoleBtn"
            label="New Role"
            color="primary"
            icon="mdi-plus"
            class="q-mb-md"
            @click="router.push({ name: 'create_guild_role', params: { guildId: String(guildId) } })"
          />
          <role-table :roles="roleStore.getRoles" />
        </q-card-section>

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
  width:100%;
  max-width: 600px;
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