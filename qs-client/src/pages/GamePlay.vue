<template>
  <q-page class="bg-blue">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-12 col-md">
        <questCard
          v-if="getCurrentQuest"
          v-bind:currentQuestCard="getCurrentQuest"
          :creator="getQuestCreator()"
        ></questCard>
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <nodeCard v-bind:node="getFocusNode" :type="view"> </nodeCard>
    </div>
    <div class="column items-center">
      <div class="col-12 col-md">
        <q-card class="node-card q-pa-md" style="width: 500px">
          <section class="node-card-title">
            <q-input v-model="newNode.title" label="Node title" />
          </section>
          <section>
            <div
              class="row q-pb-xs q-ma-lg"
              style="text-align: center; font-size: 15pt"
            >
              Description<br />
            </div>
          </section>
          <section>
            <q-editor
              v-model="newNode.description"
              style="width: 98%"
              class="q-editor node-card-details"
            />
          </section>
          <section>
            <div class="row justify-start q-pb-lg q-ml-lg">
              <q-select
                v-model="newNode.node_type"
                :options="ibis_node_type_list"
                label="Type"
                style="width: 25%"
              />
            </div>
          </section>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <q-select
              v-model="newNode.status"
              :options="publication_state_list"
              label="Status"
              style="width: 75%"
            />
          </div>
          <div class="row justify-center q-pb-lg">
            <q-btn
              v-if="newNode.id"
              label="Update"
              @click="updateNode"
              color="primary"
              class="q-mr-md q-ml-md"
            />
            <q-btn
              v-if="!newNode.id"
              label="Add"
              @click="addNode"
              color="primary"
              class="q-mr-md q-ml-md"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import {
  ibis_node_type_list,
  publication_state_list,
  public_private_bool,
} from "../enums";
import app from "../App.vue";
import {
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import {
  QuestsState,
  QuestsActionTypes,
  QuestsGetterTypes,
} from "../store/quests";
import {
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import {
  MemberState,
  MemberGetterTypes,
  MemberActionTypes,
} from "../store/member";
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
} from "../enums";
import {
  Quest,
  Guild,
  GamePlay,
  Casting,
  ConversationNode,
  Member,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";

@Component<GamePlayPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    questCard: questCard,
    nodeCard: nodeCard,
  },
  computed: {
    ...mapState("conversation", {
      newNode: (state: ConversationState) => state.node,
    }),
    ...mapGetters("quests", ["getCurrentQuest", "getCurrentGamePlay"]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("conversation", [
      "getFocusNode",
      "getNeighbourhood",
      "canEdit",
      "getNode",
    ]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureQuest"]),
    ...mapActions("guilds", ["setCurrentGuild", "ensureGuild"]),
    ...mapActions("members", ["fetchMemberById", "ensureMembersById"]),
    ...mapActions("conversation", [
      "ensureConversationNeighbourhood",
      "createConversationNode",
      "updateConversationNode",
    ]),
  },
})
export default class GamePlayPage extends Vue {
  data() {
    return {
      ibis_node_type_list,
      publication_state_list,
      public_private_bool,
    };
  }
  //data
  guildId: number;
  questId: number;

  // declare state bindings for TypeScript
  newNode: ConversationState["node"];

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getMemberById: MembersGetterTypes["getMemberById"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getNeighbourhood: ConversationGetterTypes["getNeighbourhood"];
  canEdit: ConversationGetterTypes["canEdit"];
  getNode: ConversationGetterTypes["getNode"];
  // declare the action attributes for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  fetchMemberById: MembersActionTypes["fetchMemberById"];
  ensureConversationNeighbourhood: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureMemberById: MembersActionTypes["ensureMemberById"];
  createConversationNode: ConversationActionTypes["createConversationNode"];
  updateConversationNode: ConversationActionTypes["updateConversationNode"];
  getQuestCreator() {
    return this.getMemberById(this.getCurrentQuest.creator);
  }
  async addNode() {
    try {
      this.newNode.quest_id = this.questId;
      this.newNode.guild_id = this.guildId;
      this.newNode.parent_id = this.getFocusNode.id;

      await this.createConversationNode({ data: this.newNode });
      this.$q.notify({
        message: `Added node to conversation`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding new node.`,
        color: "negative",
      });
    }
  }
  async updateNode() {
    try {
      await this.updateConversationNode({ data: this.newNode });
      this.$q.notify({
        message: `Root node updated`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding root node.`,
        color: "negative",
      });
    }
  }
  async beforeMount() {
    this.guildId = Number.parseInt(this.$route.params.guild_id);
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await app.userLoaded;
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.setCurrentGuild(this.guildId),
      this.ensureQuest({ quest_id: this.questId }),
      this.ensureGuild({ guild_id: this.guildId }),
    ]);
    const node_id = this.getCurrentGamePlay.focus_node_id;
    await this.ensureConversationNeighbourhood({
      node_id,
      quest_id: this.questId,
    });
    const quest = this.getCurrentQuest;
    await this.ensureMemberById(quest.creator);
    // const creator = this.getMemberById(quest.creator);
  }
}
</script>
<style scoped>
.node-card {
  width: 100%;
  border: 3px solid black;
  background-color: rgb(158, 181, 243);
}
.node-card-details {
  background-color: white;
  color: rgb(39, 11, 194);
  text-align: left;
  font-size: 1.2em;
  padding-top: 3%;
  padding-left: 1%;
  padding-right: 1%;
  border: 1px solid gray;
  width: 80%;
}
.node-card-title {
  border: 1px solid gray;
  background-color: lightgray;
  color: rgb(39, 11, 194);
}
.node-card-data {
  text-align: left;
  font-size: 1.2em;
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
}
</style>
