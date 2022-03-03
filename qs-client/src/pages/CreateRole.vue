<template>
 <q-page class="bg-secondary">
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
      <div class="col">
        <div class="row justify-center">
          <role-card
            v-bind:role="newRole"
            :bind:edit="false"
            v-on:createNewRole="createNewRole"
          >
          </role-card>
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
import { mapActions, mapGetters } from "vuex";
import { RoleActionTypes, RoleGetterTypes } from "../store/role";
import { BaseGetterTypes } from "../store/baseStore";
import { Role } from "../types";

@Component<RoleEditPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    roleCard: roleCard,
  },
  computed: {
    ...mapGetters("role", ["getRoleById"]),
  },
  methods: {
    ...mapActions("role", ["ensureRole", "createRole"]),
  },
})
export default class RoleEditPage extends Vue {
  name: "RoleEdit";

  role_id: number;
  isAdmin: Boolean = false;
  newRole: Partial<Role> = {
    name: "",
    permissions: [],
    max_pub_state: null,
    guild_id: null,
  };

  // Declare computed attributes for typescript
  hasPermission!: BaseGetterTypes["hasPermission"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  ensureRole: RoleActionTypes["ensureRole"];
  createRole: RoleActionTypes["createRole"];

  async createNewRole(newRole) {
    try {
      const res = await this.createRole({ data: newRole });
      this.$q.notify({
        message: `Added new role`,
        color: "positive",
      });
      this.$router.push({ name: "role_edit", params: { role_id: res.id } });
    } catch (err) {
      console.log("there was an error in creating role ", err);
      this.$q.notify({
        message: `There was an error creating new role.`,
        color: "negative",
      });
    }
  }

  async beforeMount() {
    this.newRole.guild_id = Number.parseInt(this.$route.params.guild_id);
  }
}
</script>
