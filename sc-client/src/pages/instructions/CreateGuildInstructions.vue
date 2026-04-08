<template>
  <InstructionsLayout title="How to Create a Guild">
    <div class="instruction-category-title">What this is</div>
    <p>
      A guild is a group of players that join quests together. Creating a
      guild gives you a home base where members can talk and decide which
      quests to play.
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      You need the <strong>Create Guild</strong> permission. If you do not
      see "Create Guild" in the left drawer, ask a SenseCraft administrator
      to grant it.
    </p>

    <div class="instruction-category-title">Step by step</div>
    <ol>
      <li>Sign in and dismiss the dashboard help dialog.</li>
      <li>Open the left side menu from the toolbar.</li>
      <li>Click <strong>Create Guild</strong>.</li>
      <li>
        Choose a visibility option. Click <strong>Public</strong> to let
        anyone find and join the guild.
      </li>
      <li>
        Fill in the <strong>Guild Title</strong> with the name of your
        guild.
      </li>
      <li>
        Write a <strong>Description</strong> in the guild description rich
        text editor.
      </li>
      <li>
        Open the <strong>Default Role</strong> selector and pick the role
        new members will receive (for example, <em>Researcher</em>).
      </li>
      <li>
        Fill in the <strong>Guild Handle</strong>. This is a short, unique
        identifier used in URLs.
      </li>
      <li>Click <strong>Add Guild</strong>.</li>
    </ol>

    <div class="instruction-category-title">What success looks like</div>
    <p>
      You will see a <em>"Guild created successfully!"</em> confirmation
      and land on the guild's admin page where you can manage members and
      roles.
    </p>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
