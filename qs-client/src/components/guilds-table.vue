<template>
  <div>
    <q-card>
      <q-table
        class="guilds-table"
        :title="title"
        :data="guildData"
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
                v-if="hasPermission('guildAdmin', props.row.id)"
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
              v-bind:quest="getCurrentQuest"
              v-bind:playing="isPlayingQuestAsGuildId() == props.row.id"
              v-bind:guild="props.row"
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

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue/types/options";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";
import { QTable } from "quasar";
import { Guild, GuildData, Casting, QuestData } from "../types";
import { QuestsGetterTypes } from "../store/quests";
import { GuildsGetterTypes, GuildsActionTypes } from "../store/guilds";
import { MemberGetterTypes } from "../store/member";
import { BaseGetterTypes } from "../store/baseStore";
import GuildsMembershipIndicator from "./guilds-membership-indicator.vue";
import GuildsPlayingIndicator from "./guilds-playing-indicator.vue";
import { ScoreMap } from "../scoring";

type QTableColumns = QTable["columns"];

interface GuildRow extends GuildData {
  score?: number;
  status_order?: number;
  numPlayers?: number;
}

const GuildsTableProp = Vue.extend({
  props: {
    title: String,
    guilds: Array as Prop<GuildData[]>,
    scores: Object as Prop<ScoreMap>,
    quest: Object as Prop<QuestData>,
    showPlayers: Boolean,
    selectable: Boolean,
    extra_columns: Array as Prop<QTableColumns>,
  },
  components: {
    GuildsMembershipIndicator,
    GuildsPlayingIndicator,
  },
});

@Component<GuildTable>({
  name: "GuildsTable",
  computed: {
    columns: function (): QTableColumns {
      const extra = this.extra_columns || [];
      if (this.scores) {
        extra.push({
          name: "score",
          required: true,
          label: "Score",
          align: "left",
          field: "score",
          sortable: true,
        });
      }
      return [
        { name: "info", required: true, label: "description", align: "left" },

        {
          name: "name",
          required: true,
          label: "Guild",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "status",
          required: false,
          label: "Status",
          align: "left",
          field: "status_order",
          sortable: true,
        },
        {
          name: "actions",
          required: true,
          label: "Actions",
          align: "left",
          field: "actions",
          sortable: true,
        },
        {
          name: "numPlayers",
          required: false,
          label: this.showPlayers ? "Players" : "Members",
          align: "left",
          field: "member_count",
          sortable: true,
        },
        {
          name: "numOngoingQuests",
          required: false,
          label: "Ongoing Quests",
          align: "left",
          field: "ongoing_quests_count",
          sortable: true,
        },
        {
          name: "numFinishedQuests",
          required: false,
          label: "Quests Completed",
          align: "left",
          field: "finished_quests_count",
          sortable: true,
        },
        {
          name: "lastMove",
          required: false,
          label: "Last Move",
          align: "left",
          field: "last_node_published_at",
          sortable: true,
        },
        ...extra,
      ];
    },
    ...mapGetters("guilds", [
      "getCurrentGuild",
      "getGuildById",
      "isGuildMember",
    ]),
    ...mapGetters("member", ["castingPerQuest"]),
    ...mapGetters("quests", ["getCurrentQuest", "isPlayingQuestAsGuildId"]),
    ...mapGetters(["hasPermission"]),
    guildData: function (): GuildRow[] {
      return this.guilds.map((guild: GuildData) => this.guildRow(guild));
    },
  },
  methods: {
    ...mapActions("guilds", ["setCurrentGuild"]),
  },
})
export default class GuildTable extends GuildsTableProp {
  selectedGuild = [];
  columns!: QTableColumns;
  guildData!: GuildRow[];
  getCurrentGuild!: GuildsGetterTypes["getCurrentGuild"];
  getGuildById!: GuildsGetterTypes["getGuildById"];
  castingPerQuest!: MemberGetterTypes["castingPerQuest"];
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  setCurrentGuild!: GuildsActionTypes["setCurrentGuild"];
  isGuildMember!: GuildsGetterTypes["isGuildMember"];
  isPlayingQuestAsGuildId!: QuestsGetterTypes["isPlayingQuestAsGuildId"];
  hasPermission!: BaseGetterTypes["hasPermission"];

  numPlayers(guild: Guild) {
    if (this.showPlayers) {
      const quest = this.getCurrentQuest;
      return (quest.casting || []).filter((c) => c.guild_id == guild.id).length;
    }
    return (guild.guild_membership || []).length;
  }

  guildIfPlaying(quest_id) {
    const casting: Casting = this.castingPerQuest[quest_id];
    if (casting) {
      return casting.guild_id;
    }
  }

  selectionChanged(rowEvent) {
    if (rowEvent.added) {
      this.setCurrentGuild(rowEvent.rows[0].id);
    } else {
      this.setCurrentGuild(null);
    }
  }

  guildRow(guild: GuildData): GuildRow {
    return {
      ...guild,
      status_order: this.isGuildMember(guild.id)
        ? 0
        : guild.open_for_applications
        ? 1
        : 2,
      numPlayers: this.numPlayers(guild),
      score: this.scores ? this.scores[guild.id] : null,
    };
  }

  lastMoveRel(row: GuildData) {
    return row.last_node_published_at
      ? DateTime.fromISO(row.last_node_published_at).toRelative()
      : "";
  }
  lastMoveFull(row: GuildData) {
    return row.last_node_published_at
      ? DateTime.fromISO(row.last_node_published_at).toLocaleString(
          DateTime.DATETIME_FULL
        )
      : "";
  }

  async beforeMount() {
    if (this.selectable) {
      let guild = this.getCurrentGuild;
      if (!guild && this.getCurrentQuest) {
        const guild_id = this.guildIfPlaying(this.getCurrentQuest.id);
        if (guild_id) {
          guild = this.getGuildById(guild_id);
        }
      }
      if (guild) {
        this.selectedGuild = [this.guildRow(guild)];
        // does this mean we won't get update on other rows?
        await this.setCurrentGuild(guild.id);
      } else {
        await this.setCurrentGuild(true);
      }
    }
  }
}
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
</style>
