<template>
  <div>
    <q-table
      class="guilds-table"
      title="Guild List"
      :data="getGuildsPlayingQuest(getQuestById(questId))"
      :columns="columns"
      row-key="desc"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
          <q-td key="player_playing" :props="props">{{
            getPlayerPlayingInQuest(props.row.id)
          }}</q-td>
          <q-td key="date" :props="props">{{
            getDate(props.row.created_at)
          }}</q-td>
          <q-td key="guildMember" :props="props">
            {{ guildBelongsTo(props.row.id) }}
          </q-td>
          <q-td key="nodeId" auto-width :props="props">
            <router-link
              :to="{
                name: 'guild',
                params: { guild_id: props.row.id },
              }"
              >View</router-link
            >
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import { QuestsGetterTypes } from "src/store/quests";
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue/types/options";
import { mapActions, mapGetters } from "vuex";

// This component is obsolete, but may contain useful code

const GuildsTableProp = Vue.extend({
  props: {
    questId: Number,
  },
});

@Component<GuildTable>({
  name: "GuildsQuestTable",
  computed: {
    ...mapGetters("guilds", [
      "getGuilds",
      "getMyGuilds",
      "getGuildsPlayingQuest",
    ]),
    ...mapGetters("quests", [
      "isGuildPlayingQuest",
      "isPlayingQuestInGuild",
      "getQuestById",
    ]),
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
  },
})
export default class GuildTable extends GuildsTableProp {
  columns = [
    {
      name: "desc",
      required: true,
      label: "Name",
      align: "left",
      field: "name",
      sortable: true,
    },
    {
      name: "player_playing",
      required: false,
      label: "Player Playing Quest",
      align: "left",
      field: "public",
      sortable: true,
    },
    {
      name: "date",
      required: true,
      label: "Date",
      align: "left",
      field: "created_at",
      sortable: true,
    },
    {
      name: "guildMember",
      required: true,
      label: "Guild Member",
      align: "left",
      field: "guildBelongsTo",
    },
    {
      name: "nodeId",
      required: false,
      label: "Action",
      align: "left",
      field: "id",
      sortable: true,
    },
  ];
  getMyGuilds!: GuildsGetterTypes["getMyGuilds"];
  getGuildsPlayingQuest: GuildsGetterTypes["getGuildsPlayingQuest"];
  getQuestById!: QuestsGetterTypes["getQuestById"];
  isGuildPlayingQuest!: QuestsGetterTypes["isGuildPlayingQuest"];
  isPlayingQuestInGuild!: QuestsGetterTypes["isPlayingQuestInGuild"];

  getGuildPlayingInQuest(guildId: number) {
    const guildPlaying = this.isGuildPlayingQuest(this.questId, guildId);
    if (guildPlaying) {
      return "Yes";
    } else {
      return "No";
    }
  }
  getPlayerPlayingInQuest(guildId: number) {
    const playing = this.isPlayingQuestInGuild(this.questId, guildId);
    if (playing) {
      return "Yes";
    } else {
      return "No";
    }
  }
  guildBelongsTo(id) {
    const guildId = this.getMyGuilds.find((el) => el.id == id);
    if (guildId) {
      return "Yes";
    } else {
      return "No";
    }
  }
  getDate(guildDate) {
    let date: Date = new Date(guildDate);
    let startDate: String = new Intl.DateTimeFormat("en-US").format(date);
    return startDate;
  }

  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];
  async beforeMount() {
    await this.ensureAllGuilds();
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
