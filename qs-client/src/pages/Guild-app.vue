<template>
  <q-page style="background-color: #caf0f8">
    <div>
      <member></member>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 900px">
        <q-card class="bg-light-blue no-border">
          <div v-if="activeQuests.length > 0">
            <div v-for="quest in activeQuests" :key="quest.id">
              <q-radio
                v-model="currentQuestIdS"
                color="black"
                style="font-size: 20px"
                :val="quest.id"
                :label="quest.name"
              >
                <q-btn
                  v-if="isMember && !findGuildOfCasting(quest.casting)"
                  label="Play"
                  @click="doAddCasting(quest.id)"
                  style="margin-right: 1em"
                  class="bg-dark-blue"
                />
                <router-link
                  v-if="
                    findGuildOfCasting(quest.casting) &&
                    findGuildOfCasting(quest.casting) != currentGuildId
                  "
                  :to="{
                    name: 'guild',
                    params: { guild_id: findGuildOfCasting(quest.casting) },
                  }"
                  >Playing in guild</router-link
                >
              </q-radio>
            </div>
          </div>
          <div v-else>
            <p style="font-size: 20px">You are not registered to any quests</p>
          </div>
        </q-card>
      </div>
    </div>
    <div class="column items-center">
      <div
        class="col-4 q-pa-md"
        style="width: 900px; background-color: #caf0f8"
        v-if="getCurrentGuild"
      >
        <p
          style="text-align: center; font-size: 40px; background-color: #caf0f8"
        >
          {{ getCurrentGuild.name }}
          <q-btn
            v-if="!isMember && getCurrentGuild.open_for_applications"
            label="Join Guild"
            @click="joinToGuild()"
            style="margin-right: 1em"
            class="bg-dark-blue"
          />
          <router-link
            v-if="canRegisterToQuest"
            :to="{ name: 'guild_admin', params: { guild_id: currentGuildId } }"
            style="font-size: smaller"
            >Admin</router-link
          >
        </p>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md">
        <p class="card-header">Team</p>
      </div>
      <div class="col-12 col-md">
        <p class="card-header">Quest Move</p>
      </div>
      <div class="col-12 col-md">
        <p class="card-header">Current Quest</p>
      </div>
    </div>
    <div class="row q-pt-sm">
      <div class="col-12 col-md q-pa-md">
        <q-card>
          <ul style="font-size: 20px; color: red; background: lightblue">
            <li v-for="member in getGuildMembers()" :key="member.id">
              {{ member.handle }}
              <span v-if="playingAsGuildId(member.id)" style="color: black">
                <span v-if="playingAsGuildId(member.id) == currentGuildId"
                  >Playing</span
                >
                <span v-if="playingAsGuildId(member.id) != currentGuildId"
                  >Playing in
                  <router-link
                    :to="{
                      name: 'guild',
                      params: { guild_id: playingAsGuildId(member.id) },
                    }"
                    >{{ playingAsGuild(member.id).name }}</router-link
                  ></span
                >
              </span>
            </li>
          </ul>
        </q-card>
      </div>
      <div class="col-12 col-md q-pa-md">
        <div v-if="getFocusNode" class="col-12 col-md q-pa-md">
          <nodeCard v-bind:nodeCard="getFocusNode"></nodeCard>
        </div>
      </div>
      <div
        class="col-12 col-md q-pa-md"
        style="width: 200%"
        v-if="getCurrentQuest"
      >
        <div>
          <questCard
            v-bind:currentQuestCard="getCurrentQuest"
            style="width: 100%"
            :creator="getQuestCreator()"
            v-if="getCurrentQuest"
          ></questCard>
        </div>
      </div>
    </div>
    <div v-if="getCurrentQuest" class="col-12 col-md q-pa-md">
      <div v-if="this.getCurrentQuest" align="center">
        <router-link
          :to="{
            name: 'game_play',
            params: { quest_id: this.getCurrentQuest.id },
          }"
          >Go To Quest</router-link
        >
      </div>
    </div>
    <div class="column items-center" v-if="pastQuests.length > 0">
      <div class="col-4" style="width: 900px">
        <q-card>
          <q-table
            title="Past Quests"
            :data="pastQuests"
            :columns="columns1"
            row-key="desc"
            id="quest_table"
          >
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
                <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
                <q-td key="status" :props="props">{{ props.row.status }}</q-td>
                <q-td key="end" :props="props">{{ props.row.end }}</q-td>
                <q-td key="questNodeId" auto-width :props="props">
                  <router-link
                    :to="{
                      name: 'quest_page',
                      params: { quest_id: props.row.id },
                    }"
                    >Enter</router-link
                  >
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
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import app from "../App.vue";
import { ConversationState } from "../store/conversation";
import { QuestsState } from "../store/quests";
import { GuildsState } from "../store/guilds";
import { MemberState } from "../store/member";
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
} from "../enums";
import { Quest, GamePlay, Casting, ConversationNode } from "../types";

