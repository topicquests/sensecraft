<template>
  <q-page class="bg-grey-1 q-pa-md">
    <!-- Breadcrumb navigation -->
    <div class="row items-center justify-between q-mb-md">
      <q-breadcrumbs>
        <q-breadcrumbs-el
          label="Guild"
          :to="{ name: 'guild', params: { guild_id: guildId } }"
        />
        <q-breadcrumbs-el
          v-if="questId"
          label="Quest"
          :to="{ name: 'quest_page', params: { guild_id: guildId } }"
        />
        <q-breadcrumbs-el label="Channel" />
      </q-breadcrumbs>
      <q-badge color="deep-purple-5" outline>
        Role: {{ userRole }}
      </q-badge>
    </div>

    <div class="text-h5 q-mb-md">
      {{ currentChannel?.name || 'Channel Name' }}
    </div>

    <q-card class="q-pa-md">
      <q-card-section class="row">
        <!-- Left: Node Tree -->
        <div class="col-6">
          <div class="text-subtitle2 q-mb-sm">Channel Discussion Tree</div>
          <node-tree
            :initialSelectedNodeId="selectedNodeId"
            @tree-selection="selectionChanged"
            :currentGuildId="guildId"
            :currentQuestId="questId"
            :channelId="channelId"
            :isChannel="true"
            :roles="roles"
            :editable="true"
          />
        </div>

        <!-- Right: Selected Node -->
        <div class="col-6" v-if="selectedNode">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1">
                {{ selectedNode.title || 'Selected Node' }}
              </div>
              <div class="text-caption text-grey">
                {{ selectedNode.author }} &nbsp;•&nbsp; {{ selectedNode.timeAgo }}
              </div>
              <div class="q-mt-sm">{{ selectedNode.content }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn color="primary" label="Reply" flat />
              <q-btn
                color="primary"
                label="Edit"
                flat
                v-if="canEditNode(selectedNode)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <div class="q-mt-lg row justify-center" v-if="!ready">
      <q-spinner color="primary" size="50px" />
      <div class="q-ml-sm">Loading channel and nodes...</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import nodeTree from '../components/node-tree.vue';
import { useGuildStore } from '../stores/guilds';
import { useChannelStore } from '../stores/channel';
import { useRoleStore } from '../stores/role';

// Stores
const guildStore = useGuildStore();
const channelStore = useChannelStore();
const roleStore = useRoleStore();

// Route & Reactive Vars
const route = useRoute();
const guildId = ref<number>(Number(route.params.guild_id));
const questId = ref<number | null>(
  route.params.quest_id ? Number(route.params.quest_id) : null
);
const channelId = ref<number>(Number(route.params.channel_id));
const selectedNodeId = ref<number | null>(null);
const ready = ref(false);

// Dummy Selected Node Example (replace with actual)
const selectedNode = ref<any | null>(null);

// Mock user role
const userRole = 'Leader';

// Data
const currentChannel = computed(() => channelStore.getCurrentChannel);
const roles = roleStore.getRoles;

// Simulated permission check
function canEditNode(node: any) {
  return userRole === 'Leader' || node.author === 'me';
}

function selectionChanged(id: number) {
  selectedNodeId.value = id;
  // Replace with actual fetch:
  selectedNode.value = {
    title: 'How can we approach X?',
    author: 'Alice',
    timeAgo: '2h ago',
    content: 'Lorem ipsum dolor sit amet...',
  };
}

onBeforeMount(async () => {
  // Add actual async loading logic here
  await Promise.all([
    guildStore.ensureGuild(guildId.value),
    roleStore.ensureAllRoles(),
    channelStore.ensureChannelConversation(channelId.value, guildId.value),
  ]);
  ready.value = true;
});
</script>
