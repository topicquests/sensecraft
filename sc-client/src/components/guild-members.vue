<template>
  <q-card id="team-card" class="q-pa-md">
    <q-card-section>
      <div class="text-h6 text-center q-mb-md">Team</div>

      <q-list separator>
        <q-item
          v-for="member in membersStoreMembers"
          :key="member.id"
          class="q-py-sm flex items-center justify-between"
        >
          <q-item-section side class="text-subtitle1">
            {{ member.handle }}
          </q-item-section>

          <q-item-section class="q-gutter-sm" style="flex: 1">
            <template v-if="memberGuildId(member.id!)">
              <template v-if="memberGuildId(member.id!) === GuildMembersProps.guild?.id">
                <q-chip
                  v-for="role in memberRoles(member.id!)"
                  :key="role"
                  size="md"
                  outline color="primary"
                  text-color="black"
                  class="q-mr-sm"
                  dense
                >
                  {{ role }}
                </q-chip>
              </template>

              <template v-else>
                Playing in
                <router-link
                  :to="{ name: 'guild', params: { guild_id: memberGuildId(member.id!) } }"
                  class="text-primary text-weight-medium"
                >
                  {{ memberGuild(member.id!)?.name }}
                </router-link>
              </template>
            </template>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Guild, Quest, PublicMember } from '../types';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMembersStore } from '../stores/members';
import { useRoleStore } from '../stores/role';

// Props
const GuildMembersProps = defineProps<{
  guild?: Guild;
  quest?: Quest;
  members?: PublicMember[];
  playersOnly?: boolean;
}>();

// Stores
const questStore = useQuestStore();
const guildStore = useGuildStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();

// Computed
const membersStoreMembers = computed(() => {
  if (!GuildMembersProps.members) return [];
  return GuildMembersProps.members.map(m =>
    membersStore.getMemberById(m.id) || m
  );
});

// Functions
function memberGuildId(memberId: number): number | undefined {
  return questStore.castingInQuest(GuildMembersProps.quest?.id ?? null, memberId)?.guild_id;
}

function memberGuild(memberId: number) {
  const gid = memberGuildId(memberId);
  return gid ? guildStore.getGuildById(gid) : undefined;
}

// --- compute roles per member directly from store ---
function memberRoles(memberId: number): string[] {
  const questId = GuildMembersProps.quest?.id;
  if (!questId) return [];
  const castingRoles = membersStore.castingRolesPerQuest(memberId, questId);
  return castingRoles
    .map(cr => roleStore.getRoleById(cr.role_id)?.name)
    .filter((r): r is string => !!r);
}
</script>

<style scoped>
#team-card {
  width: 100%;
  border: 1px solid #ccc;
  background-color: #fffaf0;
  border-radius: 16px;
}

.q-list .q-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
