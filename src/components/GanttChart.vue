<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useOkrsStore } from '@/store/okrs';
import { useActiveObjectiveStore } from '@/store/activeObjective';
import { useGanttChart } from '@/composables/gantt';
import { dateLongCompact } from '@/util';
import ObjectiveLinkCard from '@/components/ObjectiveLinkCard.vue';

const router = useRouter();

const okrsStore = useOkrsStore();
const { period, objectives, isLoading, workbenchObjectives } = storeToRefs(okrsStore);
const { addWorkbenchObjective, removeWorkbenchObjective, clearWorkbenchObjectives } =
  okrsStore;
const { objective: activeObjective } = storeToRefs(useActiveObjectiveStore());

const ganttObjectives = computed(() => {
  const timelineObjectives = [...objectives.value];

  // Keep currently active objective as a "ghost" until dismissed after
  // it's lifted or archived
  if (
    activeObjective.value &&
    !timelineObjectives.find((o) => o.id === activeObjective.value.id)
  ) {
    timelineObjectives.push(activeObjective.value);
  }

  return timelineObjectives;
});

const {
  objectiveGroups,
  objectivesInPeriod,
  inCurrentPeriod,
  months,
  todayStyle,
  monthStyle,
  periodStyle,
  tickStyle,
  objectiveStyle,
  startDrag,
} = useGanttChart(period, isLoading, ganttObjectives);

const todayAnchor = ref(null);
const periodAnchor = ref(null);

watch(period, async () => {
  await nextTick();
  if (periodAnchor.value) {
    periodAnchor.value.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }
});

watch(isLoading, async () => {
  if (!isLoading.value && !activeObjective.value) {
    await nextTick();
    const anchor = periodAnchor.value || todayAnchor.value;
    anchor.scrollIntoView({ inline: 'center', behavior: 'instant' });
  }
});

watch(activeObjective, scrollToObjective, { immediate: true });

function isActive(objective) {
  return activeObjective.value && activeObjective.value.id === objective.id;
}

function isChecked(objective) {
  return workbenchObjectives.value.map((o) => o.id).includes(objective.id);
}

function isGhostObjective(objective) {
  return !objectives.value.find((o) => o.id === objective.id);
}

function selectObjective(objective) {
  // If the workspace is empty, and another objective is currently active,
  // replace the objective pane with the workspace pane and add both objectives
  if (
    !workbenchObjectives.value.length &&
    activeObjective.value &&
    objective.id !== activeObjective.value.id
  ) {
    // Close currently active objective if next objective is selected for
    // the workbench
    const activeObjectiveId = activeObjective.value.id;
    router.push({ name: 'ItemHome' });

    // Add both objectives to the workbench using `setTimeout` to give the
    // browser a chance to "catch up" while toggling panes
    setTimeout(async () => {
      await Promise.all([activeObjectiveId, objective.id].map(addWorkbenchObjective));
      await scrollToObjective(objective);
    });
    return;
  }

  // Add selected objective to the workbench
  addWorkbenchObjective(objective.id);

  if (activeObjective.value && objective.id !== activeObjective.value.id) {
    // Replace any currently active objective with the one newly selected
    router.replace({
      name: 'ObjectiveHome',
      params: { objectiveId: objective.id },
    });
  }

  scrollToObjective(objective);
}

function unselectObjective(objective) {
  // Remove objective from workbench
  removeWorkbenchObjective(objective.id);

  // Set next workbench objective as active if available
  if (activeObjective.value?.id === objective.id) {
    if (workbenchObjectives.value.length) {
      router.replace({
        name: 'ObjectiveHome',
        params: { objectiveId: workbenchObjectives.value[0].id },
      });
    } else {
      router.push({ name: 'ItemHome' });
    }
  }
}

function beforeObjectiveNavigate(objective) {
  return async (event) => {
    const modifierKey = event.metaKey || event.altKey;

    if (!modifierKey && !workbenchObjectives.value.length) {
      return;
    }

    // Prevent default link navigation when selecting/unselecting
    // objectives for the workbench
    event.preventDefault();

    toggleObjective(
      !workbenchObjectives.value.find((o) => o.id === objective.id),
      objective
    );
  };
}

