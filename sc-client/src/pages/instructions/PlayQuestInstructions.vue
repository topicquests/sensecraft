<template>
  <InstructionsLayout title="How to Play a Quest">
    <div class="instruction-category-title">What this is</div>
    <p>
      Once you have joined a quest with your guild and chosen a role,
      playing the quest means exploring its conversation, reading what
      other players have written, and adding your own contributions to
      the discussion.
    </p>

    <div class="instruction-category-title">Before you start</div>
    <ul class="status-list">
      <li>
        You must be a member of a guild that is registered to play the
        quest.
      </li>
      <li>
        You must have selected a role for the quest (for example
        <em>Researcher</em>, <em>Philosopher</em>, <em>Critic</em>,
        <em>Scribe</em>, or <em>Game leader</em>).
      </li>
      <li>
        If you have not done either yet, see
        <em>How to Join a Quest</em> first.
      </li>
    </ul>

    <div class="instruction-category-title">Open the quest</div>
    <ol>
      <li>Sign in and dismiss the dashboard help dialog.</li>
      <li>
        Open your guild's page from the <strong>Guilds</strong> table on
        the dashboard.
      </li>
      <li>
        Find the quest you are playing in the guild's quest list and
        click <strong>Play</strong>.
      </li>
      <li>
        You will land on the quest play page, which shows the quest
        title, description, and the conversation tree.
      </li>
    </ol>

    <div class="instruction-category-title">Read the conversation</div>
    <ul class="status-list">
      <li>
        The main area shows the quest's
        <strong>conversation tree</strong> — every node players have
        contributed, organized as branches off the root question. Each
        node shows its title, type icon, status, and the handle of the
        member who created it.
      </li>
      <li>
        Click any node in the tree to select it. Its description appears
        inline, and on larger screens the selected node also opens in
        the side panel to the right.
      </li>
      <li>
        The <strong>root node</strong> (marked as Root) is the quest's
        starting question or framing. Read it first so you understand
        what the rest of the conversation is responding to.
      </li>
      <li>
        Use the <q-icon name="menu" /> menu button at the top of the
        tree to <strong>Search</strong> for a node by title, or to
        toggle visibility of <strong>Draft nodes</strong>,
        <strong>Meta nodes</strong>,
        <strong>Focus neighbourhood</strong>, and
        <strong>Obsolete nodes</strong>.
      </li>
    </ul>

    <div class="instruction-category-title">Switch views</div>
    <p>
      Click <strong>Card View</strong> at the top of the quest page to
      open the conversation as a column of cards instead of a tree. Card
      View can be easier for reading long stretches of conversation,
      while the tree view makes branching structure clearer.
    </p>

    <div class="instruction-category-title">Add your own contribution</div>
    <ol>
      <li>
        Find the node you want to respond to in the tree. Your
        contribution will be attached beneath it as a child.
      </li>
      <li>
        Click the <strong>+</strong> (add) button on that node's row.
        An inline node form opens directly under the parent.
      </li>
      <li>
        Fill in <strong>Node Title</strong> with a short summary of
        your point.
      </li>
      <li>
        Write your text in the <strong>Description</strong> rich text
        editor (bold / italic / underline / strike formatting are
        available).
      </li>
      <li>
        Open the <strong>Type</strong> selector and choose the IBIS type
        that fits your contribution (for example a question, an answer,
        an argument pro/con, or a reference). The type determines the
        icon shown in the tree.
      </li>
      <li>
        Open the <strong>Status</strong> selector. Use a draft status
        while you are still working, and switch to
        <em>published</em> when you are ready for other players to see
        it.
      </li>
      <li>
        If you want your post to be a side comment rather than part of
        the main conversation, tick <strong>Comment Node</strong>. Note
        that comment nodes cannot be set to <em>published</em>.
      </li>
      <li>Click <strong>Add</strong> to post the new node.</li>
    </ol>

    <div class="instruction-category-title">Edit a node you created</div>
    <ol>
      <li>
        Locate your node in the tree. If you have edit rights, an edit
        button is shown next to the title.
      </li>
      <li>Click the edit button to open the node form inline.</li>
      <li>
        Change the title, description, type, or status as needed.
      </li>
      <li>Click <strong>Update</strong> to save, or <strong>Cancel</strong> to discard your changes.</li>
    </ol>

    <div class="instruction-category-title">Talk with the rest of your team</div>
    <p>
      Playing a quest is more than posting nodes. Use the channels to
      coordinate with the other players:
    </p>
    <ul class="status-list">
      <li>
        Your <strong>role channel</strong> is where you talk with the
        other players who chose the same role as you.
      </li>
      <li>
        The <strong>quest channel</strong> is where the whole guild
        discusses the quest as a whole.
      </li>
      <li>
        Game Leaders can see every role channel and use them to
        coordinate across roles.
      </li>
    </ul>
    <p>
      For more about which channel to use, see
      <em>How Channels Work</em>.
    </p>

    <div class="instruction-category-title">Tips</div>
    <ul class="status-list">
      <li>
        Read the surrounding nodes before you reply — quests build on
        each other, and your contribution will be most valuable if it
        responds to what is already there.
      </li>
      <li>
        Keep node titles short and specific. The title is what other
        players see in the tree.
      </li>
      <li>
        You can come back to a quest as often as you like while it is
        active. Your role and your contributions stay with you.
      </li>
    </ul>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
