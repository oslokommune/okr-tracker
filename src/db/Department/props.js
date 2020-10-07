export default {
  name: {
    type: 'string',
    required: true,
  },
  organization: {
    type: 'object',
    required: true,
  },
  missionStatement: {
    type: 'string',
    required: false,
  },
  photoURL: {
    type: 'string',
    required: false,
  },
};
