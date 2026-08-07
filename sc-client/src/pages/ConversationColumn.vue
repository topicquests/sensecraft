<template>
  <q-page v-if="ready">
    <div class="row justify-center">
      <q-card class="node-card q-mt-md q-pa-md">
        <q-card class="q-mt-md q-pa-md">
          <!-- Member Handle + Quest Link -->
          <div class="row justify-end" style="width: 92%">
            <member-handle />
          </div>
          <div class="row justify-center q-mt-lg">
            <router-link
              v-if="questId"
              :to="{ name: 'quest_page', params: { quest_id: questId } }"
              class="quest-link"
            >
              Quest Play Page
            </router-link>
          </div>

          <!-- Node Info -->
          <q-separator spaced />
          <div class="section-title">Node Info</div>
          <q-card class="node-info-card">
            <div class="row justify-center q-mb-sm">
              <h5 class="flex items-center text-h5">
                <q-icon
                  :name="getIcon(node!.id)"
                  class="q-mr-sm text-primary"
                />
                {{ node?.title }}
              </h5>
            </div>

            <!-- Scrollable Description -->
            <div class="row justify-center">
              <q-card class="q-mb-md scrollable-description shadow-2">
                <div class="content" v-html="node!.description"></div>
                <section v-if="node!.url || node!.node_type === 'reference'">
                  <div class="row q-ml-md">
                    <a :href="node!.url" target="_blank">
                      <span>url:</span> {{ node!.url }}
                    </a>
                  </div>
                </section>
              </q-card>
            </div>
          </q-card>

          <!-- Parent Node -->
          <q-separator spaced />
          <div class="section-title">Parent Node</div>
          <div class="row justify-center items-center">
            <div class="col-4 q-pa-sm" style="width: 100%">
              <q-card
                class="q-ma-md parent-card"
                v-if="parent"
                @click="updateNodeId(parent.id)"
                style="min-width: 200px; height: 150px; cursor: pointer"
                flat
                bordered
              >
                <span>Parent Node</span>
                <q-icon :name="getIcon(parent!.id)" size="md" class="q-mb-md" />
                <div class="parent-title">
                  {{ parent!.title }}
                </div>
              </q-card>
              <div v-else class="text-grey-6 q-mt-md q-mb-md text-center">
                No parent node.
              </div>
            </div>
          </div>

          <!-- IBIS Columns -->
          <q-separator spaced />
          <div class="section-title">IBIS Structure</div>
          <div class="ibis-grid q-pa-md">
            <ibis-column
              title="Question"
              :items="filteredQuestions"
              :icon="issueIcon"
              @select="updateNodeId"
            >
              <template #empty>
                <div class="empty-state">No questions.</div>
              </template>
            </ibis-column>
            <ibis-column
              title="Answer"
              :items="filteredAnswers"
              :icon="positionIcon"
              @select="updateNodeId"
            >
              <template #empty>
                <div class="empty-state">No answers.</div>
              </template>
            </ibis-column>
            <ibis-column
              title="Pro"
              :items="filteredPro"
              :icon="proIcon"
              @select="updateNodeId"
            >
              <template #empty>
                <div class="empty-state">No pros.</div>
              </template>
            </ibis-column>
            <ibis-column
              title="Con"
              :items="filteredCon"
              :icon="conIcon"
              @select="updateNodeId"
            >
              <template #empty>
                <div class="empty-state">No cons.</div>
              </template>
            </ibis-column>
            <ibis-column
              title="Ref"
              :items="filteredRef"
              :icon="refIcon"
              @select="updateNodeId"
            >
              <template #empty>
                <div class="empty-state">No references.</div>
              </template>
            </ibis-column>
          </div>
        </q-card>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { waitUserLoaded } from '../app-access';
