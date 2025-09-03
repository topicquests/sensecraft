<template>
  <q-page class="bg-secondary create-guild-page" v-if="ready">
    <div class="row justify-center q-pa-lg">
      <q-card class="create-guild-card q-pa-md" style="max-width: 700px; width: 100%">

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
              class="q-mb-md"
            />

            <!-- Guild Handle -->
            <q-input
              v-model="guild.handle"
              label="Handle"
              outlined
              dense
              class="q-mb-md"
            />

            <!-- Guild Description -->
            <div class="q-mb-md">
              <div class="q-mb-xs font-bold">Details</div>
              <q-editor
                v-model="description"
                placeholder="Enter guild description..."
                style="min-height: 150px;"
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
              dense
              class="q-mb-md"
            />

            <!-- Form Actions -->
            <div class="row justify-end q-gutter-sm">
              <q-btn
                label="Cancel"
                color="grey-5"
                text-color="black"
                outlined
                @click="router.push({ name: 'home' })"
              />
              <q-btn
                label="Submit"
                type="submit"
                color="primary"
                unelevated
              />
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
  set: (value) => guild.value.description = value,
});

async function doSubmit(guild: guildType) {
  try {
    guild.default_role_id = role.value.id;
    const res: AxiosResponse<GuildData[]> = await guildStore.createGuild(guild);

    $q.notify({ message: 'Guild created successfully!', color: 'positive' });
    router.push({ name: 'guild_admin', params: { guild_id: res.data[0].id } });
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
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
}

.create-guild-card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
}

.page-title {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  font-weight: bold;
}

.font-bold {
  font-weight: 600;
}
</style>
