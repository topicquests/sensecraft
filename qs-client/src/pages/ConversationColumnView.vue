<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row">
      <div class="column items-center">
        <div class="col-4 q-pa-lg" style="width: 1000px">
          <h4>
            <img style="margin-right: 4px" src="icons/quest.png" />{{
              currentQuest.name
            }}
          </h4>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="column items-center">
        <div class="col-4 q-pa-lg" style="width: 1000px">
          <div v-html="currentQuest.description"></div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="column items-center">
        <div class="col-4 q-pa-lg" style="width: 1000px">
          <q-card>
            <div class="columnscroller">
              <div class="columncontainer">
                <div class="column headerNode" style="text-align: center">
                  <img
                    class="headerimage"
                    src="icons/ibis/issue_sm.png"
                  />Question
                  <a
                    v-if="isAuthenticated"
                    title="Respond"
                    :href="'/conversation/newquestion/' + this.node_id"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
                <div class="column headerNode" style="text-align: center">
                  <img
                    class="headerimage"
                    src="icons/ibis/position_sm.png"
                  />Answer
                  <a
                    v-if="isAuthenticated"
                    :href="'/conversation/newanswer/' + this.node_id"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
                <div class="column headerNode" style="text-align: center">
                  <img class="headerimage" src="icons/ibis/plus_sm.png" />Pro
                  <a
                    v-if="isAuthenticated"
                    :href="'/conversation/newpro/' + this.node_id"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
                <div class="column headerNode" style="text-align: center">
                  <img class="headerimage" src="icons/ibis/minus_sm.png" />Con
                  <a
                    v-if="isAuthenticated"
                    :href="'/conversation/newcon/' + this.node_id"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
                <div class="column headerNode" style="text-align: center">
                  <img
                    class="headerimage"
                    src="icons/ibis/reference_sm.png"
                  />Refs
                  <a
                    v-if="isAuthenticated"
                    :href="'/conversation/newref/' + this.node_id"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
              </div>
              <!-- end column headers -->
              <div class="datacontainer">
                <!-- start column data -->
                <div
                  class="datacolumn node"
                  v-for="question in this.questions"
                  :key="question.id"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: question.id, context: '' },
                    }"
                    >{{ question.title }}</router-link
                  >
                </div>
                <div
                  class="datacolum node"
                  v-for="answer in this.answers"
                  :key="answer.id"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: answer.id, context: '' },
                    }"
                    >{{ answer.title }}</router-link
                  >
                </div>
                <div
                  class="datacolumn node"
                  v-for="pro in this.pros"
                  :key="pro.id"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: pro.id, context: '' },
                    }"
                    >{{ pro.title }}</router-link
                  >
                </div>
                <div
                  class="datacolumn node"
                  v-for="con in this.cons"
                  :key="con.id"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: con.id, context: '' },
                    }"
                    >{{ con.title }}</router-link
                  >
                </div>
                <div
                  class="datacolumn node"
                  v-for="ref in this.refs"
                  :key="ref.id"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: ref.id, context: '' },
                    }"
                    >{{ ref.title }}</router-link
                  >
                </div>
              </div>
              <!-- edd colum data -->
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ConversationNode, Quest, Guild, Role } from "../types";
import { mapState, mapGetters, mapActions } from "vuex";
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
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
} from "src/store/conversation";
import { MemberState, MemberGetterTypes } from "../store/member";
import { RoleState } from "../store/role";
import { userLoaded } from "../boot/userLoaded";
import { ibis_node_type_enum } from "../enums";

const ConversationColumnProps = Vue.extend({
  props: {
    node_id: Number,
    currentQuestId: Number,
    currentGuildId: Number || null,
  },
});

