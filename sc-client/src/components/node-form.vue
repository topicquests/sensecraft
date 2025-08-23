<template>
  <q-card class="node-card q-pa-md">
    <!-- Node Title -->
    <section class="node-card-title">
      <q-input
        v-model="node.title"
        label="Node Title"
        name="node-title"
        ref="title"
        outlined
        dense
      >
        <template v-slot:prepend>
          <IbisButton :node_type="node!.node_type as ibis_node_type_type" />
        </template>
      </q-input>
    </section>

    <!-- URL Section -->
    <section v-if="node!.url || node!.node_type == 'reference'">
      <template v-if="NodeFormProps.editing">
        <q-input
          v-model="node!.url"
          label="URL"
          ref="url"
          outlined
          dense
        />
      </template>
      <template v-else>
        <a :href="node!.url" target="_blank">{{ node!.url }}</a>
      </template>
    </section>

    <!-- Description Header -->
    <section>
      <div class="section-header">Description</div>
    </section>

    <!-- Description Editor / Collapsible -->
    <section>
      <template v-if="NodeFormProps.editing">
        <q-editor
          v-model="description"
          data-test="node-description-editor"
          class="q-mb-md node-card-editor"
          :toolbar="[ ['bold','italic','underline','strike'] ]"
        />
      </template>
      <template v-else>
        <div class="scrollable-description">
          <div
            :style="{ maxHeight: descriptionExpanded ? 'none' : '150px', overflow: 'hidden' }"
            v-html="description"
          />
          <div v-if="description.length > 200" class="read-more" @click="toggleDescription">
            {{ descriptionExpanded ? 'Show Less ▲' : 'Read More ▼' }}
          </div>
        </div>
      </template>
    </section>

    <!-- Node Type & Status -->
    <section v-if="NodeFormProps.editing">
      <div class="row q-mb-md q-gutter-sm items-center">
        <ibis-button :node_type="node!.node_type as ibis_node_type_type" small />
        <q-select
          v-model="selectedNodeType"
          :options="ibisTypes"
          @update:model-value="nodeTypeChanged"
          label="Type"
          outlined
          dense
          style="flex: 1"
        >
          <template v-slot:append>
            <q-tooltip anchor="top middle" self="bottom middle">
              Select the type of node. This affects allowed child nodes and workflow.
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
          outlined
          dense
          style="flex: 1"
        >
          <template v-slot:append>
            <q-tooltip anchor="top middle" self="bottom middle">
              Select the publication state of this node.
            </q-tooltip>
          </template>
        </q-select>

        <q-select
          v-if="selectedStatusType == 'role_draft'"
          v-model="node!.draft_for_role_id"
          :options="roles"
          option-label="name"
          option-value="id"
          :emit-value="true"
          :map-options="true"
          label="Draft for Role"
          outlined
          dense
          style="flex: 1"
        />
      </div>
    </section>

    <!-- Meta / Comment Node -->
    <section class="row q-mb-md items-center">
      <q-checkbox
        v-if="allowChangeMeta"
        v-model="node!.meta"
        true-value="meta"
        false-value="conversation"
        label="Comment Node"
      />
      <p v-else class="meta-text">
        {{ node!.meta ? 'Comment Node' : 'Content Node' }}
      </p>
    </section>

    <!-- Action Buttons -->
    <section class="row justify-center q-mt-lg q-gutter-sm">
      <q-btn label="Cancel" @click="cancel" color="grey" />
      <q-btn
        v-if="NodeFormProps.nodeInput!.id"
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
import IbisButton from './ibis-btn.vue';
import { ConversationNode, Role, defaultNodeType } from '../types';
import {
  ibis_node_type_type,
  publication_state_list,
  publication_state_type,
} from '../enums';
import { computed, ref, watch } from 'vue';
import { QInput } from 'quasar';

const NodeFormProps = defineProps<{
  nodeInput?: Partial<ConversationNode> | defaultNodeType;
  editing: boolean;
  ibisTypes?: ibis_node_type_type[];
  allowChangeMeta?: boolean;
  roles?: Role[];
  pubFn?: (
    node: Partial<ConversationNode | defaultNodeType>
  ) => publication_state_type[];
}>();

const emit = defineEmits(['action', 'cancel']);

const node = ref<Partial<ConversationNode> | defaultNodeType>({ ...NodeFormProps.nodeInput });
const selectedNode = ref<string | undefined>(NodeFormProps.nodeInput?.node_type);
const selectedStatus = ref<string | undefined>(NodeFormProps.nodeInput?.status);
const title = ref<QInput>();

// Collapsible description
const descriptionExpanded = ref(false);
function toggleDescription() {
  descriptionExpanded.value = !descriptionExpanded.value;
}

// Validators
function isValidNodeType(type: string): type is ibis_node_type_type {
  return !!NodeFormProps.ibisTypes?.includes(type as ibis_node_type_type);
}
function isValidNodeStatus(status: any): status is publication_state_type {
  return publication_state_list.includes(status);
}

// Computed
const selectedNodeType = computed<string | undefined>({
  get: () => selectedNode.value,
  set: (val) => {
    if (val && isValidNodeType(val)) {
      selectedNode.value = val;
      node.value.node_type = val;
    }
  },
});
const selectedStatusType = computed<string | undefined>({
  get: () => selectedStatus.value,
  set: (val) => {
    if (val && isValidNodeStatus(val)) {
      selectedStatus.value = val;
      node.value.status = val;
    }
  },
});
const roles = computed(() => NodeFormProps.roles);
const description = computed({
  get: () => NodeFormProps.nodeInput!.description || '',
  set: (val) => (node.value.description = val),
});

// Watches
watch(() => NodeFormProps.nodeInput, (val) => (node.value = { ...val }));

// Methods
const nodeTypeChanged = (val: string) => {
  if (val && isValidNodeType(val)) node.value.node_type = val;
};
const statusChanged = (val: string) => {
  if (val && isValidNodeStatus(val)) node.value.status = val;
};
const setFocus = () => { title.value?.focus(); };
function action() { emit('action', node.value); }
function cancel() { emit('cancel'); }

defineExpose({ setFocus });
</script>

<style scoped>
.node-card {
  background-color: #f5f7ff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
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
}

.node-card-editor {
  border-radius: 6px;
  border: 1px solid #c0c0c0;
  padding: 0.5em;
  background-color: #fff;
  max-height: 200px;
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
  .node-card { font-size: 0.95em; }
  .node-card-editor { width: 100% !important; }
}
</style>
