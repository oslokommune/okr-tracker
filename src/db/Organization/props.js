export default {
  name: {
    type: 'string',
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
  secret: {
    type: 'string',
    required: false,
  },
  team: {
    type: 'array',
    required: false,
  }
};
