<template>
  <q-page style ="background-color:lightgrey" >
    <div>
      <member></member>
    </div>
    <div class = "row">
      <div class = "col-3">
        <q-select v-model="members.name" :options="membersName">

        </q-select>
      </div>
    </div>
  </q-page>
</template>

<script>
import member from '../components/member.vue'
import {mapActions} from 'vuex'
export default {
   name: 'Admin-app',
   props: {

  },
  data () {
    return {
      members: null,
      options: members,
      membersName: [],
    }
  },
  computed: {

  },
  components: {
    "member": member
  },
  methods: {
    ...mapActions('members', [
      'fetchMembers'
    ]),
    async getAllMembers() {
      const response = await this.fetchMembers();
       debugger;
      this.members = response.data

      this.members.forEach(e => {this.membersName.push(e.name);
      });
       debugger;
    }
  },
  mounted() {
    this.getAllMembers();
  }
}
</script>




