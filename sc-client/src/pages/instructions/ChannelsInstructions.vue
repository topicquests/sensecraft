<template>
  <InstructionsLayout title="How Channels Work">
    <div class="instruction-category-title">What this is</div>
    <p>
      Channels are conversation spaces inside SenseCraft. There are three
      different kinds of channels, each with its own purpose. This guide
      explains when each kind appears and how to use it.
    </p>

    <div class="instruction-category-title">Guild channels</div>
    <p>
      Guild channels are for discussion about the guild itself, not about
      any particular quest. Use them to coordinate with your fellow guild
      members.
    </p>
    <ul class="status-list">
      <li>
        <strong>Example:</strong> a channel called
        <em>"Next Quest: Ocean Acidification"</em> would let the guild
        announce that it plans to register for that quest, and let members
        weigh in on whether they want to play.
      </li>
      <li>
        Anything off-topic from a specific quest — guild news, recruiting,
        scheduling, planning — belongs in a guild channel.
      </li>
    </ul>
    <div class="instruction-category-title">Quest channels</div>
    <p>
      A quest channel is tied to a specific quest your guild is playing.
      It is where guild members discuss the quest as a whole, including
      the framing or root question of the conversation (for example, the
      Causes / Effects / Solutions sections of a quest's first node).
    </p>

    <div class="instruction-category-title">Role channels</div>
    <p>
      Role channels are created automatically. When a player joins a
      quest and picks a role (for example
      <em>Philosopher</em>), SenseCraft checks whether a channel for that
      role already exists in the guild's quest. If it does not, it is
      created on the spot.
    </p>
    <ul class="status-list">
      <li>
        <strong>What you see:</strong> as a regular player, you only see
        the role channel for the role you chose. A philosopher sees the
        Philosopher channel; a researcher sees the Researcher channel.
        Players never see other roles' channels.
      </li>
      <li>
        <strong>Game Leader exception:</strong> a Game Leader sees
        <em>every</em> role channel that has been created in the quest.
        If a Game Leader and a philosopher are the only two players, the
        Game Leader sees the Game Leader channel and the Philosopher
        channel. When a researcher then joins, the Game Leader's view
        grows to three channels — Game Leader, Philosopher, and
        Researcher.
      </li>
      <li>
        Role channels appear and grow naturally as players join the
        quest. You do not create them by hand.
      </li>
    </ul>

    <div class="instruction-category-title">Quick reference</div>
    <ul class="status-list">
      <li>
        <strong>Talking about your guild?</strong> Use a guild channel.
      </li>
      <li>
        <strong>Talking about a quest you are playing?</strong> Use that
        quest's channel.
      </li>
      <li>
        <strong>Talking with players who share your role?</strong> Use
        your role channel.
      </li>
      <li>
        <strong>Game Leader coordinating across roles?</strong> Use the
        relevant role channel — you can see all of them.
      </li>
    </ul>

    <div class="instruction-category-title">How to open a guild channel</div>
    <ol>
      <li>
        From the dashboard, click <strong>View</strong> next to your guild
        in the Guilds table.
      </li>
      <li>Open the right side drawer from the guild page toolbar.</li>
      <li>Click <strong>Guild Channels</strong>.</li>
      <li>Click the channel title you want to open.</li>
    </ol>

    <div class="instruction-category-title">How to find a quest or role channel</div>
    <ol>
      <li>Open your guild's page and select the quest you are playing.</li>
      <li>
        Open the channel list for that quest. You will see the quest
        channel plus any role channels you have access to.
      </li>
      <li>Click the channel you want to open.</li>
    </ol>
  </InstructionsLayout>
</template>

<script setup lang="ts">
import InstructionsLayout from '../../components/instructions-layout.vue';
</script>
