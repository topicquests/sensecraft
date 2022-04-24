<template>
  <q-card id="team-card">
    <div class="col-2">
      <h3 class="text-center">Team</h3>
    </div>
    <ul class="q-ml-md">
      <li
        v-for="member in members"
        :key="member.id"
        class="q-ml-lg q-mr-md"
      >
        <div class="row">
          <div class="col-5">
            <span class="q-pr-md q-ml-md"> {{ member.handle }} </span>
          </div>
          <div class="col-4">
            <span v-if="playingAsGuildId(member.id)">
              <span
                v-if="playingAsGuildId(member.id) == guild.id"
                style="color: black"
              >
                {{ getAllCastingRoleNames(member.id) }}
              </span>
              <span
                v-if="playingAsGuildId(member.id) != guild.id"
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
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions, mapState, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import { Guild, Member, Quest } from "../types";
import { GuildsGetterTypes } from "../store/guilds";
import { MembersGetterTypes } from "../store/members";
import { QuestsGetterTypes } from "../store/quests";
import { RoleState } from "../store/role";
import { Prop } from "vue/types/options";

const GuildMembersProps = Vue.extend({
  props: {
    guild: Object as Prop<Guild>,
    quest: Object as Prop<Quest>,
    members: Array as Prop<Member[]>,
    playersOnly: Boolean
  },
});

@Component<GuildMembers>({
  name: "guild-members",
  computed: {
    ...mapState("role", {
      allRoles: (state: RoleState) => state.role,
    }),
    ...mapGetters("guilds", ["getGuildById"]),
    ...mapGetters("quests", ["castingInQuest"]),
    ...mapGetters("members", ["castingRolesPerQuest"]),
  },
  methods: {
    ...mapActions("guilds", ["updateGuild"]),
  },
})
export default class GuildMembers extends GuildMembersProps {
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  getGuildById!: GuildsGetterTypes["getGuildById"];
  castingRolesPerQuest!: MembersGetterTypes["castingRolesPerQuest"];
  allRoles!: RoleState["role"];

  playingAsGuildId(member_id) {
    return this.castingInQuest(null, member_id)?.guild_id;
  }
  playingAsGuild(member_id) {
    const guild_id = this.playingAsGuildId(member_id);
    if (guild_id) return this.getGuildById(guild_id);
  }
  getCastingRoleNamesForQuest(memberId: number) {
    const castingRoles = this.castingRolesPerQuest(
      memberId,
      this.quest.id
    );
    const roles = castingRoles.map((cr) => this.allRoles[cr.role_id]);
    return roles;
  }
  getAllCastingRoleNames(memberId: number) {
    const roles = this.getCastingRoleNamesForQuest(memberId);
    const rolesName = roles.map((cr) => cr.name).join(",");
    return rolesName;
  }
}

</script>
<style>
#team-card {
  font-size: 20px;
  color: black;
  border: grey;
  background-color: floralwhite;
}
#team-card-members {
  color: blue;
}
</style>
