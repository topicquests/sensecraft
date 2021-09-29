<template>
  <q-page style="background-color: secondary">
    <div>
      <member></member>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4">
        <questCard
          v-if="getCurrentQuest"
          v-bind:currentQuestCard="getCurrentQuest"
          :creator="getQuestCreator()"
        ></questCard>
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4">
        <gpRootNode v-bind:nodeCard="getFocusNode"></gpRootNode>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import app from "../App.vue";
export default {
  name: "GamePlay",
  data() {
    return {
      guildId: null,
      questId: null,
    };
  },
  components: {
    scoreboard,
    member,
    questCard,
    gpRootNode: nodeCard,
  },
  computed: {
    ...mapGetters("quests", ["getCurrentQuest"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("conversation", ["getConversationNodeById", "getFocusNode"]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById"]),
    getQuestCreator() {
      return this.getMemberById(this.getCurrentQuest.creator);
    },
  },
  async created() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await app.userLoaded;
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.setCurrentGuild(this.guildId),
      this.ensureQuest({ quest_id: this.questId }),
      this.ensureGuild({ guild_id: this.guildId }),
    ]);
    const quest = this.getCurrentQuest;
    await this.fetchMemberById({ params: { id: quest.creator } });
    // const creator = this.getMemberById(quest.creator);
  },
};
</script>
