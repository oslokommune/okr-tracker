import { scaleLinear } from 'd3-scale';

import { numberLocale } from './format';

export const formatValue = (value) => numberLocale.format(',.2~f')(value);

const getPercentageCompleted = (current, target) => {
  if (target === 0) {
    return 0;
  }
  // Round with max 2 decimal (as with string formatted percentages)
  const percent = (current / target) * 100;
  const rounded = parseFloat(percent.toFixed(2));
  return rounded;
};

export const getKeyResultProgressDetails = (keyResult) => {
  const { startValue, targetValue, currentValue: keyResultCurrentValue } = keyResult;
  const currentValue =
    keyResultCurrentValue === undefined ? startValue : keyResultCurrentValue;

  let totalNumberOfTasks;
  let totalCompletedTasks;
  let totalRemainingTasks;
  let percentageCompleted;

  if (startValue < targetValue) {
    const totalNumberOfTasksForPeriod = targetValue - startValue;
    const totalCompletedTasksForPeriod = currentValue - startValue;

    totalNumberOfTasks = targetValue;
    totalCompletedTasks = currentValue;
    totalRemainingTasks = totalNumberOfTasks - totalCompletedTasks;
    percentageCompleted = getPercentageCompleted(
      totalCompletedTasksForPeriod,
      totalNumberOfTasksForPeriod
    );
  } else {
    totalNumberOfTasks = startValue - targetValue;
    totalCompletedTasks = startValue - currentValue;
    totalRemainingTasks = totalNumberOfTasks - totalCompletedTasks;
    percentageCompleted = getPercentageCompleted(totalCompletedTasks, totalNumberOfTasks);
  }

  return {
    percentageCompleted,
    totalCompletedTasks,
    totalRemainingTasks: totalRemainingTasks >= 0 ? totalRemainingTasks : 0,
    totalNumberOfTasks,
    formattedTotalCompletedTasks: formatValue(totalCompletedTasks),
    formattedTotalRemainingTasks: formatValue(totalRemainingTasks),
    formattedTotalNumberOfTasks: formatValue(totalNumberOfTasks),
    isCompleted: percentageCompleted >= 100,
  };
};

export const getKeyResultProgression = (startValue, targetValue, currentValue) => {
  const scale = scaleLinear().domain([startValue, targetValue]);

  return scale(currentValue) || 0;
};
