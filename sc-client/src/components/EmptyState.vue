<template>
  <div class="sc-empty-state" role="status">
    <q-icon :name="icon" />
    <div class="text-h6">{{ title }}</div>
    <p v-if="description" class="sc-empty-state__description">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="sc-empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description?: string;
  }>(),
  {
    icon: 'inbox',
    description: '',
  },
);
</script>

<style scoped>
.sc-empty-state__description {
  max-width: 32em;
  margin: 0;
}

.sc-empty-state__action {
  margin-top: var(--sc-space-8);
}
</style>
