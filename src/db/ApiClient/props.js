export default {
  parent: {
    type: 'reference',
    required: true,
  },
  clientId: {
    type: 'string',
    required: true,
  },
  name: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
  },
};
