<template>
  <q-card class="flat bordered q-pa-md bg-black">
    <div class="row">
      <div class="col-12 col-md">
        <p id="scoreboard-title">Gameboard</p>
      </div>
    </div>
    <div class="row">
      <div class="col-3 text-center">
        <span class="scoreboard-header">Quests</span>
      </div>
      <div class="col-4 text-center">
        <span class="scoreboard-header">Guilds</span>
      </div>
      <div class="col-4 text-center">
        <span class="scoreboard-header">Players</span>
      </div>
      <div class="row items-center" style="width: 100%">
        <div class="col-1.5 q-ml-xl">
          <div class="labels">Not started:</div>
          <div class="labels">Playing</div>
          <div class="labels">Finished</div>
        </div>
        <div class="col-2 b1 q-ml-sm">
          <div>
            <span class="labels">{{ questCountNotStarted() }} </span>
          </div>
          <div>
            <span class="labels">{{ questCountStarted() }} </span>
          </div>
          <div>
            <span class="labels">{{ questCountFinished() }} </span>
          </div>
        </div>
        <div class="col-1.5 q-ml-sm">
          <div class="labels">
            <span>Number of Guilds:</span>
          </div>
          <div class="labels">
            <span>Most Quests: </span>
          </div>
          <div class="labels">
            <span>Highest Score: </span>
          </div>
        </div>
        <div class="col-2 b1 q-ml-sm">
          <div>
            <span class="labels">{{ getGuilds.length }}</span>
          </div>
          <div>
            <span class="labels">0</span>
          </div>
          <div>
            <span class="labels">0</span>
          </div>
        </div>

        <div class="col-1.5 q-ml-sm">
          <div class="labels"><span>Number of players: </span></div>
          <div class="labels"><span>Most Quests: </span></div>
          <div class="labels"><span>Highest Score: </span></div>
        </div>
        <div class="col-1.5 q-ml-sm">
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
    </div>
  </q-card>
</template>
<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import { QuestsActionTypes, QuestsGetterTypes } from "src/store/quests";
import { MembersActionTypes, MembersGetterTypes } from "src/store/members";
import { mapActions, mapGetters } from "vuex";
import { quest_status_enum } from "../enums";

@Component<Scoreboard>({
  name: "Scoreboard",
  computed: {
    ...mapGetters("guilds", ["getGuilds"]),
    ...mapGetters("quests", ["getQuestsByStatus"]),
    ...mapGetters("members", ["getMembers"])
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
    ...mapActions("members", ["ensureAllMembers"])
  }
})
export default class Scoreboard extends Vue {
  getGuilds!: GuildsGetterTypes["getGuilds"];
  getQuestsByStatus!: QuestsGetterTypes["getQuestsByStatus"];
  getMembers!: MembersGetterTypes["getMembers"];

  questCountNotStarted() {
    if (this.getQuestsByStatus(quest_status_enum.registration)) {
      return this.getQuestsByStatus(quest_status_enum.registration).length;
    }
    return 0;
  }
  questCountStarted() {
    if (this.getQuestsByStatus(quest_status_enum.ongoing)) {
      return this.getQuestsByStatus(quest_status_enum.ongoing).length;
    }
    return 0;
  }
  questCountFinished() {
    if (this.getQuestsByStatus(quest_status_enum.finished)) {
      return this.getQuestsByStatus(quest_status_enum.finished).length;
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
      this.ensureAllMembers()
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
}
.scoreboard-header {
  color: yellow;
  font-size: 110%;
  text-align: left;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
}

#scoreboard-title {
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
</style>
