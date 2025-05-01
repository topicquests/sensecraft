<template>
  <q-card>
    <div class="row" v-if="title == 'Quests'">
      <div class="col-4">
        <q-select
          class="quest-status"
          v-model="questStatus"
          :options="questStatusOptions"
          hint="filter by status"
          clearable
        >
        </q-select>
      </div>
    </div>
    <q-table
      class="quest-table"
      :title="title"
      :rows="getFilteredQuests"
      :columns="columns"
      row-key="id"
    >
      <template v-slot:body-cell-info="props">
        <q-td :props="props">
          <div>
            <q-btn
              v-if="props.row.description"
              class="q-ml-xs"
              size="sm"
              :flat="true"
              icon="info"
              @click="openDialog(props.row)"
            />
            <q-dialog v-model="showDialog" persistent>
              <q-card class="quest-info-dialog">
                <q-card-section>
                  <div class="dialog-title">Quest Information</div>
                  <div class="quest-name">{{ selectedQuest?.name }}</div>
                </q-card-section>
                <q-card-section>
                  <div
                    class="quest-description"
                    v-html="selectedQuest?.description"
                  ></div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    flat
                    label="Close"
                    color="primary"
                    @click="closeDialog"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">{{ props.row.name }}</q-td>
      </template>
      <template v-slot:body-cell-time="props">
        <td>
          <quest-date-time-interval :quest="props.row" />
        </td>
      </template>
      <template v-slot:body-cell-lastMove="props">
        <td>
          <span :title="lastMoveFull(props.row)">{{
            lastMoveRel(props.row)
          }}</span>
        </td>
      </template>
      <template v-slot:body-cell-view="props">
        <td>
          <slot v-bind:quest="props.row">
            <span v-if="props.row.is_quest_member || baseStore.hasPermission(permission_enum.superadmin)">
              <router-link
                v-if="props.row.id"
                :to="{
                  name: 'quest_edit',
                  params: { quest_id: props.row.id },
                }"
              >
                Admin
              </router-link>
            </span>
            <span v-else-if="props.row.status == 'finished'">
              <router-link
                :to="{
                  name: 'conversation_column',
                  params: { quest_id: props.row.id },
                }"
              >
                View
              </router-link>
            </span>
            <span v-else-if="props.row.is_playing">
              <router-link
                :to="{
                  name: 'quest_page',
                  params: { quest_id: props.row.id },
                }"
              >
                Play
              </router-link>
            </span>
            <span
              v-else-if="
                props.row.my_confirmed_guild_count > 0 ||
                props.row.my_recruiting_guild_count > 0
              "
            >
              <!-- TODO: Register in-place -->
              <router-link
                :to="{
                  name: 'quest_page',
                  params: { quest_id: props.row.id },
                }"
              >
                Register to the game
              </router-link>
            </span>
            <span v-else-if="canAdminGuilds">
              <!-- TODO: Register in-place -->
              <router-link
                :to="{
                  name: 'quest_teams',
                  params: { quest_id: props.row.id },
                }"
              >
                Register your guilds
              </router-link>
            </span>
            <span v-else>
              <router-link
                :to="{
                  name: 'conversation_column',
                  params: { quest_id: props.row.id },
                }"
              >
                View
              </router-link>
            </span>
          </slot>
        </td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { useQuestStore } from '../stores/quests';
import { useMemberStore } from '../stores/member';
import { useBaseStore } from '../stores/baseStore';
import { QTableProps } from 'quasar';
import { permission_enum, quest_status_type } from '../enums';
import { GuildMembership, Quest, QuestData } from '../types';
import QuestDateTimeInterval from './quest-date-time-interval.vue';
import { computed, onBeforeMount, ref } from 'vue';

// Props
const QuestTableProps = defineProps<{
  quests: QuestData[];
  title: string;
}>();

// Table Columns
const columns: QTableProps['columns'] = [
  {
    name: 'info',
    align: 'left',
    required: true,
    label: 'description',
    field: (row) => row.name,
    classes: 'gt-md',
    headerClasses: 'gt-md',
  },
  {
    name: 'name',
    required: true,
    label: 'title',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
    classes: 'ellipsis',
  },
  {
    name: 'status',
    required: false,
    label: 'status',
    align: 'left',
    field: 'status',
    sortable: true,
  },
  {
    name: 'time',
    required: true,
    label: 'Time',
    align: 'left',
    field: (row) => refInterval(row),
    sortable: true,
  },
  {
    name: 'view',
    required: true,
    label: 'Action',
    align: 'left',
    field: 'actions',
    sortable: true,
  },
  {
    name: 'numGuilds',
    required: false,
    label: '#Guilds',
    align: 'left',
    field: 'confirmed_guild_count',
    sortable: true,
  },
  {
    name: 'numPlayers',
    required: false,
    label: '#Players',
    align: 'left',
    field: 'player_count',
    sortable: true,
  },
  {
    name: 'numMoves',
    required: false,
    label: '#Moves',
    align: 'left',
    field: 'node_count',
    sortable: true,
  },
  {
    name: 'lastMove',
    required: false,
    label: 'last move',
    align: 'left',
    field: 'last_node_published_at',
    sortable: true,
  },
];

