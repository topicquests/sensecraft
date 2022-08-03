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
              @click="
                $router.push({
                  name: 'create_quest',
                })
              "
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
              <quest-table v-bind:quests="getQuests" title="Quests" />
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

@Component<QuestListPage>({
  meta: {
    title: "Quests",
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
})
export default class QuestListPage extends Vue {
  ready = false;

  isAuthenticated: false;
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
