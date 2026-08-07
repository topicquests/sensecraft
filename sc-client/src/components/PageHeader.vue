<template>
  <div class="page-header">
    <q-breadcrumbs v-if="crumbs.length" class="page-header__crumbs" separator="/">
      <q-breadcrumbs-el
        v-for="crumb in crumbs"
        :key="crumb.label"
        :label="crumb.label"
        :to="crumb.to"
      />
    </q-breadcrumbs>
    <div class="page-header__row">
      <div>
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle sc-text-muted">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.actions" class="page-header__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

export interface Breadcrumb {
  label: string;
  to?: RouteLocationRaw;
}

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    breadcrumbs?: Breadcrumb[];
    showHome?: boolean;
  }>(),
  {
    subtitle: '',
    breadcrumbs: () => [],
    showHome: true,
  },
);

const crumbs = computed<Breadcrumb[]>(() => {
  const home: Breadcrumb = { label: 'Home', to: { name: 'root' } };
  return props.showHome ? [home, ...props.breadcrumbs] : props.breadcrumbs;
});
</script>

<style scoped>
.page-header {
  margin-bottom: var(--sc-space-24);
}

.page-header__crumbs {
  font-size: 0.8125rem;
  color: var(--sc-color-text-muted);
  margin-bottom: var(--sc-space-8);
}

.page-header__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sc-space-16);
}

.page-header__title {
  font-size: 2rem;
  font-weight: var(--sc-font-weight-bold);
  margin: 0;
}

.page-header__subtitle {
  margin: var(--sc-space-4) 0 0;
  font-size: 1rem;
}

.page-header__actions {
  display: flex;
  gap: var(--sc-space-8);
  flex-wrap: wrap;
}
</style>
