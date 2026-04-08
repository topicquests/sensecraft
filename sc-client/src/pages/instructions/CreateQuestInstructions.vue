<template>
  <InstructionsLayout title="How to Create a Quest">
    <div class="instruction-category-title">What this is</div>
    <p>
      A quest is a structured conversation that one or more guilds can join
      and play. Creating a quest is the first step toward inviting players
      to participate in a new investigation.
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      You need the <strong>Create Quest</strong> permission. If you do not
      see "Create Quest" in the left drawer, ask a SenseCraft administrator
      to grant you that permission.
    </p>

    <div class="instruction-category-title">Step by step</div>
    <ol>
      <li>Sign in and wait for the dashboard to appear.</li>
      <li>
        Open the left side menu by clicking the menu button in the top
        toolbar.
      </li>
      <li>Click <strong>Create Quest</strong>.</li>
      <li>
        Fill in the <strong>Title</strong> field with the name of your
        quest.
      </li>
      <li>
        Write a <strong>Description</strong> in the rich text editor below
        the title.
      </li>
      <li>
        Set the quest <strong>Start</strong> date and time, and the
        <strong>End</strong> date and time.
      </li>
      <li>
        Choose how the quest unfolds — for an always-open quest, select
        <strong>Continuous</strong>.
      </li>
      <li>
        Fill in a <strong>Quest Handle</strong>. This is a short, unique
        identifier used in URLs.
      </li>
      <li>
        Click <strong>Create Quest</strong> to save the quest. You will be
        taken to the quest edit page.
      </li>
      <li>
        Click <strong>Update Quest</strong> on the edit page to confirm
        your settings.
      </li>
    </ol>

    <div class="instruction-category-title">What success looks like</div>
    <p>
      You will see a confirmation that says
      <em>"Quest was updated successfully"</em> and remain on the quest's
      edit page, where you can begin building its conversation nodes.
    </p>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