// Stores
const questStore = useQuestStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore();

// Reactive Variables
const questStatus = ref<quest_status_type | string>();
const questStatusOptions = ref<quest_status_type[]>([]);
const selectedQuest = ref<QuestData | null>(null);
const showDialog = ref(false);

// Computed Properties
const getFilteredQuests = computed((): QuestData[] => {
  if (questStatus.value && questStatus.value != 'All') {
    return questStore.getQuestsByStatus(questStatus.value);
  } else {
    //questStatus.value = "All"
    return QuestTableProps.quests;
  }
});
const canAdminGuilds = computed((): boolean => {
  return (
    baseStore.hasPermission(permission_enum.joinQuest) ||
    (memberStore.getUser?.guild_membership || []).find(
      (gm: GuildMembership) => {
        const permissions = gm.permissions || [];
        return (
          (gm.status == 'confirmed' &&
            permissions.includes(permission_enum.joinQuest)) ||
          permissions.includes(permission_enum.guildAdmin)
        );
      },
    ) != undefined
  );
});

//Functions
function openDialog(row: QuestData) {
  selectedQuest.value = row;
  showDialog.value = true;
}

function closeDialog() {
  showDialog.value = false;
  selectedQuest.value = null;
}

function refInterval(row: QuestData) {
  const start: number = DateTime.fromISO(row.start).millisecond;
  const end: number = DateTime.fromISO(row.end).millisecond;
  const now = Date.now();
  const refTime = start > now ? start : end;
  return Math.abs(refTime - now);
}
function lastMoveRel(row: QuestData) {
  return row.last_node_published_at
    ? DateTime.fromISO(row.last_node_published_at).toRelative()
    : '';
}
function lastMoveFull(row: QuestData) {
  return row.last_node_published_at
    ? DateTime.fromISO(row.last_node_published_at).toLocaleString(
        DateTime.DATETIME_FULL,
      )
    : '';
}

// Lifecycle Hooks
onBeforeMount(async () => {
  questStatusOptions.value = QuestTableProps.quests.map(
    (quest: Quest) => quest.status,
  );
  questStatusOptions.value = questStatusOptions.value.filter(
    (item, index) => questStatusOptions.value.indexOf(item) === index,
  );
});
</script>

<style>
.dialog-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d35400; /* Warm color for the title */
  margin-bottom: 10px;
}

.quest-name {
  font-size: 1.2rem;
  font-weight: 500;
  color: #e67e22; /* Accent color for quest name */
}

.quest-description {
  font-size: 1rem;
  color: #5d4037; /* Rich brown for descriptive text */
  line-height: 1.5;
  white-space: pre-wrap; /* Preserve formatting for quest descriptions */
}

.q-btn {
  font-size: 0.9rem;
}

.q-card-actions {
  padding: 10px;
  border-top: 1px solid #e0e0e0; /* Separator for actions */
}
q-td {
  font-size: 30%;
}

.quest-table {
  background-color: ivory;
  border: 0.5em solid;
}

.quest-status {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  padding-left: 1em;
  margin-bottom: 1em;
  margin-top: 1em;
}

.tooltip {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  padding: 1em;
}

.quest-table thead {
  /* bg color is important for th; just specify one */
  background-color: rgb(126, 126, 54);
}
.quest-table td:nth-child(1) {
  max-width: 5px;
}
.quest-table tbody tr:nth-child(odd) {
  background-color: #d3cccc; /* Light gray for odd rows */
}
.quest-table tbody tr:nth-child(even) {
  background-color: #ffffff; /* White for even rows */
}

.quest-table td:nth-child(2) {
  max-width: 300px;
}

@media only screen and (max-width: 1000px) {
  .quest-table td:nth-child(2) {
    max-width: 200px;
    background-color: #f5f5dc;
    position: sticky;
    left: 0;
    z-index: 1;
  }
}
</style>
