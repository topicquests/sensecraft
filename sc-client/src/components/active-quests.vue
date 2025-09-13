<template>
  <div class="row justify-start">
    <div v-if="activeQuests && activeQuests.length > 0">
      <div v-for="quest in activeQuests" :key="quest.id">
        <q-radio
          v-model="quest_id"
          color="black"
          :val="quest.id"
          :label="quest.name"
          class="q-ml-xl"
          id="radio"
        >
          <q-btn
            v-if="
              ActiveQuestsProps.isMember && !memberStore.guildPerQuest[quest.id]
            "
            rounded
            label="Play"
            @click="prompt = true"
            id="radio-btn"
            size="sm"
            class="bg-primary q-ma-sm"
          />
          <q-btn
            v-else-if="
              memberStore.guildPerQuest[quest.id] &&
              memberStore.guildPerQuest[quest.id] == guildStore.currentGuild &&
              quest.id
            "
            rounded
            class="bg-primary q-ma-sm"
            label="Go To Quest"
            id="radio-btn"
            size="sm"
            @click="
              router.push({
                name: 'quest_page',
                params: { quest_id: String(quest.id) },
              })
            "
          />
          <router-link
            v-if="
              memberStore.guildPerQuest[quest.id] &&
              memberStore.guildPerQuest[quest.id] != guildStore.currentGuild
            "
            :to="{
              name: 'guild',
              params: {
                guild_id: memberStore.guildPerQuest[quest.id],
              },
            }"
          >
            Playing in guild
          </router-link>
        </q-radio>
      </div>
    </div>

    <div v-else class="col-12">
      <h2 class="q-mt-md q-mb-md">You are not registered to any quests</h2>
    </div>
    <q-dialog
      v-model="prompt" persistent
      data-test="register-dialog">
      <member-game-registration
        :guildId="ActiveQuestsProps.guildId!"
        :questId="quest_id"
      />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { QuestData } from '../types';
import memberGameRegistration from '../components/member_game_registration.vue';
import { useRouter } from 'vue-router';
import { useQuestStore } from '../stores/quests';
import { useReadStatusStore } from '../stores/readStatus';

// Props
const ActiveQuestsProps = defineProps<{
  isMember: boolean;
  activeQuests: QuestData[];
  questId?: number;
  guildId?: number;
}>();

// Stores
const memberStore = useMemberStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const readStatusStore = useReadStatusStore();
const router = useRouter();

const prompt = ref(false);
const quest_id = ref(undefined);

watch(quest_id, async (newVal) => {
  questStore.setCurrentQuest(newVal);
  await readStatusStore.ensureAllChannelReadStatus();
});
</script>

<style scoped>
/* Add your styles here if needed */
</style>
