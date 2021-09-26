<template>
  <q-page padding>
    <div class="column items-center" v-if="potentialQuests.length > 0">
      <div class="col-4" style="width: 900px">
        <q-card>
          <h2>
            {{ getCurrentGuild.name }}
            <router-link
              :to="{ name: 'guild', params: { guild_id: currentGuildId } }"
              style="font-size: smaller"
              >Guild</router-link
            >
          </h2>
          <q-table
            title="Potential Quests"
            :data="potentialQuests"
            :columns="columns1"
            row-key="desc"
            id="quest_table"
          >
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{ props.row.name }}</q-td>
                <q-td key="handle" :props="props">{{ props.row.handle }}</q-td>
                <q-td key="status" :props="props">{{ props.row.status }}</q-td>
                <q-td key="start" :props="props">{{ props.row.start }}</q-td>
                <span v-if="findPlayOfGuild(props.row.game_play)">
                  <span
                    v-if="
                      findPlayOfGuild(props.row.game_play).status ==
                      'invitation'
                    "
                  >
                    <q-td key="questNodeId" auto-width :props="props">
                      <q-btn
                        label="Invitation"
                        @click="doRegister(props.row.id)"
                        class="q-mr-md q-ml-md"
                      />
                    </q-td>
                  </span>
                  <span
                    v-if="
                      findPlayOfGuild(props.row.game_play).status == 'requested'
                    "
                  >
                    <q-td key="questNodeId" auto-width :props="props">
                      Waiting for response
                    </q-td>
                  </span>
                </span>
                <span
                  v-if="
                    !props.row.game_play.find(function (gp) {
                      return gp.guild_id == currentGuildId;
                    })
                  "
                >
                  <q-td key="questNodeId" auto-width :props="props">
                    <q-btn
                      label="Register"
                      @click="doRegister(props.row.id)"
                      class="q-mr-md q-ml-md"
                    />
                  </q-td>
                </span>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import member from "../components/member.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import app from "../App";

export default {
  props: ["guild_id"],
  data() {
    return {
      columns1: [
        {
          name: "desc",
          required: true,
          label: "Quest",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "status",
          required: false,
          label: "Handle",
          align: "left",
          field: "status",
          sortable: true,
        },
        {
          name: "handle",
          required: false,
          label: "Status",
          align: "left",
          field: "handle",
          sortable: true,
        },
        {
          name: "start",
          required: false,
          label: "Start Date",
          align: "left",
          field: "start",
          sortable: true,
        },
        {
          name: "questNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true,
        },
      ],
      guildGamePlays: [],
      pastQuests: [],
      activeQuests: [],
      potentialQuests: [],
      questGamePlay: [],
      isAdmin: false,
      members: [],
      label: "",
      questId: null,
      gamePlay: null,
      selectedNode: null,
      focusNode: null,
    };
  },
  name: "guild_admin",
  computed: {
    ...mapState("member", {
      member: (state) => state.member,
      memberId: (state) => state.member?.id,
    }),
    ...mapState("guilds", {
      currentGuildId: (state) => state.currentGuild,
    }),
    ...mapGetters("quests", ["getQuests", "getQuestById"]),
    ...mapGetters("guilds", ["getCurrentGuild"]),
    ...mapGetters(["hasPermission"]),
  },
  methods: {
    ...mapActions("quests", ["ensureAllQuests", "addGamePlay"]),
    ...mapActions("guilds", [
      "ensureGuild",
      "getMembersByGuildId",
      "setCurrentGuild",
    ]),
    async initialize() {
      await this.setCurrentGuild(this.guildId);
      // should be useful but unused for now
      // const memb = await this.getGuildMembers();
      const playQuestIds = this.getCurrentGuild.game_play.map(
        (gp) => gp.quest_id
      );
      this.guildGamePlays = this.getCurrentGuild.game_play.filter(
        (gp) => gp.status == "confirmed"
      );
      const confirmedPlayQuestIds = this.guildGamePlays.map(
        (gp) => gp.quest_id
      );
      this.potentialQuests = this.getQuests.filter(
        (q) =>
          (q.status == "registration" || q.status == "ongoing") &&
          !confirmedPlayQuestIds.includes(q.id)
      );
      this.pastQuests = this.getQuests.filter(
        (q) =>
          (q.status == "finished" || q.status == "scoring") &&
          playQuestIds.includes(q.id)
      );
      this.activeQuests = this.getQuests.filter(
        (q) =>
          (q.status == "ongoing" ||
            q.status == "paused" ||
            q.status == "registration") &&
          confirmedPlayQuestIds.includes(q.id)
      );
    },
    async doRegister(questId) {
      try {
        this.questId = questId;
        const regQuest = await this.getQuestById(questId);
        if (["ongoing", "registration"].indexOf(regQuest.status) < 0) {
          throw `Can not register quest in ${regQuest.status} status`;
        }
        let payload = {
          guild_id: this.currentGuildId,
          quest_id: questId,
        };
        await this.addGamePlay({ data: payload });
        this.$q.notify({
          type: "positive",
          message: "You have registered to Quest ",
        });
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: `${err}`,
        });
        console.log("error registering to quest: ", err);
      }
    },
    findPlayOfGuild(gamePlays) {
      if (gamePlays)
        return gamePlays.find((gp) => gp.guild_id == this.currentGuildId);
    },
  },
  async beforeMount() {
    this.guildId = this.$route.params.guild_id;
    await app.userLoaded;
    await Promise.all([this.ensureGuild(this.guildId), this.ensureAllQuests()]);
    this.isAdmin = this.hasPermission("guildAdmin", this.currentGuildId);
    const canRegisterToQuest = this.hasPermission(
      "joinQuest",
      this.currentGuildId
    );
    if (!canRegisterToQuest) {
      this.$router.push({ name: "guild", guild_id: this.guildId });
    }
    await this.initialize();
  },
};
</script>