function toggleObjective(checked, objective) {
  if (checked) {
    selectObjective(objective);
  } else {
    unselectObjective(objective);
  }
}

async function scrollToObjective(objective) {
  if (!objective) {
    return;
  }

  await nextTick();

  const objectiveElQuery = document.querySelectorAll(`[data-id="${objective.id}"]`);

  if (objectiveElQuery.length) {
    // Delay `scrollIntoView` until the next event cycle. This seems to be
    // necessary when `behavior` is set to `smooth` in Chrome.
    setTimeout(() => {
      objectiveElQuery[0].scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
      });
    });
  }
}

function onObjectiveMounted(objective) {
  // Scroll to active objective when first mounted in the timeline.
  if (objective.id === activeObjective.value?.id) {
    scrollToObjective(objective);
  }
}

async function periodObjectivesToWorkbench() {
  // Reset and add all objectives within current period to the workbench
  clearWorkbenchObjectives();

  if (!objectivesInPeriod.value.length) {
    return;
  }

  objectivesInPeriod.value.map((o) => o.id).forEach(addWorkbenchObjective);

  // Replace any currently active objective with first from workbench if it
  // is not part of the selection
  if (
    activeObjective.value &&
    !objectivesInPeriod.value.find((o) => o.id === activeObjective.value.id)
  ) {
    await router.replace({
      name: 'ObjectiveHome',
      params: { objectiveId: objectivesInPeriod.value[0].id },
    });
  }

  if (periodAnchor.value) {
    await nextTick();
    periodAnchor.value.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }
}
</script>

<template>
  <div class="gantt">
    <div class="gantt__inner">
      <div class="month-wrapper" @mousedown="startDrag">
        <div
          v-if="!isLoading"
          ref="todayAnchor"
          class="today pkt-txt-14-medium"
          :style="todayStyle"
        >
          {{ $t('general.today') }}
        </div>
        <div class="months">
          <div
            v-for="m in months"
            :key="m.valueOf()"
            class="month pkt-txt-12-medium"
            :style="monthStyle(m)"
          >
            <span v-if="!isLoading">{{ dateLongCompact(m) }}</span>
          </div>
        </div>
        <div class="ticks">
          <span class="ticks__padding"></span>
          <div
            v-for="m in months"
            :key="m.valueOf()"
            class="ticks__tick"
            :style="tickStyle(m)"
          ></div>
          <span class="ticks__padding"></span>
        </div>
        <!--
          This is only here as a reference for `scrollIntoView`. Scrolling to
          the `.period` element risks scrolling vertically.
        -->
        <div
          v-if="period.startDate"
          ref="periodAnchor"
          class="period-ref"
          :style="periodStyle"
        ></div>
        <div class="sep" :class="{ loading: isLoading }">
          <div
            v-if="!isLoading && period.startDate"
            v-tooltip="{
              content: objectivesInPeriod.length
                ? $t('general.selectObjectivesInPeriod')
                : $t('general.noObjectivesInPeriod'),
              delay: 750,
            }"
            :class="[
              'sep__period',
              { 'sep__period--clickable': objectivesInPeriod.length },
            ]"
            :style="periodStyle"
            @click="periodObjectivesToWorkbench"
          ></div>
        </div>
      </div>
      <template v-if="!isLoading">
        <div v-if="period.startDate" class="period" :style="periodStyle"></div>
        <div v-for="group in objectiveGroups" :key="group.i" class="objective-row">
          <template v-for="o in group.objectives" :key="o.objective.id">
            <Suspense @resolve="onObjectiveMounted(o.objective)">
              <ObjectiveLinkCard
                :objective-id="o.objective.id"
                :tabindex="o.tabindex"
                :style="objectiveStyle(o)"
                :checkable="
                  !isGhostObjective(o.objective) && workbenchObjectives.length > 0
                "
                :checked="isChecked(o.objective)"
                :dashed="isGhostObjective(o.objective)"
                :dimmed="
                  !inCurrentPeriod(o.objective) &&
                  !isActive(o.objective) &&
                  !isChecked(o.objective)
                "
                :active="isActive(o.objective)"
                :data-id="o.objective.id"
                :before-navigate="beforeObjectiveNavigate(o.objective)"
                @toggle="toggleObjective($event, o.objective)"
              />
            </Suspense>
          </template>
        </div>
      </template>
      <div v-if="!isLoading" class="today-tick" :style="todayStyle"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gantt {
  --tick-width: 3px;
  --sep-height: 11px;
  --sep-border-width: 1px;
  --end-padding: 75px;
  --period-offset-top: 60px;

  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  background-color: var(--color-gray-light);

  &__inner {
    position: relative;
    flex: 1 0 auto;
    padding-bottom: 1.5rem;
  }
}

