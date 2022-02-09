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
      <div class="col-4 q-pa-lg q-pl-lg" style="width: 55%">
        <q-btn
          color="secondary"
          v-if="$store.state.member.member"
          style="margin-bottom: 4px"
          label="New Quest"
          @click="$router.push({ name: 'create_quest' })"
        />
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <questTable v-bind:quests="getQuests" :view="false"></questTable>
      </div>
    </div>
  </q-page>
</template>

<script>
import scoreboard from "../components/scoreboard.vue";
import questTable from "../components/quest-table.vue";
import member from "../components/member.vue";
import { mapActions, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";

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
          name: "status",
          required: false,
          label: "Status",
          align: "left",
          field: "status",
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
      isAuthenticated: false,
      serverPagination: {},
      serverData: [],
    };
  },
  components: {
    scoreboard: scoreboard,
    questTable: questTable,
    member: member,
  },
  computed: {
    ...mapGetters("quests", ["getQuests"]),
    ...mapGetters("guilds", ["getGuilds"]),
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
  },
  async beforeMount() {
    await userLoaded;
    // not using those yet?
    // await Promise.all([
    //   this.ensureAllQuests(),
    //   this.ensureAllGuilds(),
    // ])
  },
};
</script>

<style></style>
