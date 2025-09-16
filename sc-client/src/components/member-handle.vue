<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="column items-right" v-if="ready && user">
    <div class="col-4">
      <div class="member q-pr-md">
        {{ handle }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMemberStore } from '../stores/member';
import { computed, onBeforeMount, ref } from 'vue';

const memberStore = useMemberStore();
const ready = ref(false);

const user = computed(() => memberStore.getUser);
const handle = computed(() => memberStore.getUser!.handle);

onBeforeMount(async () => {
  await memberStore.ensureLoginUser();
  ready.value = true;
});
</script>

<style>
.member {
  display: inline-block;
  background: #fff;
  padding: 6px 12px;
  border-radius: 12px;
  font-family: Arial, Helvetica, sans-serif;
  color: red; /* subtle shadow */
}
</style>
