<template>
  <q-page class="bg-secondary admin-page" v-if="ready">
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
              :options="members"
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
              name="superAdmin"
              data-testid="checkbox-superAdmin"
            />
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="createQuest"
              label="Quest Admin"
              left-label
              name="create-quest"
              data-testid="checkbox-createQuest"
            />
          </div>
          <div class="col-md-auto col-sm-6">
            <q-checkbox
              v-model="createGuild"
              label="Guild Admin"
              left-label
              name="create-guild"
              data-testid="checkbox-createGuild"
            />
          </div>
        </div>
        <div class="row q-mt-sm">
          <div class="col-3 q-mt-md">
            <q-btn
              dense
              unelevated
              color="primary"
              label="Update"
              v-bind:disabled="!userIsSuperAdmin"
              @click="updatePermissions"
            />
          </div>
        </div>
        <div>
          <div class="row">
            <div class="col-6 q-pt-sm q-pb-sm">
              <q-btn
                v-if="memberStore.member"
                dense
                unelevated
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
// Imports
import memberHandle from '../components/member-handle.vue';
import scoreboard from '../components/score-board.vue';
import roleTable from '../components/role-table.vue';
import serverDataCard from '../components/server-data-card.vue';
import { waitUserLoaded } from '../app-access';
import { ref, computed, watch } from 'vue';
import { permission_enum } from '../enums';
import { useMembersStore } from '../stores/members';
import { useMemberStore } from '../stores/member';
import { useBaseStore } from '../stores/baseStore';
import { useRoleStore } from '../stores/role';
import { useServerDataStore } from '../stores/serverData';
import { onBeforeMount } from 'vue';
import { useQuasar } from 'quasar';

// Stores
const membersStore = useMembersStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore();
const roleStore = useRoleStore();
const serverDataStore = useServerDataStore();

// Quasar
const $q = useQuasar();

// Reactive Variables
const ready = ref(false);
const userIsSuperAdmin = ref(false);
const member_id = ref<number | undefined>(undefined);

// Computed Properties
const members = computed(() => membersStore.getMembers);
const superAdmin = computed({
  get() {
    return member.value?.permissions!.includes('superadmin');
  },
  set(value) {
    ensure(member.value!.permissions!, permission_enum.superadmin, value!);
  },
});
const createQuest = computed({
  get() {
    return member.value?.permissions!.includes('createQuest');
  },
  set(val) {
    ensure(member.value!.permissions!, permission_enum.createQuest, val!);
  },
});
const createGuild = computed({
  get() {
    return member.value?.permissions!.includes('createGuild');
  },
  set(val) {
    ensure(member.value!.permissions!, permission_enum.createGuild, val!);
  },
});
const member = computed(() => membersStore.getMemberById(member_id.value!));

watch(member_id, () => {
  // force update to member reference or manually trigger side effects if needed
  const newMember = membersStore.getMemberById(member_id.value!);
  if (newMember && !newMember.permissions) {
    newMember.permissions = [];
  }
});

// Functions
async function ensureData() {
  const promises = [
    membersStore.ensureAllMembers(),
    roleStore.ensureAllRoles(),
  ];
  if (baseStore.hasPermission(permission_enum.superadmin)) {
    promises.push(serverDataStore.ensureServerData());
  }
  await Promise.all(promises);
}
function ensure(array: string[], value: permission_enum, present: boolean) {
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
async function updatePermissions() {
  try {
    await membersStore.updateMember({
      id: member.value?.id,
      permissions: member.value?.permissions,
    });
    $q.notify({
      message: 'Permissions were updated successfully',
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in updating permissions ', err);
    $q.notify({
      message: 'There was an error updating permissions.',
      color: 'negative',
    });
  }
}
onBeforeMount(async () => {
  await waitUserLoaded();
  member_id.value = memberStore.getUserId;
  userIsSuperAdmin.value = baseStore.hasPermission(permission_enum.superadmin);
  await ensureData();
  ready.value = true;
});
</script>
<style>
.admin-page {
  width: 100%;
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: flex-start; /* Align to the top to allow natural height */
}

/* Card Styling */
.admin-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9); /* Slight transparency */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  border-radius: 8px; /* Rounded corners */
  transition:
    transform 0.3s,
    box-shadow 0.3s; /* Smooth hover effect */
}

.admin-card:hover {
  transform: translateY(-4px); /* Slight lift on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* Form Controls */
#qselect {
  width: 100%; /* Full width for better alignment */
}

.q-checkbox {
  margin: 0.5rem 0; /* Spacing between checkboxes */
}

.q-select,
.q-btn {
  border-radius: 6px; /* Rounded corners */
}

/* Section Styling */
#permissions,
#roles {
  border: 1px solid #3f51b5; /* Blue border */
  background-color: #f8f9fa; /* Light gray background */
  border-radius: 6px; /* Rounded corners */
  padding: 1rem;
  margin-top: 1rem;
}

#permissions h3,
#roles h3 {
  color: #3f51b5; /* Title color */
  margin-bottom: 0.5rem;
}

/* Buttons */
.q-btn {
  margin: 0.5rem 0;
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
}

.q-btn:hover {
  background-color: #1976d2; /* Darker blue */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Role Table Section */
#newRoleBtn {
  margin-bottom: 1rem;
}

/* Scoreboard Section */
.scoreboard {
  margin-bottom: 1rem;
}

/* Responsive Design */
@media only screen and (max-width: 1300px) {
  .admin-card {
    width: 80%;
  }
}

@media only screen and (max-width: 800px) {
  .admin-card {
    width: 95%;
    padding: 1rem;
  }

  #permissions,
  #roles {
    padding: 0.5rem;
  }
}
</style>
