<template>

  <div class="column items-right" v-if="member">
    <div class="col-12">
      <div class="member q-pr-md">{{member.handle}}
      </div>
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'
export default {
  // props: ['member'],
  name: 'Member',
  data () {
    return {}
  },

  computed: {
    ...mapState('member', {member: state =>state.member.member}),
  },
}
</script>
<style>
.member {
  text-align: right;
  color: blue;
  font-size: 110%;
  font-family: Arial, Helvetica, sans-serif;
}
</style>


