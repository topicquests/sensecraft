<template>
  <q-page>
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>

    <div class="row justify-center q-pb-md">
      <div class="col-4">
        <questCard v-bind:currentQuest="getCurrentQuest"> </questCard>
      </div>
    </div>
    <div class="row justify-center">
      <div
        v-if="
          getGuildsPlayingQuest(getCurrentQuest) &&
          getGuildsPlayingQuest(getCurrentQuest).length
        "
        class="col-6"
      >
        <guilds-to-quest-card v-bind:questId="questId"></guilds-to-quest-card>
      </div>
      <div v-else>
        <h5>There are no guilds playing quest</h5>
      </div>
    </div>
    <div class="row justify-center q-mt-lg">
      <div v-if="getConversationTree" class="col-6 q-md q-mr-lg">
        <node-tree
          v-bind:nodes="getConversationTree"
          v-on:updateTree="selectionChanged"
          :channelId="null"
          :editable="false"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import questCard from "../components/quest-card.vue";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import nodeTree from "../components/node-tree.vue";
import nodeForm from "../components/node-form.vue";
import guildsToQuestCard from "../components/guilds-to-quest-card.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import { QuestsGetterTypes, QuestsActionTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import {
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
} from "../store/channel";
import ChannelList from "../components/ChannelListComponent.vue";
import { Casting } from "src/types";

@Component<QuestViewPage>({
  components: {
    questCard: questCard,
    scoreboard: scoreboard,
    member: member,
    nodeForm: nodeForm,
    nodeTree: nodeTree,
    guildsToQuestCard: guildsToQuestCard,
    ChannelList: ChannelList,
  },
  computed: {
    ...mapGetters("quests", [
      "getCurrentQuest",
      "getCurrentGamePlay",
      "castingInQuest",
    ]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "getConversation",
      "getConversationTree",
      "getFocusNode",
      "getConversationTree",
      "getRootNode",
    ]),
    ...mapGetters("channel", ["getGuildChannels", "getGameChannels"]),
    ...mapGetters("guilds", ["getGuildsPlayingQuest"]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["ensureGuildsPlayingQuest"]),
    ...mapActions("members", ["fetchMemberById"]),
    ...mapActions("conversation", [
      "ensureConversation",
      "ensureConversationSubtree",
      "ensureRootNode",
      "ensureConversationNeighbourhood",
    ]),
    ...mapActions("channel", ["ensureChannels"]),
  },
})
export default class QuestViewPage extends Vue {
  questId: number;
  selectedNodeId: number = null;

  // declare the computed attributes for Typescript
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getGameChannels!: ChannelGetterTypes["getGameChannels"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getConversationTree: ConversationGetterTypes["getConversationTree"];
  getConversation: ConversationGetterTypes["getConversation"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getRootNode!: ConversationGetterTypes["getRootNode"];
  isPlayingQuestInGuild!: QuestsGetterTypes["isPlayingQuestInGuild"];
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  getGuildsPlayingQuest!: GuildsGetterTypes["getGuildsPlayingQuest"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  ensureConversation: ConversationActionTypes["ensureConversation"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];
  ensureConversationSubtree: ConversationActionTypes["ensureConversationSubtree"];
  ensureGuildsPlayingQuest: GuildsActionTypes["ensureGuildsPlayingQuest"];
  ensureConversationNeighbourhood: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureChannels: ChannelActionTypes["ensureChannels"];

  selectionChanged(id) {
    this.selectedNodeId = id;
  }
  async getPlayerPlayingInQuest() {
    const playing = this.castingInQuest(this.questId);
    if (playing) {
      await this.ensureChannels(playing.guild_id);
    }
  }
  async beforeMount() {
    const quest_id = Number.parseInt(this.$route.params.quest_id);
    this.questId = quest_id;
    await Promise.all([
      this.setCurrentQuest(quest_id),
      this.ensureConversation(quest_id),
      this.ensureGuildsPlayingQuest({ quest_id }),
      this.ensureQuest({ quest_id }),
    ]);
    let node_id =
      this.getCurrentGamePlay?.focus_node_id || this.getRootNode?.id;
    if (node_id) {
      await this.ensureConversationNeighbourhood({
        node_id,
        guild_id: null,
      });
      this.selectedNodeId = this.getFocusNode.id;
    }
    await this.getPlayerPlayingInQuest();
  }
}
</script>
<style></style>
