<template>
  <q-page class="page">
    <div class="col-3 q-md q-mb-md">
      <div v-if="selectedNodeId">
        <!-- cloned from GamePlay-->
        <node-form
          v-if="canEdit(selectedNodeId)"
          v-bind:nodeInput="selectedNode(true)"
          v-bind:allowAddChild="true"
          :editing="true"
          v-bind:ibisTypes="selectedIbisTypes"
          v-on:action="updateNode"
          v-on:addChild="addChild"
        />
        <node-form v-else v-bind:nodeInput="selectedNode()" />
        <q-btn
          v-if="!canEdit(selectedNodeId)"
          @click="addChild()"
          label="Add Child"
        />
      </div>
    </div>
  </q-page>
</template>
<script></script>
<style></style>
