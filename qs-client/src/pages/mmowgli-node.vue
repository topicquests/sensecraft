<template>
  <q-page>
    <div class="row">
      <div class="column items-center">
        <div class="col-4 q-pa-lg" style="width: 1000px">
          <h4>
            <img style="margin-right: 4px" :src="q.img" />{{
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
                    :href="'/conversation/newquestion/' + q.nodeId"
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
                    :href="'/conversation/newanswer/' + q.nodeId"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
                <div class="column headerNode" style="text-align: center">
                  <img class="headerimage" src="icons/ibis/plus_sm.png" />Pro
                  <a
                    v-if="isAuthenticated"
                    :href="'/conversation/newpro/' + q.nodeId"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
                <div class="column headerNode" style="text-align: center">
                  <img class="headerimage" src="icons/ibis/minus_sm.png" />Con
                  <a
                    v-if="isAuthenticated"
                    :href="'/conversation/newcon/' + q.nodeId"
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
                    :href="'/conversation/newref/' + q.nodeId"
                    ><img class="respond" src="icons/respond_sm.png"
                  /></a>
                </div>
              </div>
              <!-- end column headers -->
              <div class="datacontainer">
                <!-- start column data -->
                <div
                  class="datacolumn node"
                  v-for="question in q.questions"
                  :key="question.nodeId"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: question.nodeId, context: '' },
                    }"
                    >{{ question.label }}</router-link
                  >
                </div>
                <div
                  class="datacolum node"
                  v-for="answer in q.answers"
                  :key="answer.nodeId"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: answer.nodeId, context: '' },
                    }"
                    >{{ answer.label }}</router-link
                  >
                </div>
                <div
                  class="datacolumn node"
                  v-for="pro in q.pros"
                  :key="pro.nodeId"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: pro.nodeId, context: '' },
                    }"
                    >{{ pro.label }}</router-link
                  >
                </div>
                <div
                  class="datacolumn node"
                  v-for="con in q.cons"
                  :key="con.nodeId"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: con.nodeId, context: '' },
                    }"
                    >{{ con.label }}</router-link
                  >
                </div>
                <div
                  class="datacolumn node"
                  v-for="ref in q.refs"
                  :key="ref.nodeId"
                >
                  <router-link
                    :to="{
                      name: 'node',
                      params: { id: ref.nodeId, context: '' },
                    }"
                    >{{ ref.label }}</router-link
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

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import app from "../App";
import { QuestsState } from "../store/quests";

export default {
  props: ["id", "context"],
  data() {
    return {
      label: "",
      q: "",
      quest: null,
      nodeId: null,
    };
  },
  computed: {
    ...mapState("quests", {
      currentQuest: (state: QuestsState) => state.currentQuest,
    }),
    ...mapState("member", ["member"]),
    isAuthenticated() {
      return this.member != null;
    },
  },
  methods: {
    ...mapGetters("quests", ["getQuestById", "getQuests"]),
    ...mapGetters("conversation", ["canEdit", "getConversationById"]),
    ...mapActions("quests", ["ensureAllQuests", "setCurrentQuest"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
    async initialize(id = null) {
      //this.$store.commit('questView', true)
      const nodeId = id || Number.parseInt(this.$route.params.id);
      console.info("Initialize", "ensureing data for ", nodeId);
      //this.q = this.mock(); //this.$store.quest.getters.getNode(); //('foo')
      console.info("node", this.q);
      if (this.q !== null) {
        this.getImage();
      } else {
        this.label = "Bad";
      }
    },

    getImage() {
      const type = this.q.type;
      const rslt = "icons/ibis/issue.png";
      console.log("ICON", type, rslt);
      //this.q.img = rslt;
    },
  },
  mounted() {
    this.initialize(this.nodeId);
  },
  async beforeMount() {
    this.questId = Number.parseInt(this.$route.params.quest_id);
    await app.memberLoaded;
    await Promise.all([
      this.setCurrentQuest(this.questId),
      this.ensurQuest(this.questId),
      // TODO: Maybe only guilds playing the quest?
      // should we also get corresponding members?
      this.ensureAllGuilds(),
    ]);
  },
};
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
  float: left;
  vertical-align: middle;
  margin-right: 4px;
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
  width: 800px;
  height: 200px;
}
.datacontainer {
  width: 1200px;
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
  height: 134px;
  float: left;
  white-space: normal;
  width: 260px;
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
