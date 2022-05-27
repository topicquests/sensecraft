<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <q-btn
              color="primary"
              v-if="$store.state.member.member"
              style="margin-bottom: 4px"
              label="New Quest"
              @click="$router.push({ name: 'create_quest' })"
            />
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div
              v-if="getQuests && getQuests.length"
              class="col-4 q-pa-lg"
              style="width: 100%"
            >
              <questTable v-bind:quests="getQuests" :edit="true" title="Quests">
              <template v-slot:default="slotProps">
                <quest-date-time-interval v-bind:quest="slotProps.quest"/>
              </template>
            </questTable>
            </div>
            <div v-else class="column items-center q-mt-md">
              <h4>There are no quests</h4>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import questTable from "../components/quest-table.vue";
import member from "../components/member.vue";
import { mapActions, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import { QuestsActionTypes, QuestsGetterTypes } from "src/store/quests";
import { GuildsActionTypes } from "src/store/guilds";
import QuestDateTimeInterval from "../components/quest-date-time-interval.vue";

@Component<QuestLandingPage>({
  meta: {
    title: 'Quests',
  },
  components: {
    scoreboard: scoreboard,
    questTable: questTable,
    member: member,
    QuestDateTimeInterval: QuestDateTimeInterval,
  },
  computed: {
    ...mapGetters("quests", ["getQuests"]),
    ...mapGetters("guilds", ["getGuilds"]),
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
  },
})
export default class QuestLandingPage extends Vue {
  ready = false;
  columns = [
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
  ];
  isAuthenticated: false;
  serverPagination: {};
  serverData: [];

  getQuests!: QuestsGetterTypes["getQuests"];

  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];

  async beforeMount() {
    await userLoaded;
    // not using those yet?
    await Promise.all([this.ensureAllQuests(), this.ensureAllGuilds()]);
    this.ready = true;
  }
}
</script>

<style></style>
