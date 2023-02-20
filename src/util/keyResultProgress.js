import { scaleLinear } from 'd3-scale';

import { numberLocale } from './format';

const formatValue = (value) => numberLocale.format(',')(value);

const getPercentageCompleted = (current, target) => (target === 0 ? 0 : Math.round((current / target) * 100));

export const getKeyResultProgressDetails = (keyResult) => {
  const { startValue, targetValue, currentValue: keyResultCurrentValue } = keyResult;
  const currentValue = keyResultCurrentValue === undefined ? startValue : keyResultCurrentValue;

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
    percentageCompleted = getPercentageCompleted(totalCompletedTasksForPeriod, totalNumberOfTasksForPeriod);
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
