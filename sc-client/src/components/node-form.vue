<template>
  <q-card class="node-card q-pa-md">
    <section class="node-card-title">
      <q-input
        v-model="node.title"
        label="Node title"
        name="node-title"
        ref="title">
        <template v-slot:prepend>
          <IbisButton
            :node_type="node!.node_type as ibis_node_type_type"
          ></IbisButton>
        </template>
      </q-input>
    </section>
    <section v-if="node!.url || node!.node_type == 'reference'">
      <template v-if="NodeFormProps.editing">
        <q-input v-model="node!.url" label="URL" ref="url" />
      </template>
      <template v-else>
        <a v-bind:href="node!.url" target="_blank">
          {{ node!.url }}
        </a>
      </template>
    </section>
    <section>
      <div
        class="row q-pb-xs q-ma-lg"
        style="text-align: center; font-size: 15pt"
      >
        Description<br />
      </div>
    </section>
    <section>
      <template v-if="NodeFormProps.editing">
        <q-editor
          v-model="description"
          data-test="node-description-editor"
          style="width: 98%"
          class="q-editor node-card-details scrollable-div"
          :toolbar="[['bold', 'italic', 'underline', 'strike', 'undo', 'redo']]"
        />
      </template>
      <template v-else>
        <div class="scrollable-description">
          <span v-html="description" class="node-card-details" />
        </div>
      </template>
    </section>
    <section v-if="NodeFormProps.editing">
      <div class="row justify-start">
        <ibis-button
          :node_type="node!.node_type as ibis_node_type_type"
          :small="true"
          style="box-align: center; margin-top: 3ex; margin-right: 1ex"
        />
        <q-select
          v-model="selectedNodeType"
          data-test="node-type-selector"
          :options="ibisTypes"
          @update:model-value="nodeTypeChanged"
          label="Type"
          style="width: 25%"
        />
      </div>
    </section>
    <div v-if="NodeFormProps.editing" class="row justify-start q-pb-lg q-ml-lg">
      <q-select
        v-model="selectedStatusType"
        data-test="node-status-selector"
        :options="pub_state_list"
        @update:model-value="statusChanged"
        label="Status"
        style="width: 25%"
      />
      <q-select
        v-if="selectedStatusType == 'role_draft'"
        v-model="node!.draft_for_role_id"
        :options="roles"
        option-label="name"
        option-value="id"
        :emit-value="true"
        :map-options="true"
        label="Draft for role"
        style="width: 60%"
      />
    </div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <q-checkbox
        name="meta"
        @input="statusChanged"
        v-if="allowChangeMeta"
        v-model="node!.meta"
        true-value="meta"
        false-value="conversation"
        label="Comment Node"
      />
      <p v-if="!allowChangeMeta && node!.meta != 'channel'">
        <span v-if="node!.meta">Comment node</span>
        <span v-else>Content node</span>
      </p>
    </div>
    <div class="row justify-center" v-if="NodeFormProps.editing">
      <q-btn
        label="Cancel"
        @click="cancel"
        color="grey"
        class="q-mr-md q-ml-md"
      />
      <q-btn
        v-if="NodeFormProps.nodeInput!.id"
        label="Update"
        data-test="update-node-btn"
        @click="action"
        color="primary"
        class="q-mr-md q-ml-md"
      />
      <q-btn
        v-else
        name="addBtn"
        data-test="add-node-btn"
        label="Add"
        @click="action"
        color="primary"
        class="q-mr-md q-ml-md"
      />
    </div>
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

// Emits
const emit = defineEmits(['action', 'cancel']);

// Reactive Variables
const selectedNode = ref<string | undefined>(
  NodeFormProps.nodeInput?.node_type,
);
const selectedStatus = ref<string | undefined>(NodeFormProps.nodeInput?.status);
const title = ref<QInput>();
const node = ref<Partial<ConversationNode> | defaultNodeType>({});

// Non Reactive Variables
const pub_state_list: publication_state_type[] = publication_state_list;

