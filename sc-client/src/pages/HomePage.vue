<template>
  <div>
    <q-page>
      <!-- Content Wrapper to control width -->
      <div class="content-wrapper gradient">
        <!-- Header Section -->
        <div class="row justify-center text-center header">
          <h1 class="title text-h1">SenseCraft</h1>
          <h3 class="subtitle text-h3">
            Where teams co-construct structured conversation
          </h3>
        </div>

        <!-- Image Section -->
        <q-card class="image-card">
          <img
            src="../statics/earthrise2.png"
            alt="Earthrise"
            class="responsive-image"
          />
        </q-card>

        <!-- Main Section -->
        <div class="row gradient justify-center q-pt-lg q-pb-lg">
          <q-card class="main-card">
            <div class="row q-gutter-md no-wrap content-container">
              <!-- Column 1: Description Text -->
              <div class="col-12 col-md-4">
                <div class="description-text">
                  SenseCraft is an RPG where teams co-create structured
                  dialogues. Quest creators ask deep questions through quests,
                  and guild members take on roles to build a shared conversation
                  tree. Players collaborate to shape meaningful conversations,
                  compete in quests, and foster collaborative discussions. Join
                  SenseCraft for structured conversations and role-playing.
                </div>
              </div>

              <!-- Column 2: Image -->
              <div class="col-12 col-md-4">
                <img
                  src="../statics/democratic_leadership_style_discussed.jpg"
                  alt="Leadership Discussion"
                  class="content-image"
                />
              </div>

              <!-- Column 3: Quest List -->
              <div class="col-12 col-md-3">
                  <div class="quest-list-1">
            <div class="quest-list-header">
              <h5>Available Quests</h5>
            </div>
          <quest-list
            :quests="quests"
            :status="status"
          />
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
import { onBeforeMount } from 'vue';
import { useQuestStore } from '../stores/quests';
import { QuestData } from '../types';
import QuestList from '../components/quest-list.vue';
import { quest_status_enum } from '../enums';

const questStore = useQuestStore();

const quests:QuestData[] = questStore.getQuests;
const status: string[] = [
  quest_status_enum.registration,
  quest_status_enum.ongoing,
]

onBeforeMount(async () => {
  await questStore.ensureAllQuests();
});
</script>

<style scoped>
body {
  background-color: #485c12; /* Replace this with your desired color */
}

/* Content Wrapper */
.content-wrapper {
  width: 80%; /* Takes up 80% of the width */
  max-width: 1800px; /*Optional: Add a max width to avoid excessive stretching on large screens */
  margin: 0 auto; /* Center the content horizontally */
}

/* General Styles */
.container {
  max-width: 100%;
}

/* Header Section */
.header {
  display: flex; /* Enable Flexbox */
  flex-direction: column; /* Stack title and subtitle vertically */
  align-items: center; /* Center items horizontally */
  justify-content: center;
}

.title {
  color: #2c3e50;
  font-weight: bold;
  font-size: 3.5rem;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
  white-space: nowrap;
}

.subtitle {
  color: #34495e;
  font-style: italic;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
  font-size: 1.8rem;
}

/* Image Section */
.image-card {
  margin: 20px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.responsive-image {
  width: 100%;
  height: auto;
}

/* Gradient Section */
.gradient {
  background: linear-gradient(
    90deg,
    rgba(0, 212, 255, 1) 35%,
    rgba(9, 9, 121, 1) 100%
  );
  width: 100%;
  padding: 30px 0;
}

/* Main Card */
.main-card {
  width: 100%;
  padding: 20px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.content-container {
  align-items: flex-start;
}

/* Column 1: Description Text */
.description-text {
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.6;
  padding: 10px;
}

/* Column 2: Image */
.content-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Column 3: Available Quests */
.available-quests-card {
  padding: 8px;
  border-radius: 12px;
  background-color: #fdf9e6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.quest-title {
  text-align: center;
  color: #d35400;
  font-weight: bold;
  font-size: 22px;
  margin-bottom: 0.2em;
  margin-top: 0.2em;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quest-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  padding: 2px;
}

.quest-description {
  text-align: center;
  color: #34495e;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive Styles */
@media only screen and (max-width: 600px) {
  .content-wrapper {
    width: 90%; /* Slightly reduce width on small screens */
  }

  .description-text {
    font-size: 0.9rem;
  }

  .quest-title {
    font-size: 1rem;
  }

  .quest-card {
    padding: 6px;
  }
  @media only screen and (max-width: 768px) {
    /* Adjust content-container for column layout */
    .content-container {
      flex-direction: column; /* Stack items vertically */
      align-items: center; /* Center items horizontally */
    }

    /* Adjust child columns to occupy full width */
    .col-12 {
      width: 100%; /* Make all columns occupy the full width */
      margin-bottom: 20px; /* Add spacing between sections */
    }

    .content-image {
      max-width: 80%; /* Optional: Restrict image size on smaller screens */
      margin: 0 auto; /* Center the image horizontally */
    }

    .available-quests-card {
      width: 90%; /* Optional: Restrict card size for better spacing */
      margin: 0 auto; /* Center the card horizontally */
    }
  }
}
</style>
