<template>
  <q-page padding>
    <div class="instructions-page">
      <div class="page-title">{{ title }}</div>
      <div class="instruction-category">
        <slot />
      </div>
      <div class="back-link">
        <router-link :to="{ name: 'instructions' }">
          ← Back to all instructions
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<style scoped>
.instructions-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

.instruction-category {
  margin-bottom: 20px;
}

.instruction-category :deep(.instruction-category-title) {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 18px;
  margin-bottom: 10px;
}

.instruction-category :deep(p) {
  color: #333;
  line-height: 1.6;
}

.instruction-category :deep(.status-list) {
  list-style-type: disc;
  padding-left: 20px;
  font-size: 1rem;
  color: black;
  line-height: 1.6;
}

.instruction-category :deep(.status-list li) {
  color: gray;
  margin-bottom: 8px;
}

.instruction-category :deep(.status-list strong) {
  font-weight: bold;
  color: #333;
}

.instruction-category :deep(ol) {
  padding-left: 22px;
  line-height: 1.7;
  color: #333;
}

.instruction-category :deep(ol li) {
  margin-bottom: 8px;
}

.back-link {
  margin-top: 20px;
  text-align: center;
}

.back-link a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.back-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .instructions-page {
    padding: 15px;
  }
  .instruction-category :deep(.status-list) {
    font-size: 0.9rem;
    padding-left: 15px;
  }
}
</style>