import { useConversationStore } from '../stores/conversation';
import { QTreeNode } from '../types';
import { ibis_node_type_enum } from '../enums';
import issueIcon from '../statics/images/ibis/issue_sm.png';
import positionIcon from '../statics/images/ibis/position_sm.png';
import proIcon from '../statics/images/ibis/plus_sm.png';
import conIcon from '../statics/images/ibis/minus_sm.png';
import refIcon from '../statics/images/ibis/reference_sm.png';
import memberHandle from '../components/member-handle.vue';
import IbisColumn from '../components/ibis-column.vue';

// Stores
const conversationStore = useConversationStore();

// Route
const route = useRoute();

// Reactive Variables
const q = ref<Partial<QTreeNode[]> | undefined>();
const tree = ref<Partial<QTreeNode[]> | undefined>();
const nodeId = ref<number>();
const questId = ref<number>();
const ready = ref(false);

// Computed
const node = computed(() =>
  conversationStore.getConversationNodeById(nodeId.value!),
);
const parent = computed(() => {
  const id = node.value?.parent_id;
  return id ? conversationStore.getConversationNodeById(id) : undefined;
});

const filteredQuestions = computed(
  () =>
    (q.value?.filter(
      (i) => i && i.node_type === ibis_node_type_enum.question,
    ) as QTreeNode[]) || [],
);
const filteredAnswers = computed(() =>
  filterNodesByType(q.value, ibis_node_type_enum.answer),
);
const filteredPro = computed(
  () =>
    (q.value?.filter(
      (i) => i && i.node_type === ibis_node_type_enum.pro,
    ) as QTreeNode[]) || [],
);
const filteredCon = computed(() =>
  filterNodesByType(q.value, ibis_node_type_enum.con),
);
const filteredRef = computed(
  () =>
    (q.value?.filter(
      (i) => i && i.node_type === ibis_node_type_enum.reference,
    ) as QTreeNode[]) || [],
);

function getIcon(id: number) {
  return findNodeById(tree.value, id)?.icon;
}

// Watch
watch(nodeId, () => {
  if (nodeId.value) getIcon(nodeId.value);
});

// Functions
function updateNodeId(id: number) {
  nodeId.value = id;
  initialize();
}
function filterNodesByType(
  nodes: Partial<QTreeNode[]> | undefined,
  type: ibis_node_type_enum,
): QTreeNode[] {
  const result: QTreeNode[] = [];
  if (!nodes) return result;
  for (const n of nodes) {
    if (n!.node_type === type) result.push(n!);
    if (n!.children?.length)
      result.push(...filterNodesByType(n!.children, type));
  }
  return result;
}
function findNodeById(
  nodes: Partial<QTreeNode[]> | undefined,
  id: number,
): QTreeNode | null {
  if (!nodes) return null;
  for (const n of nodes) {
    if (n!.id === id) return n as QTreeNode;
    if (n!.children?.length) {
      const found = findNodeById(n!.children, id);
      if (found) return found;
    }
  }
  return null;
}
function initialize() {
  tree.value = conversationStore.getConversationTree;
  q.value = conversationStore.getChildrenOf(nodeId.value!);
}

// Lifecycle
onBeforeMount(async () => {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string') {
    questId.value = Number(route.params.quest_id);
  }
  await conversationStore.ensureConversation(questId.value!);
  nodeId.value = conversationStore.getRootNode?.id;
  initialize();
  ready.value = true;
});
</script>

