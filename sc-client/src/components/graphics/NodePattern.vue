<template>
  <svg
    class="node-pattern"
    :style="{ color: color, opacity: opacity }"
    viewBox="0 0 800 400"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M40 320 L180 220 L340 260 L480 140 L640 190 L760 90" />
      <path d="M180 220 L220 90 L340 260" />
      <path d="M480 140 L520 40 L640 190" />
      <path d="M40 320 L120 380" />
      <path d="M340 260 L360 380" />
    </g>
    <g fill="currentColor">
      <circle cx="40" cy="320" r="6" />
      <circle cx="180" cy="220" r="8" />
      <circle cx="220" cy="90" r="5" />
      <circle cx="340" cy="260" r="7" />
      <circle cx="480" cy="140" r="9" />
      <circle cx="520" cy="40" r="5" />
      <circle cx="640" cy="190" r="6" />
      <circle cx="760" cy="90" r="5" />
      <circle cx="120" cy="380" r="4" />
      <circle cx="360" cy="380" r="4" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
    opacity?: number;
  }>(),
  {
    color: 'var(--sc-color-primary)',
    opacity: 0.12,
  },
);
</script>

<style scoped>
.node-pattern {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
