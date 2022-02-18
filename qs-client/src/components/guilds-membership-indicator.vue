<template>
  <div>
    <span v-if="isGuildMember(guild.id)">
      Member
    </span>
    <span v-else-if="guild.open_for_applications">
      Open
    </span>
    <span v-else>
      Close
    </span>
  </div>
</template>

<script lang="ts">
import { GuildsGetterTypes } from "src/store/guilds";
import Vue from "vue";
import { Prop } from "vue/types/options";
import Component from "vue-class-component";
import { mapGetters } from "vuex";
import { Guild } from "../types";

const GuildsMembershipIndicatorProp = Vue.extend({
  props: {
    guild: Object as Prop<Guild>,
  },
});

@Component<GuildsMembershipIndicator>({
  name: "GuildsMembershipIndicator",
  computed: {
    ...mapGetters("guilds", ["isGuildMember"]),
  },
})
export default class GuildsMembershipIndicator extends GuildsMembershipIndicatorProp {
  isGuildMember!: GuildsGetterTypes["isGuildMember"];
}
</script>
<style>
</style>
