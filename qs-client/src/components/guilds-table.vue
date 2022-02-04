<template>
  <div>
    <q-table
      title="Guild List"
      :data="getGuilds"
      :columns="columns"
      row-key="desc"
    >
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
          <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
          <q-td key="playing" :props="props">{{
            getPlayingInQuest(props.row.id)
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

const GuildsTableProp = Vue.extend({
  props: {
    questId: Number,
  },
});

@Component<GuildTable>({
  name: "GuildsTable",
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds"]),
    ...mapGetters("quests", ["isGuildPlayingQuest"]),
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
      name: "handle",
      required: false,
      label: "Handle",
      align: "left",
      field: "handle",
      sortable: true,
    },
    {
      name: "playing",
      required: false,
      label: "Playing",
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
      label: "Member",
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
  isGuildPlayingQuest!: QuestsGetterTypes["isGuildPlayingQuest"];

  getPlayingInQuest(guildId: number) {
    const playing = this.isGuildPlayingQuest(this.questId, guildId);
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
