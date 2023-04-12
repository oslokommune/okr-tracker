<template>
  <div class="gantt">
    <div class="month-wrapper" @mousedown="startDrag">
      <div class="today" :style="todayStyle()">{{ $t('general.today') }}</div>
      <div class="months">
        <div
          v-for="m in months"
          :key="m.valueOf()"
          class="month"
          :style="`flex: 0 0 ${getDaysInMonth(m) * PPD}px`"
        >
          <span>{{ formatMonth(m) }}</span>
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
    </div>
    <objective-row
      v-for="o in orderedObjectives"
      :key="o.id"
      :objective="o"
      :show-progress="true"
      :style="objectiveStyle(o)"
    >
    </objective-row>
    <div class="today-tick" :style="todayStyle()"></div>
  </div>
</template>

<script>
import {
  addMonths,
  differenceInDays,
  eachMonthOfInterval,
  getDaysInMonth,
  max,
  min,
  startOfMonth,
} from 'date-fns';
import { capitalize, dateMonthYear } from '@/util';

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
    item: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      PPD: 6, // Pixels per day
      minPPD: 4.5,
      lineWidth: '0.25rem',
      endPadding: 75, // Padding in pixels before/after the first/last months
      now: new Date(),
      dragSense: 8,
      dragSpeed: 0.25,
      mouseX: null,
    };
  },

  computed: {
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
      return eachMonthOfInterval({ start: this.minDate, end: this.maxDate });
    },

    orderedObjectives() {
      return this.objectives
        .slice()
        .sort((a, b) => this.startDate(a) - this.startDate(b));
    },
  },

  methods: {
    startDate(o) {
      return o.startDate || o.period.startDate;
    },

    endDate(o) {
      return o.endDate || o.period.endDate;
    },

    formatMonth(d) {
      return capitalize(dateMonthYear(d));
    },

    todayStyle() {
      return `transform: translateX(calc(${
        differenceInDays(this.now, startOfMonth(this.minDate)) * this.PPD +
        this.endPadding
      }px + ${this.lineWidth} / 2 - 50%))`;
    },

    objectiveStyle(o) {
      return [
        `margin-left: ${
          differenceInDays(this.startDate(o).toDate(), startOfMonth(this.minDate)) *
            this.PPD +
          this.endPadding
        }px`,
        `width: ${
          differenceInDays(this.endDate(o).toDate(), this.startDate(o).toDate()) *
          this.PPD
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

    addMonths,
    differenceInDays,
    getDaysInMonth,
    startOfMonth,
  },
};
</script>

<style lang="scss" scoped>
.gantt {
  --line-width: 0.2rem;
  --end-padding: 75px;

  position: relative;
  min-height: 85vh;
  margin-top: 0.5rem;
  overflow-x: auto;
}

.month-wrapper {
  margin-bottom: 1rem;
  padding-top: 1.5rem;
  cursor: col-resize;
}

.months {
  display: flex;
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
    transform: translateX(calc(var(--line-width) / 2 - 50%));
  }
}

.ticks {
  display: flex;

  .ticks__tick {
    position: relative;
    z-index: 1;
    height: 0.75rem;
    border-bottom: var(--line-width) solid var(--color-primary);
    border-left: var(--line-width) solid var(--color-primary);

    &:last-of-type {
      flex-basis: var(--line-width) !important;
      border-bottom: 0;
    }
  }

  .ticks__padding {
    flex: 0 0 var(--end-padding);
    border-bottom: var(--line-width) solid var(--color-primary);

    &:last-of-type {
      flex-basis: var(--end-padding);
    }
  }
}

.today {
  display: inline-block;
  height: 1.5rem;
  color: var(--color-yellow);
  font-weight: 500;
}

.today-tick {
  position: absolute;
  top: 3rem;
  height: calc(100% - 3rem);
  border-left: var(--line-width) dashed var(--color-yellow);
}

.objective {
  position: relative;
  z-index: 1;
  margin: 1rem 0;
}
</style>
