<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="column items-right" v-if="ready && memberStore.getUser">
    <div class="col-12">
      <div class="member q-pr-md">{{ memberStore.getUser.handle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMemberStore } from 'src/stores/member';
import { onBeforeMount, ref } from 'vue';

const memberStore = useMemberStore();
let ready = ref(false);
 
onBeforeMount( async () =>{
  await memberStore.ensureLoginUser;
  ready.value = true;
})

</script>
<style>
.member {
  text-align: right;
  font-size: 1.2em;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
