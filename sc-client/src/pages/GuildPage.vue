<template>
  <q-page class="bg-secondary guild-page" v-if="ready && currentGuildId">
    <div class="row justify-center">
      <q-card class="guild-card q-mt-md q-pa-md">
        <div class="col-12 justify-center">
          <q-card class="q-mt-md q-pa-md" style="background-color: transparent">
            <div class="row justify-end" style="width: 92%">
              <member-handle></member-handle>
            </div>
            <q-btn
            fab
            icon="help"
            color="blue-10"
            class="fixed-top-right q-mt-xl q-mr-md"
            style="top: 50px; z-index: 10;"
            @click="showDialog = true"
          >
            <q-tooltip max-width="25rem">
              Help on guild page
            </q-tooltip>
          </q-btn>
          <guildpage-instructions v-model="showDialog" />
            <div class="row justify-center" style="width: 100%">
              <div class="col-10 justify-center">
                <scoreboard></scoreboard>
              </div>
            </div>
            <div class="row justify-center">
              <div class="col-10 justify-center">
                <guild-header class="guild-header"></guild-header>
              </div>
            </div>
            <guild-description></guild-description>
            <div class="row">
              <div class="col-12 items-center">
                <div style="width: 100%">
                  <q-card
                    class="bg-secondary q-mb-md q-pb-sm"
                    style="width: 100%"
                  >
                    <div class="row text-center">
                      <div class="col-12">
                        <h2 class="q-mt-md q-mb-md">Registered Quests</h2>
                      </div>
                    </div>
                    <active-quest
                      :isMember="isMember"
                      :guildId="guildId"
                      :questId="currentQuestId"
                      :activeQuests="activeQuests"
                    >
                    </active-quest>
                  </q-card>
                </div>
              </div>
            </div>
            <div class="row">
              <div v-if="currentQuest && playingQuestInGuild" class="col-12">
                <castingRoleEdit
                  v-if="
                    currentQuest?.status !== 'ongoing' &&
                    availableRoles?.length &&
                    member?.id
                  "
                  :availableRoles="availableRoles"
                  :castingRoles="castingRoles || []"
                  :guildId="guildId ?? 0"
                  :questId="currentQuestId ?? 0"
                  :memberId="member?.id ?? null"
                  v-on:castingRoleAdd="castingRoleAdded"
                  v-on:castingRoleRemove="castingRoleRemoved"
                />
              </div>
            </div>
            <div class="row justify-center">
              <div class="col-12 q-mb-md q-mt-md">
                <guild-members
                  v-if="currentGuild"
                  :guild="currentGuild!"
                  :quest="currentQuest"
                  :members="getGuildMembers"
                />
              </div>
            </div>
            <div class="row justify-centetr">
              <div
                class="column items-center"
                style="width: 100%"
                v-if="pastQuests.length > 0"
              >
                <q-card style="width: 100%">
                  <q-table
                    title="Past Quests"
                    :rows="pastQuests"
                    :columns="columns"
                    row-key="desc"
                    id="quest_table"
                    style="width: 100%"
                  >
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="desc" :props="props">
                          {{ props.row.name }}</q-td
                        >
                        <q-td key="handle" :props="props">{{
                          props.row.handle
                        }}</q-td>
                        <q-td key="status" :props="props">{{
                          props.row.status
                        }}</q-td>
                        <q-td key="end" :props="props">{{
                          props.row.end
                        }}</q-td>
                        <q-td key="questNodeId" auto-width :props="props">
                          <router-link
                            :to="{
                              name: 'quest_page',
                              params: { quest_id: props.row.id },
                            }"
                            >Enter</router-link
                          > </q-td
                        >admin
                      </q-tr>
                    </template>
                  </q-table>
                </q-card>
              </div>
            </div>
          </q-card>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Imports
import scoreboard from '../components/score-board.vue';
import memberHandle from '../components/member-handle.vue';
import guildpageInstructions from 'src/components/guildpage-instructions.vue';
import guildHeader from '../components/guild-header.vue';
import guildDescription from '../components/guild-description.vue';
import activeQuest from '../components/active-quests.vue';
import { waitUserLoaded } from '../app-access';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
} from '../enums';
import {
  Quest,
  GamePlay,
  Casting,
  Role,
  PublicMember,
  QuestData,
} from '../types';
import { computed, ref, watch } from 'vue';
import castingRoleEdit from '../components/casting_role_edit.vue';
import guildMembers from '../components/guild-members.vue';
import '../css/app.scss';
import { QTableProps } from 'quasar';
import { onBeforeMount } from 'vue';
import { useBaseStore } from '../stores/baseStore';
import { useMemberStore } from '../stores/member';
import { useMembersStore } from '../stores/members';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useRoleStore } from '../stores/role';
import { useChannelStore } from '../stores/channel';
import { useConversationStore } from '../stores/conversation';
import { storeToRefs } from 'pinia';
import { useReadStatusStore } from '../stores/readStatus';

