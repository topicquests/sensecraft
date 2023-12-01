<template>
  <div>
    <div v-if="isChannel">
      <q-btn
        round
        v-if="getChannelUnreadCount(node_id) > 0 && !isExpanded"
        size="15px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
        <strong>{{ getChannelUnreadCount(node_id) }}</strong> /
        {{ getNodeCount(node_id) }}
      </q-btn>
    </div>
    <div v-else>
      <q-btn
        round
        v-if="getUnreadCount(node_id) > 0 && !isExpanded"
        size="15px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
        <strong>{{ getUnreadCount(node_id) }}</strong> /
        {{ getNodeCount(node_id) }}
      </q-btn>
    </div>
    <q-btn
      round
      v-if="getChildrenOf(node_id).length > 0 && !isExpanded"
      size="12px"
      text-color="black"
      @click="toggleReadStatus()"
      ><strong>{{ getNodeCount(node_id) }}</strong>
    </q-btn>
    <q-btn
      round
      v-else-if="getChildrenOf(node_id).length > 0 && isExpanded"
      size="12px"
      text-color="black"
      :color="localRead ? 'transparent' : 'blue'"
      @click="toggleReadStatus()"
    >
      {{ getNodeCount(node_id) }}
    </q-btn>
    <q-btn
      round
      v-else
      size="7px"
      :color="localRead ? 'transparent' : 'blue'"
      text-color="black"
      @click="toggleReadStatus()"
    >
    </q-btn>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import { ReadStatusGetterTypes } from "src/store/readStatus";
import { ConversationGetterTypes } from "../store/conversation";
import { ReadStatusActionTypes } from "src/store/readStatus";
import { ChannelGetterTypes } from "src/store/channel";

const ReadStatusCounterButtonProps = Vue.extend({
  props: {
    node_id: {
      type: Number,
      required: true,
    },
    isRead: { type: Boolean },
    isChannel: {
      type: Boolean,
      default: false,
    },
    isExpanded: { type: Boolean },
  },
});

@Component<ReadStatusCounterButton>({
  name: "read-status-counter",
  computed: {
    ...mapGetters("conversation", ["getConversationNodeById", "getChildrenOf"]),
    ...mapGetters("readStatus", ["getUnreadStatusCount", "getNodeStatusCount"]),
    ...mapGetters("channel", ["getChannelById, getChannelChildrenOf"]),
  },
  methods: {
    ...mapActions("readStatus", [
      "CreateOrUpdateReadStatus",
      "ensureAllQuestsReadStatus",
      "ensureAllChannelReadStatus",
    ]),
  },
})
export default class ReadStatusCounterButton extends ReadStatusCounterButtonProps {
  localRead: boolean = this.isRead;

  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getChildrenOf: ConversationGetterTypes["getChildrenOf"];
  getUnreadStatusCount!: ReadStatusGetterTypes["getUnreadStatusCount"];
  getNodeStatusCount!: ReadStatusGetterTypes["getNodeStatusCount"];
  getChannelById!: ChannelGetterTypes["getChannelById"];
  getChannelChildrenOf!: ChannelGetterTypes["getChannelChildrenOf"];

  CreateOrUpdateReadStatus: ReadStatusActionTypes["CreateOrUpdateReadStatus"];
  ensureAllQuestsReadStatus: ReadStatusActionTypes["ensureAllQuestsReadStatus"];
  ensureAllChannelReadStatus: ReadStatusActionTypes["ensureAllChannelReadStatus"];

  getChannelUnreadCount(nodeId: number) {
    if (
      this.getChannelById(nodeId) &&
      this.getChannelChildrenOf(nodeId).length > 0
    ) {
      return this.getUnreadStatusCount(nodeId);
    }
    return 0;
  }

  getUnreadCount(nodeId: number) {
    if (
      this.getConversationNodeById(nodeId) &&
      this.getChildrenOf(nodeId).length > 0
    ) {
      return this.getUnreadStatusCount(nodeId);
    }
    return 0;
  }

  getNodeCount(nodeId: number) {
    if (
      this.getConversationNodeById(nodeId) &&
      this.getChildrenOf(nodeId).length > 0
    ) {
      return this.getNodeStatusCount(nodeId);
    }
    return 0;
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
    this.ensureAllQuestsReadStatus();
    this.ensureAllChannelReadStatus();
  }
}
</script>
<style scoped></style>
