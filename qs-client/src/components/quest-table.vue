<template>
  <q-card>
    <div class="row" v-if="title == 'Quests'">
      <div class="col-2">
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
      :data="getFilteredQuests"
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

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { DateTime } from "luxon";
import { Prop } from "vue/types/options";
import { mapGetters } from "vuex";
import type { QTable } from "quasar";
import {
  permission_enum,
  quest_status_type,
  quest_status_enum,
} from "../enums";
import { GuildMembership, QuestData, Member } from "../types";
import { BaseGetterTypes } from "../store/baseStore";
import QuestDateTimeInterval from "./quest-date-time-interval.vue";

type QTableColumns = QTable["columns"];

function refInterval(row: QuestData) {
  const start: number = DateTime.fromISO(row.start).ts;
  const end: number = DateTime.fromISO(row.end).ts;
  const now = Date.now();
  const refTime = start > now ? start : end;
  return Math.abs(refTime - now);
}

const QuestTableProps = Vue.extend({
  props: {
    quests: Array as Prop<QuestData[]>,
    title: String,
  },
  components: {
    QuestDateTimeInterval,
  },
});

@Component<QuestTable>({
  name: "quest_table",
  data() {
    return {
      questStatus: "All",
    };
  },

  computed: {
    columns: function (): QTableColumns {
      const extra = this.extra_columns || [];
      return [
        {
          name: "info",
          required: true,
          label: "description",
          align: "left",
        },
        {
          name: "name",
          required: true,
          label: "title",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "status",
          required: false,
          label: "status",
          align: "left",
          field: "status",
          sortable: true,
        },
        {
          name: "time",
          required: true,
          label: "Time",
          align: "left",
          field: (row) => refInterval(row),
          sortable: true,
        },
        {
          name: "view",
          required: true,
          label: "Action",
          align: "left",
          field: "actions",
          sortable: true,
        },
        {
          name: "numGuilds",
          required: false,
          label: "#Guilds",
          align: "left",
          field: "confirmed_guild_count",
          sortable: true,
        },
        {
          name: "numPlayers",
          required: false,
          label: "#Players",
          align: "left",
          field: "player_count",
          sortable: true,
        },
        {
          name: "numMoves",
          required: false,
          label: "#Moves",
          align: "left",
          field: "node_count",
          sortable: true,
        },
        {
          name: "lastMove",
          required: false,
          label: "last move",
          align: "left",
          field: "last_node_published_at",
          sortable: true,
        },
        ...extra,
      ];
    },
    ...mapGetters("member", ["getUser"]),
    ...mapGetters(["hasPermission"]),
    ...mapGetters("quests", ["getQuestsByStatus"]),
    getFilteredQuests() {
      if (this.questStatus && this.questStatus != "All") {
        return this.getQuestsByStatus(this.questStatus);
      } else {
        this.questStatus = "All";
        return this.quests;
      }
    },
  },
})
export default class QuestTable extends QuestTableProps {
  columns!: QTableColumns;
  getUser!: Member;
  questStatus: quest_status_enum = null;
  questStatusOptions: quest_status_type[] = null;

  hasPermission!: BaseGetterTypes["hasPermission"];

  lastMoveRel(row: QuestData) {
    return row.last_node_published_at
      ? DateTime.fromISO(row.last_node_published_at).toRelative()
      : "";
  }
  lastMoveFull(row: QuestData) {
    return row.last_node_published_at
      ? DateTime.fromISO(row.last_node_published_at).toLocaleString(
          DateTime.DATETIME_FULL
        )
      : "";
  }

  canAdminGuilds(): boolean {
    return (
      this.hasPermission(permission_enum.joinQuest) ||
      (this.getUser?.guild_membership || []).find((gm: GuildMembership) => {
        const permissions = gm.permissions || [];
        return (
          (gm.status == "confirmed" &&
            permissions.includes(permission_enum.joinQuest)) ||
          permissions.includes(permission_enum.guildAdmin)
        );
      }) != undefined
    );
  }
  beforeMount() {
    this.questStatusOptions = this.quests.map((quest) => quest.status);
    this.questStatusOptions = this.questStatusOptions.filter(
      (item, index) => this.questStatusOptions.indexOf(item) === index
    );
  }
}
</script>

<style>
q-td {
  font-size: 30%;
}
.quest-table {
  background-color: ivory;
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
</style>
