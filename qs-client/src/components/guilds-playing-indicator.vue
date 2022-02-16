<template>
  <div>
    <span v-if="playing">
      Playing ({{getGamePlayForGuild(guild.id).game_status}})
    </span>
    <span v-else-if="open_play_status.indexOf(this.getGamePlayForGuild(guild.id).game_status)>=0">
      <span v-if="isGuildMember(guild.id)">
        Play in this Quest!
      </span>
      <span v-else-if="guild.open_for_applications">
        Join this Guild!
        <span v-if="getGamePlayForGuild(guild.id).game_status == game_play_status_enum.confirmed">
          (They are playing)
        </span>
        <span v-else>
          (They may play)
        </span>
      </span>
      <span v-else-if="getGamePlayForGuild(guild.id).game_status == game_play_status_enum.confirmed">
        Opponent
      </span>
      <span v-else-if="getGamePlayForGuild(guild.id).game_status == game_play_status_enum.interested">
        Potential Opponent
      </span>
    </span>
    <span v-else>
      Opponent
    </span>
  </div>
</template>
<!-- TODO filter out cancelled game play in quest page -->
<script lang="ts">
import { GuildsGetterTypes } from "src/store/guilds";
import { QuestsGetterTypes } from "src/store/quests";
import Vue from "vue";
import { Prop } from "vue/types/options";
import Component from "vue-class-component";
import { mapGetters } from "vuex";
import { Guild, Quest } from "../types";
import { game_play_status_enum, game_play_status_type } from "../enums";



const GuildsPlayingIndicatorProp = Vue.extend({
  props: {
    guild: Object as Prop<Guild>,
    quest: Object as Prop<Quest>,
    playing: Boolean as Prop<boolean>,
  },
});

@Component<GuildsPlayingIndicator>({
  name: "GuildsPlayingIndicator",
  computed: {
    ...mapGetters("guilds", ["isGuildMember"]),
    ...mapGetters("quests", ["getGamePlayForGuild"]),
  },
})
export default class GuildsPlayingIndicator extends GuildsPlayingIndicatorProp {
  isGuildMember!: GuildsGetterTypes["isGuildMember"];
  getGamePlayForGuild!: QuestsGetterTypes["getGamePlayForGuild"];
  open_play_status: game_play_status_type[] = [
    game_play_status_enum.interested,
    game_play_status_enum.confirmed,
  ];
  game_play_status_enum = game_play_status_enum;
}
</script>
<style>
.guilds-table {
  text-align: center;
  font-size: 1em;
  background-color: ivory;
}
</style>
