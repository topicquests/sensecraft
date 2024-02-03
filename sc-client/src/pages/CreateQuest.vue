<template>
  <q-page class="bg-secondary">
    <div class="row justify-center">
      <q-card class="create-quest-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center q-ma-sm q-pa-xs">
          <div class="col-4 q-ma-sm q-pa-sm" style="width: 55%">
            <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Quest</h4>
          </div>
        </div>
        <div class="row justify-center">
          <div class="column quest-card-1" v-if="newQuest">
            <quest-card
              v-bind:thisQuest="newQuest"
              :create="true"
              v-on:doUpdateQuest="doSubmitQuest"
            ></quest-card>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import QuestCard from "../components/quest-edit-card.vue";
import { useQuestStore } from "src/stores/quests";
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const router = useRouter();
const $q = useQuasar();
const questStore = useQuestStore();

  group: "public";
  public_private_bool: public_private_bool;
  shape: "line";
  submitResult: [];
  details: "";
  handle: "";
  type: false;
  const newQuest = {
    name: "",
    handle: "",
    status: "draft",
    public: true,
    description: "",
    start: "",
    end: "",
  };

  function validateStartEnd(quest) {
    if (quest.start < quest.end) {
      return true;
    }
    return false;
  }

  async function  doSubmitQuest(quest) {
    try {
      console.log("Entered in do update quest");
      if (!validateStartEnd(quest)) {
        throw "End date is before start date";
      }
      const res = await questStore.createQuest({ data: quest });
      $q.notify({
        message: "Quest was updated successfully",
        color: "positive",
      });
      router.push({ name: "quest_edit", params: { quest_id: res.id } });
    } catch (err) {
      console.log("there was an error in updating quest ", err);
      $q.notify({
        message: `There was an error updating quest. If this issue persists, contact support.`,
        color: "negative",
      });
    }
  }
  onBeforeMount(async () => {
    await userLoaded;
  }
</script>

<style>
.create-quest-card {
  width: 75%;
}
.quest-card-1 {
  width: 60%;
}
.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
#h4 {
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: underline;
  text-align: center;
}
@media only screen and (max-width: 1300px) {
  .create-quest-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .create-quest-card {
    width: 98%;
  }
}
@media only screen and (max-width: 1200px) {
  .quest-card-1 {
    width: 98%;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
</style>
