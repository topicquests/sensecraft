<template>
  <q-dialog
    v-model="showDialog" persistent>
    <q-card class="custom-dialog">
      <q-card-section class="text-center">
        <h2>Guild Page Instructions</h2>
      </q-card-section>
      <q-card-actions class="flex justify-center">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">

const showDialog = defineModel<boolean>();
</script>
<style scoped>
.custom-dialog {
  max-width: 600px;
  width: 90%;  /* Makes it responsive */
  max-height: 80vh;
}
</style>
