<template>
  <q-page class="bg-secondary" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-xs q-mt-md" style="width: 75%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="col-12" style="width: 100%">
      <h4 class="q-pb-sm q-ma-sm">Edit Quest</h4>
    </div>
    <div class="column items-center" v-if="getCurrentQuest">
      <div class="col-6 q-mb-xs q-mt-md q-pa-sm" style="width: 55%">
        <q-card class="items-center">
          <div class="row justify-start q-pa-lg q-ml-lg q-gutter-sm">
            <q-option-group
              v-model="quest.public"
              :options="public_private_bool"
              color="primary"
              inline
            >
            </q-option-group>
          </div>
          <div class="q-pa-md q-gutter-sm">
            <q-btn-group>
              <q-btn
                v-model="quest.status"
                v-if="quest.status != 'draft'"
                color="grey"
                text-color="black"
                label="draft"
                :disable="true"
              />
              <q-btn
                v-model="quest.status"
                v-else
                color="yellow"
                text-color="black"
                label="draft"
              />
              <q-btn
                v-model="quest.status"
                v-if="
                  getCurrentQuest.status != 'draft' &&
                  getCurrentQuest.status != 'registration'
                "
                color="grey"
                text-color="black"
                label="registration"
                :disable="true"
              />
              <q-btn
                v-model="quest.status"
                v-else-if="quest.status == 'draft'"
                color="green"
                text-color="black"
                label="registration"
                value="registration"
                @click="updateStatus('registration')"
              />
              <q-btn
                v-model="quest.status"
                v-else
                color="red"
                text-color="black"
                label="registration"
              />
              <q-btn
                v-model="quest.status"
                v-if="
                  getCurrentQuest.status != 'draft' &&
                  getCurrentQuest.status != 'registration' &&
                  getCurrentQuest.status != 'ongoing'
                "
                color="grey"
                text-color="black"
                label="ongoing"
                :disable="true"
              />
              <q-btn
                v-model="quest.status"
                v-else-if="quest.status == 'registration'"
                color="green"
                text-color="black"
                label="Start"
                @click="updateStatus('ongoing')"
              />
              <q-btn
                v-model="quest.status"
                v-else
                color="red"
                text-color="black"
                label="Start"
              />
              <q-btn
                v-model="quest.status"
                v-if="
                  getCurrentQuest.status != 'draft' &&
                  getCurrentQuest.status != 'registration' &&
                  getCurrentQuest.status != 'ongoing'
                "
                color="grey"
                text-color="black"
                label="finished"
                :disable="true"
              />
              <q-btn
                v-model="quest.status"
                v-else-if="quest.status == 'ongoing'"
                color="green"
                text-color="black"
                label="finished"
                @click="updateStatus('finished')"
              />
              <q-btn
                v-model="quest.status"
                v-else
                color="red"
                text-color="black"
                label="finished"
              />
            </q-btn-group>
          </div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <p style="color: black; background-color: white">
              Status: {{ getCurrentQuest.status }}
            </p>
          </div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <q-input
              class="field-name"
              v-model="quest.name"
              label="Quest name"
              style="width: 350px"
            />
          </div>
          <div class="row justify-start q-pb-xs q-ml-lg">Description<br /></div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="quest.description" class="q-editor"></q-editor>
          </div>
          <div class="row">
            <div class="col-6 q-pl-md">
              <span>Start</span>
            </div>
            <div class="col-6 q-pl-md">
              <span>End</span>
            </div>
          </div>
          <div class="row">
            <template>
              <div class="col-6">
                <div class="q-pa-md" style="max-width: 400px">
                  <q-input filled v-model="quest.start">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date v-model="quest.start" mask="YYYY-MM-DD HH:mm">
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>

                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-time v-model="quest.start" mask="YYYY-MM-DD HH:mm">
                            format24h >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </template>
            <div class="col-6">
              <template>
                <div class="q-pa-md" style="max-width: 400px">
                  <q-input filled v-model="quest.end">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date v-model="quest.end" mask="YYYY-MM-DD HH:mm"
                            >>
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>

                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-time v-model="quest.end" mask="YYYY-MM-DD HH:mm">
                            format24h >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </template>
            </div>
          </div>
          <div class="row justify-start q-pb-lg q-ml-lg">
            <span label="Handle">{{ getCurrentQuest.handle }}</span>
          </div>
          <div class="row justify-center q-pb-lg">
            <q-btn
              label="Submit"
              @click="doSubmitQuest"
              color="primary"
              class="q-mr-md q-ml-md"
            />
            <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
          </div>
        </q-card>
      </div>
    </div>
    <div class="col-4 q-ma-sm">
      <h4 v-if="!node.id">New Conversation Node</h4>
      <h4 v-if="node.id">Update Conversation Node</h4>
    </div>
    <div class="column items-center">
      <node-form
        :nodeInput="node"
        :editing="true"
        :ibisTypes="base_ibis_types"
        v-on:action="editNode"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import nodeForm from "../components/node-form.vue";
