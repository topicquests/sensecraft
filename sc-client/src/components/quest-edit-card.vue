<template>
  <q-card class="items-center">
    <div v-if="edit">
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
          v-if="quest.status != 'draft' && quest.status != 'registration'"
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
            quest.status != 'draft' &&
            quest.status != 'registration' &&
            quest.status != 'ongoing'
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
            quest.status != 'draft' &&
            quest.status != 'registration' &&
            quest.status != 'ongoing'
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
      </div>
      <div class="q-pa-md q-gutter-sm">
        <p style="color: black; background-color: white">
          Status: {{ quest.status }}
        </p>
      </div>
    </div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <q-input
        class="field-name q-pt-md"
        v-model="quest.name"
        :style="{ width: '400px' }"
        label="Quest title"
        name="name"
        id="name"
        filled
      />
    </div>
    <div class="row justify-start q-pb-xs q-ml-lg">Description<br /></div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <q-editor
        v-model="quest.description"
        name="description"
        id="q-editor"
        style="background-color: lightgrey"
      ></q-editor>
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
        <div class="col-6">
          <div class="q-pa-md" style="max-width: 400px">
            <q-input 
              filled 
              v-model="quest.start" 
              name="startDate">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date 
                      v-model="quest.start" 
                      mask="YYYY-MM-DD HH:mm">
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
      
      <div class="col-6">
        
          <div class="q-pa-md" style="max-width: 400px">
            <q-input filled v-model="quest.end" name="endDate">
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
       
      </div>
    </div>
    <div class="row justify-start q-pa-lg q-ml-lg q-gutter-sm">
      <q-option-group
        v-model="quest.turn_based"
        :options="turn_based_bool"
        color="primary"
        inline
      />
    </div>
    <div
      class="row justify-start q-pa-lg q-ml-lg q-gutter-sm"
      v-if="quest.turn_based && quest.status == 'ongoing'"
    >
      <q-btn @click="doEndTurn" label="End Turn" />
    </div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <q-input
        class="field-name"
        style="width: 300px"
        name="handle"
        v-model="quest.handle"
        label="Quest handle"
        filled
      />
    </div>
    <div class="row justify-center q-pb-lg">
      <div v-if="edit">
        <q-btn
          label="update"
          name="updateQuestBtn"
          @click="doUpdateQuest"
          color="primary"
          class="q-mr-md q-ml-md"
        />
      </div>
      <div v-else>
        <q-btn
          label="Create"
          name="updateQuestBtn"
          @click="doUpdateQuest"
          color="primary"
          class="q-mr-md q-ml-md"
        />
      </div>
      <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { Quest, QuestData } from "../types";
import { public_private_bool, quest_status_type } from "../enums";
import { DateTime } from "luxon";
import { useQuestStore } from "src/stores/quests";
import { useQuasar } from "quasar";
import { ref } from "vue";

const turn_based_bool = [
  {
    label: "Continuous",
    value: true,
  },
  {
    label: "Turn-based",
    value: false,
  },
];

const QuestCardProps = defineProps<{
    thisQuest: Partial<QuestData>;
    edit: boolean,
    create: boolean,
   
}>();
const questStore = useQuestStore();
const quest = ref<Partial<Quest>>(QuestCardProps.thisQuest) ;
const $q = useQuasar();
const emit = defineEmits(['doUpdateQuest']);

async function doEndTurn() {
  try {
    await questStore.endTurn({ data: { quest_id: quest.value.id } });
    $q.notify({
      type: "positive",
      message: "Turn ended",
    });
  } catch (e) {
    $q.notify({
      type: "negative",
      message: "Could not end turn",
    });
  }
}
function updateStatus(value: quest_status_type) {
  const dt = DateTime.now();
  if (value == "registration") {
    $q.notify({
      message: "Don't forget to create first conversation node",
      color: "positive",
    });
  }
  if (value == "ongoing") {
    quest.value.start = dt.toString();
  }
  if (value == "finished") {
    quest.value.end = dt.toString();
  }
  quest.value.status = value;
}
function doUpdateQuest() {
  console.log("Quest ", quest.value);
  const createdQuest:Partial<QuestData> = Object.assign(quest.value)
  emit("doUpdateQuest", createdQuest);
}
</script>
<style>
#q-editor {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  width: 90%;
}

#quest-card {
  width: 90%;
}
</style>
