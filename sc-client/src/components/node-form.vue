<template>
  <q-card v-if="node" class="node-card q-pa-md">
    <!-- URL input for reference nodes -->
    <section
      v-if="NodeFormProps.editing && selectedNodeType === 'reference'"
      class="node-card-url"
    >
      <q-input
        v-model="url"
        label="URL"
        type="url"
        placeholder="https://example.com"
        outlined
        dense
        data-test="node-url-input"
        class="node-card-url-input"
      >
        <template v-slot:prepend>
          <q-icon name="link" color="primary" />
        </template>
      </q-input>
    </section>

    <!-- Node Title -->
    <section class="node-card-title">
      <q-input
        v-model="node.title"
        label="Node Title"
        name="node-title"
        ref="title"
        outlined
        dense
        data-test="node-title-input"
        style="flex: 1 1 90%"
      >
        <template v-slot:prepend>
          <IbisButton :node_type="node.node_type as ibis_node_type_type" />
        </template>
      </q-input>
    </section>

    <!-- Node Description -->
    <section>
      <div class="section-header">Description</div>
      <q-editor
        v-if="NodeFormProps.editing"
        v-model="description"
        data-test="node-description-editor"
        class="q-mb-md node-card-editor"
        :toolbar="[['bold', 'italic', 'underline', 'strike']]"
      />
      <template v-else>
        <div class="scrollable-description">
          <div
            :style="{
              maxHeight: descriptionExpanded ? 'none' : '150px',
              overflow: 'hidden',
            }"
            v-html="description"
          />
          <div
            v-if="description.length > 200"
            class="read-more"
            @click="toggleDescription"
          >
            {{ descriptionExpanded ? 'Show Less ▲' : 'Read More ▼' }}
          </div>
        </div>
      </template>
    </section>

    <!-- Node Type & Status -->
    <section v-if="NodeFormProps.editing && !NodeFormProps.hideSelectors">
      <div class="row q-mb-md q-gutter-sm items-center">
        <ibis-button :node_type="node.node_type as ibis_node_type_type" small />
        <q-select
          v-model="selectedNodeType"
          :options="ibisTypes"
          @update:model-value="nodeTypeChanged"
          label="Type"
          outlined
          behavior="menu"
          data-test="node-type-selector"
          dense
          popup-content-class="narrow-dropdown"
          style="flex: 1; max-width: 450px; font-size: 0.8rem"
        />
      </div>

      <div class="row q-mb-md q-gutter-sm items-center">
        <q-select
          v-model="selectedStatusType"
          :options="filteredStatusOptions"
          @update:model-value="statusChanged"
          label="Status"
          data-test="node-status-selector"
          behavior="menu"
          outlined
          dense
          popup-content-class="narrow-dropdown"
          style="flex: 1; max-width: 450px; font-size: 0.8rem"
        />
      </div>

      <!-- Inline warning if published is removed -->
      <div v-if="metaValue === 'meta'" class="text-negative text-caption q-mt-xs">
        Comment nodes cannot be set to "published".
      </div>
    </section>

    <!-- Comment Node Checkbox -->
    <section class="row q-mb-md items-center">
      <q-checkbox
        v-if="allowChangeMeta && NodeFormProps.editing"
        v-model="metaValue"
        true-value="meta"
        false-value="conversation"
        label="Comment Node"
      />
      <p v-else>
        {{ node.meta === 'meta' ? 'Comment node' : 'Content node' }}
      </p>
    </section>

    <!-- Add / Update / Cancel Buttons -->
    <section class="row justify-center q-mt-lg q-gutter-sm">
      <q-btn label="Cancel" @click="cancel" color="grey" />

      <q-btn
        v-if="node.id"
        label="Update"
        data-test="update-node-btn"
        @click="action"
        color="primary"
      />
      <q-btn
        v-else
        label="Add"
        data-test="add-node-btn"
        @click="action"
        color="primary"
      />
    </section>
  </q-card>
</template>

<script setup lang="ts">
import IbisButton from './ibis-btn.vue'
import { ConversationNode, Role, defaultNodeType } from '../types'
import {
  ibis_node_type_type,
  publication_state_list,
  publication_state_enum,
  publication_state_type,
  meta_state_type,
  meta_state_enum,
  permission_enum,
} from '../enums'
import { computed, ref } from 'vue'
import { useQuestStore } from '../stores/quests'
import { useBaseStore } from '../stores/baseStore'
import { QInput } from 'quasar'

// Emits
const emit = defineEmits(['action', 'cancel'])

// Refs
const title = ref<QInput | null>(null)

// Props
const NodeFormProps = defineProps<{
  nodeInput?: Partial<ConversationNode> | defaultNodeType
  editing: boolean
  ibisTypes?: ibis_node_type_type[]
  allowChangeMeta?: boolean
  roles?: Role[]
  hideSelectors?: boolean
}>()

// Reactive Variables
const node = ref<defaultNodeType & { guild_id?: number }>({
  status: 'private_draft',
  node_type: 'answer',
  id: undefined,
  quest_id: undefined,
  title: '',
  description: '',
  meta: 'conversation',
  url: '',
  draft_for_role_id: undefined,
  ...NodeFormProps.nodeInput,
})

const descriptionExpanded = ref(false);