export default {
  props: ["guild_id"],
  data() {
    return {
      columns1: [
        {
          name: "desc",
          required: true,
          label: "Quest",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "status",
          required: false,
          label: "Handle",
          align: "left",
          field: "status",
          sortable: true,
        },
        {
          name: "handle",
          required: false,
          label: "Status",
          align: "left",
          field: "handle",
          sortable: true,
        },
        {
          name: "start",
          required: false,
          label: "Start Date",
          align: "left",
          field: "start",
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
      memberPlaysQuestSomewhere: false,
      memberPlaysQuestInThisGuild: false,
      casting: null,
      guildGamePlays: [],
      pastQuests: [],
      activeQuests: [],
      potentialQuests: [],
      questGamePlay: [],
      isMember: false,
      isAdmin: false,
      canRegisterToQuest: false,
      members: [],
      label: "",
      questId: null,
      gamePlay: null,
    };
  },
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeCard: nodeCard,
  },
  computed: {
    ...mapState("quests", {
      currentQuestId: (state: QuestsState) => state.currentQuest,
    }),
    currentQuestIdS: {
      get: function () {
        return this.currentQuestId;
      },
      set: function (value) {
        this.setCurrentQuest(value);
      },
    },
    ...mapGetters("quests", [
      "getQuestById",
      "getQuests",
      "getCurrentQuest",
      "castingInQuest",
    ]),
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapState("guilds", {
      currentGuildId: (state: GuildsState) => state.currentGuild,
    }),
    ...mapGetters("members", [
      "getMemberById",
      "getMembersOfGuild",
      "getMemberHandles",
    ]),
    ...mapGetters("guilds", [
      "isGuildMember",
      "getGuildById",
      "getCurrentGuild",
    ]),
    ...mapState("conversation", {
      rootNode: (state: ConversationState) => state.conversationRoot,
    }),
    ...mapGetters("conversation", ["getFocusNode"]),
    ...mapGetters(["hasPermission"]),
    // ...mapGetters('member', ['getUserId']),
  },
  watch: {
    currentQuestId: "onCurrentQuestChange",
  },
  methods: {
    ...mapActions("conversation", [
      "ensureConversationNeighbourhood",
      "ensureRootNode",
      "resetConversation",
    ]),
    ...mapActions("quests", [
      "ensureAllQuests",
      "setCurrentQuest",
      "addCasting",
    ]),
    ...mapActions("members", ["ensureMembersOfGuild", "ensureMemberById"]),
    ...mapActions("guilds", [
      "ensureGuild",
      "getMemberByGuildIdandUserId",
      "getGamePlayByGuildIdAndQuestId",
      "getGamePlayByGuildId",
      "getMembersByGuildId",
      "registerQuest",
      "joinGuild",
      "setCurrentGuild",
      "addGuildMembership",
      "ensureGuildsPlayingQuest",
    ]),
    async initialize() {
      await this.setCurrentGuild(this.guildId);
      this.checkPermissions();
      // should be useful but unused for now
      // const memb = await this.getGuildMembers();
      const playQuestIds = this.getCurrentGuild.game_play.map(
        (gp: GamePlay) => gp.quest_id
      );
      this.guildGamePlays = this.getCurrentGuild.game_play.filter(
        (gp: GamePlay) => gp.status == registration_status_enum.confirmed
      );
      const confirmedPlayQuestIds = this.guildGamePlays.map(
        (gp: GamePlay) => gp.quest_id
      );
      if (this.canRegisterToQuest) {
        this.potentialQuests = this.getQuests.filter(
          (q: Quest) =>
            (q.status == quest_status_enum.registration ||
              q.status == quest_status_enum.ongoing) &&
            !confirmedPlayQuestIds.includes(q.id)
        );
      }
      this.pastQuests = this.getQuests.filter(
        (q: Quest) =>
          (q.status == quest_status_enum.finished ||
            q.status == quest_status_enum.scoring) &&
          playQuestIds.includes(q.id)
      );
      this.activeQuests = this.getQuests.filter(
        (q: Quest) =>
          (q.status == quest_status_enum.ongoing ||
            q.status == quest_status_enum.paused ||
            q.status == quest_status_enum.registration) &&
          confirmedPlayQuestIds.includes(q.id)
      );

      if (this.guildGamePlays.length > 0) {
        const response = await this.initializeQuest();
      }
    },
    playingAsGuildId(member_id) {
      return this.castingInQuest(null, member_id)?.guild_id;
    },
    playingAsGuild(member_id) {
      const guild_id = this.playingAsGuildId(member_id);
      if (guild_id) return this.getGuildById(guild_id);
    },
    async initializeQuest() {
      var quest_id = this.currentQuestId;
      if (
        quest_id &&
        !this.guildGamePlays.find((gp: GamePlay) => gp.quest_id == quest_id)
      ) {
        quest_id = null;
      }
      if (!quest_id) {
        const gamePlay = this.guildGamePlays[0];
        await this.setCurrentQuest(gamePlay.quest_id);
      }
      // TODO: figure out why is this not triggered reliably by the watch and the change above?
      await this.onCurrentQuestChange();
    },
    async onCurrentQuestChange() {
      // we should not get here without a current quest
      const quest: Quest = this.getCurrentQuest;
      if (!quest) {
        return;
      }
      await this.ensureMemberById(quest.creator);
      await this.ensureGuildsPlayingQuest({ quest_id: quest.id });
      const casting = quest.casting?.find(
        (ct: Casting) => ct.member_id == this.memberId
      );
      if (casting) {
        this.memberPlaysQuestSomewhere = casting.guild_id;
        if (casting.guild_id == this.currentGuildId) {
          this.memberPlaysQuestInThisGuild = true;
          this.casting = casting;
        }
      }
      const guild = this.currentGuildId;
      const gamePlay = this.findPlayOfGuild(quest.game_play);
      var node_id = gamePlay.focus_node_id;
      if (!node_id) {
        await this.ensureRootNode(this.currentQuestId);
        node_id = this.rootNode?.id;
      }
      if (node_id) {
        await this.ensureConversationNeighbourhood({ node_id, guild });
      } else {
        await this.resetConversation();
      }
      return "success";
    },

    async joinToGuild() {
      await this.addGuildMembership({
        data: { guild_id: this.currentGuildId, member_id: this.memberId },
      });
      this.isMember = true;
      this.$q.notify({
        type: "positive",
        message: "You are joining guild " + this.currentGuildId,
      });
      return;
    },
    async registerAllMembersToQuest() {
      // This was a temporary fix, let's not do this too often.
      const guild_id = this.currentGuildId;
      const registerAllMembers = this.registerAllMembers;
      const calls = this.getCurrentGuild.game_play
        .filter(
          (gp: GamePlay) => gp.status == registration_status_enum.confirmed
        )
        .map((gp: GamePlay) =>
          registerAllMembers({ params: { guild_id, quest_id: gp.quest_id } })
        );
      await Promise.all(calls);
    },
    findPlayOfGuild(gamePlays) {
      if (gamePlays)
        return gamePlays.find(
          (gp: GamePlay) => gp.guild_id == this.currentGuildId
        );
    },
    findGuildOfCasting(castings) {
      if (castings)
        return castings.find((ct: Casting) => ct.member_id == this.memberId)
          ?.guild_id;
    },
    doAddCasting(quest_id) {
      this.addCasting({
        data: {
          quest_id,
          guild_id: this.currentGuildId,
          member_id: this.memberId,
        },
      });
    },
    checkPermissions() {
      this.isMember = this.isGuildMember(this.currentGuildId);
      if (this.isMember) {
        this.isAdmin = this.hasPermission(
          permission_enum.guildAdmin,
          this.currentGuildId
        );
        this.canRegisterToQuest = this.hasPermission(
          permission_enum.joinQuest,
          this.currentGuildId
        );
      }
    },
    show_tree(show) {
      this.$store.commit("conversation/SHOW_TREE", show);
    },
    getGuildMembers() {
      if (this.getCurrentGuild) {
        return this.getMembersOfGuild(this.getCurrentGuild);
      }
      return [];
    },
    getPlayedQuests() {
      const play = this.guildGamePlays;
      return play.map((gp: GamePlay) => this.getQuestById(gp.quest_id));
    },
    getParentsNode() {
      const nodeId = this.gamePlay[0].focus_node_id;
      if (nodeId) {
        const getFocusNode = this.getParentNode(nodeId);
        return getFocusNode;
      }
      return;
    },
    /* TODO
    async setFocusNode() {
      let payload = {
        guild_id: this.currentGuildId,
        quest_id: this.questId,
      };
      const conv = await this.setConversationQuest(payload.quest_id);
      const gpResponse = this.getGamePlayByGuildIdAndQuestId(payload);
      gpResponse[0].focus_node_id = conv[0].id;
      const focus = await this.setFocusNodeId(gpResponse[0]);
      const game_play = this.getGamePlayByGuildIdAndQuestId(payload);
      this.gamePlay = [...game_play];
      return "focus node set";
    },
    */
    getQuestCreator() {
      const quest = this.getCurrentQuest;
      if (quest) {
        return this.getMemberById(quest.creator);
      }
    },
  },
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    await app.userLoaded;
    await Promise.all([
      this.ensureAllQuests(),
      this.ensureGuild({ guild_id: this.guildId }),
      this.ensureMembersOfGuild(this.guildId),
    ]);
    this.initialize();
  },
};
</script>

<style>
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}
.card-header {
  text-align: center;
  font-size: 20px;
  background-color: #caf0f8;
  padding-bottom: sm;
}
#node_card {
  border: 3px solid black;
  font-size: 10pt;
  color: darkblue;
  height: 400px;
  background-color: #caf0f8;
}
</style>
