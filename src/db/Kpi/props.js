export default {
  type: {
    type: 'string',
    required: false,
  },
  name: {
    type: 'string',
    required: true,
  },
  format: {
    type: 'string',
    required: false,
  },
  updateFrequency: {
    type: 'string',
    required: true,
  },
  parent: {
    type: 'reference',
    required: true,
  },
};
