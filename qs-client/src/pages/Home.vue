<template>
  <div>
    <q-page>
      <div class="row justify-center text-center">
        <h1 class="text-h1 q-pt-lg q-pr-sm q-pl-sm">SenseCraft</h1>
        <h3 class="text-h3 q-pt-lg q-pb-lg">
          Where teams co-construct structured conversation
        </h3>
      </div>

      <div class="container">
        <q-card class="justify-center" style="width: 100% height:950px">
          <img src="../statics/earthrise2.png" style="width: 100%" />
        </q-card>
        <div class="row wrapper gradient justify-center">
          <q-card class="q-mt-lg">
            <div
              class="row justify-center text-h5 text-center text-bold q-pt-md q-mb-md gt-sm"
            >
              Videos to improve your communication skills
            </div>
            <div
              class="row justify-center text-bold text-center q-pt-md q-mb-md lt-md"
            >
              Videos to improve your communication skills
            </div>

            <div class="row justify-center">
              <div class="col-12 q-video">
                <iframe
                  width="420"
                  height="345"
                  src="https://www.youtube.com/embed/WPF64UXFER0"
                ></iframe>
              </div>
            </div>
          </q-card>
        </div>
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
}
.youtube {
  justify-content: center;
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

video.youtube {
  width: 90%;
  height: auto;
}
#scoreboard {
  width: 900px;
  border: 1px solid blue;
}
@media only screen and (max-width: 600px) {
  video {
    width: 50%;
  }
}
</style>
