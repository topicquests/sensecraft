<template>
  <InstructionsLayout title="How to Use Guild Conversations">
    <div class="instruction-category-title">What this is</div>
    <p>
      Guild conversations (also called guild channels) are dedicated
      spaces where members of a guild can have ongoing discussions
      organized by topic.
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      You need to be a member of the guild. Creating a new channel
      generally requires guild admin or another channel-creation
      permission — if the create button is missing, ask your guild admin.
    </p>

    <div class="instruction-category-title">Open the guild's channel list</div>
    <ol>
      <li>Sign in and go to the dashboard.</li>
      <li>
        In the <strong>Guilds</strong> table, click the
        <strong>View</strong> link for your guild.
      </li>
      <li>
        On the guild page, open the right side drawer from the toolbar.
      </li>
      <li>Click the <strong>Guild Channels</strong> link.</li>
    </ol>

    <div class="instruction-category-title">Create a new channel</div>
    <ol>
      <li>
        On the guild channels page, click
        <strong>Create Guild Channel</strong>.
      </li>
      <li>Fill in the channel <strong>Title</strong>.</li>
      <li>
        Write the opening message or description in the rich text editor.
      </li>
      <li>Click <strong>Add</strong> to confirm creation.</li>
      <li>
        Look for a <em>"Channel created successfully"</em> confirmation.
      </li>
    </ol>

    <div class="instruction-category-title">Open a channel</div>
    <ol>
      <li>
        Find your new channel in the list and click its title link.
      </li>
      <li>
        You will be taken into the channel where you and other guild
        members can post messages.
      </li>
    </ol>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
