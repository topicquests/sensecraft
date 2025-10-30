<template>
  <q-card style="min-width: 350px">
    <template v-if="availableRoles.length">
      <q-card-section>
        <div class="text-h6">Available Roles</div>
      </q-card-section>

      <div v-for="role in availableRoles" :key="role.id">
        <q-radio
          v-model="roleId"
          :label="role.name"
          :val="role.id"
          @update:model-value="updateRole"
          v-close-popup
        />
      </div>
    </template>

    <template v-else>
      <q-card-section>
        <div class="text-h6">Please ask your guild leader to give you roles</div>
        <div class="text-subtitle2 q-mt-sm">
          No roles available for this guild.
        </div>
      </q-card-section>
    </template>

    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Cancel" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Role, GuildMemberAvailableRole } from '../types';
import { useMemberStore } from '../stores/member';
import { useMembersStore } from '../stores/members';
import { useRoleStore } from '../stores/role';
import { useQuestStore } from '../stores/quests';
import { useReadStatusStore } from '../stores/readStatus';
import { useChannelStore } from '../stores/channel';
import { useGuildStore } from '../stores/guilds';

// Props
const props = defineProps<{
  show?: boolean;
  questId?: number;
  guildId?: number;
}>();

// Stores
const memberStore = useMemberStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();
const channelStore = useChannelStore();
const readStatusStore = useReadStatusStore();
const guildStore = useGuildStore();

// Reactive state
const roleId = ref<number>();

// Computed roles for the current member in this guild
const availableRoles = computed<Role[]>(() => {
  const memberId = memberStore.member?.id;
  if (!memberId || !props.guildId) return [];
  return membersStore
    .getAvailableRolesForMemberAndGuild(memberId, props.guildId)
    .map((r: GuildMemberAvailableRole) => roleStore.getRoleById(r.role_id))
    .filter((r): r is Role => !!r);
});

// Lifecycle
onMounted(async () => {
  await ensureData();
});

// Functions
async function ensureData() {
  if (!props.guildId) return;
  await Promise.all([
    roleStore.ensureAllRoles(),
    membersStore.ensureMembersOfGuild({ guildId: props.guildId }),
  ]);
}

async function doAddCasting(questId: number) {
  if (!props.guildId || !memberStore.member) return;
  await questStore.addCasting({
    quest_id: questId,
    guild_id: props.guildId,
    member_id: memberStore.member.id,
  });
}

async function updateRole() {
  const { questId, guildId } = props;
  if (!questId || !guildId || !roleId.value || !memberStore.member) return;

  const memberId = memberStore.member.id;

  await doAddCasting(questId);
  await questStore.addCastingRole({
    quest_id: questId,
    guild_id: guildId,
    member_id: memberId,
    role_id: roleId.value,
  });

  await Promise.all([
    guildStore.ensureCurrentGuild(guildId, false),
    guildStore.setCurrentGuild(guildId),
    questStore.ensureQuest({ quest_id: questId, full: false }),
    membersStore.ensureMembersOfGuild({ guildId }),
    channelStore.fetchChannels(guildId),
    readStatusStore.ensureGuildUnreadChannels(),
  ]);
}
</script>

<style scoped>
.q-card {
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  transition: box-shadow 0.2s ease;
}
.q-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.text-h6 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  letter-spacing: 0.3px;
}

.q-radio {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  margin: 0.25rem 0;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}
.q-radio:hover {
  background-color: #f7f7f7;
}

.q-radio__label {
  font-weight: 500;
  color: #444;
  font-size: 0.95rem;
}

.q-card-actions {
  padding-top: 0.5rem;
  border-top: 1px solid #e5e5e5;
}
.q-card-actions .q-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  padding: 0.35rem 1rem;
  transition: background-color 0.15s ease;
}
.q-card-actions .q-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
