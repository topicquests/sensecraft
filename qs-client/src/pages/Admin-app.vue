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
      v-model='members.handle'
      :options="members"
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
    }
  },
  computed: {
    ...mapState('members', {
      members: state => state.members,
    }),
  },
  components: {
    "member": member,
    "scoreboard": scoreboard,
  },
  methods: {
    ...mapActions('members', [
      'fetchMembers',
      'getMemberById',
      'updateMember',
      ]),
      async updatePermissions() {
        let permissions = [];
        const member = await this.getMemberById(this.members.handle);
        if(this.createQuest) {
          permissions.push("createQuest");
        }
        if(this.createGuild) {
          permissions.push("createGuild");
        }
        if (this.superAdmin) {
          permissions.push("superadmin");
        }
        member.permissions=[...permissions]
        await this.updateMember({data: {id: member.id, permissions: member.permissions}})
      },
    },
  async beforeMount() {
    await this.fetchMembers();
  },
}
</script>
<style>
  #qselect {
    width: 10%;
  }
</style>




