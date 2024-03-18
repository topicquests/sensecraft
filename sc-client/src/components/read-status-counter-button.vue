<template>
  <div>
    <div v-if="isChannel">
      <!--Node is read has children and folded then transparent-->
      <!--Node is not read has children and folded then blue-->
      <q-btn
        round
        v-if="
          getChannelUnreadCount(node_id) > 0 &&
          channelStore.getChannelChildrenOf(node_id) &&
          channelStore.getChannelChildrenOf(node_id).length > 0 &&
          !isExpanded
        "
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
        <strong>{{ getChannelUnreadCount(node_id) }}</strong> /
        {{ getNodeCount(node_id) }}
      </q-btn>
      <!--Node is read has children and unfolded then transparent-->
      <!--Node is not read has children and unfolded then blue-->
      <q-btn
        round
        v-else-if="
          channelStore.getChannelChildrenOf(node_id) &&
          channelStore.getChannelChildrenOf(node_id).length > 0 &&
          isExpanded
        "
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
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
    <div v-else>
      <!--Node is read has children and folded then transparent-->
      <!--Node is not read has children and folded then blue-->
      <q-btn
        round
        v-if="
          getUnreadCount(node_id) > 0 &&
          conversationStore.getChildrenOf(node_id).length > 0 &&
          !isExpanded
        "
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
        <strong>{{ getUnreadCount(node_id) }}</strong> /
        {{ getNodeCount(node_id) }}
      </q-btn>
      <!--Node is read has children and unfolded then transparent-->
      <!--Node is not read has children and unfolded then blue-->
      <q-btn
        round
        v-else-if="conversationStore.getChildrenOf(node_id).length > 0 && isExpanded"
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
      </q-btn>
      <q-btn
        round
        v-else
        size="9px"
        :color="localRead ? 'transparent' : 'blue'"
        text-color="black"
        @click="toggleReadStatus()"
      >
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChannelStore } from 'src/stores/channel';
import { useConversationStore } from 'src/stores/conversation';
import { useReadStatusStore } from 'src/stores/readStatus';

const readStatusStore = useReadStatusStore();
const channelStore = useChannelStore()
const conversationStore = useConversationStore()
const readStatusProps = defineProps<{
  node_id: {
    type: number,
    required: true,
  },
  isRead: { 
    type: boolean 
  },
  isChannel: {
    type: boolean,
    default: false,
  },
  isExpanded: boolean,
}>();
let localRead= readStatusProps.isRead;
function getChannelUnreadCount(nodeId: number) {
  if (
    channelStore.getChannelById(nodeId) &&
      channelStore.getChannelChildrenOf(nodeId).length > 0
    ) {
      return readStatusStore.getUnreadStatusCount(nodeId);
    }
    return 0;
  }

function getUnreadCount(nodeId: number) {
    if (
      conversationStore.getConversationNodeById(nodeId) &&
      conversationStore.getChildrenOf(nodeId).length > 0
    ) {
      return readStatusStore.getUnreadStatusCount(nodeId);
    }
    return 0;
  }

function getNodeCount(nodeId: number) {
  if (readStatusProps.isChannel) {
    if (
      channelStore.getChannelById(nodeId) &&
      channelStore.getChannelChildrenOf(nodeId).length > 0
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
  }
  async function toggleReadStatus() {
    localRead = !localRead;
    await readStatusStore.CreateOrUpdateReadStatus({
      data: {
        nodeid: readStatusProps.node_id,
        new_status: localRead,
        override: true,
      },
    });
    if (readStatusProps.isChannel) {
      await readStatusStore.ensureAllChannelReadStatus();
    } else {
      await readStatusStore.ensureAllQuestsReadStatus();
    }
  }
</script>
<style scoped></style>
