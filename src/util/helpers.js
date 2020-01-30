import { scaleTime, scaleLinear, mean } from 'd3';
import { endOfQuarter } from 'date-fns';

export function getDateSpanFromQuarter(quarter) {
  const year = quarter.split(' ')[1];
  const q = +quarter.split('Q')[1].split(' ')[0];

  const startDate = new Date(year, (q - 1) * 3, 1);
  const endDate = endOfQuarter(startDate);

  return { startDate, endDate };
}

export function getTimeProgression(quarter) {
  const { startDate, endDate } = getDateSpanFromQuarter(quarter);

  const timeScale = scaleTime()
    .domain([startDate, endDate])
    .clamp(true);

  return timeScale(new Date());
}

export function getProgression(objectives) {
  if (!objectives) return 0;

  return (
    mean(
      objectives
        .map(objective => objective.children)
        .flat()
        .map(keyres => {
          const scale = scaleLinear()
            .domain([+keyres.startValue, +keyres.targetValue])
            .clamp(true);
          return scale(+keyres.current_value);
        })
    ) || 0
  );
}
