<template>
  <div>
    <div class="col-12" v-if="currentGuild">
      <h1 class="text-center">
        {{ currentGuild.name }}
        <q-btn
          v-if="member && !isMember && currentGuild.open_for_applications"
          label="Join Guild"
          @click="joinToGuild()"
          style="margin-right: 1em"
          class="bg-blue"
        />
      </h1>
      <span v-if="!currentGuild.open_for_applications">guild closed</span>
      <span v-if="!member && currentGuild.open_for_applications"
        >login or register to join</span
      >
    </div>
    <div class="row justify-center">
      <div class="column guild-description-col">
        <q-card class="q-mb-md">
          <div>
            <div
              class="guild-description"
              v-html="currentGuild?.description"
            ></div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { useChannelStore } from '../stores/channel';
import { useReadStatusStore } from '../stores/readStatus';

const guildStore = useGuildStore();
const memberStore = useMemberStore();
const channelStore = useChannelStore();
const readStatusStore = useReadStatusStore();

const currentGuild = computed(() => guildStore.getCurrentGuild);
const member = computed(() => memberStore.member);
const isMember = computed<boolean>({
  get: () => {
    return !!guildStore.isGuildMember(currentGuild.value?.id ?? 0);

  },
  set: (value) => {
    return value;
  },
});
async function joinToGuild () {
  const currentGuildId = currentGuild.value?.id;
  if (!currentGuild.value || typeof currentGuild.value.id !== 'number') return;
  await guildStore.addGuildMembership({
    guild_id: currentGuild.value.id,
    member_id: member.value?.id,
  });
  await guildStore.ensureAllGuilds();
  guildStore.setCurrentGuild(currentGuildId!)
  channelStore.setCurrentGuild(currentGuildId!);
  await channelStore.ensureChannels(currentGuildId!);
  await readStatusStore.ensureGuildUnreadChannels();
};

</script>
<style scoped>
.guild-description {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}
</style>