import Component from "vue-class-component";
import { userLoaded } from "../boot/userLoaded";
import Vue from "vue";
import { DateTime } from "luxon";
import {
  quest_status_list,
  public_private_bool,
  ibis_node_type_enum,
} from "../enums";
import { Quest, ConversationNode } from "../types";
import { MemberState, MemberActionTypes } from "../store/member";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import { BaseGetterTypes } from "../store/baseStore";

@Component<QuestEditPage>({
  meta: (c) => ({
    title: `Quest edit - ${c.getCurrentQuest?.name}`,
  }),
  components: {
    scoreboard: scoreboard,
    member: member,
    nodeForm: nodeForm,
  },
  computed: {
    ...mapState("member", ["member"]),
    ...mapGetters("quests", ["isQuestMember", "getCurrentQuest"]),
    ...mapGetters("conversation", ["getRootNode", "getConversation"]),
    ...mapGetters(["hasPermission"]),
    node: function (): Partial<ConversationNode> {
      return this.getRootNode || this.defaultNode;
    },
    quest: function (): Quest {
      return this.getCurrentQuest;
    },
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "updateQuest", "ensureQuest"]),
    ...mapActions("conversation", [
      "ensureConversation",
      "createConversationNode",
      "updateConversationNode",
      "fetchConversationNeighbourhood",
      "fetchRootNode",
    ]),
  },
})
export default class QuestEditPage extends Vue {
  ready = false;
  public_private_bool = public_private_bool;
  quest_status_list = quest_status_list;
  publication_state_list;
  isAdmin: true;
  quest_id: number;

  // declare the computed attributes for Typescript
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  member: MemberState["member"];
  isQuestMember: QuestsGetterTypes["isQuestMember"];
  getRootNode: ConversationGetterTypes["getRootNode"];
  getConversation: ConversationGetterTypes["getConversation"];
  hasPermission: BaseGetterTypes["hasPermission"];
  updateQuest!: QuestsActionTypes["updateQuest"];
  ensureQuest!: QuestsActionTypes["ensureQuest"];
  ensureConversation!: ConversationActionTypes["ensureConversation"];
  ensureLoginUser!: MemberActionTypes["ensureLoginUser"];
  createConversationNode!: ConversationActionTypes["createConversationNode"];
  updateConversationNode!: ConversationActionTypes["updateConversationNode"];
  fetchConversationNeighbourhood!: ConversationActionTypes["fetchConversationNeighbourhood"];
  fetchRootNode!: ConversationActionTypes["fetchRootNode"];
  setCurrentQuest!: QuestsActionTypes["setCurrentQuest"];
  node!: Partial<ConversationNode>;
  quest!: Quest;

  defaultNode = {
    quest_id: undefined,
    title: "",
    description: "",
    status: "private_draft",
    node_type: "question",
  };
  base_ibis_types = [ibis_node_type_enum.question];

  async editNode(node) {
    if (this.node.id) {
      await this.updateNode(node);
    } else {
      await this.addNode(node);
    }
  }
  async addNode(node) {
    try {
      const data = { ...this.node, ...node };
      data.quest_id = this.quest_id;
      await this.createConversationNode({ data });
      this.$q.notify({
        message: `Added node to conversation`,
        color: "positive",
      });
      await this.fetchRootNode({ params: { quest_id: this.quest_id } });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding new node.`,
        color: "negative",
      });
    }
  }

  async updateNode(node) {
    try {
      const data = { ...this.node, ...node };
      await this.updateConversationNode({ data });
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

  updateStatus(value) {
    const dt = DateTime.now();
    if (value == "registration") {
      this.$q.notify({
        message: "Don't forget to create first conversation node",
        color: "positive",
      });
    }
    if (value == "ongoing") {
      this.quest.start = dt.toString();
    }
    if (value == "finished") {
      this.quest.end = dt.toString();
    }
    this.quest.status = value;
  }
  validateStartEnd() {
    if (this.quest.start < this.quest.end) {
      return true;
    }
    return false;
  }

  async doSubmitQuest() {
    try {
      if (!this.validateStartEnd()) {
        console.log(this.validateStartEnd());
        throw "End date is before start date";
      }
      console.log(this.validateStartEnd());
      await this.updateQuest({
        data: this.quest,
      });
      this.$q.notify({
        message: "Quest was updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating quest ", err);
      this.$q.notify({
        message: `There was an error updating quest. If this issue persists, contact support.`,
        color: "negative",
      });
    }
  }

  async beforeMount() {
    this.quest_id = Number.parseInt(this.$route.params.quest_id);
    await userLoaded;
    await this.setCurrentQuest(this.quest_id);
    await this.ensureQuest({ quest_id: this.quest_id });
    await this.ensureConversation(this.quest_id);
    // const questMembership = this.isQuestMember(this.quest_id);

    if (this.getConversation.length > 0) {
      await this.fetchRootNode({ params: { quest_id: this.quest_id } });
    }
    this.ready = true;
  }
}
</script>

<style>
.name-field {
  transition: width 0.36s;
  width: 1500px;
}
.details {
  max-width: 1500px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}

h4 {
  text-align: center;
}
.q-editor {
  width: 80%;
  border: 1px solid black;
}
</style>
