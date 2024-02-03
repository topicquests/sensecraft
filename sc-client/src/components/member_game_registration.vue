<template>
  <q-card style="min-width: 350px" v-if="ready">
    <div v-if="availableRoles.length">
      <q-card-section>
        <div class="text-h6">Available Roles</div>
      </q-card-section>
      <div v-for="role in availableRoles()" :key="role.id">
        <q-radio
          v-model="roleId"
          :label="role.name"
          :val="role.id"
          @input="updateRole()"
          v-close-popup="true"
        >
        </q-radio>
      </div>
    </div>
    <div v-else>
      <div class="text-h6">Please ask your guild leader give you roles</div>
    </div>
    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Cancel" v-close-popup="true"></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { Role, GuildMemberAvailableRole } from "../types";
import { onBeforeMount, onBeforeUpdate, ref } from "vue";
import { useMemberStore } from "src/stores/member";
import { useMembersStore } from "src/stores/members";
import { useRoleStore } from "src/stores/role";
import { useQuestStore } from "src/stores/quests";


const MemberGameRegistrationProp = defineProps<{
  show: boolean,
  questId: number,
  guildId: number,
}>();

const memberStore = useMemberStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();
const ready = ref(false)
const roleId: number;


function availableRoles(): Role[] {
  const memberId = memberStore.member?.id;
  return membersStore.getAvailableRolesForMemberAndGuild(
    memberId,
    MemberGameRegistrationProp.guildId
  ).map((cr: GuildMemberAvailableRole) => roleStore.getRoleById(cr.role_id));
}
async function doAddCasting(quest_id: number) {
    await questStore.addCasting();
  }
   /*data: {
        quest_id,
        guild_id: MemberGameRegistrationProp.guildId,
        member_id: memberStore.member.id,
      },
      */

  async function updateRole() {
    const guild_id = MemberGameRegistrationProp.guildId;
    const role_id = roleId;
    const member_id = memberStore.member.id;
    const quest_id = MemberGameRegistrationProp.questId;
    await this.doAddCasting(quest_id);
    await this.addCastingRole({
      data: { member_id, guild_id, role_id, quest_id },
    });
  }

  async function ensureData() {
    await Promise.all([
      roleStore.ensureAllRoles(),
      membersStore.ensureMembersOfGuild({ guildId: MemberGameRegistrationProp.guildId }),
    ]);
  }

   onBeforeUpdate(async ()=> {
    await ensureData();
  })

   onBeforeMount(async () => {
    await ensureData();
    ready.value = true;
  })
</script>
<style lang="css"></style>
