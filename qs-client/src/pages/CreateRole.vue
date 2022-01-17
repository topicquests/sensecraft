<template>
  <q-page padding>
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="col">
      <div class="row justify-center">
        <h3>Create Role</h3>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";

@Component<CreateRolePage>({
  components: {
    scoreboard: scoreboard,
    member: member,
  },
})
export default class CreateRolePage extends Vue {
  name: "Create";
}
</script>
