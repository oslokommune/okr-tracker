import { scaleTime, scaleLinear } from 'd3-scale';
import { mean } from 'd3-array';

export function getTimeProgression(period) {
  if (!period) {
    return -1;
  }

  const { startDate, endDate } = period;

  const timeScale = scaleTime()
    .domain([startDate.toDate(), endDate.toDate()])
    .clamp(true);

  return timeScale(new Date());
}

export function getProgression(objectives) {
  if (!objectives) {
    return 0;
  }

  return (
    mean(
      objectives
        .map((objective) => objective.children)
        .flat()
        .map((keyResult) => {
          const scale = scaleLinear()
            .domain([+keyResult.startValue, +keyResult.targetValue])
            .clamp(true);
          return scale(+keyResult.currentValue);
        })
    ) || 0
  );
}
