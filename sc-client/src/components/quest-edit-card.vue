<template>
  <q-card class="quest-card">
    <!-- Quest Status Controls -->
    <section v-if="edit" class="q-pa-md">
      <div class="text-h6 q-mb-sm">Quest Status</div>
      <div class="row q-gutter-sm q-mb-md flex-wrap">
        <!-- Draft -->
        <q-btn
          :color="quest.status === 'draft' ? 'yellow' : 'grey'"
          text-color="black"
          label="Draft"
          :disable="quest.status !== 'draft'"
          @click="updateStatus('draft')"
        />
        <!-- Registration -->
        <q-btn
          :color="
            quest.status === 'registration'
              ? 'green'
              : quest.status === 'draft'
                ? 'primary'
                : 'grey'
          "
          text-color="black"
          label="Registration"
          data-test="registration-btn"
          :disable="quest.status !== 'draft' && quest.status !== 'registration'"
          @click="quest.status === 'draft' && updateStatus('registration')"
        />
        <!-- Ongoing -->
        <q-btn
          :color="
            quest.status === 'ongoing'
              ? 'green'
              : quest.status === 'registration'
                ? 'primary'
                : 'grey'
          "
          text-color="black"
          label="Ongoing"
          :disable="
            quest.status !== 'registration' && quest.status !== 'ongoing'
          "
          @click="quest.status === 'registration' && updateStatus('ongoing')"
        />
        <!-- Finished -->
        <q-btn
          :color="
            quest.status === 'finished'
              ? 'green'
              : quest.status === 'ongoing'
                ? 'primary'
                : 'grey'
          "
          text-color="black"
          label="Finished"
          :disable="quest.status !== 'ongoing' && quest.status !== 'finished'"
          @click="quest.status === 'ongoing' && updateStatus('finished')"
        />
      </div>
      <p class="text-body1 q-mb-none">
        <strong>Current:</strong> {{ quest.status }}
      </p>
    </section>

    <!-- Title -->
    <div class="q-pa-md">
      <q-input
        v-model="quest.name"
        label="Title"
        data-test="quest-title-input"
      />

    </div>

    <!-- Description -->
    <div class="q-pa-md">
      <label class="text-subtitle1 q-mb-xs">Description</label>
      <q-editor
        v-model="description"
        data-test="description-editor"
        class="quest-card-editor full-width"
        :toolbar="[['bold', 'italic', 'underline', 'strike']]"
      />
    </div>

    <!-- Dates -->
    <div class="row q-pa-md q-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          filled
          v-model="quest.start"
          name="startDate"
          label="Start Date"
          data-test="start-input"
          input-class="start-input"
        >
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="quest.start" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
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
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6">
         <q-input
          filled
          v-model="quest.end"
          name="endDate"
          label="End Date"
          data-test="end-input"
          input-class="end-input"
        > 
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
                    <q-btn v-close-popup label="Close" color="primary" flat />
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
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Turn-based Options -->
    <div class="q-pa-md">
      <q-option-group
        v-model="quest.turn_based"
        :options="turn_based_bool"
        color="primary"
        inline
      />
      <div
        v-if="quest.turn_based && quest.status === 'ongoing'"
        class="q-mt-sm"
      >
        <q-btn 
          @click="doEndTurn" 
          label="End Turn" 
          color="primary" />
      </div>
    </div>

    <!-- Quest Handle -->
    <div class="q-pa-md">
      <q-input
        filled
        v-model="quest.handle"
        label="Handle"
        input-class="quest-handle-input"
      />
    </div>
    <!-- Action Buttons -->
    <div class="row justify-center q-pa-md q-gutter-md">
      <q-btn
        :label="edit ? 'Update' : 'Create'"
        color="primary"
        @click="doUpdateQuest"
        :data-test="edit ? 'update-quest-btn' : 'create-quest-btn'"
      />

      <q-btn
        label="Cancel"
        color="primary"
        outline
        @click="router.push({ name: 'home' })"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { Quest } from '../types';
import { quest_status_type } from '../enums';
import { DateTime } from 'luxon';
import { useQuestStore } from '../stores/quests';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  thisQuest: Partial<Quest>
  edit: boolean;
  create: boolean;
}>();
const router = useRouter();
const questStore = useQuestStore();
const $q = useQuasar();
const emit = defineEmits(['doUpdateQuest']);

const quest = ref<Partial<Quest>>({
  ...props.thisQuest,
  start: props.thisQuest.start ?? undefined,
  end: props.thisQuest.end ?? undefined,
});

const turn_based_bool = [
  { label: 'Continuous', value: false },
  { label: 'Turn-based', value: true },
];

const description = computed({
  get: () => quest.value.description || '',
  set: (v) => (quest.value.description = v),
});

watch(
  () => props.thisQuest,
  (n) => (quest.value = { ...n }),
);

async function doEndTurn() {
  try {
    await questStore.endTurn({ quest_id: quest.value.id });
    $q.notify({ type: 'positive', message: 'Turn ended' });
  } catch {
    $q.notify({ type: 'negative', message: 'Could not end turn' });
  }
}

function updateStatus(value: quest_status_type) {
  const now = DateTime.now().toString();
  if (value === 'registration') {
    $q.notify({
      message: "Don't forget to create first conversation node",
      color: 'positive',
    });
  }
  if (value === 'ongoing') quest.value.start = now;
  if (value === 'finished') quest.value.end = now;
  quest.value.status = value;
}

function doUpdateQuest() {
  emit('doUpdateQuest', { ...quest.value } as Quest);
}
</script>

<style>
.quest-card {
  background-color: #f5f7ff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  color: #1a237e;
}
.quest-card-editor {
  border-radius: 6px;
  border: 1px solid #c0c0c0;
  padding: 0.5em;
  background-color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
}
.quest-title-input {
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #c0c0c0;
  font-weight: 600;
}
</style>
