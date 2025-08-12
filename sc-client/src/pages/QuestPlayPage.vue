<template>
  <q-page v-if="ready" class="bg-secondary quest-play-page">
    <div class="row q-mb-md">
  <div class="col-8">
    <q-breadcrumbs class="q-pa-sm rounded-borders shadow-2">
      <q-breadcrumbs-el
        class="text-black"
        icon="home"
        label="Guild"
        :to="{ name: 'guild', params: { guild_id: guildId } }"
      />
      <q-breadcrumbs-el icon="forum" label="Quest Play" />
    </q-breadcrumbs>
        <div class="q-ml-md" style="display: flex; align-items: center;">
      <member />
    </div>
  </div>
</div>
    <div class="row justify-center q-pa-md" style="max-width: 1200px; margin: 0 auto; width: 100%">
      <q-card style="width: 100%; background-color: transparent" class="q-mb-md">
        <quest-details />
        <quest-actions :myPlayingGuilds="myPlayingGuilds" :questId="questId" />

        <div class="row justify-center q-mt-lg">
          <router-link
            :to="{
              name: 'conversation_column',
              params: { quest_id: questId },
            }"
          >
            Card View
          </router-link>
        </div>
      </q-card>

      <!-- Main content: Node Tree + Selected Node side-by-side -->
      <div class="row q-mt-md" style="width: 100%">
        <!-- Left: Quest Node Tree (9 columns wide on md+) -->
        <div class="col-12 col-md-9">
          <q-card class="q-pa-md" style="height: 100%;">
            <quest-node-tree
              :questId="questId"
              :guildId="guildId"
              :selectedNodeId="selectedNodeId"
            />
          </q-card>
        </div>

        <!-- Right: Selected Node (3 columns wide on md+) -->
        <transition name="fade">
          <div class="col-12 col-md-3" v-if="selectedNode">
            <q-card flat bordered class="q-pa-md shadow-2 rounded-borders selected-node-card" style="height: 100%;">
              <h3
                class="text-h6 text-primary text-weight-bold q-mb-sm row items-center selected-node-header"
              >
                <q-icon name="label_important" class="q-mr-sm" />
                Selected Node
              </h3>
              <q-card-section>
                <div class="text-h6 text-primary q-mb-sm">
                  {{ selectedNode!.title || 'Selected Node' }}
                </div>
                <div class="text-caption text-grey">
                  Node ID: {{ selectedNode!.id }}
                  <q-badge v-if="selectedNode!.parent_id === null" color="deep-orange" class="q-ml-xs">
                    Root
                  </q-badge>
                </div>
                <div
                  class="scrollable-description q-mb-md"
                  style="max-height: 200px; overflow-y: auto;"
                >
                  <div
                    v-if="selectedNode!.description"
                    v-html="selectedNode!.description"
                    class="node-card-details"
                  />
                  <div v-else class="text-grey">
                    No description provided.
                  </div>
                </div>
              </q-card-section>
              <q-separator />
              <EditButton
                :nodeId="selectedNode!.id"
                :questId="questId"
                @click="editNode(selectedNode!.id)"
              />
              <q-btn :flat="true" icon="add" />
            </q-card>
          </div>
        </transition>
      </div>
    </div>
  </q-page>
</template>


<script setup lang="ts">
import member from '../components/member-handle.vue';
import questNodeTree from '../components/quest-node-tree.vue';
import questDetails from '../components/quest-details.vue';
import questActions from '../components/quest-actions.vue';
import { waitUserLoaded } from '../app-access';
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch, nextTick } from 'vue'; // added nextTick
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { ConversationNode, GuildData, GuildMembership } from '../types';
import { useConversationStore } from '../stores/conversation';
import { ibis_child_types}  from '../stores/conversation'
import { ibis_node_type_list } from'../enums'
import EditButton from '../components/edit-button.vue';

// Stores
const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const conversationStore = useConversationStore();

// Route
const route = useRoute();

// Reactive Variables
const ready = ref(false);
const questId = ref<number | undefined>(undefined);
const mySelectedPlayingGuildId = ref<number | undefined>(undefined);
const newNode = ref({});
const addingChildToNodeId = ref<number | null>(null);
const selectedIbisTypes = ref<any[]>([]);
const allowChangeMeta = ref(false);
const editingNodeId = ref<number | null>(null);
const form = ref<any>(null);
const nodeForms = ref<Record<string, any>>({});

