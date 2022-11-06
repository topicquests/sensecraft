<template>
  <q-page class="bg-secondary" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-6" id="permissions">
        <div class="row q-mt-xl">
          <div class="col-2 q-ml-xl q-mr-xl">
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
          <div class="col-2">
            <q-checkbox
              v-model="superAdmin"
              label="superAdmin"
              left-label
              name="superadmin"
            />
          </div>
          <div class="col-2">
            <q-checkbox
              v-model="createQuest"
              label="createQuest"
              left-label
              name="create-quest"
            />
          </div>
          <div class="col-2">
            <q-checkbox
              v-model="createGuild"
              label="createGuild"
              left-label
              name="create-guild"
            />
          </div>
          <div class="col-2">
            <q-btn
              color="primary"
              label="Update"
              v-bind:disabled="!userIsSuperAdmin"
              @click="updatePermissions"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-6 q-pt-lg q-pb-sm" style="width: 55%">
        <q-btn
          v-if="$store.state.member.member"
          id="newRoleBtn"
          label="New Role"
          @click="$router.push({ name: 'create_role' })"
        />
      </div>
      <div id="roles" style="width: 55%">
        <role-table v-bind:roles="getRoles"></role-table>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import member from "../components/member.vue";
import scoreboard from "../components/scoreboard.vue";
import { mapActions, mapGetters } from "vuex";
import roleTable from "../components/role-table.vue";
import type { Member } from "../types";

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

export default {
  name: "Admin-app",
  props: {},
  meta: {
    // sets document title
    title: "Administration",
  },
  data() {
    return {
      ready: false,
      userIsSuperAdmin: false,
      member_id: null,
    };
  },
  computed: {
    ...mapGetters(["hasPermission"]),
    ...mapGetters("member", ["getUserId"]),
    ...mapGetters("members", ["getMembers", "getMemberById"]),
    ...mapGetters("role", ["getRoles"]),

    member: function (): Member | undefined {
      return this.getMemberById(this.member_id);
    },
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
  },
  components: {
    member: member,
    scoreboard: scoreboard,
    roleTable: roleTable,
  },
  methods: {
    ...mapActions("members", ["updateMember", "ensureAllMembers"]),
    ...mapActions("role", ["ensureAllRoles"]),
    async updatePermissions() {
      const member = this.member;
      await this.updateMember({
        data: { id: member.id, permissions: member.permissions },
      });
    },
  },
  async beforeMount() {
    await this.ensureAllMembers();
    await this.ensureAllRoles();
    this.member_id = this.getUserId;
    this.userIsSuperAdmin = this.hasPermission("superadmin");
    this.ready = true;
  },
};
</script>
<style>
#qselect {
  width: 10%;
}
#permissions {
  width: 900px;
  border: 1px solid blue;
  background-color: lightyellow;
}
#roles {
  border: 1px solid blue;
  background-color: lightyellow;
}
#newRoleBtn {
  margin-bottom: 4px;
  background-color: lightblue;
  color: blue;
}
</style>
