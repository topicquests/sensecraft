<template>
  <q-dialog v-model="showDialog">
    <q-card class="q-mb-xl q-pa-md">
      <q-card-section>
        <div class="dialog-title">Guild Page Instructions</div>

        <div class="instruction-category">
          <p>
            The **Guild Page** is where team members collaborate to take on
            quests and engage in structured conversations. Guild members can
            assume specific roles, interact with others, and build upon shared
            knowledge to complete challenges.
          </p>
        </div>

        <div class="instruction-category">
          <div class="instruction-category-title">Joining a Guild</div>
          <ul class="status-list">
            <li>Locate the **JOIN GUILD** button next to the guild name.</li>
            <li>Click the button to immediately join—no approval required.</li>
            <li>Your handle will be added to the list of team members.</li>
          </ul>
        </div>

        <div class="instruction-category">
          <div class="instruction-category-title">Accessing Conversations</div>
          <ul class="status-list">
            <li>
              Once you're a guild member, a **hamburger menu icon** will appear
              in the upper right corner.
            </li>
            <li>
              This is the **Conversation button**, located next to the Log Off
              button.
            </li>
            <li>
              Clicking this button allows you to participate in structured guild
              discussions.
            </li>
            <li>
              Once you are playing in a quest structure quest discussions will
              be visible
            </li>
            <li>
              The icon will be grey if all conversation nodes have been read.
              And teal if there any unread nodes
            </li>
          </ul>
        </div>
        <div class="instruction-category">
          <div class="instruction-category-title">Playing in Quest</div>
          <ul class="status-list">
            <li>
              Once you're a guild member. Then you will have an oppurtunity to
              play any registered quests
            </li>
          </ul>
        </div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const showDialog = defineModel<boolean>();
</script>

<style scoped>
/* Dialog styling */
.q-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card styling */
.q-card {
  width: 75%;
  max-width: 800px;
  border-radius: var(--sc-radius-lg);
  box-shadow: var(--sc-shadow-md);
}

/* Title styling */
.dialog-title {
  font-size: 1.5rem;
  font-weight: var(--sc-font-weight-bold);
  color: var(--sc-color-text);
  text-align: center;
  margin-bottom: var(--sc-space-16);
}

/* Section titles */
.instruction-category-title {
  font-size: 1.25rem;
  font-weight: var(--sc-font-weight-bold);
  color: var(--sc-color-text);
  margin-bottom: var(--sc-space-8);
}

/* Styling for lists in the instructions */
.status-list {
  list-style-type: disc; /* Standard bullet points */
  padding-left: 20px; /* Indent list items for better readability */
  font-size: 1rem; /* Standard readable size */
  color: var(--sc-color-text);
  line-height: 1.6; /* Improves spacing between lines */
}

.status-list li {
  color: var(--sc-color-text-muted);
  margin-bottom: var(--sc-space-8);
}

.status-list strong {
  font-weight: var(--sc-font-weight-bold);
  color: var(--sc-color-text);
}

@media (max-width: 600px) {
  .status-list {
    font-size: 0.9rem; /* Adjusts font size for smaller screens */
    padding-left: 15px; /* Reduces left padding */
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .q-card {
    width: 95%;
    padding: 15px;
  }
}
</style>
