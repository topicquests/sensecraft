<template>
  <q-page style="background-color: lightgrey">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <questTable
          v-bind:quests="getQuests"
          :view="true"
          title="Quests"
        ></questTable>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <p>
          If you have not already choosen a guild to join. Select one from the
          list If you are already a member of a guild, click on enter button to
          go to that guild's page
        </p>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <q-card>
          <q-table
            style="color: blue; background-color: lightgreen"
            title="Guilds"
            :data="getGuilds"
            :columns="columns2"
            row-key="desc"
          >
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="guildDesc" :props="props">
                  {{ props.row.name }}</q-td
                >
                <q-td key="label" :props="props">{{ props.row.label }}</q-td>
                <q-td key="guildHandle" :props="props">{{
                  props.row.handle
                }}</q-td>
                <q-td key="guildNodeId" auto-width :props="props">
                  <router-link
                    :to="{
                      name: 'guild',
                      params: { guild_id: props.row.id },
                    }"
                  >
                    Enter
                  </router-link>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import questTable from "../components/quest-table.vue";
import member from "../components/member.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import app from "../App.vue";

export default {
  name: "LobbyPage",
  props: ["guild"],
  data() {
    return {
      columns1: [
        {
          name: "desc",
          required: true,
          label: "Label",
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
          name: "questNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true,
        },
      ],
      columns2: [
        {
          name: "guildDesc",
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "guildHandle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
          sortable: true,
        },
        {
          name: "guildNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true,
        },
      ],
    };
  },
  components: {
    scoreboard: scoreboard,
    questTable: questTable,
    member: member,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds"]),
    ...mapGetters("quests", ["getQuests"]),
    ...mapState("member", ["member"]),
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
    guildBelongsTo(id) {
      const guildId = this.getMyGuilds.find((el) => el.id == id);
      if (guildId) {
        return true;
      } else {
        return false;
      }
    },
  },
  async beforeMount() {
    await app.userLoaded;
    await Promise.all([this.ensureAllQuests(), this.ensureAllGuilds()]);
  },
};
</script>
<style>
p {
  background-color: lightgrey;
  color: blue;
  font-size: 15pt;
}
</style>
