import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
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

export function useGanttChart(period, loading, objectives) {
  const minPPD = 3;
  const defaultPPD = 4;
  const localPPD = useLocalStorage('okr-timeline-ppd', defaultPPD);

  const now = new Date();

  const mouseX = ref(null);
  const dragSense = ref(8);
  const dragSpeed = ref(0.25);

  const endPadding = ref(75); // Padding in pixels before/after the first/last months
  const lineWidth = ref('0.25rem');

  // Timeline objectives
  const timelineObjectives = computed(() =>
    objectives.value
      .slice()
      /*
       * Ensure that all objectives are fully resolved with a valid period.
       */
      .filter((o) => o && typeof o !== 'string' && startDate(o) && endDate(o))
      /*
       * Sort first by shortest objectives first. This is so that they
       * stack as nice as possible in the timeline view, since the first
       * rows are filled with short goals first.
       */
      .sort((a, b) => endDate(a) - startDate(a) - (endDate(b) - startDate(b)))
      /*
       * Then sort by start date, so that the goals that start first come
       * first.
       */
      .sort((a, b) => startDate(a) - startDate(b))
      /*
       * Lastly, sort by created date to maintain a consistent order.
       */
      .sort((a, b) => a.created.toDate().getTime() - b.created.toDate().getTime())
  );

  /**
   * Return objectives grouped by rows in which they are to be displayed in
   * the timeline view.
   */
  const objectiveGroups = computed(() => {
    return timelineObjectives.value
      .map((o, i) => ({ tabindex: i + 1, objective: o }))
      .reduce((rows, o) => {
        return placeObjective(o, rows);
      }, []);
  });

  function inCurrentPeriod(objective) {
    if (!period.value || period.value.key === 'all') {
      return true;
    }

    const { startDate: periodStart, endDate: periodEnd } = period.value;

    if (objective.startDate && objective.endDate) {
      return (
        objective.endDate.toDate() >= periodStart &&
        objective.startDate.toDate() <= periodEnd
      );
    }

    /*
     * Fall back to checking the old-style `period` reference to retain
     * backwards compatibility.
     */
    if (objective.period?.endDate && objective.period?.startDate) {
      return (
        objective.period.endDate.toDate() >= periodStart &&
        objective.period.startDate.toDate() <= periodEnd
      );
    }

    return false;
  }

  /**
   * Return objectives within current period, either partly or fully.
   */
  const objectivesInPeriod = computed(() =>
    timelineObjectives.value.filter(inCurrentPeriod)
  );

  /*
   * Place the objective `o` in a suitable place in `rows`. Return the
   * resulting row.
   *
   * Goals are placed in the earliest row possible, that is, where there is
   * still room given the goals' start and end dates. If there isn't room for
   * a goal in any of the existing rows, a new row is created for it on the
   * end.
   */
  function placeObjective(o, rows) {
    let i = 0;

    const { objective } = o;

    while (i < rows.length) {
      if (rowEndDate(rows[i]) <= startDate(objective)) {
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
          endOfDay(startDate(objective).toDate()),
          startOfDay(rowEndDate(rows[i]).toDate())
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
  }

  // Drawing
  const PPD = computed({
    get() {
      const ppd = parseFloat(localPPD.value) || defaultPPD;
      return Math.max(minPPD, ppd);
    },
    set(ppd) {
      localPPD.value = ppd;
    },
  });

  const todayStyle = computed(
    () =>
      `transform: translateX(calc(${
        differenceInDays(now, startOfMonth(minDate.value)) * PPD.value + endPadding.value
      }px + ${lineWidth.value} / 2 - 50%))`
  );

  function monthStyle(month) {
    return `width: ${getDaysInMonth(month) * PPD.value}px`;
  }

  function tickStyle(month) {
    return `flex: 0 0 ${getDaysInMonth(month) * PPD.value}px`;
  }

  const periodStyle = computed(() => {
    const { startDate: periodStart, endDate: periodEnd } = period.value;

    const margin =
      differenceInDays(periodStart, startOfMonth(minDate.value)) * PPD.value +
      endPadding.value;

    const width = differenceInDays(periodEnd, periodStart) * PPD.value + PPD.value;

    return [`margin-left: ${margin}px`, `width: ${width}px`].join(';');
  });

  /*
   * Return appropriate styling of the left margin and width for the
   * objective `o`.
   */
  function objectiveStyle(o) {
    /*
     * `dayDiff === null` means that the objective is the first one on its
     * row, so compute the day difference from the date all the way to the
     * left of the timeline instead of the previous objective on the row.
     */
    const dayDiff =
      o.dayDiff === null
        ? differenceInDays(
            endOfDay(startDate(o.objective).toDate()),
            startOfDay(startOfMonth(minDate.value))
          )
        : o.dayDiff;

    /*
     * The total margin is the number of days between the previous objective
     * or the earliest date on the timeline (when this is the first objective
     * on the row), times the number of pixels per day. When this is the
     * first objective on the row (`dayDiff === null`), we need to add the
     * end padding in addition.
     */
    const marginLeft = dayDiff * PPD.value + (o.dayDiff === null ? endPadding.value : 0);

    return [
      `margin-left: ${marginLeft}px`,
      `flex: 0 0 ${
        differenceInDays(
          endOfDay(endDate(o.objective).toDate()),
          startOfDay(startDate(o.objective).toDate())
        ) * PPD.value
      }px`,
    ].join(';');
  }

  const minDate = computed(() => {
    return min([now, ...timelineObjectives.value.map((o) => startDate(o).toDate())]);
  });

  const maxDate = computed(() => {
    const date = max([now, ...timelineObjectives.value.map((o) => endDate(o).toDate())]);
    return addMonths(date, 1);
  });

  const months = computed(() => {
    // Bogus dates for the loading screen, enough to fill the width of most screens
    return loading.value
      ? eachMonthOfInterval({ start: new Date(2020, 1, 1), end: new Date(2023, 1, 1) })
      : eachMonthOfInterval({ start: minDate.value, end: maxDate.value });
  });

  // Utils

  function rowEndDate(row) {
    // Return the end date of the last goal in `row`
    return endDate(row.objectives[row.objectives.length - 1].objective);
  }

  function startDate(o) {
    return o.startDate || o.period.startDate;
  }

  function endDate(o) {
    return o.endDate || o.period.endDate;
  }

  // Timeline dragging

  function startDrag(e) {
    mouseX.value = e.clientX;
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDrag);
  }

  function stopDrag() {
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('mouseup', stopDrag);
  }

  function drag(e) {
    if (e.clientX - mouseX.value > dragSense.value) {
      mouseX.value = e.clientX;
      PPD.value += dragSpeed.value;
    } else if (e.clientX - mouseX.value < -dragSense.value) {
      mouseX.value = e.clientX;
      PPD.value = Math.max(minPPD, PPD.value - dragSpeed.value);
    }
  }

  return {
    objectiveGroups,
    objectivesInPeriod,
    inCurrentPeriod,

    todayStyle,
    monthStyle,
    tickStyle,
    periodStyle,
    objectiveStyle,
    months,

    startDrag,
    stopDrag,
  };
}

export default useGanttChart;
