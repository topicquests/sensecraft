<template>
  <q-page class="bg-secondary" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-xs q-mt-md" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center q-ma-sm q-pa-xs">
      <div class="col-4 q-ma-sm q-pa-sm" style="width: 55%">
        <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Quest</h4>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-xs" style="width: 55%">
        <q-card class="q-pl-xl">
          <div class="row justify-start">
            <div class="q-gutter-sm">
              <q-option-group
                v-model="quest.public"
                :options="public_private_bool"
                color="primary"
                inline
              >
              </q-option-group>
            </div>
          </div>
          <div class="row justify-start q-pb-lg">
            <q-input v-model="quest.name" label="Name" style="width: 75%" />
          </div>
          <div class="row justify-start q-pb-xs">Details<br /></div>
          <div class="row justify-start q-pb-lg">
            <q-editor v-model="quest.description" style="width: 80%"></q-editor>
          </div>
          <div class="row">
            <p>Enter desired start and end date and time below</p>
          </div>
          <div class="row">
            <div class="col-6">
              <span>Start</span>
              <template>
                <div class="q-pa-md" style="max-width: 300px">
                  <q-input filled v-model="startDate">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date v-model="startDate" mask="MM-DD-YYYY HH:mm">
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>

                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-time
                            v-model="startDate"
                           mask="MM-DD-YYYY HH:mm">
                            format24h
                          >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </template>
            </div>
            <div class="col-6">
              <span>End</span>
              <template>
                <div class="q-pa-md" style="max-width: 300px">
                  <q-input filled v-model="endDate">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date v-model="endDate" mask="MM-DD-YYYY HH:mm">>
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>

                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-time
                            v-model="endDate"
                            mask="MM-DD-YYYY HH:mm">
                            format24h
                          >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </template>
            </div>
          </div>
          <div class="row justify-start q-pb-lg">
            <q-input v-model="quest.handle" label="Handle" style="width: 40%" />
          </div>
          <div class="row justify-start q-pb-lg">
            <q-btn
              label="Submit"
              @click="doSubmit"
              color="primary"
              class="q-mr-md q-ml-md"
            />
            <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { mapActions } from "vuex";
import { Notify } from "quasar";
import { userLoaded } from "../boot/userLoaded";
import { public_private_bool } from "../enums";
import { Quest } from "../types";
import { QuestsActionTypes } from "../store/quests";

@Component<QuestCreatePage>({
  components: {
    scoreboard: scoreboard,
    member: member,
  },
  meta: {
    title: 'Create Quest',
  },
  methods: {
    ...mapActions("quests", ["createQuest", "findquests"]),
  }
})
export default class QuestCreatePage extends Vue {
  createQuest!: QuestsActionTypes["createQuest"];

  group = "public"
  public_private_bool = public_private_bool
  quest: Partial<Quest> = {
    name: "",
    handle: "",
    status: "draft",
    public: true,
    description: "",
  }
  ready = false
  shape = "line"
  submitResult = []
  details = ""
  handle = ""
  type = false

  async doSubmit() {
    const res = await this.createQuest({ data: this.quest });
    Notify.create({
      message: `New quest was created successfully`,
      color: "positive",
    });
    this.$router.push({ name: "quest_edit", params: { quest_id: res.id } });
  }
  async beforeMount() {
    await userLoaded;
    this.ready = true;
  }
};
</script>

<style>
.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
#h4 {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
}
</style>
