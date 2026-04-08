<template>
  <InstructionsLayout title="How to Join a Guild">
    <div class="instruction-category-title">What this is</div>
    <p>
      Joining a guild adds you to a group of players and lets you take
      part in the quests that guild plays.
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      Any signed-in player can join an open guild. Some guilds may be
      closed to new members — in that case, ask the guild's admin for an
      invitation.
    </p>

    <div class="instruction-category-title">Step by step</div>
    <ol>
      <li>Sign in and wait for the dashboard to appear.</li>
      <li>Dismiss the dashboard help dialog if it is showing.</li>
      <li>
        Find the guild you want to join in the
        <strong>Guilds</strong> table on the dashboard. You can recognize
        a guild by the name in the first column.
      </li>
      <li>
        In the guild's row, click the <strong>View</strong> link in the
        Actions column.
      </li>
      <li>
        On the guild page, locate the <strong>Join</strong> button.
      </li>
      <li>Click <strong>Join</strong>.</li>
    </ol>

    <div class="instruction-category-title">What success looks like</div>
    <p>
      The Join button disappears and you remain on the guild page as a
      member. You can now see the guild's quests and conversations.
    </p>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
