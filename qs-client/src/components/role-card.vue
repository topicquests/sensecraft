<template>
  <q-card>
    <q-input type="string"></q-input>
    <div class="row justify-start q-pb-lg">
      <q-btn
        label="Submit"
        @click="doSubmit"
        color="primary"
        class="q-mr-md q-ml-md"
      />
      <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
    </div>
  </q-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { Prop } from "vue/types/options";

const RoleCardProps = Vue.extend({
  props: {},
});

@Component<RoleCard>({
  name: "RoleCard",
})
export default class RoleCard extends RoleCardProps {
  doSubmit() {}
}
</script>
