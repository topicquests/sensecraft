<template>
  <q-card v-if="node" class="node-card q-pa-md">
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
    <section v-if="node.url || node.node_type === 'reference'">
      <q-input
        v-if="NodeFormProps.editing"
        v-model="node.url"
        label="URL"
        ref="url"
        outlined
        dense
      />
      <a v-else :href="node.url" target="_blank">{{ node.url }}</a>
    </section>
    <section>
      <div class="section-header">Description</div>
    </section>
    <section>
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
    <section v-if="NodeFormProps.editing">
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
        >
          <template v-slot:append>
            <q-tooltip anchor="top middle" self="bottom middle">
              Select the type of node. This affects allowed child nodes and
              workflow.
            </q-tooltip>
          </template>
        </q-select>
      </div>
      <div class="row q-mb-md q-gutter-sm items-center">
        <q-select
          v-model="selectedStatusType"
          :options="publication_state_list"
          @update:model-value="statusChanged"
          label="Status"
          data-test="node-status-selector"
          behavior="menu"
          outlined
          dense
          popup-content-class="narrow-dropdown"
          style="flex: 1; max-width: 450px; font-size: 0.8rem"
        >
          <template v-slot:append>
            <q-tooltip anchor="top middle" self="bottom middle">
              Select the publication state of this node.
            </q-tooltip>
          </template>
        </q-select>
        <q-select
          v-if="selectedStatusType === 'role_draft'"
          v-model="node.draft_for_role_id"
          :options="roles"
          option-label="name"
          option-value="id"
          :emit-value="true"
          :map-options="true"
          behavior="menu"
          data-test="node-status-selector"
          label="Draft for Role"
          outlined
          dense
          style="flex: 1; max-width: 450px; font-size: 0.8rem"
        />
      </div>
    </section>
    <section class="row q-mb-md items-center">
      <div class="row justify-start q-pb-lg q-ml-lg">
        <section class="row q-mb-md items-center">
          <div class="row justify-start q-pb-lg q-ml-lg">
            <!-- Editable checkbox -->
            <q-checkbox
              v-if="allowChangeMeta && NodeFormProps.editing"
              v-model="metaValue"
              true-value="meta"
              false-value="conversation"
              label="Comment Node"
            />

            <!-- Read-only display -->
            <p v-else>
              {{ node.meta === 'meta' ? 'Comment node' : 'Content node' }}
            </p>
          </div>
        </section>
      </div>
    </section>
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
// Imports
import IbisButton from './ibis-btn.vue';
import { ConversationNode, Role, defaultNodeType } from '../types';
import {
  ibis_node_type_type,
  publication_state_list,
  publication_state_type,
  meta_state_type,
  meta_state_enum,
} from '../enums';
import { computed, ref, watch } from 'vue';
import { QInput } from 'quasar';

// Emits
const emit = defineEmits(['action', 'cancel']);

// Props
const NodeFormProps = defineProps<{
  nodeInput?: Partial<ConversationNode> | defaultNodeType;
  editing: boolean;
  ibisTypes?: ibis_node_type_type[];
  allowChangeMeta?: boolean;
  roles?: Role[];
  pubFn?: (
    node: Partial<ConversationNode | defaultNodeType>,
  ) => publication_state_type[];
}>();

// Non reactive variables
const nodeTypeChanged = (val: string) => {
  if (val && isValidNodeType(val)) node.value.node_type = val;
};
const statusChanged = (val: string) => {
  if (val && isValidNodeStatus(val)) node.value.status = val;
};

//Reactive Variables
const node = ref<defaultNodeType>({
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
});

const title = ref<QInput>();
const descriptionExpanded = ref(false);

// Computed
const selectedNodeType = computed({
  get: () => node.value.node_type,
  set: (val) => {
    if (isValidNodeType(val)) node.value.node_type = val;
  },
});
const selectedStatusType = computed({
  get: () => node.value.status,
  set: (val) => {
    if (isValidNodeStatus(val)) node.value.status = val;
  },
});
const roles = computed(() => NodeFormProps.roles);
const description = computed({
  get: () => node.value.description || '',
  set: (val) => {
    node.value.description = val;
  },
});
const metaValue = computed<meta_state_type>({
  get() {
    const meta = node.value.meta;
    if (meta === 'meta' || meta === 'conversation' || meta === 'channel') {
      return meta;
    }
    return meta_state_enum.conversation;
  },
  set(val: meta_state_type) {
    node.value.meta = val;
  },
});

// Functions
function toggleDescription() {
  descriptionExpanded.value = !descriptionExpanded.value;
}
function isValidNodeType(type: string): type is ibis_node_type_type {
  return !!NodeFormProps.ibisTypes?.includes(type as ibis_node_type_type);
}
function isValidNodeStatus(status: any): status is publication_state_type {
  return publication_state_list.includes(status);
}
const setFocus = () => {
  title.value?.focus();
};
function action() {
  node.value.quest_id = NodeFormProps.nodeInput?.quest_id;
  emit('action', node.value);
}
function cancel() {
  emit('cancel');
}

defineExpose({ setFocus });
</script>

<style scoped>
.node-card {
  background-color: #f5f7ff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.2em;
  color: #1a237e;
}
.node-card-title {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-weight: bold;
  background-color: #e0e0ff;
  padding: 0.5em;
  border-radius: 6px;
  width: 90%;
}
.node-card-editor {
  border-radius: 6px;
  border: 1px solid #c0c0c0;
  padding: 0.5em;
  background-color: #fff;
  max-height: 200px;
  overflow-y: auto;
}
.scrollable-description {
  background-color: #fff;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  padding: 0.8em;
  max-height: 200px;
  overflow-y: auto;
}
.section-header {
  font-weight: 600;
  margin-bottom: 0.5em;
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
  color: #333;
}
.read-more {
  cursor: pointer;
  color: #1976d2;
  font-size: 0.9em;
  text-align: right;
  margin-top: 0.3em;
}
a {
  color: #1976d2;
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
