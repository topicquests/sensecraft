<template>
  <q-card class="quest-card">
    <!-- Quest Status Controls -->
    <section v-if="edit" class="q-pa-md">
      <div class="text-h6 q-mb-sm">Quest Status</div>
      <div class="row q-gutter-sm q-mb-md flex-wrap">
        <!-- Draft -->
        <q-btn
          :color="quest.status === 'draft' ? 'yellow' : 'grey'"
          :text-color="statusTextColor(quest.status === 'draft' ? 'yellow' : 'grey')"
          label="Draft"
          :disable="quest.status !== 'draft'"
          @click="updateStatus('draft')"
        />
        <!-- Registration -->
        <q-btn
          :color="registrationColor"
          :text-color="statusTextColor(registrationColor)"
          label="Registration"
          data-test="registration-btn"
          :disable="
            (quest.status !== 'draft' && quest.status !== 'registration') ||
            (quest.status === 'draft' && !hasRootNode)
          "
          @click="
            quest.status === 'draft' &&
              hasRootNode &&
              updateStatus('registration')
          "
        />
        <!-- Ongoing -->
        <q-btn
          :color="ongoingColor"
          :text-color="statusTextColor(ongoingColor)"
          label="Ongoing"
          :disable="
            quest.status !== 'registration' && quest.status !== 'ongoing'
          "
          @click="quest.status === 'registration' && updateStatus('ongoing')"
        />
        <!-- Finished -->
        <q-btn
          :color="finishedColor"
          :text-color="statusTextColor(finishedColor)"
          label="Finished"
          :disable="quest.status !== 'ongoing' && quest.status !== 'finished'"
          @click="quest.status === 'ongoing' && updateStatus('finished')"
        />
      </div>
      <p class="text-body1 q-mb-none">
        <strong>Current:</strong> {{ quest.status }}
      </p>
      <p
        v-if="quest.status === 'draft' && !hasRootNode"
        class="text-negative q-mt-sm q-mb-none"
      >
        The first conversation node must be created before this quest can
        progress to Registration or any later phase.
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
  hasRootNode?: boolean;
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

// 'green'/'primary' are dark enough to need white text; 'yellow'/'grey' read
// better with dark text — keeps status buttons legible across all states.
function statusTextColor(bg: string): string {
  return bg === 'green' || bg === 'primary' ? 'white' : 'black';
}

const registrationColor = computed(() =>
  quest.value.status === 'registration'
    ? 'green'
    : quest.value.status === 'draft' && props.hasRootNode
      ? 'primary'
      : 'grey',
);
const ongoingColor = computed(() =>
  quest.value.status === 'ongoing'
    ? 'green'
    : quest.value.status === 'registration'
      ? 'primary'
      : 'grey',
);
const finishedColor = computed(() =>
  quest.value.status === 'finished'
    ? 'green'
    : quest.value.status === 'ongoing'
      ? 'primary'
      : 'grey',
);

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

<style scoped>
.quest-card {
  border-radius: var(--sc-radius-lg);
}
.quest-card-editor {
  border-radius: var(--sc-radius-sm);
  border: 1px solid var(--sc-color-border);
  padding: var(--sc-space-8);
  background-color: var(--sc-color-bg);
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
}
.quest-title-input {
  background-color: var(--sc-color-bg);
  border-radius: var(--sc-radius-sm);
  border: 1px solid var(--sc-color-border);
  font-weight: var(--sc-font-weight-semibold);
}
</style>
