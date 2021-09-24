<template>
  <q-page style="background-color: lightgrey">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="column items-center q-mb-md">
        <div class="col-4" id="scoreboard">
          <scoreboard></scoreboard>
        </div>
      </div>
      <questCard
        v-if="getCurrentQuest"
        v-bind:currentQuestCard="getCurrentQuest"
        style="width: 100%"
        :creator="getQuestCreator()"
      ></questCard>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import app from "../App";
export default {
  name: "GamePlay",
  data() {
    return {
      guildId: null,
      questId: null,
    };
  },
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
  },
  computed: {
    ...mapGetters("quests", ["getCurrentQuest"]),
    ...mapGetters("members", ["getMemberById"]),
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
    this.guildId = this.$route.params.guild_id;
    this.questId = this.$route.params.quest_id;
    await app.userLoaded;
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.setCurrentGuild(this.guildId),
      this.ensureQuest(this.questId),
      this.ensureGuild(this.guildId),
    ]);
    const quest = this.getCurrentQuest;
    await this.fetchMemberById({ params: { id: quest.creator } });
    // const creator = this.getMemberById(quest.creator);
  },
};
</script>
