<template>
  <div>
    <q-card class="q-pl-md">
      <div v-if="guild.name" class="row justify-center q-pb-lg">
        <q-input v-model="guild.name" />
      </div>
      <span class="q-ml-xl" style="font-weight: bold">Type of Guild</span>
      <div class="row justify-start">
        <q-option-group
          v-if="guild"
          v-model="guild.public"
          :options="public_private_bool"
          color="primary"
          inline
        >
        </q-option-group>
      </div>
      <section v-if="GuildCardProps.showDescription == true">
        <div class="row justify-start q-pb-xs" style="font-weight: bold">
          Description<br />
        </div>
        <div class="row justify-start q-pb-sm">
          <q-editor
            v-model="description"
            :toolbar="[['bold', 'italic', 'underline', 'strike']]"
          >
          </q-editor>
        </div>
      </section>
      <div>
        <section class="q-pt-lg">
          <span class="q-pl-xl" style="font-weight: bold">Invitation</span>
          <q-option-group
            v-if="guild"
            v-model="guild.open_for_applications"
            :options="invitation"
            color="primary"
            inline
          >
          </q-option-group>
        </section>
      </div>
      <q-separator color="grey"></q-separator>
      <section class="q-pt-md">
        <div class="row justify-start q-pb-lg">
          <q-btn
            label="Submit"
            @click="doSubmit"
            color="primary"
            class="q-mr-md q-ml-md"
          />
          <q-btn label="Cancel" @click="router.push({ name: 'home' })" />
        </div>
      </section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { public_private_bool } from '../enums';
import { Guild } from '../types';
import { useGuildStore } from '../stores/guilds';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const GuildCardProps = defineProps<{
  currentGuild?: Partial<Guild>;
  showDescription: boolean;
}>();
const $q = useQuasar();
const guildStore = useGuildStore();
const invitation: { label: string; value: boolean }[] = [
  { label: 'open', value: true },
  { label: 'close', value: false },
];

const description = ref<string>('');

const guild = ref<Partial<Guild>>(GuildCardProps.currentGuild || {});

watch(
  () => GuildCardProps.currentGuild,
  (newVal) => {
    guild.value = newVal || {};
  },
  { immediate: true },
);

const doSubmit = async () => {
  try {
    await guildStore.updateGuild(guild.value);
    $q.notify({
      message: 'Guild was updated successfully',
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in updating guild ', err);
    $q.notify({
      message:
        'There was an error updating guild. If this issue persists, contact support.',
      color: 'negative',
    });
  }
};
defineExpose({ doSubmit });
</script>
