<template>
  <q-card style="min-width: 350px">
    <div v-if="availableRoles.length">
      <q-card-section>
        <div class="text-h6">Available Roles</div>
      </q-card-section>
      <div v-for="role in availableRoles" :key="role.id!">
        <q-radio
          v-model="roleId"
          :label="role.name"
          :val="role.id"
          @update:model-value="updateRole()"
          v-close-popup="true"
        >
        </q-radio>
      </div>
    </div>
    <div v-else>
      <div class="text-h6">Please ask your guild leader give you roles</div>
      {{ availableRoles }}
    </div>
    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Cancel" v-close-popup="true"></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { Role, GuildMemberAvailableRole } from '../types';
import { computed, onBeforeMount, onBeforeUpdate, ref } from 'vue';
import { useMemberStore } from '../stores/member';
import { useMembersStore } from '../stores/members';
import { useRoleStore } from '../stores/role';
import { useQuestStore } from '../stores/quests';
import { useReadStatusStore } from '../stores/readStatus';
import { useChannelStore } from '../stores/channel';
import { useGuildStore } from '../stores/guilds';

// Props
const MemberGameRegistrationProp = defineProps<{
  show?: boolean;
  questId: number | undefined;
  guildId: number | undefined;
}>();

// Stores
const memberStore = useMemberStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();
const channelStore = useChannelStore()
const readStatusStore = useReadStatusStore();
const guildStore = useGuildStore();

// Reactive variables
const roleId = ref<number | undefined>(undefined);

// Computed
const availableRoles = computed((): Role[] => {
  const memberId = memberStore.member?.id;
  return membersStore
    .getAvailableRolesForMemberAndGuild(
      memberId!,
      MemberGameRegistrationProp.guildId,
    )
    .map((cr: GuildMemberAvailableRole) => roleStore.getRoleById(cr.role_id));
});

// Hook
onBeforeUpdate(async () => {
  await ensureData();
});

onBeforeMount(async () => {
  await ensureData();
});

// Functions
async function doAddCasting(quest_id: number) {
  const guild_id = MemberGameRegistrationProp.guildId;
  const member_id = memberStore.member!.id;
  await questStore.addCasting({
    quest_id,
    guild_id: guild_id,
    member_id: member_id,
  });
}

async function updateRole() {
  const guild_id = MemberGameRegistrationProp.guildId;
  const role_id: number | undefined = roleId.value;
  const member_id = memberStore.member!.id;
  const quest_id = MemberGameRegistrationProp.questId;
  await doAddCasting(quest_id!);
  await questStore.addCastingRole({
    quest_id,
    guild_id,
    member_id,
    role_id,
  });
  await Promise.all([
    guildStore.ensureCurrentGuild(guild_id!, false),
    guildStore.setCurrentGuild(MemberGameRegistrationProp.guildId!),
    questStore.ensureQuest({quest_id: quest_id!, full: false}),
    membersStore.ensureMembersOfGuild({ guildId: guild_id! }),
    channelStore.fetchChannels(guild_id!),
    readStatusStore.ensureGuildUnreadChannels(),
  ]);
}

async function ensureData() {
  await Promise.all([
    roleStore.ensureAllRoles(),
    membersStore.ensureMembersOfGuild({
      guildId: MemberGameRegistrationProp.guildId!,
    }),
  ]);
}

</script>
<style lang="css">
.q-card {
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  padding-bottom: 0.5rem;
  background-color: #ffffff;
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

.q-card > div > .text-h6 + * {
  color: #777;
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
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
