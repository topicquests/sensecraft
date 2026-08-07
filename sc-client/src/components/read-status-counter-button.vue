<template>
  <div>
    <div v-if="isChannel">
      <!--Node is read has children and folded then transparent-->
      <!--Node is not read has children and folded then blue-->
      <q-btn
        v-if="
          getChannelUnreadCount(readStatusProps.node_id)! > 0 &&
          channelStore.getChannelChildrenOf(readStatusProps.node_id) &&
          channelStore.getChannelChildrenOf(readStatusProps.node_id)!.length >
            0 &&
          !isExpanded
        "
        round
        size="12px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="white"
        @click="toggleReadStatus()"
      >
        <strong>{{ getChannelUnreadCount(readStatusProps.node_id) }}</strong> /
        {{ getNodeCount(node_id) }}
      </q-btn>
      <!--Node is read has children and unfolded then transparent-->
      <!--Node is not read has children and unfolded then blue-->
      <q-btn
        v-else-if="
          channelStore.getChannelChildrenOf(readStatusProps.node_id) &&
          channelStore.getChannelChildrenOf(readStatusProps.node_id)!.length >
            0 &&
          isExpanded
        "
        round
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        @click="toggleReadStatus()"
      >
      </q-btn>
      <q-btn
        v-else
        :color="localRead ? 'transparent' : 'blue'"
        round
        size="9px"
        @click="toggleReadStatus()"
      >
      </q-btn>
    </div>
    <div v-else>
      <!--Node is read has children and folded then transparent-->
      <!--Node is not read has children and folded then blue-->
      <q-btn
        v-if="
          getUnreadCount(readStatusProps.node_id)! > 0 &&
          getChildren(readStatusProps.node_id).length > 0 &&
          !isExpanded
        "
        round
        size="12px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="white"
        @click="toggleReadStatus()"
      >
        <strong>{{ getUnreadCount(readStatusProps.node_id) }}</strong> /
        {{ getNodeCount(readStatusProps.node_id) }}
      </q-btn>
      <!--Node is read has children and unfolded then transparent-->
      <!--Node is not read has children and unfolded then blue-->
      <q-btn
        v-else-if="
          getChildren(readStatusProps.node_id).length > 0 && isExpanded
        "
        round
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        @click="toggleReadStatus()"
      >
      </q-btn>
      <q-btn
        round
        size="9px"
        v-else
        :color="localRead ? 'transparent' : 'blue'"
        @click="toggleReadStatus()"
      >
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChannelStore } from '../stores/channel';
import { useConversationStore } from '../stores/conversation';
import { useReadStatusStore } from '../stores/readStatus';
import { computed } from 'vue';

const readStatusStore = useReadStatusStore();
const channelStore = useChannelStore();
const conversationStore = useConversationStore();
const readStatusProps = defineProps<{
  node_id: number;
  isRead?: boolean;
  isChannel: boolean;
  isExpanded: boolean;
}>();
let localRead = readStatusProps.isRead;
const getChannelUnreadCount = computed(() => (nodeId: number) => {
  if (
    channelStore.getChannelById(nodeId) &&
    channelStore.getChannelChildrenOf(nodeId)!.length > 0
  ) {
    return readStatusStore.getUnreadStatusCount(nodeId);
  }
  return 0;
});

const getUnreadCount = computed(() => (nodeId: number) => {
  if (
    conversationStore.getConversationNodeById(nodeId) &&
    conversationStore.getChildrenOf(nodeId).length > 0
  ) {
    return readStatusStore.getUnreadStatusCount(nodeId);
  }
  return 0;
});

const getNodeCount = computed(() => (nodeId: number) => {
  if (readStatusProps.isChannel) {
    if (
      channelStore.getChannelById(nodeId) &&
      channelStore.getChannelChildrenOf(nodeId)!.length > 0
    ) {
      return readStatusStore.getNodeStatusCount(nodeId);
    }
  } else {
    if (
      conversationStore.getConversationNodeById(nodeId) &&
      conversationStore.getChildrenOf(nodeId).length > 0
    ) {
      return readStatusStore.getNodeStatusCount(nodeId);
    }
  }
  return 0;
});
const getChildren = computed(
  () => (id: number) => conversationStore.getChildrenOf(id),
);
async function toggleReadStatus() {
  localRead = !localRead;
  await readStatusStore.CreateOrUpdateReadStatus({
    nodeid: readStatusProps.node_id,
    new_status: localRead,
    override: true,
  });
  if (readStatusProps.isChannel) {
    await readStatusStore.ensureAllChannelReadStatus();
  } else {
    await readStatusStore.ensureAllQuestsReadStatus();
  }
}
</script>
<style>
.round-btn {
  border-radius: 50%;
  padding: 0; /* Removes extra space */
  display: flex; /* Ensures perfect alignment */
  align-items: center;
  justify-content: center;
}

.round-btn.small {
  border-radius: 50%;
  padding: 0;
  width: 24px;
  height: 24px;
}

.round-btn.medium {
  border-radius: 50%;
  padding: 0;
  width: 32px;
  height: 32px;
}

.round-btn.large {
  border-radius: 50%;
  padding: 0;
  width: 48px;
  height: 48px;
}
</style>