<style>
.node-info-card {
  background: var(--sc-color-surface-sunken);
  border-radius: var(--sc-radius-lg);
  border: 1px solid var(--sc-color-border);
  box-shadow: var(--sc-shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.node-info-card:hover {
  box-shadow: var(--sc-shadow-md);
  border-color: var(--sc-color-border-strong);
  z-index: 2;
}

.node-info-card h5 {
  color: var(--sc-color-primary);
  font-weight: var(--sc-font-weight-bold);
  font-size: 1.25rem;
}

.node-info-card .q-icon {
  font-size: 2rem;
  color: var(--sc-color-primary);
}

.node-info-card .scrollable-description {
  background: var(--sc-color-bg-muted);
  border-radius: var(--sc-radius-md);
  box-shadow: var(--sc-shadow-sm);
  margin-top: 0.5rem;
}

.node-info-card .content {
  background: var(--sc-color-bg-muted);
  border-radius: var(--sc-radius-sm);
  padding: 1em;
  font-size: 1.05rem;
  color: var(--sc-color-text);
}

.node-info-card a {
  color: var(--sc-color-primary);
  font-weight: var(--sc-font-weight-bold);
  text-decoration: underline;
}

.node-info-card a:hover {
  color: var(--sc-color-primary-hover);
}

.parent-card {
  background: var(--sc-color-surface);
  border-radius: var(--sc-radius-lg);
  border: 1px solid var(--sc-color-border);
  box-shadow: var(--sc-shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.parent-card:hover {
  background: var(--sc-color-bg-muted);
  border-color: var(--sc-color-border-strong);
  box-shadow: var(--sc-shadow-md);
  z-index: 2;
}

.parent-card span {
  color: var(--sc-color-text-muted);
  font-weight: var(--sc-font-weight-bold);
  font-size: 1.05rem;
}

.parent-card .q-icon {
  font-size: 2rem;
  color: var(--sc-color-primary);
}

.parent-title {
  font-weight: var(--sc-font-weight-bold);
  color: var(--sc-color-text);
  margin-top: 0.5em;
  font-size: 1.15rem;
}
/* Responsive */
@media (max-width: 900px) {
  .node-info-card {
    padding: 1rem 0.5rem;
  }
}
.node-card {
  width: 70%;
  max-width: 1200px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: var(--sc-font-weight-bold);
  margin: 1rem 0 0.5rem 0;
  color: var(--sc-color-primary);
}

.quest-link {
  font-weight: var(--sc-font-weight-bold);
  color: var(--sc-color-primary);
  text-decoration: underline;
}

.scrollable-description {
  padding: 1rem;
  background-color: var(--sc-color-bg-muted);
  border-radius: var(--sc-radius-md);
  width: 100%;
  max-width: 600px;
  box-shadow: var(--sc-shadow-sm);
}

.content {
  background-color: var(--sc-color-bg-muted);
  padding: 1em;
  margin-bottom: 1em;
  font-family: var(--sc-font-family);
  font-size: 1rem;
  max-height: 220px;
  overflow-y: auto;
  width: 100%;
  border-radius: var(--sc-radius-sm);
  color: var(--sc-color-text);
}

.ibis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.ibis-grid .ibis-column,
.ibis-grid .q-card {
  background: var(--sc-color-surface);
  border-radius: var(--sc-radius-lg);
  border: 1px solid var(--sc-color-border);
  box-shadow: var(--sc-shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
  padding: 1.2rem 0.7rem;
  min-height: 240px;
  position: relative;
  z-index: 1;
}

.ibis-grid .ibis-column:hover,
.ibis-grid .q-card:hover {
  box-shadow: var(--sc-shadow-md);
  border-color: var(--sc-color-border-strong);
  z-index: 2;
}

.ibis-grid .ibis-column .empty-state {
  color: var(--sc-color-text-muted);
  font-style: italic;
  text-align: center;
  margin: 1em 0;
}

.ibis-grid .ibis-column .q-icon {
  margin-bottom: 0.5em;
  font-size: 2.2rem;
  color: var(--sc-color-primary);
}

.ibis-grid .ibis-column .q-card__section {
  padding: 0.5em 0;
}

.ibis-grid .ibis-column .q-card__title {
  font-weight: var(--sc-font-weight-bold);
  color: var(--sc-color-primary);
  font-size: 1.15rem;
  margin-bottom: 0.5em;
}

.empty-state {
  color: var(--sc-color-text-muted);
  font-style: italic;
  text-align: center;
  margin: 1em 0;
}

@media (max-width: 900px) {
  .node-card {
    width: 98%;
    max-width: 100vw;
    padding: 0.5rem;
  }
  .scrollable-description {
    width: 98%;
    max-width: 100vw;
  }
  .ibis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
