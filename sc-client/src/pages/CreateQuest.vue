<template>
  <q-page class="bg-secondary create-quest-page">
    <div class="row justify-center">
      <q-card class="create-quest-card q-mt-md q-pa-md">
        <div>
          <member_handle></member_handle>
        </div>
        <div class="column items-center q-ma-sm q-pa-xs">
          <div class="col-4 q-ma-sm q-pa-sm" style="width: 55%">
            <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Quest</h4>
          </div>
        </div>
        <div class="row justify-center">
          <div class="quest-card-1 q-mr-md" v-if="newQuest">
            <quest-card
              :thisQuest="newQuest"
              :create="true"
              :edit="false"
              v-on:doUpdateQuest="doSubmitQuest"
            ></quest-card>
          </div>
          <div class="quest-list-1">
            <div class="quest-list-header">
              <h5>Existing Quests</h5>
            </div>
          <quest-list
            :quests="quests"
            :status="status"
          />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import member_handle from '../components/member-handle.vue';
import { waitUserLoaded } from '../app-access';
import QuestCard from '../components/quest-edit-card.vue';
import { useQuestStore } from '../stores/quests';
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { Quest, QuestData } from '../types';
import { quest_status_enum } from '../enums';
import QuestList from '../components/quest-list.vue';

const router = useRouter();
const $q = useQuasar();
const questStore = useQuestStore();

const quests:QuestData[] = questStore.getQuests;
const status: string[] = [
  quest_status_enum.registration,
  quest_status_enum.ongoing,
  quest_status_enum.finished
]

const newQuest: Quest = {
  name: '',
  handle: '',
  status: 'draft',
  public: true,
  description: '',
  start: '',
  end: '',
  id: 0,
  slug: '',
  creator: 0,
  turn_based: false,
  created_at: '',
  updated_at: ''
};

function validateStartEnd(quest: Partial<QuestData>) {
  if (quest.start && quest.end && quest.start < quest.end) {
    return true;
  }
  return false;
}

async function doSubmitQuest(quest: Quest) {
  try {
    if (!validateStartEnd(quest)) {
      throw 'End date is before start date';
    }
    const res = await questStore.createQuest(quest);
    $q.notify({
      message: 'Quest was updated successfully',
      color: 'positive',
    });
    await router.push({ name: 'quest_edit', params: { quest_id: res.id } });
  } catch (err) {
    console.log('there was an error in updating quest ', err);
    $q.notify({
      message: `There was an error updating quest. If this issue persists, contact support.`,
      color: 'negative',
    });
  }
}
onBeforeMount(async () => {
  await waitUserLoaded();
  await questStore.ensureAllQuests();
});
</script>

<style>
.create-quest-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.create-quest-card {
  width: 85%;
  background-color: transparent;
}

.quest-card-1 {
  flex: 0 0 50%;
  background-color: transparent;
}

.quest-list-1 {
  flex: 0 0 40%;
  background-color: transparent;
  max-height: 80vh;
  overflow-y: auto;
}
.quest-list-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 2px;
  margin-bottom: 2px;
  text-align: center;
  color: yellowgreen;
}

/* Responsive: stack vertically on small screens */
@media only screen and (max-width: 1200px) {
  .quest-card-1,
  .quest-list-1 {
    flex: 0 0 100%;
  }
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
    background-color: transparent;
  }
}
@media only screen and (max-width: 800px) {
  .create-quest-card {
    width: 98%;
    background-color: transparent;
  }
}
@media only screen and (max-width: 1200px) {
  .quest-card-1 {
    width: 98%;
    background-color: transparent;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
</style>
