<template>
  <div>
    <q-dialog
    v-model="showDialog" >
    <!-- Dashboard Instruction Page -->
    <q-card class="q-mb-xl">
      <q-card-section>
        <div class="dialog-title">How to Use the Dashboard</div>

        <!-- Quest Table Instructions -->
        <div class="instruction-category">
          <div class="instruction-category-title">Quest Table Instructions</div>
          <p>The Quest Table displays information related to ongoing quests and their progress. Here's how you can interact with it:</p>
          <ul>
            <li><strong>Quest Details:</strong> The "Description" button (an icon with an information symbol) opens a dialog with additional information about the quest.</li>
            <li><strong>Status Indicator:</strong> The "Status" column shows whether a quest is active, completed, or paused. You can track the progress of each quest here.</li>
            <li><strong>Manage Guild Participation:</strong> You can see which guilds are participating in a particular quest. The "Ongoing Quests" column helps you know how many quests a guild is involved in.</li>
            <li><strong>Filter and Sort:</strong> You can filter quests by status or sort them by other attributes such as name, participants, or progress.</li>
            <li><strong>Track Last Activity:</strong> The "Last Move" column provides information about the last action taken on a quest, giving you context about the most recent updates.</li>
          </ul>
        </div>

        <!-- Guild Table Instructions -->
        <div class="instruction-category">
          <div class="instruction-category-title">Guild Table Instructions</div>
          <p>The Guild Table provides an overview of the guilds and their activities. Here's how to use it:</p>
          <ul>
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
.instruction-category {
  margin-bottom: 20px;
}

.instruction-category-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.q-card {
  margin-top: 20px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}
</style>
