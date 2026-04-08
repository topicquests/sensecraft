<template>
  <InstructionsLayout title="How an Admin Sets Roles">
    <div class="instruction-category-title">What this is</div>
    <p>
      Guild admins can change which roles each member of their guild
      holds, and can register the guild for a quest. Roles control how a
      member participates in quests (for example, <em>Game leader</em>,
      <em>Researcher</em>, <em>Philosopher</em>, <em>Critic</em>, or
      <em>Scribe</em>).
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      You must be an admin of the guild. If you do not see the guild's
      admin page, ask the guild creator to grant you admin rights.
    </p>

    <div class="instruction-category-title">Open the guild admin page</div>
    <ol>
      <li>Sign in and dismiss the dashboard help dialog.</li>
      <li>
        In the dashboard's <strong>Guilds</strong> table, click the
        <strong>Admin</strong> link for your guild.
      </li>
    </ol>

    <div class="instruction-category-title">Register the guild for a quest</div>
    <ol>
      <li>Click the <strong>Register</strong> button.</li>
      <li>
        Wait for a notification confirming that the guild was registered.
      </li>
    </ol>

    <div class="instruction-category-title">Add or change a member's role</div>
    <ol>
      <li>
        Find the member you want to update in the guild members list.
      </li>
      <li>
        Open that member's role controls and add the desired role (for
        example, <em>Game leader</em>, <em>Philosopher</em>,
        <em>Critic</em>, or <em>Scribe</em>).
      </li>
      <li>
        If you want to remove the default <em>Researcher</em> role,
        deselect it for the member.
      </li>
      <li>
        Confirm the change and verify the new role appears next to the
        member's name.
      </li>
    </ol>

    <div class="instruction-category-title">Tip</div>
    <p>
      A member can hold more than one role at a time. For example, you
      can keep a player as a <em>Researcher</em> while also adding
      <em>Philosopher</em>.
    </p>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
