<template>
  <q-card class="flat bordered q-pa-md bg-black">
    <div class="row">
      <div class="col-12">
          <p id="scoreboard-title" >Scoreboard</p>
      </div>
    </div>
    <div class="row">
      <div class="col-3 q-pl-sm">
        <div class="labels">ongoing quests</div>
        <div class="labels">completed quests</div>
      </div>
      <div class="col-4"></div>
      <div class="col-3" >
          <div class="labels">guild leader board</div>
      </div>
    </div>
  </q-card>
</template>
<script>
export default {
   name: 'scoreboard',
  data () {
    return {}
  }
}
</script>
<style>
  .labels {
    color:yellow;
    font-size: 110%;
    text-align: left;
    font-family: Arial, Helvetica, sans-serif;
}

#scoreboard-title {
  text-align:center;
  font-family: Arial, Helvetica, sans-serif;
  font-size:30px;
  color:yellow;
  background-color: black;
}
#scoreboard {
  width: 900px;
  border: 1px solid blue;}
</style>
