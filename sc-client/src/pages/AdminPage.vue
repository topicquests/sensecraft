<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center q-gutter-md">
      <q-card class="admin-card q-mt-md q-pa-md">
        <div>
          <member-handle></member-handle>
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
              :options="membersStore.getMembers"
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
              v-model="checkForSuperAdmin"
              label="superAdmin"
              left-label
              name="superadmin"
            />
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="checkForCreateQuest"
              label="createQuest"
              left-label
              name="create-quest"
            />
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="checkForCreateGuild"
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
                v-if="memberStore.member"
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
                <role-table :roles="roleStore.getRoles"></role-table>
              </div>
            </div>
          </div>
        </div>
        <div v-if="userIsSuperAdmin">
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

<script setup lang="ts">
import memberHandle from "../components/member-handle.vue";
import scoreboard from "../components/score-board.vue";
import roleTable from "../components/role-table.vue";
import serverDataCard from "../components/server-data-card.vue";
import type { Member } from "../types";
import { userLoaded } from "../boot/userLoaded";
import { ref } from "vue";
import { permission_enum } from "../enums";
import { useMembersStore } from "src/stores/members"; 
import { useMemberStore } from "src/stores/member";
import { useBaseStore } from "src/stores/baseStore"
import { useRoleStore } from "src/stores/role";
import { useServerDataStore } from 'src/stores/serverData'
import { onBeforeMount } from "vue";
import { useQuasar } from 'quasar';

const ready = ref(false);
  const userIsSuperAdmin = ref(false);
  const member_id = ref<number | undefined>(undefined);
  const membersStore = useMembersStore();
  const memberStore = useMemberStore();
  const baseStore = useBaseStore();
  const roleStore = useRoleStore();
  const serverDataStore = useServerDataStore();
  const $q = useQuasar();


function ensure(array: [], value: permission_enum, present: boolean) {
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
  function checkForSuperAdmin() {
    if(memberStore.member?.permissions.includes("superadmin")) {
        return true;
      }
    else 
      return false
  }
  function checkForCreateQuest() {
    if (memberStore.member?.permissions.includes("createQuest")){
      return true;
    }
  }
  function checkForCreateGuild() {
        if(memberStore.member?.permissions.includes("createGuild")) {
          return true
        }
        else
          return false
      }
  function member(): Member | undefined {
    return membersStore.getMemberById(member_id.value);
  }
    
  async function ensureData() {
    const promises = [membersStore.ensureAllMembers(), roleStore.ensureAllRoles()];
    if (baseStore.hasPermission(permission_enum.superadmin)) {
      promises.push(serverDataStore.ensureServerData());
    }
    await Promise.all(promises);
  }

  async function updatePermissions() {
    try {
      await membersStore.updateMember({
        data: { id: memberStore.member.id, permissions: memberStore.member.permissions },
      });
      $q.notify({
        message: "Permissions were updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating permissions ", err);
      $q.notify({
        message: "There was an error updating permissions.",
        color: "negative",
      });
    }
  }
  onBeforeMount(async () => {
    //await userLoaded;
    member_id.value = memberStore.getUserId;
    userIsSuperAdmin.value = baseStore.hasPermission(permission_enum.superadmin);
    await ensureData();
    ready.value = true;
  })
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
