export default {
  name: {
    type: 'string',
    required: true,
  },
  parent: {
    type: 'reference',
    required: true,
  },
  period: {
    type: 'reference',
    required: true,
  },
  weight: {
    type: 'number',
    required: true,
  },
};
