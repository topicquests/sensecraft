<template>
  <q-page style ="background-color:lightgrey" >
    <div>
      <member></member>
    </div>
     <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class = "row q-mt-xl ">
        <div class="col-2 q-ml-xl q-mr-xl">
        <q-select
      v-model='member.handle'
      :options="member"
      option-label="handle"
      option-value="id"
      label="Handle"
      emit-value
      map-options
      id="qselect">
        </q-select>
        </div>
        <div class="col-2">
        <q-checkbox
          v-model="superAdmin"
          label="superAdmin"
          left-label
          name="superadmin"/>
        </div>
        <div class="col-2">
        <q-checkbox
          v-model="createQuest"
           label="createQuest"
          left-label
          name="create-quest"/>
        </div>
        <div class="col-2">
        <q-checkbox
          v-model="createGuild"
          label="createGuild"
          left-label
          name="create-guild"/>
        </div>
        <div class="col-2">
           <q-btn
           color="primary"
           label="Update"
           :enabled="userIsSuperAdmin"
           @click="updatePermissions"
           />
        </div>
      </div>
  </q-page>
</template>

<script>
import member from '../components/member.vue'
import scoreboard from '../components/scoreboard.vue'
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
   name: 'Admin-app',
   props: {

  },
  data () {
    return {
      createQuest: false,
      createGuild: false,
      superAdmin: false,
      userIsSuperAdmin: false,
      member_id: null,
    }
  },
  computed: {
    ...mapGetters([
      'hasPermission'
    ]),
    ...mapGetters('members', [
      'getMemberById'
    ]),
    member: function() {
      return this.getMemberById(this.member_id);
    },
  },
  components: {
    "member": member,
    "scoreboard": scoreboard,
  },
  methods: {
    ...mapActions('members', [
      'fetchMemberById',
      'updateMember',
      ]),
      async updatePermissions() {
        var permissions = this.member.permissions;
        const member = this.getMemberByHandle(this.members.handle);
        if(this.createQuest) {
          permissions.push("createQuest");
        }
        if(this.createGuild) {
          permissions.push("createGuild");
        }
        if (this.superAdmin) {
          permissions.push("superadmin");
        }
        permissions=[...new Set(permissions + member.permissions)];
        await this.updateMember({data: {id: member.id, permissions}})
      },
    },
  async beforeMount() {
    this.member_id = this.$route.params.member_id;
    await this.fetchMemberById({params: {id: this.member_id}});
    this.superAdmin = this.member.permissions.includes('superadmin');
    this.createQuest = this.member.permissions.includes('createQuest');
    this.createGuild = this.member.permissions.includes('createGuild');
    this.userIsSuperAdmin = this.hasPermission('superadmin');
  },
}
</script>
<style>
  #qselect {
    width: 10%;
  }
</style>




