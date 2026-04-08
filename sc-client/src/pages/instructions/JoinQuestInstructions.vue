<template>
  <InstructionsLayout title="How to Join a Quest">
    <div class="instruction-category-title">What this is</div>
    <p>
      Joining a quest connects you (through your guild) to an active
      investigation. You also choose the role you will play during the
      quest.
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      You need to be a member of a guild that is participating in (or
      registering for) the quest. Your guild's admin chooses which quests
      the guild joins.
    </p>

    <div class="instruction-category-title">Step by step</div>
    <ol>
      <li>Sign in and dismiss the dashboard help dialog.</li>
      <li>
        Open your guild's page by clicking <strong>View</strong> next to
        your guild in the dashboard's Guilds table.
      </li>
      <li>
        On the guild page, find the quest you want to join in the quest
        list.
      </li>
      <li>Select the quest by clicking its radio button.</li>
      <li>
        Click the <strong>Play</strong> button in the same row as the
        selected quest.
      </li>
      <li>
        A <strong>Register</strong> dialog will open showing the available
        roles.
      </li>
      <li>
        Select the role you want to play (for example,
        <em>Researcher</em>, <em>Philosopher</em>, <em>Critic</em>,
        <em>Scribe</em>, or <em>Game leader</em>) by clicking its radio
        button.
      </li>
    </ol>

    <div class="instruction-category-title">What success looks like</div>
    <p>
      The dialog confirms your role choice and you are registered to
      play the quest with your guild.
    </p>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