// Route
const route = useRoute();

// Stores
const baseStore = useBaseStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const membersStore = useMembersStore();
const questStore = useQuestStore();
const roleStore = useRoleStore();
const channelStore = useChannelStore();
const readStatusStore = useReadStatusStore();
const conversationStore = useConversationStore();

//Reactive Variables
const guildId = ref<number | undefined>();
const ready = ref(false);
const { member } = storeToRefs(memberStore);
const castingRoles = ref<Role[]>([]);
const memberPlaysQuestInThisGuild = ref(false);
const showDialog = ref(false);

//Non Reactive Variables
let guildGamePlays: GamePlay[] = [];
let pastQuests: Quest[] = [];
const activeQuests = ref<QuestData[]>([]);

//Table Columns
const columns: QTableProps['columns'] = [
  {
    name: 'desc',
    required: true,
    label: 'Quest',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'status',
    required: false,
    label: 'Handle',
    align: 'left',
    field: 'status',
    sortable: true,
  },
  {
    name: 'handle',
    required: false,
    label: 'Status',
    align: 'left',
    field: 'handle',
    sortable: true,
  },
  {
    name: 'start',
    required: false,
    label: 'Start Date',
    align: 'left',
    field: 'start',
    sortable: true,
  },
  {
    name: 'questNodeId',
    required: false,
    label: 'Action',
    align: 'left',
    field: 'id',
    sortable: true,
  },
];

//Computed Properties
const allRoles = computed(() => roleStore.role);
const currentQuestId = computed(() => questStore.currentQuest);
const currentGuild = computed(() => guildStore.getCurrentGuild);
const currentQuest = computed(() => questStore.getCurrentQuest);
const currentGuildId = computed<number>({
  get: () => {
    return guildStore.currentGuild;
  },
  set: (value) => {
    return value;
  },
});
const isMember = computed<boolean>({
  get: () => {
    return !!guildStore.isGuildMember(currentGuild.value?.id);
  },
  set: (value) => {
    return value;
  },
});
const playingQuestInGuild = computed(() => {
  if (currentGuild.value) {
    return questStore.isPlayingQuestInGuild(
      currentQuest.value.id,
      currentGuild.value.id,
    );
  }
  return false;
});

const availableRoles = computed<Role[]>(() => {
  if (!member?.value?.id || !guildId.value) {
    return [];
  }
  return (
    membersStore
      .getAvailableRolesForMemberAndGuild(member.value.id, guildId.value)
      ?.map((cr) => allRoles.value?.[cr.role_id] || null)
      ?.filter(Boolean) || []
  );
});

const getGuildMembers = computed((): PublicMember[] | undefined => {
  if (currentGuild.value) {
    return guildStore.getMembersOfCurrentGuild;
  }
  return [];
});
const canRegisterToQuest = computed(() =>
  baseStore.hasPermission(permission_enum.joinQuest, currentGuildId.value),
);

