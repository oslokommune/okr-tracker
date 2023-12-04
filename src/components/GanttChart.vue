<template>
  <div class="gantt">
    <div class="gantt__inner">
      <div class="month-wrapper" @mousedown="startDrag">
        <div
          v-if="!loading"
          ref="today"
          class="today pkt-txt-14-medium"
          :style="todayStyle()"
        >
          {{ $t('general.today') }}
        </div>
        <div class="months">
          <div
            v-for="m in months"
            :key="m.valueOf()"
            class="month pkt-txt-12-medium"
            :style="`width: ${getDaysInMonth(m) * PPD}px`"
          >
            <span v-if="!loading">{{ dateLongCompact(m) }}</span>
          </div>
        </div>
        <div class="ticks">
          <span class="ticks__padding"></span>
          <div
            v-for="m in months"
            :key="m.valueOf()"
            class="ticks__tick"
            :style="`flex: 0 0 ${getDaysInMonth(m) * PPD}px`"
          ></div>
          <span class="ticks__padding"></span>
        </div>
        <!--
          This is only here as a reference for `scrollIntoView`. Scrolling to
          the `.period` element risks scrolling vertically.
        -->
        <div
          v-if="period.startDate"
          ref="period"
          class="period-ref"
          :style="periodStyle()"
        ></div>
        <div class="sep" :class="{ loading }">
          <div
            v-if="!loading && period.startDate"
            v-tooltip="{
              content: periodObjectives.length
                ? $t('general.selectObjectivesInPeriod')
                : $t('general.noObjectivesInPeriod'),
              delay: { show: 750 },
            }"
            :class="[
              'sep__period',
              { 'sep__period--clickable': periodObjectives.length },
            ]"
            :style="periodStyle()"
            @click="periodObjectivesToWorkbench"
          ></div>
        </div>
      </div>
      <template v-if="!loading">
        <div v-if="period.startDate" class="period" :style="periodStyle()"></div>
        <div v-for="group in groupedObjectives" :key="group.i" class="objective-row">
          <objective-link-card
            v-for="o in group.objectives"
            :key="o.objective.id"
            :objective="o.objective"
            :tabindex="o.tabindex"
            :style="objectiveStyle(o)"
            :checkable="!isGhostObjective(o.objective) && workbenchObjectives.length > 0"
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
            @hook:mounted="onObjectiveMounted(o.objective)"
          />
        </div>
      </template>
      <div v-if="!loading" class="today-tick" :style="todayStyle()"></div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  addMonths,
  differenceInDays,
  eachMonthOfInterval,
  endOfDay,
  getDaysInMonth,
  max,
  min,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { useLocalStorage } from '@vueuse/core';
import { dateLongCompact } from '@/util';
import paneEvents from '@/components/layout/paneEvents';
import ObjectiveLinkCard from '@/components/ObjectiveLinkCard.vue';

