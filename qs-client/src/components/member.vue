<template>
  <div class="column items-right" v-if="member">
    <div class="col-12">
      <div class="member q-pr-md">{{ member.handle }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
export default {
  // props: ['member'],
  name: "Member",
  data() {
    return {};
  },

  computed: {
    ...mapState("member", ["member"]),
  },
};
</script>
<style>
.member {
  text-align: right;
  color: blue;
  font-size: 1.5em;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
