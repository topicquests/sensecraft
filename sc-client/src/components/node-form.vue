<template>
  <q-card class="node-card q-pa-md">
    <section class="node-card-title">
      <q-input v-model="node.title" label="Node title" ref="title" />
      <h3 class="q-ma-md">
        <IbisButton v-bind:node_type="node.node_type"></IbisButton>
        {{ node.title }}
      </h3>
    </section>
    <section v-if="node.url || node.node_type == 'reference'">
      <template v-if="NodeFormProps.editing">
        <q-input v-model="node.url" label="URL" ref="url" />
      </template>
      <template v-else>
        <a v-bind:href="node.url" target="_blank">
          {{ node.url }}
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
          style="width: 98%"
          class="q-editor node-card-details"
        />
      </template>
      <template v-else>
        <span v-html="node.description" class="node-card-details" />
      </template>
    </section>
    <section v-if="NodeFormProps.editing">
      <div class="row justify-start">
        <ibis-button
          :node_type="node.node_type"
          :small="true"
          style="valign: center; margin-top: 3ex; margin-right: 1ex"
        />
        <q-select
          v-model="node.node_type"
          :options="ibisTypes"
          @input="statusChanged"
          label="Type"
          style="width: 25%"
        />
      </div>
    </section>
    <div v-if="NodeFormProps.editing" class="row justify-start q-pb-lg q-ml-lg">
      <q-select
        v-model="node.status"
        :options="pub_state_list"
        label="Status"
        style="width: 25%"
      />
      <q-select
        v-if="node.status == 'role_draft'"
        v-model="node.draft_for_role_id"
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
        v-model="node.meta"
        true-value="meta"
        false-value="conversation"
        label="Comment Node"
      />
      <p v-if="!allowChangeMeta && node.meta != 'channel'">
        <span v-if="node.meta">Comment node</span>
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
        v-if="node.id"
        label="Update"
        @click="action"
        color="primary"
        class="q-mr-md q-ml-md"
      />
      <q-btn
        v-else
        label="Add"
        @click="action"
        color="primary"
        class="q-mr-md q-ml-md"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import IbisButton from "./ibis-btn.vue";
import { ConversationNode, Role } from "../types";
import {
  ibis_node_type_list,
  ibis_node_type_type,
  publication_state_list,
  publication_state_type,
} from "../enums";
import { computed } from "vue";
import { QInput } from "quasar";

const NodeFormProps = defineProps<{
    nodeInput: Partial<ConversationNode>;
    editing: boolean;
    ibisTypes: ibis_node_type_type[];
    allowChangeMeta: boolean;
    roles: Role[];
    pubFn: (node: Partial<ConversationNode>) => publication_state_type[];
}>();
const emit = defineEmits(['action', 'cancel']);
let node: Partial<ConversationNode> = {};
let pub_state_list: publication_state_type[] = publication_state_list
const description = computed( {
  get() {
    return NodeFormProps.nodeInput.description || "";
  },
  set(value) {
    node.description = value;
  },
})
 node = { ...NodeFormProps.nodeInput };
  if (NodeFormProps.pubFn) pub_state_list = NodeFormProps.pubFn(node);
  else pub_state_list = publication_state_list;
/*

function getDescription() {
  return node.description || "";
}
function setDescription(description: string) {
  node.description = description;
}
function descriptionChange(value: string) {
  node.description = value;
}
*/
function action() {
    emit("action", node);
  }
function cancel() {
    emit("cancel");
}
function statusChanged() {
  if (NodeFormProps.pubFn) pub_state_list = NodeFormProps.pubFn(node);
  }
 /* 
function setFocus() {
  const titleEl = this.$refs.title as QInput;
    titleEl.focus();
}
*/
</script>
<style>
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
</style>
