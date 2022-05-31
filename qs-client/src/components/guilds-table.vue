<template>
  <div>
    <q-table
      class="guilds-table"
      :title="title"
      :data="guildData"
      :columns="columns"
      style="text-align: left"
      row-key="id"
      :selection="selectable?'single':'none'"
      :selected.sync = "selectedGuild"
      :selected-rows-label="()=>''"
      v-on:selection="selectionChanged"
    >
      <template v-slot:body-cell-view="props">
        <td>
          <span v-if="view" key="view">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: props.row.id },
              }"
            >
              View
            </router-link>
          </span>
          <span v-if="edit" key="view">
            <router-link
              :to="{
                name: 'guild_edit',
                params: { guild_id: props.row.id },
              }"
              >Edit</router-link
            >
          </span>
        </td>
      </template>
      <template v-slot:body-cell-actions="props">
        <td>
          <slot v-bind:guild="props.row.guild"></slot>
        </td>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue/types/options";
import Component from "vue-class-component";
import { mapActions, mapGetters } from "vuex";
import { QuestsGetterTypes } from "src/store/quests";
import { GuildsGetterTypes, GuildsActionTypes } from "src/store/guilds";
import { MemberGetterTypes } from "src/store/member";
import { Guild, Casting } from "../types";
import { ScoreMap } from "../scoring";
import { QTableColumns } from "../types";

type GuildRow = {
  id: number,
  name: string,
  guild: Guild,
  score?: number,
  numMembers: number,
}

const GuildsTableProp = Vue.extend({
  props: {
    title: String,
    guilds: Array as Prop<Guild[]>,
    scores: Object as Prop<ScoreMap>,
    showPlayers: Boolean,
    selectable: Boolean,
    extra_columns: Array as Prop<QTableColumns>,
    edit: {
      type: Boolean,
      default: false,
    },
    view: {
      type: Boolean,
      default: false,
    },
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
        {
          name: "id",
          label: "id",
          align: "right",
          field: "id",
          sortable: true,
        },
        {
          name: "name",
          required: true,
          label: "Guild",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "numMembers",
          required: true,
          label: this.showPlayers ? "Players" : "Members",
          align: "left",
          field: "numMembers",
          sortable: true,
        },
        ...extra,
        {
          name: "actions",
          required: true,
          label: "Actions",
          align: "left",
          field: "actions",
          sortable: true,
        },
        {
          name: "view",
          required: true,
          label: "View",
          align: "left",
          field: "view",
          sortable: false,
        },
      ];
    },
    ...mapGetters("guilds", ["getCurrentGuild", "getGuildById"]),
    ...mapGetters("member", ["castingPerQuest"]),
    ...mapGetters("quests", ["getCurrentQuest"]),
    guildData: function(): GuildRow[] {
      return this.guilds.map((guild: Guild) => this.guildRow(guild));
    },
  },
  methods: {
    ...mapActions("guilds", ["setCurrentGuild"]),
  }
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
  numMembers(guild: Guild) {
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

  guildRow(guild: Guild): GuildRow {
    return {
      id: guild.id,
      guild: guild,
      name: guild.name,
      numMembers: this.numMembers(guild),
      score: this.scores ? this.scores[guild.id] : null,
    }
  }

  async beforeMount() {
    if (this.selectable) {
      let guild = this.getCurrentGuild;
      if (!guild && this.getCurrentQuest) {
        const guild_id = this.guildIfPlaying(this.getCurrentQuest.id);
        if (guild_id) {
          guild = this.getGuildById(guild_id)
        }
      }
      if (guild) {
        this.selectedGuild = [this.guildRow(guild)];
        await this.setCurrentGuild(guild.id);
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
</style>
