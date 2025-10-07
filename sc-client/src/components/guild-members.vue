<template>
  <q-card id="team-card" class="q-pa-md">
    <q-card-section>
      <div class="text-h6 text-center q-mb-md">Team</div>

      <q-list separator>
        <q-item
          v-for="member in membersWithGuildData"
          :key="member.id"
          class="q-py-sm flex items-center justify-between"
        >
          <!-- Handle -->
          <q-item-section side class="text-subtitle1">
            {{ member.handle }}
          </q-item-section>

          <!-- Roles or Guild -->
          <q-item-section class="q-gutter-sm" style="flex: 1">
            <template v-if="member.guildId">
              <!-- Same guild → show roles -->
              <template v-if="member.guildId === GuildMembersProps.guild?.id">
                <q-chip
                  v-for="role in member.roles"
                  :key="role"
                  size="md"
                  outline
                  color="primary"
                  text-color="black"
                  class="q-mr-sm"
                  dense
                >
                  {{ role }}
                </q-chip>
              </template>

              <!-- Different guild → show link -->
              <template v-else>
                Playing in
                <router-link
                  :to="{ name: 'guild', params: { guild_id: member.guildId } }"
                  class="text-primary text-weight-medium"
                >
                  {{ member.guild?.name }}
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
import { computed } from 'vue'
import { Guild, Quest, PublicMember } from '../types'
import { useQuestStore } from '../stores/quests'
import { useGuildStore } from '../stores/guilds'
import { useMembersStore } from '../stores/members'
import { useRoleStore } from '../stores/role'

// Props
const GuildMembersProps = defineProps<{
  guild?: Guild
  quest?: Quest
  members?: PublicMember[]
  playersOnly?: boolean
}>()

// Stores
const questStore = useQuestStore()
const guildStore = useGuildStore()
const membersStore = useMembersStore()
const roleStore = useRoleStore()

// Computed: enrich each member with guild + roles
const membersWithGuildData = computed(() => {
  if (!GuildMembersProps.members) return []

  return GuildMembersProps.members.map(m => {
    const member = membersStore.getMemberById(m.id) || m

    const guildId = questStore.castingInQuest(
      GuildMembersProps.quest?.id ?? null,
      member.id
    )?.guild_id

    const guild = guildId ? guildStore.getGuildById(guildId) : undefined

    const roles = GuildMembersProps.quest?.id
      ? membersStore
          .castingRolesPerQuest(member.id, GuildMembersProps.quest.id)
          .map(cr => roleStore.getRoleById(cr.role_id)?.name)
          .filter((r): r is string => !!r)
      : []

    return {
      ...member,
      guildId,
      guild,
      roles,
    }
  })
})
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
