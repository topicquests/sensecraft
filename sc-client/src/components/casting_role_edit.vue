<template>
  <div>
    <q-card class="card">
      <section>
        <div class="row justify-center" :style="{ height: '40px' }">
          <h2 class="q-ml-sm q-mr-lg">Change casting role</h2>
        </div>
        <div class="row justify-center">
          <h3 class="q-ml-lg q-mr-lg">{{ currentQuest.name }}</h3>
        </div>
      </section>
      <q-separator color="grey" class="q-mb-md"></q-separator>
      <p class="note">Can only be changed prior to start of quest</p>
      <div class="row">
        <span class="handle q-pl-md q-mt-md">
          {{ memberStore.member!.handle }}
        </span>
        <q-select
          class="q-ml-md q-mt-xs"
          style="width: 50%"
          :multiple="true"
          v-model="cr"
          @add="
            (details) => {
              castingRoleAdd(details.value);
            }
          "
          @remove="
            (details) => {
              castingRoleRemove(details.value);
            }
          "
          :options="availableRoles"
          option-label="name"
          option-value="id"
          emit-value
          map-options
        ></q-select>
      </div>
      <div class="row justify-center" v-if="canLeave">
        <q-btn
          data-test="leave-quest-btn"
          label="Leave Quest"
          color="negative"
          class="q-ma-md"
          @click="$emit('leaveQuest')"
        />
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useMemberStore } from '../stores/member';
import { Role } from '../types';
import { computed, ref, watch } from 'vue';
import { useQuestStore } from '../stores/quests';

// Props
const CastingRoleEditProps = defineProps<{
  availableRoles: Partial<Role>[];
  castingRoles: Partial<Role>[];
  questId: number | undefined;
  guildId: number | undefined;
  canLeave?: boolean;
}>();

// Emits
const emit = defineEmits(['castingRoleAdd', 'castingRoleRemove', 'leaveQuest']);

// Stores
const memberStore = useMemberStore();
const questStore = useQuestStore();

// Reactive Variables
const cr = ref<Partial<Role>[]>(CastingRoleEditProps.castingRoles || []);

// Computed Properties
const currentQuest = computed(
  () => questStore.getQuestById(CastingRoleEditProps.questId!) || { name: '' },
);

// Watches
watch(CastingRoleEditProps, (/* newRole */) => {
  const newCastingRoles = CastingRoleEditProps.castingRoles || [];
  cr.value = [...newCastingRoles];
});

// FUnctions
function castingRoleAdd(role_id: number) {
  emit('castingRoleAdd', role_id);
}
function castingRoleRemove(role: Role) {
  emit('castingRoleRemove', role.id);
}
</script>
<style>
H5 {
  margin-top: 3%;
  margin-bottom: 3%;
}
.handle {
  font-size: 20px;
  color: royalblue;
  padding-bottom: 2em;
}
.card {
  background: white;
}
.note {
  font-size: 15px;
  background: white;
  text-align: center;
  color: black;
  padding-left: 1em;
  padding-right: 1em;
}
</style>