const metaValue = computed<meta_state_type>({
  get() {
    const meta = node.value.meta
    if (meta === 'meta' || meta === 'conversation' || meta === 'channel') {
      return meta
    }
    return meta_state_enum.conversation
  },
  set(val: meta_state_type) {
    node.value.meta = val
  },
})

const selectedNodeType = computed({
  get: () => node.value.node_type,
  set: (val) => {
    if (NodeFormProps.ibisTypes?.includes(val as ibis_node_type_type)) {
      node.value.node_type = val
    }
  },
})

const selectedStatusType = computed({
  get: () => node.value.status,
  set: (val) => {
    if (publication_state_list.includes(val)) node.value.status = val
  },
})

const description = computed({
  get: () => node.value.description || '',
  set: (val) => (node.value.description = val),
})

const url = computed({
  get: () => node.value.url || '',
  set: (val) => (node.value.url = val),
})

const maxAllowedStatus = computed<publication_state_type>(() => {
  const questId = node.value.quest_id;
  const guildId = node.value.guild_id;
  const nodeType = node.value.node_type as ibis_node_type_type;

  if (questId) {
    return useQuestStore().getMaxPubStateForNodeType(questId, nodeType, guildId);
  }

  // No quest context — fall back to publishGameMove permission
  const baseStore = useBaseStore();
  return baseStore.hasPermission(permission_enum.publishGameMove, guildId, questId)
    ? publication_state_enum.published
    : publication_state_enum.guild_draft;
});

// Filtered Status Options: trimmed to member's role cap
const filteredStatusOptions = computed<publication_state_type[]>(() => {
  const maxIndex = publication_state_list.indexOf(maxAllowedStatus.value);

  return publication_state_list.filter((status) => {
    const idx = publication_state_list.indexOf(status);
    // Always allow obsolete (special archival state regardless of rank)
    if (status === publication_state_enum.obsolete) return true;
    // Trim anything above the role's cap
    if (idx > maxIndex) return false;
    // Preserve existing rule: comment nodes cannot be submitted or published
    if (metaValue.value === 'meta') {
      return (
        status !== publication_state_enum.published &&
        status !== publication_state_enum.submitted
      );
    }
    return true;
  }) as publication_state_type[];
});



// Functions
function nodeTypeChanged(val: string) {
  if (NodeFormProps.ibisTypes?.includes(val as ibis_node_type_type)) {
    node.value.node_type = val as ibis_node_type_type
  }
}


function statusChanged(val: string) {
  if (publication_state_list.includes(val as publication_state_type)) {
    node.value.status = val as publication_state_type // <-- cast
  }
}
function toggleDescription() {
  // optional expand/collapse logic
}

function action() {
  node.value.quest_id = NodeFormProps.nodeInput?.quest_id
  emit('action', node.value)
}

function cancel() {
  emit('cancel')
}

function setFocus() {
  title.value?.focus()
}

// Expose methods that parent components can call
defineExpose({
  setFocus
})
</script>
<style>
.node-card {
  background-color: var(--sc-color-bg-muted);
  border-radius: var(--sc-radius-lg);
  box-shadow: var(--sc-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: var(--sc-space-24);
  color: var(--sc-color-text);
}

.node-card-title {
  display: flex;
  align-items: center;
  gap: var(--sc-space-8);
  font-weight: var(--sc-font-weight-bold);
  background-color: var(--sc-color-primary-subtle);
  padding: var(--sc-space-8);
  border-radius: var(--sc-radius-md);
  width: 90%;
}

.node-card-url {
  display: flex;
  align-items: center;
  gap: var(--sc-space-8);
  background-color: var(--sc-color-primary-subtle);
  border: 1px solid var(--sc-color-border-strong);
  border-radius: var(--sc-radius-md);
  padding: var(--sc-space-8) var(--sc-space-12);
  width: 90%;
}

.node-card-url-input {
  flex: 1 1 100%;
  font-size: 0.85rem;
}

.node-card-url-input .q-field__control {
  background-color: var(--sc-color-bg);
  border-radius: var(--sc-radius-md);
}

.node-card-editor {
  border-radius: var(--sc-radius-md);
  border: 1px solid var(--sc-color-border);
  padding: var(--sc-space-8);
  background-color: var(--sc-color-bg);
  max-height: 200px;
  overflow-y: auto;
}

.scrollable-description {
  background-color: var(--sc-color-bg);
  border: 1px solid var(--sc-color-border);
  border-radius: var(--sc-radius-md);
  padding: var(--sc-space-12);
  max-height: 200px;
  overflow-y: auto;
}

.section-header {
  font-weight: var(--sc-font-weight-semibold);
  margin-bottom: var(--sc-space-8);
}

.narrow-dropdown {
  min-width: unset !important;
  width: 120px !important;
  max-width: 120px !important;
  font-size: 0.85rem;
  white-space: nowrap;
}

.meta-text {
  margin: 0;
  font-style: italic;
  color: var(--sc-color-text-muted);
}

.read-more {
  cursor: pointer;
  color: var(--sc-color-primary);
  font-size: 0.9em;
  text-align: right;
  margin-top: var(--sc-space-4);
}

a {
  color: var(--sc-color-primary);
  text-decoration: underline;
}

@media (max-width: 600px) {
  .node-card {
    font-size: 0.95em;
  }
  .node-card-editor {
    width: 100% !important;
  }
}
</style>

