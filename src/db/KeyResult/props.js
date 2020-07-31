export default {
  name: {
    type: 'string',
    required: true,
  },
  objective: {
    type: 'object',
    required: true,
  },
  parent: {
    type: 'object',
    required: true,
  },
  startValue: {
    type: 'number',
    required: true,
  },
  targetValue: {
    type: 'number',
    required: true,
  },
  unit: {
    type: 'string',
    required: true,
  },
};
