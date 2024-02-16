<template>
  <q-card id="team-card">
    <div class="col-3">
      <h3 class="text-center">Team</h3>
    </div>
    <ul class="q-ml-md">
      <li v-for="member in membersStore.members" :key="member.id" class="q-ml-lg q-mr-md">
        <div class="row">
          <div class="col-4">
            <span class="q-pr-md q-ml-md"> {{ member.handle }} </span>
          </div>
          <div class="col-3"></div>
          <div class="col-4">
            <span v-if="playingAsGuildId(member.id)">
              <span
                v-if="playingAsGuildId(member.id) == GuildMembersProps.guild.id"
                style="color: black"
              >
                {{ getAllCastingRoleNames(member.id) }}
              </span>
              <span v-if="playingAsGuildId(member.id) != GuildMembersProps.guild.id"
                >Playing in
                <router-link
                  :to="{
                    name: 'guild',
                    params: { guild_id: playingAsGuildId(member.id) },
                  }"
                  >{{ playingAsGuild(member.id).name }}</router-link
                ></span
              >
            </span>
          </div>
        </div>
      </li>
    </ul>
  </q-card>
</template>
<script setup lang="ts">
import { Guild, Quest, PublicMember } from '../types'
import { useQuestStore } from "src/stores/quests";
import { useGuildStore } from "src/stores/guilds";
import { useMembersStore } from "src/stores/members";
import { useRoleStore } from 'src/stores/role';

const GuildMembersProps = defineProps<{
    guild: Guild;
    quest: Quest;
    members: PublicMember[] | undefined,
    playersOnly?: boolean,
}>();

const questStore = useQuestStore();
const guildStore = useGuildStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();

function playingAsGuildId(member_id: number) {
  return questStore.castingInQuest(null, member_id)?.guild_id;
}
function playingAsGuild(member_id: number): Guild {
  const guild_id = playingAsGuildId(member_id);
    return guildStore.getGuildById(guild_id);
}
function getCastingRoleNamesForQuest(memberId: number) {
  const castingRoles = membersStore.castingRolesPerQuest(memberId, GuildMembersProps.quest.id);
  const roles = castingRoles.map((cr) => roleStore.role[cr.role_id]);
  return roles;
}
function getAllCastingRoleNames(memberId: number) {
  const roles = getCastingRoleNamesForQuest(memberId);
  const rolesName = roles.map((cr) => cr.name).join(",");
  return rolesName;
}
</script>
<style>
#team-card {
  width: 100%;
  font-size: 20px;
  color: black;
  border: grey;
  background-color: floralwhite;
}
#team-card-members {
  color: blue;
}
</style>
