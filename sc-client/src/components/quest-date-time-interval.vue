<template>
  <time :title="refTimeFull">{{ display }}</time>
</template>

<script setup lang="ts">
import { Quest, QuestData } from "../types";
import Vue from "vue";
import { DateTime } from "luxon";
import { onMounted } from "vue";

const QuestDateTimeIntervalProps = defineProps<{
  quest: QuestData;
}>();

let now = DateTime.now();
let start: DateTime = DateTime.fromISO(QuestDateTimeIntervalProps.quest.start);
let end: DateTime = DateTime.fromISO(QuestDateTimeIntervalProps.quest.end);

function refTime(): DateTime {
  if (start > now) 
    return start;
  else 
    return end;
  };

function refTimeFull(): string {
  return refTime.toLocaleString(DateTime.DATETIME_FULL);
};
function display(): string {
  let prefix: string;
  if (now < start) prefix = "starting ";
  else if (now > end) prefix = "ended ";
  else prefix = "ending ";
    return prefix + refTime.toRelative();
  };

onMounted(() =>{
  setInterval(() => {
    now = DateTime.local();
  }, 1000);
});

</script>
