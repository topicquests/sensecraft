<template>
  <q-card class="node-card q-pa-md">
    <section class="node-card-title">
      <q-input v-model="node.title" label="Node title" />
      <h5 class="q-ma-md">
        <IbisButton v-bind:node_type="node.node_type"></IbisButton>
        {{ node.title }}
      </h5>
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
      <template v-if="editing">
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
    <section v-if="editing">
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
    <div v-if="editing" class="row justify-start q-pb-lg q-ml-lg">
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
    <div class="row justify-center" v-if="editing">
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

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import IbisButton from "./ibis-btn.vue";
import { ConversationNode, Role } from "../types";
import {
  ibis_node_type_list,
  ibis_node_type_type,
  publication_state_enum,
  publication_state_list,
  publication_state_type,
  public_private_bool,
} from "../enums";

import { Prop } from "vue/types/options";

const NodeFormProps = Vue.extend({
  props: {
    nodeInput: Object as Prop<Partial<ConversationNode>>,
    editing: Boolean,
    ibisTypes: Array as Prop<ibis_node_type_type[]>,
    allowChangeMeta: Boolean,
    roles: Array as Prop<Role[]>,
    pubFn: Function as Prop<
      (node: Partial<ConversationNode>) => publication_state_type[]
    >,
  },
});

@Component<NodeForm>({
  name: "NodeForm",
  components: { IbisButton },
  computed: {
    description: {
      get() {
        return this.nodeInput.description || "";
      },
      set(value) {
        this.node.description = value;
      },
    },
  },
  watch: {
    nodeInput(newNode: Partial<ConversationNode>) {
      // TODO: watch if data is dirty
      this.node = { ...this.nodeInput };
    },
  },
})
export default class NodeForm extends NodeFormProps {
  node: Partial<ConversationNode> = {};
  ibis_node_type_list = ibis_node_type_list;
  pub_state_list: publication_state_type[] = publication_state_list;
  description!: string;

  created() {
    this.node = { ...this.nodeInput };
    if (this.pubFn) this.pub_state_list = this.pubFn(this.node);
    else this.pub_state_list = publication_state_list;
  }
  getDescription() {
    return this.node.description || "";
  }
  setDescription(description: string) {
    this.node.description = description;
  }
  descriptionChange(value: string) {
    this.node.description = value;
  }
  action() {
    this.$emit("action", this.node);
  }
  cancel() {
    this.$emit("cancel");
  }
  statusChanged(event) {
    if (this.pubFn) this.pub_state_list = this.pubFn(this.node);
  }
}
</script>
<style>
#node-card {
  max-width: 50%;
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
