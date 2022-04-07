<template>
  <q-page class="bg-secondary">
    <div class="row justify-center text-center">
      <h1 class="text-h1 q-pt-lg">SenseCraft</h1>
      <h3 class="text-h3 q-pt-lg q-pb-lg">
        Where teams co-construct structured conversation
      </h3>
    </div>
    <div class="row justify-center">
      <img
        class="q-pt-xl q-pb-lb"
        src="../statics/earthrise2.png"
        style="margin-left: auto; margin-right: auto"
      />
    </div>
    <div class="row q-pb-sm q-pt-xl q-md-lg">
      <div class="text-h5 text-bold q-px-sm q-pt-md">
        Videos to improve your communication skills
      </div>
    </div>

    <div class="row q-pt-xs">
      <div class="col-12 col-md q-pa-md">
        <q-card class="my-card">
          <q-video
            src="https://www.youtube.com/embed/WPF64UXFER0"
            style="height: 300px"
          />
        </q-card>
      </div>

      <div class="col-12 col-md q-pa-md">
        <q-card class="my-card">
          <q-video
            src="https://www.youtube.com/embed/WPF64UXFER0"
            style="height: 300px"
          />
        </q-card>
      </div>

      <div class="col-12 col-md">
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-video
              src="https://www.youtube.com/embed/WPF64UXFER0"
              style="height: 300px"
            />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapActions } from "vuex";
import { userLoaded } from "../boot/userLoaded";

export default {
  name: "HomePage",
  ready: false,
  data() {
    return {
      payload: 100,
    };
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
    ...mapActions("quests", ["ensureAllQuests"]),
  },

  async beforeMount() {
    await userLoaded;
    // is this needed here?
    // await Promise.all([
    //   this.ensureAllQuests(),
    //   this.ensureAllGuilds(),
    // ])
    this.ready = true;
  },
};
</script>

<style lang="scss" scoped>
.p1 {
  font: italic 20px Arial, sans-serif;
}
</style>