export default {
  name: 'GanttChart',

  components: {
    ObjectiveLinkCard,
  },

  props: {
    objectives: {
      type: Array,
      required: true,
    },
    period: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      requred: false,
      default: false,
    },
  },

  setup() {
    const minPPD = 3;
    const defaultPPD = 4;
    const localPPD = useLocalStorage('okr-timeline-ppd', defaultPPD);
    return { defaultPPD, minPPD, localPPD };
  },

  data() {
    return {
      lineWidth: '0.25rem',
      endPadding: 75, // Padding in pixels before/after the first/last months
      now: new Date(),
      dragSense: 8,
      dragSpeed: 0.25,
      mouseX: null,
    };
  },

  computed: {
    ...mapState('okrs', ['activeObjective']),
    ...mapGetters('okrs', ['objectivesWithID', 'workbenchObjectives']),

    PPD: {
      get() {
        const ppd = parseFloat(this.localPPD) || this.defaultPPD;
        return Math.max(this.minPPD, ppd);
      },
      set(ppd) {
        this.localPPD = ppd;
      },
    },

    minDate() {
      return min([this.now, ...this.objectives.map((o) => this.startDate(o).toDate())]);
    },

    maxDate() {
      const date = max([
        this.now,
        ...this.objectives.map((o) => this.endDate(o).toDate()),
      ]);
      return addMonths(date, 1);
    },

    months() {
      return this.loading
        ? /*
           * Bogus dates for the loading screen, enough to fill the width of
           * most screens.
           */
          eachMonthOfInterval({ start: new Date(2020, 1, 1), end: new Date(2023, 1, 1) })
        : eachMonthOfInterval({ start: this.minDate, end: this.maxDate });
    },

    orderedObjectives() {
      return (
        this.objectives
          .slice()
          /*
           * Sort first by shortest objectives first. This is so that they
           * stack as nice as possible in the timeline view, since the first
           * rows are filled with short goals first.
           */
          .sort(
            (a, b) =>
              this.endDate(a) - this.startDate(a) - (this.endDate(b) - this.startDate(b))
          )
          /*
           * Then sort by start date, so that the goals that start first come
           * first.
           */
          .sort((a, b) => this.startDate(a) - this.startDate(b))
      );
    },

    /**
     * Return objectives grouped by rows in which they are to be displayed in
     * the timeline view.
     */
    groupedObjectives() {
      return this.orderedObjectives
        .map((o, i) => ({ tabindex: i + 1, objective: o }))
        .reduce((rows, o) => {
          return this.placeObjective(o, rows);
        }, []);
    },

    /**
     * Return objectives within current `period`.
     */
    periodObjectives() {
      return this.objectives.filter(this.inCurrentPeriod);
    },
  },

  watch: {
    period: {
      async handler() {
        this.$nextTick(() => {
          if (this.$refs.period) {
            this.$refs.period.scrollIntoView({ inline: 'center', behavior: 'smooth' });
          }
        });
      },
    },

    loading: {
      async handler() {
        if (!this.loading && !this.activeObjective) {
          this.$nextTick(() => {
            const ref = this.$refs.period || this.$refs.today;
            ref.scrollIntoView({ inline: 'center', behavior: 'instant' });
          });
        }
      },
    },

    activeObjective: {
      handler: 'scrollToObjective',
    },
  },

  mounted() {
    paneEvents.$on('pane-enter', () => {
      if (this.activeObjective) {
        this.scrollToObjective(this.activeObjective);
      }
    });
  },

  methods: {
    ...mapActions('okrs', [
      'addWorkbenchObjective',
      'removeWorkbenchObjective',
      'clearWorkbenchObjectives',
    ]),

    /*
     * Return the end date of the last goal in `row`.
     */
    rowEndDate(row) {
      return this.endDate(row.objectives[row.objectives.length - 1].objective);
    },

    /*
     * Place the objective `o` in a suitable place in `rows`. Return the
     * resulting row.
     *
     * Goals are placed in the earliest row possible, that is, where there is
     * still room given the goals' start and end dates. If there isn't room for
     * a goal in any of the existing rows, a new row is created for it on the
     * end.
     */
    placeObjective(o, rows) {
      let i = 0;

      const { objective } = o;

      while (i < rows.length) {
        if (this.rowEndDate(rows[i]) <= this.startDate(objective)) {
          break;
        }
        i += 1;
      }

      if (rows[i]) {
        rows[i].objectives.push({
          ...o,
          /*
           * `dayDiff` is the number of days between this objective and the one
           * before it on the same row. This is used to compute the amount of
           * margin later.
           */
          dayDiff: differenceInDays(
            endOfDay(this.startDate(objective).toDate()),
            startOfDay(this.rowEndDate(rows[i]).toDate())
          ),
        });
      } else {
        /*
         * `dayDiff: null` means that the objective is the first one in its
         * row.
         */
        rows[i] = { i, objectives: [{ ...o, dayDiff: null }] };
      }

      return rows;
    },

    startDate(o) {
      return o.startDate || o.period.startDate;
    },

    endDate(o) {
      return o.endDate || o.period.endDate;
    },

    todayStyle() {
      return `transform: translateX(calc(${
        differenceInDays(this.now, startOfMonth(this.minDate)) * this.PPD +
        this.endPadding
      }px + ${this.lineWidth} / 2 - 50%))`;
    },

    periodStyle() {
      const periodStart = this.period.startDate;
      const periodEnd = this.period.endDate;

      const margin =
        differenceInDays(periodStart, startOfMonth(this.minDate)) * this.PPD +
        this.endPadding;

      const width = differenceInDays(periodEnd, periodStart) * this.PPD + this.PPD;

      return [`margin-left: ${margin}px`, `width: ${width}px`].join(';');
    },

    /*
     * Return appropriate styling of the left margin and width for the
     * objective `o`.
     */
    objectiveStyle(o) {
      /*
       * `dayDiff === null` means that the objective is the first one on its
       * row, so compute the day difference from the date all the way to the
       * left of the timeline instead of the previous objective on the row.
       */
      const dayDiff =
        o.dayDiff === null
          ? differenceInDays(
              endOfDay(this.startDate(o.objective).toDate()),
              startOfDay(startOfMonth(this.minDate))
            )
          : o.dayDiff;

      /*
       * The total margin is the number of days between the previous objective
       * or the earliest date on the timeline (when this is the first objective
       * on the row), times the number of pixels per day. When this is the
       * first objective on the row (`dayDiff === null`), we need to add the
       * end padding in addition.
       */
      const marginLeft = dayDiff * this.PPD + (o.dayDiff === null ? this.endPadding : 0);

      return [
        `margin-left: ${marginLeft}px`,
        `flex: 0 0 ${
          differenceInDays(
            endOfDay(this.endDate(o.objective).toDate()),
            startOfDay(this.startDate(o.objective).toDate())
          ) * this.PPD
        }px`,
      ].join(';');
    },

    startDrag(e) {
      this.mouseX = e.clientX;
      window.addEventListener('mousemove', this.drag);
      window.addEventListener('mouseup', this.stopDrag);
    },

    drag(e) {
      if (e.clientX - this.mouseX > this.dragSense) {
        this.mouseX = e.clientX;
        this.PPD += this.dragSpeed;
      } else if (e.clientX - this.mouseX < -this.dragSense) {
        this.mouseX = e.clientX;
        this.PPD = Math.max(this.minPPD, this.PPD - this.dragSpeed);
      }
    },

    stopDrag() {
      window.removeEventListener('mousemove', this.drag);
      window.removeEventListener('mouseup', this.stopDrag);
    },

    async selectObjective(objective) {
      if (
        !this.workbenchObjectives.length &&
        this.activeObjective &&
        objective.id !== this.activeObjective.id
      ) {
        // Close currently active objective if next objective is selected for
        // the workbench
        const activeObjectiveId = this.activeObjective.id;
        this.$router.push({ name: 'ItemHome' });

        // Add both objectives to the workbench using `setTimeout` to give the
        // browser a chance to "catch up" while toggling panes
        setTimeout(async () => {
          await Promise.all(
            [activeObjectiveId, objective.id].map(this.addWorkbenchObjective)
          );
          this.scrollToObjective(objective);
        });
        return;
      }

      // Add selected objective to workbench
      await this.addWorkbenchObjective(objective.id);
      this.scrollToObjective(objective);
    },

    async unselectObjective(objective) {
      // Remove objective from workbench
      await this.removeWorkbenchObjective(objective.id);

      // Set next workbench objective as active if available
      if (this.activeObjective && this.activeObjective.id === objective.id) {
        if (this.workbenchObjectives.length) {
          this.$router.replace({
            name: 'ObjectiveHome',
            params: { objectiveId: this.workbenchObjectives[0].id },
          });
        } else {
          this.$router.push({ name: 'ItemHome' });
        }
      }
    },

    beforeObjectiveNavigate(objective) {
      return async (event) => {
        const modifierKey = event.metaKey || event.altKey;

        if (!modifierKey && !this.workbenchObjectives.length) {
          return;
        }

        // Prevent default link navigation when selecting/unselecting
        // objectives for the workbench
        event.preventDefault();

        if (!this.workbenchObjectives.find((o) => o.id === objective.id)) {
          await this.selectObjective(objective);

          // Replace any active objective with the one newly selected
          if (this.activeObjective && objective.id !== this.activeObjective.id) {
            await this.$router.replace({
              name: 'ObjectiveHome',
              params: { objectiveId: objective.id },
            });
          }
        } else {
          await this.unselectObjective(objective);
        }
      };
    },

    async toggleObjective(checked, objective) {
      if (checked) {
        await this.selectObjective(objective);
      } else {
        await this.unselectObjective(objective);
      }
    },

    onObjectiveMounted(objective) {
      // Scroll to active objective when first mounted in the timeline.
      if (objective.id === this.activeObjective?.id) {
        this.scrollToObjective(objective);
      }
    },

    scrollToObjective(objective) {
      if (!objective) {
        return;
      }

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
    },

    async periodObjectivesToWorkbench() {
      // Reset and add all objectives within current period to the workbench
      await this.clearWorkbenchObjectives();

      if (!this.periodObjectives.length) {
        return;
      }

      this.periodObjectives.map((o) => o.id).forEach(this.addWorkbenchObjective);

      // Replace any currently active objective with first from workbench if it
      // is not part of the selection.
      if (
        this.activeObjective &&
        !this.periodObjectives.find((o) => o.id === this.activeObjective.id)
      ) {
        await this.$router.replace({
          name: 'ObjectiveHome',
          params: { objectiveId: this.periodObjectives[0].id },
        });
      }

      this.$nextTick(() => {
        if (this.$refs.period) {
          this.$refs.period.scrollIntoView({ inline: 'center', behavior: 'smooth' });
        }
      });
    },

    /**
     * Return true if `objective` is within the current period (either partly
     * or fully).
     */
    inCurrentPeriod(objective) {
      if (!this.period || this.period.keys === 'all') {
        return true;
      }

      const { startDate, endDate } = this.period;

      if (objective.startDate && objective.endDate) {
        return (
          objective.endDate.toDate() >= startDate &&
          objective.startDate.toDate() <= endDate
        );
      }

      /*
       * Fall back to checking the old-style `period` reference to retain
       * backwards compatibility.
       */
      if (objective.period?.endDate && objective.period?.startDate) {
        return (
          objective.period.endDate.toDate() >= startDate &&
          objective.period.startDate.toDate() <= endDate
        );
      }

      return false;
    },

    isActive(objective) {
      return this.activeObjective && this.activeObjective.id === objective.id;
    },

    isChecked(objective) {
      return this.workbenchObjectives.map((o) => o.id).includes(objective.id);
    },

    isGhostObjective(objective) {
      return !this.objectivesWithID.find((o) => o.id === objective.id);
    },

    addMonths,
    dateLongCompact,
    differenceInDays,
    getDaysInMonth,
    startOfMonth,
  },
};
</script>

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

.objective-link-card {
  --card-bg-color: var(--color-white);

  position: relative;
  z-index: 1;
  height: 10rem;
  overflow: hidden;

  ::v-deep &__inner {
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

  ::v-deep &__name {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
  }

  &--active {
    --card-bg-color: var(--color-blue-5);
  }
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
