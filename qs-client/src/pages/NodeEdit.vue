<template>
  <q-page class="bg-secondary">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-xs q-mt-md" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-xs q-mt-md" style="width: 55%">
        <div v-if="currentNode" class="col-12 col-md q-pa-md">
          <q-card id="quest_card">
            <h4 style="text-align: center">Quest</h4>
            <q-card-section>
              <h6
                v-if="currentQuest"
                style="text-align: center; color: darkgreen"
              >
                {{ currentQuest.name }}
              </h6>
            </q-card-section>
            <q-card-section>
              <div v-if="currentQuest" style="font-size: 17px">
                <div v-html="currentQuest.description"></div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4 q-pb-xs q-mt-md" style="width: 55%">
        <div v-if="currentQuest" class="col-4">
          <q-card class="q-pa-md" id="node_card">
            <q-input
              v-model="currentNode.title"
              label="Parent Node"
              style="color: darkblue"
            />
            <q-input
              v-model="currentNode.node_type"
              label="Type"
              style="font-size: 17px; color: darkblue"
            />
            Details<br />
            <div v-html="currentNode.description" style="font-size: 17px"></div>
          </q-card>
        </div>
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4">
        <q-card v-if="currentNode">
          <div class="row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input
                v-model="currentNode.title"
                label="Node title"
                style="width: 350px"
              />
            </div>
          </div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="currentNode.node_type" label="Type" />
            </div>
            <div class="col-4">
              <ibis-button
                v-bind:node_type="node.node_type"
                v-on:click.native="questionType"
              />
            </div>
          </div>
          <div class="row justify-start q-pb-xs q-ml-lg">Description<br /></div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="currentNode.description" class="q-editor" />
          </div>
          <div class="row justify-center q-pb-lg">
            <q-btn
              label="Edit"
              @click="editNode"
              color="primary"
              class="q-mr-md q-ml-md"
            />
            <q-btn
              label="Publish"
              @click="addNode"
              color="primary"
              class="q-mr-md q-ml-md"
            />
          </div>
        </q-card>
        <q-card v-else>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input
                v-model="node.title"
                label="Node title"
                style="width: 350px"
              />
            </div>
          </div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="node.node_type" label="Type" />
            </div>
            <div class="col-4">
              <btn-question v-on:click.native="questionType"></btn-question>
            </div>
          </div>
          <div class="row justify-start q-pb-xs q-ml-lg">Description<br /></div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="node.description" class="q-editor" />
          </div>
          <div class="row justify-center q-pb-lg">
            <q-btn
              label="Add"
              @click="addNode"
              color="primary"
              class="q-mr-md q-ml-md"
            />
            <q-btn
              label="Publish"
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

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import IbisButton from "../components/ibis-btn.vue";
import { userLoaded } from "../boot/userLoaded";
import { QuestsState } from "../store/quests";
import { ConversationState } from "../store/conversation";
import { GuildsState } from "../store/guilds";
import { MemberState } from "../store/member";

export default {
  data() {
    return {
      node: {
        parent_id: null,
        quest_id: null,
        title: null,
        description: null,
        node_type: "reference",
        status: "private_draft",
      },
    };
  },
  computed: {
    ...mapState("quests", {
      currentQuest: (state) => state.currentQuest,
    }),
    ...mapState("conversation", {
      currentNode: (state) => state.node,
    }),
    ...mapState("guilds", {
      currentGuild: (state) => state.currentGuild,
    }),
    ...mapState("member", {
      member: (state) => state.member,
    }),
  },
  components: {
    scoreboard: scoreboard,
    member: member,
    IbisButton: IbisButton,
  },
  methods: {
    ...mapActions("conversation", [
      "addConversationNode",
      "getNode",
      "createConversationTree",
      "updateNode",
    ]),
    async initialize() {
      let thisNode = {
        quest_id: this.currentQuest.id,
        guild_id: this.currentGuild.id,
        creator_id: this.member.id,
      };
      const resp = await this.getNode(thisNode);
      this.show_tree();
      return "initialized";
    },
    async show_tree() {
      try {
        const resp = await this.createConversationTree();
        this.$store.commit("conversation/SHOW_TREE", true);
        return console.log("able to show tree");
      } catch (err) {
        console.log("Unable to show tree ", err);
      }
    },
    async addNode() {
      try {
        this.node.quest_id = this.currentQuest.id;
        if (this.currentNode) {
          this.node.parent_id = this.currentNode.id;
        }
        const nodeResponse = await this.addConversationNode(this.node);
        const resp = await this.show_tree();
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
    },
    async editNode() {
      try {
        const nodeUpdateResponse = await this.updateNode(this.currentNode);
        const response = await this.getNode(this.currentNode.id);
        this.$q.notify({
          message: `Edited node to conversation`,
          color: "positive",
        });
        return nodeUpdateResponse;
      } catch (err) {
        console.log("there was an error in editing node ", err);
        this.$q.notify({
          message: `There was an error editing node.`,
          color: "negative",
        });
      }
    },
  },
  async beforeMount() {
    // how do I know which node?
    await userLoaded;
    // TODO: Ensure quest, node, guild
    // this.quest.id = this.$route.params.quest_id;
    await this.initialize();
  },
};
</script>

<style>
.details {
  max-width: 1500px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
#quest_card {
  border: 3px solid black;
  font-size: 10pt;
  color: darkgreen;
  height: 400px;
}
#node_card {
  border: 3px solid black;
  font-size: 10pt;
  color: darkblue;
  height: 400px;
}
</style>
