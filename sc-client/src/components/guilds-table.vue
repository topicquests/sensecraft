<template>
  <div>
    <q-card>
      <q-table
        class="guilds-table"
        :title="title"
        :rows="guildData()"
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
              <q-btn icon="info" dense flat size="sm"
                ><q-tooltip max-width="25rem"
                  ><div v-html="props.row.description" class="tooltip"></div>
                </q-tooltip>
              </q-btn>
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
                  baseStore.hasPermission(
                    permission_enum.guildAdmin,
                    props.row.id,
                  )
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
              :quest="questStore.getCurrentQuest"
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
//import { ScoreMap } from "../scoring";
import { useQuestStore } from 'src/stores/quests';
import { useGuildStore } from 'src/stores/guilds';
import { useBaseStore } from 'src/stores/baseStore';
//import GuildFormPage from "src/pages/CreateGuild.vue";
import { onBeforeMount } from 'vue';
import { permission_enum } from 'src/enums';
import { useMemberStore } from 'src/stores/member';

type QTableColumns = QTable['columns'];

interface GuildRow extends GuildData {
  score?: number;
  status_order?: number;
  numPlayers?: number;
}

const GuildsTableProp = defineProps<{
  title: string;
  guilds: GuildData[];
  scores?: object;
  quest?: object;
  showPlayers?: boolean;
  selectable?: boolean;
  extra_columns?: [];
}>();

const questStore = useQuestStore();
const guildStore = useGuildStore();
const baseStore = useBaseStore();
const memberStore = useMemberStore();
const extra = GuildsTableProp.extra_columns || [];
let selectedGuild: [] = [];
const columns: QTableProps['columns']=[
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

function guildData(): Partial<GuildData[]> {
  return GuildsTableProp.guilds.map((guild: GuildData) => guildRow(guild));
}

function numPlayers(guild: Guild) {
  if (GuildsTableProp.showPlayers) {
    const quest = questStore.getCurrentQuest;
    return (quest.casting || []).filter((c: Casting) => c.guild_id == guild.id)
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

function selectionChanged(rowEvent: {
  rows: readonly any[];
  keys: readonly any[];
  added: boolean;
  evt: Event;
}) {
  if (rowEvent.added) {
    guildStore.setCurrentGuild(rowEvent.rows[0].id);
  } else {
    guildStore.setCurrentGuild(null);
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

onBeforeMount(async () => {
  if (GuildsTableProp.selectable) {
    let guild = guildStore.getCurrentGuild;
    if (!guild && questStore.getCurrentQuest) {
      const guild_id = guildIfPlaying(questStore.getCurrentQuest.id);
      if (guild_id) {
        guild = guildStore.getGuildById(guild_id);
      }
    }
    if (guild) {
      //selectedGuild = [guildRow(guild)];
      // does this mean we won't get update on other rows?
      await guildStore.setCurrentGuild(guild.id);
    } else {
      await guildStore.setCurrentGuild(true);
    }
  }
});
</script>
<style>
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
.guilds-table thead tr:first-child th:first-child {
  /* bg color is important for
th; just specify one */
  background-color: ivory;
}
.guilds-table td:nth-child(1) {
  max-width: 5px;
}
.guilds-table td:nth-child(2) {
  max-width: 300px;
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
