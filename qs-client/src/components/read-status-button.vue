<template>
  <q-btn
    round
    size="5px"
    :color="localRead ? 'transparent' : 'grey'"
    @click="toggleReadStatus()"
  ></q-btn>
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
    ...mapActions("readStatus", ["CreateOrUpdateReadStatus"]),
  },
})
export default class ReadStatusButton extends ReadStatusButtonProps {
  localRead: boolean = this.isRead;

  CreateOrUpdateReadStatus: ReadStatusActionTypes["CreateOrUpdateReadStatus"];

  async toggleReadStatus() {
    this.localRead = !this.localRead;
    await this.CreateOrUpdateReadStatus({
      data: {
        nodeid: this.node_id,
        new_status: this.localRead,
        override: true,
      },
    });
  }
}
</script>
