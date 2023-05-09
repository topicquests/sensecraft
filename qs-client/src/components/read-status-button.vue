<template>
  <q-btn
    round
    size="5px"
    :color="setColor()"
    @click="toggleReadStatus(read)"
  ></q-btn>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { mapGetters } from "vuex";
import { ReadStatusGetterTypes } from "src/store/readStatus";

const ReadStatusButtonProps = Vue.extend({
  props: {
    node_id: {
      type: Number,
      required: true,
    },
    isRead: {
      type: Boolean,
    },
  },
});

@Component<ReadStatusButton>({
  name: "read-status-toggle",
  computed: {
    ...mapGetters("readStatus", ["setNodeReadStatus"]),
  },
})
export default class ReadStatusButton extends ReadStatusButtonProps {
  read: boolean = this.isRead;
  color: string;

  setNodeReadStatus: ReadStatusGetterTypes["setNodeReadStatus"];

  setColor() {
    if (this.read) {
      this.color = "grey";
    } else {
      this.color = "transparent";
    }
    return this.color;
  }
  toggleReadStatus(read) {
    // update the isRead data property and emit an event
    // to allow the parent component to update the read status of the node
    this.read = !this.read;
    this.setNodeReadStatus(this.node_id);
    this.$emit("update-read-status", this.node_id, this.read);
  }
}
</script>
