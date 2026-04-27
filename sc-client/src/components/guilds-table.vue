<template>
  <div>
    <q-card>
      <q-table
        class="guilds-table q-mt-xl"
        :title="title"
        :rows="guildData"
        :columns="columns"
        style="text-align: left"
        row-key="id"
        :selection="selectable ? 'single' : 'none'"
        :selected.sync="selectedGuild"
        :selected-rows-label="() => ''"
        v-on:selection="selectionChanged"
      >
        <template v-slot:body-cell-info="props">
          <q-td :props="props">
            <div>
              <q-btn
                v-if="props.row.description"
                class="q-ml-xs"
                size="md"
                :flat="true"
                icon="info"
                color="info"
                @click="openDialog(props.row)"
              />
              <q-dialog v-model="showDialog" persistent>
                <q-card class="guild-info-dialog">
                  <q-card-section>
                    <div class="dialog-title">Guild Information</div>
                    <div class="guild-name">{{ selectedGuildRow?.name }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div
                      class="guild-description"
                      v-html="selectedGuildRow?.description"
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

        <template v-slot:body-cell-actions="props">
          <td>
            <slot v-bind:guild="props.row">
              <router-link
                :to="{
                  name: 'guild',
                  params: { guild_id: props.row.id },
                }"
              >
                <span v-if="false">
                  <!-- my guild is playing at least a game with me -->
                  Playing
                  <!-- link to guild is already there. -->
                </span>
                <span v-else-if="0">
                  <!-- my guild registering for a game -->
                  Recruiting
                  <!-- link to guild is already there. -->
                </span>
                <span v-else-if="''">
                  <!-- a guild registering for a game, I'm not in any guild -->
                  Joinable
                  <!-- link to guild is already there. -->
                </span>
                <span v-else>View</span>
              </router-link>
              <router-link
                v-if="
                  props.row &&
                  props.row.id &&
                  hasGuildAdminPermission(props.row.id)
                "
                :to="{
                  name: 'guild_admin',
                  params: { guild_id: props.row.id },
                }"
              >
                / Admin
              </router-link>
            </slot>
          </td>
        </template>
        <template v-slot:body-cell-status="props">
          <td>
            <guilds-playing-indicator
              v-if="showPlayers"
              :quest="currentQuest!"
              :playing="questStore.isPlayingQuestAsGuildId() == props.row.id"
              :guild="props.row"
            />
            <guilds-membership-indicator v-else v-bind:guild="props.row" />
          </td>
        </template>
        <template v-slot:body-cell-lastMove="props">
          <td>
            <span :title="lastMoveFull(props.row)">{{
              lastMoveRel(props.row)
            }}</span>
          </td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { QTable, QTableProps } from 'quasar';
import { Guild, GuildData, Casting } from '../types';
import GuildsMembershipIndicator from './guilds-membership-indicator.vue';
import GuildsPlayingIndicator from './guilds-playing-indicator.vue';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useBaseStore } from '../stores/baseStore';
import { computed, onBeforeMount, ref } from 'vue';
import { permission_enum } from '../enums';
import { useMemberStore } from '../stores/member';

interface GuildRow extends GuildData {
  score?: number;
  status_order?: number;
  numPlayers?: number;
}

// Props
const GuildsTableProp = defineProps<{
  title?: string;
  guilds: GuildData[] | undefined;
  scores?: object;
  quest?: object;
  showPlayers?: boolean;
  selectable?: boolean;
  extra_columns?: [];
}>();

// Stores
const questStore = useQuestStore();
const guildStore = useGuildStore();
const baseStore = useBaseStore();
const memberStore = useMemberStore();

// Non Reactive Variables
const extra = GuildsTableProp.extra_columns || [];

// Reactive Variables
const selectedGuild = ref<GuildRow[]>([]);
const selectedGuildRow = ref<GuildData | null>(null);
const showDialog = ref(false);

// Columns
const columns: QTableProps['columns'] = [
  {
    name: 'info',
    required: true,
    label: 'description',
    align: 'left',
    classes: 'gt-md',
    field: 'info',
    headerClasses: 'gt-md',
  },
  {
    name: 'name',
    required: true,
    label: 'Guild',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'status',
    required: false,
    label: 'Status',
    align: 'left',
    field: 'status_order',
    sortable: true,
  },
  {
    name: 'actions',
    required: true,
    label: 'Actions',
    align: 'left',
    field: 'actions',
    sortable: true,
  },
  {
    name: 'numPlayers',
    required: false,
    label: GuildsTableProp.showPlayers ? 'Players' : 'Members',
    align: 'left',
    field: 'member_count',
    sortable: true,
  },
  {
    name: 'numOngoingQuests',
    required: false,
    label: 'Ongoing Quests',
    align: 'left',
    field: 'ongoing_quests_count',
    sortable: true,
  },
  {
    name: 'numFinishedQuests',
    required: false,
    label: 'Quests Completed',
    align: 'left',
    field: 'finished_quests_count',
    sortable: true,
  },
  {
    name: 'lastMove',
    required: false,
    label: 'Last Move',
    align: 'left',
    field: 'last_node_published_at',
    sortable: true,
  },
  ...extra,
];

