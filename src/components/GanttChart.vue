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
        <span class="tick-padding"></span>
        <div
          v-for="m in months"
          :key="m.valueOf()"
          class="tick"
          :style="`flex: 0 0 ${getDaysInMonth(m) * PPD}px`"
        ></div>
        <span class="tick-padding"></span>
      </div>
    </div>
    <div
      v-for="o in orderedObjectives"
      :key="o.id"
      class="objective"
      :style="objectiveStyle(o)"
    >
      <div class="tag">{{ item.name }}</div>
      <div class="title">{{ o.name }}</div>
      <progress-bar :progression="o.progression * 100" />
    </div>
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
    ProgressBar: () => import('@/components/ProgressBar.vue'),
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
      return min([this.now, ...this.objectives.map((o) => o.period.startDate.toDate())]);
    },

    maxDate() {
      const date = max([
        this.now,
        ...this.objectives.map((o) => o.period.endDate.toDate()),
      ]);
      return addMonths(date, 1);
    },

    months() {
      return eachMonthOfInterval({ start: this.minDate, end: this.maxDate });
    },

    orderedObjectives() {
      return this.objectives
        .slice()
        .sort((a, b) => a.period.startDate - b.period.startDate);
    },
  },

  methods: {
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
          differenceInDays(o.period.startDate.toDate(), startOfMonth(this.minDate)) *
            this.PPD +
          this.endPadding
        }px`,
        `width: ${
          differenceInDays(o.period.endDate.toDate(), o.period.startDate.toDate()) *
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

  .tick {
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

  .tick-padding {
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
  margin: 1.25rem 0;
  padding: 1rem;
  line-height: 1.35;
  background: var(--color-white);
  box-shadow: 0 0 10px rgba(black, 0.1);
  cursor: pointer;

  .tag {
    display: inline-block;
    padding: 0.5rem;
    background: var(--color-blue-5);
  }

  .title {
    max-width: 35rem;
    margin: 1.25rem 0;
    font-weight: 500;
  }

  label {
    display: block;
    cursor: pointer;
  }
}
</style>
