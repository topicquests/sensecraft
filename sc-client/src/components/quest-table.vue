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
      :rows="getFilteredQuests()"
      :columns="columns"
      row-key="id"
    >
      <template v-slot:body-cell-info="props">
        <q-td :props="props">
          <div>
            <q-btn icon="info" dense flat size="sm"
              ><q-tooltip max-width="25rem"
                ><div v-html="props.row.description" class="tooltip"></div>
              </q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">{{ props.row.name }}</q-td>
      </template>

      <template v-slot:body-cell-time="props">
        <td>
          <quest-date-time-interval v-bind:quest="props.row" />
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
            <span v-if="props.row.is_quest_member">
              <router-link
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
                  name: 'quest_page',
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
            <span v-else-if="canAdminGuilds()">
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
                  name: 'quest_page',
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
import { useQuestStore } from 'src/stores/quests';
import { useMemberStore } from 'src/stores/member';
import { useBaseStore } from 'src/stores/baseStore';
import type { QTable } from 'quasar';
import { QTableProps } from 'quasar';
import {
  permission_enum,
  quest_status_enum,
  quest_status_type,
} from '../enums';
import { GuildMembership, QuestData, Member } from '../types';
import QuestDateTimeInterval from './quest-date-time-interval.vue';
import { onBeforeMount } from 'vue';

const QuestTableProps = defineProps<{
  quests: QuestData[];
  title: string;
}>();

const questStore = useQuestStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore();
let questStatus = 'All';
let questStatusOptions: quest_status_type[];

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

function refInterval(row: QuestData) {
  const start: number = DateTime.fromISO(row.start).millisecond;
  const end: number = DateTime.fromISO(row.end).millisecond;
  const now = Date.now();
  const refTime = start > now ? start : end;
  return Math.abs(refTime - now);
}
function getFilteredQuests(): Partial<QuestData[]> {
  if (questStatus && questStatus != 'All') {
    return questStore.getQuestsByStatus(questStatus);
  } else {
    console.log(
      'Filtered quests',
      questStore.getQuestsByStatus(quest_status_enum.finished),
    );
    questStatus = 'All';
    return questStore.getQuestsByStatus(quest_status_enum.finished);
  }
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

function canAdminGuilds(): boolean {
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
}
onBeforeMount(() => {
  questStatusOptions = QuestTableProps.quests.map(
    (quest: QuestData) => quest.status,
  );
  questStatusOptions = questStatusOptions.filter(
    (item, index) => questStatusOptions.indexOf(item) === index,
  );
});
</script>

<style>
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

.quest-table thead tr:first-child th:first-child {
  /* bg color is important for th; just specify one */
  background-color: ivory;
}

.quest-table td:nth-child(1) {
  max-width: 5px;
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
