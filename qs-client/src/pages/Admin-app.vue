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
          label="createGuilde"
          left-label
          name="create-guild"/>
        </div>
        <div class="col-2">
           <q-btn
           color="primary"
           label="Update"
           />
        </div>
      </div>
  </q-page>
</template>

<script>
import member from '../components/member.vue'
import scoreboard from '../components/scoreboard.vue'
import {mapActions, mapState} from 'vuex'
export default {
   name: 'Admin-app',
   props: {

  },
  data () {
    return {
      createQuest: null,
      createGuild: null,
      superAdmin: null,
    }
  },
  computed: {
    ...mapState('members', {
      members: state => state.members,
    })
  },
  components: {
    "member": member,
    "scoreboard": scoreboard,
  },
  methods: {
    ...mapActions('members', [
      'fetchMembers'
    ]),
  },
  async created() {
    await this.fetchMembers();

  }
}
</script>
<style>
  #qselect {
    width: 10%;
  }
</style>




