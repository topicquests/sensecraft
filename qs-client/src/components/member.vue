<template>

  <div class="column items-right">
    <div class="col-12">
      <div class="member q-pr-md">{{this.member.handle}}
      </div>
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'
export default {
  // props: ['member'],
  // name: 'ComponentName',
  data () {
    return {}
  },

  computed: mapState('member', ['member']),
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


