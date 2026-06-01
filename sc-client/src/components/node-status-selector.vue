<template>
  <span
    v-if="!canRaise"
    :class="'node-status node-status-' + liveStatus"
  >
    {{ liveStatus }}
  </span>
  <q-chip
    v-else
    :class="'node-status node-status-' + liveStatus"
    :dense="props.dense"
    clickable
    color="grey-3"
    text-color="primary"
    data-test="node-status-raise-selector"
    @click.stop
  >
    {{ liveStatus }}
    <q-icon name="arrow_drop_down" class="q-ml-xs" />
    <q-menu auto-close anchor="bottom left" self="top left">
      <q-list dense style="min-width: 140px">
        <q-item
          v-for="opt in raiseOptions"
          :key="opt"
          clickable
          v-close-popup
          @click.stop="save(opt)"
        >
          <q-item-section>{{ opt }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { ConversationNode } from '../types';
import { publication_state_list, publication_state_type } from '../enums';
import { useQuestStore } from '../stores/quests';
import { useMemberStore } from '../stores/member';
import { useConversationStore } from '../stores/conversation';

const props = withDefaults(
  defineProps<{
    node: ConversationNode;
    dense?: boolean;
  }>(),
  { dense: true },
);

const $q = useQuasar();
const questStore = useQuestStore();
const memberStore = useMemberStore();
const conversationStore = useConversationStore();

const currentNode = computed<ConversationNode>(
  () => conversationStore.getConversationNodeById(props.node.id) ?? props.node,
);

const liveStatus = computed<publication_state_type>(
  () => currentNode.value.status,
);

const isPlayingHere = computed(() => {
  const questId = currentNode.value.quest_id;
  if (!questId) return false;
  const casting = memberStore.castingPerQuest[questId];
  return !!casting && casting.guild_id === currentNode.value.guild_id;
});

const maxAllowed = computed<publication_state_type>(() =>
  questStore.getMaxPubStateForNodeType(
    currentNode.value.quest_id,
    currentNode.value.node_type,
    currentNode.value.guild_id,
  ),
);

const parentNode = computed<ConversationNode | undefined>(() => {
  const pid = currentNode.value.parent_id;
  return pid ? conversationStore.getConversationNodeById(pid) : undefined;
});

const effectiveMax = computed<publication_state_type>(() => {
  const roleCap = maxAllowed.value;
  const parentStatus = parentNode.value?.status;
  if (!parentStatus) return roleCap;
  const roleIdx = publication_state_list.indexOf(roleCap);
  const parentIdx = publication_state_list.indexOf(parentStatus);
  return roleIdx <= parentIdx ? roleCap : parentStatus;
});

const raiseOptions = computed<publication_state_type[]>(() => {
  const currentIdx = publication_state_list.indexOf(liveStatus.value);
  const maxIdx = publication_state_list.indexOf(effectiveMax.value);
  if (currentIdx < 0 || maxIdx <= currentIdx) return [];
  return publication_state_list.slice(currentIdx + 1, maxIdx + 1).filter((s) => {
    if (currentNode.value.meta === 'meta') {
      return s !== 'published' && s !== 'submitted';
    }
    return true;
  });
});

const canRaise = computed(
  () => isPlayingHere.value && raiseOptions.value.length > 0,
);

async function save(val: publication_state_type) {
  if (val === liveStatus.value) return;
  try {
    await conversationStore.updateNodeStatus(props.node.id, val);
    if (liveStatus.value === val) {
      $q.notify({ type: 'positive', message: `Status set to ${val}` });
    } else {
      $q.notify({
        type: 'warning',
        message: `Server kept status at ${liveStatus.value} — raise the parent node first`,
        timeout: 6000,
      });
    }
  } catch (err) {
    const e = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const detail =
      e?.response?.data?.message || e?.message || 'Could not update status';
    $q.notify({ type: 'negative', message: detail });
  }
}
</script>
