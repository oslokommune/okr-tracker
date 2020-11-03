export default {
  name: {
    type: 'string',
    required: true,
  },
  organization: {
    type: 'reference',
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
