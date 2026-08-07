<template>
  <div>
    <q-page>
      <section class="hero">
        <node-pattern color="#ffffff" :opacity="0.14" />
        <div class="hero__content">
          <p class="sc-eyebrow hero__eyebrow">Collective Sensemaking</p>
          <h1 class="hero__title">SenseCraft</h1>
          <p class="hero__subtitle">
            Where teams co-construct structured conversation.
          </p>
        </div>
      </section>

      <div class="content-wrapper">
        <div class="row q-col-gutter-lg content-row">
          <div class="col-12 col-md-5">
            <h2 class="text-h4">A structured way to think together</h2>
            <p class="description-text">
              SenseCraft is an RPG where teams co-create structured dialogues.
              Quest creators ask deep questions through quests, and guild
              members take on roles to build a shared conversation tree.
              Players collaborate to shape meaningful conversations, compete
              in quests, and foster collaborative discussions. Join
              SenseCraft for structured conversations and role-playing.
            </p>
          </div>

          <div class="col-12 col-md-3">
            <div class="illustration-card">
              <node-pattern
                color="var(--sc-color-primary)"
                :opacity="0.5"
              />
            </div>
          </div>

          <div class="col-12 col-md-4">
            <q-card class="quest-list-card">
              <q-card-section class="quest-list-card__header">
                <h3 class="text-h6" style="margin: 0">Available Quests</h3>
              </q-card-section>
              <q-separator />
              <q-card-section class="quest-scroll-area">
                <quest-list :quests="quests" :status="status" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useQuestStore } from '../stores/quests';
import QuestList from '../components/quest-list.vue';
import NodePattern from '../components/graphics/NodePattern.vue';
import { quest_status_enum } from '../enums';

const questStore = useQuestStore();
const quests = computed(() => questStore.getQuests);

const status: string[] = [
  quest_status_enum.registration,
  quest_status_enum.ongoing,
];

onBeforeMount(async () => {
  await questStore.ensureAllQuests();
});
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: var(--sc-color-chrome-bg);
  color: #ffffff;
  padding: var(--sc-space-64) var(--sc-space-24);
  text-align: center;
}

.hero__content {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}

.hero__eyebrow {
  color: rgba(255, 255, 255, 0.72);
}

.hero__title {
  font-size: 3rem;
  font-weight: var(--sc-font-weight-bold);
  margin: var(--sc-space-8) 0;
}

.hero__subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--sc-space-48) var(--sc-space-24);
}

.description-text {
  font-size: 1rem;
  color: var(--sc-color-text-muted);
  line-height: 1.6;
}

.illustration-card {
  position: relative;
  min-height: 220px;
  border-radius: var(--sc-radius-lg);
  background: var(--sc-color-primary-subtle);
  overflow: hidden;
}

.quest-list-card {
  height: 100%;
}

.quest-list-card__header {
  background: var(--sc-color-bg-muted);
}

.quest-scroll-area {
  max-height: 260px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .hero {
    padding: var(--sc-space-48) var(--sc-space-16);
  }

  .hero__title {
    font-size: 2.25rem;
  }

  .content-wrapper {
    padding: var(--sc-space-24) var(--sc-space-16);
  }
}
</style>
