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
    <div class="column items-center q-ma-sm q-pa-xs">
      <div class="col-4 q-ma-sm q-pa-sm" style="width: 55%">
        <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Quest</h4>
      </div>
    </div>
    <div class="column items-center" v-if="newQuest">
      <div class="col-12 q-mb-xs q-mt-md q-pa-sm" style="width: 55%">
        <quest-card
          v-bind:thisQuest="newQuest"
          :create="true"
          v-on:doUpdateQuest="doSubmitQuest"
        ></quest-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { mapActions} from "vuex";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import QuestCard from "../components/quest-edit-card.vue";
import Component from "vue-class-component";
import { QuestsActionTypes } from "src/store/quests";
import Vue from "vue";

@Component<CreateQuestPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    QuestCard: QuestCard,
  },
  computed: {

  },
  methods: {
    ...mapActions("quests", ["createQuest", "findquests", "setCurrentQuest"]),
  },
})
export default class CreateQuestPage extends Vue {
  group: "public";
  public_private_bool = public_private_bool;
  shape: "line";
  submitResult: [];
  details: "";
  handle: "";
  type: false;
  newQuest = {
    name: "",
    handle: "",
    status: "draft",
    public: true,
    description: "",
    start: "",
    end: "",
  };
  setCurrentQuest!: QuestsActionTypes["setCurrentQuest"]
  createQuest!: QuestsActionTypes["createQuest"];

  validateStartEnd(quest) {
    if (quest.start < quest.end) {
      return true;
    }
    return false;
  }

  async doSubmitQuest(quest) {
    try {
      console.log("Entered in do update quest")
      if (!this.validateStartEnd(quest)) {
        throw "End date is before start date";
      }
      const res = await this.createQuest({ data: quest });
      this.$q.notify({
        message: "Quest was updated successfully",
        color: "positive",
      });
      this.$router.push({ name: "quest_edit", params: { quest_id: res.id } });
    } catch (err) {
      console.log("there was an error in updating quest ", err);
      this.$q.notify({
        message: `There was an error updating quest. If this issue persists, contact support.`,
        color: "negative",
      });
    }
  }
  async beforeMount() {
    await userLoaded;
  }
}
</script>

<style>
.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
#h4 {
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: underline;
  text-align: center;
}
</style>
