<template>
  <div>
    <q-page>
      <div class="row justify-center text-center">
        <h1 class="text-h1 q-pt-lg">SenseCraft</h1>
        <h3 class="text-h3 q-pt-lg">
          Where teams co-construct structured conversation
        </h3>
      </div>

      <div class="container">
        <q-card style="width: 100%">
          <div class="row earth-image">
            <img src="../statics/earthrise2.png" style="width: 100%" />
          </div>
        </q-card>
        <div class="row wrapper gradient justify-center">
          <q-card class="youtube q-mt-lg gt-sm" style="width: 35%">
            <div class="row justify-center text-h5 text-bold q-pt-md q-mb-md">
              Videos to improve your communication skills
            </div>
            <div class="row justify-center q-mb-sm">
              <q-video
                src="https://www.youtube.com/embed/WPF64UXFER0"
                style="width: 75%; height: 350px"
              />
            </div>
          </q-card>
        </div>
      </div>

      <div class="row justify-end" style="width: 100%">
        <div class="col-4"></div>
      </div>
    </q-page>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from "vuex";
import { userLoaded } from "../boot/userLoaded";

export default {
  meta: {
    title: "Home",
  },
  name: "HomePage",

  computed: {
    ...mapGetters("member", ["getUserId"]),
  },
  data() {
    return {
      ready: false,
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
.wrapper {
  display: flex;
  padding-bottom: 5em;
}
.signin-card {
  align-items: flex-end;
  padding-left: 2em;
  padding-top: 2em;
}
.earth-image {
  align-items: center;
  width: 100%;
}
.youtube {
  width: 50%;
  height: 50%;
}
.gradient {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(0, 212, 255, 1) 35%,

    rgba(9, 9, 121, 1) 100%
  );
  height: 100%;
}
</style>