@Component<ConversationColumnView>({
  computed: {
    ...mapState("quests", ["currentQuest"]),
    ...mapState("member", ["member"]),
    ...mapState("conversation", ["neighbourhood", "node"]),

    ...mapGetters("quests", ["getQuestById", "getQuests"]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "canMakeMeta",
      "getNeighbourhoodTree",
      "getChildrenOf",
    ]),
    parent_node: function (): ConversationNode {
      return this.neighbourhood[this.node.parent_id];
    },
    children: function (): ConversationNode[] {
      const target_id = this.node_id;
      return Object.values(this.neighbourhood).filter(
        (n: ConversationNode) => n.parent_id == target_id
      ) as ConversationNode[];
    },
    questions: function (): ConversationNode[] {
      return this.children().filter(
        (n: ConversationNode) => n.node_type == ibis_node_type_enum.question
      );
    },
    pros: function (): ConversationNode[] {
      return this.children().filter(
        (n: ConversationNode) => n.node_type == ibis_node_type_enum.pro
      );
    },
    cons: function (): ConversationNode[] {
      return this.children().filter(
        (n: ConversationNode) => n.node_type == ibis_node_type_enum.con
      );
    },
    refs: function (): ConversationNode[] {
      return this.children().filter(
        (n: ConversationNode) => n.node_type == ibis_node_type_enum.reference
      );
    },
    answers: function (): ConversationNode[] {
      return this.children().filter(
        (n: ConversationNode) =>
          n.node_type == ibis_node_type_enum.answer ||
          n.node_type == ibis_node_type_enum.con_answer
      );
    },
  },
  methods: {
    ...mapActions("conversation", [
      "createConversationNode",
      "updateConversationNode",
      "ensureConversationNeighbourhood",
    ]),
    ...mapActions("guilds", ["ensureCurrentGuild"]),
    ...mapActions("members", [
      "ensureMemberById",
      "ensurePlayersOfQuest",
      "ensureMembersOfGuild",
    ]),
    ...mapActions("quests", ["ensureCurrentQuest"]),
    ...mapActions("role", ["ensureAllRoles"]),
    /*

    getImage() {
      const type = this.q.type;
      const rslt = "icons/ibis/issue.png";
      console.log("ICON", type, rslt);
      //this.q.img = rslt;
    },*/
  },
})
export default class ConversationColumnView extends ConversationColumnProps {
  currentQuest!: Quest;
  currentGuild!: Guild;
  ensureCurrentGuild: GuildsActionTypes["ensureCurrentGuild"];
  ensureCurrentQuest: QuestsActionTypes["ensureCurrentQuest"];
  ensureConversationNeighbourhood: ConversationActionTypes["ensureConversationNeighbourhood"];
  getNeighbourhoodTree: ConversationGetterTypes["getNeighbourhoodTree"];
  node: ConversationState["node"];
  parent_node: ConversationNode;
  children: ConversationNode[];
  questions: ConversationNode[];
  refs: ConversationNode[];
  pros: ConversationNode[];
  cons: ConversationNode[];
  answers: ConversationNode[];

  ready = false;
  isAuthenticated = true;

  mounted() {
    //this.initialize(this.nodeId);
    console.log("CCV mounted");
  }

  async beforeMount() {
    var node_id = (this.node_id = Number.parseInt(this.$route.params.id));
    if (this.currentGuildId) {
      await this.ensureCurrentGuild(this.currentGuildId);
    }
    await this.ensureConversationNeighbourhood({
      node_id,
      guild_id: null,
    });
    await this.ensureCurrentQuest(this.node.quest_id);
    this.ready = true;
  }
}
</script>
<style>
.q-item-image {
  min-width: 10px;
  max-width: 10px;
}

.scroll.relative-position.overflow-hidden.fit.q-touch {
  user-select: auto !important;
}

.headerimage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

.node {
  margin-top: 4px;
  float: top;
  border: 1px solid black;
  border-radius: 3px;
  min-height: 40px;
  overflow-wrap: inherit;
  font-family: pragmatica-web, sans-serif;
  white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  white-space: pre-wrap; /* css-3 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  white-space: -webkit-pre-wrap; /* Newer versions of Chrome/Safari*/
  white-space: normal;
}

.node:hover {
  background-color: rgba(255, 255, 0, 0.801);
}

/** from view.hbs */
/**
* Enable columns to scroll right and left
*/
.columnscroller {
  border: 1px solid black;
  width: 100%;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  margin: 100px;
  border-radius: 3px;
}

/**
* width is set to accomodate lots of columns.
* If they wrap when adding more columns, then
* width must increase.
* The formula seems to be column width * num colums + 100px 2500
*/
.columncontainer {
  width: 100%;
  height: 200px;
}
.datacontainer {
  width: 100%;
}

.headerimage {
  vertical-align: middle;
  margin-right: 4px;
}

.headernode {
  float: top;
  border: 1px solid black;
  border-radius: 3px;
  font-family: pragmatica-web, sans-serif;
  white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  white-space: pre-wrap; /* css-3 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  white-space: normal;
}
.column {
  height: 200px;
  float: left;
  white-space: normal;
  width: 180px;
  border: 0px solid black;
  border-radius: 3px;
  margin-left: 1px;
  margin-right: 1px;
  font-family: pragmatica-web, sans-serif;
}
.datacolumn {
  height: 400px;
  float: left;
  border: 1px solid white;
  width: 270px;
  background: white;
  overflow-x: hidden;
  overflow-y: scroll;
  break-inside: avoid;
  margin-left: 4px;
  margin-right: 4px;
}
</style>
