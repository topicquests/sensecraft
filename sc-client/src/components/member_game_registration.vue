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
import { useReadStatusStore } from 'src/stores/readStatus';
import { useChannelStore } from 'src/stores/channel';

const MemberGameRegistrationProp = defineProps<{
  show?: boolean;
  questId: number | undefined;
  guildId: number | undefined;
}>();

const memberStore = useMemberStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();
const channelStore = useChannelStore()
const readStatusStore = useReadStatusStore();
const roleId = ref<number | undefined>(undefined);

const availableRoles = computed((): Role[] => {
  const memberId = memberStore.member?.id;
  return membersStore
    .getAvailableRolesForMemberAndGuild(
      memberId!,
      MemberGameRegistrationProp.guildId,
    )
    .map((cr: GuildMemberAvailableRole) => roleStore.getRoleById(cr.role_id));
});
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
    questStore.fetchQuestById(quest_id),
    channelStore.fetchChannels(guild_id),
    readStatusStore.ensureGuildUnreadChannels(guild_id),
    questStore.ensureCurrentQuest(quest_id!),
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

onBeforeUpdate(async () => {
  await ensureData();
});

onBeforeMount(async () => {
  await ensureData();
});
</script>
<style lang="css"></style>
