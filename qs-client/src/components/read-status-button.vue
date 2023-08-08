<template>
  <q-btn
    round
    size="5px"
    :color="localRead ? 'transparent' : 'blue'"
    @click="toggleReadStatus()"
    ><q-tooltip class="bg-red text-red">{{ buttonTooltip() }}</q-tooltip>
  </q-btn>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { mapActions } from "vuex";
import { ReadStatusActionTypes } from "src/store/readStatus";

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
  computed: {},
  methods: {
    ...mapActions("readStatus", [
      "CreateOrUpdateReadStatus",
      "fetchReadStatus",
    ]),
  },
})
export default class ReadStatusButton extends ReadStatusButtonProps {
  localRead: boolean = this.isRead;

  CreateOrUpdateReadStatus: ReadStatusActionTypes["CreateOrUpdateReadStatus"];
  fetchReadStatus: ReadStatusActionTypes["fetchReadStatus"];

  buttonTooltip() {
    return this.localRead ? "Read" : "Unread";
  }
  buttonLabel() {
    return this.localRead ? "Read" : "Unread";
  }

  async toggleReadStatus() {
    this.localRead = !this.localRead;
    await this.CreateOrUpdateReadStatus({
      data: {
        nodeid: this.node_id,
        new_status: this.localRead,
        override: true,
      },
    });
    this.fetchReadStatus();
  }
}
</script>
<style scoped></style>
