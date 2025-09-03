<template>
  <q-page class="bg-secondary admin-page" v-if="ready">
    <div class="row justify-center q-gutter-md">
      <q-card class="admin-card q-mt-md q-pa-lg">

        <!-- Member Handle -->
        <q-card-section>
          <member-handle />
        </q-card-section>

        <!-- Permissions Section -->
        <q-card-section id="permissions">
          <div class="section-header text-h6 text-primary">⚙️ Permissions</div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="member_id"
                :options="members"
                option-label="handle"
                option-value="id"
                label="Select Member"
                emit-value
                map-options
                dense
                outlined
                clearable
              />
            </div>

            <div class="col-12 col-sm-6 col-md-2">
              <q-checkbox
                v-model="superAdmin"
                label="Super Admin"
                left-label
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <q-checkbox
                v-model="createQuest"
                label="Quest Admin"
                left-label
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <q-checkbox
                v-model="createGuild"
                label="Guild Admin"
                left-label
                dense
              />
            </div>

            <div class="col-12 col-md-2 flex flex-center">
              <q-btn
                dense
                unelevated
                color="primary"
                label="Update"
                :disable="!userIsSuperAdmin"
                @click="updatePermissions"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Roles Section -->
        <q-card-section id="roles">
          <div class="section-header text-h6 text-primary">🎭 Roles</div>
          <div class="row justify-between items-center q-mt-sm">
            <div>
              <q-btn
                v-if="memberStore.member"
                dense
                unelevated
                color="primary"
                icon="add"
                label="New Role"
                @click="router.push({ name: 'create_role' })"
              />
            </div>
          </div>
          <div class="q-mt-md">
            <role-table :roles="roleStore.getRoles" />
          </div>
        </q-card-section>

        <!-- Server Data Section -->
        <q-card-section v-if="userIsSuperAdmin">
          <div class="section-header text-h6 text-primary">🖥️ Server Data</div>
          <server-data-card />
        </q-card-section>

      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Imports
import memberHandle from '../components/member-handle.vue';
import roleTable from '../components/role-table.vue';
import serverDataCard from '../components/server-data-card.vue';
import { waitUserLoaded } from '../app-access';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { permission_enum } from '../enums';
import { useMembersStore } from '../stores/members';
import { useMemberStore } from '../stores/member';
import { useBaseStore } from '../stores/baseStore';
import { useRoleStore } from '../stores/role';
import { useServerDataStore } from '../stores/serverData';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

// Stores
const membersStore = useMembersStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore();
const roleStore = useRoleStore();
const serverDataStore = useServerDataStore();

// Router
const router = useRouter();
// Quasar
const $q = useQuasar();

// Reactive Variables
const ready = ref(false);
const userIsSuperAdmin = ref(false);
const member_id = ref<number | undefined>(undefined);

// Computed Properties
const members = computed(() => membersStore.getMembers);
const member = computed(() => membersStore.getMemberById(member_id.value!));

const superAdmin = computed({
  get: () => member.value?.permissions?.includes('superadmin'),
  set: (val) => ensure(member.value!.permissions!, permission_enum.superadmin, val!),
});
const createQuest = computed({
  get: () => member.value?.permissions?.includes('createQuest'),
  set: (val) => ensure(member.value!.permissions!, permission_enum.createQuest, val!),
});
const createGuild = computed({
  get: () => member.value?.permissions?.includes('createGuild'),
  set: (val) => ensure(member.value!.permissions!, permission_enum.createGuild, val!),
});

watch(member_id, () => {
  const newMember = membersStore.getMemberById(member_id.value!);
  if (newMember && !newMember.permissions) {
    newMember.permissions = [];
  }
});

// Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  member_id.value = memberStore.getUserId;
  userIsSuperAdmin.value = baseStore.hasPermission(permission_enum.superadmin);
  await ensureData();
  ready.value = true;
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
  if (present && !array.includes(value)) {
    array.push(value);
  } else if (!present && array.includes(value)) {
    array.splice(array.indexOf(value), 1);
  }
}

async function updatePermissions() {
  try {
    await membersStore.updateMember({
      id: member.value?.id,
      permissions: member.value?.permissions,
    });
    $q.notify({
      message: 'Permissions updated successfully',
      color: 'positive',
    });
  } catch (err) {
    console.error('Error updating permissions:', err);
    $q.notify({
      message: 'Error updating permissions',
      color: 'negative',
    });
  }
}

</script>

<style scoped>
.admin-page {
  width: 100%;
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Card Styling */
.admin-card {
  width: 100%;
  max-width: 1200px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.admin-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

/* Section Headers */
.section-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Section Wrappers */
#permissions,
#roles {
  border: 1px solid #3f51b5;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

/* Buttons */
.q-btn {
  border-radius: 8px;
  transition: background-color 0.2s, box-shadow 0.2s;
}
.q-btn:hover {
  background-color: #1565c0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-card {
    max-width: 95%;
  }
}
</style>
