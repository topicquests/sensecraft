<template>
  <InstructionsLayout title="How to Edit a Quest">
    <div class="instruction-category-title">What this is</div>
    <p>
      Editing a quest lets you open it for registration and add or update
      the conversation nodes that players will interact with.
    </p>

    <div class="instruction-category-title">Permissions</div>
    <p>
      You must be the quest's creator (or otherwise have edit rights on
      the quest). If you cannot reach the edit page, ask a SenseCraft
      administrator for the required permission.
    </p>

    <div class="instruction-category-title">Open the quest in edit mode</div>
    <ol>
      <li>Sign in and dismiss the dashboard help dialog.</li>
      <li>
        Navigate to your quest's edit page (for example by going to
        <code>/quest/&lt;quest id&gt;/edit</code>).
      </li>
    </ol>

    <div class="instruction-category-title">
      Important: create the first node before opening registration
    </div>
    <p>
      <strong>
        Always create the quest's root (first) node before you open the
        quest for registration.
      </strong>
      The root node is the framing question that every other
      contribution branches off of — it is what players see the moment
      they open the quest, and it sets the direction for the entire
      conversation.
    </p>
    <ul class="status-list">
      <li>
        <strong>Players need something to respond to.</strong> If a guild
        registers and starts joining a quest that has no root node,
        there is nothing for players to read or reply to, and the quest
        feels broken on arrival.
      </li>
      <li>
        <strong>Roles and channels start forming immediately.</strong>
        As soon as registration is open, players pick roles and role
        channels begin to be created. Those players will expect a real
        question waiting for them — not an empty tree.
      </li>
      <li>
        <strong>The framing is hard to change later.</strong> Once
        people have replied beneath the root node, rewording it can
        invalidate the conversation that grew out of it. Get the root
        node right first, then open registration.
      </li>
      <li>
        <strong>Recommended order:</strong> create the quest → write
        and publish the root node → review the wording → only then
        click <strong>Registration</strong> and
        <strong>Update Quest</strong>.
      </li>
    </ul>

    <div class="instruction-category-title">Open the quest for registration</div>
    <ol>
      <li>Click the <strong>Registration</strong> button.</li>
      <li>Click <strong>Update Quest</strong>.</li>
      <li>
        Look for the <em>"Quest was updated successfully"</em>
        confirmation.
      </li>
    </ol>

    <div class="instruction-category-title">Add a conversation node</div>
    <ol>
      <li>
        Fill in the <strong>Node Title</strong> field with a short title
        for the question or topic.
      </li>
      <li>
        Add a <strong>Description</strong> in the node description rich
        text editor.
      </li>
      <li>
        Open the <strong>Node Type</strong> selector and choose the type
        you want (for example, <em>question</em>).
      </li>
      <li>
        Open the <strong>Status</strong> selector and choose
        <em>published</em> when you are ready for players to see the node.
      </li>
      <li>Click <strong>Add Node</strong> to save it.</li>
      <li>
        You should see an <em>"Added node to conversation"</em>
        confirmation.
      </li>
    </ol>

    <div class="instruction-category-title">Update the existing root node</div>
    <ol>
      <li>Edit the <strong>Node Title</strong> with your new wording.</li>
      <li>Click <strong>Update Node</strong>.</li>
      <li>
        Look for the <em>"Root node updated"</em> confirmation.
      </li>
    </ol>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
