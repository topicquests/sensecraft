<template>
  <time :title="refTimeFull">{{ display }}</time>
</template>

<script lang="ts">
import { Quest } from "../types";
import { Prop } from "vue/types/options";
import Vue from "vue";
import { DateTime } from "luxon";
import Component from "vue-class-component";

const QuestDateTimeIntervalProps = Vue.extend({
  props: {
    quest: Object as Prop<Quest>,
  },
});

@Component<QuestDateTimeInterval>({
  name: "QuestDateTimeInterval",
  computed: {
    refTime(): DateTime {
      if (this.start > this.now)
        return this.start
      else
        return this.end
    },
    refTimeFull (): string {
      return this.refTime.toLocaleString(DateTime.DATETIME_FULL);
    },
    display(): string {
      let prefix: string;
      if (this.now < this.start)
        prefix = "starting "
      else if (this.now > this.end)
        prefix = "ended "
      else
        prefix = "ending "
      return prefix + this.refTime.toRelative()
    },
  },
})
export default class QuestDateTimeInterval extends QuestDateTimeIntervalProps {
  now = DateTime.now();
  start: DateTime = DateTime.fromISO(this.quest.start);
  end: DateTime = DateTime.fromISO(this.quest.end);
  display!: string;
  refTime!: DateTime;
  refTimeFull!: string;

  mounted() {
    setInterval(() => {
      this.now = DateTime.local();
    }, 1000);
  }
}
</script>
