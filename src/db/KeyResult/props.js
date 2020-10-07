export default {
  name: {
    type: 'string',
    required: true,
  },
  objective: {
    type: 'reference',
    required: true,
  },
  parent: {
    type: 'reference',
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
  notes: {
    type: 'string',
    required: false,
  },
  weight: {
    type: 'number',
    required: true,
  },
};
