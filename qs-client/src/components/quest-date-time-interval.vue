<template>
  <time v-if="ifBeforeQuestStartTime()"> until start {{ display }}</time>
  <time v-else-if="ifDuringQuestPlay()">playing {{ display }} </time>
  <time v-else-if="ifQuestEnded()"> finished {{ endDisplay }}</time>
  <time v-else>error</time>
</template>

<script lang="ts">
import { Quest } from "../types";
import { Prop } from "vue/types/options";
import Vue from "vue";
import { DateTime, Duration } from "luxon";
import Component from "vue-class-component";

const QuestDateTimeIntervalProps = Vue.extend({
  props: {
    quest: Object as Prop<Quest>,
  },
});

@Component<QuestDateTimeInterval>({
  name: "QuestDateTimeInterval",
  computed: {
    remaining() {
      return this.start.diff(this.now).toObject();
    },
    display() {
      return Duration.fromObject(this.remaining).toFormat("MM 'months' dd 'days'  hh 'hours'  mm 'minutes' ss 'seconds'");
    },
    endCompleted() {
      return this.end.diff(this.now).toObject();
    },
    endDisplay() {
      return Duration.fromObject(this.endCompleted).toFormat("MM 'months' dd 'days'  hh 'hours'  mm 'minutes' ss 'seconds'");
    },
  },
})
export default class QuestDateTimeInterval extends QuestDateTimeIntervalProps {
  now = DateTime.now();
  end = DateTime.fromISO(this.quest.end);
  start = DateTime.fromISO(this.quest.start);
  nowToISO = this.now.toISO();
  BeforeQuestStartTime() {
    return this.now;
  }
  DuringQuestPlay() {
    return this.now;
  }
  QuestEnded() {
    return this.now;
  }
  ifBeforeQuestStartTime() {
    if (this.nowToISO < this.quest.start) {
      return true;
    }
    return false;
  }
  ifDuringQuestPlay() {
    if (this.nowToISO > this.quest.start && this.nowToISO < this.quest.end) {
      return true;
    }
    return false;
  }
  ifQuestEnded() {
    if (this.nowToISO > this.quest.end) {
      return true;
    }
    return false;
  }

  mounted() {
    setInterval(() => {
      this.now = DateTime.local();
    }, 1000);
  }
}
</script>
