export default {
  name: {
    type: 'string',
    required: true,
  },
  fromDate: {
    type: 'date',
    required: true,
  },
  toDate: {
    type: 'date',
    required: true,
  },
  value: {
    type: 'number',
    required: true,
  },
  archived: {
    type: 'boolean',
    required: true,
  },
};
