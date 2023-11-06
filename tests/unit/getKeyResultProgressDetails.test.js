import {
  getKeyResultProgression,
  getKeyResultProgressDetails,
} from '../../src/util/keyResultProgress';

const generateKeyResult = (startValue, targetValue, currentValue) => ({
  startValue,
  targetValue,
  currentValue,
  progression: getKeyResultProgression(startValue, targetValue, currentValue),
});

describe('Get key result progress', () => {
  describe('for results with target value greater than initial value', () => {
    test('{ startValue: 0, targetValue: 100, currentValue: 0 }', () => {
      const keyResult = generateKeyResult(0, 100, 0);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(100);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 0, targetValue: 100, currentValue: 20 }', () => {
      const keyResult = generateKeyResult(0, 100, 20);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(20);
      expect(totalRemainingTasks).toEqual(80);
      expect(totalCompletedTasks).toEqual(20);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 0, targetValue: 100, currentValue: 100 }', () => {
      const keyResult = generateKeyResult(0, 100, 100);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(100);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(100);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 0, targetValue: 100, currentValue: 150 }', () => {
      const keyResult = generateKeyResult(0, 100, 150);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(150);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(150);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 20, targetValue: 100, currentValue: 20 }', () => {
      const keyResult = generateKeyResult(20, 100, 20);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(80);
      expect(totalCompletedTasks).toEqual(20);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 20, targetValue: 100, currentValue: 100 }', () => {
      const keyResult = generateKeyResult(20, 100, 100);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(100);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(100);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 20, targetValue: 100, currentValue: 0 }', () => {
      const keyResult = generateKeyResult(20, 100, 0);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(-25);
      expect(totalRemainingTasks).toEqual(100);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 20, targetValue: 100, currentValue: -20 }', () => {
      const keyResult = generateKeyResult(20, 100, -20);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(-50);
      expect(totalRemainingTasks).toEqual(120);
      expect(totalCompletedTasks).toEqual(-20);
      expect(totalNumberOfTasks).toEqual(100);
    });
  });

  describe('for results with target value greater than initial value', () => {
    test('{ startValue: 100, targetValue: 0, currentValue: 100 }', () => {
      const keyResult = generateKeyResult(100, 0, 100);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(100);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 100, targetValue: 0, currentValue: 80 }', () => {
      const keyResult = generateKeyResult(100, 0, 80);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(20);
      expect(totalRemainingTasks).toEqual(80);
      expect(totalCompletedTasks).toEqual(20);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 100, targetValue: 0, currentValue: 0 }', () => {
      const keyResult = generateKeyResult(100, 0, 0);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(100);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(100);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 100, targetValue: 20, currentValue: 100 }', () => {
      const keyResult = generateKeyResult(100, 20, 100);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(80);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(80);
    });

    test('{ startValue: 100, targetValue: 20, currentValue: 80 }', () => {
      const keyResult = generateKeyResult(100, 20, 80);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(25);
      expect(totalRemainingTasks).toEqual(60);
      expect(totalCompletedTasks).toEqual(20);
      expect(totalNumberOfTasks).toEqual(80);
    });

    test('{ startValue: 100, targetValue: 20, currentValue: 20 }', () => {
      const keyResult = generateKeyResult(100, 20, 20);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(100);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(80);
      expect(totalNumberOfTasks).toEqual(80);
    });

    test('{ startValue: 100, targetValue: 20, currentValue: 0 }', () => {
      const keyResult = generateKeyResult(100, 20, 0);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(125);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(100);
      expect(totalNumberOfTasks).toEqual(80);
    });
  });

  describe('for results with start and target value equal to 0', () => {
    test('{ startValue: 0, targetValue: 0, currentValue: 0 }', () => {
      const keyResult = generateKeyResult(0, 0, 0);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);
      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(0);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(0);
    });
  });

  describe('for results without current value', () => {
    test('{ startValue: 0, targetValue: 100 }', () => {
      const keyResult = generateKeyResult(0, 100);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(100);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(100);
    });

    test('{ startValue: 100, targetValue: 0 }', () => {
      const keyResult = generateKeyResult(100, 0);
      const {
        percentageCompleted,
        totalRemainingTasks,
        totalCompletedTasks,
        totalNumberOfTasks,
      } = getKeyResultProgressDetails(keyResult);

      expect(percentageCompleted).toEqual(0);
      expect(totalRemainingTasks).toEqual(100);
      expect(totalCompletedTasks).toEqual(0);
      expect(totalNumberOfTasks).toEqual(100);
    });
  });
});
