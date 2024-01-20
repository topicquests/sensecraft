<template>
  <div>
    <span v-if="GuildsPlayingIndicatorProp.playing">
      Playing ({{ questStore.getGamePlayForGuild(GuildsPlayingIndicatorProp.guild.id).game_status }})
    </span>
    <span
      v-else-if="
        open_play_status.indexOf(
          questStore.getGamePlayForGuild(GuildsPlayingIndicatorProp.guild.id).game_status
        ) >= 0
      "
    >
      <span v-if="GuildsPlayingIndicatorProp.guild.is_member"> Play in this Quest! </span>
      <span v-else-if="!quest.is_playing && GuildsPlayingIndicatorProp.guild.open_for_applications">
        Join this Guild!
        <span
          v-if="
            questStore.getGamePlayForGuild(GuildsPlayingIndicatorProp.guild.id).game_status ==
            game_play_status_enum.confirmed
          "
        >
          (They are playing)
        </span>
        <span v-else> (They may play) </span>
      </span>
      <span
        v-else-if="
          questStore.getGamePlayForGuild(GuildsPlayingIndicatorProp.guild.id).game_status ==
          game_play_status_enum.confirmed
        "
      >
        Opponent
      </span>
      <span
        v-else-if="
          questStore.getGamePlayForGuild(GuildsPlayingIndicatorProp.guild.id).game_status ==
          game_play_status_enum.interested
        "
      >
        Potential Opponent
      </span>
    </span>
    <span v-else> Opponent </span>
  </div>
</template>
<!-- TODO filter out cancelled game play in quest page -->
<script setup lang="ts">
import { useQuestStore } from "src/stores/quests";
import { GuildData, QuestData } from "../types";
import { game_play_status_enum, game_play_status_type } from "../enums";

const GuildsPlayingIndicatorProp = defineProps<{
    guild: GuildData;
    quest: QuestData;
    playing: boolean;
}>();

const questStore = useQuestStore();

const open_play_status: game_play_status_type[] = [
    game_play_status_enum.interested,
    game_play_status_enum.confirmed,
  ];
</script>
<style></style>
