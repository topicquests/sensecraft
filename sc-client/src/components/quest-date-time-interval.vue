<template>
  <time :title="refTimeFull">{{ display }}</time>
</template>

<script setup lang="ts">
import { QuestData } from '../types';
import { DateTime } from 'luxon';
import { onMounted } from 'vue';

const QuestDateTimeIntervalProps = defineProps<{
  quest: QuestData;
}>();

let now = DateTime.now();
let start: DateTime = DateTime.fromISO(QuestDateTimeIntervalProps.quest.start);
let end: DateTime = DateTime.fromISO(QuestDateTimeIntervalProps.quest.end);

function display(): string {
  let prefix: string;
  if (now < start) prefix = 'starting ';
  else if (now > end) prefix = 'ended ';
  else prefix = 'ending ';
  return prefix + refTime.toRelative();
};
function refTime(): DateTime {
  if (start > now) return start;
  else return end;
};

function refTimeFull(): string {
  return refTime.toLocaleString(DateTime.DATETIME_FULL);
};


onMounted(() => {
  setInterval(() => {
    now = DateTime.local();
  }, 1000);
});
</script>
