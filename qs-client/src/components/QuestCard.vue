<template>
  <q-card class="items-center">
    <div class="row justify-start q-pa-lg q-ml-lg q-gutter-sm">
      <q-option-group
        v-bind="quest.public"
        :options="public_private_bool"
        color="primary"
        inline
      >
      </q-option-group>
    </div>
    <div class="q-pa-md q-gutter-sm">
      <q-btn-group>
        <q-btn
          v-bind="quest.status"
          v-if="quest.status != 'draft'"
          color="grey"
          text-color="black"
          label="draft"
          :disable="true"
        />
        <q-btn
          v-bind="quest.status"
          v-else
          color="yellow"
          text-color="black"
          label="draft"
        />
        <q-btn
          v-bind="quest.status"
          v-if="
            quest.status != 'draft' &&
            quest.status != 'registration'
          "
          color="grey"
          text-color="black"
          label="registration"
          :disable="true"
        />
        <q-btn
          v-bind="quest.status"
          v-else-if="quest.status == 'draft'"
          color="green"
          text-color="black"
          label="registration"
          value="registration"
          @click="updateStatus('registration')"
        />
        <q-btn
          v-bind="quest.status"
          v-else
          color="red"
          text-color="black"
          label="registration"
        />
        <q-btn
          v-bind="quest.status"
          v-if="
            quest.status != 'draft' &&
            quest.status != 'registration' &&
            quest.status != 'ongoing'
          "
          color="grey"
          text-color="black"
          label="ongoing"
          :disable="true"
        />
        <q-btn
          v-bind="quest.status"
          v-else-if="quest.status == 'registration'"
          color="green"
          text-color="black"
          label="Start"
          @click="updateStatus('ongoing')"
        />
        <q-btn
          v-bind="quest.status"
          v-else
          color="red"
          text-color="black"
          label="Start"
        />
        <q-btn
          v-bind="quest.status"
          v-if="
            quest.status != 'draft' &&
            quest.status != 'registration' &&
            quest.status != 'ongoing'
          "
          color="grey"
          text-color="black"
          label="finished"
          :disable="true"
        />
        <q-btn
          v-bind="quest.status"
          v-else-if="quest.status == 'ongoing'"
          color="green"
          text-color="black"
          label="finished"
          @click="updateStatus('finished')"
        />
        <q-btn
          v-bind="quest.status"
          v-else
          color="red"
          text-color="black"
          label="finished"
        />
      </q-btn-group>
    </div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <p style="color: black; background-color: white">
        Status: {{ quest.status }}
      </p>
    </div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <q-input
        class="field-name"
        v-bind="quest.name"
        label="Quest name"
        style="width: 350px"
      />
    </div>
    <div class="row justify-start q-pb-xs q-ml-lg">Description<br /></div>
    <div class="row justify-start q-pb-lg q-ml-lg">
      <q-editor v-bind="quest.description" class="q-editor"></q-editor>
    </div>
    <div class="row">
      <div class="col-6 q-pl-md">
        <span>Start</span>
      </div>
      <div class="col-6 q-pl-md">
        <span>End</span>
      </div>
    </div>
    <div class="row">
      <template>
        <div class="col-6">
          <div class="q-pa-md" style="max-width: 400px">
            <q-input filled v-bind="quest.start">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-bind="quest.start" mask="YYYY-MM-DD HH:mm">
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
                    <q-time v-bind="quest.start" mask="YYYY-MM-DD HH:mm">
                      format24h >
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
        </div>
      </template>
      <div class="col-6">
        <template>
          <div class="q-pa-md" style="max-width: 400px">
            <q-input filled v-bind="quest.end">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-bind="quest.end" mask="YYYY-MM-DD HH:mm"
                      >>
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
                    <q-time v-bind="quest.end" mask="YYYY-MM-DD HH:mm">
                      format24h >
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
    <div class="row justify-start q-pb-lg q-ml-lg">
      <span label="Handle">{{ quest.handle }}</span>
    </div>
    <div class="row justify-center q-pb-lg">
      <q-btn
        label="Submit"
        @click="doSubmitQuest"
        color="primary"
        class="q-mr-md q-ml-md"
      />
      <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
    </div>
  </q-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { Prop } from "vue/types/options";
import { Quest } from "../types";
import { mapActions, mapGetters } from "vuex";
import { quest_status_list, public_private_bool } from "../enums";
import { QuestsActionTypes, QuestsGetterTypes } from "../store/quests";
import { DateTime } from "luxon";

const QuestCardProps = Vue.extend({
  props: {
    quest: Object as Prop<Quest>,
    edit: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
  },
});

@Component<QuestCard>({
  name: "QuestCard",

  components: {

  },
  methods: {
    ...mapActions("quests", ["upDateQuest"]),
  },
})

export default class QuestCard extends QuestCardProps {
  public_private_bool = public_private_bool;
  quest_status_list = quest_status_list;
  publication_state_list;

  // declare the computed attributes for Typescript

  // declare the method attributes for Typescript
  updateQuest: QuestsActionTypes["updateQuest"];

  updateStatus(value) {
    const dt = DateTime.now();
    if (value == "registration") {
      this.$q.notify({
        message: "Don't forget to create first conversation node",
        color: "positive",
      });
    }
    if (value == "ongoing") {
      this.quest.start = dt.toString();
    }
    if (value == "finished") {
      this.quest.end = dt.toString();
    }
    this.quest.status = value;
  }
  validateStartEnd() {
    if (this.quest.start < this.quest.end) {
      return true;
    }
    return false;
  }

  async doSubmitQuest() {
    try {
      if (!this.validateStartEnd()) {
        throw "End date is before start date";
      }
      const questUpdateResponse = await this.updateQuest({
        data: this.quest,
      });
      this.$q.notify({
        message: "Quest was updated successfully",
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating quest ", err);
      this.$q.notify({
        message: `There was an error updating quest. If this issue persists, contact support.`,
        color: "negative",
      });
    }
  }
}
</script>
