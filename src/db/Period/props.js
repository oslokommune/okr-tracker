export default {
  name: {
    type: 'string',
    required: true,
  },
  parent: {
    type: 'reference',
    required: true,
  },
  startDate: {
    type: 'date',
    required: true,
  },
  endDate: {
    type: 'date',
    required: true,
  },
};
