<template>
  <q-page class="quest-team-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="quest-team">
        <div>
          <member></member>
        </div>
        <div class="row justify-center">
          <div class="column quest-card-col">
            <div class="col-12 q-mb-md">
              <questCard :currentQuest="currentQuest"> </questCard>
            </div>
          </div>
        </div>

        <div class="column items-center">
          <div
            class="q-ma-sm guilds-table-col"
            v-if="guildsPlayingCurrentQuest!.length"
          >
            <guilds-table
              :guilds="guildsPlayingCurrentQuest"
              :scores="conversationStore.getGuildScoreMap"
              :showPlayers="true"
              :selectable="true"
              :quest="currentQuest"
            >
              <template v-slot:default="slotProps">
                <router-link
                  :to="{
                    name: 'guild',
                    params: { guild_id: slotProps.guild.id },
                  }"
                >
                  View
                </router-link>
                <span v-if="currentQuest!.is_playing">
                  <!-- already playing -->
                </span>
                <span v-else-if="currentQuest!.status != 'registration'">
                  <!-- not in registration phase -->
                </span>
                <span v-else-if="slotProps.guild.is_member">
                  &nbsp;Join Game
                  <!-- TODO: join game -->
                </span>
                <span
                  v-else-if="
                    currentQuest!.my_confirmed_guild_count +
                      currentQuest!.my_recruiting_guild_count >
                    0
                  "
                >
                  <!-- one of my guilds is recruiting or confirmed, nothing to do here -->
                </span>
                <span v-else-if="slotProps.guild.open_for_applications">
                  &nbsp;Join Guild<!-- TODO: Join guild -->
                </span>
                <span v-else></span>
              </template>
            </guilds-table>
          </div>
          <div v-else>
            <h3>There are no guilds playing quest</h3>
          </div>
        </div>

        <div class="row justify-center" v-if="guildStore.getCurrentGuild">
          <div class="column guild-member-col">
            <guild-members
              :guild="guildStore.getCurrentGuild"
              :quest="questStore.getCurrentQuest"
              v-bind:members="questStore.getPlayersOfCurrentQuestGuild"
              v-bind:playersOnly="true"
              class="q-mt-md q-mb-md"
            />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import questCard from '../components/quest-card.vue';
import member from '../components/member-handle.vue';
import GuildsTable from '../components/guilds-table.vue';
import GuildMembers from '../components/guild-members.vue';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { useConversationStore } from '../stores/conversation';
import { useMembersStore } from '../stores/members';
import { useMemberStore } from '../stores/member';
import { useRoleStore } from '../stores/role';
import { useRoute } from 'vue-router';
import { QuestData } from '../types';

const guildStore = useGuildStore();
const questStore = useQuestStore();
const conversationStore = useConversationStore();
const roleStore = useRoleStore();
const membersStore = useMembersStore();
const ready = ref(false);
let questId: number;
const route = useRoute();
const currentQuest = computed<QuestData>({
  get: () => questStore.getCurrentQuest!,
  set: () => {},
});
const guildsPlayingCurrentQuest = computed({
  get: () => guildStore.getGuildsPlayingCurrentQuest,
  set: () => {},
});

async function initialize() {
  if (typeof route.params.quest_id === 'string') {
    questId = Number.parseInt(route.params.quest_id);
  }
  await Promise.all([
    membersStore.ensurePlayersOfQuest(questId),
    roleStore.ensureAllRoles(),
    questStore.ensureCurrentQuest(questId),
    conversationStore.ensureConversation(questId),
  ]);
  await guildStore.ensureGuildsPlayingQuest({ quest_id: questId });
  const meId = useMemberStore().getUserId;
  const myCasting = questStore
    .getQuestById(questId)
    ?.casting?.find((c) => c.member_id === meId);
  const fallback = guildsPlayingCurrentQuest.value?.[0]?.id;
  const targetGuild = myCasting?.guild_id ?? fallback;
  if (targetGuild) {
    guildStore.setCurrentGuild(targetGuild);
  }
}
onBeforeMount(async () => {
  await initialize();
  ready.value = true;
});
</script>
<style>
.quest-team-page {
  background: var(--sc-color-bg-muted);
  min-height: 100vh;
}

.guild-member-col {
  width: 70%;
}
.guilds-table-col {
  width: 70%;
}

.quest-team {
  width: 70%;
}
.quest-card-col {
  width: 70%;
}

@media only screen and (max-width: 1300px) {
  .quest-team {
    width: 70%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-team {
    width: 95%;
  }
}
@media only screen and (max-width: 1000px) {
  .quest-card-col {
    width: 95%;
  }
}
@media only screen and (max-width: 800px) {
  .guild-member-col {
    width: 95%;
  }
}
@media only screen and (max-width: 800px) {
  .guilds-table-col {
    width: 96%;
  }
}
</style>
