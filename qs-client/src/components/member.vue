<template>
  <div class="column items-right" v-if="member">
    <div class="col-12">
      <div class="member q-pr-md">{{ getUser.handle }}</div>
    </div>
  </div>
</template>

<script lang='ts'>
import { MemberActionTypes, MemberGetterTypes } from 'src/store/member';
import { MemberState } from 'src/store/member';
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState, mapActions, mapGetters } from "vuex";

@Component<MemberComponent> ({
  name: "memberHandle",
   computed: {
    ...mapState("member", ["member"]),
    ...mapGetters("member", ["getUser"])
  },
  methods: {
    ...mapActions('member', ["ensureLoginUser"])
  }
})

export default class MemberComponent extends Vue {
  member: MemberState;
  getUser!: MemberGetterTypes['getUser']

  ensureLoginUser: MemberActionTypes["ensureLoginUser"]
  async beforeMount(){
    await this.ensureLoginUser
  }
 
};
</script>
<style>
.member {
  text-align: right;
  color: blue;
  font-size: 1.2em;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
