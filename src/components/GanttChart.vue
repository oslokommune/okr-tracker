<template>
  <div class="gantt">
    <div class="gantt__inner">
      <div class="month-wrapper" @mousedown="startDrag">
        <div ref="today" class="today" :style="todayStyle()">
          {{ $t('general.today') }}
        </div>
        <div class="months">
          <div
            v-for="m in months"
            :key="m.valueOf()"
            class="month"
            :style="`width: ${getDaysInMonth(m) * PPD}px`"
          >
            <span>{{ dateLongCompact(m) }}</span>
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
        <div class="sep">
          <div
            v-if="period.startDate"
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
            @click="selectPeriodObjectives"
          ></div>
        </div>
      </div>
      <div v-if="period.startDate" class="period" :style="periodStyle()"></div>
      <div v-for="group in groupedObjectives" :key="group.i" class="objective-row">
        <objective-row
          v-for="o in group.objectives"
          :key="o.objective.id"
          :objective="o.objective"
          :compact="true"
          :style="objectiveStyle(o)"
          :is-link="false"
          :class="[
            {
              'objective--selected': selectedObjectives
                .map((o) => o.id)
                .includes(o.objective.id),
            },
          ]"
          @click="selectObjective($event, o)"
        />
      </div>
      <div class="today-tick" :style="todayStyle()"></div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
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
import { dateLongCompact } from '@/util';

export default {
  name: 'GanttChart',

  components: {
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
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
  },

  data() {
    return {
      PPD: 6, // Pixels per day
      minPPD: 4,
      lineWidth: '0.25rem',
      endPadding: 75, // Padding in pixels before/after the first/last months
      now: new Date(),
      dragSense: 8,
      dragSpeed: 0.25,
      mouseX: null,
    };
  },

  computed: {
    ...mapGetters(['selectedObjectives']),

    minDate() {
      return min([
        this.now,
        ...this.temporalObjectives.map((o) => this.startDate(o).toDate()),
      ]);
    },

    maxDate() {
      const date = max([
        this.now,
        ...this.temporalObjectives.map((o) => this.endDate(o).toDate()),
      ]);
      return addMonths(date, 1);
    },

    months() {
      return eachMonthOfInterval({ start: this.minDate, end: this.maxDate });
    },

    /**
     * Return only objectives with a known (resolved) period, either dynamic or
     * old-style.
     *
     * TODO: This filter is a TEMPORARY FIX, should ideally not be necessary,
     * and should hopefully be fixed with a review and refactor of store data
     * fetching/use.
     */
    temporalObjectives() {
      return this.objectives.filter(
        (o) => (o.startDate && o.endDate) || (o.period && typeof o.period !== 'string')
      );
    },

    orderedObjectives() {
      return (
        this.temporalObjectives
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
      return this.orderedObjectives.reduce((rows, o) => {
        return this.placeObjective(o, rows);
      }, []);
    },

    /**
     * Return objectives within current `period`.
     */
    periodObjectives() {
      if (this.period && this.period.key !== 'all') {
        return this.objectives.filter((objective) => {
          const { startDate, endDate } = this.period;

          if (objective.startDate && objective.endDate) {
            return (
              objective.endDate.toDate() >= startDate &&
              objective.startDate.toDate() <= endDate
            );
          }

          /*
           * Fall back to checking the old-style `period` reference to retain backwards
           * compatibility.
           */
          if (objective.period.endDate && objective.period.startDate) {
            return (
              objective.period.endDate.toDate() >= startDate &&
              objective.period.startDate.toDate() <= endDate
            );
          }

          return false;
        });
      }
      return [];
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
  },

  mounted() {
    const ref = this.$refs.period || this.$refs.today;
    ref.scrollIntoView({ inline: 'center', behavior: 'instant' });
  },

  methods: {
    ...mapActions(['setSelectedObjective']),

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

      while (i < rows.length) {
        if (this.rowEndDate(rows[i]) <= this.startDate(o)) {
          break;
        }
        i += 1;
      }

      if (rows[i]) {
        rows[i].objectives.push({
          objective: o,
          /*
           * `dayDiff` is the number of days between this objective and the one
           * before it on the same row. This is used to compute the amount of
           * margin later.
           */
          dayDiff: differenceInDays(
            endOfDay(this.startDate(o).toDate()),
            startOfDay(this.rowEndDate(rows[i]).toDate())
          ),
        });
      } else {
        /*
         * `dayDiff: null` means that the objective is the first one in its
         * row.
         */
        rows[i] = { i, objectives: [{ objective: o, dayDiff: null }] };
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

    selectObjective(e, o) {
      this.setSelectedObjective(o.objective);
      this.$nextTick(() => {
        e.currentTarget.scrollIntoView({
          block: 'center',
          inline: 'start',
          behavior: 'smooth',
        });
      });
    },

    selectPeriodObjectives() {
      this.periodObjectives
        .filter((po) => !this.selectedObjectives.map((o) => o.id).includes(po.id))
        .forEach(this.setSelectedObjective);

      this.$nextTick(() => {
        if (this.$refs.period) {
          this.$refs.period.scrollIntoView({ inline: 'center', behavior: 'smooth' });
        }
      });
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
  padding-top: 1.5rem;
  background-color: var(--color-white);
  cursor: col-resize;
}

.months {
  display: inline-flex;
  margin-bottom: 0.5rem;
  margin-left: var(--end-padding);
  font-weight: 500;
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
  background: var(--color-grayscale-10);
  border-top: var(--sep-border-width) solid var(--color-primary);

  .sep__period {
    height: calc(var(--sep-height) - var(--sep-border-width));
    background: var(--color-primary);

    &--clickable {
      cursor: pointer;
    }
  }
}

.today {
  position: absolute;
  top: 0;
  z-index: 2;
  display: inline-block;
  height: 1.5rem;
  color: var(--color-active);
  font-weight: 500;

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
  background: repeating-linear-gradient(
    -45deg,
    var(--color-blue-dark-10),
    var(--color-blue-dark-10) 4px,
    var(--color-gray-light) 4px,
    var(--color-gray-light) 8px
  );
}

.objective-row {
  display: flex;
  align-items: flex-start;
  margin: 1rem 0;
}

.objective {
  position: relative;
  z-index: 1;
  background: var(--color-white);
  border: 2px solid var(--color-border);

  &--selected {
    outline: 2px solid var(--color-hover);
  }
}
</style>