.month-wrapper {
  position: sticky;
  top: 0;
  z-index: 2;
  display: inline-block;
  min-width: 100%;
  padding-top: 1.5rem;
  background-color: var(--color-white);
  cursor: col-resize;
}

.months {
  display: inline-flex;
  margin-left: var(--end-padding);
}

.month {
  position: relative;
  z-index: 1;
  height: 1rem;
  user-select: none;

  span {
    position: absolute;
    transform: translateX(calc(var(--tick-width) / 2 - 50%));
  }
}

.ticks {
  display: flex;

  .ticks__tick {
    position: relative;
    z-index: 1;
    height: 0.75rem;
    border-left: var(--tick-width) solid var(--color-primary);

    &:last-of-type {
      flex-basis: var(--tick-width) !important;
    }
  }

  .ticks__padding {
    flex: 0 0 var(--end-padding);

    &:last-of-type {
      flex-basis: var(--end-padding);
    }
  }
}

.sep {
  height: var(--sep-height);
  background: rgba(42, 40, 89, 0.25); // blue-dark, 25%;
  border-top: var(--sep-border-width) solid var(--color-primary);

  .sep__period {
    height: calc(var(--sep-height) - var(--sep-border-width));
    background: var(--color-primary);

    &--clickable {
      cursor: pointer;
    }
  }

  &.loading {
    animation: loading 0.5s alternate infinite;
  }
}

.today {
  position: absolute;
  top: 0;
  z-index: 2;
  display: inline-block;
  height: 1.5rem;
  color: var(--color-active);

  &::after {
    position: absolute;
    top: 3.125rem;
    left: calc(50% - 0.1rem);
    height: 1.125rem;
    border-left: var(--tick-width) solid var(--color-active);
    content: '';
  }
}

.today-tick {
  position: absolute;
  top: 3rem;
  height: calc(100% - 3rem);
  border-left: var(--tick-width) dashed var(--color-active);
}

.period-ref {
  position: absolute;
  top: 0;
}

.period {
  position: absolute;
  top: var(--period-offset-top);
  height: calc(100% - var(--period-offset-top));
  background-color: rgba(42, 40, 89, 0.15); // blue-dark, 15%
}

.objective-row {
  display: flex;
  align-items: flex-start;
  margin: 1rem 0;
}

:deep(.objective-link-card) {
  --card-bg-color: var(--color-white);

  position: relative;
  z-index: 1;
  height: 10rem;
  overflow: hidden;
}

:deep(.objective-link-card--active) {
  --card-bg-color: var(--color-blue-5);
}

:deep(.objective-link-card__inner) {
  justify-content: space-between;

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    width: 1rem;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--card-bg-color) 75%,
      var(--card-bg-color) 100%
    );
    content: '';
  }
}

:deep(.objective-link-card__name) {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
}

@keyframes loading {
  0% {
    background: var(--color-grayscale-20);
  }
  100% {
    background: var(--color-grayscale-10);
  }
}
</style>