// Computed Properties
const currentQuest = computed({
  get: () => questStore.getCurrentQuest,
  set: () => {},
});
const hasGuildAdminPermission = computed(() => (id: number) => {
  if (!id) {
    console.warn('Guild ID is undefined or invalid:', id);
    return false;
  }
  const guildPermission = baseStore.hasPermission(
    permission_enum.guildAdmin,
    id,
  );
  return guildPermission || false;
});
const guildData = computed((): Partial<GuildData[]> => {
  return GuildsTableProp.guilds!.map((guild: GuildData) => guildRow(guild));
});
function selectionChanged(rowEvent: {
  rows: readonly any[];
  keys: readonly any[];
  added: boolean;
  evt: Event;
}) {
  if (rowEvent.added) {
    guildStore.setCurrentGuild(rowEvent.rows[0].id);
  } else {
    guildStore.setCurrentGuild(true);
  }
}

// Functions
function openDialog(row: GuildData) {
  selectedGuildRow.value = row;
  showDialog.value = true;
}
function closeDialog() {
  showDialog.value = false;
  selectedGuildRow.value = null;
}
function numPlayers(guild: Guild) {
  if (GuildsTableProp.showPlayers) {
    const quest = questStore.getCurrentQuest;
    return (quest!.casting || []).filter((c: Casting) => c.guild_id == guild.id)
      .length;
  }
  return (guild.guild_membership || []).length;
}
function guildIfPlaying(quest_id: number) {
  const casting: Casting = memberStore.castingPerQuest[quest_id];
  if (casting) {
    return casting.guild_id;
  }
}
function guildRow(guild: GuildData): GuildRow {
  return {
    ...guild,
    status_order: guildStore.isGuildMember(guild.id)
      ? 0
      : guild.open_for_applications
        ? 1
        : 2,
    numPlayers: numPlayers(guild),
    //score: this.scores ? this.scores[guild.id] : null,
  };
}
function lastMoveRel(row: GuildData) {
  return row.last_node_published_at
    ? DateTime.fromISO(row.last_node_published_at).toRelative()
    : '';
}
function lastMoveFull(row: GuildData) {
  return row.last_node_published_at
    ? DateTime.fromISO(row.last_node_published_at).toLocaleString(
        DateTime.DATETIME_FULL,
      )
    : '';
}

// Lifecycle Hooks
onBeforeMount(async () => {
  if (GuildsTableProp.selectable) {
    if(guildStore.getCurrentGuild) {
    let guild: GuildData = guildStore.getCurrentGuild;
    if (!guild && questStore.getCurrentQuest) {
      const guild_id = guildIfPlaying(questStore.getCurrentQuest.id);
      if (guild_id) {
        guild = guildStore.getGuildById(guild_id);
      }
    }
    if (guild) {
      selectedGuild.value = [guildRow(guild)];
      // does this mean we won't get update on other rows?
      await guildStore.setCurrentGuild(guild.id);
    }
  }
  }
});
</script>
<style>
.guild-info-dialog {
  max-width: 600px; /* Adjust width */
  max-height: 500px; /* Adjust height */
  overflow-y: auto; /* Enable scrolling if content exceeds height */
  border-radius: 12px;
  background-color: #f9f9f9; /* Light background */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Subtle shadow */
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50; /* Dark text color */
  margin-bottom: 10px;
}

.guild-name {
  font-size: 1.2rem;
  font-weight: 500;
  color: #34495e;
}

.guild-description {
  font-size: 1rem;
  color: #606060;
  line-height: 1.5;
  white-space: pre-wrap; /* Preserve whitespace for formatted descriptions */
}

.q-btn {
  font-size: 0.9rem;
}

.q-card-actions {
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}
q-td {
  font-size: 30%;
}
.guilds-table {
  text-align: center;
  font-size: 1em;
  background-color: ivory;
}
.tooltip {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  padding: 1em;
}
.guilds-table thead {
  /* bg color is important for th; just specify one */
  background-color: rgb(126, 126, 54);
}
ilds-table td:nth-child(1) {
  max-width: 5px;
}
.guilds-table td:nth-child(2) {
  max-width: 300px;
}
.guilds-table tbody tr:nth-child(odd) {
  background-color: #d3cccc; /* Light gray for odd rows */
}
.guilds-table tbody tr:nth-child(even) {
  background-color: #ffffff; /* White for even rows */
}
@media only screen and (max-width: 1000px) {
  .guilds-table td:nth-child(2) {
    max-width: 200px;
    background-color: #f5f5dc;
    position: sticky;
    left: 0;
    z-index: 1;
  }
}
</style>
