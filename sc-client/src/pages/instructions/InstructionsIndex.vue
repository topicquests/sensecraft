<template>
  <q-page padding>
    <div class="instructions-index">
      <div class="page-title">Instructions</div>
      <p class="intro">
        Pick a topic below to learn how to use SenseCraft. Each guide walks
        you through the action step by step.
      </p>
      <div class="topic-grid">
        <router-link
          v-for="topic in topics"
          :key="topic.name"
          :to="{ name: topic.name }"
          class="topic-card"
        >
          <div class="topic-title">{{ topic.title }}</div>
          <div class="topic-desc">{{ topic.desc }}</div>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
const topics = [
  {
    name: 'instructions_create_quest',
    title: 'How to Create a Quest',
    desc: 'Start a new quest, set its dates, and publish it.',
  },
  {
    name: 'instructions_edit_quest',
    title: 'How to Edit a Quest',
    desc: 'Open a quest you own and add or update conversation nodes.',
  },
  {
    name: 'instructions_create_guild',
    title: 'How to Create a Guild',
    desc: 'Found a new guild and choose its default role.',
  },
  {
    name: 'instructions_join_guild',
    title: 'How to Join a Guild',
    desc: 'Find an open guild from the dashboard and join it.',
  },
  {
    name: 'instructions_join_quest',
    title: 'How to Join a Quest',
    desc: 'Have your guild participate in a quest and pick your role.',
  },
  {
    name: 'instructions_guild_conversations',
    title: 'How to Use Guild Conversations',
    desc: 'Create and open guild channels for ongoing discussion.',
  },
  {
    name: 'instructions_set_roles',
    title: 'How an Admin Sets Roles',
    desc: 'Manage guild members and assign or change their roles.',
  },
  {
    name: 'instructions_channels',
    title: 'How Channels Work',
    desc: 'Understand guild, quest, and automatic role channels.',
  },
  {
    name: 'instructions_play_quest',
    title: 'How to Play a Quest',
    desc: 'Read the conversation tree and add your contributions.',
  },
];
</script>

<style scoped>
.instructions-index {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}

.intro {
  text-align: center;
  color: #555;
  margin-bottom: 24px;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.topic-card {
  display: block;
  padding: 18px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.topic-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.topic-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 6px;
}

.topic-desc {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
}
</style>