// Watches
watch(
  currentQuestId,
  async() => {
    if (currentQuestId.value) {
      getCastingRoles();
      await initializeQuest();
      await readStatusStore.ensureGuildUnreadChannels();
    }
  },
  { immediate: true },
);
watch(
  member,
   (newVal) => {
    if (newVal) {
      getCastingRoles();
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
//Lifecycle Hooks
onBeforeMount(async () => {
  await initialize();
});
onBeforeRouteLeave((to, from, next) => {
  guildStore.setCurrentGuild(undefined);
  questStore.setCurrentQuest(undefined);
  next();
});

// Functions
 function getCastingRoles() {
  if (member.value && currentQuest.value) {
    const castingRolesData =
      (membersStore.castingRolesPerQuest(
        member.value.id,
        currentQuest.value?.id,
      )) || [];
    castingRoles.value = castingRolesData.map(
      (cr) => allRoles.value[cr.role_id],
    );
  }
}

function findPlayOfGuild(
  gamePlays: GamePlay[] | undefined,
): Partial<GamePlay | undefined> {
  if (gamePlays)
    return gamePlays.find(
      (gp: GamePlay) => gp.guild_id == guildStore.currentGuild,
    );
  return undefined;
}
function checkPermissions():boolean {
  if (typeof guildStore.currentGuild === 'number') {
    isMember.value = !!guildStore.isGuildMember(guildStore.currentGuild);
    return canRegisterToQuest.value;
  }
  return false;
}

async function castingRoleAdded(role_id: number) {
  const guild_id = guildId.value;
  const quest_id: number | undefined = questStore.currentQuest;
  await questStore.addCastingRole({
    member_id: member.value.id,
    role_id,
    guild_id: guild_id,
    quest_id,
  });
}
async function castingRoleRemoved(role_id: number) {
  const guild_id: number | undefined = guildId.value;
  const quest_id: number | undefined = questStore.currentQuest;
  const member_id = member.value.id;
  if (!member || !member.value?.id) {
    return [];
  }
  await questStore.deleteCastingRole(member_id, guild_id, role_id, quest_id);
}
async function initialize() {
  await waitUserLoaded();
  if (typeof route.params.guild_id === 'string') {
    guildId.value = Number.parseInt(route.params.guild_id);
  }
  const guild_id = guildId.value;
  await Promise.all([
    questStore.ensureAllQuests(),
    roleStore.ensureAllRoles(),
    channelStore.ensureChannels(guild_id),
    membersStore.ensureMembersOfGuild({ guildId: guild_id }),
  ]);
  guildStore.setCurrentGuild(guild_id);
  if (isMember.value) {
    channelStore.setCurrentGuild(guild_id);
  }
  await readStatusStore.ensureGuildUnreadChannels()
  await initializeStage2();
  ready.value = true;
}
async function initializeStage2() {
  checkPermissions();
  const playQuestIds = currentGuild.value.game_play.map(
    (gp: GamePlay) => gp.quest_id,
  );
  guildGamePlays = currentGuild.value.game_play.filter(
    (gp: GamePlay) => gp.status == registration_status_enum.confirmed,
  );
  const confirmedPlayQuestIds = (guildGamePlays || []).map(
    (gp: GamePlay) => gp.quest_id,
  );
  pastQuests = questStore.getQuests.filter(
    (q: Quest) =>
      (q.status == quest_status_enum.finished ||
        q.status == quest_status_enum.scoring) &&
      playQuestIds.includes(q.id),
  );
  activeQuests.value = questStore.getQuests.filter(
    (q: QuestData) =>
      (q.status == quest_status_enum.ongoing ||
        q.status == quest_status_enum.paused ||
        q.status == quest_status_enum.registration) &&
      confirmedPlayQuestIds.includes(q.id),
  );
  if (guildGamePlays.length > 0) {
    await initializeQuest();
  }
}
async function initializeQuest() {
  if (currentQuest.value) {
    const creatorId = currentQuest.value.creator;
    if (!creatorId) await membersStore.ensureMemberById(creatorId);
    let quest_id: number | undefined = questStore.currentQuest;
    if (typeof quest_id === 'number')
      await guildStore.ensureGuildsPlayingQuest({ quest_id });
    if (
      quest_id &&
      !guildGamePlays.find((gp: GamePlay) => gp.quest_id == quest_id)
    ) {
      quest_id = undefined;
    }
    const castingList = currentQuest.value.casting;
    if (!castingList) {
      console.error('currentQuest.value.casting is undefined');
      return;
    }

    const questCasting = castingList.find(
      (ct: Casting) => ct.member_id == member.value?.id,
    );
    if (questCasting) {
      if (questCasting.guild_id == currentGuildId.value) {
        memberPlaysQuestInThisGuild.value = true;
      }
    }

    const gamePlayData = currentQuest.value.game_play;
    if (!gamePlayData) {
      console.error('currentQuest.value.game_play is undefined');
      return;
    }
    const gamePlay: Partial<GamePlay> | undefined =
      findPlayOfGuild(gamePlayData);
    let node_id = gamePlay?.focus_node_id;
    if (!node_id) {
      await conversationStore.ensureRootNode(questStore.currentQuest);
      node_id = conversationStore.conversationRoot?.id;
    }
    if (node_id && typeof currentGuildId.value === 'number') {
      await conversationStore.ensureConversationNeighbourhood(
        node_id,
        currentGuildId.value,
      );
    } else {
      // ill-constructed quest
      conversationStore.resetConversation();
    }
    return 'success';
  }
}
</script>

<style lang="scss">
.guild-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.guild-description-col {
  width: 100%;
}

.guild-card {
  width: 60%;
  background-color: transparent;
}
.active-quest-header {
  text-decoration: underline;
  font-family: Arial, Helvetica, sans-serif;
  color: $primary;
}
.scoreboard-guild-header-container {
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.guild-header {
  width: 100%;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  background-color: azure;
  align-self: flex-end;
}
guild-name {
  text-align: center;
  font-size: 40px;
  background-color: azure;
}
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}
.card-header {
  text-align: center;
  color: blue;
  text-decoration: underline;
  font-size: 20px;
  padding-bottom: sm;
}
#radio {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
}
#radio-btn {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
}
#node_card {
  border: 3px solid black;
  font-size: 10pt;
  color: darkblue;
  height: 400px;
  background-color: #caf0f8;
}
#guild-description {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
}
@media only screen and (max-width: 1300px) {
  .guild-card {
    width: 70%;
    background-color: transparent;
  }
}
@media only screen and (max-width: 800px) {
  .guild-card {
    width: 98%;
    background-color: transparent;
  }
}
@media only screen and (max-width: 800px) {
  .guild-description-col {
    width: 98%;
  }
}
@media only screen and (max-width: 800px) {
  .casting-role {
    width: 98%;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
.content-container {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
  border: 50px solid #ccc;
  max-height: 300px;
  overflow-y: auto;
}
.content {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
}
</style>
