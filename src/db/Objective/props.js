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
    required: false,
  },
  weight: {
    type: 'number',
    required: false,
  },
};
