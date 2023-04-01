<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center q-gutter-md">
      <q-card class="admin-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="row q-mt-xl q-gutter-xl q-ml-md" id="permissions">
          <div class="col-md-auto col-sm-6">
            <q-select
              v-model="member_id"
              :options="getMembers"
              option-label="handle"
              option-value="id"
              label="Handle"
              emit-value
              map-options
              id="qselect"
            >
            </q-select>
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="superAdmin"
              label="superAdmin"
              left-label
              name="superadmin"
            />
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="createQuest"
              label="createQuest"
              left-label
              name="create-quest"
            />
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="createGuild"
              label="createGuild"
              left-label
              name="create-guild"
            />
          </div>
        </div>
        <div class="row q-mt-sm">
          <div class="col-3 q-mt-md">
            <q-btn
              color="primary"
              label="Update"
              v-bind:disabled="!userIsSuperAdmin"
              @click="updatePermissions"
            />
          </div>
        </div>
        <div>
          <div class="row">
            <div class="col-6 q-pt-lg q-pb-sm">
              <q-btn
                v-if="$store.state.member.member"
                id="newRoleBtn"
                color="primary"
                label="New Role"
                @click="$router.push({ name: 'create_role' })"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <div id="roles" class="q-mb-xl">
                <role-table v-bind:roles="getRoles"></role-table>
              </div>
            </div>
          </div>
        </div>
        <div v-if="superadmin">
          <div class="row">
            <div class="col-12">
              <h2 style="text-align: center">Server Data</h2>
              <server-data-card></server-data-card>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import member from "../components/member.vue";
import scoreboard from "../components/scoreboard.vue";
import { mapActions, mapGetters } from "vuex";
import roleTable from "../components/role-table.vue";
import serverDataCard from "../components/server-data-card.vue";
import type { Member } from "../types";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import { MembersActionTypes, MembersGetterTypes } from "src/store/members";
import { BaseGetterTypes } from "src/store/baseStore";
import { MemberGetterTypes } from "src/store/member";
import { permission_enum } from "../enums";
import { RoleActionTypes, RoleGetterTypes } from "src/store/role";
import { ServerDataActionTypes } from "src/store/serverData";

function ensure(array, value, present) {
  if (!array) return;
  if (present) {
    if (!array.includes(value)) {
      array.push(value);
    }
  } else {
    if (array.includes(value)) {
      array.splice(array.indexOf(value), 1);
    }
  }
}

@Component<AdminPage>({
  name: "Admin-app",
  meta: {
    title: "Administration",
  },
  components: {
    member: member,
    scoreboard: scoreboard,
    roleTable: roleTable,
    serverDataCard: serverDataCard,
  },

  computed: {
    ...mapGetters(["hasPermission"]),
    ...mapGetters("member", ["getUserId"]),
    ...mapGetters("members", ["getMembers", "getMemberById"]),
    ...mapGetters("role", ["getRoles"]),

    superAdmin: {
      get() {
        return this.member?.permissions.includes("superadmin");
      },
      set(value) {
        ensure(this.member?.permissions, "superadmin", value);
      },
    },

    createQuest: {
      get() {
        return this.member?.permissions.includes("createQuest");
      },
      set(value) {
        ensure(this.member?.permissions, "createQuest", value);
      },
    },
    createGuild: {
      get() {
        return this.member?.permissions.includes("createGuild");
      },
      set(value) {
        ensure(this.member?.permissions, "createGuild", value);
      },
    },

    member: function (): Member | undefined {
      return this.getMemberById(this.member_id);
    },
  },
  methods: {
    ...mapActions("members", ["updateMember", "ensureAllMembers"]),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions("serverData", ["ensureServerData"]),
  },
})
export default class AdminPage extends Vue {
  ready = false;
  userIsSuperAdmin = false;
  member_id: number = null;
  member: Partial<Member>;

  hasPermission!: BaseGetterTypes["hasPermission"];
  getMemberById!: MembersGetterTypes["getMemberById"];
  getUserId!: MemberGetterTypes["getUserId"];
  getMembers!: MembersGetterTypes["getMembers"];
  getRoles!: RoleGetterTypes["getRoles"];

  ensureAllMembers!: MembersActionTypes["ensureAllMembers"];
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];
  ensureServerData!: ServerDataActionTypes["ensureServerData"];
  updateMember!: MembersActionTypes["updateMember"];

  async ensureData() {
    const promises = [this.ensureAllMembers(), this.ensureAllRoles()];
    if (this.hasPermission(permission_enum.superadmin)) {
      promises.push(this.ensureServerData());
    }
    await Promise.all(promises);
  }

  async updatePermissions() {
    try {
      const member = this.member;
      await this.updateMember({
        data: { id: member.id, permissions: member.permissions },
      });
      this.$q.notify({
        message: "Permissions were updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating permissions ", err);
      this.$q.notify({
        message: "There was an error updating permissions.",
        color: "negative",
      });
    }
  }

  async beforeMount() {
    await userLoaded;
    this.member_id = this.getUserId;
    this.userIsSuperAdmin = this.hasPermission(permission_enum.superadmin);
    await this.ensureData();
    this.ready = true;
  }
}
</script>
<style>
.admin-card {
  width: 60%;
}
#qselect {
  width: 10%;
}
#permissions {
  border: 1px solid blue;
  background-color: lightyellow;
}
#roles {
  border: 1px solid blue;
  background-color: lightyellow;
}
#newRoleBtn {
  margin-bottom: 4px;
}
@media only screen and (max-width: 1300px) {
  .admin-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .admin-card {
    width: 95%;
  }
}
</style>
