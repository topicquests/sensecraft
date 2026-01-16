<template>
  <div v-if="q.screen.gt.sm">
    <q-card class="gameboard-card q-pa-lg">
      <!-- Header -->
      <div class="row justify-center q-mb-md">
        <p class="title">🎮 Gameboard</p>
      </div>

      <div class="row wrap justify-around items-stretch">

        <!-- Quests -->
        <q-card class="score-card q-pa-md">
          <div class="scoreboard-header">Quests</div>
          <div class="row items-center q-mt-sm">
            <div class="col text-labels">
              <div>Not started</div>
              <div>Playing</div>
              <div>Finished</div>
            </div>
            <div class="col-auto text-values">
              <div>{{ questStats.registration }}</div>
              <div>{{ questStats.ongoing }}</div>
              <div>{{ questStats.finished }}</div>
            </div>
          </div>
        </q-card>

        <!-- Guilds -->
        <q-card class="score-card q-pa-md">
          <div class="scoreboard-header">Guilds</div>
          <div class="row items-center q-mt-sm">
            <div class="col text-labels">
              <div>Total Guilds</div>
              <div>Highest Score</div>
            </div>
            <div class="col-auto text-values">
              <div>{{ animatedTotalGuilds }}</div>
              <div>
                <q-transition name="fade">
                  <span v-if="topGuildByScore" :key="topGuildByScore.id">
                    {{ topGuildByScore.name }} ({{ guildScore(topGuildByScore.id) }})
                  </span>
                  <span v-else>—</span>
                </q-transition>
              </div>
            </div>
          </div>
        </q-card>

        <!-- Players -->
        <q-card class="score-card q-pa-md">
          <div class="scoreboard-header">Players</div>
          <div class="row items-center q-mt-sm">
            <div class="col text-labels">
              <div>Total Players</div>
              <div>Highest Score</div>
            </div>
            <div class="col-auto text-values">
              <div>{{ animatedTotalMembers }}</div>
              <div>
                <q-transition name="fade">
                  <span v-if="topPlayerByScore" :key="topPlayerByScore.id">
                    ({{ playerScore(topPlayerByScore.id) }})
                  </span>
                  <span v-else>—</span>
                </q-transition>
              </div>
            </div>
          </div>
        </q-card>

      </div>
    </q-card>
  </div>

  <div v-else class="text-grey text-center q-pa-md">
    Gameboard available on larger screens
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useMembersStore } from '../stores/members';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { quest_status_enum } from '../enums';

const q = useQuasar();
const status = quest_status_enum;

const questStore = useQuestStore();
const guildStore = useGuildStore();
const membersStore = useMembersStore();

/* =====================
 * Base collections
 * ===================== */
const guilds = computed(() => guildStore.getGuilds);
const members = computed(() => membersStore.getMembers);

const totalGuilds = computed(() => guilds.value.length);
const totalMembers = computed(() => members.value.length);

/* =====================
 * Quest stats
 * ===================== */
const questStats = computed(() => ({
  registration:
    questStore.getQuestsByStatus(status.registration)?.length ?? 0,
  ongoing:
    questStore.getQuestsByStatus(status.ongoing)?.length ?? 0,
  finished:
    questStore.getQuestsByStatus(status.finished)?.length ?? 0,
}));

/* =====================
 * Derived scores
 * ===================== */
function guildScore(guildId: number): number {
  return questStore.getQuests
    .filter(q => q.id === guildId && q.status === status.finished)
    .length;
}

function playerScore(memberId: number): number {
  return questStore.getQuests
    .filter(q => q.id === memberId && q.status === status.finished)
    .length;
}

/* =====================
 * Top scorers
 * ===================== */
const topGuildByScore = computed(() => {
  if (!guilds.value.length) return null;
  return guilds.value.reduce((top, g) =>
    guildScore(g.id) > guildScore(top.id) ? g : top,
  );
});

const topPlayerByScore = computed(() => {
  if (!members.value.length) return null;
  return members.value.reduce((top, m) =>
    playerScore(m.id) > playerScore(top.id) ? m : top,
  );
});

/* =====================
 * Animated numbers
 * ===================== */
function useAnimatedNumber(source: () => number) {
  const animated = ref(0);

  watch(
    source,
    (to, from = 0) => {
      const duration = 400;
      const start = performance.now();

      function tick(time: number) {
        const progress = Math.min((time - start) / duration, 1);
        animated.value = Math.round(from + (to - from) * progress);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    },
    { immediate: true },
  );

  return animated;
}

const animatedTotalGuilds = useAnimatedNumber(() => totalGuilds.value);
const animatedTotalMembers = useAnimatedNumber(() => totalMembers.value);

/* =====================
 * Initialization
 * ===================== */
onMounted(async () => {
  await Promise.all([
    questStore.ensureAllQuests(),
    guildStore.ensureAllGuilds(),
    membersStore.ensureAllMembers(),
  ]);
});
</script>

<style scoped>
.gameboard-card {
  background-color: #000;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
}

.score-card {
  background: #111;
  border-radius: 16px;
  width: 220px;
  margin: 0 16px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.scoreboard-header {
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.text-labels {
  color: #ccc;
  font-size: 14px;
  line-height: 1.8;
}

.text-values {
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  text-align: right;
  line-height: 1.8;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
