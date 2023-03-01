<template>
  <div>
    <q-page class=".page1">
      <div class="row justify-center text-center">
        <h1 class="text-h1 q-pt-lg">SenseCraft</h1>
        <h3 class="text-h3 q-pt-lg">
          Where teams co-construct structured conversation
        </h3>
      </div>
      <div class="wrapper gradient">
        <div class="signin-card" v-if="!getUserId">
          <signinCard></signinCard>
        </div>
        <div v-else class="signin-card">
          <q-card style="width: 20em"> </q-card>
        </div>

        <div class="earth-image q-ma-md">
          <img
            src="../statics/earthrise2.png"
            style="margin-left: auto; margin-right: auto"
          />
          <div class="text-h5 text-bold q-pt-md" style="margin-left: 17%">
            Videos to improve your communication skills
          </div>

          <div class="youtube">
            <q-card class="my-card">
              <q-video
                src="https://www.youtube.com/embed/WPF64UXFER0"
                style="height: 300px"
              />
            </q-card>
          </div>
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
import SigninCard from "../components/signin-card.vue";

export default {
  meta: {
    title: "Home"
  },
  name: "HomePage",
  components: {
    signinCard: SigninCard
  },

  computed: {
    ...mapGetters("member", ["getUserId"])
  },
  data() {
    return {
      ready: false,
      payload: 100
    };
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
    ...mapActions("quests", ["ensureAllQuests"])
  },

  async beforeMount() {
    await userLoaded;
    // is this needed here?
    // await Promise.all([
    //   this.ensureAllQuests(),
    //   this.ensureAllGuilds(),
    // ])
    this.ready = true;
  }
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
  align-self: flex-start;
  align-items: center;
  padding-left: 5em;
}
.youtube {
  width: 50%;
  height: 50%;
  margin-left: 20%;
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
