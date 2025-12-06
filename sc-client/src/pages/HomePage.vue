<template>
  <div>
    <q-page>
      <div class="content-wrapper gradient">
        <div class="row justify-center text-center header">
          <h1 class="title text-h1">SenseCraft</h1>
          <h3 class="subtitle text-h3">
            Where teams co-construct structured conversation
          </h3>
        </div>

        <q-card class="image-card">
          <img
            src="../statics/earthrise2.png"
            alt="Earthrise"
            class="responsive-image"
          />
        </q-card>

        <div class="row gradient justify-center q-pt-lg q-pb-lg">
          <q-card class="main-card">
            <div class="row q-gutter-md no-wrap content-row">
              <div class="col-12 col-md-4">
                <div class="description-text">
                  SenseCraft is an RPG where teams co-create structured
                  dialogues. Quest creators ask deep questions through quests,
                  and guild members take on roles to build a shared conversation
                  tree. Players collaborate to shape meaningful conversations,
                  compete in quests, and foster collaborative discussions.
                  Join SenseCraft for structured conversations and role-playing.
                </div>
              </div>

              <div class="col-12 col-md-4">
                <img
                  src="../statics/democratic_leadership_style_discussed.jpg"
                  alt="Leadership Discussion"
                  class="content-image"
                />
              </div>

              <div class="col-12 col-md-3 quest-column">
                <div class="quest-list-container">
                  <div class="quest-list-header">
                    <h5>Available Quests</h5>
                  </div>
                  <div class="quest-scroll-area">
                    <quest-list
                      :quests="quests"
                      :status="status"
                    />
                  </div>
                </div>
              </div>

            </div>
          </q-card>
        </div>
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useQuestStore } from '../stores/quests';
import QuestList from '../components/quest-list.vue';
import { quest_status_enum } from '../enums';

const questStore = useQuestStore();
const quests = computed(() => questStore.getQuests);

const status: string[] = [
  quest_status_enum.registration,
  quest_status_enum.ongoing
];

onBeforeMount(async () => {
  await questStore.ensureAllQuests();
});
</script>

<style scoped>
body {
  background-color: #485c12;
}

.content-wrapper {
  width: 80%;
  max-width: 1800px;
  margin: 0 auto;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: #2c3e50;
  font-weight: bold;
  font-size: 3.5rem;
  margin: 0.2em 0;
}

.subtitle {
  color: #34495e;
  font-style: italic;
  font-size: 1.8rem;
  margin: 0.2em 0;
}

.image-card {
  margin: 20px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.responsive-image {
  width: 100%;
  height: auto;
}

.gradient {
  background: linear-gradient(90deg, rgba(0,212,255,1) 35%, rgba(9,9,121,1) 100%);
  width: 100%;
  padding: 30px 0;
}

.main-card {
  width: 100%;
  padding: 20px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.content-row {
  align-items: flex-start;
}

.description-text {
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.6;
  padding: 10px;
}

.content-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.quest-column {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.quest-list-container {
  width: 100%;
  background-color: #fdf9e6;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.quest-scroll-area {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 6px;
}

.quest-list-header h5 {
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  color: #d35400;
}

@media (max-width: 768px) {
  .content-row {
    flex-direction: column;
    align-items: center;
  }

  .col-12 {
    width: 100%;
    margin-bottom: 20px;
  }

  .content-image {
    max-width: 80%;
    margin: 0 auto;
  }

  .quest-list-container {
    width: 90%;
    margin: 0 auto;
  }
}
</style>
