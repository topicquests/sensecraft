<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="q-gutter-sm">
        <div
          v-for="guild in getMyGuilds"
          v-bind:data="getMyGuilds"
          v-bind:key="guild.id"
        >
          <q-checkbox
            v-model="guild.check"
            :val="guild.check"
            :value="true"
            :checked="true"
            :label="guild.name"
            :name="guild.handle"
            v-on:click.native="toggleCheckbox(guild.id)"
          />
        </div>
      </div>
    </div>

    <div class="q-px-sm"></div>
    <!-- content -->
  </q-page>
</template>

<script lang="ts">
import { mapActions, mapGetters } from "vuex";
import app from "../App";

export default {
  data() {
    return {
      quest_id: null,
      val: false,
      columns: [
        {
          name: "desc",
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "handle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
          sortable: true,
        },
        {
          name: "public",
          required: false,
          label: "Public",
          align: "left",
          field: "public",
          sortable: true,
        },
        {
          name: "status",
          required: false,
          label: "Status",
          align: "left",
          field: "status",
          sortable: true,
        },
        {
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "created_at",
          sortable: true,
        },
        {
          name: "nodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true,
        },
      ],
    };
  },
  computed: {
    ...mapGetters("guilds", ["getMyGuilds"]),
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
    ...mapActions("guilds", ["ensureQuest"]),
    joinQuest(quest) {},
    toggleCheckbox: function (guild) {},
  },

  async beforeMount() {
    this.quest_id = Number.parseInt(this.$route.params.quest_id);
    await app.userLoaded;
    await Promise.all([
      this.ensureQuest({ quest_id: this.quest_id }),
      this.ensureAllGuilds(),
    ]);
  },
  // name: 'PageName',
};
</script>
