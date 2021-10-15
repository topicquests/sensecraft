<template>
  <q-page :padding="true" class="bg-grey-4">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pt-lg q-pb-sm q-pl-md" style="width: 55%">
        <q-btn
          v-if="$store.state.member.member"
          id="newGuildBtn"
          label="New Guild"
          @click="$router.push({ name: 'create_guild' })"
        />
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 55%">
        <q-table
          id="guildTable"
          title="Guilds"
          :data="getGuilds"
          :columns="columns"
          row-key="desc"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
              <q-td key="label" :props="props">{{ props.row.label }}</q-td>
              <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
              <q-td key="date" :props="props">{{ props.row.created_at }}</q-td>
              <q-td key="nodeId" auto-width :props="props">
                <router-link
                  :to="{
                    name: 'guild_edit',
                    params: { guild_id: props.row.id },
                  }"
                  >Edit</router-link
                >
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import app from "../App.vue";

export default {
  props: ["member"],
  data() {
    return {
      columns: [
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
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "created_at",
          sortable: true,
        },
        {
          name: "nodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true,
        },
      ],
      serverPagination: {},
      serverData: [],
    };
  },

  components: {
    scoreboard: scoreboard,
    member: member,
  },

  computed: {
    ...mapGetters("guilds", ["getGuilds"]),
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
  },
  async beforeMount() {
    await app.userLoaded;
    await this.ensureAllGuilds();
  },
};
</script>

<style>
#newGuildBtn {
  margin-bottom: 4px;
  background-color: lightblue;
  color: blue;
}

#guildTable {
  color: blue;
  background-color: lightblue;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
