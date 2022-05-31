<template>
    <q-card style="min-width: 350px" v-if="ready">
      <div v-if="availableRoles.length">
        <q-card-section>
          <div class="text-h6">Available Roles</div>
        </q-card-section>
        <div v-for="role in availableRoles" :key="role.id">
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

<script lang="ts">
import {
  MemberState,
} from "../store/member";
import {
  MembersGetterTypes,
  MembersActionTypes,
} from "../store/members";
import {
  RoleGetterTypes,
  RoleActionTypes,
} from "../store/role";
import {
  QuestsActionTypes
} from "../store/quests";
import Vue from "vue";
import Component from "vue-class-component";
import { mapActions, mapGetters, mapState } from "vuex";
import { Role } from '../types';

// This component is obsolete, but may contain useful code

const MemberGameRegistrationProp = Vue.extend({
  props: {
    show: Boolean,
    questId: Number,
    guildId: Number,
  },
});

@Component<MemberGameRegistration>({
  name: "MemberGameRegistration",
  computed: {
    ...mapGetters("role", ["getRoleById"]),
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapGetters("members", [
      "getAvailableRolesMembersById",
    ]),
    availableRoles(): Role[] {
      const memberId = this.memberId
      const roleCastings = this.getAvailableRolesMembersById(memberId) || [];
      const roles = roleCastings.map((cr) => this.getRoleById(cr.role_id));
      return roles;
    }
  },
  methods: {
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions("quests", ["addCasting", "addCastingRole"]),
    ...mapActions("members", ["ensureMembersOfGuild"]),
  },
})
export default class MemberGameRegistration extends MemberGameRegistrationProp {
  getAvailableRolesMembersById!: MembersGetterTypes["getAvailableRolesMembersById"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  addCasting!: QuestsActionTypes["addCasting"];
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];
  addCastingRole!: QuestsActionTypes["addCastingRole"];
  ensureMembersOfGuild!: MembersActionTypes["ensureMembersOfGuild"];
  availableRoles!: Role[];
  memberId!: number;
  member!: MemberState["member"];

  roleId: number = null;
  ready = false;

  async doAddCasting(quest_id: number) {
    await this.addCasting({
      data: {
        quest_id,
        guild_id: this.guildId,
        member_id: this.memberId,
      },
    });
  }

  async updateRole() {
    const guild_id = this.guildId;
    const role_id = this.roleId;
    const member_id = this.memberId;
    const quest_id = this.questId;
    await this.doAddCasting(quest_id);
    await this.addCastingRole({
      data: { member_id, guild_id, role_id, quest_id },
    });
  }

  async beforeMount() {
    await Promise.all([
      this.ensureAllRoles(),
      this.ensureMembersOfGuild({ guildId: this.guildId }),
    ])
    this.ready = true;
  }
}
</script>
<style lang="css">
</style>