const parseNodeId = (param: string | string[] | undefined): number | undefined => {
  if (typeof param === 'string') {
    return Number.parseInt(param);
  } else if (Array.isArray(param) && param.length > 0) {
    return Number.parseInt(param[0]);
  }
  return undefined;
};

const selectedNodeId = ref<number | undefined>(parseNodeId(route.params.node_id));



// Variables
let myPlayingGuilds: GuildData[] = [];

// Lifecycle Hooks
onMounted(async () => {
  ready.value = false;
  await initialize();
  ready.value = true;
});

// Computed Properties
const selectedNode = computed(() => {
  if (selectedNodeId.value != null) {
    return conversationStore.getConversationNodeById(selectedNodeId.value);
  }
  return undefined;
});
const guildId = computed(() => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting = memberStore.castingPerQuest[quest_id!];
  return casting ? casting.guild_id : undefined;
});
// Watches
watch(guildId, async () => {
  await initializeGuildInner();
});
watch(questId, async () => {
  await initialize();
});
watch(
  () => route.params.node_id,
  (newVal) => {
    selectedNodeId.value = parseNodeId(newVal);
  }
);
watch(selectedNode, (val) => {
  console.log('selectedNode changed:', val);
});

// Functions
function guildsPlayingGame(onlyMine = false, recruiting = false) {
  let guildIds =
    questStore.getCurrentQuest?.game_play?.map((gp) => gp.guild_id) || [];
  if (onlyMine) {
    guildIds = guildIds.filter((g) =>
      memberStore.member?.guild_membership?.some(
        (gm: GuildMembership) => gm.guild_id === g && gm.status === 'confirmed',
      ),
    );
  }
  let guilds = guildIds.map((gid) => guildStore.getGuildById(gid));
  if (recruiting) {
    guilds = guilds.filter((g) => g.open_for_applications);
  }
  return guilds;
}
function calcPublicationConstraints(node: ConversationNode) {
  // Your logic here
  // Possibly set some reactive state or perform validation
  console.log('calcPublicationConstraints called for node:', node.id);
}

function getNode(nodeId: number): ConversationNode | null {
  const node = conversationStore.getConversationNodeById(nodeId);
  return node ?? null;
}


async function initialize() {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string') {
    questId.value = Number.parseInt(route.params.quest_id);
  }
  questStore.setCurrentQuest(questId.value!);
  await Promise.all([
    questStore.ensureQuest({ quest_id: questId.value! }),
    guildStore.ensureGuildsPlayingQuest({ quest_id: questId.value! }),
  ]);
  await initializeGuildInner();
}

async function initializeGuildInner() {
  if (guildId.value) {
    ready.value = false;
    guildStore.setCurrentGuild(guildId.value);
    await guildStore.ensureGuild(guildId.value);
    if (!selectedNodeId.value) {
      selectedNodeId.value = questStore.getCurrentGamePlay?.focus_node_id;
    }
    ready.value = true;
  } else if (memberStore.member) {
    myPlayingGuilds = guildsPlayingGame(true);
    if (myPlayingGuilds.length) {
      mySelectedPlayingGuildId.value = myPlayingGuilds[0].id;
    }
  }
}

async function editNode(nodeId: number) {
  if (typeof nodeId === 'number') {
    const selectedNodeLocal = getNode(nodeId);
    if (!selectedNodeLocal) {
      console.warn('Node not found:', nodeId);
      return;
    }
    newNode.value = { ...selectedNodeLocal };
    addingChildToNodeId.value = null;

    if (selectedNodeLocal.parent_id != null) {
      const parent = getNode(selectedNodeLocal.parent_id);
      selectedIbisTypes.value = parent?.node_type
  ? ibis_child_types(parent.node_type)
  : [];

      allowChangeMeta.value =
        parent?.meta === 'conversation' && conversationStore.canMakeMeta(nodeId);
    } else {
      selectedIbisTypes.value = ibis_node_type_list;
      allowChangeMeta.value = false;
    }

    calcPublicationConstraints(selectedNodeLocal);
    editingNodeId.value = nodeId;

    await nextTick();
    const formKey = `editForm_${nodeId}`;
    form.value = nodeForms.value[formKey];
    if (form.value?.setFocus) {
      form.value.setFocus();
    }
  }
}
</script>

<style scoped>
.quest-play-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.sidenav {
  height: 100%;
  width: 15%;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  color: black;
  background-color: rgb(230, 234, 238);
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  border: 1px solid gray;
}
.quest-name {
  text-decoration: underline;
  padding: 5px;
  margin-top: 16px;
}
</style>
