<template>
  <div class="row justify-center q-mt-lg">
    <span v-if="!memberId">
      <router-link :to="{ name: 'signin' }">Login to play</router-link>
    </span>
    <span v-else-if="questMember">
      You can
      <router-link
        v-if="QuestActionProps.questId"
        :to="{
          name: 'quest_edit',
          params: { quest_id: QuestActionProps.questId },
        }"
      >
        administer
      </router-link>
      this quest.
    </span>
    <span v-else-if="guildId">
      You're playing in guild
      <router-link :to="{ name: 'guild', params: { guild_id: guildId } }">
        {{ guildStore.getCurrentGuild?.name }}
      </router-link>
    </span>
    <span v-else-if="currentQuest.status != 'registration'">
      The game has started
    </span>
    <span
      v-else-if="
        QuestActionProps.myPlayingGuilds &&
        QuestActionProps.myPlayingGuilds.length == 1
      "
    >
      Your guild
      <router-link
        v-if="QuestActionProps.questId"
        :to="{
          name: 'guild',
          params: { guild_id: QuestActionProps.myPlayingGuilds[0].id },
        }"
      >
        {{ QuestActionProps.myPlayingGuilds[0].name }}
      </router-link>
      is playing!
      <q-btn
        unelevated
        color="primary"
        label="Join the game"
        @click="registerMemberDialog = true"
        class="q-ml-md"
      />
    </span>
    <span
      v-else-if="
        QuestActionProps.myPlayingGuilds &&
        QuestActionProps.myPlayingGuilds.length > 1
      "
    >
      You are part of many guilds which are playing this quest. Pick one:
      <ul>
        <li v-for="guild in QuestActionProps.myPlayingGuilds" :key="guild.id">
          <router-link
            v-if="guild.id"
            :to="{ name: 'guild', params: { guild_id: guild.id } }"
          >
            {{ guild.name }}
          </router-link>
        </li>
      </ul>
    </span>
    <span v-else-if="myGuilds(true).length == 1">
      You are a leader in {{ myGuilds(true)[0].name }}. Maybe you want to
      <router-link
        v-if="myGuilds(true)[0].id"
        :to="{ name: 'guild', params: { guild_id: myGuilds(true)[0].id } }"
      >
        join
      </router-link>
      this quest?
    </span>
    <span v-else-if="myGuilds(true).length > 1">
      You are a leader in many guilds:
      <ul>
        <li v-for="guild in myGuilds(true)" :key="guild.id">
          <router-link
            v-if="guild.id"
            :to="{ name: 'guild', params: { guild_id: guild.id } }"
          >
            {{ guild.name }}
          </router-link>
        </li>
      </ul>
      Maybe you want one of them to join this quest?
    </span>
    <span v-else-if="myGuilds().length == 1">
      You are a member in {{ myGuilds()[0].name }}. You could tell the guild
      leader to join this quest!
    </span>
    <span v-else-if="myGuilds().length > 1">
      You are a member in many guilds:
      <ul>
        <li v-for="guild in myGuilds()" :key="guild.id">
          <router-link
            v-if="guild.id"
            :to="{ name: 'guild', params: { guild_id: guild.id } }"
          >
            {{ guild.name }}
          </router-link>
        </li>
      </ul>
      You could tell the guild leader in one of them to join this quest!
    </span>
    <span
      v-else-if="
        guildsPlayingGame(false, true) &&
        guildsPlayingGame(false, true).length > 1
      "
    >
      Here are guilds playing the game which you could join:
      <ul>
        <li v-for="guild in guildsPlayingGame(false, true)" :key="guild.id">
          <router-link
            :to="{ name: 'guild', params: { guild_id: guild.id } }"
            >{{ guild.name }}</router-link
          >
        </li>
      </ul>
      Maybe try to join
      <router-link :to="{ name: 'guild_list' }">a guild</router-link>
      which could be interested in this quest?
    </span>
    <span v-else>error</span>
    <q-dialog v-model="registerMemberDialog" persistent>
      <member-game-registration
        :guildId="mySelectedPlayingGuildId"
        :questId="QuestActionProps.questId"
      />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { useBaseStore } from '../stores/baseStore';
import { permission_enum } from '../enums';
import { GuildData } from '../types';
import memberGameRegistration from '../components/member_game_registration.vue';

const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore();

const QuestActionProps = defineProps<{
  myPlayingGuilds: GuildData[] | undefined;
  questId: number | undefined;
}>();

const registerMemberDialog = ref(false);
const mySelectedPlayingGuildId = ref(undefined); // TODO
const memberId = computed(() => memberStore.member?.id);
const currentQuest = computed(() => questStore.getCurrentQuest!);
const guildId = computed(() => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting = memberStore.castingPerQuest[quest_id!];
  return casting ? casting.guild_id : undefined;
});
const questMember = computed(() =>
  questStore.isQuestMember(QuestActionProps.questId),
);

const myGuilds = (onlyAsLeader = false) => {
  let memberships = memberStore.member?.guild_membership || [];
  memberships = memberships.filter((gm) => gm.status === 'confirmed');
  let guildIds = memberships.map((gm) => gm.guild_id);
  if (onlyAsLeader) {
    guildIds = guildIds.filter((gid) =>
      baseStore.hasPermission(permission_enum.joinQuest, gid),
    );
  }
  return guildIds.map((gid) => guildStore.getGuildById(gid));
};

const guildsPlayingGame = (onlyMine = false, recruiting = false) => {
  let guildIds =
    questStore.getCurrentQuest?.game_play?.map((gp) => gp.guild_id) || [];
  if (onlyMine) {
    guildIds = guildIds.filter((g) =>
      memberStore.member?.guild_membership?.some(
        (gm) => gm.guild_id === g && gm.status === 'confirmed',
      ),
    );
  }
  let guilds = guildIds.map((gid) => guildStore.getGuildById(gid));
  if (recruiting) {
    guilds = guilds.filter((g) => g.open_for_applications);
  }
  return guilds;
};
</script>
