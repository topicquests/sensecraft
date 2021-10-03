<template>
  <img :src="icon" :height="icon_size" :width="icon_size" />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ConversationNode } from "../types";
import { ibis_node_type_type } from "../enums";
import { ibis_node_icon } from "../store/conversation";

import { Prop } from "vue/types/options";

const IbisButtonProps = Vue.extend({
  props: {
    node_type: String as Prop<ibis_node_type_type>,
    small: Boolean,
  },
});

@Component<IbisButton>({
  name: "IbisButton",
  computed: {
    icon() {
      return ibis_node_icon(this.node_type, this.small);
    },
    icon_size() {
      return this.small ? "16px" : "32px";
    },
  },
})
export default class IbisButton extends IbisButtonProps {}
</script>