// Computed Properties
const selectedNodeType = computed<string | undefined>({
  get() {
    if (selectedNode.value && isValidNodeType(selectedNode.value)) {
      return selectedNode.value;
    } else {
      return undefined;
    }
  },
  set(value) {
    if (value && isValidNodeType(value)) {
      selectedNode.value = value;
    } else {
      selectedNode.value = undefined;
    }
  },
});

const selectedStatusType = computed<string | undefined>({
  get() {
    if (selectedStatus.value && isValidNodeStatus(selectedStatus.value)) {
      return selectedStatus.value;
    } else {
      return undefined;
    }
  },
  set(value) {
    if (value && isValidNodeStatus(value)) {
      selectedStatus.value = value;
    } else {
      selectedStatus.value = undefined;
    }
  },
});

const roles = computed(() => NodeFormProps.roles);
const description = computed<string>({
  get() {
    return NodeFormProps.nodeInput!.description || '';
  },
  set(value) {
    node.value.description = value;
  },
});

// Watches
watch(
  () => NodeFormProps.nodeInput!.node_type,
  (newType) => {
    selectedNode.value = newType;
  },
);
watch(
  () => NodeFormProps.nodeInput!.status,
  (newType) => {
    selectedStatus.value = newType;
  },
);
watch(
  () => NodeFormProps.nodeInput,
  (newType) => {
    node.value = { ...newType };
  },
);

// Created
node.value = { ...NodeFormProps.nodeInput };

// Functions
function isValidNodeType(type: string): type is ibis_node_type_type {
  return !!NodeFormProps.ibisTypes?.includes(type as ibis_node_type_type);
}
function isValidNodeStatus(status: any): status is publication_state_type {
  return publication_state_list.includes(status);
}

const statusChanged = (newType: string) => {
  if (newType && isValidNodeStatus(newType)) {
    selectedStatus.value = newType;
  } else {
    selectedStatus.value = undefined;
  }
};
const nodeTypeChanged = (newType: string) => {
  if (newType && isValidNodeType(newType)) {
    selectedNode.value = newType;
    node.value.node_type = newType;
  } else {
    selectedNode.value = undefined;
  }
};
const setFocus = () => {
  if (title.value) title.value.focus();
};
function action() {
  if (selectedStatus.value && isValidNodeStatus(selectedStatus.value)) {
    node.value.status = selectedStatus.value;
  }
  if (selectedNode.value && isValidNodeType(selectedNode.value)) {
    node.value.node_type = selectedNode.value;
  }
  emit('action', node.value);
}
function cancel() {
  emit('cancel');
}

// Exposes
defineExpose({
  setFocus,
});
</script>
<style scoped>
#node-card {
  text-align: center;
  border: 3px solid black;
  font-size: 1.2em;
  color: rgb(39, 11, 194);
  background-color: rgb(158, 181, 243);
  height: 300px;
}
#node-card-details {
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
  text-align: left;
  font-size: 1.2em;
  padding-top: 3%;
  padding-left: 1%;
  border: 1px solid gray;
}
#node-card-title {
  border: 1px solid gray;
  background-color: lightgray;
  color: rgb(39, 11, 194);
}
#node-card-data {
  text-align: left;
  font-size: 1.2em;
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
}
#node-card-detail-header {
  text-align: center;
  background-color: rgb(158, 181, 243);
  color: black;
  margin-bottom: 0%;
}
.scrollable-div {
  max-height: 200px;
  overflow-y: scroll;
}
.scrollable-description {
  max-height: 200px; /* Set the maximum height you want */
  overflow-y: auto; /* This adds the vertical scrollbar when content overflows */
  padding: 10px; /* Optional padding */
  border: 1px solid #ccc; /* Optional border */
}
@media (max-width: 600px) {
  .q-editor__toolbar .q-btn--strike, /* Strike-through button */
  .q-editor__toolbar .q-btn--link,  /* Link button */
  .q-editor__toolbar .q-btn--quote, /* Quote button */
  .q-editor__toolbar .q-btn--image  /* Image button */ {
    display: none !important; /* Ensure it overrides Quasar's styles */
  }
}
</style>
