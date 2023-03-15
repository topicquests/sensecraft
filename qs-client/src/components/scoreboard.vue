<template>
  <q-card class="flat bordered q-pa-md bg-black">
    <div class="row">
      <div class="col-12 col-md">
        <p class="text">Gameboard</p>
      </div>
    </div>
    <div class="row justify-center q-gutter-md">
      <q-card class="score-card">
        <span class="scoreboard-header">Quests</span>
        <div class="row">
          <div class="col-4" style="width: 50%">
            <div class="labels">Not started:</div>
            <div class="labels">Playing</div>
            <div class="labels">Finished</div>
          </div>
          <div class="col-4">
            <div>
              <span class="labels">{{ questCount(status.registration) }} </span>
            </div>
            <div>
              <span class="labels">{{ questCount(status.ongoing) }} </span>
            </div>
            <div>
              <span class="labels">{{ questCount(status.finished) }} </span>
            </div>
          </div>
        </div>
      </q-card>
      <q-card class="score-card">
        <span class="scoreboard-header">Guilds</span>
        <div class="row">
          <div class="col-4" style="width: 70%">
            <div class="labels">Number of Guilds:</div>
            <div class="labels">Most Quests:</div>
            <div class="labels">Highest Score:</div>
          </div>
          <div class="col-3">
            <div>
              <span class="labels">{{ getGuilds.length }}</span>
            </div>
            <div>
              <span class="labels">0</span>
            </div>
            <span class="labels">0</span>
          </div>
        </div>
      </q-card>
      <q-card class="score-card">
        <span class="scoreboard-header">Players</span>
        <div class="row">
          <div class="col-4" style="width: 70%">
            <div class="labels">Number of players:</div>
            <div class="labels">Most Quests:</div>
            <div class="labels">Highest Score:</div>
          </div>
          <div class="col-3">
            <div>
              <span class="labels">{{ getMembers.length }}</span>
            </div>
            <div>
              <span class="labels">0</span>
            </div>
            <div>
              <span class="labels">0</span>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-card>
</template>
<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import { MembersActionTypes, MembersGetterTypes } from "../store/members";
import { mapActions, mapGetters } from "vuex";
import { quest_status_enum } from "../enums";

@Component<Scoreboard>({
  name: "Scoreboard",
  data() {
    return {
      status: quest_status_enum,
    };
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds"]),
    ...mapGetters("quests", ["getQuestsByStatus"]),
    ...mapGetters("members", ["getMembers"]),
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
    ...mapActions("members", ["ensureAllMembers"]),
  },
})
export default class Scoreboard extends Vue {
  getGuilds!: GuildsGetterTypes["getGuilds"];
  getQuestsByStatus!: QuestsGetterTypes["getQuestsByStatus"];
  getMembers!: MembersGetterTypes["getMembers"];
  status: quest_status_enum;

  questCount(st: quest_status_enum) {
    if (this.getQuestsByStatus(st)) {
      return this.getQuestsByStatus(st).length;
    }
    return 0;
  }

  ensureAllQuests!: QuestsActionTypes["ensureAllQuests"];
  ensureAllGuilds!: GuildsActionTypes["ensureAllGuilds"];
  ensureAllMembers: MembersActionTypes["ensureAllMembers"];

  async beforeMount() {
    await Promise.all([
      this.ensureAllQuests(),
      this.ensureAllGuilds(),
      this.ensureAllMembers(),
    ]);
  }
}
</script>
<style>
.b1 {
  border-right-style: solid;
  border-right-color: yellow;
}
.labels {
  color: yellow;
  font-size: 110%;
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
  width: 25em;
}
.scoreboard-header {
  color: yellow;
  font-size: 110%;
  text-align: left;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
}

.score-card {
  background-color: black;
  width: 100%;
  max-width: 200px;
}

p.text {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 30px;
  color: yellow;
  background-color: black;
}
#scoreboard {
  width: 900px;
  border: 1px solid blue;
}

@media only screen and (max-width: 600px) {
  p.text {
    font-size: 20px;
  }
}
</style>
