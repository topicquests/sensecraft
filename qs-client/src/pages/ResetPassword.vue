<template>
  <q-page class="bg-secondary">
    <q-card border: true class="card fixed-center q-pa-md">
      <q-form>
      <h2>Reset Password</h2>
        <q-input
          class="q-mb-md"
          outlined
          clearable
          v-model="password"
          :type="isPwdReset ? 'password' : 'text'"
          name="password"
          label="New password"
          tabindex="1"
        >
        <template v-slot:append>
          <q-icon
              :tabindex="-1"
              :name="isPwdReset ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwdReset = !isPwdReset"
            />
        </template>
        </q-input>
        <q-input
          outlined
          clearable
          v-model="confirm_password"
          :type="isPwdConfirmed ? 'password' : 'text'"
          name="confirm_password"
          label="Confirm Password"
          tabindex="2"
        >
        <template v-slot:append>
          <q-icon
            :tabindex="-1"
            :name="isPwdConfirmed ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwdConfirmed = !isPwdConfirmed"
            />
        </template>
        </q-input>
        <div class="row justify-center q-pt-lg q-pb-lg">
        <q-btn
            class="align-center"
            label="Reset Password"
            color="primary"
            :tabindex="3"
            @click="updatePassword"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>
<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { mapActions, mapGetters, mapState } from "vuex";
import { MemberActionTypes, MemberGetterTypes, MemberState } from "src/store/member";
import {Member} from "../types"
import { userLoaded } from "../boot/userLoaded";

@Component<PasswordResset>({
  name: "reset-password",
  data() {
    return {
      isPwdReset: true,
      isPwdConfirmed: true
      }
  },
  computed: {
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
    ...mapGetters("member", ["getUserId"]),
  },
  methods: {
    ...mapActions("member", ["renewToken", "ensureLoginUser", "updateUser"]),
  },
})
export default class PasswordResset extends Vue {
  password: string = null;
  confirm_password: string = null;
  isPwdReset: true
  token: string = null;
  memberId: number;
  member: Partial<Member>

  getUserId!: MemberGetterTypes["getUserId"];

  renewToken!: MemberActionTypes["renewToken"];
  ensureLoginUser!: MemberActionTypes["ensureLoginUser"];
  updateUser!: MemberActionTypes["updateUser"];

  async updatePassword() {
    if (!this.password) {
      this.$q.notify({ type: "negative", message: "Missing Password" });
      return;
    }
    if (this.password !== this.confirm_password) {
      this.$q.notify({ type: "negative", message: "Passwords do not match" })
    } else {
      try {
        await this.updateUser({data: {
          id: this.memberId,
          password: this.password,
        }});
      } catch (e) {
        this.$q.notify({ type: "negative", message: "Could not reset the password" });
        console.error(e);
        return;
      }
      this.$q.notify({ type: "positive", message: "Password updated" })
      this.$router.push({ name: "lobby" });
    }
  }
  async verifyToken() {
    try {
      await this.renewToken({ data: { token: this.token } });
      await this.ensureLoginUser();
    } catch(err) {
      this.$q.notify({ type: "negative", message: "Issue with verification. Retry verifying"})
      this.$router.push({name: "confirm_password"})
    }
  }
  async beforeMount() {
    const tokenArg = this.$route.query.token;
    if (tokenArg) {
      this.token = (Array.isArray(tokenArg)) ? tokenArg[0] : tokenArg;
      await this.verifyToken()
    } else {
      await userLoaded;
      if (!this.member) {
        this.$q.notify({ type: "negative", message: "Ask to reset password"});
        this.$router.push({name: "confirm_password"});
      }
    }
  }
}
</script>
<style>
input[type="isPwdReset"] {
  padding: 10px;
  margin: 10px;
  background-color: rgb(235, 247, 238);
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
}
.card {
  width: 40%;
  background-color: whitesmoke);
}
</style>
