import { scaleTime, scaleLinear, mean } from 'd3';

export function getTimeProgression(period) {
  if (!period) return -1;

  const { startDate, endDate } = period;

  const timeScale = scaleTime().domain([startDate.toDate(), endDate.toDate()]).clamp(true);

  return timeScale(new Date());
}

export function getProgression(objectives) {
  if (!objectives) return 0;

  return (
    mean(
      objectives
        .map((objective) => objective.children)
        .flat()
        .map((keyres) => {
          const scale = scaleLinear()
            .domain([+keyres.startValue, +keyres.targetValue])
            .clamp(true);
          return scale(+keyres.currentValue);
        })
    ) || 0
  );
}
