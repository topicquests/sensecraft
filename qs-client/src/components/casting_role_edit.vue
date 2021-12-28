<template>
  <div>My component</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const CastingRoleEditProps = Vue.extend({
  props: {},
});

@Component<CastingRoleEdit>({
  name: "CastingRoleEdit",
  computed: {},
})
export default class CastingRoleEdit extends CastingRoleEditProps {}
</script>
