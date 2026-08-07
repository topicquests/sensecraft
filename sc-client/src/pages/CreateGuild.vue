<template>
  <q-page class="create-guild-page" v-if="ready">
    <div class="row justify-center q-pa-lg">
      <q-card
        class="create-guild-card q-pa-md"
        style="max-width: 700px; width: 100%"
      >
        <!-- Member Handle -->
        <member_handle class="q-mb-md" />

        <!-- Page Title -->
        <div class="row justify-center q-mb-lg">
          <h4 class="page-title">Create New Guild</h4>
        </div>

        <!-- Guild Form -->
        <q-form @submit.prevent="doSubmit(guild)">
          <q-card-section class="q-pa-none">
            <!-- Public/Private Selection -->
            <q-option-group
              v-model="guild.public"
              :options="public_private_bool"
              inline
              color="primary"
              class="q-mb-md"
            />

            <!-- Guild Name -->
            <q-input
              v-model="guild.name"
              label="Guild Name"
              outlined
              dense
              data-test="guild-title-input"
              class="q-mb-md"
            />

            <!-- Guild Handle -->
            <q-input
              v-model="guild.handle"
              label="Handle"
              data-test="guild-handle"
              outlined
              dense
              class="q-mb-md"
            />

            <!-- Guild Description -->
            <div class="q-mb-md">
              <div class="q-mb-xs font-bold">Details</div>
              <q-editor
                v-model="description"
                class="guild-description-editor"
                data-test="guild-description-editor"
                placeholder="Enter guild description..."
                :toolbar="[['bold', 'italic', 'underline', 'strike']]"
              />
            </div>

            <!-- Default Role -->
            <q-select
              v-model="role"
              :options="roleStore.getRoles"
              option-label="name"
              option-value="id"
              label="Default Role"
              outlined
              data-test="default-role-selector"
              dense
              class="q-mb-md"
            />

            <!-- Form Actions -->
            <div class="row justify-end q-gutter-sm">
              <q-btn
                label="Cancel"
                outlined
                @click="router.push({ name: 'home' })"
              />
              <q-btn 
                label="Submit" 
                type="submit" 
                color="primary"
                data-test="add-guild-btn" 
                unelevated />
            </div>
          </q-card-section>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useRoleStore } from '../stores/role';
import { useMembersStore } from '../stores/members';
import { useGuildStore } from '../stores/guilds';
import { public_private_bool } from '../enums';
import member_handle from '../components/member-handle.vue';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { GuildData, Role } from '../types';

interface guildType {
  name: string;
  handle: string;
  public: boolean;
  description: string;
  default_role_id?: number | null;
}

const roleStore = useRoleStore();
const membersStore = useMembersStore();
const guildStore = useGuildStore();
const $q = useQuasar();
const router = useRouter();
const ready = ref(false);

const guild = ref<guildType>({
  name: '',
  handle: '',
  public: false,
  description: '',
  default_role_id: null,
});

const role = ref<Partial<Role>>({ name: '' });

const description = computed({
  get: () => guild.value.description,
  set: (value) => (guild.value.description = value),
});

async function doSubmit(guild: guildType) {
  try {
    guild.default_role_id = role.value.id;
    const res: AxiosResponse<GuildData[]> = await guildStore.createGuild(guild);

    $q.notify({ message: 'Guild created successfully!', color: 'positive' });
    await router.push({
      name: 'guild_admin',
      params: { guild_id: res.data[0].id },
    });
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? `Axios error: ${error.message}`
      : 'Unexpected error creating guild';
    console.error(error);
    $q.notify({ message, color: 'negative' });
  }
}

onBeforeMount(async () => {
  await roleStore.ensureAllRoles();
  await membersStore.ensureAllMembers();
  ready.value = true;
});
</script>

<style lang="scss">
.create-guild-page {
  background: var(--sc-color-bg-muted);
  min-height: 100vh;
}

.guild-description-editor {
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
}

.create-guild-card {
  background-color: var(--sc-color-surface);
  border-radius: var(--sc-radius-lg);
}

.page-title {
  text-align: center;
  font-weight: var(--sc-font-weight-bold);
}

.font-bold {
  font-weight: var(--sc-font-weight-semibold);
}
</style>
