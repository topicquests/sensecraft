<template>
  <div>
    <span v-if="guildStore.isGuildMember(GuildsMembershipIndicatorProp.guild.id)"> Member </span>
    <span v-else-if="guild.open_for_applications"> Open </span>
    <span v-else> Close </span>
  </div>
</template>

<script setup lang="ts">
import { useGuildStore } from "src/stores/guilds";
import { GuildData } from "../types";

const GuildsMembershipIndicatorProp = defineProps<{
    guild: GuildData,
}>();

const guildStore = useGuildStore();
</script>
<style></style>
