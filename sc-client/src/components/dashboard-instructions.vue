<template>
  <div>
    <q-dialog
    v-model="showDialog" >
      <q-card class="q-mb-xl">
        <q-card-section>
        <div class="dialog-title">How to Use the Dashboard</div>
        <!-- Quest Table Instructions -->
        <div class="instruction-category">
          <div class="instruction-category-title">Quest Table Instructions</div>
          <p>The Quest Table displays information related to ongoing quests and their progress. Here's how you can interact with it:</p>
          <ul class="status-list">
            <li><strong>Quest Details:</strong> The "Description" button (an icon with an information symbol) opens a dialog with additional information about the quest. The info icon is only shown on larger displays.</li>
            <li><strong>Status Indicator:</strong> The "Status" column shows whether a quest is active, completed, or paused. You can track the progress of each quest here.</li>
            <ul class="status-list">
              <li><strong>Registration:</strong> The quest is open for new participants.</li>
              <li><strong>Ongoing:</strong> The quest is currently active.</li>
              <li><strong>Paused:</strong> The quest is temporarily on hold.</li>
              <li><strong>Finished:</strong> The quest has been completed.</li>
            </ul>
            <li> <strong>Time:</strong> Time column displays time remaining before quest ends</li>
            <li><strong>#Guilds:</strong> You can see how many guilds are participating in a particular quest. </li>
            <li><strong>Filter and Sort:</strong> You can filter quests by status or sort them by other attributes such as name, participants, or progress.</li>
            <li><strong>Track Last Activity:</strong> The "Last Move" column provides information about the last action taken on a quest, giving you context about the most recent updates.</li>
          </ul>
        </div>

        <!-- Guild Table Instructions -->
        <div class="instruction-category">
          <div class="instruction-category-title">Guild Table Instructions</div>
          <p>The Guild Table provides an overview of the guilds and their activities. Here's how to use it:</p>
          <ul class="status-list">
            <li><strong>Select a Guild:</strong> Click on a row to select a guild. You can view or manage the guild’s details by selecting it.</li>
            <li><strong>Guild Details:</strong> The "Description" button (an icon with an information symbol) opens a dialog with additional information about the guild, including its description and members.</li>
            <li><strong>View Guild Actions:</strong> In the "Actions" column, you can go to a guild. There you will be able to join the guild if you so desire. Admin users can access the guild's admin page.</li>
            <li><strong>Track Guild Participation:</strong> The "Members" column indicates the total number of members in the guild.</li>
            <li><strong>Status of Guilds:</strong> The "Status" column informs you if a guild is open to recruiting new members, or is closed for accepting new members.</li>
            <li><strong>Guild's Last Activity:</strong> The "Last Move" column provides details about the guild's latest action, such as the time of the last update or decision made in the quest.</li>
          </ul>
        </div>
      </q-card-section>
      <q-card-actions class="flex justify-center">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<script setup lang="ts">
const showDialog = defineModel<boolean>();
</script>

<style scoped>
/* Custom Styling for Q-Dialog */
.q-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Styling for the card inside the dialog */
.q-card {
  width: 80%;
  max-width: 1600px; /* Ensures it doesn't get too wide on larger screens */
  padding: 20px;
  background: #ffffff; /* Clean white background */
  border-radius: 12px; /* Rounded corners for a softer look */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

/* Dialog title styling */
.dialog-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 15px;
}

/* Styling for the Q-Card actions (buttons area) */
.q-card-actions {
  border-top: 1px solid #e0e0e0; /* Adds a subtle separator */
  padding-top: 10px;
}

/* Centering the Close button */
.q-card-actions .q-btn {
  font-size: 1rem;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 8px;
}



.instruction-category {
  margin-bottom: 20px;
}

.instruction-category-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}
/* Styling for lists in the instructions */
.status-list {
  list-style-type: disc; /* Standard bullet points */
  padding-left: 20px; /* Indent list items for better readability */
  font-size: 1rem; /* Standard readable size */
  color: black; /* Ensures text is black */
  line-height: 1.6; /* Improves spacing between lines */
}

.status-list li {
  color: gray; /* Gray text color for list items */
  margin-bottom: 8px; /* Adds spacing between items */
}

.status-list strong {
  font-weight: bold; /* Highlights the key terms */
  color: #333; /* Slightly different shade for better contrast */
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
    max-width: none;
    padding: 15px;
  }
}
</style>
