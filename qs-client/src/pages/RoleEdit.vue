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
        <h3>Edit Role</h3>
      </div>
      <div class="col">
        <div class="row justify-center">
          <role-card></role-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import roleCard from "../components/role-card.vue";
import { mapActions } from "vuex";
import { RoleActionTypes } from "../store/role";
import { BaseGetterTypes } from "../store/baseStore";

@Component<RoleEditPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    roleCard: roleCard,
  },
  computed: {
    ...mapActions("role", ["ensureRole"]),
  },
})
export default class RoleEditPage extends Vue {
  name: "RoleEdit";

  role_id: number;
  isAdmin: Boolean = false;

  // Declare computed attributes for typescript
  hasPermission!: BaseGetterTypes["hasPermission"];
  ensureRole!: RoleActionTypes["ensureRole"];

  async beforeMount() {
    this.role_id = Number.parseInt(this.$route.params.role_id);
    await this.ensureRole({ role_id: this.role_id });
  }
}
</script>
